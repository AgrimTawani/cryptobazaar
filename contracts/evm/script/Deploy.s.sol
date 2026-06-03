// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/CryptoBazaarEscrow.sol";

contract Deploy is Script {
    address constant AMOY_USDC     = 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582;
    address constant TREASURY      = 0x87705Bc4a715214ee496C2fA207CB94D4EaD7c5f;

    function run() external {
        uint256 deployerKey = uint256(vm.envBytes32("PRIVATE_KEY"));

        vm.startBroadcast(deployerKey);

        CryptoBazaarEscrow escrow = new CryptoBazaarEscrow(TREASURY, AMOY_USDC);

        vm.stopBroadcast();

        console.log("=== Deployed ===");
        console.log("Escrow:    ", address(escrow));
        console.log("Treasury:  ", TREASURY);
        console.log("USDC:      ", AMOY_USDC);
        console.log("Flat fee:   1 USDC (1_000_000)");
    }
}
