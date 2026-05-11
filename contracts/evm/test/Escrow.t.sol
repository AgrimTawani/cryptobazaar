// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/CryptoBazaarEscrow.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Minimal mock token — mintable, 6 decimals (same as USDC/USDT)
contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USDC", "USDC") {}
    function decimals() public pure override returns (uint8) { return 6; }
    function mint(address to, uint256 amount) external { _mint(to, amount); }
}

contract EscrowTest is Test {
    CryptoBazaarEscrow escrow;
    MockUSDC           usdc;

    address admin  = address(this);
    address seller = makeAddr("seller");
    address buyer  = makeAddr("buyer");

    uint256 constant AMOUNT   = 10e6;  // 10 USDC
    uint256 constant PRICE    = 9500;  // ₹95.00

    function setUp() public {
        usdc   = new MockUSDC();
        escrow = new CryptoBazaarEscrow(admin);
        escrow.setTokenWhitelist(address(usdc), true);

        // Fund seller with 10 USDC
        usdc.mint(seller, AMOUNT);
        vm.prank(seller);
        usdc.approve(address(escrow), AMOUNT);
    }

    // ── Happy path ─────────────────────────────────────────────────────────────

    function test_HappyPath() public {
        // Seller creates order
        vm.prank(seller);
        escrow.createOrder(address(usdc), AMOUNT, PRICE);

        // Buyer locks
        vm.prank(buyer);
        escrow.lockOrder(0);
        (, , address storedBuyer, , , , , , ,) = escrow.orders(0);
        assertEq(storedBuyer, buyer);

        // Buyer marks paid
        vm.prank(buyer);
        escrow.markPaid(0);

        // Seller confirms
        vm.prank(seller);
        escrow.confirmPayment(0);

        uint256 fee    = (AMOUNT * 75) / 10000;
        uint256 payout = AMOUNT - fee;

        assertEq(usdc.balanceOf(buyer), payout);
        assertEq(usdc.balanceOf(admin), fee); // admin = insurance fund on testnet
    }

    // ── Seller cancels before buyer locks ──────────────────────────────────────

    function test_SellerCancel() public {
        vm.prank(seller);
        escrow.createOrder(address(usdc), AMOUNT, PRICE);

        vm.prank(seller);
        escrow.cancelOrder(0);

        assertEq(usdc.balanceOf(seller), AMOUNT);
    }

    // ── Buyer timeout — seller reclaims after 30 min ───────────────────────────

    function test_BuyerTimeout() public {
        vm.prank(seller);
        escrow.createOrder(address(usdc), AMOUNT, PRICE);

        vm.prank(buyer);
        escrow.lockOrder(0);

        // Fast-forward 31 minutes
        vm.warp(block.timestamp + 31 minutes);

        vm.prank(seller);
        escrow.timeoutCancel(0);

        assertEq(usdc.balanceOf(seller), AMOUNT);
    }

    // ── Dispute — admin sends funds to buyer ───────────────────────────────────

    function test_DisputeBuyerWins() public {
        vm.prank(seller);
        escrow.createOrder(address(usdc), AMOUNT, PRICE);

        vm.prank(buyer);
        escrow.lockOrder(0);

        vm.prank(buyer);
        escrow.markPaid(0);

        vm.prank(seller);
        escrow.raiseDispute(0);

        // Admin rules in buyer's favour
        escrow.resolveDispute(0, buyer);

        assertEq(usdc.balanceOf(buyer), AMOUNT);
    }

    // ── Dispute — admin sends funds back to seller ─────────────────────────────

    function test_DisputeSellerWins() public {
        vm.prank(seller);
        escrow.createOrder(address(usdc), AMOUNT, PRICE);

        vm.prank(buyer);
        escrow.lockOrder(0);

        vm.prank(buyer);
        escrow.markPaid(0);

        vm.prank(buyer);
        escrow.raiseDispute(0);

        // Admin rules in seller's favour
        escrow.resolveDispute(0, seller);

        assertEq(usdc.balanceOf(seller), AMOUNT);
    }

    // ── Seller cannot buy own order ────────────────────────────────────────────

    function test_SellerCannotLock() public {
        vm.prank(seller);
        escrow.createOrder(address(usdc), AMOUNT, PRICE);

        vm.prank(seller);
        vm.expectRevert("Seller cannot buy own order");
        escrow.lockOrder(0);
    }

    // ── Non-whitelisted token rejected ────────────────────────────────────────

    function test_NonWhitelistedTokenRejected() public {
        MockUSDC fakeToken = new MockUSDC();
        fakeToken.mint(seller, AMOUNT);
        vm.prank(seller);
        fakeToken.approve(address(escrow), AMOUNT);

        vm.prank(seller);
        vm.expectRevert("Token not whitelisted");
        escrow.createOrder(address(fakeToken), AMOUNT, PRICE);
    }
}
