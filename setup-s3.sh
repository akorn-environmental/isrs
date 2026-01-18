#!/usr/bin/env bash

# ============================================================================
# SIMPLE S3 SETUP - Run this script to add S3 variables to Render
# ============================================================================

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🚀 ISRS S3 SETUP - Quick Start${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Step 1: Check for credentials file
CREDS_FILE="/Users/akorn/Desktop/ITERM PROJECTS/_SYSTEM/.aws-s3-credentials"
echo -e "${YELLOW}Step 1: Loading AWS credentials...${NC}"

if [ ! -f "$CREDS_FILE" ]; then
    echo -e "${RED}✗ Credentials file not found: $CREDS_FILE${NC}"
    echo ""
    echo "Please use the manual method instead:"
    echo "  https://dashboard.render.com/web/srv-d5k0t5d6ubrc739a4e50/env"
    exit 1
fi

source "$CREDS_FILE"
echo -e "${GREEN}✓ AWS credentials loaded${NC}"
echo ""

# Step 2: Check for Render API key
echo -e "${YELLOW}Step 2: Checking Render API key...${NC}"

if [ -z "$RENDER_API_KEY" ]; then
    echo -e "${RED}✗ RENDER_API_KEY not set${NC}"
    echo ""
    echo "To get your Render API key:"
    echo "  1. Go to: https://dashboard.render.com/u/settings/api-keys"
    echo "  2. Create or copy your API key (starts with 'rnd_')"
    echo "  3. Run this command with your key:"
    echo ""
    echo -e "${CYAN}     export RENDER_API_KEY='rnd_your_key_here'${NC}"
    echo -e "${CYAN}     bash $0${NC}"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ Render API key found${NC}"
echo ""

# Step 3: Add environment variables
echo -e "${YELLOW}Step 3: Adding environment variables to Render...${NC}"
echo ""

SERVICE_ID="srv-d5k0t5d6ubrc739a4e50"

# Simple array approach (compatible with bash 3.2+)
KEYS=("AWS_ACCESS_KEY_ID" "AWS_SECRET_ACCESS_KEY" "AWS_REGION" "AWS_BUCKET_NAME")
VALUES=("$AWS_ACCESS_KEY_ID" "$AWS_SECRET_ACCESS_KEY" "$AWS_REGION" "$AWS_BUCKET_NAME")

success_count=0
total_count=${#KEYS[@]}

for i in "${!KEYS[@]}"; do
    key="${KEYS[$i]}"
    value="${VALUES[$i]}"

    echo -n "  Adding $key... "

    response=$(curl -s -X PUT "https://api.render.com/v1/services/$SERVICE_ID/env-vars/$key" \
        -H "Authorization: Bearer $RENDER_API_KEY" \
        -H "Content-Type: application/json" \
        -d "{\"value\":\"$value\"}" 2>&1)

    if echo "$response" | grep -q "\"key\":\"$key\""; then
        echo -e "${GREEN}✓${NC}"
        ((success_count++))
    elif echo "$response" | grep -q "already exists"; then
        echo -e "${YELLOW}(already exists)${NC}"
        ((success_count++))
    else
        echo -e "${RED}✗${NC}"
        echo "    Response: $response"
    fi
done

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ $success_count -eq $total_count ]; then
    echo -e "${GREEN}✅ SUCCESS! All $success_count environment variables configured${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Render is automatically redeploying (takes ~3-5 minutes)"
    echo "  2. Check deployment: https://dashboard.render.com/web/$SERVICE_ID"
    echo "  3. After deployment, test asset manager:"
    echo "     https://isrs-frontend.onrender.com/admin/assets-manager.html"
    echo ""
else
    echo -e "${YELLOW}⚠️  Partial success: $success_count/$total_count variables configured${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Some variables may have failed. Check manually:"
    echo "  https://dashboard.render.com/web/$SERVICE_ID/env"
    echo ""
fi
