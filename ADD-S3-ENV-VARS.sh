#!/usr/bin/env bash

# ============================================================================
# ADD S3 ENVIRONMENT VARIABLES TO ISRS PYTHON BACKEND
# ============================================================================
# This script adds AWS S3 environment variables needed for asset management
#
# Service: isrs-python-backend
# Service ID: srv-d5k0t5d6ubrc739a4e50
# Dashboard: https://dashboard.render.com/web/srv-d5k0t5d6ubrc739a4e50
# ============================================================================

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📦 ADD S3 ENVIRONMENT VARIABLES TO ISRS PYTHON BACKEND${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

SERVICE_ID="srv-d5k0t5d6ubrc739a4e50"
SERVICE_NAME="isrs-python-backend"

# Environment variables to add (key=value format)
# These will be loaded from the .aws-s3-credentials file or can be set manually
ENV_VARS=(
    "AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID:-YOUR_AWS_ACCESS_KEY_ID_HERE}"
    "AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY:-YOUR_AWS_SECRET_ACCESS_KEY_HERE}"
    "AWS_REGION=${AWS_REGION:-us-east-1}"
    "AWS_BUCKET_NAME=${AWS_BUCKET_NAME:-akorn-assets}"
)

echo -e "${YELLOW}Environment Variables to Add:${NC}"
echo ""
for env_var in "${ENV_VARS[@]}"; do
    key="${env_var%%=*}"
    value="${env_var#*=}"
    # Mask sensitive values
    if [[ $key == *"SECRET"* ]] || [[ $key == *"KEY"* ]]; then
        masked="${value:0:8}...${value: -4}"
        echo "  $key = $masked"
    else
        echo "  $key = $value"
    fi
done
echo ""

# Check if RENDER_API_KEY is available
if [ -z "$RENDER_API_KEY" ]; then
    echo -e "${YELLOW}⚠️  RENDER_API_KEY not found in environment${NC}"
    echo ""
    echo "Option 1: Set RENDER_API_KEY and run this script"
    echo "  export RENDER_API_KEY='rnd_your_key_here'"
    echo "  bash $0"
    echo ""
    echo "Option 2: Add variables manually via Render Dashboard"
    echo "  1. Go to: https://dashboard.render.com/web/$SERVICE_ID/env"
    echo "  2. Click 'Add Environment Variable'"
    echo "  3. Add each variable:"
    for env_var in "${ENV_VARS[@]}"; do
        key="${env_var%%=*}"
        value="${env_var#*=}"
        echo "     - $key = $value"
    done
    echo "  4. Click 'Save Changes'"
    echo ""
    echo "Option 3: Use curl commands (if you have API key)"
    echo ""
    for env_var in "${ENV_VARS[@]}"; do
        key="${env_var%%=*}"
        value="${env_var#*=}"
        echo "curl -X PUT \"https://api.render.com/v1/services/$SERVICE_ID/env-vars/$key\" \\"
        echo "  -H \"Authorization: Bearer \$RENDER_API_KEY\" \\"
        echo "  -H \"Content-Type: application/json\" \\"
        echo "  -d '{\"value\":\"$value\"}'"
        echo ""
    done
    exit 1
fi

# If we have the API key, add the environment variables
echo -e "${GREEN}✓ RENDER_API_KEY found${NC}"
echo ""
echo -e "${CYAN}Adding environment variables...${NC}"
echo ""

for env_var in "${ENV_VARS[@]}"; do
    key="${env_var%%=*}"
    value="${env_var#*=}"

    echo -n "Adding $key... "

    response=$(curl -s -X PUT "https://api.render.com/v1/services/$SERVICE_ID/env-vars/$key" \
        -H "Authorization: Bearer $RENDER_API_KEY" \
        -H "Content-Type: application/json" \
        -d "{\"value\":\"$value\"}")

    # Check if successful (response should contain the key)
    if echo "$response" | grep -q "\"key\":\"$key\""; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${YELLOW}⚠️  Failed or already exists${NC}"
        # Check if it's an "already exists" error
        if echo "$response" | grep -q "already exists"; then
            echo "  (Variable already exists - this is OK)"
        else
            echo "  Response: $response"
        fi
    fi
done

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Environment variables configured${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Next steps:"
echo "  1. Commit and push backend changes to trigger deployment"
echo "  2. After deployment, test asset upload endpoint:"
echo "     curl https://isrs-python-backend.onrender.com/api/assets/"
echo ""
echo "Dashboard: https://dashboard.render.com/web/$SERVICE_ID"
echo ""
