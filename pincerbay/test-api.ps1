# Souls API Test Script (PowerShell)
# Run: .\test-api.ps1

$BaseUrl = "http://localhost:3000"
Write-Host "🧪 Testing Souls API at $BaseUrl" -ForegroundColor Cyan
Write-Host ""

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [string]$Body = $null,
        [string]$ExpectedContent
    )
    
    Write-Host "$Name" -ForegroundColor Yellow
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            ContentType = "application/json"
        }
        
        if ($Body) {
            $params.Body = $Body
        }
        
        $response = Invoke-RestMethod @params
        $responseText = $response | ConvertTo-Json -Depth 10
        
        if ($responseText -like "*$ExpectedContent*" -or $response.success -eq $true) {
            Write-Host "✓ PASS" -ForegroundColor Green
            return $true
        } else {
            Write-Host "✗ FAIL" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "✗ FAIL - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    Write-Host ""
}

# Test 1: GET all souls
Test-Endpoint -Name "1️⃣ GET /api/souls" `
    -Url "$BaseUrl/api/souls" `
    -ExpectedContent "success"

# Test 2: GET single soul
Test-Endpoint -Name "2️⃣ GET /api/souls/1" `
    -Url "$BaseUrl/api/souls/1" `
    -ExpectedContent "CryptoAnalyst Pro"

# Test 3: Vote up
Test-Endpoint -Name "3️⃣ POST /api/souls/1 (vote up)" `
    -Url "$BaseUrl/api/souls/1" `
    -Method "POST" `
    -Body '{"action":"vote","voteType":"up"}' `
    -ExpectedContent "Vote recorded"

# Test 4: Purchase
Test-Endpoint -Name "4️⃣ POST /api/souls/1 (purchase)" `
    -Url "$BaseUrl/api/souls/1" `
    -Method "POST" `
    -Body '{"action":"purchase","userId":"test_user"}' `
    -ExpectedContent "Purchase successful"

# Test 5: Create soul
$createBody = @{
    name = "Test Soul"
    emoji = "🧪"
    category = "Testing"
    author = "Forge"
    authorEmoji = "⚒️"
    price = 100
    description = "Test soul for API"
    skills = @("Testing", "QA")
    preview = "# SOUL.md - Test`n`nTest content"
    featured = $false
} | ConvertTo-Json

Test-Endpoint -Name "5️⃣ POST /api/souls (create)" `
    -Url "$BaseUrl/api/souls" `
    -Method "POST" `
    -Body $createBody `
    -ExpectedContent "Test Soul"

# Test 6: Filter by category
Test-Endpoint -Name "6️⃣ GET /api/souls?category=Finance" `
    -Url "$BaseUrl/api/souls?category=Finance" `
    -ExpectedContent "CryptoAnalyst Pro"

# Test 7: Search
Test-Endpoint -Name "7️⃣ GET /api/souls?search=crypto" `
    -Url "$BaseUrl/api/souls?search=crypto" `
    -ExpectedContent "CryptoAnalyst"

# Test 8: Sort by price
Test-Endpoint -Name "8️⃣ GET /api/souls?sort=price-low" `
    -Url "$BaseUrl/api/souls?sort=price-low" `
    -ExpectedContent "success"

Write-Host ""
Write-Host "✅ Tests complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Quick Stats:" -ForegroundColor Cyan

try {
    $stats = Invoke-RestMethod -Uri "$BaseUrl/api/souls"
    Write-Host "Total souls: $($stats.total)" -ForegroundColor White
} catch {
    Write-Host "Could not fetch stats" -ForegroundColor Red
}
