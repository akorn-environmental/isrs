"""
Email service for sending authentication and notification emails.
Supports both SMTP (Gmail) and AWS SES.

Branded email templates for ISRS - International Shellfish Restoration Society
"""
import logging
import os
from typing import Optional
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import aiosmtplib

from app.config import settings

logger = logging.getLogger(__name__)


# =============================================================================
# ISRS BRAND COLORS (from shellfish-society.org)
# =============================================================================
BRAND_COLORS = {
    "primary_green": "#536e7d",  # ISRS logo color - primary brand color
    "primary_blue": "#2e5a8a",   # Legacy blue - kept for some templates
    "secondary_blue": "#4a7ab5",
    "accent_teal": "#546d7d",
    "dark_gray": "#2c3e50",
    "light_gray": "#f8f9fa",
    "success_green": "#28a745",
    "warning_yellow": "#ffc107",
    "info_blue": "#17a2b8",
    "white": "#ffffff",
    "text_dark": "#333333",
    "text_muted": "#6c757d",
    "border": "#e9ecef",
}


# =============================================================================
# BASE EMAIL TEMPLATE
# =============================================================================
def get_base_template(content: str, preheader: str = "") -> str:
    """
    Wrap email content in the base ISRS branded template.

    Args:
        content: The main email body content (HTML)
        preheader: Preview text shown in email clients (optional)

    Returns:
        Complete HTML email
    """
    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>ISRS</title>
        <!--[if mso]>
        <noscript>
            <xml>
                <o:OfficeDocumentSettings>
                    <o:PixelsPerInch>96</o:PixelsPerInch>
                </o:OfficeDocumentSettings>
            </xml>
        </noscript>
        <![endif]-->
        <style>
            /* Reset styles */
            body, table, td, a {{ -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }}
            table, td {{ mso-table-lspace: 0pt; mso-table-rspace: 0pt; }}
            img {{ -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }}

            /* Mobile styles */
            @media only screen and (max-width: 600px) {{
                .email-container {{ width: 100% !important; max-width: 100% !important; }}
                .fluid {{ max-width: 100% !important; height: auto !important; margin-left: auto !important; margin-right: auto !important; }}
                .stack-column {{ display: block !important; width: 100% !important; max-width: 100% !important; }}
                .center-on-narrow {{ text-align: center !important; display: block !important; margin-left: auto !important; margin-right: auto !important; float: none !important; }}
                .padding-mobile {{ padding-left: 20px !important; padding-right: 20px !important; }}
                .btn-mobile {{ display: block !important; width: 100% !important; max-width: 280px !important; margin: 0 auto !important; }}
            }}
        </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f0f4f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">

        <!-- Preheader text (hidden preview) -->
        <div style="display: none; font-size: 1px; color: #f0f4f8; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
            {preheader}
        </div>

        <!-- Email wrapper -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f0f4f8;">
            <tr>
                <td style="padding: 30px 15px;">

                    <!-- Email container -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="email-container" style="margin: 0 auto; max-width: 600px;">

                        <!-- Header with logo -->
                        <tr>
                            <td style="background-color: {BRAND_COLORS['primary_green']}; padding: 30px 40px; border-radius: 12px 12px 0 0; text-align: center;">
                                <img src="https://www.shellfish-society.org/images/logos/LOGO%20-%20ISRS%20-%20wide%20-%20white.png" alt="ISRS" width="180" style="height: auto; max-width: 180px; margin-bottom: 10px;">
                                <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0; letter-spacing: 0.5px;">International Shellfish Restoration Society</p>
                            </td>
                        </tr>

                        <!-- Main content area -->
                        <tr>
                            <td style="background-color: {BRAND_COLORS['white']}; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);" class="padding-mobile">
                                {content}
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="padding: 30px 20px; text-align: center;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                                    <tr>
                                        <td style="padding: 0 10px;">
                                            <a href="https://www.shellfish-society.org" style="color: {BRAND_COLORS['primary_blue']}; text-decoration: none; font-size: 13px;">Website</a>
                                        </td>
                                        <td style="color: {BRAND_COLORS['border']};">|</td>
                                        <td style="padding: 0 10px;">
                                            <a href="https://www.shellfish-society.org/icsr2026.html" style="color: {BRAND_COLORS['primary_blue']}; text-decoration: none; font-size: 13px;">ICSR2026</a>
                                        </td>
                                    </tr>
                                </table>
                                <p style="color: {BRAND_COLORS['text_muted']}; font-size: 12px; margin: 15px 0 0 0; line-height: 1.6;">
                                    © {__import__('datetime').datetime.now().year} International Shellfish Restoration Society<br>
                                    Tax ID (EIN): 59-2829151
                                </p>
                            </td>
                        </tr>

                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """


def get_button_html(text: str, url: str, color: str = None) -> str:
    """Generate a branded CTA button."""
    bg_color = color or BRAND_COLORS['primary_blue']
    return f"""
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 30px auto;" class="btn-mobile">
        <tr>
            <td style="border-radius: 8px; background: linear-gradient(135deg, {bg_color} 0%, {BRAND_COLORS['secondary_blue']} 100%);">
                <a href="{url}" target="_blank" style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                    {text}
                </a>
            </td>
        </tr>
    </table>
    """


def get_info_box_html(content: str, border_color: str = None, bg_color: str = None) -> str:
    """Generate an info/highlight box."""
    border = border_color or BRAND_COLORS['primary_blue']
    background = bg_color or "#f8fafc"
    return f"""
    <div style="background-color: {background}; border-left: 4px solid {border}; padding: 20px 24px; margin: 25px 0; border-radius: 0 8px 8px 0;">
        {content}
    </div>
    """


def get_success_box_html(content: str) -> str:
    """Generate a success/confirmation box."""
    return get_info_box_html(content, BRAND_COLORS['success_green'], "#f0fff4")


def get_warning_box_html(content: str) -> str:
    """Generate a warning/alert box."""
    return get_info_box_html(content, BRAND_COLORS['warning_yellow'], "#fffbeb")


# =============================================================================
# EMAIL SERVICE CLASS
# =============================================================================
class EmailService:
    """Service for sending emails via SMTP or AWS SES."""

    def __init__(self):
        # Email service selection (smtp or ses)
        self.email_service = os.getenv("EMAIL_SERVICE", "smtp").lower()

        # SMTP settings
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.SMTP_FROM_EMAIL
        self.from_name = settings.SMTP_FROM_NAME

        # AWS SES settings
        self.ses_from_email = os.getenv("SES_FROM_EMAIL", "noreply@shellfish-society.org")
        self.aws_region = os.getenv("AWS_SES_REGION", "us-east-1")

        logger.info(f"Email service initialized with: {self.email_service}")
        if self.email_service == "ses":
            logger.info(f"Using AWS SES with from_email: {self.ses_from_email}")

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
    ) -> bool:
        """
        Send an email via SMTP or AWS SES (based on EMAIL_SERVICE env var).

        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML email body
            text_content: Plain text email body (optional fallback)

        Returns:
            True if sent successfully, False otherwise
        """
        if self.email_service == "ses":
            return await self._send_via_ses(to_email, subject, html_content, text_content)
        else:
            return await self._send_via_smtp(to_email, subject, html_content, text_content)

    async def _send_via_smtp(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
    ) -> bool:
        """Send email via SMTP (Gmail)."""
        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["From"] = f"{self.from_name} <{self.from_email}>"
            message["To"] = to_email
            message["Subject"] = subject

            # Add text part (fallback)
            if text_content:
                text_part = MIMEText(text_content, "plain")
                message.attach(text_part)

            # Add HTML part
            html_part = MIMEText(html_content, "html")
            message.attach(html_part)

            # Send via SMTP
            await aiosmtplib.send(
                message,
                hostname=self.smtp_host,
                port=self.smtp_port,
                username=self.smtp_user,
                password=self.smtp_password,
                start_tls=True,
            )

            logger.info(f"Email sent successfully via SMTP to {to_email}")
            return True

        except Exception as e:
            logger.error(f"Failed to send email via SMTP to {to_email}: {str(e)}")
            return False

    async def _send_via_ses(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
    ) -> bool:
        """Send email via AWS SES."""
        try:
            import boto3
            from botocore.exceptions import ClientError

            # Create SES client
            ses_client = boto3.client('ses', region_name=self.aws_region)

            # Prepare email
            email_message = {
                'Subject': {'Data': subject, 'Charset': 'UTF-8'},
                'Body': {}
            }

            if html_content:
                email_message['Body']['Html'] = {'Data': html_content, 'Charset': 'UTF-8'}

            if text_content:
                email_message['Body']['Text'] = {'Data': text_content, 'Charset': 'UTF-8'}

            # Send email
            response = ses_client.send_email(
                Source=f"{self.from_name} <{self.ses_from_email}>",
                Destination={'ToAddresses': [to_email]},
                Message=email_message
            )

            logger.info(f"Email sent successfully via SES to {to_email}. MessageId: {response['MessageId']}")
            return True

        except ClientError as e:
            logger.error(f"AWS SES error sending to {to_email}: {e.response['Error']['Message']}")
            return False
        except Exception as e:
            logger.error(f"Failed to send email via SES to {to_email}: {str(e)}")
            return False

    # =========================================================================
    # AUTHENTICATION EMAILS
    # =========================================================================

    async def send_magic_link(self, to_email: str, magic_link: str, first_name: str = None) -> bool:
        """
        Send a magic link authentication email.

        Args:
            to_email: Recipient email address
            magic_link: Full magic link URL
            first_name: Optional first name for personalization

        Returns:
            True if sent successfully, False otherwise
        """
        subject = "ISRS - Your Login Link is Ready"
        preheader = "One click to access your ISRS member account - no password needed!"

        # Personalized greeting
        greeting = f"Hi {first_name}!" if first_name else "Welcome back!"

        content = f"""
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: {BRAND_COLORS['primary_green']}; font-size: 28px; margin: 15px 0 0 0; font-weight: 600;">
                {greeting}
            </h1>
            <p style="color: {BRAND_COLORS['text_muted']}; font-size: 15px; margin: 8px 0 30px 0;">
                Your secure login link is ready. No password needed!
            </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <a href="{magic_link}"
               style="background-color: {BRAND_COLORS['primary_green']};
                      color: white;
                      padding: 15px 40px;
                      text-decoration: none;
                      border-radius: 5px;
                      display: inline-block;
                      font-size: 16px;
                      font-weight: 600;">
                Sign In to ISRS
            </a>
        </div>

        <div style="background-color: #fffbeb; border-radius: 8px; padding: 15px 20px; margin: 25px 0;">
            <p style="margin: 0; font-size: 13px; color: #92400e; text-align: center;">
                <strong>This link expires in {settings.MAGIC_LINK_EXPIRY_MINUTES} minutes</strong> and can only be used once.<br>
                <span style="color: #b45309;">Didn't request this? You can safely ignore this email.</span>
            </p>
        </div>

        <div style="margin-top: 30px; padding: 20px; background-color: #f8fdf8; border-left: 4px solid {BRAND_COLORS['primary_green']}; border-radius: 4px;">
            <p style="font-size: 13px; color: {BRAND_COLORS['primary_green']}; margin: 0;">
                <strong>🔒 Security Note:</strong> This link is unique to you and can only be used once. Never share it with anyone.
            </p>
        </div>

        <p style="font-size: 12px; color: {BRAND_COLORS['text_muted']}; margin: 20px 0 0 0; text-align: center; line-height: 1.6;">
            <strong>Button not working?</strong><br>
            Copy this link into your browser:<br>
            <span style="word-break: break-all; color: {BRAND_COLORS['primary_green']};">{magic_link}</span>
        </p>
        """

        html_content = get_base_template(content, preheader)

        text_content = f"""
{greeting}

