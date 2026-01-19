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


# Global email service instance
email_service = EmailService()
