"""
AI Extraction Service
Uses Claude AI to extract structured data from emails
"""
import logging
import json
from typing import Dict, Any
import anthropic
from app.config import settings

logger = logging.getLogger(__name__)


class AIExtractionService:
    """Service for AI-powered email data extraction"""

    def __init__(self):
        """Initialize Anthropic client"""
        self.client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    async def extract_data(self, email_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract structured data from email using AI

        Args:
            email_data: Parsed email data dictionary

        Returns:
            Dictionary containing extracted contacts, action items, topics, and confidence
        """
        try:
            logger.info("[AI Extraction] Starting AI extraction")

            # Prepare email content for AI
            email_text = self._prepare_email_text(email_data)

            # Call Claude API
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=4096,
                system=self._get_system_prompt(),
                messages=[
                    {
                        "role": "user",
                        "content": email_text
                    }
                ]
            )

            # Parse AI response
            response_text = message.content[0].text
            extracted_data = json.loads(response_text)

            logger.info(f"[AI Extraction] Successfully extracted data. Confidence: {extracted_data.get('overall_confidence', 0)}%")
            logger.info(f"[AI Extraction] Contacts: {len(extracted_data.get('contacts', []))}, Action items: {len(extracted_data.get('action_items', []))}")

            return extracted_data

        except json.JSONDecodeError as e:
            logger.error(f"[AI Extraction] Failed to parse AI response as JSON: {str(e)}")
            return self._create_default_extraction(email_data, error="JSON parse error")

        except Exception as e:
            logger.error(f"[AI Extraction] Failed to extract data: {str(e)}", exc_info=True)
            return self._create_default_extraction(email_data, error=str(e))

    @staticmethod
    def _prepare_email_text(email_data: Dict[str, Any]) -> str:
        """Prepare email content for AI processing"""
        body = email_data.get('body_text', '') or email_data.get('body_html', '')

        email_text = f"""
EMAIL METADATA:
From: {email_data.get('from_name', '')} <{email_data.get('from_email', '')}>
To: {', '.join(email_data.get('to_emails', []))}
CC: {', '.join(email_data.get('cc_emails', []))}
Subject: {email_data.get('subject', '')}
Date: {email_data.get('date', '')}

ATTACHMENTS:
{json.dumps(email_data.get('attachments', []), indent=2)}

EMAIL BODY:
{body}
"""
        return email_text.strip()

    @staticmethod
    def _get_system_prompt() -> str:
        """Get the system prompt for AI extraction"""
        return """You are an expert email parser for the International Shellfish Restoration Society (ISRS). Your task is to extract structured data from emails.

Analyze the email and extract the following information in JSON format:

{
  "contacts": [
    {
      "name": "Full name",
      "email": "email@example.com",
      "organization": "Organization name (if mentioned)",
      "role": "Role or title (if mentioned)",
      "confidence": 85  // 0-100, confidence in this extraction
    }
  ],
  "action_items": [
    {
      "task": "Description of action item",
      "owner": "Person responsible (if mentioned)",
      "deadline": "YYYY-MM-DD or null",
      "priority": "high/medium/low or null"
    }
  ],
  "topics": ["keyword1", "keyword2"],  // Key topics, themes, or categories
  "overall_confidence": 85  // 0-100, overall confidence in all extractions
}

EXTRACTION RULES:
1. Contacts: Extract all people mentioned in the email
   - From/To/CC headers get 90-95% confidence automatically
   - People mentioned in body get confidence based on context (50-85%)
   - Include organization if mentioned nearby the person's name
   - Include role/title if explicitly stated

2. Action Items: Extract tasks, requests, or follow-ups
   - Look for phrases like "please...", "can you...", "need to...", "by [date]"
   - Extract deadlines in YYYY-MM-DD format when possible
   - Assign priority based on urgency indicators

3. Topics: Extract 3-10 relevant keywords
   - Focus on: organizations, projects, events, locations, research areas
   - Include: conference names, grant programs, species names, geographic locations

4. Confidence Scoring:
   - 90-100%: Explicitly stated in email headers or clear mentions
   - 70-89%: Strong context clues, likely correct
   - 50-69%: Some ambiguity, may need review
   - Below 50%: Uncertain, definitely needs review

5. Overall Confidence: Average of all individual confidences, adjusted down if:
   - Email is very short or vague
   - Multiple ambiguous extractions
   - Conflicting information

Return ONLY valid JSON, no additional text."""

    @staticmethod
    def _create_default_extraction(email_data: Dict[str, Any], error: str = None) -> Dict[str, Any]:
        """Create default extraction when AI fails"""
        # At minimum, extract contacts from headers with high confidence
        contacts = []

        # From address
        if email_data.get('from_email'):
            contacts.append({
                'name': email_data.get('from_name', ''),
                'email': email_data.get('from_email'),
                'organization': None,
                'role': None,
                'confidence': 95
            })

        # To addresses
        for email in email_data.get('to_emails', []):
            contacts.append({
                'name': '',
                'email': email,
                'organization': None,
                'role': None,
                'confidence': 90
            })

        # CC addresses
        for email in email_data.get('cc_emails', []):
            contacts.append({
                'name': '',
                'email': email,
                'organization': None,
                'role': None,
                'confidence': 90
            })

        return {
            'contacts': contacts,
            'action_items': [],
            'topics': [],
            'overall_confidence': 50,
            'error': error
        }
