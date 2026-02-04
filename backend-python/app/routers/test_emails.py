"""
Test email router - public endpoint for sending test emails
"""
from fastapi import APIRouter
from pydantic import BaseModel, EmailStr
import asyncio
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

router = APIRouter()


class SendTestEmailsRequest(BaseModel):
    """Request to send test emails"""
    email: EmailStr


@router.post("/send-all-test-emails")
async def send_all_test_emails(request: SendTestEmailsRequest):
    """
    Send all 9 email templates to the specified address for testing.
    
    This is a public endpoint for testing email templates.
    """
    from app.services.email_service import email_service
    
    test_email = request.email
    results = {}
    
    logger.info(f"Sending test emails to {test_email}")
    
    try:
        # 1. Magic Link Email
        results["magic_link"] = await email_service.send_magic_link(
            to_email=test_email,
            magic_link="https://www.shellfish-society.org/member/verify.html?token=TEST_TOKEN_123",
            first_name="Test User"
        )
        await asyncio.sleep(1)
        
        # 2. Welcome Email
        results["welcome"] = await email_service.send_welcome_email(
            to_email=test_email,
            first_name="Test User",
            magic_link="https://www.shellfish-society.org/member/verify.html?token=TEST_WELCOME_123"
        )
        await asyncio.sleep(1)
        
        # 3. Abstract Review Assignment
        results["review_assignment"] = await email_service.send_review_assignment_email(
            reviewer_email=test_email,
            abstract_title="Oyster Reef Restoration in Chesapeake Bay",
            due_date=datetime(2026, 3, 15)
        )
        await asyncio.sleep(1)
        
        # 4. Review Confirmation
        results["review_confirmation"] = await email_service.send_review_confirmation_email(
            reviewer_email=test_email,
            abstract_title="Oyster Reef Restoration in Chesapeake Bay"
        )
        await asyncio.sleep(1)
        
        # 5. Abstract Acceptance
        results["acceptance"] = await email_service.send_acceptance_email(
            author_email=test_email,
            author_name="Test User",
            abstract_title="Oyster Reef Restoration in Chesapeake Bay",
            presentation_type="Oral Presentation",
            conference_name="ICSR2026",
            conference_dates="October 5-8, 2026"
        )
        await asyncio.sleep(1)
        
        # 6. Abstract Rejection
        results["rejection"] = await email_service.send_rejection_email(
            author_email=test_email,
            author_name="Test User",
            abstract_title="Test Abstract for Rejection Email",
            conference_name="ICSR2026"
        )
        await asyncio.sleep(1)
        
        # 7. Event Signup
        results["event_signup"] = await email_service.send_event_signup_email(
            attendee_email=test_email,
            attendee_name="Test User",
            event_name="Puget Sound Field Trip",
            event_date=datetime(2026, 10, 6, 9, 0),
            event_time="9:00 AM - 4:00 PM",
            event_location="Little Creek Casino Resort, Shelton, WA"
        )
        await asyncio.sleep(1)
        
        # 8. Event Waitlist Promotion
        results["waitlist_promotion"] = await email_service.send_event_waitlist_promotion_email(
            attendee_email=test_email,
            attendee_name="Test User",
            event_name="Puget Sound Field Trip",
            event_date=datetime(2026, 10, 6, 9, 0),
            rsvp_link="https://www.shellfish-society.org/icsr2026.html#events"
        )
        await asyncio.sleep(1)
        
        # 9. Conference Registration
        results["conference_registration"] = await email_service.send_conference_registration_email(
            attendee_email=test_email,
            attendee_name="Test User",
            conference_name="ICSR2026 - Puget Sound, Washington",
            registration_type="Full Conference",
            total_amount=750.00,
            registration_id="REG-2026-001"
        )
        
        logger.info(f"Successfully sent all test emails to {test_email}")
        
        return {
            "success": True,
            "message": f"Sent 9 test emails to {test_email}",
            "email_types": [
                "Magic Link Login",
                "Welcome Email",
                "Abstract Review Assignment",
                "Review Confirmation",
                "Abstract Acceptance",
                "Abstract Rejection",
                "Event Signup Confirmation",
                "Event Waitlist Promotion",
                "Conference Registration"
            ],
            "results": results
        }
        
    except Exception as e:
        logger.error(f"Error sending test emails: {str(e)}")
        return {
            "success": False,
            "message": f"Error sending test emails: {str(e)}",
            "results": results
        }
