// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/CryptoBazaarEscrow.sol";

contract Deploy is Script {
    // Polygon Amoy USDC — verify this matches what's in your MetaMask
    address constant AMOY_USDC = 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582;

    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer    = vm.addr(deployerKey);

        vm.startBroadcast(deployerKey);

        // On testnet deployer = insurance fund (real multisig on mainnet)
        CryptoBazaarEscrow escrow = new CryptoBazaarEscrow(deployer);

        // Whitelist USDC
        escrow.setTokenWhitelist(AMOY_USDC, true);

        vm.stopBroadcast();

        console.log("=== Deployed ===");
        console.log("Escrow:   ", address(escrow));
        console.log("USDC whitelisted:", AMOY_USDC);
        console.log("Deployer (insurance fund on testnet):", deployer);
    }
}
