"""
S3 Email Service
Downloads and manages emails from S3 bucket
"""
import logging
from typing import Optional
import boto3
from botocore.exceptions import ClientError
from app.config import settings

logger = logging.getLogger(__name__)


class S3EmailService:
    """Service for downloading emails from S3"""

    def __init__(self):
        """Initialize S3 client"""
        self.s3_client = boto3.client(
            's3',
            region_name=settings.AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )
        self.bucket_name = settings.INBOUND_EMAIL_BUCKET

    async def download_email(self, s3_key: str) -> Optional[bytes]:
        """
        Download email content from S3

        Args:
            s3_key: S3 object key for the email

        Returns:
            Email content as bytes, or None if download fails
        """
        try:
            logger.info(f"[S3] Downloading email from s3://{self.bucket_name}/{s3_key}")

            response = self.s3_client.get_object(
                Bucket=self.bucket_name,
                Key=s3_key
            )

            email_content = response['Body'].read()
            logger.info(f"[S3] Successfully downloaded email ({len(email_content)} bytes)")

            return email_content

        except ClientError as e:
            error_code = e.response.get('Error', {}).get('Code', 'Unknown')
            logger.error(f"[S3] Failed to download email: {error_code} - {str(e)}")
            return None

        except Exception as e:
            logger.error(f"[S3] Unexpected error downloading email: {str(e)}", exc_info=True)
            return None

    async def check_email_exists(self, s3_key: str) -> bool:
        """
        Check if an email exists in S3

        Args:
            s3_key: S3 object key for the email

        Returns:
            True if email exists, False otherwise
        """
        try:
            self.s3_client.head_object(
                Bucket=self.bucket_name,
                Key=s3_key
            )
            return True

        except ClientError as e:
            error_code = e.response.get('Error', {}).get('Code', 'Unknown')
            if error_code == '404':
                return False
            logger.error(f"[S3] Error checking email existence: {error_code} - {str(e)}")
            return False

        except Exception as e:
            logger.error(f"[S3] Unexpected error checking email existence: {str(e)}")
            return False
