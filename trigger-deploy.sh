#!/usr/bin/env bash

# ============================================================================
# TRIGGER RENDER DEPLOYMENT - ISRS Python Backend
# ============================================================================
# Now that S3 environment variables are added, redeploy the service
# ============================================================================

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🚀 TRIGGER RENDER DEPLOYMENT${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Load API key if not already set
if [ -z "$RENDER_API_KEY" ]; then
    if [ -f "/Users/akorn/Desktop/ITERM PROJECTS/_SYSTEM/.render-api-key" ]; then
        source "/Users/akorn/Desktop/ITERM PROJECTS/_SYSTEM/.render-api-key"
    fi
fi

if [ -z "$RENDER_API_KEY" ]; then
    echo -e "${YELLOW}⚠️  RENDER_API_KEY not set${NC}"
    echo "Please run: export RENDER_API_KEY='your_key'"
    exit 1
fi

SERVICE_ID="srv-d5k0t5d6ubrc739a4e50"
SERVICE_NAME="isrs-python-backend"

echo -e "${YELLOW}Service: $SERVICE_NAME${NC}"
echo -e "${YELLOW}ID: $SERVICE_ID${NC}"
echo ""
echo -e "${YELLOW}Triggering deployment...${NC}"

# Trigger deployment
response=$(curl -s -X POST "https://api.render.com/v1/services/$SERVICE_ID/deploys" \
    -H "Authorization: Bearer $RENDER_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"clearCache":"do_not_clear"}')

if echo "$response" | grep -q '"id"'; then
    deploy_id=$(echo "$response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo -e "${GREEN}✓ Deployment triggered!${NC}"
    echo ""
    echo "Deploy ID: $deploy_id"
    echo "Dashboard: https://dashboard.render.com/web/$SERVICE_ID"
    echo ""
    echo "The deployment will take 3-5 minutes. You can monitor it at:"
    echo "  https://dashboard.render.com/web/$SERVICE_ID"
    echo ""
    echo "After deployment completes, test the asset manager:"
    echo "  https://isrs-frontend.onrender.com/admin/assets-manager.html"
else
    echo -e "${YELLOW}Response: $response${NC}"
    echo ""
    echo "You can also trigger deployment manually:"
    echo "  1. Go to: https://dashboard.render.com/web/$SERVICE_ID"
    echo "  2. Click 'Manual Deploy' → 'Deploy latest commit'"
fi

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
