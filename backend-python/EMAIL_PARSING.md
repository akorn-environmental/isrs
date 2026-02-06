# Email Parsing Configuration

## Overview
The ISRS system can automatically parse emails forwarded to a designated email address. Contacts, organizations, and other data are extracted using AI and stored in the database.

## Email Address for Parsing
**Forward emails to**: `inbox@shellfish-society.org`

## How It Works
1. You forward an email to `inbox@shellfish-society.org`
2. AWS SES receives the email
3. Email is stored in S3 bucket: `isrs-inbound-emails`
4. SNS notification triggers the backend webhook
5. Backend downloads email from S3
6. AI extracts contacts, organizations, and metadata
7. Data is saved to the database

## AWS SES Configuration
- **Rule Set**: `isrs-inbound-emails` (Active)
- **Receipt Rule**: `admin-email-parsing` (Enabled)
- **S3 Bucket**: `isrs-inbound-emails`
- **SNS Topic**: `arn:aws:sns:us-east-1:995726271930:isrs-inbound-emails`
- **Region**: us-east-1 (N. Virginia)

## Backend Webhook
The backend receives SNS notifications when emails arrive and processes them automatically.

## Usage
Simply forward any email to `inbox@shellfish-society.org` and the system will:
- Extract sender information (name, email, organization)
- Extract recipient information
- Extract mentioned contacts from email body
- Extract organizations mentioned
- Store all data in the database for easy access

## Bounceback Handling (Automatic)
When you forward an email to `inbox@shellfish-society.org` and it contains a bounceback notification:
- The system automatically detects the bounceback
- Extracts the failed email address from the bounce message
- **If it's a primary email**: Promotes the first alternate email to primary (if available), or deletes the contact entirely
- **If it's an alternate email**: Removes it from the alternate_emails array
- Logs the action for audit trail

**This means invalid email addresses are automatically cleaned from your contact database when bouncebacks are forwarded.**

## Multiple Email Addresses per Contact
Contacts can now have multiple email addresses:
- **Primary email** (`email` field): The main contact email
- **Alternate emails** (`alternate_emails` array): Additional email addresses for the same person

When a bounceback occurs:
- If the primary email bounces and alternates exist → first alternate becomes new primary
- If the primary email bounces and no alternates exist → contact is deleted
- If an alternate email bounces → it's removed from the array

## Verification
To verify the email receiving is working:
1. Forward a test email to `inbox@shellfish-society.org`
2. Check the backend logs for processing confirmation
3. Check the database for extracted contacts

To verify bounceback handling:
1. Forward a bounceback notification to `inbox@shellfish-society.org`
2. Check backend logs for "Detected bounceback notification"
3. Verify the invalid email was removed from the contact record
