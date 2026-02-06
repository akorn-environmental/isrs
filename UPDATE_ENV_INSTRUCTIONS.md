# Update Local .env with AWS SES Credentials

## Instructions

You need to copy the AWS credentials from your Render dashboard to your local `.env` file.

### Step 1: Get AWS Credentials from Render

Go to your Render dashboard and click on each of these environment variables to reveal the values:

1. **AWS_ACCESS_KEY_ID** - Click to reveal and copy the value
2. **AWS_SECRET_ACCESS_KEY** - Click to reveal and copy the value
3. **AWS_REGION** - Click to reveal and copy the value
4. **AWS_SES_REGION** - Click to reveal and copy the value (if different from AWS_REGION)

### Step 2: Update Your Local .env File

Open: `/Users/akorn/Desktop/ITERM PROJECTS/ISRS/backend-python/.env`

Replace these lines:
```bash
EMAIL_SERVICE=ses
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID_HERE
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY_HERE
```

With the actual values from Render:
```bash
EMAIL_SERVICE=ses
AWS_REGION=<paste value from Render>
AWS_ACCESS_KEY_ID=<paste value from Render>
AWS_SECRET_ACCESS_KEY=<paste value from Render>
```

### Step 3: Test the Email Send

Once you've updated the .env file, run:
```bash
cd /Users/akorn/Desktop/ITERM\ PROJECTS/ISRS/backend-python
python3 scripts/send_icsr2026_save_the_date.py
```

## Alternative: Quick Test

If you don't want to update the local .env file, I can create a test script that reads the credentials directly from you.

Let me know which approach you prefer!
