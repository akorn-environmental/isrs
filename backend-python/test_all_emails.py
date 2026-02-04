#!/usr/bin/env python3
"""
Test script to send all email templates to aaron.kornbluth@gmail.com
"""
import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app.services.email_service import email_service


async def send_all_test_emails():
    """Send all email templates for testing"""
    test_email = "aaron.kornbluth@gmail.com"

    print("🚀 Sending all email templates to aaron.kornbluth@gmail.com\n")

    # 1. Magic Link Email
    print("1️⃣  Sending Magic Link Email...")
    result1 = await email_service.send_magic_link(
        to_email=test_email,
        magic_link="https://www.shellfish-society.org/member/verify.html?token=TEST_TOKEN_123",
        first_name="Aaron"
    )
    print(f"   ✅ Sent" if result1 else "   ❌ Failed")
    await asyncio.sleep(2)

    # 2. Welcome Email
    print("2️⃣  Sending Welcome Email...")
    result2 = await email_service.send_welcome_email(
        to_email=test_email,
        first_name="Aaron",
        magic_link="https://www.shellfish-society.org/member/verify.html?token=TEST_WELCOME_123"
    )
    print(f"   ✅ Sent" if result2 else "   ❌ Failed")
    await asyncio.sleep(2)

    # 3. Abstract Review Assignment Email
    print("3️⃣  Sending Abstract Review Assignment Email...")
    result3 = await email_service.send_review_assignment_email(
        reviewer_email=test_email,
        abstract_title="Oyster Reef Restoration in Chesapeake Bay",
        submission_id=12345,
        due_date="March 15, 2026",
        review_link="https://www.shellfish-society.org/admin/abstracts.html?review=12345"
    )
    print(f"   ✅ Sent" if result3 else "   ❌ Failed")
    await asyncio.sleep(2)

    # 4. Review Confirmation Email
    print("4️⃣  Sending Review Confirmation Email...")
    result4 = await email_service.send_review_confirmation_email(
        reviewer_email=test_email,
        abstract_title="Oyster Reef Restoration in Chesapeake Bay"
    )
    print(f"   ✅ Sent" if result4 else "   ❌ Failed")
    await asyncio.sleep(2)

    # 5. Abstract Acceptance Email
    print("5️⃣  Sending Abstract Acceptance Email...")
    result5 = await email_service.send_acceptance_email(
        author_email=test_email,
        author_name="Aaron Kornbluth",
        abstract_title="Oyster Reef Restoration in Chesapeake Bay",
        presentation_type="Oral Presentation",
        conference_name="ICSR2026",
        conference_dates="October 5-8, 2026"
    )
    print(f"   ✅ Sent" if result5 else "   ❌ Failed")
    await asyncio.sleep(2)

    # 6. Abstract Rejection Email
    print("6️⃣  Sending Abstract Rejection Email...")
    result6 = await email_service.send_rejection_email(
        author_email=test_email,
        author_name="Aaron Kornbluth",
        abstract_title="Test Abstract for Rejection Email",
        conference_name="ICSR2026"
    )
    print(f"   ✅ Sent" if result6 else "   ❌ Failed")
    await asyncio.sleep(2)

    # 7. Event Signup Confirmation Email
    print("7️⃣  Sending Event Signup Confirmation Email...")
    result7 = await email_service.send_event_signup_email(
        attendee_email=test_email,
        attendee_name="Aaron Kornbluth",
        event_name="Puget Sound Field Trip",
        event_date="October 6, 2026",
        event_time="9:00 AM - 4:00 PM",
        event_location="Little Creek Casino Resort, Shelton, WA"
    )
    print(f"   ✅ Sent" if result7 else "   ❌ Failed")
    await asyncio.sleep(2)

    # 8. Event Waitlist Promotion Email
    print("8️⃣  Sending Event Waitlist Promotion Email...")
    result8 = await email_service.send_event_waitlist_promotion_email(
        attendee_email=test_email,
        attendee_name="Aaron Kornbluth",
        event_name="Puget Sound Field Trip",
        event_date="October 6, 2026",
        rsvp_link="https://www.shellfish-society.org/icsr2026.html#events"
    )
    print(f"   ✅ Sent" if result8 else "   ❌ Failed")
    await asyncio.sleep(2)

    # 9. Conference Registration Email
    print("9️⃣  Sending Conference Registration Email...")
    result9 = await email_service.send_conference_registration_email(
        attendee_email=test_email,
        attendee_name="Aaron Kornbluth",
        conference_name="ICSR2026 - Puget Sound, Washington",
        registration_type="Full Conference",
        total_amount=750.00,
        registration_id="REG-2026-001"
    )
    print(f"   ✅ Sent" if result9 else "   ❌ Failed")

    print("\n" + "="*60)
    print("✅ All email templates sent!")
    print("📬 Check your inbox: aaron.kornbluth@gmail.com")
    print("="*60)


if __name__ == "__main__":
    asyncio.run(send_all_test_emails())
