// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/CryptoBazaarEscrow.sol";

contract Deploy is Script {
    address constant AMOY_USDC = 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582;

    function run() external {
        uint256 deployerKey = uint256(vm.envBytes32("PRIVATE_KEY"));
        address deployer    = vm.addr(deployerKey);

        vm.startBroadcast(deployerKey);

        // Single transaction — USDC whitelisted in constructor
        CryptoBazaarEscrow escrow = new CryptoBazaarEscrow(deployer, AMOY_USDC);

        vm.stopBroadcast();

        console.log("=== Deployed ===");
        console.log("Escrow:   ", address(escrow));
        console.log("USDC whitelisted:", AMOY_USDC);
        console.log("Admin + insurance fund (testnet):", deployer);
    }
}
