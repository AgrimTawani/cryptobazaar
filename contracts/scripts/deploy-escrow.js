const hre = require("hardhat");

// Polygon Amoy Test USDC Address
const USDC_ADDRESS = "0x8B0180f2101c8260d49339abfEe87927412494B4";

async function main() {
  console.log("Deploying EscrowContract to Polygon Amoy...");
  console.log("USDC Token Address:", USDC_ADDRESS);

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const EscrowContract = await hre.ethers.getContractFactory("EscrowContract");
  const escrow = await EscrowContract.deploy(USDC_ADDRESS);

  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();

  console.log("\n✅ EscrowContract deployed to:", escrowAddress);
  console.log("\n📋 Contract Details:");
  console.log("-------------------");
  console.log("Contract Address:", escrowAddress);
  console.log("Network: Polygon Amoy Testnet");
  console.log("USDC Token:", USDC_ADDRESS);
  console.log("\n🔗 View on Explorer:");
  console.log(`https://amoy.polygonscan.com/address/${escrowAddress}`);
  console.log("\n💾 Save this address for your Next.js app!");
  console.log("\n📝 Update this in: cryptobazaar/src/components/CreateOrderModal.tsx");
  console.log(`const ESCROW_CONTRACT_ADDRESS = "${escrowAddress}";`);
  console.log("\n✅ Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
