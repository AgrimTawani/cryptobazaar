    const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

// Polygon Amoy Test USDC Address
const USDC_ADDRESS = "0x8B0180f2101c8260d49339abfEe87927412494B4";

async function main() {
  console.log("Deploying TokenLocker contract to Polygon Amoy...");
  console.log("USDC Token Address:", USDC_ADDRESS);

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const TokenLocker = await ethers.getContractFactory("TokenLocker");
  const locker = await TokenLocker.deploy(USDC_ADDRESS);

  await locker.waitForDeployment();
  const lockerAddress = await locker.getAddress();

  console.log("\n✅ TokenLocker deployed to:", lockerAddress);
  console.log("\n📋 Contract Details:");
  console.log("-------------------");
  console.log("Contract Address:", lockerAddress);
  console.log("Network: Polygon Amoy Testnet");
  console.log("USDC Token:", USDC_ADDRESS);
  console.log("\n🔗 View on Explorer:");
  console.log(`https://amoy.polygonscan.com/address/${lockerAddress}`);
  console.log("\n💾 Save this address for your Next.js app!");
  console.log("\n📝 Update this in: cryptobazaar/src/components/CreateOrderModal.tsx");
  console.log(`const TOKEN_LOCKER_ADDRESS = "${lockerAddress}";`);
  console.log("\n✅ Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
