#!/usr/bin/env python3
"""
Quick test script to send one magic link email to aaron.kornbluth@gmail.com
Run this on Render to test AWS SES email functionality.
"""
import sys
import os
import asyncio
from datetime import datetime

# Add parent directory to path to import from app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.email_service import EmailService

async def main():
    """Send a single test email"""
    email_service = EmailService()

    print("=" * 80)
    print("ISRS EMAIL TEST - Single Magic Link")
    print("=" * 80)
    print(f"To: aaron.kornbluth@gmail.com")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Email Service: {email_service.email_service}")
    print("=" * 80)
    print()

    print("Sending magic link email...")
    try:
        success = await email_service.send_magic_link(
            to_email="aaron.kornbluth@gmail.com",
            magic_link="https://www.shellfish-society.org/member/login?token=TEST_TOKEN_FROM_SCRIPT",
            first_name="Aaron"
        )

        if success:
            print("✅ SUCCESS! Email sent to aaron.kornbluth@gmail.com")
            print()
            print("Check your inbox for:")
            print("  Subject: ISRS - Your Login Link is Ready 🦪")
            print("  From: noreply@shellfish-society.org")
            print()
        else:
            print("❌ FAILED to send email")
            print("Check logs for error details")

    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()

    print("=" * 80)

if __name__ == "__main__":
    asyncio.run(main())
