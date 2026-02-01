from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, List, Any
import anthropic
import os
from ..database import get_db
from ..dependencies.auth import get_current_user
from ..models.user import User

router = APIRouter(prefix="/api/ai", tags=["ai"])

class AIQueryRequest(BaseModel):
    query: str
    mode: Optional[str] = "admin"

class AIQueryResponse(BaseModel):
    type: str
    title: str
    content: str
    items: Optional[List[Dict[str, Any]]] = None
    metrics: Optional[Dict[str, Any]] = None
    insight: Optional[str] = None

async def get_database_context(db: Session) -> Dict[str, Any]:
    """Gather database statistics for AI context"""

    context = {}

    try:
        # Contact statistics
        from ..models.contact import Contact
        total_contacts = db.query(Contact).count()
        contacts_with_email = db.query(Contact).filter(Contact.email.isnot(None)).count()

        context["contacts"] = {
            "total": total_contacts,
            "with_email": contacts_with_email
        }

        # Conference registrations (ICSR2026)
        from ..models.conference import ConferenceRegistration
        total_registrations = db.query(ConferenceRegistration).filter(
            ConferenceRegistration.conference_id == "ICSR2026"
        ).count()

        full_registrations = db.query(ConferenceRegistration).filter(
            ConferenceRegistration.conference_id == "ICSR2026",
            ConferenceRegistration.registration_type == "full"
        ).count()

        student_registrations = db.query(ConferenceRegistration).filter(
            ConferenceRegistration.conference_id == "ICSR2026",
            ConferenceRegistration.registration_type == "student"
        ).count()

        daily_registrations = db.query(ConferenceRegistration).filter(
            ConferenceRegistration.conference_id == "ICSR2026",
            ConferenceRegistration.registration_type == "daily"
        ).count()

        context["icsr2026_registrations"] = {
            "total": total_registrations,
            "full": full_registrations,
            "student": student_registrations,
            "daily": daily_registrations
        }

        # Abstract submissions
        from ..models.conference import Abstract
        total_abstracts = db.query(Abstract).filter(
            Abstract.conference_id == "ICSR2026"
        ).count()

        accepted_abstracts = db.query(Abstract).filter(
            Abstract.conference_id == "ICSR2026",
            Abstract.status == "accepted"
        ).count()

        pending_abstracts = db.query(Abstract).filter(
            Abstract.conference_id == "ICSR2026",
            Abstract.status == "pending"
        ).count()

        oral_presentations = db.query(Abstract).filter(
            Abstract.conference_id == "ICSR2026",
            Abstract.presentation_type == "oral"
        ).count()

        poster_presentations = db.query(Abstract).filter(
            Abstract.conference_id == "ICSR2026",
            Abstract.presentation_type == "poster"
        ).count()

        context["icsr2026_abstracts"] = {
            "total": total_abstracts,
            "accepted": accepted_abstracts,
            "pending": pending_abstracts,
            "oral": oral_presentations,
            "poster": poster_presentations
        }

        # Board members
        board_members = db.query(User).filter(User.role == "board_member").count()
        context["board_members"] = board_members

    except Exception as e:
        print(f"Error gathering database context: {e}")
        context["error"] = str(e)

    return context

@router.post("/query", response_model=AIQueryResponse)
async def query_ai(
    request: AIQueryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Process AI query and return formatted response
    """

    # Check if Anthropic API key is configured
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AI service not configured"
        )

    try:
        # Get database context
        db_context = await get_database_context(db)

        # Build system prompt with database context
        system_prompt = f"""You are an AI assistant for the International Shellfish Restoration Society (ISRS).

ISRS Overview:
- Founded in 2015 to advance shellfish restoration globally
- Mission: Promote science-based shellfish restoration and reef rehabilitation
- Focus areas: Oyster, clam, mussel, and scallop restoration projects

ICSR2026 Conference:
- Dates: October 4-8, 2026
- Location: Little Creek Casino Resort, Shelton, Washington
- Theme: "Advancing Shellfish Restoration Science and Practice"
- Registration: https://www.shellfish-society.org/icsr2026

Current Database Statistics:
- Total contacts: {db_context.get('contacts', {}).get('total', 'N/A')}
- Contacts with email: {db_context.get('contacts', {}).get('with_email', 'N/A')}
- ICSR2026 registrations: {db_context.get('icsr2026_registrations', {}).get('total', 'N/A')}
  - Full: {db_context.get('icsr2026_registrations', {}).get('full', 'N/A')}
  - Student: {db_context.get('icsr2026_registrations', {}).get('student', 'N/A')}
  - Daily: {db_context.get('icsr2026_registrations', {}).get('daily', 'N/A')}
- Abstract submissions: {db_context.get('icsr2026_abstracts', {}).get('total', 'N/A')}
  - Accepted: {db_context.get('icsr2026_abstracts', {}).get('accepted', 'N/A')}
  - Pending: {db_context.get('icsr2026_abstracts', {}).get('pending', 'N/A')}
  - Oral presentations: {db_context.get('icsr2026_abstracts', {}).get('oral', 'N/A')}
  - Poster presentations: {db_context.get('icsr2026_abstracts', {}).get('poster', 'N/A')}
- Board members: {db_context.get('board_members', 'N/A')}

Mode: {request.mode}

Respond to queries about ISRS, conferences, contacts, funding, and organizational data.
Format responses as JSON with these fields:
- type: "metrics", "data-list", "info", "data-summary", or "analysis"
- title: Brief title for the response
- content: Main response text
- items: Optional array of data items (for data-list type)
- metrics: Optional object with key-value pairs (for metrics type)
- insight: Optional insight or recommendation

Be concise, helpful, and data-driven."""

        # Call Anthropic API
        client = anthropic.Anthropic(api_key=api_key)

        message = client.messages.create(
            model=os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-5-20250929"),
            max_tokens=3000,
            system=system_prompt,
            messages=[
                {
                    "role": "user",
                    "content": request.query
                }
            ]
        )

        # Parse response
        response_text = message.content[0].text

        # Try to parse as JSON first
        import json
        try:
            response_data = json.loads(response_text)
            return AIQueryResponse(**response_data)
        except json.JSONDecodeError:
            # If not JSON, return as info response
            return AIQueryResponse(
                type="info",
                title="AI Response",
                content=response_text
            )

    except anthropic.APIError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI service error: {str(e)}"
        )
    except Exception as e:
        print(f"AI query error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process query: {str(e)}"
        )
