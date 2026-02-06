"""
Bounceback handler service for managing email delivery failures.
Detects bounce notifications and removes invalid email addresses from contacts.
"""
import logging
import re
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import text

logger = logging.getLogger(__name__)


class BouncebackHandler:
    """Service for handling email bouncebacks and delivery failures."""

    # Common bounce detection patterns
    BOUNCE_PATTERNS = [
        r'delivery\s+(?:has\s+)?failed',
        r'undelivered\s+mail',
        r'returned\s+mail',
        r'mail\s+delivery\s+(?:failed|failure)',
        r'permanent\s+(?:fatal\s+)?error',
        r'user\s+unknown',
        r'mailbox\s+(?:not\s+found|unavailable|full)',
        r'recipient\s+address\s+rejected',
        r'address\s+(?:not\s+found|rejected)',
        r'550\s+5\.1\.1',  # User unknown
        r'554\s+5\.7\.1',  # Relay access denied
        r'permanent\s+failure',
        r'does\s+not\s+exist',
        r'no\s+such\s+(?:user|mailbox)',
    ]

    # Patterns to extract failed email address from bounce message
    EMAIL_EXTRACTION_PATTERNS = [
        r'<([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})>',  # <email@domain.com>
        r'(?:to|for|address|recipient):\s*([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})',
        r'([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})\s+(?:failed|bounced|rejected)',
    ]

    @staticmethod
    def is_bounceback(email_data: Dict[str, Any]) -> bool:
        """
        Determine if an email is a bounceback notification.

        Args:
            email_data: Parsed email data from EmailParser

        Returns:
            True if email appears to be a bounceback, False otherwise
        """
        subject = email_data.get('subject', '').lower()
        body_text = email_data.get('body_text', '').lower()
        combined = f"{subject} {body_text}"

        # Check common bounce indicators in sender
        from_addr = email_data.get('from', {})
        if isinstance(from_addr, dict):
            sender_email = from_addr.get('email', '').lower()
            # Common bounce sender patterns
            bounce_senders = [
                'mailer-daemon',
                'postmaster',
                'noreply',
                'no-reply',
                'bounce',
                'return',
            ]
            if any(sender in sender_email for sender in bounce_senders):
                # Likely from mail system
                pass

        # Check for bounce patterns in content
        for pattern in BouncebackHandler.BOUNCE_PATTERNS:
            if re.search(pattern, combined, re.IGNORECASE):
                logger.info(f"Detected bounceback with pattern: {pattern}")
                return True

        return False

    @staticmethod
    def extract_failed_email(email_data: Dict[str, Any]) -> Optional[str]:
        """
        Extract the failed email address from a bounceback notification.

        Args:
            email_data: Parsed email data from EmailParser

        Returns:
            Failed email address if found, None otherwise
        """
        subject = email_data.get('subject', '')
        body_text = email_data.get('body_text', '')
        combined = f"{subject}\n{body_text}"

        # Try each extraction pattern
        for pattern in BouncebackHandler.EMAIL_EXTRACTION_PATTERNS:
            matches = re.findall(pattern, combined, re.IGNORECASE)
            if matches:
                # Return first match (usually the failed address)
                failed_email = matches[0].lower()

                # Exclude common system addresses
                system_addresses = [
                    'inbox@shellfish-society.org',
                    'admin@shellfish-society.org',
                    'noreply@shellfish-society.org',
                ]

                if failed_email not in system_addresses:
                    logger.info(f"Extracted failed email: {failed_email}")
                    return failed_email

        return None

    @staticmethod
    def remove_email_from_contact(db: Session, email_address: str) -> Dict[str, Any]:
        """
        Remove an email address from contact records.

        If the email is a primary email, delete the entire contact.
        If it's an alternate email, remove it from the alternate_emails array.

        Args:
            db: Database session
            email_address: Email address to remove

        Returns:
            Dict with success status and action taken
        """
        try:
            email_lower = email_address.lower()

            # Check if it's a primary email
            result = db.execute(text('''
                SELECT id, email, first_name, last_name, alternate_emails
                FROM contacts
                WHERE LOWER(email) = :email
            '''), {'email': email_lower})

            contact = result.fetchone()

            if contact:
                contact_id, primary_email, first_name, last_name, alternate_emails = contact

                # If there are alternate emails, promote the first one to primary
                if alternate_emails and len(alternate_emails) > 0:
                    new_primary = alternate_emails[0]
                    remaining_alternates = alternate_emails[1:]

                    db.execute(text('''
                        UPDATE contacts
                        SET email = :new_primary,
                            alternate_emails = :remaining
                        WHERE id = :contact_id
                    '''), {
                        'new_primary': new_primary,
                        'remaining': remaining_alternates,
                        'contact_id': contact_id
                    })
                    db.commit()

                    logger.info(f"Promoted {new_primary} to primary for contact {contact_id}, removed bounced {email_lower}")
                    return {
                        'success': True,
                        'action': 'promoted_alternate',
                        'contact_id': str(contact_id),
                        'removed_email': email_lower,
                        'new_primary': new_primary,
                        'name': f"{first_name} {last_name}".strip()
                    }
                else:
                    # No alternates, delete the contact entirely
                    db.execute(text('''
                        DELETE FROM contacts
                        WHERE id = :contact_id
                    '''), {'contact_id': contact_id})
                    db.commit()

                    logger.warning(f"Deleted contact {contact_id} ({first_name} {last_name}) - no valid email addresses")
                    return {
                        'success': True,
                        'action': 'deleted_contact',
                        'contact_id': str(contact_id),
                        'removed_email': email_lower,
                        'name': f"{first_name} {last_name}".strip()
                    }

            # Check if it's an alternate email
            result = db.execute(text('''
                SELECT id, email, first_name, last_name, alternate_emails
                FROM contacts
                WHERE :email = ANY(alternate_emails)
            '''), {'email': email_lower})

            contact = result.fetchone()

            if contact:
                contact_id, primary_email, first_name, last_name, alternate_emails = contact

                # Remove from alternates array
                updated_alternates = [e for e in alternate_emails if e.lower() != email_lower]

                db.execute(text('''
                    UPDATE contacts
                    SET alternate_emails = :updated
                    WHERE id = :contact_id
                '''), {
                    'updated': updated_alternates,
                    'contact_id': contact_id
                })
                db.commit()

                logger.info(f"Removed {email_lower} from alternate emails for contact {contact_id}")
                return {
                    'success': True,
                    'action': 'removed_alternate',
                    'contact_id': str(contact_id),
                    'removed_email': email_lower,
                    'primary_email': primary_email,
                    'name': f"{first_name} {last_name}".strip()
                }

            # Email not found in any contact
            logger.info(f"Email {email_lower} not found in any contact")
            return {
                'success': False,
                'action': 'not_found',
                'removed_email': email_lower
            }

        except Exception as e:
            logger.error(f"Error removing email {email_address}: {e}")
            db.rollback()
            return {
                'success': False,
                'action': 'error',
                'error': str(e),
                'removed_email': email_address
            }

    @staticmethod
    def process_bounceback(db: Session, email_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a bounceback email and handle the failed address.

        Args:
            db: Database session
            email_data: Parsed email data from EmailParser

        Returns:
            Dict with processing results
        """
        # Verify it's a bounceback
        if not BouncebackHandler.is_bounceback(email_data):
            return {
                'success': False,
                'is_bounceback': False,
                'message': 'Email is not a bounceback notification'
            }

        # Extract failed email
        failed_email = BouncebackHandler.extract_failed_email(email_data)

        if not failed_email:
            logger.warning("Detected bounceback but could not extract failed email address")
            return {
                'success': False,
                'is_bounceback': True,
                'failed_email': None,
                'message': 'Could not extract failed email address from bounce notification'
            }

        # Remove the email from contacts
        removal_result = BouncebackHandler.remove_email_from_contact(db, failed_email)

        return {
            'success': True,
            'is_bounceback': True,
            'failed_email': failed_email,
            'removal_result': removal_result,
            'message': f"Processed bounceback for {failed_email}"
        }
