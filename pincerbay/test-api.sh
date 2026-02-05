#!/bin/bash
# Souls API Test Script
# Run: chmod +x test-api.sh && ./test-api.sh

BASE_URL="http://localhost:3000"
echo "🧪 Testing Souls API at $BASE_URL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test 1: GET all souls
echo "1️⃣ Testing GET /api/souls"
response=$(curl -s "$BASE_URL/api/souls")
if [[ $response == *"success\":true"* ]]; then
    echo -e "${GREEN}✓ GET /api/souls - PASS${NC}"
    count=$(echo $response | grep -o '"id":' | wc -l)
    echo "   Found $count souls"
else
    echo -e "${RED}✗ GET /api/souls - FAIL${NC}"
fi
echo ""

# Test 2: GET single soul
echo "2️⃣ Testing GET /api/souls/1"
response=$(curl -s "$BASE_URL/api/souls/1")
if [[ $response == *"CryptoAnalyst Pro"* ]]; then
    echo -e "${GREEN}✓ GET /api/souls/1 - PASS${NC}"
else
    echo -e "${RED}✗ GET /api/souls/1 - FAIL${NC}"
fi
echo ""

# Test 3: Vote up
echo "3️⃣ Testing POST /api/souls/1 (vote up)"
response=$(curl -s -X POST "$BASE_URL/api/souls/1" \
  -H "Content-Type: application/json" \
  -d '{"action":"vote","voteType":"up"}')
if [[ $response == *"Vote recorded"* ]]; then
    echo -e "${GREEN}✓ Vote up - PASS${NC}"
else
    echo -e "${RED}✗ Vote up - FAIL${NC}"
fi
echo ""

# Test 4: Purchase
echo "4️⃣ Testing POST /api/souls/1 (purchase)"
response=$(curl -s -X POST "$BASE_URL/api/souls/1" \
  -H "Content-Type: application/json" \
  -d '{"action":"purchase","userId":"test_user"}')
if [[ $response == *"Purchase successful"* ]]; then
    echo -e "${GREEN}✓ Purchase - PASS${NC}"
else
    echo -e "${RED}✗ Purchase - FAIL${NC}"
fi
echo ""

# Test 5: Create soul
echo "5️⃣ Testing POST /api/souls (create)"
response=$(curl -s -X POST "$BASE_URL/api/souls" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test Soul",
    "emoji":"🧪",
    "category":"Testing",
    "author":"Forge",
    "authorEmoji":"⚒️",
    "price":100,
    "description":"Test soul for API",
    "skills":["Testing","QA"],
    "preview":"# SOUL.md - Test\n\nTest content",
    "featured":false
  }')
if [[ $response == *"Test Soul"* ]]; then
    echo -e "${GREEN}✓ Create soul - PASS${NC}"
else
    echo -e "${RED}✗ Create soul - FAIL${NC}"
fi
echo ""

# Test 6: Filter by category
echo "6️⃣ Testing GET /api/souls?category=Finance"
response=$(curl -s "$BASE_URL/api/souls?category=Finance")
if [[ $response == *"CryptoAnalyst Pro"* ]]; then
    echo -e "${GREEN}✓ Filter by category - PASS${NC}"
else
    echo -e "${RED}✗ Filter by category - FAIL${NC}"
fi
echo ""

# Test 7: Search
echo "7️⃣ Testing GET /api/souls?search=crypto"
response=$(curl -s "$BASE_URL/api/souls?search=crypto")
if [[ $response == *"CryptoAnalyst"* ]]; then
    echo -e "${GREEN}✓ Search - PASS${NC}"
else
    echo -e "${RED}✗ Search - FAIL${NC}"
fi
echo ""

# Test 8: Sort by price
echo "8️⃣ Testing GET /api/souls?sort=price-low"
response=$(curl -s "$BASE_URL/api/souls?sort=price-low")
if [[ $response == *"success\":true"* ]]; then
    echo -e "${GREEN}✓ Sort - PASS${NC}"
else
    echo -e "${RED}✗ Sort - FAIL${NC}"
fi
echo ""

echo "✅ Tests complete!"
echo ""
echo "📊 Quick Stats:"
curl -s "$BASE_URL/api/souls" | grep -o '"total":[0-9]*' || echo "Could not fetch stats"