Your secure login link is ready! Click below to sign in to your ISRS member account:

{magic_link}

No password needed - it's that easy!

---

🔒 SECURITY NOTE: This link is unique to you and can only be used once. Never share it with anyone.

---

This link expires in {settings.MAGIC_LINK_EXPIRY_MINUTES} minutes and can only be used once.
Didn't request this? You can safely ignore this email.

---
International Shellfish Restoration Society
Tax ID (EIN): 59-2829151
https://www.shellfish-society.org
        """

        return await self.send_email(to_email, subject, html_content, text_content)

    async def send_welcome_email(
        self,
        to_email: str,
        first_name: str,
        magic_link: str,
    ) -> bool:
        """
        Send welcome email to newly registered members.

        Args:
            to_email: New member's email address
            first_name: Member's first name
            magic_link: Magic link to complete registration

        Returns:
            True if sent successfully, False otherwise
        """
        subject = "ISRS - Welcome! Complete Your Registration"
        preheader = f"Welcome {first_name}! Complete your ISRS member profile to get started."

        content = f"""
        <h1 style="color: {BRAND_COLORS['primary_blue']}; font-size: 26px; margin: 0 0 20px 0; font-weight: 600;">
            Welcome to ISRS, {first_name}! 🎉
        </h1>

        <p style="color: {BRAND_COLORS['text_dark']}; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
            Thank you for joining the International Shellfish Restoration Society! We're excited to have you as part of our global community working to restore shellfish ecosystems worldwide.
        </p>

        <p style="color: {BRAND_COLORS['text_dark']}; font-size: 16px; line-height: 1.7; margin: 0 0 25px 0;">
            Click below to complete your profile and unlock all member benefits:
        </p>

        {get_button_html("Complete My Profile", magic_link, BRAND_COLORS['success_green'])}

        <h2 style="color: {BRAND_COLORS['primary_blue']}; font-size: 18px; margin: 35px 0 15px 0; font-weight: 600;">
            As an ISRS Member, You Can:
        </h2>

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid {BRAND_COLORS['border']};">
                    <span style="font-size: 20px; margin-right: 12px;">🌊</span>
                    <span style="color: {BRAND_COLORS['text_dark']}; font-size: 15px;">Connect with shellfish restoration professionals worldwide</span>
                </td>
            </tr>
            <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid {BRAND_COLORS['border']};">
                    <span style="font-size: 20px; margin-right: 12px;">📅</span>
                    <span style="color: {BRAND_COLORS['text_dark']}; font-size: 15px;">Register for ICSR conferences and workshops</span>
                </td>
            </tr>
            <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid {BRAND_COLORS['border']};">
                    <span style="font-size: 20px; margin-right: 12px;">📸</span>
                    <span style="color: {BRAND_COLORS['text_dark']}; font-size: 15px;">Access and contribute to our restoration photo gallery</span>
                </td>
            </tr>
            <tr>
                <td style="padding: 12px 0;">
                    <span style="font-size: 20px; margin-right: 12px;">📖</span>
                    <span style="color: {BRAND_COLORS['text_dark']}; font-size: 15px;">Browse the member directory and expand your network</span>
                </td>
            </tr>
        </table>

        {get_info_box_html(f'''
            <p style="margin: 0; font-size: 14px; color: {BRAND_COLORS["primary_blue"]};">
                <strong>🐚 Coming up:</strong> ICSR 2026 in Bremerton, Washington! <a href="https://www.shellfish-society.org/icsr2026.html" style="color: {BRAND_COLORS["secondary_blue"]};">Learn more</a>
            </p>
        ''')}

        <p style="color: {BRAND_COLORS['text_muted']}; font-size: 14px; margin: 25px 0 0 0; text-align: center;">
            Questions? Reply to this email or visit our <a href="https://www.shellfish-society.org/about.html" style="color: {BRAND_COLORS['secondary_blue']};">About page</a> to learn more.
        </p>
        """

        html_content = get_base_template(content, preheader)

        text_content = f"""
Welcome to ISRS, {first_name}!

Thank you for joining the International Shellfish Restoration Society! We're excited to have you as part of our global community working to restore shellfish ecosystems worldwide.

Click the link below to complete your profile and unlock all member benefits:

{magic_link}

As an ISRS Member, You Can:
• Connect with shellfish restoration professionals worldwide
• Register for ICSR conferences and workshops
• Access and contribute to our restoration photo gallery
• Browse the member directory and expand your network

Coming up: ICSR 2026 in Bremerton, Washington!
https://www.shellfish-society.org/icsr2026.html

Questions? Reply to this email or visit our website to learn more.

---
International Shellfish Restoration Society
Tax ID (EIN): 59-2829151

Website: https://www.shellfish-society.org
        """

        return await self.send_email(to_email, subject, html_content, text_content)

    # =========================================================================
    # ABSTRACT REVIEW EMAILS
    # =========================================================================

    async def send_review_assignment_email(
        self,
        reviewer_email: str,
        abstract_title: str,
        due_date,
    ) -> bool:
        """
        Send email notification to reviewer when assigned to an abstract.

        Args:
            reviewer_email: Reviewer's email address
            abstract_title: Title of the abstract to review
            due_date: Review due date

        Returns:
            True if sent successfully, False otherwise
        """
        subject = "ICSR 2026 - New Abstract Review Assignment"
        preheader = f"You've been assigned to review: {abstract_title[:50]}..."

        # Format due date
        due_date_str = due_date.strftime('%B %d, %Y') if due_date else "TBD"

        content = f"""
        <h1 style="color: {BRAND_COLORS['primary_blue']}; font-size: 26px; margin: 0 0 20px 0; font-weight: 600;">
            New Review Assignment 📋
        </h1>

        <p style="color: {BRAND_COLORS['text_dark']}; font-size: 16px; line-height: 1.7; margin: 0 0 25px 0;">
            You have been selected to review an abstract submission for ICSR 2026. Your expertise is invaluable in ensuring the quality of our conference program.
        </p>

        {get_info_box_html(f'''
            <p style="margin: 0 0 10px 0; font-size: 15px; color: {BRAND_COLORS["text_dark"]};"><strong>Abstract Title:</strong></p>
            <p style="margin: 0 0 15px 0; font-size: 16px; color: {BRAND_COLORS["primary_blue"]}; font-weight: 500;">{abstract_title}</p>
            <p style="margin: 0; font-size: 14px; color: {BRAND_COLORS["text_muted"]};"><strong>Due Date:</strong> {due_date_str}</p>
        ''')}

        {get_button_html("Review Abstract", "https://www.shellfish-society.org/member/my-reviews.html")}

        <h2 style="color: {BRAND_COLORS['primary_blue']}; font-size: 16px; margin: 30px 0 12px 0; font-weight: 600;">
            Review Guidelines:
        </h2>
        <ul style="color: {BRAND_COLORS['text_dark']}; font-size: 14px; line-height: 1.8; padding-left: 20px; margin: 0;">
            <li>Evaluate scientific merit and relevance to shellfish restoration</li>
            <li>Consider clarity of presentation and methodology</li>
            <li>Provide constructive feedback for authors</li>
            <li>Submit your review before the due date</li>
        </ul>

        <p style="color: {BRAND_COLORS['text_muted']}; font-size: 14px; margin: 25px 0 0 0; text-align: center;">
            Thank you for contributing your expertise to ICSR 2026!
        </p>
        """

        html_content = get_base_template(content, preheader)

        text_content = f"""
New Review Assignment - ICSR 2026

You have been selected to review an abstract submission for ICSR 2026.

Abstract Title: {abstract_title}
Due Date: {due_date_str}

Please log in to complete your review:
https://www.shellfish-society.org/member/my-reviews.html

Review Guidelines:
• Evaluate scientific merit and relevance to shellfish restoration
• Consider clarity of presentation and methodology
• Provide constructive feedback for authors
• Submit your review before the due date

Thank you for contributing your expertise to ICSR 2026!

---
International Shellfish Restoration Society
ICSR 2026 Program Committee
        """

        return await self.send_email(reviewer_email, subject, html_content, text_content)

    async def send_review_confirmation_email(
        self,
        reviewer_email: str,
        abstract_title: str,
    ) -> bool:
        """
        Send confirmation email after reviewer submits a review.

        Args:
            reviewer_email: Reviewer's email address
            abstract_title: Title of the reviewed abstract

        Returns:
            True if sent successfully, False otherwise
        """
        subject = "ICSR 2026 - Review Submitted Successfully"
        preheader = "Thank you! Your abstract review has been submitted."

        content = f"""
        <div style="text-align: center; margin-bottom: 25px;">
            <div style="display: inline-block; background-color: #d1fae5; border-radius: 50%; padding: 15px; margin-bottom: 15px;">
                <span style="font-size: 32px;">✓</span>
            </div>
            <h1 style="color: {BRAND_COLORS['success_green']}; font-size: 26px; margin: 0; font-weight: 600;">
                Review Submitted!
            </h1>
        </div>

        <p style="color: {BRAND_COLORS['text_dark']}; font-size: 16px; line-height: 1.7; margin: 0 0 25px 0; text-align: center;">
            Thank you for completing your review. Your feedback helps ensure the quality and diversity of presentations at ICSR 2026.
        </p>

        {get_success_box_html(f'''
            <p style="margin: 0 0 5px 0; font-size: 13px; color: {BRAND_COLORS["text_muted"]};">Reviewed Abstract:</p>
            <p style="margin: 0; font-size: 15px; color: {BRAND_COLORS["text_dark"]}; font-weight: 500;">{abstract_title}</p>
        ''')}

        <p style="color: {BRAND_COLORS['text_dark']}; font-size: 15px; line-height: 1.7; margin: 25px 0;">
            The organizing committee will review all feedback and communicate final decisions to authors. If you have any additional reviews assigned, you can access them from your dashboard.
        </p>

        {get_button_html("View My Reviews", "https://www.shellfish-society.org/member/my-reviews.html")}

        <p style="color: {BRAND_COLORS['text_muted']}; font-size: 14px; margin: 20px 0 0 0; text-align: center;">
            Your contribution to the scientific program is greatly appreciated! 🙏
        </p>
        """

        html_content = get_base_template(content, preheader)

        text_content = f"""
Review Submitted Successfully - ICSR 2026

Thank you for completing your review!

Reviewed Abstract: {abstract_title}

Your feedback helps ensure the quality and diversity of presentations at ICSR 2026.

The organizing committee will review all feedback and communicate final decisions to authors.

View your reviews: https://www.shellfish-society.org/member/my-reviews.html

