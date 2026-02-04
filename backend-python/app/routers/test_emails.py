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


class SendCommitteeTestEmailsRequest(BaseModel):
    """Request to send test emails to committee members"""
    add_test_prefix: bool = True


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
            submitter_email=test_email,
            abstract_title="Oyster Reef Restoration in Chesapeake Bay",
            presentation_type="Oral Presentation",
            average_score=4.2
        )
        await asyncio.sleep(1)
        
        # 6. Abstract Rejection
        results["rejection"] = await email_service.send_rejection_email(
            submitter_email=test_email,
            abstract_title="Test Abstract for Rejection Email",
            feedback_summary="Thank you for your submission. Unfortunately, we are unable to accept your abstract at this time."
        )
        await asyncio.sleep(1)
        
        # 7. Event Signup
        results["event_signup"] = await email_service.send_event_signup_email(
            user_email=test_email,
            event_name="Puget Sound Field Trip",
            event_date=datetime(2026, 10, 6, 9, 0),
            guest_count=2,
            total_fee=50.00,
            status="confirmed"
        )
        await asyncio.sleep(1)
        
        # 8. Event Waitlist Promotion
        results["waitlist_promotion"] = await email_service.send_event_waitlist_promotion_email(
            user_email=test_email,
            event_name="Puget Sound Field Trip",
            event_date=datetime(2026, 10, 6, 9, 0),
            guest_count=2,
            total_fee=50.00
        )
        await asyncio.sleep(1)
        
        # 9. Conference Registration
        results["conference_registration"] = await email_service.send_conference_registration_email(
            user_email=test_email,
            first_name="Test User",
            conference_name="ICSR2026 - Puget Sound, Washington",
            registration_type="Full Conference",
            registration_date=datetime.now(),
            total_fee=750.00,
            confirmation_number="REG-2026-001"
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


@router.post("/send-committee-test-emails")
async def send_committee_test_emails(request: SendCommitteeTestEmailsRequest):
    """
    Send all 9 email templates to ICSR2026 planning committee members.
    Prepends "TEST: FOR YOUR REVIEW - " to all subject lines.
    """
    from app.services.email_service import email_service

    # ICSR2026 Planning Committee email addresses
    committee_emails = [
        "betsy@restorationfund.org",
        "aaron.kornbluth@gmail.com",
        "vbarry@suquamish.nsn.us",
        "billt@taylorshellfish.com",
        "elsa@restorationfund.org",
        "ryan@restorationfund.org",
        "lisa.paton@gmail.com",
        "kerstin.wasson@gmail.com",
        "phoebe.racine@tnc.org",
        "julieta.martinelli@dfw.wa.gov"
    ]

    logger.info(f"Sending test emails to {len(committee_emails)} committee members")

    # Temporarily modify email service to add TEST prefix
    original_send = email_service.send_email

    async def send_with_test_prefix(to_email, subject, html_content, text_content):
        if request.add_test_prefix:
            subject = f"TEST: FOR YOUR REVIEW - {subject}"
        return await original_send(to_email, subject, html_content, text_content)

    email_service.send_email = send_with_test_prefix

    try:
        all_results = {}

        for email in committee_emails:
            results = {}
            logger.info(f"Sending to {email}")

            try:
                # 1. Magic Link Email
                results["magic_link"] = await email_service.send_magic_link(
                    to_email=email,
                    magic_link="https://www.shellfish-society.org/member/verify.html?token=TEST_TOKEN_123",
                    first_name="Test User"
                )
                await asyncio.sleep(0.5)

                # 2. Welcome Email
                results["welcome"] = await email_service.send_welcome_email(
                    to_email=email,
                    first_name="Test User",
                    magic_link="https://www.shellfish-society.org/member/verify.html?token=TEST_WELCOME_123"
                )
                await asyncio.sleep(0.5)

                # 3. Abstract Review Assignment
                results["review_assignment"] = await email_service.send_review_assignment_email(
                    reviewer_email=email,
                    abstract_title="Oyster Reef Restoration in Chesapeake Bay",
                    due_date=datetime(2026, 3, 15)
                )
                await asyncio.sleep(0.5)

                # 4. Review Confirmation
                results["review_confirmation"] = await email_service.send_review_confirmation_email(
                    reviewer_email=email,
                    abstract_title="Oyster Reef Restoration in Chesapeake Bay"
                )
                await asyncio.sleep(0.5)

                # 5. Abstract Acceptance
                results["acceptance"] = await email_service.send_acceptance_email(
                    submitter_email=email,
                    abstract_title="Oyster Reef Restoration in Chesapeake Bay",
                    presentation_type="Oral Presentation",
                    average_score=4.2
                )
                await asyncio.sleep(0.5)

                # 6. Abstract Rejection
                results["rejection"] = await email_service.send_rejection_email(
                    submitter_email=email,
                    abstract_title="Test Abstract for Rejection Email",
                    feedback_summary="Thank you for your submission. Unfortunately, we are unable to accept your abstract at this time."
                )
                await asyncio.sleep(0.5)

                # 7. Event Signup
                results["event_signup"] = await email_service.send_event_signup_email(
                    user_email=email,
                    event_name="Puget Sound Field Trip",
                    event_date=datetime(2026, 10, 6, 9, 0),
                    guest_count=2,
                    total_fee=50.00,
                    status="confirmed"
                )
                await asyncio.sleep(0.5)

                # 8. Event Waitlist Promotion
                results["waitlist_promotion"] = await email_service.send_event_waitlist_promotion_email(
                    user_email=email,
                    event_name="Puget Sound Field Trip",
                    event_date=datetime(2026, 10, 6, 9, 0),
                    guest_count=2,
                    total_fee=50.00
                )
                await asyncio.sleep(0.5)

                # 9. Conference Registration
                results["conference_registration"] = await email_service.send_conference_registration_email(
                    user_email=email,
                    first_name="Test User",
                    conference_name="ICSR2026 - Puget Sound, Washington",
                    registration_type="Full Conference",
                    registration_date=datetime.now(),
                    total_fee=750.00,
                    confirmation_number="REG-2026-001"
                )

                all_results[email] = {"success": True, "results": results}
                await asyncio.sleep(1)  # Brief pause between recipients

            except Exception as e:
                logger.error(f"Error sending test emails to {email}: {str(e)}")
                all_results[email] = {"success": False, "error": str(e), "results": results}

        # Restore original send method
        email_service.send_email = original_send

        logger.info(f"Successfully sent test emails to committee members")

        return {
            "success": True,
            "message": f"Sent 9 test emails to {len(committee_emails)} committee members",
            "recipients": committee_emails,
            "results": all_results
        }

    except Exception as e:
        # Restore original send method
        email_service.send_email = original_send
        logger.error(f"Error in committee email send: {str(e)}")
        return {
            "success": False,
            "message": f"Error sending committee test emails: {str(e)}",
            "results": all_results
        }
