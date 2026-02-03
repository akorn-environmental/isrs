"""
Email Processing Service
Orchestrates email download, parsing, AI extraction, and database storage
"""
import logging
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.services.s3_email_service import S3EmailService
from app.services.email_parser_service import EmailParserService
from app.services.ai_extraction_service import AIExtractionService
from app.models.parsed_email import ParsedEmail

logger = logging.getLogger(__name__)


class EmailProcessingService:
    """Service for processing inbound emails"""

    def __init__(self):
        """Initialize service dependencies"""
        self.s3_service = S3EmailService()
        self.parser_service = EmailParserService()
        self.ai_service = AIExtractionService()

    async def process_email(
        self,
        s3_key: str,
        message_id: str,
        db: Session
    ) -> Optional[ParsedEmail]:
        """
        Process an inbound email: download, parse, extract, store

        Args:
            s3_key: S3 object key for the email
            message_id: Email message ID
            db: Database session

        Returns:
            ParsedEmail object if successful, None otherwise
        """
        try:
            logger.info(f"[Email Processing] Starting processing for message: {message_id}")

            # Check if already processed
            existing = db.query(ParsedEmail).filter(
                ParsedEmail.message_id == message_id
            ).first()

            if existing:
                logger.info(f"[Email Processing] Email already processed: {message_id}")
                return existing

            # Step 1: Download email from S3
            logger.info(f"[Email Processing] Step 1: Downloading from S3")
            email_content = await self.s3_service.download_email(s3_key)

            if not email_content:
                logger.error(f"[Email Processing] Failed to download email from S3")
                return self._create_failed_record(s3_key, message_id, "Failed to download from S3", db)

            # Step 2: Parse MIME email
            logger.info(f"[Email Processing] Step 2: Parsing MIME email")
            parsed_email = self.parser_service.parse_email(email_content)

            # Step 3: AI extraction
            logger.info(f"[Email Processing] Step 3: AI extraction")
            extracted_data = await self.ai_service.extract_data(parsed_email)

            # Step 4: Store in database
            logger.info(f"[Email Processing] Step 4: Storing in database")
            parsed_email_record = ParsedEmail(
                message_id=message_id,
                s3_key=s3_key,
                from_email=parsed_email.get('from_email'),
                to_emails=parsed_email.get('to_emails'),
                cc_emails=parsed_email.get('cc_emails'),
                subject=parsed_email.get('subject'),
                date=parsed_email.get('date'),
                body_text=parsed_email.get('body_text'),
                body_html=parsed_email.get('body_html'),
                attachments=parsed_email.get('attachments'),
                extracted_contacts=extracted_data.get('contacts'),
                action_items=extracted_data.get('action_items'),
                topics=extracted_data.get('topics'),
                overall_confidence=extracted_data.get('overall_confidence', 0),
                status='processed',
                requires_review=extracted_data.get('overall_confidence', 0) < 70,
                email_metadata={
                    'source': 'ses_inbound',
                    'from_name': parsed_email.get('from_name'),
                    's3_bucket': self.s3_service.bucket_name
                }
            )

            db.add(parsed_email_record)
            db.commit()
            db.refresh(parsed_email_record)

            logger.info(f"[Email Processing] Successfully processed email ID: {parsed_email_record.id}")
            logger.info(f"[Email Processing] Confidence: {parsed_email_record.overall_confidence}%, Requires review: {parsed_email_record.requires_review}")

            return parsed_email_record

        except Exception as e:
            logger.error(f"[Email Processing] Failed to process email: {str(e)}", exc_info=True)
            db.rollback()
            return self._create_failed_record(s3_key, message_id, str(e), db)

    @staticmethod
    def _create_failed_record(
        s3_key: str,
        message_id: str,
        error_message: str,
        db: Session
    ) -> Optional[ParsedEmail]:
        """Create a failed processing record"""
        try:
            failed_record = ParsedEmail(
                message_id=message_id,
                s3_key=s3_key,
                from_email=None,
                to_emails=[],
                cc_emails=[],
                subject="(Failed to process)",
                status='failed',
                error_message=error_message,
                requires_review=True,
                overall_confidence=0,
                email_metadata={'source': 'ses_inbound'}
            )

            db.add(failed_record)
            db.commit()
            db.refresh(failed_record)

            logger.info(f"[Email Processing] Created failed record ID: {failed_record.id}")
            return failed_record

        except Exception as e:
            logger.error(f"[Email Processing] Failed to create failed record: {str(e)}")
            db.rollback()
            return None