Your contribution to the scientific program is greatly appreciated!

---
International Shellfish Restoration Society
ICSR 2026 Program Committee
        """

        return await self.send_email(reviewer_email, subject, html_content, text_content)

    # =========================================================================
    # ABSTRACT DECISION EMAILS
    # =========================================================================

    async def send_acceptance_email(
        self,
        submitter_email: str,
        abstract_title: str,
        presentation_type: str,
        average_score,
    ) -> bool:
        """
        Send acceptance notification to abstract submitter.

        Args:
            submitter_email: Submitter's email address
            abstract_title: Title of the accepted abstract
            presentation_type: Type of presentation (oral, poster)
            average_score: Average review score

        Returns:
            True if sent successfully, False otherwise
        """
        subject = "ICSR 2026 - Abstract Accepted 🎉"
        preheader = f"Congratulations! Your abstract has been accepted for {presentation_type} presentation."

        content = f"""
        <div style="text-align: center; margin-bottom: 25px;">
            <span style="font-size: 48px;">🎉</span>
            <h1 style="color: {BRAND_COLORS['success_green']}; font-size: 28px; margin: 15px 0 0 0; font-weight: 600;">
                Congratulations!
            </h1>
        </div>

        <p style="color: {BRAND_COLORS['text_dark']}; font-size: 16px; line-height: 1.7; margin: 0 0 25px 0; text-align: center;">
            Your abstract has been <strong>accepted</strong> for presentation at ICSR 2026 in Bremerton, Washington!
        </p>

        {get_success_box_html(f'''
            <p style="margin: 0 0 12px 0; font-size: 13px; color: {BRAND_COLORS["text_muted"]};">Accepted Abstract:</p>
            <p style="margin: 0 0 15px 0; font-size: 16px; color: {BRAND_COLORS["text_dark"]}; font-weight: 600;">{abstract_title}</p>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                    <td style="padding: 5px 0;">
                        <span style="color: {BRAND_COLORS["text_muted"]}; font-size: 13px;">Presentation Type:</span>
                        <span style="color: {BRAND_COLORS["text_dark"]}; font-size: 14px; font-weight: 500; margin-left: 8px;">{presentation_type}</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 5px 0;">
                        <span style="color: {BRAND_COLORS["text_muted"]}; font-size: 13px;">Review Score:</span>
                        <span style="color: {BRAND_COLORS["text_dark"]}; font-size: 14px; font-weight: 500; margin-left: 8px;">{average_score}/5.0</span>
                    </td>
                </tr>
            </table>
        ''')}

        <h2 style="color: {BRAND_COLORS['primary_blue']}; font-size: 18px; margin: 30px 0 15px 0; font-weight: 600;">
            Next Steps:
        </h2>

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid {BRAND_COLORS['border']};">
                    <span style="display: inline-block; width: 24px; height: 24px; background: {BRAND_COLORS['primary_blue']}; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; margin-right: 12px;">1</span>
                    <span style="color: {BRAND_COLORS['text_dark']}; font-size: 15px;">Register for the conference if you haven't already</span>
                </td>
            </tr>
            <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid {BRAND_COLORS['border']};">
                    <span style="display: inline-block; width: 24px; height: 24px; background: {BRAND_COLORS['primary_blue']}; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; margin-right: 12px;">2</span>
                    <span style="color: {BRAND_COLORS['text_dark']}; font-size: 15px;">Prepare your {presentation_type.lower()} presentation materials</span>
                </td>
            </tr>
            <tr>
                <td style="padding: 10px 0;">
                    <span style="display: inline-block; width: 24px; height: 24px; background: {BRAND_COLORS['primary_blue']}; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; margin-right: 12px;">3</span>
                    <span style="color: {BRAND_COLORS['text_dark']}; font-size: 15px;">Watch for your session assignment (coming soon)</span>
                </td>
            </tr>
        </table>

        {get_button_html("Conference Details", "https://www.shellfish-society.org/icsr2026.html")}

        <p style="color: {BRAND_COLORS['text_muted']}; font-size: 14px; margin: 20px 0 0 0; text-align: center;">
            We look forward to your presentation at ICSR 2026! 🐚
        </p>
        """

        html_content = get_base_template(content, preheader)

        text_content = f"""
🎉 Abstract Accepted - ICSR 2026

Congratulations!

Your abstract has been accepted for presentation at ICSR 2026 in Bremerton, Washington!

Abstract Title: {abstract_title}
Presentation Type: {presentation_type}
Review Score: {average_score}/5.0

Next Steps:
1. Register for the conference if you haven't already
2. Prepare your {presentation_type.lower()} presentation materials
3. Watch for your session assignment (coming soon)

Conference Details: https://www.shellfish-society.org/icsr2026.html

We look forward to your presentation at ICSR 2026!

---
International Shellfish Restoration Society
ICSR 2026 Program Committee
        """

        return await self.send_email(submitter_email, subject, html_content, text_content)

    async def send_rejection_email(
        self,
        submitter_email: str,
        abstract_title: str,
        feedback_summary: str = "",
    ) -> bool:
        """
        Send rejection notification to abstract submitter.

        Args:
            submitter_email: Submitter's email address
            abstract_title: Title of the abstract
            feedback_summary: Summary of reviewer feedback

        Returns:
            True if sent successfully, False otherwise
        """
        subject = "ICSR 2026 - Abstract Review Decision"
        preheader = "Thank you for your ICSR 2026 abstract submission"

        feedback_section = ""
        if feedback_summary:
            feedback_section = get_warning_box_html(f'''
                <p style="margin: 0 0 8px 0; font-size: 13px; color: #92400e; font-weight: 600;">Reviewer Feedback:</p>
                <p style="margin: 0; font-size: 14px; color: #78350f; line-height: 1.6;">{feedback_summary}</p>
            ''')

        content = f"""
        <h1 style="color: {BRAND_COLORS['primary_blue']}; font-size: 24px; margin: 0 0 20px 0; font-weight: 600;">
            Abstract Review Decision
        </h1>

        <p style="color: {BRAND_COLORS['text_dark']}; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
            Thank you for submitting your abstract to ICSR 2026. We appreciate your interest in contributing to the conference program.
        </p>

        {get_info_box_html(f'''
            <p style="margin: 0 0 5px 0; font-size: 13px; color: {BRAND_COLORS["text_muted"]};">Submitted Abstract:</p>
            <p style="margin: 0; font-size: 15px; color: {BRAND_COLORS["text_dark"]}; font-weight: 500;">{abstract_title}</p>
        ''')}

        <p style="color: {BRAND_COLORS['text_dark']}; font-size: 16px; line-height: 1.7; margin: 20px 0;">
            After careful review by our program committee, we regret to inform you that we are unable to include your abstract in this year's program. Due to the high number of quality submissions, we faced difficult decisions.
        </p>

        {feedback_section}

        <h2 style="color: {BRAND_COLORS['primary_blue']}; font-size: 16px; margin: 25px 0 12px 0; font-weight: 600;">
            We encourage you to:
        </h2>
        <ul style="color: {BRAND_COLORS['text_dark']}; font-size: 15px; line-height: 1.8; padding-left: 20px; margin: 0;">
            <li>Attend ICSR 2026 to learn about current research</li>
            <li>Network with researchers and practitioners</li>
            <li>Consider submitting to future ISRS conferences</li>
        </ul>

        {get_button_html("Conference Information", "https://www.shellfish-society.org/icsr2026.html")}

        <p style="color: {BRAND_COLORS['text_muted']}; font-size: 14px; margin: 20px 0 0 0; text-align: center;">
            Thank you for your dedication to shellfish restoration.
        </p>
        """

        html_content = get_base_template(content, preheader)

        text_content = f"""
Abstract Review Decision - ICSR 2026

Thank you for submitting your abstract to ICSR 2026.

Submitted Abstract: {abstract_title}

After careful review by our program committee, we regret to inform you that we are unable to include your abstract in this year's program.

{f'Reviewer Feedback: {feedback_summary}' if feedback_summary else ''}

We encourage you to:
• Attend ICSR 2026 to learn about current research
• Network with researchers and practitioners
• Consider submitting to future ISRS conferences

Conference Information: https://www.shellfish-society.org/icsr2026.html

Thank you for your dedication to shellfish restoration.

---
International Shellfish Restoration Society
ICSR 2026 Program Committee
        """

        return await self.send_email(submitter_email, subject, html_content, text_content)

    # =========================================================================
    # EVENT REGISTRATION EMAILS
    # =========================================================================

    async def send_event_signup_email(
        self,
        user_email: str,
        event_name: str,
        event_date,
        guest_count: int,
        total_fee,
        status: str,
    ) -> bool:
        """
        Send event signup confirmation email.

        Args:
            user_email: User's email address
            event_name: Name of the event
            event_date: Date and time of the event
            guest_count: Number of guests
            total_fee: Total fee amount
            status: Signup status (confirmed or waitlist)

        Returns:
            True if sent successfully, False otherwise
        """
        is_waitlist = status == "waitlist"

        if is_waitlist:
            subject = f"ICSR 2026 - Waitlist Confirmation: {event_name}"
            preheader = f"You're on the waitlist for {event_name}"
            icon = "⏳"
            title = "Added to Waitlist"
            color = BRAND_COLORS['warning_yellow']
        else:
            subject = f"ICSR 2026 - Registration Confirmed: {event_name}"
            preheader = f"You're registered for {event_name}!"
            icon = "✓"
            title = "Registration Confirmed!"
            color = BRAND_COLORS['success_green']

        # Format event date
        event_date_str = event_date.strftime('%B %d, %Y at %I:%M %p') if event_date else "TBD"

        # Format fee
        fee_str = f"${total_fee:.2f}" if total_fee > 0 else "Free"

        # Build details table
        details_rows = f"""
            <tr>
                <td style="padding: 8px 0; color: {BRAND_COLORS['text_muted']}; font-size: 13px; width: 100px;">Event:</td>
                <td style="padding: 8px 0; color: {BRAND_COLORS['text_dark']}; font-size: 14px; font-weight: 500;">{event_name}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; color: {BRAND_COLORS['text_muted']}; font-size: 13px;">Date:</td>
                <td style="padding: 8px 0; color: {BRAND_COLORS['text_dark']}; font-size: 14px;">{event_date_str}</td>
            </tr>
        """

        if guest_count > 0:
            details_rows += f"""
            <tr>
                <td style="padding: 8px 0; color: {BRAND_COLORS['text_muted']}; font-size: 13px;">Attendees:</td>
                <td style="padding: 8px 0; color: {BRAND_COLORS['text_dark']}; font-size: 14px;">You + {guest_count} guest(s)</td>
            </tr>
            """

        if total_fee > 0:
            details_rows += f"""
            <tr>
                <td style="padding: 8px 0; color: {BRAND_COLORS['text_muted']}; font-size: 13px;">Total:</td>
                <td style="padding: 8px 0; color: {BRAND_COLORS['text_dark']}; font-size: 14px; font-weight: 600;">{fee_str}</td>
            </tr>
            """

        if is_waitlist:
            status_message = """
            <p style="color: #92400e; font-size: 15px; line-height: 1.7; margin: 20px 0;">
                You've been added to the waitlist. We'll notify you immediately if a spot becomes available!
            </p>
            """
        else:
            status_message = f"""
            <p style="color: {BRAND_COLORS['text_dark']}; font-size: 15px; line-height: 1.7; margin: 20px 0;">
                Your registration is confirmed! We look forward to seeing you there.
            </p>
            """

        content = f"""
        <div style="text-align: center; margin-bottom: 25px;">
            <div style="display: inline-block; background-color: {'#fef3c7' if is_waitlist else '#d1fae5'}; border-radius: 50%; width: 60px; height: 60px; line-height: 60px; margin-bottom: 15px;">
                <span style="font-size: 28px;">{icon}</span>
            </div>
            <h1 style="color: {color}; font-size: 26px; margin: 0; font-weight: 600;">
                {title}
            </h1>
        </div>

        {get_info_box_html(f'''
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                {details_rows}
            </table>
        ''', color, '#fafafa')}

        {status_message}

        <p style="color: {BRAND_COLORS['text_muted']}; font-size: 13px; margin: 25px 0 0 0; text-align: center;">
            Questions about this event? Reply to this email.
        </p>
        """

        html_content = get_base_template(content, preheader)

        guest_text = f"Attendees: You + {guest_count} guest(s)" if guest_count > 0 else ""
        fee_text = f"Total: {fee_str}" if total_fee > 0 else ""

        text_content = f"""
{title} - ICSR 2026

