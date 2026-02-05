#!/bin/bash
# Setup script to add Stripe keys to .env file

ENV_FILE=".env"

echo "Setting up Stripe environment variables..."
echo ""
echo "You'll need your Stripe API keys from: https://dashboard.stripe.com/test/apikeys"
echo ""

# Check if .env exists
if [ ! -f "$ENV_FILE" ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example "$ENV_FILE"
fi

# Prompt for Stripe keys
read -p "Enter your Stripe Secret Key (sk_test_...): " SECRET_KEY
read -p "Enter your Stripe Publishable Key (pk_test_...): " PUBLISHABLE_KEY
read -p "Enter your Stripe Webhook Secret (optional, press Enter to skip): " WEBHOOK_SECRET

# Add Stripe keys
echo "" >> "$ENV_FILE"
echo "# Stripe Payment Processing" >> "$ENV_FILE"
echo "STRIPE_SECRET_KEY=$SECRET_KEY" >> "$ENV_FILE"
echo "STRIPE_PUBLISHABLE_KEY=$PUBLISHABLE_KEY" >> "$ENV_FILE"
echo "STRIPE_WEBHOOK_SECRET=$WEBHOOK_SECRET" >> "$ENV_FILE"

echo ""
echo "✅ Stripe keys added to .env file"
echo "⚠️  Remember: Never commit .env to git!"
echo ""
echo "Next steps:"
echo "1. Add these same keys to Render environment variables"
echo "2. Test the payment flow in development"
echo "3. When ready for production, switch to live keys"
