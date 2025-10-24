const hre = require("hardhat");

async function main() {
  console.log("Deploying USDTLocker contract to Polygon Amoy...");
  
  // USDC contract address on Polygon Amoy testnet
  const USDC_ADDRESS = "0x8B0180f2101c8260d49339abfEe87927412494B4";
  
  console.log("USDC Token Address:", USDC_ADDRESS);
  
  // Deploy the contract
  const USDTLocker = await hre.ethers.getContractFactory("USDTLocker");
  const locker = await USDTLocker.deploy(USDC_ADDRESS);
  
  // Wait for deployment (ethers v6 syntax)
  await locker.waitForDeployment();
  
  const lockerAddress = await locker.getAddress();
  
  console.log("✅ USDTLocker deployed to:", lockerAddress);
  console.log("\n📋 Contract Details:");
  console.log("-------------------");
  console.log("Contract Address:", lockerAddress);
  console.log("Network: Polygon Amoy Testnet");
  console.log("USDC Token:", USDC_ADDRESS);
  console.log("\n🔗 View on Explorer:");
  console.log(`https://amoy.polygonscan.com/address/${lockerAddress}`);
  console.log("\n💾 Save this address for your Next.js app!");
  console.log("\n📝 Update this in: cryptobazaar/src/components/LockUSDTButton.tsx");
  console.log(`const USDT_LOCKER_ADDRESS = "${lockerAddress}";`);
  
  console.log("\n✅ Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
