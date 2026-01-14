"""
Email parsing service for contact extraction and email automation.
Handles email parsing, attachment processing, and contact extraction.
"""
import logging
import email
from email import policy
from email.parser import BytesParser
from email.message import EmailMessage
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime
import re
from pathlib import Path

logger = logging.getLogger(__name__)


class EmailParsingError(Exception):
    """Custom exception for email parsing errors."""
    pass


class EmailParser:
    """Service for parsing and processing email messages."""

    @staticmethod
    def parse_email(raw_email: bytes | str) -> Dict[str, Any]:
        """
        Parse raw email message into structured data.

        Args:
            raw_email: Raw email content (bytes or string)

        Returns:
            Dict with parsed email data
        """
        try:
            # Parse email
            if isinstance(raw_email, bytes):
                msg = BytesParser(policy=policy.default).parsebytes(raw_email)
            else:
                msg = email.message_from_string(raw_email, policy=policy.default)

            # Extract basic fields
            subject = msg.get('Subject', '')
            from_addr = msg.get('From', '')
            to_addrs = msg.get('To', '')
            cc_addrs = msg.get('Cc', '')
            date_str = msg.get('Date', '')
            message_id = msg.get('Message-ID', '')

            # Parse date
            try:
                email_date = email.utils.parsedate_to_datetime(date_str) if date_str else None
            except Exception:
                email_date = None

            # Extract body
            body_text = ""
            body_html = ""
            attachments = []

            # Get email body
            if msg.is_multipart():
                for part in msg.walk():
                    content_type = part.get_content_type()
                    content_disposition = str(part.get('Content-Disposition', ''))

                    # Extract text content
                    if content_type == 'text/plain' and 'attachment' not in content_disposition:
                        try:
                            body_text += part.get_content()
                        except Exception as e:
                            logger.warning(f"Error extracting text part: {e}")

                    elif content_type == 'text/html' and 'attachment' not in content_disposition:
                        try:
                            body_html += part.get_content()
                        except Exception as e:
                            logger.warning(f"Error extracting HTML part: {e}")

                    # Extract attachments
                    elif 'attachment' in content_disposition:
                        filename = part.get_filename()
                        if filename:
                            attachments.append({
                                'filename': filename,
                                'content_type': content_type,
                                'size': len(part.get_payload(decode=True) or b''),
                            })
            else:
                # Simple email without multipart
                content_type = msg.get_content_type()
                if content_type == 'text/plain':
                    body_text = msg.get_content()
                elif content_type == 'text/html':
                    body_html = msg.get_content()

            # Parse email addresses
            from_parsed = EmailParser._parse_email_address(from_addr)
            to_parsed = EmailParser._parse_email_addresses(to_addrs)
            cc_parsed = EmailParser._parse_email_addresses(cc_addrs)

            return {
                'success': True,
                'message_id': message_id,
                'subject': subject,
                'from': from_parsed,
                'to': to_parsed,
                'cc': cc_parsed,
                'date': email_date,
                'body_text': body_text,
                'body_html': body_html,
                'attachments': attachments,
                'attachment_count': len(attachments),
            }

        except Exception as e:
            logger.error(f"Error parsing email: {e}")
            raise EmailParsingError(f"Failed to parse email: {str(e)}")

    @staticmethod
    def _parse_email_address(addr_str: str) -> Optional[Dict[str, str]]:
        """Parse a single email address string."""
        if not addr_str:
            return None

        try:
            name, email_addr = email.utils.parseaddr(addr_str)
            return {
                'name': name or None,
                'email': email_addr.lower() if email_addr else None,
            }
        except Exception:
            return {'name': None, 'email': addr_str.lower()}

    @staticmethod
    def _parse_email_addresses(addr_str: str) -> List[Dict[str, str]]:
        """Parse multiple email addresses from a string."""
        if not addr_str:
            return []

        try:
            addresses = email.utils.getaddresses([addr_str])
            return [
                {
                    'name': name or None,
                    'email': addr.lower() if addr else None,
                }
                for name, addr in addresses
                if addr
            ]
        except Exception:
            return []

    @staticmethod
    def extract_contacts_from_email(email_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Extract contact information from parsed email.

        Args:
            email_data: Parsed email data from parse_email()

        Returns:
            List of extracted contacts with email, name, and context
        """
        contacts = []
        seen_emails = set()

        # Extract from sender
        if email_data.get('from'):
            from_contact = email_data['from']
            if from_contact['email'] and from_contact['email'] not in seen_emails:
                contacts.append({
                    'email': from_contact['email'],
                    'name': from_contact['name'],
                    'source': 'sender',
                    'context': f"Email from: {email_data.get('subject', 'No subject')}",
                })
                seen_emails.add(from_contact['email'])

        # Extract from recipients
        for to_contact in email_data.get('to', []):
            if to_contact['email'] and to_contact['email'] not in seen_emails:
                contacts.append({
                    'email': to_contact['email'],
                    'name': to_contact['name'],
                    'source': 'recipient',
                    'context': f"Email to: {email_data.get('subject', 'No subject')}",
                })
                seen_emails.add(to_contact['email'])

        # Extract from CC
        for cc_contact in email_data.get('cc', []):
            if cc_contact['email'] and cc_contact['email'] not in seen_emails:
                contacts.append({
                    'email': cc_contact['email'],
                    'name': cc_contact['name'],
                    'source': 'cc',
                    'context': f"Email CC: {email_data.get('subject', 'No subject')}",
                })
                seen_emails.add(cc_contact['email'])

        # Extract from email body
        body_text = email_data.get('body_text', '')
        if body_text:
            body_contacts = EmailParser._extract_contacts_from_text(body_text)
            for contact in body_contacts:
                if contact['email'] not in seen_emails:
                    contact['source'] = 'body'
                    contact['context'] = f"Found in email: {email_data.get('subject', 'No subject')}"
                    contacts.append(contact)
                    seen_emails.add(contact['email'])

        return contacts

    @staticmethod
    def _extract_contacts_from_text(text: str) -> List[Dict[str, Any]]:
        """Extract email addresses and names from text."""
        contacts = []

        # Pattern to match email addresses
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'

        # Pattern to match name before email (e.g., "John Smith <john@example.com>")
        name_email_pattern = r'([A-Z][a-z]+ [A-Z][a-z]+)\s*<?([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})>?'

        # Try to extract name + email first
        matches = re.finditer(name_email_pattern, text)
        found_emails = set()

        for match in matches:
            name = match.group(1).strip()
            email_addr = match.group(2).lower()
            contacts.append({
                'name': name,
                'email': email_addr,
            })
            found_emails.add(email_addr)

        # Extract remaining emails without names
        emails = re.findall(email_pattern, text)
        for email_addr in emails:
            email_lower = email_addr.lower()
            if email_lower not in found_emails:
                contacts.append({
                    'name': None,
                    'email': email_lower,
                })

        return contacts

    @staticmethod
    def extract_organizations_from_email(email_data: Dict[str, Any]) -> List[str]:
        """
        Extract organization/institution names from email data.

        Args:
            email_data: Parsed email data

        Returns:
            List of organization names
        """
        organizations = set()

        # Extract from email domains
        for contact_list in [email_data.get('from', {}), *email_data.get('to', []), *email_data.get('cc', [])]:
            if isinstance(contact_list, dict):
                email_addr = contact_list.get('email', '')
            else:
                continue

            if email_addr and '@' in email_addr:
                domain = email_addr.split('@')[1]
                # Remove common email providers
                if domain not in ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com']:
                    # Extract organization name from domain
                    org_name = domain.split('.')[0]
                    if org_name:
                        organizations.add(org_name.title())

        # Extract from email signatures (common patterns)
        body_text = email_data.get('body_text', '')
        # Pattern: University, Institute, Laboratory, etc.
        org_patterns = [
            r'\b([A-Z][a-z]+ University)\b',
            r'\b([A-Z][a-z]+ Institute(?:\s+of\s+[A-Z][a-z]+)?)\b',
            r'\b([A-Z][a-z]+ Laboratory)\b',
            r'\b([A-Z][a-z]+\s+(?:College|Foundation|Association|Society))\b',
        ]

        for pattern in org_patterns:
            matches = re.findall(pattern, body_text)
            organizations.update(matches)

        return list(organizations)

    @staticmethod
    def extract_meeting_details(email_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Extract meeting/event details from email.

        Args:
            email_data: Parsed email data

        Returns:
            Dict with meeting details if found, None otherwise
        """
        body_text = email_data.get('body_text', '')
        subject = email_data.get('subject', '')

        # Check if email appears to be about a meeting
        meeting_keywords = ['meeting', 'conference', 'call', 'zoom', 'webinar', 'event', 'seminar']
        is_meeting = any(keyword in subject.lower() or keyword in body_text.lower() for keyword in meeting_keywords)

        if not is_meeting:
            return None

        # Extract date/time patterns
        date_patterns = [
            r'\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b',
            r'\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b',
        ]

        time_patterns = [
            r'\b\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)\b',
            r'\b\d{1,2}:\d{2}\b',
        ]

        dates = []
        times = []

        for pattern in date_patterns:
            dates.extend(re.findall(pattern, body_text, re.IGNORECASE))

        for pattern in time_patterns:
            times.extend(re.findall(pattern, body_text, re.IGNORECASE))

        # Extract Zoom/Teams links
        zoom_pattern = r'https://[\w-]+\.zoom\.us/j/\d+'
        teams_pattern = r'https://teams\.microsoft\.com/l/meetup-join/[^\s]+'

        zoom_links = re.findall(zoom_pattern, body_text)
        teams_links = re.findall(teams_pattern, body_text)

        return {
            'subject': subject,
            'dates': dates[:5],  # Limit to first 5 dates
            'times': times[:5],  # Limit to first 5 times
            'zoom_links': zoom_links,
            'teams_links': teams_links,
            'has_video_link': bool(zoom_links or teams_links),
        }

    @staticmethod
    def categorize_email(email_data: Dict[str, Any]) -> List[str]:
        """
        Categorize email based on content.

        Args:
            email_data: Parsed email data

        Returns:
            List of category tags
        """
        categories = []
        subject = email_data.get('subject', '').lower()
        body = email_data.get('body_text', '').lower()
        combined = f"{subject} {body}"

        # Define category keywords
        category_keywords = {
            'conference': ['conference', 'symposium', 'workshop', 'summit'],
            'funding': ['grant', 'funding', 'proposal', 'rfp', 'award'],
            'research': ['research', 'study', 'paper', 'publication', 'journal'],
            'collaboration': ['collaboration', 'partnership', 'joint', 'cooperat'],
            'meeting': ['meeting', 'call', 'zoom', 'webinar'],
            'newsletter': ['newsletter', 'digest', 'bulletin', 'update'],
            'invitation': ['invite', 'invitation', 'rsvp'],
            'urgent': ['urgent', 'asap', 'important', 'critical'],
        }

        for category, keywords in category_keywords.items():
            if any(keyword in combined for keyword in keywords):
                categories.append(category)

        return categories if categories else ['general']
