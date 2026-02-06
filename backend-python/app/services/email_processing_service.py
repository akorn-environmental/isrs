"""
Email Processing Service
Orchestrates email download, parsing, AI extraction, and database storage
"""
import logging
from typing import Dict, Any, Optional
from datetime import datetime, date
from sqlalchemy.orm import Session
from app.services.s3_email_service import S3EmailService
from app.services.email_parser_service import EmailParserService
from app.services.ai_extraction_service import AIExtractionService
from app.services.contact_enrichment_service import ContactEnrichmentService
from app.services.bounceback_handler import BouncebackHandler
from app.models.parsed_email import ParsedEmail
from app.models.vote import BoardVote
from app.models.funding import FundingProspect

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

            # Step 2.5: Check for bounceback and handle it
            if BouncebackHandler.is_bounceback(parsed_email):
                logger.info(f"[Email Processing] Detected bounceback notification")
                bounceback_result = BouncebackHandler.process_bounceback(db, parsed_email)
                logger.info(f"[Email Processing] Bounceback result: {bounceback_result}")

                # Store bounceback email record for audit trail
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
                    status='bounceback_processed',
                    requires_review=False,
                    email_metadata={
                        'source': 'ses_inbound',
                        'email_type': 'bounceback',
                        'bounceback_result': bounceback_result
                    }
                )
                db.add(parsed_email_record)
                db.commit()
                logger.info(f"[Email Processing] Bounceback processed and logged")
                return parsed_email_record

            # Step 3: AI extraction
            logger.info(f"[Email Processing] Step 3: AI extraction")
            extracted_data = await self.ai_service.extract_data(parsed_email)

            # Step 4: Store in database
            logger.info(f"[Email Processing] Step 4: Storing in database")

            # Store email type in metadata
            email_type = extracted_data.get('email_type', 'general')
            email_metadata = {
                'source': 'ses_inbound',
                'from_name': parsed_email.get('from_name'),
                's3_bucket': self.s3_service.bucket_name,
                'email_type': email_type
            }

            # Add specialized extraction data to metadata
            if extracted_data.get('board_vote'):
                email_metadata['board_vote'] = extracted_data['board_vote']
            if extracted_data.get('meeting_info'):
                email_metadata['meeting_info'] = extracted_data['meeting_info']
            if extracted_data.get('funding_info'):
                email_metadata['funding_info'] = extracted_data['funding_info']
            if extracted_data.get('abstract_info'):
                email_metadata['abstract_info'] = extracted_data['abstract_info']
            if extracted_data.get('partnership_info'):
                email_metadata['partnership_info'] = extracted_data['partnership_info']
            if extracted_data.get('grant_progress'):
                email_metadata['grant_progress'] = extracted_data['grant_progress']

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
                email_metadata=email_metadata
            )

            db.add(parsed_email_record)
            db.commit()
            db.refresh(parsed_email_record)

            logger.info(f"[Email Processing] Successfully processed email ID: {parsed_email_record.id}")
            logger.info(f"[Email Processing] Email type: {email_type}, Confidence: {parsed_email_record.overall_confidence}%, Requires review: {parsed_email_record.requires_review}")

            # Step 5: Auto-link to specialized tables (if confidence is high enough)
            if extracted_data.get('overall_confidence', 0) >= 70:
                await self._auto_link_specialized_data(parsed_email_record, extracted_data, db)
            else:
                logger.info(f"[Email Processing] Skipping auto-link due to low confidence ({extracted_data.get('overall_confidence', 0)}%)")

            return parsed_email_record

        except Exception as e:
            logger.error(f"[Email Processing] Failed to process email: {str(e)}", exc_info=True)
            db.rollback()
            return self._create_failed_record(s3_key, message_id, str(e), db)

    async def _auto_link_specialized_data(
        self,
        parsed_email: ParsedEmail,
        extracted_data: Dict[str, Any],
        db: Session
    ) -> None:
        """
        Auto-link extracted data to specialized tables (BoardVote, FundingProspect, etc.)
        Only creates records if confidence is high enough
        """
        try:
            email_type = extracted_data.get('email_type', 'general')

            # === Contact Enrichment Processing ===
            # Process contacts if overall confidence >= 60% (lower threshold than specialized data)
            if extracted_data.get('overall_confidence', 0) >= 60:
                try:
                    contact_service = ContactEnrichmentService(confidence_threshold=60.0)

                    logger.info(f"[Contact Enrichment] Processing contacts from email {parsed_email.id}")

                    enrichment_result = await contact_service.process_email_contacts(
                        parsed_email=parsed_email,
                        extracted_data=extracted_data,
                        db=db
                    )

                    logger.info(
                        f"[Contact Enrichment] Results: "
                        f"Created={enrichment_result['contacts_created']}, "
                        f"Updated={enrichment_result['contacts_updated']}, "
                        f"Skipped={enrichment_result['contacts_skipped']}, "
                        f"Orgs Created={enrichment_result['organizations_created']}, "
                        f"Orgs Matched={enrichment_result['organizations_matched']}"
                    )

                    # Store primary contact in email metadata
                    if enrichment_result.get('primary_contact'):
                        if not parsed_email.email_metadata:
                            parsed_email.email_metadata = {}
                        parsed_email.email_metadata['primary_contact'] = enrichment_result['primary_contact']
                        db.commit()

                except Exception as enrichment_error:
                    logger.error(
                        f"[Contact Enrichment] Failed to enrich contacts: {str(enrichment_error)}",
                        exc_info=True
                    )
                    # Don't fail email processing if contact enrichment fails
                    db.rollback()

            # Board Vote Auto-Creation
            if email_type == 'board_vote' and extracted_data.get('board_vote'):
                vote_data = extracted_data['board_vote']
                if vote_data.get('confidence', 0) >= 70:
                    logger.info(f"[Auto-Link] Creating BoardVote record from email {parsed_email.id}")

                    # Parse vote date
                    vote_date_str = vote_data.get('vote_date')
                    vote_date = None
                    if vote_date_str:
                        try:
                            vote_date = datetime.strptime(vote_date_str, '%Y-%m-%d').date()
                        except:
                            vote_date = date.today()

                    # Create vote record
                    vote_record = BoardVote(
                        vote_id=f"EMAIL_{parsed_email.message_id[:20]}",
                        motion_title=vote_data.get('motion_title', ''),
                        motion_description=vote_data.get('motion_description'),
                        vote_date=vote_date or date.today(),
                        vote_method=vote_data.get('vote_method', 'email'),
                        result=vote_data.get('result', 'pending'),
                        yes_count=vote_data.get('yes_count', 0),
                        no_count=vote_data.get('no_count', 0),
                        abstain_count=vote_data.get('abstain_count', 0),
                        total_votes=vote_data.get('total_votes', 0),
                        quorum_met=vote_data.get('quorum_met', False),
                        email_content=parsed_email.body_text,
                        processed_by='AI-CLAUDE',
                        processed_method='AI-CLAUDE',
                        notes=f"Auto-created from email {parsed_email.subject}"
                    )

                    db.add(vote_record)
                    db.commit()
                    logger.info(f"[Auto-Link] Created BoardVote ID: {vote_record.id}")

            # Funding Opportunity Auto-Creation
            elif email_type == 'funding_opportunity' and extracted_data.get('funding_info'):
                funding_data = extracted_data['funding_info']
                if funding_data.get('confidence', 0) >= 70:
                    logger.info(f"[Auto-Link] Creating FundingProspect record from email {parsed_email.id}")

                    # Parse deadline
                    deadline_str = funding_data.get('deadline')
                    deadline = None
                    if deadline_str:
                        try:
                            deadline = datetime.strptime(deadline_str, '%Y-%m-%d').date()
                        except:
                            pass

                    # Create funding record
                    funding_record = FundingProspect(
                        organization_name=funding_data.get('funder_name', 'Unknown Funder'),
                        program_name=funding_data.get('program_name'),
                        amount=funding_data.get('amount'),
                        amount_numeric=funding_data.get('amount_numeric'),
                        deadline=deadline,
                        url=funding_data.get('url'),
                        description=funding_data.get('description'),
                        eligibility_criteria=funding_data.get('eligibility'),
                        status='open',
                        source='email_parsed',
                        notes=f"Auto-created from email: {parsed_email.subject}"
                    )

                    db.add(funding_record)
                    db.commit()
                    logger.info(f"[Auto-Link] Created FundingProspect ID: {funding_record.id}")

            # TODO: Add auto-linking for:
            # - meeting_info -> Create meeting record (requires board_meetings table)
            # - abstract_info -> Create conference abstract
            # - partnership_info -> Create partnership record
            # - grant_progress -> Update existing grant record

        except Exception as e:
            logger.error(f"[Auto-Link] Failed to auto-link specialized data: {str(e)}", exc_info=True)
            # Don't fail the entire email processing if auto-linking fails
            db.rollback()

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