Event: {event_name}
Date: {event_date_str}
{guest_text}
{fee_text}

{"You've been added to the waitlist. We'll notify you if a spot becomes available!" if is_waitlist else "Your registration is confirmed! We look forward to seeing you there."}

---
International Shellfish Restoration Society
ICSR 2026
        """

        return await self.send_email(user_email, subject, html_content, text_content)

    async def send_event_waitlist_promotion_email(
        self,
        user_email: str,
        event_name: str,
        event_date,
        guest_count: int,
        total_fee,
    ) -> bool:
        """
        Send email when user is promoted from waitlist to confirmed.

        Args:
            user_email: User's email address
            event_name: Name of the event
            event_date: Date and time of the event
            guest_count: Number of guests
            total_fee: Total fee amount

        Returns:
            True if sent successfully, False otherwise
        """
        subject = f"ICSR 2026 - Spot Available: {event_name} 🎉"
        preheader = f"Great news! You've been confirmed for {event_name}"

        # Format event date
        event_date_str = event_date.strftime('%B %d, %Y at %I:%M %p') if event_date else "TBD"

        # Format fee
        fee_str = f"${total_fee:.2f}" if total_fee > 0 else "Free"

        # Build details
        details_rows = f"""
            <tr>
                <td style="padding: 8px 0; color: {BRAND_COLORS['text_muted']}; font-size: 13px; width: 100px;">Event:</td>
                <td style="padding: 8px 0; color: {BRAND_COLORS['text_dark']}; font-size: 14px; font-weight: 500;">{event_name}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; color: {BRAND_COLORS['text_muted']}; font-size: 13px;">Date:</td>
                <td style="padding: 8px 0; color: {BRAND_COLORS['text_dark']}; font-size: 14px;">{event_date_str}</td>
            </tr>
        """

        if guest_count > 0:
            details_rows += f"""
            <tr>
                <td style="padding: 8px 0; color: {BRAND_COLORS['text_muted']}; font-size: 13px;">Attendees:</td>
                <td style="padding: 8px 0; color: {BRAND_COLORS['text_dark']}; font-size: 14px;">You + {guest_count} guest(s)</td>
            </tr>
            """

        if total_fee > 0:
            details_rows += f"""
            <tr>
                <td style="padding: 8px 0; color: {BRAND_COLORS['text_muted']}; font-size: 13px;">Total:</td>
                <td style="padding: 8px 0; color: {BRAND_COLORS['text_dark']}; font-size: 14px; font-weight: 600;">{fee_str}</td>
            </tr>
            """

        content = f"""
        <div style="text-align: center; margin-bottom: 25px;">
            <span style="font-size: 48px;">🎉</span>
            <h1 style="color: {BRAND_COLORS['success_green']}; font-size: 26px; margin: 15px 0 0 0; font-weight: 600;">
                Spot Available!
            </h1>
        </div>

        <p style="color: {BRAND_COLORS['text_dark']}; font-size: 16px; line-height: 1.7; margin: 0 0 25px 0; text-align: center;">
            Great news! A spot has opened up and you've been <strong>moved from the waitlist to confirmed</strong>!
        </p>

        {get_success_box_html(f'''
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                {details_rows}
            </table>
        ''')}

        <p style="color: {BRAND_COLORS['text_dark']}; font-size: 15px; line-height: 1.7; margin: 20px 0; text-align: center;">
            Your registration is now confirmed. We look forward to seeing you there!
        </p>

        <p style="color: {BRAND_COLORS['text_muted']}; font-size: 13px; margin: 25px 0 0 0; text-align: center;">
            Questions? Reply to this email.
        </p>
        """

        html_content = get_base_template(content, preheader)

        guest_text = f"Attendees: You + {guest_count} guest(s)" if guest_count > 0 else ""
        fee_text = f"Total: {fee_str}" if total_fee > 0 else ""

        text_content = f"""
🎉 Spot Available! - {event_name}

Great news! A spot has opened up and you've been moved from the waitlist to confirmed!

Event: {event_name}
Date: {event_date_str}
{guest_text}
{fee_text}

Your registration is now confirmed. We look forward to seeing you there!

---
International Shellfish Restoration Society
ICSR 2026
        """

        return await self.send_email(user_email, subject, html_content, text_content)

    # =========================================================================
    # CONFERENCE REGISTRATION EMAILS
    # =========================================================================

    async def send_conference_registration_email(
        self,
        user_email: str,
        first_name: str,
        conference_name: str,
        registration_type: str,
        registration_date,
        total_fee,
        confirmation_number: str = None,
    ) -> bool:
        """
        Send conference registration confirmation email.

        Args:
            user_email: User's email address
            first_name: User's first name
            conference_name: Name of the conference
            registration_type: Type of registration (e.g., "Full Conference", "Day Pass")
            registration_date: Date of registration
            total_fee: Total registration fee
            confirmation_number: Optional confirmation number

        Returns:
            True if sent successfully, False otherwise
        """
        subject = f"ICSR 2026 - Registration Confirmed"
        preheader = f"Welcome {first_name}! Your registration for {conference_name} is confirmed."

        # Format date
        reg_date_str = registration_date.strftime('%B %d, %Y') if registration_date else "N/A"

        # Format fee
        fee_str = f"${total_fee:.2f}" if total_fee else "See invoice"

        confirmation_row = ""
        if confirmation_number:
            confirmation_row = f"""
            <tr>
                <td style="padding: 8px 0; color: {BRAND_COLORS['text_muted']}; font-size: 13px;">Confirmation #:</td>
                <td style="padding: 8px 0; color: {BRAND_COLORS['text_dark']}; font-size: 14px; font-weight: 600;">{confirmation_number}</td>
            </tr>
            """

        content = f"""
        <div style="text-align: center; margin-bottom: 25px;">
            <span style="font-size: 48px;">🐚</span>
            <h1 style="color: {BRAND_COLORS['primary_blue']}; font-size: 26px; margin: 15px 0 0 0; font-weight: 600;">
                You're Registered, {first_name}!
            </h1>
        </div>

        <p style="color: {BRAND_COLORS['text_dark']}; font-size: 16px; line-height: 1.7; margin: 0 0 25px 0; text-align: center;">
            Thank you for registering for <strong>{conference_name}</strong>! We're excited to welcome you.
        </p>

        {get_success_box_html(f'''
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                {confirmation_row}
                <tr>
                    <td style="padding: 8px 0; color: {BRAND_COLORS["text_muted"]}; font-size: 13px; width: 120px;">Conference:</td>
                    <td style="padding: 8px 0; color: {BRAND_COLORS["text_dark"]}; font-size: 14px; font-weight: 500;">{conference_name}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: {BRAND_COLORS["text_muted"]}; font-size: 13px;">Registration:</td>
                    <td style="padding: 8px 0; color: {BRAND_COLORS["text_dark"]}; font-size: 14px;">{registration_type}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: {BRAND_COLORS["text_muted"]}; font-size: 13px;">Registered:</td>
                    <td style="padding: 8px 0; color: {BRAND_COLORS["text_dark"]}; font-size: 14px;">{reg_date_str}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: {BRAND_COLORS["text_muted"]}; font-size: 13px;">Amount:</td>
                    <td style="padding: 8px 0; color: {BRAND_COLORS["text_dark"]}; font-size: 14px; font-weight: 600;">{fee_str}</td>
                </tr>
            </table>
        ''')}

        <h2 style="color: {BRAND_COLORS['primary_blue']}; font-size: 16px; margin: 30px 0 15px 0; font-weight: 600;">
            What's Next?
        </h2>

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid {BRAND_COLORS['border']};">
                    <span style="font-size: 18px; margin-right: 10px;">📅</span>
                    <span style="color: {BRAND_COLORS['text_dark']}; font-size: 14px;">Add the conference dates to your calendar</span>
                </td>
            </tr>
            <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid {BRAND_COLORS['border']};">
                    <span style="font-size: 18px; margin-right: 10px;">🏨</span>
                    <span style="color: {BRAND_COLORS['text_dark']}; font-size: 14px;">Book your accommodations early</span>
                </td>
            </tr>
            <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid {BRAND_COLORS['border']};">
                    <span style="font-size: 18px; margin-right: 10px;">✈️</span>
                    <span style="color: {BRAND_COLORS['text_dark']}; font-size: 14px;">Arrange your travel to Bremerton, WA</span>
                </td>
            </tr>
            <tr>
                <td style="padding: 10px 0;">
                    <span style="font-size: 18px; margin-right: 10px;">👥</span>
                    <span style="color: {BRAND_COLORS['text_dark']}; font-size: 14px;">Review the program when it's published</span>
                </td>
            </tr>
        </table>

        {get_button_html("View Conference Details", "https://www.shellfish-society.org/icsr2026.html")}

        <p style="color: {BRAND_COLORS['text_muted']}; font-size: 14px; margin: 20px 0 0 0; text-align: center;">
            Questions? Reply to this email or visit our website.
        </p>
        """

        html_content = get_base_template(content, preheader)

        text_content = f"""
You're Registered, {first_name}!

Thank you for registering for {conference_name}!

{f'Confirmation #: {confirmation_number}' if confirmation_number else ''}
Conference: {conference_name}
Registration Type: {registration_type}
Registered On: {reg_date_str}
Amount: {fee_str}

What's Next?
• Add the conference dates to your calendar
• Book your accommodations early
• Arrange your travel to Bremerton, WA
• Review the program when it's published

Conference Details: https://www.shellfish-society.org/icsr2026.html

Questions? Reply to this email or visit our website.

