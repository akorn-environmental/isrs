"""
Email Parser Service
Parses MIME emails and extracts metadata
"""
import logging
from email import message_from_bytes
from email.utils import parseaddr, parsedate_to_datetime
from typing import Dict, Any, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class EmailParserService:
    """Service for parsing MIME email content"""

    @staticmethod
    def parse_email(email_content: bytes) -> Dict[str, Any]:
        """
        Parse MIME email content and extract metadata

        Args:
            email_content: Raw email content as bytes

        Returns:
            Dictionary containing parsed email data
        """
        try:
            logger.info("[Email Parser] Parsing MIME email")

            # Parse the email
            msg = message_from_bytes(email_content)

            # Extract basic headers
            from_name, from_email = parseaddr(msg.get('From', ''))
            subject = msg.get('Subject', '(No Subject)')
            message_id = msg.get('Message-ID', '')
            date = msg.get('Date', '')

            # Parse date
            email_date = None
            try:
                if date:
                    email_date = parsedate_to_datetime(date)
            except Exception as e:
                logger.warning(f"[Email Parser] Failed to parse date '{date}': {e}")
                email_date = datetime.now()

            # Extract recipients
            to_emails = EmailParserService._extract_emails(msg.get_all('To', []))
            cc_emails = EmailParserService._extract_emails(msg.get_all('Cc', []))

            # Extract body
            body_text = ""
            body_html = ""
            attachments = []

            if msg.is_multipart():
                for part in msg.walk():
                    content_type = part.get_content_type()
                    content_disposition = str(part.get('Content-Disposition', ''))

                    # Extract text/plain
                    if content_type == 'text/plain' and 'attachment' not in content_disposition:
                        try:
                            body_text += part.get_payload(decode=True).decode('utf-8', errors='ignore')
                        except Exception as e:
                            logger.warning(f"[Email Parser] Failed to decode text/plain: {e}")

                    # Extract text/html
                    elif content_type == 'text/html' and 'attachment' not in content_disposition:
                        try:
                            body_html += part.get_payload(decode=True).decode('utf-8', errors='ignore')
                        except Exception as e:
                            logger.warning(f"[Email Parser] Failed to decode text/html: {e}")

                    # Extract attachments
                    elif 'attachment' in content_disposition:
                        filename = part.get_filename()
                        if filename:
                            attachments.append({
                                'filename': filename,
                                'content_type': content_type,
                                'size': len(part.get_payload(decode=True)) if part.get_payload(decode=True) else 0
                            })

            else:
                # Non-multipart email
                try:
                    content_type = msg.get_content_type()
                    payload = msg.get_payload(decode=True)
                    if payload:
                        decoded = payload.decode('utf-8', errors='ignore')
                        if content_type == 'text/html':
                            body_html = decoded
                        else:
                            body_text = decoded
                except Exception as e:
                    logger.warning(f"[Email Parser] Failed to decode non-multipart email: {e}")

            parsed_data = {
                'message_id': message_id,
                'from_name': from_name,
                'from_email': from_email,
                'to_emails': to_emails,
                'cc_emails': cc_emails,
                'subject': subject,
                'date': email_date,
                'body_text': body_text.strip(),
                'body_html': body_html.strip(),
                'attachments': attachments
            }

            logger.info(f"[Email Parser] Successfully parsed email: {subject}")
            logger.info(f"[Email Parser] From: {from_email}, To: {len(to_emails)}, CC: {len(cc_emails)}, Attachments: {len(attachments)}")

            return parsed_data

        except Exception as e:
            logger.error(f"[Email Parser] Failed to parse email: {str(e)}", exc_info=True)
            raise

    @staticmethod
    def _extract_emails(headers: List[str]) -> List[str]:
        """
        Extract email addresses from header list

        Args:
            headers: List of email headers

        Returns:
            List of email addresses
        """
        emails = []
        for header in headers:
            if header:
                # Handle comma-separated emails
                for addr in header.split(','):
                    name, email = parseaddr(addr.strip())
                    if email:
                        emails.append(email)
        return emails
