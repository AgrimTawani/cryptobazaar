// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/CryptoBazaarEscrow.sol";

contract Whitelist is Script {
    address constant ESCROW       = 0xD70f155144Be727c54A839cCC03E2bA3E67d9AEA;
    address constant AMOY_USDC_2  = 0x8B0180f2101c8260d49339abfEe87927412494B4;

    function run() external {
        uint256 deployerKey = uint256(vm.envBytes32("PRIVATE_KEY"));
        vm.startBroadcast(deployerKey);

        CryptoBazaarEscrow(ESCROW).setWhitelist(AMOY_USDC_2, true);

        vm.stopBroadcast();
        console.log("Whitelisted:", AMOY_USDC_2);
    }
}