---
International Shellfish Restoration Society
        """

        return await self.send_email(user_email, subject, html_content, text_content)

    # =========================================================================
    # DONATION SOLICITATION EMAILS
    # =========================================================================

    async def send_donation_request_isrs(
        self,
        to_email: str,
        first_name: str,
        icsr2024_attended: bool = False,
        icsr2024_role: str = None,  # "speaker", "poster", "attendee", "exhibitor"
        previous_donor: bool = False,
        last_donation_amount: float = None,
        last_donation_year: int = None,
    ) -> bool:
        """
        Send donation solicitation email for ISRS general fund.

        Args:
            to_email: Recipient email
            first_name: Recipient's first name
            icsr2024_attended: Whether they attended ICSR 2024
            icsr2024_role: Their role at ICSR 2024 if attended
            previous_donor: Whether they've donated before
            last_donation_amount: Their last donation amount
            last_donation_year: Year of last donation

        Returns:
            True if sent successfully
        """
        subject = "ISRS - Support Shellfish Restoration Worldwide"
        preheader = f"{first_name}, your support helps restore shellfish ecosystems globally"

        # Build personalized opening based on history
        if previous_donor and last_donation_year:
            opening = f"""
            <p style="color: {BRAND_COLORS['text_dark']}; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                Thank you for your generous support of ISRS{f' in {last_donation_year}' if last_donation_year else ''}!
                Your {'$' + f'{last_donation_amount:.0f} ' if last_donation_amount else ''}contribution made a real difference
                in our mission to restore shellfish ecosystems worldwide.
            </p>
            """
        elif icsr2024_attended:
            role_text = {
                "speaker": "presenting your research",
                "poster": "sharing your poster presentation",
                "exhibitor": "exhibiting",
                "attendee": "joining us"
            }.get(icsr2024_role, "participating")
            opening = f"""
            <p style="color: {BRAND_COLORS['text_dark']}; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                It was wonderful having you at ICSR 2024! Thank you for {role_text} and being part of our
                global community dedicated to shellfish restoration.
            </p>
            """
        else:
            opening = f"""
            <p style="color: {BRAND_COLORS['text_dark']}; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                As someone who cares about marine ecosystems, you understand the critical role shellfish
                play in our coastal waters. ISRS is working to restore these vital ecosystems worldwide.
            </p>
            """

        content = f"""
        <h1 style="color: {BRAND_COLORS['primary_blue']}; font-size: 26px; margin: 0 0 20px 0; font-weight: 600;">
            Dear {first_name}, 🐚
        </h1>

        {opening}

        <p style="color: {BRAND_COLORS['text_dark']}; font-size: 16px; line-height: 1.7; margin: 0 0 25px 0;">
            Today, I'm asking for your support to help ISRS continue its important work connecting
            researchers, practitioners, and advocates working to restore shellfish populations around the globe.
        </p>

        {get_info_box_html(f'''
            <p style="margin: 0 0 15px 0; font-size: 15px; color: {BRAND_COLORS["primary_blue"]}; font-weight: 600;">
                Your donation supports:
            </p>
            <ul style="margin: 0; padding-left: 20px; color: {BRAND_COLORS["text_dark"]}; font-size: 14px; line-height: 1.8;">
                <li>International conferences bringing together restoration experts</li>
                <li>Student travel grants and early-career researcher support</li>
                <li>Educational resources and best practices documentation</li>
                <li>Global network building and knowledge sharing</li>
            </ul>
        ''')}

        <h2 style="color: {BRAND_COLORS['primary_blue']}; font-size: 18px; margin: 30px 0 15px 0; font-weight: 600;">
            Giving Levels
        </h2>

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 25px;">
            <tr>
                <td style="padding: 12px 15px; background: #f8fafc; border-left: 4px solid {BRAND_COLORS['accent_teal']}; margin-bottom: 8px;">
                    <strong style="color: {BRAND_COLORS['primary_blue']};">Friend</strong> <span style="color: {BRAND_COLORS['text_muted']};">— $25-$99</span><br>
                    <span style="font-size: 13px; color: {BRAND_COLORS['text_dark']};">Recognition on our website donors page</span>
                </td>
            </tr>
            <tr><td style="height: 8px;"></td></tr>
            <tr>
                <td style="padding: 12px 15px; background: #f0f7ff; border-left: 4px solid {BRAND_COLORS['secondary_blue']};">
                    <strong style="color: {BRAND_COLORS['primary_blue']};">Supporter</strong> <span style="color: {BRAND_COLORS['text_muted']};">— $100-$249</span><br>
                    <span style="font-size: 13px; color: {BRAND_COLORS['text_dark']};">Website recognition + ISRS newsletter mention</span>
                </td>
            </tr>
            <tr><td style="height: 8px;"></td></tr>
            <tr>
                <td style="padding: 12px 15px; background: #e8f4f8; border-left: 4px solid {BRAND_COLORS['primary_blue']};">
                    <strong style="color: {BRAND_COLORS['primary_blue']};">Patron</strong> <span style="color: {BRAND_COLORS['text_muted']};">— $250-$499</span><br>
                    <span style="font-size: 13px; color: {BRAND_COLORS['text_dark']};">Above benefits + conference registration discount</span>
                </td>
            </tr>
            <tr><td style="height: 8px;"></td></tr>
            <tr>
                <td style="padding: 12px 15px; background: linear-gradient(135deg, #e8f4f8 0%, #d0e8f7 100%); border-left: 4px solid {BRAND_COLORS['success_green']};">
                    <strong style="color: {BRAND_COLORS['primary_blue']};">Champion</strong> <span style="color: {BRAND_COLORS['text_muted']};">— $500+</span><br>
                    <span style="font-size: 13px; color: {BRAND_COLORS['text_dark']};">All benefits + VIP reception at ICSR conferences</span>
                </td>
            </tr>
        </table>

        {get_button_html("Make a Donation", "https://www.shellfish-society.org/donate.html", BRAND_COLORS['success_green'])}

        <p style="color: {BRAND_COLORS['text_muted']}; font-size: 13px; margin: 20px 0 0 0; text-align: center;">
            ISRS is a 501(c)(3) nonprofit organization. Your donation is tax-deductible to the extent allowed by law.<br>
            EIN: [EIN NUMBER]
        </p>
        """

        html_content = get_base_template(content, preheader)

        text_content = f"""
Dear {first_name},

{'Thank you for your generous support of ISRS! Your contribution made a real difference.' if previous_donor else ''}
{'It was wonderful having you at ICSR 2024!' if icsr2024_attended else ''}

Today, I'm asking for your support to help ISRS continue its important work connecting researchers, practitioners, and advocates working to restore shellfish populations around the globe.

Your donation supports:
• International conferences bringing together restoration experts
• Student travel grants and early-career researcher support
• Educational resources and best practices documentation
• Global network building and knowledge sharing

Giving Levels:
• Friend ($25-$99) - Website recognition
• Supporter ($100-$249) - Website + newsletter mention
• Patron ($250-$499) - Above + conference discount
• Champion ($500+) - All benefits + VIP reception

Donate: https://www.shellfish-society.org/donate.html

ISRS is a 501(c)(3) nonprofit. Your donation is tax-deductible.

Thank you for supporting shellfish restoration worldwide!

---
International Shellfish Restoration Society
        """

        return await self.send_email(to_email, subject, html_content, text_content)

    async def send_donation_request_icsr2026(
        self,
        to_email: str,
        first_name: str,
        icsr2024_attended: bool = False,
        icsr2024_role: str = None,
        icsr2024_donated: bool = False,
        icsr2024_donation_amount: float = None,
    ) -> bool:
        """
        Send donation solicitation email specifically for ICSR 2026 conference support.

        Args:
            to_email: Recipient email
            first_name: Recipient's first name
            icsr2024_attended: Whether they attended ICSR 2024
            icsr2024_role: Their role at ICSR 2024
            icsr2024_donated: Whether they donated to ICSR 2024
            icsr2024_donation_amount: Amount donated to ICSR 2024

        Returns:
            True if sent successfully
        """
        subject = "ICSR 2026 - Help Make It Unforgettable"
        preheader = f"{first_name}, support the 7th International Conference on Shellfish Restoration"

        # Build personalized content
        if icsr2024_donated:
            opening = f"""
            <p style="color: {BRAND_COLORS['text_dark']}; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                Your {'$' + f'{icsr2024_donation_amount:.0f} ' if icsr2024_donation_amount else ''}donation to ICSR 2024
                helped make it one of our most successful conferences yet. Thank you! Now we're gearing up for
                ICSR 2026 in beautiful Bremerton, Washington, and we hope you'll consider supporting us again.
            </p>
            """
        elif icsr2024_attended:
            role_memories = {
                "speaker": "Your presentation was a highlight of the conference",
                "poster": "Your poster contributed valuable research to our community",
                "exhibitor": "Your exhibit helped connect attendees with important resources",
                "attendee": "We hope you found the sessions valuable and the connections meaningful"
            }
            memory = role_memories.get(icsr2024_role, "We hope you had a great experience")
            opening = f"""
            <p style="color: {BRAND_COLORS['text_dark']}; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                {memory}! As we prepare for ICSR 2026, we're reaching out to our community
                members to help make this conference even better.
            </p>
            """
        else:
            opening = f"""
            <p style="color: {BRAND_COLORS['text_dark']}; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                ICSR 2026 is coming to Bremerton, Washington — the heart of Pacific Northwest shellfish country!
                This conference brings together researchers, restoration practitioners, and advocates from around
                the world to share knowledge and advance shellfish restoration.
            </p>
            """

        content = f"""
        <h1 style="color: {BRAND_COLORS['primary_blue']}; font-size: 26px; margin: 0 0 20px 0; font-weight: 600;">
            Support ICSR 2026! 🌊
        </h1>

        {opening}

        {get_info_box_html(f'''
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                    <td style="padding: 5px 0;">
                        <span style="color: {BRAND_COLORS["text_muted"]}; font-size: 13px;">Conference:</span>
                        <span style="color: {BRAND_COLORS["text_dark"]}; font-size: 14px; font-weight: 500; margin-left: 8px;">7th International Conference on Shellfish Restoration</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 5px 0;">
                        <span style="color: {BRAND_COLORS["text_muted"]}; font-size: 13px;">Location:</span>
                        <span style="color: {BRAND_COLORS["text_dark"]}; font-size: 14px; margin-left: 8px;">Bremerton, Washington, USA</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 5px 0;">
                        <span style="color: {BRAND_COLORS["text_muted"]}; font-size: 13px;">Date:</span>
                        <span style="color: {BRAND_COLORS["text_dark"]}; font-size: 14px; margin-left: 8px;">2026</span>
                    </td>
                </tr>
            </table>
        ''')}

        <p style="color: {BRAND_COLORS['text_dark']}; font-size: 16px; line-height: 1.7; margin: 25px 0;">
            Your donation directly supports:
        </p>

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid {BRAND_COLORS['border']};">
                    <span style="font-size: 18px; margin-right: 10px;">🎓</span>
                    <span style="color: {BRAND_COLORS['text_dark']}; font-size: 14px;"><strong>Student Travel Grants</strong> — Help the next generation attend</span>
                </td>
            </tr>
            <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid {BRAND_COLORS['border']};">
                    <span style="font-size: 18px; margin-right: 10px;">🎤</span>
                    <span style="color: {BRAND_COLORS['text_dark']}; font-size: 14px;"><strong>Keynote Speakers</strong> — Bring world-class experts to share insights</span>
                </td>
            </tr>
            <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid {BRAND_COLORS['border']};">
                    <span style="font-size: 18px; margin-right: 10px;">🚐</span>
                    <span style="color: {BRAND_COLORS['text_dark']}; font-size: 14px;"><strong>Field Trips</strong> — Tours to local restoration sites</span>
                </td>
            </tr>
            <tr>
                <td style="padding: 10px 0;">
                    <span style="font-size: 18px; margin-right: 10px;">🤝</span>
                    <span style="color: {BRAND_COLORS['text_dark']}; font-size: 14px;"><strong>Networking Events</strong> — Foster collaboration and partnerships</span>
                </td>
            </tr>
        </table>

        <h2 style="color: {BRAND_COLORS['primary_blue']}; font-size: 18px; margin: 30px 0 15px 0; font-weight: 600;">
            Conference Support Levels
        </h2>

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 25px;">
            <tr>
                <td style="padding: 12px 15px; background: #f8fafc; border-left: 4px solid {BRAND_COLORS['accent_teal']};">
                    <strong style="color: {BRAND_COLORS['primary_blue']};">Friend</strong> <span style="color: {BRAND_COLORS['text_muted']};">— $50-$149</span><br>
                    <span style="font-size: 13px; color: {BRAND_COLORS['text_dark']};">Name in conference program</span>
                </td>
            </tr>
            <tr><td style="height: 8px;"></td></tr>
            <tr>
                <td style="padding: 12px 15px; background: #f0f7ff; border-left: 4px solid {BRAND_COLORS['secondary_blue']};">
                    <strong style="color: {BRAND_COLORS['primary_blue']};">Supporter</strong> <span style="color: {BRAND_COLORS['text_muted']};">— $150-$299</span><br>
                    <span style="font-size: 13px; color: {BRAND_COLORS['text_dark']};">Program recognition + conference swag bag</span>
                </td>
            </tr>
            <tr><td style="height: 8px;"></td></tr>
            <tr>
                <td style="padding: 12px 15px; background: #e8f4f8; border-left: 4px solid {BRAND_COLORS['primary_blue']};">
                    <strong style="color: {BRAND_COLORS['primary_blue']};">Patron</strong> <span style="color: {BRAND_COLORS['text_muted']};">— $300-$499</span><br>
                    <span style="font-size: 13px; color: {BRAND_COLORS['text_dark']};">Above + reserved seating at keynotes</span>
                </td>
            </tr>
            <tr><td style="height: 8px;"></td></tr>
            <tr>
                <td style="padding: 12px 15px; background: linear-gradient(135deg, #e8f4f8 0%, #d0e8f7 100%); border-left: 4px solid {BRAND_COLORS['success_green']};">
                    <strong style="color: {BRAND_COLORS['primary_blue']};">Champion</strong> <span style="color: {BRAND_COLORS['text_muted']};">— $500+</span><br>
                    <span style="font-size: 13px; color: {BRAND_COLORS['text_dark']};">All benefits + VIP reception with speakers</span>
                </td>
            </tr>
        </table>

        {get_button_html("Support ICSR 2026", "https://www.shellfish-society.org/icsr2026.html#donate", BRAND_COLORS['success_green'])}

        <p style="color: {BRAND_COLORS['text_muted']}; font-size: 13px; margin: 20px 0 0 0; text-align: center;">
            All donations are tax-deductible. ISRS EIN: [EIN NUMBER]
        </p>
        """

        html_content = get_base_template(content, preheader)

        text_content = f"""
