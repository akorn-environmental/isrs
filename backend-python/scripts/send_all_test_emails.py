#!/usr/bin/env python3
"""
Send all ISRS email templates to aaron.kornbluth@gmail.com for testing
"""
import sys
import os
import asyncio
from datetime import datetime, timedelta

# Add parent directory to path to import from app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.email_service import EmailService

TEST_EMAIL = "aaron.kornbluth@gmail.com"

async def send_all_test_emails():
    """Send all email templates as tests"""
    email_service = EmailService()

    print("=" * 80)
    print("ISRS EMAIL TEMPLATE TEST SUITE")
    print("=" * 80)
    print(f"Sending all email templates to: {TEST_EMAIL}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    print()

    results = []

    # 1. Magic Link Email
    print("1️⃣  Sending Magic Link Email...")
    try:
        success = await email_service.send_magic_link(
            to_email=TEST_EMAIL,
            magic_link="https://www.shellfish-society.org/member/login?token=TEST_TOKEN_123",
            first_name="Aaron"
        )
        results.append(("Magic Link", success))
        print(f"   {'✅ SUCCESS' if success else '❌ FAILED'}")
    except Exception as e:
        results.append(("Magic Link", False))
        print(f"   ❌ ERROR: {str(e)}")
    print()

    # 2. Welcome Email
    print("2️⃣  Sending Welcome Email...")
    try:
        success = await email_service.send_welcome_email(
            to_email=TEST_EMAIL,
            first_name="Aaron",
            profile_completion_url="https://www.shellfish-society.org/member/profile"
        )
        results.append(("Welcome Email", success))
        print(f"   {'✅ SUCCESS' if success else '❌ FAILED'}")
    except Exception as e:
        results.append(("Welcome Email", False))
        print(f"   ❌ ERROR: {str(e)}")
    print()

    # 3. Abstract Review Assignment
    print("3️⃣  Sending Abstract Review Assignment Email...")
    try:
        success = await email_service.send_review_assignment_email(
            to_email=TEST_EMAIL,
            reviewer_name="Dr. Aaron Kornbluth",
            abstract_title="Oyster Reef Restoration in the Chesapeake Bay: A 10-Year Study",
            abstract_authors="Sarah Chen, Marcus Thompson",
            abstract_text="This study examines the effectiveness of oyster reef restoration over a 10-year period...",
            review_url="https://www.shellfish-society.org/admin/reviews/123",
            due_date=datetime.now() + timedelta(days=14)
        )
        results.append(("Abstract Review Assignment", success))
        print(f"   {'✅ SUCCESS' if success else '❌ FAILED'}")
    except Exception as e:
        results.append(("Abstract Review Assignment", False))
        print(f"   ❌ ERROR: {str(e)}")
    print()

    # 4. Review Confirmation
    print("4️⃣  Sending Review Confirmation Email...")
    try:
        success = await email_service.send_review_confirmation_email(
            to_email=TEST_EMAIL,
            reviewer_name="Dr. Aaron Kornbluth",
            abstract_title="Oyster Reef Restoration in the Chesapeake Bay: A 10-Year Study"
        )
        results.append(("Review Confirmation", success))
        print(f"   {'✅ SUCCESS' if success else '❌ FAILED'}")
    except Exception as e:
        results.append(("Review Confirmation", False))
        print(f"   ❌ ERROR: {str(e)}")
    print()

    # 5. Abstract Acceptance (Oral Presentation)
    print("5️⃣  Sending Abstract Acceptance Email (Oral)...")
    try:
        success = await email_service.send_acceptance_email(
            to_email=TEST_EMAIL,
            first_name="Aaron",
            abstract_title="Oyster Reef Restoration in the Chesapeake Bay: A 10-Year Study",
            presentation_type="oral",
            session_info="Thursday, October 6, 2:00 PM - Session 3: Restoration Techniques"
        )
        results.append(("Abstract Acceptance (Oral)", success))
        print(f"   {'✅ SUCCESS' if success else '❌ FAILED'}")
    except Exception as e:
        results.append(("Abstract Acceptance (Oral)", False))
        print(f"   ❌ ERROR: {str(e)}")
    print()

    # 6. Abstract Acceptance (Poster)
    print("6️⃣  Sending Abstract Acceptance Email (Poster)...")
    try:
        success = await email_service.send_acceptance_email(
            to_email=TEST_EMAIL,
            first_name="Aaron",
            abstract_title="Community Engagement in Urban Shellfish Restoration",
            presentation_type="poster",
            session_info="Tuesday, October 4, 5:00 PM - Poster Session A"
        )
        results.append(("Abstract Acceptance (Poster)", success))
        print(f"   {'✅ SUCCESS' if success else '❌ FAILED'}")
    except Exception as e:
        results.append(("Abstract Acceptance (Poster)", False))
        print(f"   ❌ ERROR: {str(e)}")
    print()

    # 7. Abstract Rejection
    print("7️⃣  Sending Abstract Rejection Email...")
    try:
        success = await email_service.send_rejection_email(
            to_email=TEST_EMAIL,
            first_name="Aaron",
            abstract_title="Test Abstract for Quality Assurance",
            feedback="Thank you for your submission. While the topic is interesting, the abstract would benefit from more detailed methodology and results. We encourage you to resubmit for future conferences."
        )
        results.append(("Abstract Rejection", success))
        print(f"   {'✅ SUCCESS' if success else '❌ FAILED'}")
    except Exception as e:
        results.append(("Abstract Rejection", False))
        print(f"   ❌ ERROR: {str(e)}")
    print()

    # 8. Event Signup Confirmation
    print("8️⃣  Sending Event Signup Confirmation Email...")
    try:
        success = await email_service.send_event_signup_email(
            to_email=TEST_EMAIL,
            first_name="Aaron",
            event_name="Shellfish Restoration Field Trip - Squaxin Island",
            event_date=datetime(2026, 10, 4, 9, 0),
            event_location="Little Creek Casino Resort, Shelton, WA",
            status="confirmed"
        )
        results.append(("Event Signup (Confirmed)", success))
        print(f"   {'✅ SUCCESS' if success else '❌ FAILED'}")
    except Exception as e:
        results.append(("Event Signup (Confirmed)", False))
        print(f"   ❌ ERROR: {str(e)}")
    print()

    # 9. Event Waitlist
    print("9️⃣  Sending Event Waitlist Email...")
    try:
        success = await email_service.send_event_signup_email(
            to_email=TEST_EMAIL,
            first_name="Aaron",
            event_name="Golf Tournament - Salish Cliffs Golf Club",
            event_date=datetime(2026, 10, 5, 8, 0),
            event_location="Salish Cliffs Golf Club, Shelton, WA",
            status="waitlist"
        )
        results.append(("Event Waitlist", success))
        print(f"   {'✅ SUCCESS' if success else '❌ FAILED'}")
    except Exception as e:
        results.append(("Event Waitlist", False))
        print(f"   ❌ ERROR: {str(e)}")
    print()

    # 10. Waitlist Promotion
    print("🔟 Sending Waitlist Promotion Email...")
    try:
        success = await email_service.send_event_waitlist_promotion_email(
            to_email=TEST_EMAIL,
            first_name="Aaron",
            event_name="Golf Tournament - Salish Cliffs Golf Club",
            event_date=datetime(2026, 10, 5, 8, 0),
            event_location="Salish Cliffs Golf Club, Shelton, WA",
            confirmation_url="https://www.shellfish-society.org/events/confirm/456"
        )
        results.append(("Waitlist Promotion", success))
        print(f"   {'✅ SUCCESS' if success else '❌ FAILED'}")
    except Exception as e:
        results.append(("Waitlist Promotion", False))
        print(f"   ❌ ERROR: {str(e)}")
    print()

    # 11. Conference Registration
    print("1️⃣1️⃣  Sending Conference Registration Email...")
    try:
        success = await email_service.send_conference_registration_email(
            to_email=TEST_EMAIL,
            first_name="Aaron",
            last_name="Kornbluth",
            conference_name="ICSR 2026",
            registration_type="Full Conference - Professional",
            confirmation_number="ICSR2026-001234",
            amount_paid=495.00,
            payment_date=datetime.now()
        )
        results.append(("Conference Registration", success))
        print(f"   {'✅ SUCCESS' if success else '❌ FAILED'}")
    except Exception as e:
        results.append(("Conference Registration", False))
        print(f"   ❌ ERROR: {str(e)}")
    print()

    # 12. ISRS Donation Request
    print("1️⃣2️⃣  Sending ISRS Donation Request Email...")
    try:
        success = await email_service.send_donation_request_isrs(
            to_email=TEST_EMAIL,
            first_name="Aaron",
            last_name="Kornbluth",
            previous_donation_amount=250.00,
            previous_donation_date=datetime(2025, 6, 15)
        )
        results.append(("ISRS Donation Request", success))
        print(f"   {'✅ SUCCESS' if success else '❌ FAILED'}")
    except Exception as e:
        results.append(("ISRS Donation Request", False))
        print(f"   ❌ ERROR: {str(e)}")
    print()

    # 13. ICSR2026 Donation Request
    print("1️⃣3️⃣  Sending ICSR2026 Donation Request Email...")
    try:
        success = await email_service.send_donation_request_icsr2026(
            to_email=TEST_EMAIL,
            first_name="Aaron",
            last_name="Kornbluth",
            icsr2024_attended=True,
            icsr2024_sponsor_level="Silver"
        )
        results.append(("ICSR2026 Donation Request", success))
        print(f"   {'✅ SUCCESS' if success else '❌ FAILED'}")
    except Exception as e:
        results.append(("ICSR2026 Donation Request", False))
        print(f"   ❌ ERROR: {str(e)}")
    print()

    # 14. Speaker Invitation
    print("1️⃣4️⃣  Sending Speaker Invitation Email...")
    try:
        success = await email_service.send_speaker_invitation(
            to_email=TEST_EMAIL,
            first_name="Aaron",
            last_name="Kornbluth",
            session_type="keynote",
            session_topic="The Future of Shellfish Restoration: Technology and Community Engagement",
            icsr2024_presented=True,
            icsr2024_presentation_titles=["Urban Oyster Reef Restoration"]
        )
        results.append(("Speaker Invitation", success))
        print(f"   {'✅ SUCCESS' if success else '❌ FAILED'}")
    except Exception as e:
        results.append(("Speaker Invitation", False))
        print(f"   ❌ ERROR: {str(e)}")
    print()

    # 15. Poster Presenter Invitation
    print("1️⃣5️⃣  Sending Poster Presenter Invitation Email...")
    try:
        success = await email_service.send_poster_presenter_invitation(
            to_email=TEST_EMAIL,
            first_name="Aaron",
            last_name="Kornbluth",
            icsr2024_poster=True,
            icsr2024_poster_title="Community-Based Shellfish Aquaculture in Pacific Northwest"
        )
        results.append(("Poster Presenter Invitation", success))
        print(f"   {'✅ SUCCESS' if success else '❌ FAILED'}")
    except Exception as e:
        results.append(("Poster Presenter Invitation", False))
        print(f"   ❌ ERROR: {str(e)}")
    print()

    # 16. Student Invitation
    print("1️⃣6️⃣  Sending Student Invitation Email...")
    try:
        success = await email_service.send_student_invitation(
            to_email=TEST_EMAIL,
            first_name="Aaron",
            last_name="Kornbluth",
            university="University of Washington",
            icsr2024_attended=True
        )
        results.append(("Student Invitation", success))
        print(f"   {'✅ SUCCESS' if success else '❌ FAILED'}")
    except Exception as e:
        results.append(("Student Invitation", False))
        print(f"   ❌ ERROR: {str(e)}")
    print()

    # 17. Exhibitor Invitation
    print("1️⃣7️⃣  Sending Exhibitor Invitation Email...")
    try:
        success = await email_service.send_exhibitor_invitation(
            to_email=TEST_EMAIL,
            company_name="Akorn Environmental Consulting",
            contact_first_name="Aaron",
            contact_last_name="Kornbluth",
            icsr2024_exhibitor=True,
            expected_attendance=300
        )
        results.append(("Exhibitor Invitation", success))
        print(f"   {'✅ SUCCESS' if success else '❌ FAILED'}")
    except Exception as e:
        results.append(("Exhibitor Invitation", False))
        print(f"   ❌ ERROR: {str(e)}")
    print()

    # Print Summary
    print()
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    successful = sum(1 for _, success in results if success)
    failed = len(results) - successful

    for name, success in results:
        status = "✅ SENT" if success else "❌ FAILED"
        print(f"{status} - {name}")

    print()
    print(f"Total: {len(results)} email templates")
    print(f"✅ Successful: {successful}")
    print(f"❌ Failed: {failed}")
    print()
    print(f"📧 Check your inbox at {TEST_EMAIL}")
    print("=" * 80)

if __name__ == "__main__":
    asyncio.run(send_all_test_emails())
