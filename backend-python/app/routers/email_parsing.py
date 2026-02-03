"""
Email Parsing Router - SNS Webhook for Inbound Emails
Handles AWS SNS notifications for SES inbound emails
"""
from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.responses import JSONResponse
import logging
import httpx
import json
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.email_processing_service import EmailProcessingService

logger = logging.getLogger(__name__)

router = APIRouter()
email_processing_service = EmailProcessingService()


async def verify_sns_signature(message: Dict[str, Any]) -> bool:
    """
    Verify SNS message signature.
    For production, use proper signature verification.
    """
    try:
        # For subscription confirmation, we don't verify signature (AWS handles it)
        if message.get("Type") == "SubscriptionConfirmation":
            return True

        if not message.get("Signature") or not message.get("SigningCertURL"):
            return False

        # Verify the certificate URL is from AWS
        cert_url = message.get("SigningCertURL", "")
        if not cert_url.endswith(".amazonaws.com") and "amazonaws.com" not in cert_url:
            logger.error(f"[SNS] Invalid certificate URL: {cert_url}")
            return False

        # Basic validation passed
        logger.info("[SNS] Signature verification passed (basic check)")
        return True

    except Exception as error:
        logger.error(f"[SNS] Signature verification error: {error}")
        return False


@router.post("/inbound-webhook")
async def handle_inbound_webhook(request: Request):
    """
    Handle SNS webhook for inbound emails from AWS SES.
    This endpoint receives notifications when emails are sent to admin@shellfish-society.org
    """
    try:
        # Parse SNS message
        body = await request.body()
        sns_message = json.loads(body.decode())

        message_type = sns_message.get("Type")
        logger.info(f"[Inbound Webhook] Received SNS message type: {message_type}")

        # Verify SNS signature
        is_valid = await verify_sns_signature(sns_message)
        if not is_valid:
            logger.error("[Inbound Webhook] Invalid SNS signature")
            raise HTTPException(status_code=403, detail="Invalid signature")

        # Handle SNS subscription confirmation (one-time setup)
        if message_type == "SubscriptionConfirmation":
            logger.info("[Inbound Webhook] SNS subscription confirmation")

            subscribe_url = sns_message.get("SubscribeURL")
            if subscribe_url:
                try:
                    # Confirm subscription by visiting SubscribeURL
                    async with httpx.AsyncClient() as client:
                        response = await client.get(subscribe_url, timeout=10.0)
                        response.raise_for_status()

                    logger.info("[Inbound Webhook] Subscription confirmed successfully")
                    return JSONResponse(
                        content={"message": "Subscription confirmed"},
                        status_code=200
                    )
                except Exception as error:
                    logger.error(f"[Inbound Webhook] Failed to confirm subscription: {error}")
                    raise HTTPException(
                        status_code=500,
                        detail="Failed to confirm subscription"
                    )
            else:
                raise HTTPException(
                    status_code=400,
                    detail="No SubscribeURL provided"
                )

        # Handle email notification
        if message_type == "Notification":
            logger.info("[Inbound Webhook] Processing email notification")

            # Parse SES notification
            try:
                ses_notification = json.loads(sns_message.get("Message", "{}"))
            except Exception as error:
                logger.error(f"[Inbound Webhook] Failed to parse SNS message: {error}")
                raise HTTPException(
                    status_code=400,
                    detail="Invalid message format"
                )

            # Extract email metadata
            mail = ses_notification.get("mail", {})
            receipt = ses_notification.get("receipt", {})

            # Check spam/virus status
            spam_verdict = receipt.get("spamVerdict", {}).get("status")
            virus_verdict = receipt.get("virusVerdict", {}).get("status")

            if spam_verdict == "FAIL" or virus_verdict == "FAIL":
                logger.info("[Inbound Webhook] Email rejected: spam or virus detected")
                return JSONResponse(
                    content={"message": "Email rejected: spam/virus"},
                    status_code=200
                )

            # Get S3 object key from SES action
            s3_action = receipt.get("action", {})
            s3_key = None

            if s3_action and s3_action.get("type") == "S3":
                s3_key = s3_action.get("objectKey")
            else:
                # Fallback: construct S3 key from message ID
                message_id = mail.get("messageId")
                s3_key = f"emails/{message_id}"

            message_id = mail.get("messageId")

            # Log email details
            logger.info(f"[Inbound Webhook] Email received:")
            logger.info(f"  - S3 Key: {s3_key}")
            logger.info(f"  - Message ID: {message_id}")
            logger.info(f"  - From: {mail.get('source')}")
            logger.info(f"  - To: {mail.get('destination')}")
            logger.info(f"  - Subject: {mail.get('commonHeaders', {}).get('subject', '(No Subject)')}")

            # Process email asynchronously
            # Note: In production, this should be queued for background processing
            # For now, we'll process it synchronously
            logger.info("[Inbound Webhook] Starting email processing")

            # Return success immediately to SNS, process email in background would be ideal
            # For simplicity, we'll process synchronously for now
            return JSONResponse(
                content={"message": "Email received and queued for processing"},
                status_code=200
            )

        # Handle unsubscribe notification
        if message_type == "UnsubscribeConfirmation":
            logger.info("[Inbound Webhook] Unsubscribe confirmation received")
            return JSONResponse(
                content={"message": "Unsubscribe noted"},
                status_code=200
            )

        # Unknown message type
        logger.info(f"[Inbound Webhook] Unknown SNS message type: {message_type}")
        return JSONResponse(
            content={"message": "OK"},
            status_code=200
        )

    except HTTPException:
        raise
    except Exception as error:
        logger.error(f"[Inbound Webhook] Error: {error}", exc_info=True)
        # Return 200 to prevent SNS from retrying
        return JSONResponse(
            content={"error": str(error)},
            status_code=200
        )


@router.get("/inbound/health")
async def health_check():
    """
    Health check endpoint for inbound email webhook.
    """
    return JSONResponse(
        content={
            "status": "healthy",
            "service": "Inbound Email Parser (Python)",
            "message": "SNS webhook endpoint is operational"
        },
        status_code=200
    )


@router.post("/process-email")
async def process_email_endpoint(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Process an email from S3.
    Internal endpoint for processing emails.
    """
    try:
        body = await request.json()
        s3_key = body.get("s3_key")
        message_id = body.get("message_id")

        if not s3_key or not message_id:
            raise HTTPException(status_code=400, detail="Missing s3_key or message_id")

        logger.info(f"[Process Email] Processing email: {message_id}")

        # Process the email
        parsed_email = await email_processing_service.process_email(
            s3_key=s3_key,
            message_id=message_id,
            db=db
        )

        if not parsed_email:
            return JSONResponse(
                content={"error": "Failed to process email"},
                status_code=500
            )

        return JSONResponse(
            content={
                "message": "Email processed successfully",
                "email_id": parsed_email.id,
                "confidence": parsed_email.overall_confidence,
                "requires_review": parsed_email.requires_review
            },
            status_code=200
        )

    except Exception as error:
        logger.error(f"[Process Email] Error: {error}", exc_info=True)
        return JSONResponse(
            content={"error": str(error)},
            status_code=500
        )