Support ICSR 2026!

{'Thank you for your donation to ICSR 2024!' if icsr2024_donated else ''}
{'We hope you enjoyed ICSR 2024!' if icsr2024_attended else ''}

ICSR 2026 is coming to Bremerton, Washington — the heart of Pacific Northwest shellfish country!

Your donation directly supports:
• Student Travel Grants
• Keynote Speakers
• Field Trips to restoration sites
• Networking Events

Conference Support Levels:
• Friend ($50-$149) - Name in program
• Supporter ($150-$299) - Program + swag bag
• Patron ($300-$499) - Above + reserved seating
• Champion ($500+) - All benefits + VIP reception

Support ICSR 2026: https://www.shellfish-society.org/icsr2026.html#donate

All donations are tax-deductible.

---
International Shellfish Restoration Society
        """

        return await self.send_email(to_email, subject, html_content, text_content)

    # =========================================================================
    # SPEAKER/PRESENTER INVITATION EMAILS
    # =========================================================================

    async def send_speaker_invitation(
        self,
        to_email: str,
        first_name: str,
        last_name: str,
        icsr2024_speaker: bool = False,
        icsr2024_talk_title: str = None,
        suggested_topic: str = None,
        session_type: str = "oral",  # "oral", "keynote", "panel"
        abstract_deadline: str = None,
        travel_support_available: bool = False,
    ) -> bool:
        """
        Send invitation to speak at ICSR 2026.

        Args:
            to_email: Recipient email
            first_name: Speaker's first name
            last_name: Speaker's last name
            icsr2024_speaker: Whether they spoke at ICSR 2024
            icsr2024_talk_title: Title of their ICSR 2024 talk
            suggested_topic: Suggested topic for their talk
            session_type: Type of session (oral, keynote, panel)
            abstract_deadline: Abstract submission deadline
            travel_support_available: Whether travel support is available

        Returns:
            True if sent successfully
        """
        session_labels = {
            "oral": "oral presentation",
            "keynote": "keynote address",
            "panel": "panel discussion"
        }
        session_label = session_labels.get(session_type, "presentation")

        subject = f"ICSR 2026 - Invitation to Speak"
        preheader = f"We'd love to have you present at the 7th International Conference on Shellfish Restoration"

        # Build personalized opening
        if icsr2024_speaker and icsr2024_talk_title:
            opening = f"""
            <p style="color: {BRAND_COLORS['text_dark']}; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                Your presentation at ICSR 2024 — <em>"{icsr2024_talk_title}"</em> — was a highlight of the conference
                and generated excellent discussion among attendees. We would be honored to have you return as a
                speaker at ICSR 2026!
            </p>
            """
        elif icsr2024_speaker:
            opening = f"""
            <p style="color: {BRAND_COLORS['text_dark']}; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                Thank you for your excellent contribution to ICSR 2024! Your presentation was well-received,
                and we would be honored to have you return as a speaker at ICSR 2026.
            </p>
            """
        else:
            opening = f"""
            <p style="color: {BRAND_COLORS['text_dark']}; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                Your work in shellfish restoration has made a significant impact on our field. We would be
                honored to have you share your expertise as a speaker at ICSR 2026.
            </p>
            """

        topic_section = ""
        if suggested_topic:
            topic_section = f"""
            {get_info_box_html(f'''
                <p style="margin: 0 0 8px 0; font-size: 13px; color: {BRAND_COLORS["text_muted"]};">Suggested Topic:</p>
                <p style="margin: 0; font-size: 15px; color: {BRAND_COLORS["primary_blue"]}; font-weight: 500;">{suggested_topic}</p>
                <p style="margin: 10px 0 0 0; font-size: 13px; color: {BRAND_COLORS["text_muted"]};">
                    (Of course, we welcome your own topic ideas as well!)
                </p>
            ''')}
            """

        travel_section = ""
        if travel_support_available:
            travel_section = f"""
            {get_success_box_html(f'''
                <p style="margin: 0; font-size: 14px; color: {BRAND_COLORS["text_dark"]};">
                    <strong>✈️ Travel Support Available:</strong> Limited travel grants are available for speakers.
                    Let us know if you need assistance with travel or accommodation.
                </p>
            ''')}
            """

        content = f"""
        <h1 style="color: {BRAND_COLORS['primary_blue']}; font-size: 26px; margin: 0 0 20px 0; font-weight: 600;">
            Dear Dr. {last_name}, 🎤
        </h1>

        {opening}

        <p style="color: {BRAND_COLORS['text_dark']}; font-size: 16px; line-height: 1.7; margin: 0 0 25px 0;">
            We are pleased to invite you to deliver a <strong>{session_label}</strong> at the
            7th International Conference on Shellfish Restoration (ICSR 2026) in Bremerton, Washington.
        </p>

        {topic_section}

        <h2 style="color: {BRAND_COLORS['primary_blue']}; font-size: 18px; margin: 25px 0 15px 0; font-weight: 600;">
            Conference Details
        </h2>

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 20px;">
            <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid {BRAND_COLORS['border']};">
                    <span style="color: {BRAND_COLORS['text_muted']}; font-size: 13px; display: inline-block; width: 120px;">Event:</span>
                    <span style="color: {BRAND_COLORS['text_dark']}; font-size: 14px;">ICSR 2026</span>
                </td>
            </tr>
            <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid {BRAND_COLORS['border']};">
                    <span style="color: {BRAND_COLORS['text_muted']}; font-size: 13px; display: inline-block; width: 120px;">Location:</span>
                    <span style="color: {BRAND_COLORS['text_dark']}; font-size: 14px;">Bremerton, Washington, USA</span>
                </td>
            </tr>
            <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid {BRAND_COLORS['border']};">
                    <span style="color: {BRAND_COLORS['text_muted']}; font-size: 13px; display: inline-block; width: 120px;">Session Type:</span>
                    <span style="color: {BRAND_COLORS['text_dark']}; font-size: 14px; text-transform: capitalize;">{session_label}</span>
                </td>
            </tr>
            {f'''<tr>
                <td style="padding: 8px 0;">
                    <span style="color: {BRAND_COLORS['text_muted']}; font-size: 13px; display: inline-block; width: 120px;">Abstract Due:</span>
                    <span style="color: {BRAND_COLORS['text_dark']}; font-size: 14px; font-weight: 500;">{abstract_deadline}</span>
                </td>
            </tr>''' if abstract_deadline else ''}
        </table>

        <h2 style="color: {BRAND_COLORS['primary_blue']}; font-size: 18px; margin: 25px 0 15px 0; font-weight: 600;">
            Speaker Benefits
        </h2>

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
                <td style="padding: 8px 0;">
                    <span style="color: {BRAND_COLORS['success_green']}; margin-right: 8px;">✓</span>
                    <span style="color: {BRAND_COLORS['text_dark']}; font-size: 14px;">Complimentary conference registration</span>
                </td>
            </tr>
            <tr>
                <td style="padding: 8px 0;">
                    <span style="color: {BRAND_COLORS['success_green']}; margin-right: 8px;">✓</span>
                    <span style="color: {BRAND_COLORS['text_dark']}; font-size: 14px;">Speaker reception and networking events</span>
                </td>
            </tr>
            <tr>
                <td style="padding: 8px 0;">
                    <span style="color: {BRAND_COLORS['success_green']}; margin-right: 8px;">✓</span>
                    <span style="color: {BRAND_COLORS['text_dark']}; font-size: 14px;">Presentation featured in conference proceedings</span>
                </td>
            </tr>
            <tr>
                <td style="padding: 8px 0;">
                    <span style="color: {BRAND_COLORS['success_green']}; margin-right: 8px;">✓</span>
                    <span style="color: {BRAND_COLORS['text_dark']}; font-size: 14px;">Discounted hotel rates at conference venues</span>
                </td>
            </tr>
        </table>

        {travel_section}

        {get_button_html("Accept Invitation", "https://www.shellfish-society.org/icsr2026.html#speakers")}

        <p style="color: {BRAND_COLORS['text_dark']}; font-size: 15px; line-height: 1.7; margin: 25px 0;">
            Please reply to this email to confirm your interest or if you have any questions.
            We would be happy to discuss session topics, timing, or any other details.
        </p>

        <p style="color: {BRAND_COLORS['text_muted']}; font-size: 14px; margin: 20px 0 0 0;">
            We hope to welcome you to Bremerton!
        </p>
        """

        html_content = get_base_template(content, preheader)

        text_content = f"""
