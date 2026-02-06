#!/usr/bin/env python3
"""
Send ICSR2026 Save the Date email - Interactive version
Prompts for AWS credentials if not found in environment
"""
import sys
import os
import asyncio
from datetime import datetime
from getpass import getpass

# Add parent directory to path to import from app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

async def main():
    """Send ICSR2026 Save the Date email"""

    print("=" * 80)
    print("ICSR 2026 - SAVE THE DATE EMAIL SENDER")
    print("=" * 80)
    print()

    # Check for AWS credentials
    aws_access_key = os.getenv('AWS_ACCESS_KEY_ID')
    aws_secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')
    aws_region = os.getenv('AWS_REGION', 'us-east-1')

    if not aws_access_key or not aws_secret_key:
        print("⚠️  AWS credentials not found in environment")
        print()
        print("Please enter your AWS credentials from Render dashboard:")
        print("(Go to Render → Environment → Click to reveal each value)")
        print()

        aws_access_key = input("AWS_ACCESS_KEY_ID: ").strip()
        aws_secret_key = getpass("AWS_SECRET_ACCESS_KEY (hidden): ").strip()
        aws_region = input(f"AWS_REGION [{aws_region}]: ").strip() or aws_region

        # Set in environment for this session
        os.environ['AWS_ACCESS_KEY_ID'] = aws_access_key
        os.environ['AWS_SECRET_ACCESS_KEY'] = aws_secret_key
        os.environ['AWS_REGION'] = aws_region
        os.environ['EMAIL_SERVICE'] = 'ses'

        print()
        print("✅ Credentials set for this session")
        print()

    # Import after setting credentials
    from app.services.email_service import EmailService

    email_service = EmailService()

    print("=" * 80)
    print("EMAIL CONFIGURATION")
    print("=" * 80)
    print(f"To: aaron.kornbluth@gmail.com")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Email Service: {email_service.email_service}")
    print(f"AWS Region: {aws_region}")
    print("=" * 80)
    print()

    # Email content
    subject = "ICSR 2026 - Save the Date: October 4-8, Washington State 🦪"

    html_content = """
    <h2 style="color: #2c5f2d; margin-bottom: 1rem;">🗓️ Save the Date</h2>

    <div style="background: linear-gradient(135deg, #f8fdf8 0%, #e8f4f8 100%); border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center; border: 2px solid #2c5f2d;">
        <h1 style="color: #2c5f2d; font-size: 2rem; margin: 0 0 0.5rem 0;">ICSR 2026</h1>
        <p style="font-size: 1.1rem; font-weight: 600; margin: 0.5rem 0;">International Conference on Shellfish Restoration</p>
        <p style="font-size: 1.5rem; font-weight: bold; color: #2c5f2d; margin: 1rem 0;">October 4-8, 2026</p>
        <p style="font-size: 1.1rem; margin: 0.5rem 0;">Little Creek Resort and Conference Center</p>
        <p style="font-size: 1rem; margin: 0.5rem 0;">Shelton, Washington</p>
        <p style="font-size: 0.9rem; margin: 1rem 0 0 0; font-style: italic;">Hosted by Puget Sound Restoration Fund</p>
    </div>

    <h3 style="color: #2c5f2d;">📍 Location</h3>
    <p>The conference will be held at <a href="https://littlecreek.com/" style="color: #2c5f2d;">Little Creek Resort and Conference Center</a> in Shelton, Washington, operated by the Squaxin Island Tribe. Set in the spectacular Puget Sound region, this location offers a unique opportunity to engage with Indigenous knowledge and shellfish restoration in the Pacific Northwest.</p>

    <h3 style="color: #2c5f2d;">🎯 Conference Themes</h3>
    <ul style="line-height: 1.8;">
        <li><strong>Engaging Communities</strong> - Building partnerships for restoration success</li>
        <li><strong>Collaborating with Knowledge Holders</strong> - Learning from Indigenous wisdom and Traditional Ecological Knowledge</li>
        <li><strong>Advancing Restorative Aquaculture</strong> - Integrating aquaculture and restoration for ecosystem recovery</li>
    </ul>

    <h3 style="color: #2c5f2d;">🎤 Confirmed Keynote Speakers</h3>
    <div style="background: #f8fdf8; padding: 1rem; border-left: 4px solid #2c5f2d; margin: 1rem 0;">
        <p style="margin: 0.5rem 0;"><strong>Chairman Kris Peters</strong>, Squaxin Island Tribe<br><em>Welcoming Address - Monday, October 5</em></p>
        <p style="margin: 0.5rem 0;"><strong>Chairman Leonard Forsman</strong>, Suquamish Tribe<br><em>Keynote Address - Tuesday, October 6</em></p>
    </div>

    <h3 style="color: #2c5f2d;">🌊 What to Expect</h3>
    <ul style="line-height: 1.8;">
        <li><strong>300+ participants</strong> from 20+ countries</li>
        <li><strong>Scientific presentations</strong> and poster sessions</li>
        <li><strong>Traditional Salmon & Clam Bake</strong> - Experience coastal Indigenous cuisine and traditions</li>
        <li><strong>Field trips</strong> to shellfish facilities, restoration sites, hatcheries, and cultural locations</li>
        <li><strong>Networking events</strong> including a "Lessons Learned" panel and happy hour</li>
        <li><strong>Post-conference working groups</strong> (NOOC Roundtable, Global Ostrea Working Meeting)</li>
    </ul>

    <h3 style="color: #2c5f2d;">📊 Preliminary Session Topics</h3>
    <p>The program is being developed by our Program Team, led by <strong>Julieta Martinelli</strong> (WA Department of Fish & Wildlife). Topics include:</p>
    <ul style="line-height: 1.6;">
        <li>Ostrea Session (NOOC, NORA, Australia) - Global perspectives on native oyster restoration</li>
        <li>Urban Shellfish Restoration</li>
        <li>Indigenous Partners Session</li>
        <li>Grower Partners Session</li>
        <li>Hatcheries (Conservation & Tribal)</li>
        <li>Abalone Recovery</li>
        <li>Freshwater Mussels</li>
        <li>Resilience Building to mitigate ocean acidification</li>
        <li>Archaeology - Learning from fossils and archaeological records</li>
    </ul>

    <h3 style="color: #2c5f2d;">📅 Registration & Abstract Submission</h3>
    <p><strong>Registration:</strong> Early bird registration will open in <strong>Spring 2026</strong>. Details coming soon!</p>
    <p><strong>Abstract Submissions:</strong> Call for abstracts will be announced in <strong>Spring 2026</strong>. Start thinking about your research to share!</p>

    <div style="text-align: center; margin: 2rem 0;">
        <a href="https://www.shellfish-society.org/icsr2026.html" style="background-color: #2c5f2d; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 16px; font-weight: 600;">
            Learn More About ICSR2026
        </a>
    </div>

    <h3 style="color: #2c5f2d;">🤝 Planning Committee</h3>
    <p>This conference is being organized by an exceptional planning committee, chaired by <strong>Betsy Peabody</strong> (Puget Sound Restoration Fund), with members from:</p>
    <ul style="line-height: 1.6;">
        <li>Puget Sound Restoration Fund</li>
        <li>International Shellfish Restoration Society (ISRS)</li>
        <li>Taylor Shellfish</li>
        <li>Suquamish Tribe</li>
        <li>Washington Department of Fish & Wildlife</li>
        <li>The Nature Conservancy</li>
        <li>Elkhorn Slough National Research Reserve / NOOC</li>
    </ul>

    <div style="background: #fffbeb; border-radius: 8px; padding: 15px 20px; margin: 25px 0;">
        <p style="margin: 0; font-size: 14px; color: #8b5e00;">
            <strong>📧 Stay Connected:</strong> We'll be sharing more details in the coming months about registration rates, abstract submission guidelines, accommodation information, field trip details, and sponsorship opportunities.
        </p>
    </div>

    <p style="font-size: 0.9rem; color: #666; margin-top: 2rem;">
        <strong>Questions?</strong> Contact us at <a href="mailto:info@shellfish-society.org" style="color: #2c5f2d;">info@shellfish-society.org</a>
    </p>

    <p style="margin-top: 2rem;">We look forward to gathering with you in Washington State this October to advance shellfish restoration globally!</p>

    <p style="margin-top: 1.5rem;"><strong>The ISRS and ICSR2026 Teams</strong></p>
    """

    text_content = """
ICSR 2026 - SAVE THE DATE

Dear Aaron,

We're excited to announce the dates for the 7th International Conference on Shellfish Restoration (ICSR 2026)!

DATES: October 4-8, 2026
LOCATION: Little Creek Resort and Conference Center, Shelton, Washington
HOSTED BY: Puget Sound Restoration Fund

CONFERENCE THEMES:
• Engaging Communities - Building partnerships for restoration success
• Collaborating with Knowledge Holders - Learning from Indigenous wisdom
• Advancing Restorative Aquaculture - Integrating aquaculture and restoration

CONFIRMED KEYNOTE SPEAKERS:
• Chairman Kris Peters, Squaxin Island Tribe (Welcoming Address - Monday, Oct 5)
• Chairman Leonard Forsman, Suquamish Tribe (Keynote Address - Tuesday, Oct 6)

WHAT TO EXPECT:
• 300+ participants from 20+ countries
• Scientific presentations and posters
• Traditional Salmon & Clam Bake
• Field trips to restoration sites and cultural locations
• Networking and working group sessions

PRELIMINARY SESSION TOPICS:
• Ostrea Session (NOOC, NORA, Australia)
• Urban Shellfish Restoration
• Indigenous Partners Session
• Grower Partners Session
• Hatcheries (Conservation & Tribal)
• Abalone Recovery, Freshwater Mussels
• Resilience Building, Archaeology

REGISTRATION: Opens Spring 2026
ABSTRACT SUBMISSIONS: Call opens Spring 2026

Learn more: https://www.shellfish-society.org/icsr2026.html

PLANNING COMMITTEE:
Chaired by Betsy Peabody (Puget Sound Restoration Fund)
Program Team led by Julieta Martinelli (WA Dept Fish & Wildlife)

Questions? Contact info@shellfish-society.org

We look forward to seeing you in Washington State!

The ISRS and ICSR2026 Teams
    """

    print("Sending Save the Date email...")
    print()

    try:
        success = await email_service.send_email(
            to_email="aaron.kornbluth@gmail.com",
            subject=subject,
            html_content=html_content,
            text_content=text_content
        )

        if success:
            print("=" * 80)
            print("✅ SUCCESS!")
            print("=" * 80)
            print()
            print("Save the Date email sent to aaron.kornbluth@gmail.com")
            print()
            print("Check your inbox for:")
            print("  Subject: ICSR 2026 - Save the Date: October 4-8, Washington State 🦪")
            print("  From: noreply@shellfish-society.org (or configured sender)")
            print()
            print("=" * 80)
        else:
            print("=" * 80)
            print("❌ FAILED")
            print("=" * 80)
            print()
            print("Failed to send email. Check the error messages above.")
            print()
            print("Common issues:")
            print("  - SES sender email not verified in AWS")
            print("  - Recipient email not verified (if in SES sandbox mode)")
            print("  - Invalid AWS credentials")
            print("  - Incorrect AWS region")
            print()
            print("=" * 80)

    except Exception as e:
        print("=" * 80)
        print("❌ ERROR")
        print("=" * 80)
        print()
        print(f"Error: {str(e)}")
        print()
        import traceback
        traceback.print_exc()
        print()
        print("=" * 80)

if __name__ == "__main__":
    asyncio.run(main())
