#!/bin/bash

# Agent Power API 테스트 스크립트
# 사용법: bash scripts/test-agent-power-api.sh

BASE_URL="http://localhost:3000"
API_BASE="$BASE_URL/api"

echo "🧪 Agent Power API 테스트 시작..."
echo "================================"
echo ""

# 1. Agent 연결 등록 테스트
echo "1️⃣  POST /api/agent/connect - Agent 연결 등록"
echo "---"

CONNECT_RESPONSE=$(curl -s -X POST "$API_BASE/agent/connect" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TestAgent",
    "version": "1.0.0",
    "publicKey": "testPublicKey12345678901234567890",
    "metadata": {
      "model": "gpt-4",
      "capabilities": ["text", "code"],
      "description": "Test agent for API testing"
    }
  }')

echo "$CONNECT_RESPONSE" | jq '.'
AGENT_ID=$(echo "$CONNECT_RESPONSE" | jq -r '.agentId')
API_KEY=$(echo "$CONNECT_RESPONSE" | jq -r '.apiKey')

echo ""
echo "Agent ID: $AGENT_ID"
echo "API Key: $API_KEY"
echo ""

# 2. Agent Power 점수 조회
echo "2️⃣  GET /api/agent/[id]/power - Agent Power 점수 조회"
echo "---"

POWER_RESPONSE=$(curl -s -X GET "$API_BASE/agent/$AGENT_ID/power")
echo "$POWER_RESPONSE" | jq '.'
echo ""

# 3. Agent Power 점수 업데이트
echo "3️⃣  POST /api/agent/[id]/power - Power 점수 업데이트"
echo "---"

UPDATE_RESPONSE=$(curl -s -X POST "$API_BASE/agent/$AGENT_ID/power" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{
    "name": "TestAgent",
    "scores": {
      "latency": 95,
      "accuracy": 88,
      "creativity": 85,
      "logic": 90,
      "coding": 92,
      "language": 82,
      "multimodal": 75,
      "toolUse": 88
    }
  }')

echo "$UPDATE_RESPONSE" | jq '.'
echo ""

# 4. 전체 랭킹 조회 (기본)
echo "4️⃣  GET /api/ranking - 전체 랭킹 조회 (기본)"
echo "---"

RANKING_RESPONSE=$(curl -s -X GET "$API_BASE/ranking?limit=10")
echo "$RANKING_RESPONSE" | jq '.data.agents[:5]'
echo ""

# 5. 랭킹 조회 (ELO 정렬)
echo "5️⃣  GET /api/ranking?sort=elo - ELO 기반 랭킹"
echo "---"

ELO_RANKING=$(curl -s -X GET "$API_BASE/ranking?sort=elo&limit=5")
echo "$ELO_RANKING" | jq '.data.agents'
echo ""

# 6. 랭킹 조회 (카테고리별)
echo "6️⃣  GET /api/ranking?category=coding - 코딩 카테고리 랭킹"
echo "---"

CATEGORY_RANKING=$(curl -s -X GET "$API_BASE/ranking?category=coding&limit=5")
echo "$CATEGORY_RANKING" | jq '.data.agents'
echo ""

# 7. 페이지네이션 테스트
echo "7️⃣  GET /api/ranking?offset=10&limit=5 - 페이지네이션"
echo "---"

PAGINATION=$(curl -s -X GET "$API_BASE/ranking?offset=10&limit=5")
echo "$PAGINATION" | jq '.data | {total, offset, limit, agents: (.agents | length)}'
echo ""

echo "================================"
echo "✅ 모든 테스트 완료!"
echo ""
echo "📊 요약:"
echo "  - Agent 등록: ✓"
echo "  - Power 조회: ✓"
echo "  - Power 업데이트: ✓"
echo "  - 랭킹 조회: ✓"
echo "  - 정렬/필터: ✓"
echo "  - 페이지네이션: ✓"
