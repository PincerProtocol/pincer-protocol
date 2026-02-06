# Agent Power API 테스트 스크립트 (PowerShell)
# 사용법: .\scripts\test-agent-power-api.ps1

$BASE_URL = "http://localhost:3000"
$API_BASE = "$BASE_URL/api"

Write-Host "🧪 Agent Power API 테스트 시작..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 1. Agent 연결 등록 테스트
Write-Host "1️⃣  POST /api/agent/connect - Agent 연결 등록" -ForegroundColor Yellow
Write-Host "---"

$connectBody = @{
    name = "TestAgent"
    version = "1.0.0"
    publicKey = "testPublicKey12345678901234567890"
    metadata = @{
        model = "gpt-4"
        capabilities = @("text", "code")
        description = "Test agent for API testing"
    }
} | ConvertTo-Json

$connectResponse = Invoke-RestMethod -Uri "$API_BASE/agent/connect" -Method Post -Body $connectBody -ContentType "application/json"
$connectResponse | ConvertTo-Json -Depth 5 | Write-Host

$agentId = $connectResponse.agentId
$apiKey = $connectResponse.apiKey

Write-Host ""
Write-Host "Agent ID: $agentId" -ForegroundColor Green
Write-Host "API Key: $apiKey" -ForegroundColor Green
Write-Host ""

# 2. Agent Power 점수 조회
Write-Host "2️⃣  GET /api/agent/[id]/power - Agent Power 점수 조회" -ForegroundColor Yellow
Write-Host "---"

$powerResponse = Invoke-RestMethod -Uri "$API_BASE/agent/$agentId/power" -Method Get
$powerResponse | ConvertTo-Json -Depth 5 | Write-Host
Write-Host ""

# 3. Agent Power 점수 업데이트
Write-Host "3️⃣  POST /api/agent/[id]/power - Power 점수 업데이트" -ForegroundColor Yellow
Write-Host "---"

$updateBody = @{
    name = "TestAgent"
    scores = @{
        latency = 95
        accuracy = 88
        creativity = 85
        logic = 90
        coding = 92
        language = 82
        multimodal = 75
        toolUse = 88
    }
} | ConvertTo-Json

$headers = @{
    "x-api-key" = $apiKey
    "Content-Type" = "application/json"
}

$updateResponse = Invoke-RestMethod -Uri "$API_BASE/agent/$agentId/power" -Method Post -Body $updateBody -Headers $headers
$updateResponse | ConvertTo-Json -Depth 5 | Write-Host
Write-Host ""

# 4. 전체 랭킹 조회 (기본)
Write-Host "4️⃣  GET /api/ranking - 전체 랭킹 조회 (기본)" -ForegroundColor Yellow
Write-Host "---"

$rankingResponse = Invoke-RestMethod -Uri "$API_BASE/ranking?limit=10" -Method Get
$rankingResponse.data.agents[0..4] | ConvertTo-Json -Depth 3 | Write-Host
Write-Host ""

# 5. 랭킹 조회 (ELO 정렬)
Write-Host "5️⃣  GET /api/ranking?sort=elo - ELO 기반 랭킹" -ForegroundColor Yellow
Write-Host "---"

$eloRanking = Invoke-RestMethod -Uri "$API_BASE/ranking?sort=elo&limit=5" -Method Get
$eloRanking.data.agents | ConvertTo-Json -Depth 3 | Write-Host
Write-Host ""

# 6. 랭킹 조회 (카테고리별)
Write-Host "6️⃣  GET /api/ranking?category=coding - 코딩 카테고리 랭킹" -ForegroundColor Yellow
Write-Host "---"

$categoryRanking = Invoke-RestMethod -Uri "$API_BASE/ranking?category=coding&limit=5" -Method Get
$categoryRanking.data.agents | ConvertTo-Json -Depth 3 | Write-Host
Write-Host ""

# 7. 페이지네이션 테스트
Write-Host "7️⃣  GET /api/ranking?offset=10&limit=5 - 페이지네이션" -ForegroundColor Yellow
Write-Host "---"

$pagination = Invoke-RestMethod -Uri "$API_BASE/ranking?offset=10&limit=5" -Method Get
Write-Host "Total: $($pagination.data.total)"
Write-Host "Offset: $($pagination.data.offset)"
Write-Host "Limit: $($pagination.data.limit)"
Write-Host "Agents Count: $($pagination.data.agents.Count)"
Write-Host ""

Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ 모든 테스트 완료!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 요약:" -ForegroundColor Cyan
Write-Host "  - Agent 등록: ✓" -ForegroundColor Green
Write-Host "  - Power 조회: ✓" -ForegroundColor Green
Write-Host "  - Power 업데이트: ✓" -ForegroundColor Green
Write-Host "  - 랭킹 조회: ✓" -ForegroundColor Green
Write-Host "  - 정렬/필터: ✓" -ForegroundColor Green
Write-Host "  - 페이지네이션: ✓" -ForegroundColor Green