Dear Dr. {last_name},

{'Your presentation at ICSR 2024 was a highlight of the conference!' if icsr2024_speaker else 'Your work in shellfish restoration has made a significant impact.'}

We are pleased to invite you to deliver a {session_label} at ICSR 2026 in Bremerton, Washington.

{f'Suggested Topic: {suggested_topic}' if suggested_topic else ''}

Conference Details:
• Event: ICSR 2026
• Location: Bremerton, Washington, USA
• Session Type: {session_label.title()}
{f'• Abstract Deadline: {abstract_deadline}' if abstract_deadline else ''}

Speaker Benefits:
✓ Complimentary conference registration
✓ Speaker reception and networking events
✓ Presentation in conference proceedings
✓ Discounted hotel rates

{'Travel Support: Limited travel grants are available for speakers.' if travel_support_available else ''}

Please reply to this email to confirm your interest or discuss details.

Learn more: https://www.shellfish-society.org/icsr2026.html#speakers

We hope to welcome you to Bremerton!

---
International Shellfish Restoration Society
ICSR 2026 Program Committee
        """

        return await self.send_email(to_email, subject, html_content, text_content)

    async def send_poster_presenter_invitation(
        self,
        to_email: str,
        first_name: str,
        last_name: str,
        icsr2024_poster: bool = False,
        icsr2024_poster_title: str = None,
        abstract_deadline: str = None,
        student_rate_available: bool = True,
    ) -> bool:
        """
        Send invitation to present a poster at ICSR 2026.

        Args:
            to_email: Recipient email
            first_name: Presenter's first name
            last_name: Presenter's last name
            icsr2024_poster: Whether they presented a poster at ICSR 2024
            icsr2024_poster_title: Title of their ICSR 2024 poster
            abstract_deadline: Abstract submission deadline
            student_rate_available: Whether student rates apply

        Returns:
            True if sent successfully
        """
        subject = "ICSR 2026 - Present Your Research (Poster Session)"
        preheader = f"{first_name}, share your shellfish restoration research at ICSR 2026"

        if icsr2024_poster and icsr2024_poster_title:
            opening = f"""
            <p style="color: {BRAND_COLORS['text_dark']}; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                Your poster at ICSR 2024 — <em>"{icsr2024_poster_title}"</em> — sparked great conversations
                and showcased important work in our field. We'd love to see you share your latest research
                at ICSR 2026!
            </p>
            """
        elif icsr2024_poster:
            opening = f"""
            <p style="color: {BRAND_COLORS['text_dark']}; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                Thank you for presenting your research at ICSR 2024! Your poster was a valuable addition
                to the conference. We hope you'll join us again at ICSR 2026 with your latest findings.
            </p>
            """
        else:
            opening = f"""
            <p style="color: {BRAND_COLORS['text_dark']}; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                We invite you to present your shellfish restoration research at ICSR 2026! Our poster sessions
                are an excellent opportunity to share your work, get feedback, and connect with researchers
                from around the world.
            </p>
            """

        content = f"""
        <h1 style="color: {BRAND_COLORS['primary_blue']}; font-size: 26px; margin: 0 0 20px 0; font-weight: 600;">
            Call for Posters 📊
        </h1>

        <p style="color: {BRAND_COLORS['text_dark']}; font-size: 16px; line-height: 1.7; margin: 0 0 10px 0;">
            Dear {first_name},
        </p>

        {opening}

        {get_info_box_html(f'''
            <p style="margin: 0 0 10px 0; font-size: 14px; color: {BRAND_COLORS["text_dark"]};">
                <strong>ICSR 2026 Poster Session</strong>
            </p>
            <p style="margin: 0 0 5px 0; font-size: 13px; color: {BRAND_COLORS["text_muted"]};">
                📍 Bremerton, Washington, USA
            </p>
            {f'<p style="margin: 0; font-size: 13px; color: {BRAND_COLORS["text_muted"]};"><strong>Abstract Deadline:</strong> {abstract_deadline}</p>' if abstract_deadline else ''}
        ''')}

        <h2 style="color: {BRAND_COLORS['primary_blue']}; font-size: 18px; margin: 25px 0 15px 0; font-weight: 600;">
            Why Present a Poster?
        </h2>

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid {BRAND_COLORS['border']};">
                    <span style="font-size: 18px; margin-right: 10px;">💬</span>
                    <span style="color: {BRAND_COLORS['text_dark']}; font-size: 14px;"><strong>Direct feedback</strong> from experts in your field</span>
                </td>
            </tr>
            <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid {BRAND_COLORS['border']};">
                    <span style="font-size: 18px; margin-right: 10px;">🤝</span>
                    <span style="color: {BRAND_COLORS['text_dark']}; font-size: 14px;"><strong>Network</strong> with potential collaborators</span>
                </td>
            </tr>
            <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid {BRAND_COLORS['border']};">
                    <span style="font-size: 18px; margin-right: 10px;">📝</span>
                    <span style="color: {BRAND_COLORS['text_dark']}; font-size: 14px;"><strong>Publication</strong> in conference proceedings</span>
                </td>
            </tr>
            <tr>
                <td style="padding: 10px 0;">
                    <span style="font-size: 18px; margin-right: 10px;">🏆</span>
                    <span style="color: {BRAND_COLORS['text_dark']}; font-size: 14px;"><strong>Awards</strong> for best student posters</span>
                </td>
            </tr>
        </table>

        {get_success_box_html(f'''
            <p style="margin: 0; font-size: 14px; color: {BRAND_COLORS["text_dark"]};">
                <strong>🎓 Student Presenters:</strong> Reduced registration rates available!
                Student travel grants may also be available.
            </p>
        ''') if student_rate_available else ''}

        {get_button_html("Submit Your Abstract", "https://www.shellfish-society.org/icsr2026.html#abstracts")}

        <p style="color: {BRAND_COLORS['text_muted']}; font-size: 14px; margin: 20px 0 0 0; text-align: center;">
            Questions about poster presentations? Reply to this email.
        </p>
        """

        html_content = get_base_template(content, preheader)

        text_content = f"""
Call for Posters - ICSR 2026

Dear {first_name},

{'Your poster at ICSR 2024 sparked great conversations!' if icsr2024_poster else 'We invite you to present your research at ICSR 2026!'}

ICSR 2026 Poster Session
📍 Bremerton, Washington, USA
{f'Abstract Deadline: {abstract_deadline}' if abstract_deadline else ''}

Why Present a Poster?
• Direct feedback from experts in your field
• Network with potential collaborators
• Publication in conference proceedings
• Awards for best student posters

{'Student Presenters: Reduced registration rates and travel grants available!' if student_rate_available else ''}

Submit Your Abstract: https://www.shellfish-society.org/icsr2026.html#abstracts

Questions? Reply to this email.

---
International Shellfish Restoration Society
        """

        return await self.send_email(to_email, subject, html_content, text_content)

    async def send_student_invitation(
        self,
        to_email: str,
        first_name: str,
        icsr2024_attended: bool = False,
        icsr2024_role: str = None,
        university: str = None,
        travel_grant_available: bool = True,
        abstract_deadline: str = None,
    ) -> bool:
        """
        Send invitation to students to attend ICSR 2026.

        Args:
            to_email: Recipient email
            first_name: Student's first name
            icsr2024_attended: Whether they attended ICSR 2024
            icsr2024_role: Their role at ICSR 2024
            university: Student's university
            travel_grant_available: Whether travel grants are available
            abstract_deadline: Abstract submission deadline

        Returns:
            True if sent successfully
        """
        subject = "ICSR 2026 - Student Invitation"
        preheader = f"{first_name}, join the next generation of shellfish restoration leaders"

        if icsr2024_attended:
            role_text = {
                "poster": "presenting your poster",
                "attendee": "joining us",
                "volunteer": "volunteering"
            }.get(icsr2024_role, "participating")
            opening = f"""
            <p style="color: {BRAND_COLORS['text_dark']}; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                It was great having you at ICSR 2024! Thank you for {role_text} — your energy and fresh
                perspectives are exactly what our community needs. We hope you'll join us again at ICSR 2026!
            </p>
            """
        else:
            opening = f"""
            <p style="color: {BRAND_COLORS['text_dark']}; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                As a student{f' at {university}' if university else ''} interested in marine science and conservation,
                you have the opportunity to help shape the future of shellfish restoration. ICSR 2026 is the
                perfect place to learn from leading experts and launch your career in this vital field.
            </p>
            """

        content = f"""
        <h1 style="color: {BRAND_COLORS['primary_blue']}; font-size: 26px; margin: 0 0 20px 0; font-weight: 600;">
            Students Welcome! 🎓
        </h1>

        <p style="color: {BRAND_COLORS['text_dark']}; font-size: 16px; line-height: 1.7; margin: 0 0 10px 0;">
            Dear {first_name},
        </p>

        {opening}

        {get_info_box_html(f'''
            <p style="margin: 0 0 10px 0; font-size: 16px; color: {BRAND_COLORS["primary_blue"]}; font-weight: 600;">
                🐚 ICSR 2026 — Bremerton, Washington
            </p>
            <p style="margin: 0; font-size: 14px; color: {BRAND_COLORS["text_dark"]};">
                The 7th International Conference on Shellfish Restoration brings together researchers,
                practitioners, and students from around the world.
            </p>
        ''')}

        <h2 style="color: {BRAND_COLORS['primary_blue']}; font-size: 18px; margin: 25px 0 15px 0; font-weight: 600;">
            Why Attend as a Student?
        </h2>

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid {BRAND_COLORS['border']};">
                    <span style="font-size: 18px; margin-right: 10px;">🔬</span>
                    <span style="color: {BRAND_COLORS['text_dark']}; font-size: 14px;"><strong>Learn</strong> cutting-edge restoration techniques</span>
                </td>
            </tr>
            <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid {BRAND_COLORS['border']};">
                    <span style="font-size: 18px; margin-right: 10px;">🤝</span>
                    <span style="color: {BRAND_COLORS['text_dark']}; font-size: 14px;"><strong>Network</strong> with future employers and mentors</span>
                </td>
            </tr>
            <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid {BRAND_COLORS['border']};">
                    <span style="font-size: 18px; margin-right: 10px;">📊</span>
                    <span style="color: {BRAND_COLORS['text_dark']}; font-size: 14px;"><strong>Present</strong> your research (posters welcome!)</span>
                </td>
            </tr>
            <tr>
                <td style="padding: 10px 0;">
                    <span style="font-size: 18px; margin-right: 10px;">🌍</span>
                    <span style="color: {BRAND_COLORS['text_dark']}; font-size: 14px;"><strong>Connect</strong> with a global community</span>
                </td>
            </tr>
        </table>

        {get_success_box_html(f'''
            <p style="margin: 0 0 10px 0; font-size: 15px; color: {BRAND_COLORS["text_dark"]}; font-weight: 600;">
                💰 Student Benefits:
            </p>
            <ul style="margin: 0; padding-left: 20px; color: {BRAND_COLORS["text_dark"]}; font-size: 14px; line-height: 1.8;">
                <li><strong>Reduced registration fee</strong> for students</li>
                {'<li><strong>Travel grants</strong> available (apply early!)</li>' if travel_grant_available else ''}
                <li><strong>Best poster awards</strong> with cash prizes</li>
                <li><strong>Student mixer</strong> networking event</li>
            </ul>
        ''')}

        {f'''
        {get_warning_box_html(f"""
            <p style="margin: 0; font-size: 14px; color: #92400e;">
                <strong>📅 Important Deadline:</strong> Abstract submissions due {abstract_deadline}.
                Don't miss your chance to present!
            </p>
        """)}
        ''' if abstract_deadline else ''}

        {get_button_html("Register as Student", "https://www.shellfish-society.org/icsr2026.html#register")}

        <p style="color: {BRAND_COLORS['text_muted']}; font-size: 14px; margin: 20px 0 0 0; text-align: center;">
            Questions? Reply to this email or contact us at info@shellfish-society.org
        </p>
        """

        html_content = get_base_template(content, preheader)

        text_content = f"""
