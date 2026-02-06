#!/usr/bin/env python3
"""
Send ICSR2026 Save the Date email to aaron.kornbluth@gmail.com for testing
Uses the branded ISRS email template for consistent design
"""
import sys
import os
import asyncio
from datetime import datetime

# Add parent directory to path to import from app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.email_service import EmailService, get_base_template, get_button_html

async def main():
    """Send ICSR2026 Save the Date email"""
    email_service = EmailService()

    print("=" * 80)
    print("ICSR 2026 - SAVE THE DATE EMAIL TEST")
    print("=" * 80)
    print(f"To: aaron.kornbluth@gmail.com")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Email Service: {email_service.email_service}")
    print("=" * 80)
    print()

    # Email content
    subject = "Save the Date: ICSR2026 - October 4-8, Washington State"

    # Build email content using the same structure as abstract acceptance
    content = """
    <h1 style="color: #2c5f2d; font-size: 28px; margin: 0 0 20px 0; text-align: center;">Save the Date!</h1>

    <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 20px;">
        Mark your calendars! The <strong>International Conference on Shellfish Restoration 2026 (ICSR2026)</strong> will be held in Shelton, Washington, October 4–8, 2026.
    </p>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
        <tr>
            <td style="background: #ffffff; border: 3px solid #2c5f2d; border-radius: 16px; padding: 0; overflow: hidden; box-shadow: 0 6px 24px rgba(44, 95, 45, 0.12);">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <!-- Logo section with gradient background -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #2c5f2d 0%, #1e4020 100%); padding: 40px 30px; text-align: center;">
                            <img src="https://www.shellfish-society.org/images/logos/LOGO%20-%20ICSR2026.png" alt="ICSR2026 Logo" style="max-width: 320px; height: auto; display: block; margin: 0 auto;">
                        </td>
                    </tr>
                    <!-- Content section -->
                    <tr>
                        <td style="background: #ffffff; padding: 35px 30px; text-align: center;">
                            <h2 style="color: #2c5f2d; font-size: 22px; font-weight: 700; margin: 0 0 20px 0; line-height: 1.3;">International Conference on Shellfish Restoration</h2>

                            <div style="background: linear-gradient(135deg, #f0f8f0 0%, #e8f4f8 100%); border-radius: 8px; padding: 20px; margin: 20px 0;">
                                <p style="font-size: 24px; font-weight: 700; color: #2c5f2d; margin: 0 0 5px 0; letter-spacing: 0.5px;">October 4–8, 2026</p>
                            </div>

                            <p style="font-size: 17px; color: #333; margin: 15px 0 5px 0; font-weight: 600;"><a href="https://littlecreek.com/" style="color: #2e5a8a; text-decoration: underline;">Little Creek Resort and Conference Center</a></p>
                            <p style="font-size: 17px; color: #333; margin: 5px 0 20px 0; font-weight: 600;"><a href="https://www.google.com/maps/place/Shelton,+WA" style="color: #2e5a8a; text-decoration: underline;">Shelton, Washington</a></p>

                            <p style="font-size: 14px; margin: 20px 0 0 0; color: #666; font-style: italic; border-top: 1px solid #e0e0e0; padding-top: 20px;">Hosted by <a href="https://restorationfund.org/" style="color: #2e5a8a; text-decoration: underline;">Puget Sound Restoration Fund</a></p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <h3 style="color: #2c5f2d; font-size: 20px; margin-top: 30px; margin-bottom: 15px;">Conference Themes</h3>
    <ul style="line-height: 1.8; color: #333; margin: 0 0 25px 20px; padding-left: 0;">
        <li style="margin-bottom: 10px;"><strong>Engaging Communities</strong> - Building partnerships for restoration success</li>
        <li style="margin-bottom: 10px;"><strong>Collaborating with Knowledge Holders</strong> - Learning from Indigenous wisdom and Traditional Ecological Knowledge</li>
        <li style="margin-bottom: 10px;"><strong>Advancing Restorative Aquaculture</strong> - Integrating aquaculture and restoration for ecosystem recovery</li>
    </ul>

    <h3 style="color: #2c5f2d; font-size: 20px; margin-top: 30px; margin-bottom: 15px;">Confirmed Keynote Speakers</h3>
    <div style="background: #f8fdf8; padding: 20px; border-left: 4px solid #2c5f2d; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 10px 0;"><strong>Chairman Kris Peters</strong>, Squaxin Island Tribe<br><em>Welcoming Address - Monday, October 5</em></p>
        <p style="margin: 10px 0;"><strong>Chairman Leonard Forsman</strong>, Suquamish Tribe<br><em>Keynote Address - Tuesday, October 6</em></p>
    </div>

    <h3 style="color: #2c5f2d; font-size: 20px; margin-top: 30px; margin-bottom: 15px;">What to Expect</h3>
    <ul style="line-height: 1.8; color: #333; margin: 0 0 25px 20px; padding-left: 0;">
        <li style="margin-bottom: 10px;"><strong>300+ participants</strong> from 20+ countries</li>
        <li style="margin-bottom: 10px;"><strong>Scientific presentations</strong> and poster sessions</li>
        <li style="margin-bottom: 10px;"><strong>Traditional Salmon & Clam Bake</strong> - Experience coastal Indigenous cuisine and traditions</li>
        <li style="margin-bottom: 10px;"><strong>Field trips</strong> to shellfish restoration sites, hatcheries, and cultural locations</li>
        <li style="margin-bottom: 10px;"><strong>Networking events</strong> including panel discussions and social gatherings</li>
        <li style="margin-bottom: 10px;"><strong>Post-conference working groups</strong> (NOOC Roundtable, Global Ostrea Working Meeting)</li>
    </ul>

    <h3 style="color: #2c5f2d; font-size: 20px; margin-top: 30px; margin-bottom: 15px;">Session Topics</h3>
    <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 10px;">
        The program is being developed by our Program Team, led by <strong>Julieta Martinelli</strong> (Washington Department of Fish & Wildlife). Preliminary topics include:
    </p>
    <ul style="line-height: 1.8; color: #333; margin: 0 0 25px 20px; padding-left: 0;">
        <li style="margin-bottom: 8px;">Native Oyster Restoration</li>
        <li style="margin-bottom: 8px;">Urban Shellfish Restoration</li>
        <li style="margin-bottom: 8px;">Indigenous Partners & Traditional Ecological Knowledge</li>
        <li style="margin-bottom: 8px;">Grower Partnerships & Restorative Aquaculture</li>
        <li style="margin-bottom: 8px;">Conservation & Tribal Hatcheries</li>
        <li style="margin-bottom: 8px;">Abalone Recovery & Freshwater Mussels</li>
        <li style="margin-bottom: 8px;">Climate Resilience & Ocean Acidification</li>
        <li style="margin-bottom: 8px;">Archaeological Perspectives on Shellfish Ecosystems</li>
    </ul>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 30px auto;" width="100%">
        <tr>
            <td align="center">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                        <td style="padding: 0 10px;">
                            <a href="https://www.shellfish-society.org/icsr2026.html#conference-materials" target="_blank" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #2e5a8a 0%, #1e4a6a 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">📄 Conference Materials</a>
                        </td>
                        <td style="padding: 0 10px;">
                            <a href="https://www.shellfish-society.org/icsr2026.html" target="_blank" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #2c5f2d 0%, #1e4020 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">📅 Save the Date</a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <!-- Quick share links after CTA buttons -->
    <div style="text-align: center; margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px;">
        <p style="font-size: 14px; color: #666; margin: 0 0 10px 0;">📢 Help us spread the word!</p>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
            <tr>
                <td style="padding: 0 8px;">
                    <a href="mailto:?subject=Save%20the%20Date%3A%20ICSR2026%20-%20October%204-8%2C%20Washington%20State&body=I%20wanted%20to%20share%20this%20exciting%20announcement%20about%20ICSR2026!%0A%0AThe%20International%20Conference%20on%20Shellfish%20Restoration%202026%20will%20be%20held%20October%204-8%2C%202026%20in%20Shelton%2C%20Washington.%0A%0ALearn%20more%3A%20https%3A%2F%2Fwww.shellfish-society.org%2Ficsr2026.html" style="color: #2e5a8a; text-decoration: underline; font-size: 13px;">✉️ Forward via Email</a>
                </td>
                <td style="padding: 0 8px;">
                    <a href="https://twitter.com/intent/tweet?text=Save%20the%20Date%20for%20ICSR2026!%20October%204-8%2C%202026%20in%20Shelton%2C%20WA.%20Join%20us%20for%20the%20International%20Conference%20on%20Shellfish%20Restoration.&url=https%3A%2F%2Fwww.shellfish-society.org%2Ficsr2026.html" target="_blank" style="color: #2e5a8a; text-decoration: underline; font-size: 13px;">🐦 Share on Twitter</a>
                </td>
                <td style="padding: 0 8px;">
                    <a href="https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fwww.shellfish-society.org%2Ficsr2026.html" target="_blank" style="color: #2e5a8a; text-decoration: underline; font-size: 13px;">💼 Share on LinkedIn</a>
                </td>
            </tr>
        </table>
    </div>

    <p style="font-size: 16px; line-height: 1.6; color: #333; margin-top: 30px; text-align: center;">
        We look forward to your participation at ICSR2026!
    </p>

    <!-- Detailed share section at bottom -->
    <div style="background: linear-gradient(135deg, #f0f8f0 0%, #e8f4f8 100%); border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center; border: 2px solid #e0e0e0;">
        <h3 style="color: #2c5f2d; font-size: 20px; margin: 0 0 15px 0;">Share This Announcement</h3>
        <p style="font-size: 15px; color: #333; line-height: 1.6; margin: 0 0 20px 0;">
            Help us reach restoration practitioners, researchers, and advocates worldwide! Share ICSR2026 with your colleagues and networks.
        </p>

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
            <tr>
                <td style="padding: 8px;">
                    <a href="mailto:?subject=Save%20the%20Date%3A%20ICSR2026%20-%20October%204-8%2C%20Washington%20State&body=I%20wanted%20to%20share%20this%20exciting%20announcement%20about%20ICSR2026!%0A%0AThe%20International%20Conference%20on%20Shellfish%20Restoration%202026%20will%20be%20held%20October%204-8%2C%202026%20in%20Shelton%2C%20Washington.%0A%0ALearn%20more%3A%20https%3A%2F%2Fwww.shellfish-society.org%2Ficsr2026.html" style="display: inline-block; padding: 12px 24px; background: #2e5a8a; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; border-radius: 6px;">✉️ Email to Colleagues</a>
                </td>
                <td style="padding: 8px;">
                    <a href="https://twitter.com/intent/tweet?text=Save%20the%20Date%20for%20ICSR2026!%20October%204-8%2C%202026%20in%20Shelton%2C%20WA.%20Join%20us%20for%20the%20International%20Conference%20on%20Shellfish%20Restoration.&url=https%3A%2F%2Fwww.shellfish-society.org%2Ficsr2026.html" target="_blank" style="display: inline-block; padding: 12px 24px; background: #1DA1F2; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; border-radius: 6px;">🐦 Twitter</a>
                </td>
                <td style="padding: 8px;">
                    <a href="https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fwww.shellfish-society.org%2Ficsr2026.html" target="_blank" style="display: inline-block; padding: 12px 24px; background: #0077B5; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; border-radius: 6px;">💼 LinkedIn</a>
                </td>
                <td style="padding: 8px;">
                    <a href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fwww.shellfish-society.org%2Ficsr2026.html" target="_blank" style="display: inline-block; padding: 12px 24px; background: #1877F2; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; border-radius: 6px;">👥 Facebook</a>
                </td>
            </tr>
        </table>

        <p style="font-size: 13px; color: #666; margin: 20px 0 0 0; line-height: 1.5;">
            <strong>Direct link to copy/paste:</strong><br>
            <span style="background: #fff; padding: 8px 12px; border-radius: 4px; display: inline-block; margin-top: 8px; font-family: monospace; font-size: 12px; border: 1px solid #ddd;">https://www.shellfish-society.org/icsr2026.html</span>
        </p>
    </div>
    """

    # Wrap in base template
    html_content = get_base_template(
        content=content,
        preheader="Join us October 4-8, 2026 in Shelton, Washington for ICSR2026"
    )

    text_content = """
ICSR 2026 - SAVE THE DATE

Dear Aaron,

Mark your calendars! The International Conference on Shellfish Restoration 2026 (ICSR2026) will be held in Shelton, Washington, October 4-8, 2026!

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

Learn more: https://www.shellfish-society.org/icsr2026.html

We look forward to your participation at ICSR2026!

The ISRS and ICSR2026 Teams
    """

    print("Sending Save the Date email...")
    try:
        success = await email_service.send_email(
            to_email="aaron.kornbluth@gmail.com",
            subject=subject,
            html_content=html_content,
            text_content=text_content
        )

        if success:
            print("✅ SUCCESS! Save the Date email sent to aaron.kornbluth@gmail.com")
            print()
            print("Check your inbox for:")
            print(f"  Subject: {subject}")
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
