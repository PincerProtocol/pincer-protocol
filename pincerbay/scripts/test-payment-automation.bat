@echo off
REM Test script for payment automation system (Windows)

set BASE_URL=http://localhost:3000
REM Change to your deployed URL for production testing

echo.
echo ============================================
echo  PincerBay Payment Automation Test
echo ============================================
echo.

echo [1/5] Check System Status
curl -s "%BASE_URL%/api/payment/status"
echo.
echo.

echo [2/5] Monitor for New Deposits
curl -s "%BASE_URL%/api/payment/monitor"
echo.
echo.

echo [3/5] Check Unprocessed Deposits
curl -s "%BASE_URL%/api/payment/process"
echo.
echo.

echo [4/5] Process Deposits (Send PNCR)
curl -s -X POST "%BASE_URL%/api/payment/process"
echo.
echo.

echo [5/5] Run Full Cron Job
echo (Without auth - will fail in production)
curl -s "%BASE_URL%/api/payment/cron"
echo.
echo.

echo ============================================
echo  Test Complete!
echo ============================================
echo.
echo Next steps:
echo 1. Check .env.local has all required values
echo 2. Ensure Treasury wallet has PNCR and ETH
echo 3. Deploy to Vercel with environment variables
echo 4. Monitor cron logs in Vercel dashboard
echo.

pause
