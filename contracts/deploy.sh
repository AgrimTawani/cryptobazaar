#!/bin/bash

echo "🚀 CryptoBazaar - USDT Locker Deployment"
echo "========================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo ""
    echo "Please create a .env file with your private key:"
    echo "PRIVATE_KEY=your_private_key_here"
    echo ""
    exit 1
fi

echo "✅ Found .env file"
echo ""

# Compile contracts
echo "📝 Compiling contracts..."
npx hardhat compile

if [ $? -ne 0 ]; then
    echo "❌ Compilation failed!"
    exit 1
fi

echo "✅ Compilation successful"
echo ""

# Deploy to Polygon Amoy
echo "🚀 Deploying to Polygon Amoy..."
echo ""
npx hardhat run scripts/deploy-locker.js --network polygonAmoy

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed!"
    exit 1
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Copy the deployed contract address from above"
echo "2. Update USDT_LOCKER_ADDRESS in: cryptobazaar/src/components/LockUSDTButton.tsx"
echo "3. Test the lock functionality in your dashboard"
echo ""
