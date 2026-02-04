#!/bin/bash
# Send test emails via the deployed API

API_URL="https://isrs-python-backend-10000.onrender.com"
EMAIL="aaron.kornbluth@gmail.com"

echo "🚀 Sending all email templates to $EMAIL via deployed API"
echo ""

# We need to create an API endpoint first, or use curl with the email service directly
# For now, let me create a manual approach using the existing login endpoint

echo "Note: We need to create a dedicated test email endpoint."
echo "For now, I'll create the endpoint and then we can use it."
