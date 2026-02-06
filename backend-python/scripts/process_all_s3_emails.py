"""
Process all emails from S3 that haven't been parsed yet
Run this script to backfill emails that were sent before the backend was deployed
"""
import asyncio
import boto3
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.services.email_processing_service import EmailProcessingService


async def process_all_s3_emails():
    """Process all unprocessed emails from S3"""

    # Initialize services
    s3 = boto3.client('s3', region_name='us-east-1')
    bucket = 'isrs-inbound-emails'
    email_service = EmailProcessingService()

    # Get all emails from S3
    print("Fetching emails from S3...")
    response = s3.list_objects_v2(Bucket=bucket, MaxKeys=100)

    if 'Contents' not in response:
        print("No emails found in S3")
        return

    # Filter out setup notifications
    all_emails = [
        obj for obj in response['Contents']
        if 'SETUP_NOTIFICATION' not in obj['Key']
    ]

    print(f"Found {len(all_emails)} emails in S3")

    # Get already processed emails
    db = SessionLocal()
    try:
        processed_keys = set()
        result = db.execute("SELECT message_id FROM parsed_emails")
        for row in result:
            processed_keys.add(row[0])

        print(f"Already processed: {len(processed_keys)} emails")

        # Find unprocessed emails
        unprocessed = [
            email for email in all_emails
            if email['Key'] not in processed_keys
        ]

        print(f"Unprocessed: {len(unprocessed)} emails")

        if not unprocessed:
            print("All emails already processed!")
            return

        # Process each unprocessed email
        for i, email_obj in enumerate(unprocessed, 1):
            s3_key = email_obj['Key']
            message_id = s3_key  # Use S3 key as message ID

            print(f"\n[{i}/{len(unprocessed)}] Processing: {s3_key}")
            print(f"  Size: {email_obj['Size']} bytes")
            print(f"  Modified: {email_obj['LastModified']}")

            try:
                # Process the email
                result = await email_service.process_email(
                    s3_key=s3_key,
                    message_id=message_id,
                    db=db
                )

                if result:
                    print(f"  ✓ Successfully processed")
                    print(f"    From: {result.from_email}")
                    print(f"    Subject: {result.subject[:60]}...")
                else:
                    print(f"  ✗ Failed to process")

            except Exception as e:
                print(f"  ✗ Error: {e}")
                continue

        print(f"\n✓ Finished processing {len(unprocessed)} emails")

    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 80)
    print("EMAIL BACKFILL PROCESSOR")
    print("=" * 80)
    print()

    asyncio.run(process_all_s3_emails())

    print()
    print("=" * 80)
    print("COMPLETE")
    print("=" * 80)
