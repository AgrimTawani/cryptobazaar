# CryptoBazaar - USDT Locker Deployment Script (PowerShell)

Write-Host "🚀 CryptoBazaar - USDT Locker Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-Not (Test-Path .env)) {
    Write-Host "❌ Error: .env file not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please create a .env file with your private key:" -ForegroundColor Yellow
    Write-Host "PRIVATE_KEY=your_private_key_here" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "✅ Found .env file" -ForegroundColor Green
Write-Host ""

# Compile contracts
Write-Host "📝 Compiling contracts..." -ForegroundColor Yellow
npx hardhat compile

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Compilation failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Compilation successful" -ForegroundColor Green
Write-Host ""

# Deploy to Polygon Amoy
Write-Host "🚀 Deploying to Polygon Amoy..." -ForegroundColor Yellow
Write-Host ""
npx hardhat run scripts/deploy-locker.js --network polygonAmoy

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Copy the deployed contract address from above"
Write-Host "2. Update USDT_LOCKER_ADDRESS in: cryptobazaar/src/components/LockUSDTButton.tsx"
Write-Host "3. Test the lock functionality in your dashboard"
Write-Host ""
