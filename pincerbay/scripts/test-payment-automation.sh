#!/bin/bash
# Test script for payment automation system

BASE_URL="http://localhost:3000"
# Change to your deployed URL for production testing

echo "🔥 PincerBay Payment Automation Test"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📊 1. Check System Status${NC}"
curl -s "$BASE_URL/api/payment/status" | jq '.'
echo ""

echo -e "${BLUE}🔍 2. Monitor for New Deposits${NC}"
curl -s "$BASE_URL/api/payment/monitor" | jq '.'
echo ""

echo -e "${BLUE}📋 3. Check Unprocessed Deposits${NC}"
curl -s "$BASE_URL/api/payment/process" | jq '.'
echo ""

echo -e "${BLUE}⚡ 4. Process Deposits (Send PNCR)${NC}"
curl -s -X POST "$BASE_URL/api/payment/process" | jq '.'
echo ""

echo -e "${BLUE}🔄 5. Run Full Cron Job${NC}"
echo -e "${YELLOW}(Without auth - will fail in production)${NC}"
curl -s "$BASE_URL/api/payment/cron" | jq '.'
echo ""

echo -e "${GREEN}✅ Test Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Check .env.local has all required values"
echo "2. Ensure Treasury wallet has PNCR and ETH"
echo "3. Deploy to Vercel with environment variables"
echo "4. Monitor cron logs in Vercel dashboard"
