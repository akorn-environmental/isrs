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
  "email_type": "board_vote|meeting_minutes|funding_opportunity|abstract_submission|partnership|grant_progress|contact_info|general",
  "contacts": [
    {
      "name": "Full name",
      "email": "email@example.com",
      "organization": "Organization name (if mentioned)",
      "role": "Role or title (if mentioned)",
      "confidence": 85
    }
  ],
  "action_items": [
    {
      "task": "Description of action item",
      "owner": "Person responsible (if mentioned)",
      "deadline": "YYYY-MM-DD or null",
      "priority": "high|medium|low|null"
    }
  ],
  "topics": ["keyword1", "keyword2"],
  "board_vote": {
    "motion_title": "Budget approval for Q2 2025",
    "motion_description": "Approve operating budget of $125,000 for Q2 2025",
    "vote_date": "2025-01-15",
    "vote_method": "email|meeting|survey|unanimous",
    "yes_count": 8,
    "no_count": 1,
    "abstain_count": 0,
    "total_votes": 9,
    "quorum_met": true,
    "result": "passed|failed|pending",
    "confidence": 85
  },
  "meeting_info": {
    "meeting_date": "2025-01-15",
    "meeting_type": "Board Meeting|Executive Committee|Special Meeting|Annual Meeting",
    "attendees": ["John Doe", "Jane Smith"],
    "decisions": ["Approved budget", "Postponed venue decision"],
    "notes": "General meeting summary",
    "confidence": 80
  },
  "funding_info": {
    "funder_name": "National Science Foundation",
    "program_name": "Ocean Sciences Research",
    "amount": "$500,000",
    "amount_numeric": 500000,
    "deadline": "2025-03-15",
    "url": "https://nsf.gov/funding/...",
    "description": "Funding for coastal restoration research",
    "eligibility": "3-year project, academic partnership required",
    "confidence": 75
  },
  "abstract_info": {
    "title": "Restoration of Oyster Reefs in Chesapeake Bay",
    "authors": ["Dr. John Smith", "Dr. Jane Doe"],
    "abstract_text": "Full abstract text...",
    "keywords": ["oyster", "restoration", "Chesapeake Bay"],
    "submission_date": "2025-02-01",
    "conference_name": "ICSR 2025",
    "confidence": 90
  },
  "partnership_info": {
    "partner_organization": "NOAA Fisheries",
    "project_name": "Coastal Habitat Restoration Initiative",
    "contact_person": "Dr. Smith",
    "scope": "Multi-year partnership for habitat monitoring",
    "timeline": "2025-2028",
    "confidence": 70
  },
  "grant_progress": {
    "grant_name": "NSF Coastal Ecosystems Award #12345",
    "milestone": "Year 2 Progress Report",
    "completion_percentage": 65,
    "next_deadline": "2025-04-01",
    "deliverable": "Annual report and data submission",
    "confidence": 80
  },
  "overall_confidence": 85
}

EXTRACTION RULES:

1. Email Type Detection (REQUIRED):
   - "board_vote": Contains vote tallies, motions, voting results
   - "meeting_minutes": Contains meeting notes, attendees, decisions
   - "funding_opportunity": Grant announcements, RFPs, funding deadlines
   - "abstract_submission": Conference abstract submissions or calls
   - "partnership": MOU discussions, collaboration proposals
   - "grant_progress": Grant milestone updates, progress reports
   - "contact_info": Primarily contact information sharing
   - "general": Default if no specific type matches

2. Contacts: Extract all people mentioned
   - From/To/CC headers: 90-95% confidence
   - Body mentions: 50-85% confidence based on context
   - Include organization and role if mentioned

3. Action Items: Extract tasks and follow-ups
   - Look for: "please...", "can you...", "need to...", "by [date]"
   - Extract deadlines in YYYY-MM-DD format
   - Assign priority based on urgency

4. Topics: Extract 3-10 relevant keywords
   - Organizations, projects, events, locations, research areas
   - Conference names, grant programs, species, geographic locations

5. Board Vote (only if email_type is "board_vote"):
   - Extract motion title and description
   - Count votes: yes/no/abstain
   - Determine if quorum was met
   - Result: passed/failed/pending
   - Vote method: email, meeting, survey, unanimous

6. Meeting Info (only if email_type is "meeting_minutes"):
   - Extract meeting date and type
   - List all attendees mentioned
   - Extract key decisions made
   - Capture general notes/summary

7. Funding Info (only if email_type is "funding_opportunity"):
   - Funder name and program
   - Amount (both text "$500K" and numeric 500000)
   - Application deadline
   - URL to application
   - Eligibility requirements

8. Abstract Info (only if email_type is "abstract_submission"):
   - Paper/presentation title
   - All authors listed
   - Full abstract text
   - Keywords/topics
   - Conference name

9. Partnership Info (only if email_type is "partnership"):
   - Partner organization name
   - Project or initiative name
   - Key contact person
   - Scope and timeline

10. Grant Progress (only if email_type is "grant_progress"):
    - Grant name/number
    - Current milestone
    - Completion percentage if mentioned
    - Next deadline
    - Upcoming deliverable

11. Confidence Scoring:
    - 90-100%: Explicitly stated, clear evidence
    - 70-89%: Strong context clues
    - 50-69%: Some ambiguity
    - <50%: Uncertain, needs review

12. Overall Confidence: Average of all confidences, adjusted for:
    - Email clarity and completeness
    - Ambiguous or conflicting information
    - Missing key details

IMPORTANT:
- Always include email_type
- Only include specialized objects (board_vote, meeting_info, etc.) if that email_type is detected
- Return ONLY valid JSON, no additional text
- Use null for missing optional fields"""

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
            'email_type': 'general',
            'contacts': contacts,
            'action_items': [],
            'topics': [],
            'overall_confidence': 50,
            'error': error
        }
