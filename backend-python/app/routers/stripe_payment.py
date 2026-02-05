"""
Stripe payment processing router for ICSR2026 conference registration
"""
from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel, EmailStr
import stripe
import logging
from decimal import Decimal
from typing import Optional

from app.config import settings

logger = logging.getLogger(__name__)

# Initialize Stripe
if settings.STRIPE_SECRET_KEY:
    stripe.api_key = settings.STRIPE_SECRET_KEY
else:
    logger.warning("STRIPE_SECRET_KEY not configured")

router = APIRouter()


class CreatePaymentIntentRequest(BaseModel):
    """Request to create a Stripe payment intent"""
    amount: float  # Dollar amount (e.g., 475.00)
    currency: str = "usd"
    customer_email: EmailStr
    customer_name: str
    registration_type: str
    cover_fees: bool = False  # Whether customer wants to cover processing fees
    metadata: Optional[dict] = None


class PaymentIntentResponse(BaseModel):
    """Response with client secret for frontend"""
    client_secret: str
    publishable_key: str
    amount: int  # Amount in cents
    fee_amount: int  # Fee amount in cents (if covered)
    total_amount: int  # Total including fees (if covered)


@router.post("/create-payment-intent", response_model=PaymentIntentResponse)
async def create_payment_intent(request: CreatePaymentIntentRequest):
    """
    Create a Stripe Payment Intent for conference registration.

    This endpoint:
    1. Calculates the total amount (including fees if customer covers them)
    2. Creates a Stripe Payment Intent
    3. Returns client_secret for frontend to complete payment
    """
    try:
        if not settings.STRIPE_SECRET_KEY:
            raise HTTPException(status_code=500, detail="Stripe not configured")

        # Convert dollar amount to cents
        base_amount_cents = int(request.amount * 100)

        # Calculate fee if customer wants to cover it
        # Stripe fee: 2.9% + $0.30
        fee_amount_cents = 0
        total_amount_cents = base_amount_cents

        if request.cover_fees:
            # Calculate fee: (amount + $0.30) / (1 - 0.029)
            # This ensures Stripe gets 2.9% + $0.30 and we receive the full base amount
            total_with_fixed_fee = base_amount_cents + 30  # Add $0.30
            total_amount_cents = int(total_with_fixed_fee / 0.971)  # Divide by (1 - 0.029)
            fee_amount_cents = total_amount_cents - base_amount_cents

        # Prepare metadata
        payment_metadata = {
            "registration_type": request.registration_type,
            "customer_name": request.customer_name,
            "customer_email": request.customer_email,
            "base_amount": request.amount,
            "cover_fees": str(request.cover_fees),
        }

        if request.metadata:
            payment_metadata.update(request.metadata)

        # Create Payment Intent
        intent = stripe.PaymentIntent.create(
            amount=total_amount_cents,
            currency=request.currency,
            receipt_email=request.customer_email,
            metadata=payment_metadata,
            description=f"ICSR2026 Registration - {request.registration_type}",
        )

        logger.info(
            f"Created payment intent {intent.id} for {request.customer_email}: "
            f"${request.amount} (base) + ${fee_amount_cents/100:.2f} (fees) = "
            f"${total_amount_cents/100:.2f} (total)"
        )

        return PaymentIntentResponse(
            client_secret=intent.client_secret,
            publishable_key=settings.STRIPE_PUBLISHABLE_KEY,
            amount=base_amount_cents,
            fee_amount=fee_amount_cents,
            total_amount=total_amount_cents,
        )

    except stripe.error.StripeError as e:
        logger.error(f"Stripe error creating payment intent: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating payment intent: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create payment intent")


class ConfirmPaymentRequest(BaseModel):
    """Request to confirm a payment was successful"""
    payment_intent_id: str
    registration_id: Optional[str] = None


@router.post("/confirm-payment")
async def confirm_payment(request: ConfirmPaymentRequest):
    """
    Confirm a payment was successful and retrieve payment details.

    This should be called after the frontend successfully completes payment
    to verify the payment status before finalizing registration.
    """
    try:
        if not settings.STRIPE_SECRET_KEY:
            raise HTTPException(status_code=500, detail="Stripe not configured")

        # Retrieve the payment intent
        intent = stripe.PaymentIntent.retrieve(request.payment_intent_id)

        if intent.status != "succeeded":
            raise HTTPException(
                status_code=400,
                detail=f"Payment not successful. Status: {intent.status}"
            )

        # Extract payment details
        payment_details = {
            "payment_intent_id": intent.id,
            "amount": intent.amount / 100,  # Convert cents to dollars
            "currency": intent.currency,
            "status": intent.status,
            "customer_email": intent.receipt_email,
            "metadata": intent.metadata,
            "created": intent.created,
        }

        logger.info(f"Payment confirmed: {intent.id} for ${intent.amount/100:.2f}")

        return {
            "success": True,
            "message": "Payment confirmed successfully",
            "payment": payment_details,
        }

    except stripe.error.StripeError as e:
        logger.error(f"Stripe error confirming payment: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error confirming payment: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to confirm payment")


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """
    Handle Stripe webhook events.

    Important: This endpoint must be configured in Stripe Dashboard:
    1. Go to Developers → Webhooks
    2. Add endpoint: https://your-domain.com/api/stripe/webhook
    3. Select events: payment_intent.succeeded, payment_intent.payment_failed
    4. Copy webhook signing secret to STRIPE_WEBHOOK_SECRET env var
    """
    try:
        payload = await request.body()
        sig_header = request.headers.get("stripe-signature")

        if not settings.STRIPE_WEBHOOK_SECRET:
            logger.error("STRIPE_WEBHOOK_SECRET not configured")
            raise HTTPException(status_code=500, detail="Webhook not configured")

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError:
            logger.error("Invalid webhook payload")
            raise HTTPException(status_code=400, detail="Invalid payload")
        except stripe.error.SignatureVerificationError:
            logger.error("Invalid webhook signature")
            raise HTTPException(status_code=400, detail="Invalid signature")

        # Handle the event
        if event.type == "payment_intent.succeeded":
            payment_intent = event.data.object
            logger.info(f"Payment succeeded: {payment_intent.id}")

            # TODO: Update registration status in database
            # Example: await update_registration_payment_status(payment_intent.metadata.get('registration_id'), 'paid')

        elif event.type == "payment_intent.payment_failed":
            payment_intent = event.data.object
            logger.warning(f"Payment failed: {payment_intent.id}")

            # TODO: Send payment failure email to customer
            # TODO: Update registration status in database

        else:
            logger.info(f"Unhandled event type: {event.type}")

        return {"success": True}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error handling webhook: {str(e)}")
        raise HTTPException(status_code=500, detail="Webhook handler error")


@router.get("/config")
async def get_stripe_config():
    """
    Get public Stripe configuration for frontend.
    Returns publishable key (safe to expose).
    """
    if not settings.STRIPE_PUBLISHABLE_KEY:
        raise HTTPException(status_code=500, detail="Stripe not configured")

    return {
        "publishable_key": settings.STRIPE_PUBLISHABLE_KEY,
        "currency": "usd",
    }
