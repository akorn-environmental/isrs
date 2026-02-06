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

## Verification
To verify the email receiving is working:
1. Forward a test email to `inbox@shellfish-society.org`
2. Check the backend logs for processing confirmation
3. Check the database for extracted contacts
