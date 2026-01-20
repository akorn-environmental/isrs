"""
Email service for sending magic link authentication emails.
Supports both SMTP (Gmail) and AWS SES.
"""
import logging
import os
from typing import Optional
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import aiosmtplib

from app.config import settings

logger = logging.getLogger(__name__)


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

    async def send_magic_link(self, to_email: str, magic_link: str) -> bool:
        """
        Send a magic link authentication email.

        Args:
            to_email: Recipient email address
            magic_link: Full magic link URL

        Returns:
            True if sent successfully, False otherwise
        """
        subject = f"Your login link for {settings.APP_NAME}"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
                <h1 style="color: #2c5282; margin-bottom: 20px;">Login to ISRS</h1>

                <p style="margin-bottom: 20px;">
                    Click the button below to log in to your ISRS account. This link will expire in {settings.MAGIC_LINK_EXPIRY_MINUTES} minutes.
                </p>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="{magic_link}"
                       style="background-color: #2c5282; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                        Log In to ISRS
                    </a>
                </div>

                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                    If you didn't request this login link, you can safely ignore this email.
                </p>

                <p style="color: #666; font-size: 14px; margin-top: 20px;">
                    <strong>Note:</strong> This link can only be used once and will expire in {settings.MAGIC_LINK_EXPIRY_MINUTES} minutes.
                </p>

                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

                <p style="color: #999; font-size: 12px; text-align: center;">
                    International Shellfish Restoration Society<br>
                    This is an automated email, please do not reply.
                </p>
            </div>
        </body>
        </html>
        """

        text_content = f"""
        Login to ISRS

        Click the link below to log in to your ISRS account:
        {magic_link}

        This link will expire in {settings.MAGIC_LINK_EXPIRY_MINUTES} minutes.

        If you didn't request this login link, you can safely ignore this email.

        International Shellfish Restoration Society
        """

        return await self.send_email(to_email, subject, html_content, text_content)

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
        subject = "New Abstract Review Assignment - ICSR2026"

        # Format due date
        due_date_str = due_date.strftime('%B %d, %Y') if due_date else "TBD"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
                <h1 style="color: #2c5282; margin-bottom: 20px;">New Review Assignment</h1>

                <p style="margin-bottom: 20px;">
                    You have been assigned to review the following abstract for ICSR2026:
                </p>

                <div style="background-color: white; padding: 20px; border-left: 4px solid #2c5282; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Title:</strong> {abstract_title}</p>
                    <p style="margin: 10px 0 0 0;"><strong>Due Date:</strong> {due_date_str}</p>
                </div>

                <p style="margin: 20px 0;">
                    Please log in to the member portal to review the full abstract and submit your evaluation.
                </p>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://www.shellfish-society.org/member/my-reviews.html"
                       style="background-color: #2c5282; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                        View Assignment
                    </a>
                </div>

                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                    Thank you for contributing your expertise to the ICSR2026 review process.
                </p>

                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

                <p style="color: #999; font-size: 12px; text-align: center;">
                    International Shellfish Restoration Society<br>
                    ICSR2026 Program Committee
                </p>
            </div>
        </body>
        </html>
        """

        text_content = f"""
        New Review Assignment - ICSR2026

        You have been assigned to review the following abstract:

        Title: {abstract_title}
        Due Date: {due_date_str}

        Please log in to complete your review:
        https://www.shellfish-society.org/member/my-reviews.html

        Thank you for contributing your expertise to the ICSR2026 review process.

        International Shellfish Restoration Society
        ICSR2026 Program Committee
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
        subject = "Review Submitted Successfully - ICSR2026"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
                <h1 style="color: #28a745; margin-bottom: 20px;">✓ Review Submitted</h1>

                <p style="margin-bottom: 20px;">
                    Thank you! Your review has been submitted successfully for:
                </p>

                <div style="background-color: white; padding: 20px; border-left: 4px solid #28a745; margin: 20px 0;">
                    <p style="margin: 0;"><strong>{abstract_title}</strong></p>
                </div>

                <p style="margin: 20px 0;">
                    The organizing committee will review all feedback and make final decisions soon.
                </p>

                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                    Your contribution helps ensure the quality and diversity of presentations at ICSR2026.
                </p>

                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

                <p style="color: #999; font-size: 12px; text-align: center;">
                    International Shellfish Restoration Society<br>
                    ICSR2026 Program Committee
                </p>
            </div>
        </body>
        </html>
        """

        text_content = f"""
        Review Submitted - ICSR2026

        Thank you! Your review has been submitted successfully for:
        {abstract_title}

        The organizing committee will review all feedback and make final decisions soon.

        Your contribution helps ensure the quality and diversity of presentations at ICSR2026.

        International Shellfish Restoration Society
        ICSR2026 Program Committee
        """

        return await self.send_email(reviewer_email, subject, html_content, text_content)

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
        subject = "Abstract Accepted - ICSR2026"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
                <h1 style="color: #28a745; margin-bottom: 20px;">🎉 Congratulations!</h1>

                <p style="margin-bottom: 20px;">
                    Your abstract has been <strong>accepted</strong> for presentation at ICSR2026:
                </p>

                <div style="background-color: white; padding: 20px; border-left: 4px solid #28a745; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Title:</strong> {abstract_title}</p>
                    <p style="margin: 10px 0 0 0;"><strong>Presentation Type:</strong> {presentation_type}</p>
                    <p style="margin: 10px 0 0 0;"><strong>Average Review Score:</strong> {average_score}/5.0</p>
                </div>

                <h2 style="color: #2c5282; margin-top: 30px;">Next Steps:</h2>
                <ul style="margin: 15px 0; padding-left: 20px;">
                    <li style="margin-bottom: 10px;">Register for the conference if you haven't already</li>
                    <li style="margin-bottom: 10px;">Prepare your presentation materials</li>
                    <li style="margin-bottom: 10px;">Check your assigned time slot (coming soon)</li>
                </ul>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://www.shellfish-society.org/icsr2026.html"
                       style="background-color: #2c5282; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                        Conference Details
                    </a>
                </div>

                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                    We look forward to your presentation at ICSR2026!
                </p>

                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

                <p style="color: #999; font-size: 12px; text-align: center;">
                    International Shellfish Restoration Society<br>
                    ICSR2026 Program Committee
                </p>
            </div>
        </body>
        </html>
        """

        text_content = f"""
        Abstract Accepted - ICSR2026

        Congratulations! Your abstract has been accepted for presentation at ICSR2026:

        Title: {abstract_title}
        Presentation Type: {presentation_type}
        Average Review Score: {average_score}/5.0

        Next Steps:
        - Register for the conference if you haven't already
        - Prepare your presentation materials
        - Check your assigned time slot (coming soon)

        Conference Details: https://www.shellfish-society.org/icsr2026.html

        We look forward to your presentation at ICSR2026!

        International Shellfish Restoration Society
        ICSR2026 Program Committee
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
        subject = "Abstract Decision - ICSR2026"

        feedback_section = ""
        if feedback_summary:
            feedback_section = f"""
                <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Reviewer Feedback:</strong></p>
                    <p style="margin: 10px 0 0 0;">{feedback_summary}</p>
                </div>
            """

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
                <h1 style="color: #2c5282; margin-bottom: 20px;">Abstract Review Decision</h1>

                <p style="margin-bottom: 20px;">
                    Thank you for submitting your abstract to ICSR2026.
                </p>

                <div style="background-color: white; padding: 20px; border-left: 4px solid #2c5282; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Title:</strong> {abstract_title}</p>
                </div>

                <p style="margin: 20px 0;">
                    After careful review by our program committee, we are unable to accept your abstract for presentation at this time.
                </p>

                {feedback_section}

                <p style="margin: 20px 0;">
                    We encourage you to:
                </p>
                <ul style="margin: 15px 0; padding-left: 20px;">
                    <li style="margin-bottom: 10px;">Attend the conference to learn about current research in the field</li>
                    <li style="margin-bottom: 10px;">Network with other researchers and practitioners</li>
                    <li style="margin-bottom: 10px;">Consider submitting to future ISRS conferences</li>
                </ul>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://www.shellfish-society.org/icsr2026.html"
                       style="background-color: #2c5282; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                        Conference Information
                    </a>
                </div>

                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                    Thank you for your interest in ICSR2026.
                </p>

                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

                <p style="color: #999; font-size: 12px; text-align: center;">
                    International Shellfish Restoration Society<br>
                    ICSR2026 Program Committee
                </p>
            </div>
        </body>
        </html>
        """

        text_content = f"""
        Abstract Review Decision - ICSR2026

        Thank you for submitting your abstract to ICSR2026.

        Title: {abstract_title}

        After careful review by our program committee, we are unable to accept your abstract for presentation at this time.

        {f'Reviewer Feedback: {feedback_summary}' if feedback_summary else ''}

        We encourage you to:
        - Attend the conference to learn about current research in the field
        - Network with other researchers and practitioners
        - Consider submitting to future ISRS conferences

        Conference Information: https://www.shellfish-society.org/icsr2026.html

        Thank you for your interest in ICSR2026.

        International Shellfish Restoration Society
        ICSR2026 Program Committee
        """

        return await self.send_email(submitter_email, subject, html_content, text_content)

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
        if status == "waitlist":
            subject = f"Event Waitlist Confirmation - {event_name}"
            title = "Added to Waitlist"
            color = "#ffc107"
        else:
            subject = f"Event Registration Confirmed - {event_name}"
            title = "Registration Confirmed!"
            color = "#28a745"

        # Format event date
        event_date_str = event_date.strftime('%B %d, %Y at %I:%M %p') if event_date else "TBD"

        # Format fee
        fee_str = f"${total_fee:.2f}" if total_fee > 0 else "Free"

        if status == "waitlist":
            message_html = f"""
                <p style="margin-bottom: 20px;">
                    You have been <strong>added to the waitlist</strong> for:
                </p>

                <div style="background-color: white; padding: 20px; border-left: 4px solid {color}; margin: 20px 0;">
                    <p style="margin: 0;"><strong>{event_name}</strong></p>
                    <p style="margin: 10px 0 0 0;"><strong>Date:</strong> {event_date_str}</p>
                </div>

                <p style="margin: 20px 0;">
                    We will notify you if a spot becomes available.
                </p>
            """

            message_text = f"""
                You have been added to the waitlist for:
                {event_name}
                Date: {event_date_str}

                We will notify you if a spot becomes available.
            """
        else:
            guest_line_html = f"<p style=\"margin: 10px 0 0 0;\"><strong>Attendees:</strong> You + {guest_count} guest(s)</p>" if guest_count > 0 else ""
            guest_line_text = f"Attendees: You + {guest_count} guest(s)" if guest_count > 0 else "Attendees: 1"

            fee_line_html = f"<p style=\"margin: 10px 0 0 0;\"><strong>Total Fee:</strong> {fee_str}</p>" if total_fee > 0 else ""
            fee_line_text = f"Total Fee: {fee_str}" if total_fee > 0 else ""

            message_html = f"""
                <p style="margin-bottom: 20px;">
                    You are <strong>registered</strong> for:
                </p>

                <div style="background-color: white; padding: 20px; border-left: 4px solid {color}; margin: 20px 0;">
                    <p style="margin: 0;"><strong>{event_name}</strong></p>
                    <p style="margin: 10px 0 0 0;"><strong>Date:</strong> {event_date_str}</p>
                    {guest_line_html}
                    {fee_line_html}
                </div>

                <p style="margin: 20px 0;">
                    We look forward to seeing you there!
                </p>
            """

            message_text = f"""
                You are registered for:
                {event_name}
                Date: {event_date_str}
                {guest_line_text}
                {fee_line_text}

                We look forward to seeing you there!
            """

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
                <h1 style="color: {color}; margin-bottom: 20px;">{title}</h1>

                {message_html}

                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

                <p style="color: #999; font-size: 12px; text-align: center;">
                    International Shellfish Restoration Society<br>
                    ICSR2026
                </p>
            </div>
        </body>
        </html>
        """

        text_content = f"""
        {title} - ICSR2026

        {message_text}

        International Shellfish Restoration Society
        ICSR2026
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
        subject = f"Spot Available! - {event_name}"

        # Format event date
        event_date_str = event_date.strftime('%B %d, %Y at %I:%M %p') if event_date else "TBD"

        # Format fee
        fee_str = f"${total_fee:.2f}" if total_fee > 0 else "Free"

        guest_line_html = f"<p style=\"margin: 10px 0 0 0;\"><strong>Attendees:</strong> You + {guest_count} guest(s)</p>" if guest_count > 0 else ""
        guest_line_text = f"Attendees: You + {guest_count} guest(s)" if guest_count > 0 else "Attendees: 1"

        fee_line_html = f"<p style=\"margin: 10px 0 0 0;\"><strong>Total Fee:</strong> {fee_str}</p>" if total_fee > 0 else ""
        fee_line_text = f"Total Fee: {fee_str}" if total_fee > 0 else ""

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
                <h1 style="color: #28a745; margin-bottom: 20px;">🎉 Spot Available!</h1>

                <p style="margin-bottom: 20px;">
                    Great news! A spot has opened up and you have been <strong>confirmed</strong> for:
                </p>

                <div style="background-color: white; padding: 20px; border-left: 4px solid #28a745; margin: 20px 0;">
                    <p style="margin: 0;"><strong>{event_name}</strong></p>
                    <p style="margin: 10px 0 0 0;"><strong>Date:</strong> {event_date_str}</p>
                    {guest_line_html}
                    {fee_line_html}
                </div>

                <p style="margin: 20px 0;">
                    Your registration is now confirmed. We look forward to seeing you there!
                </p>

                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

                <p style="color: #999; font-size: 12px; text-align: center;">
                    International Shellfish Restoration Society<br>
                    ICSR2026
                </p>
            </div>
        </body>
        </html>
        """

        text_content = f"""
        Spot Available! - ICSR2026

        Great news! A spot has opened up and you have been confirmed for:

        {event_name}
        Date: {event_date_str}
        {guest_line_text}
        {fee_line_text}

        Your registration is now confirmed. We look forward to seeing you there!

        International Shellfish Restoration Society
        ICSR2026
        """

        return await self.send_email(user_email, subject, html_content, text_content)


# Global email service instance
email_service = EmailService()
