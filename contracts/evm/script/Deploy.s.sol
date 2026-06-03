// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/CryptoBazaarEscrow.sol";

contract Deploy is Script {
    address constant AMOY_USDC_1   = 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582;
    address constant AMOY_USDC_2   = 0x8B0180f2101c8260d49339abfEe87927412494B4; // active in Vercel env
    address constant TREASURY      = 0x87705Bc4a715214ee496C2fA207CB94D4EaD7c5f;

    function run() external {
        uint256 deployerKey = uint256(vm.envBytes32("PRIVATE_KEY"));

        vm.startBroadcast(deployerKey);

        CryptoBazaarEscrow escrow = new CryptoBazaarEscrow(TREASURY, AMOY_USDC_2);
        escrow.setWhitelist(AMOY_USDC_1, true);

        vm.stopBroadcast();

        console.log("=== Deployed ===");
        console.log("Escrow:    ", address(escrow));
        console.log("Treasury:  ", TREASURY);
        console.log("USDC 1:    ", AMOY_USDC_1);
        console.log("USDC 2:    ", AMOY_USDC_2);
        console.log("Flat fee:   1 USDC (1_000_000)");
    }
}