Students Welcome - ICSR 2026!

Dear {first_name},

{'Great to have you at ICSR 2024!' if icsr2024_attended else f'As a student{f" at {university}" if university else ""}, you have the opportunity to shape the future of shellfish restoration.'}

ICSR 2026 — Bremerton, Washington
The 7th International Conference on Shellfish Restoration

Why Attend as a Student?
• Learn cutting-edge restoration techniques
• Network with future employers and mentors
• Present your research (posters welcome!)
• Connect with a global community

Student Benefits:
• Reduced registration fee
{'• Travel grants available (apply early!)' if travel_grant_available else ''}
• Best poster awards with cash prizes
• Student mixer networking event

{f'Abstract Deadline: {abstract_deadline}' if abstract_deadline else ''}

Register: https://www.shellfish-society.org/icsr2026.html#register

Questions? Reply to this email.

---
International Shellfish Restoration Society
        """

        return await self.send_email(to_email, subject, html_content, text_content)

    async def send_exhibitor_invitation(
        self,
        to_email: str,
        contact_name: str,
        company_name: str,
        icsr2024_exhibitor: bool = False,
        booth_price: float = None,
        early_bird_deadline: str = None,
        expected_attendance: int = None,
    ) -> bool:
        """
        Send exhibitor booth invitation for ICSR 2026.

        Args:
            to_email: Recipient email
            contact_name: Contact person's name
            company_name: Company/organization name
            icsr2024_exhibitor: Whether they exhibited at ICSR 2024
            booth_price: Booth price
            early_bird_deadline: Early bird pricing deadline
            expected_attendance: Expected conference attendance

        Returns:
            True if sent successfully
        """
        subject = f"ICSR 2026 - Exhibit Opportunity"
        preheader = f"Reach {expected_attendance or 300}+ shellfish restoration professionals"

        if icsr2024_exhibitor:
            opening = f"""
            <p style="color: {BRAND_COLORS['text_dark']}; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                Thank you for exhibiting at ICSR 2024! Your booth was a valuable resource for our attendees,
                and we received positive feedback about {company_name}'s presence. We'd love to have you
                back at ICSR 2026 in Bremerton, Washington.
            </p>
            """
        else:
            opening = f"""
            <p style="color: {BRAND_COLORS['text_dark']}; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                ICSR 2026 offers an excellent opportunity for {company_name} to connect with
                {expected_attendance or 300}+ researchers, practitioners, and decision-makers working in
                shellfish restoration worldwide.
            </p>
            """

        price_section = ""
        if booth_price:
            price_section = f"""
            <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid {BRAND_COLORS['border']};">
                    <span style="color: {BRAND_COLORS['text_muted']}; font-size: 13px; display: inline-block; width: 140px;">Booth Fee:</span>
                    <span style="color: {BRAND_COLORS['text_dark']}; font-size: 14px; font-weight: 600;">${booth_price:,.0f}</span>
                </td>
            </tr>
            """

        content = f"""
        <h1 style="color: {BRAND_COLORS['primary_blue']}; font-size: 26px; margin: 0 0 20px 0; font-weight: 600;">
            Exhibit at ICSR 2026 🏢
        </h1>

        <p style="color: {BRAND_COLORS['text_dark']}; font-size: 16px; line-height: 1.7; margin: 0 0 10px 0;">
            Dear {contact_name},
        </p>

        {opening}

        {get_info_box_html(f'''
            <p style="margin: 0 0 10px 0; font-size: 16px; color: {BRAND_COLORS["primary_blue"]}; font-weight: 600;">
                📍 ICSR 2026 — Bremerton, Washington
            </p>
            <p style="margin: 0; font-size: 14px; color: {BRAND_COLORS["text_dark"]};">
                7th International Conference on Shellfish Restoration
            </p>
        ''')}

        <h2 style="color: {BRAND_COLORS['primary_blue']}; font-size: 18px; margin: 25px 0 15px 0; font-weight: 600;">
            Exhibitor Package Includes:
        </h2>

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
                <td style="padding: 8px 0;">
                    <span style="color: {BRAND_COLORS['success_green']}; margin-right: 8px;">✓</span>
                    <span style="color: {BRAND_COLORS['text_dark']}; font-size: 14px;">6' draped table with chairs</span>
                </td>
            </tr>
            <tr>
                <td style="padding: 8px 0;">
                    <span style="color: {BRAND_COLORS['success_green']}; margin-right: 8px;">✓</span>
                    <span style="color: {BRAND_COLORS['text_dark']}; font-size: 14px;">Company signage</span>
                </td>
            </tr>
            <tr>
                <td style="padding: 8px 0;">
                    <span style="color: {BRAND_COLORS['success_green']}; margin-right: 8px;">✓</span>
                    <span style="color: {BRAND_COLORS['text_dark']}; font-size: 14px;">Two exhibitor registrations (full conference access)</span>
                </td>
            </tr>
            <tr>
                <td style="padding: 8px 0;">
                    <span style="color: {BRAND_COLORS['success_green']}; margin-right: 8px;">✓</span>
                    <span style="color: {BRAND_COLORS['text_dark']}; font-size: 14px;">Listing in conference program and website</span>
                </td>
            </tr>
            <tr>
                <td style="padding: 8px 0;">
                    <span style="color: {BRAND_COLORS['success_green']}; margin-right: 8px;">✓</span>
                    <span style="color: {BRAND_COLORS['text_dark']}; font-size: 14px;">Access to attendee list (with permission)</span>
                </td>
            </tr>
            <tr>
                <td style="padding: 8px 0;">
                    <span style="color: {BRAND_COLORS['success_green']}; margin-right: 8px;">✓</span>
                    <span style="color: {BRAND_COLORS['text_dark']}; font-size: 14px;">Wifi and electrical access</span>
                </td>
            </tr>
        </table>

        <h2 style="color: {BRAND_COLORS['primary_blue']}; font-size: 18px; margin: 25px 0 15px 0; font-weight: 600;">
            Details
        </h2>

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 20px;">
            <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid {BRAND_COLORS['border']};">
                    <span style="color: {BRAND_COLORS['text_muted']}; font-size: 13px; display: inline-block; width: 140px;">Expected Attendance:</span>
                    <span style="color: {BRAND_COLORS['text_dark']}; font-size: 14px;">{expected_attendance or '300'}+ professionals</span>
                </td>
            </tr>
            {price_section}
            <tr>
                <td style="padding: 8px 0;">
                    <span style="color: {BRAND_COLORS['text_muted']}; font-size: 13px; display: inline-block; width: 140px;">Exhibit Days:</span>
                    <span style="color: {BRAND_COLORS['text_dark']}; font-size: 14px;">Full conference duration</span>
                </td>
            </tr>
        </table>

        {f'''
        {get_warning_box_html(f"""
            <p style="margin: 0; font-size: 14px; color: #92400e;">
                <strong>⏰ Early Bird Pricing:</strong> Reserve your booth by {early_bird_deadline} for priority placement!
            </p>
        """)}
        ''' if early_bird_deadline else ''}

        <h2 style="color: {BRAND_COLORS['primary_blue']}; font-size: 18px; margin: 25px 0 15px 0; font-weight: 600;">
            Who Attends ICSR?
        </h2>

        <p style="color: {BRAND_COLORS['text_dark']}; font-size: 14px; line-height: 1.7; margin: 0 0 20px 0;">
            Researchers • Restoration practitioners • Government agencies • NGOs •
            Equipment manufacturers • Hatchery operators • Consulting firms • Students
        </p>

        {get_button_html("Reserve Your Booth", "https://www.shellfish-society.org/icsr2026.html#exhibit")}

        <p style="color: {BRAND_COLORS['text_dark']}; font-size: 15px; line-height: 1.7; margin: 25px 0;">
            Reply to this email to reserve your booth or discuss your needs.
            {'As a returning exhibitor, you have priority booth placement!' if icsr2024_exhibitor else 'Booths are assigned on a first-come, first-served basis.'}
        </p>
        """

        html_content = get_base_template(content, preheader)

        text_content = f"""
Exhibit at ICSR 2026

Dear {contact_name},

{'Thank you for exhibiting at ICSR 2024! We would love to have {company_name} back.' if icsr2024_exhibitor else f'ICSR 2026 offers an excellent opportunity for {company_name} to connect with {expected_attendance or 300}+ professionals.'}

ICSR 2026 — Bremerton, Washington
7th International Conference on Shellfish Restoration

Exhibitor Package Includes:
✓ 6' draped table with chairs
✓ Company signage
✓ Two exhibitor registrations
✓ Listing in program and website
✓ Access to attendee list
✓ Wifi and electrical access

Details:
• Expected Attendance: {expected_attendance or 300}+ professionals
{f'• Booth Fee: ${booth_price:,.0f}' if booth_price else ''}
• Exhibit Days: Full conference

{f'Early Bird Deadline: {early_bird_deadline}' if early_bird_deadline else ''}

Who Attends: Researchers, restoration practitioners, government agencies, NGOs, equipment manufacturers, hatchery operators, consulting firms, students

Reserve Your Booth: https://www.shellfish-society.org/icsr2026.html#exhibit

Reply to this email to reserve or discuss your needs.

---
International Shellfish Restoration Society
        """

        return await self.send_email(to_email, subject, html_content, text_content)


# Global email service instance
email_service = EmailService()
