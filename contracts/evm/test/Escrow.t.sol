// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/CryptoBazaarEscrow.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USDC", "USDC") {}
    function decimals() public pure override returns (uint8) { return 6; }
    function mint(address to, uint256 amount) external { _mint(to, amount); }
}

contract EscrowTest is Test {
    CryptoBazaarEscrow escrow;
    MockUSDC           usdc;

    address admin    = address(this);
    address seller   = makeAddr("seller");
    address buyer    = makeAddr("buyer");
    address treasury = makeAddr("treasury");

    uint128 constant AMOUNT   = 10e6;  // 10 USDC
    uint128 constant FLAT_FEE = 1e6;   // 1 USDC flat fee
    uint96  constant PRICE    = 9500;  // ₹95.00

    function setUp() public {
        usdc   = new MockUSDC();
        escrow = new CryptoBazaarEscrow(treasury, address(usdc));

        usdc.mint(seller, AMOUNT);
        vm.prank(seller);
        usdc.approve(address(escrow), AMOUNT);
    }

    function test_HappyPath() public {
        vm.prank(seller);
        escrow.createOrder(address(usdc), AMOUNT, PRICE);

        vm.prank(buyer);
        escrow.lockOrder(0, AMOUNT);

        vm.prank(buyer);
        escrow.markPaid(0);

        vm.prank(seller);
        escrow.confirmPayment(0);

        uint128 payout = AMOUNT - FLAT_FEE;
        assertEq(usdc.balanceOf(buyer), payout);
        assertEq(usdc.balanceOf(treasury), FLAT_FEE);
    }

    function test_PartialFill() public {
        vm.prank(seller);
        escrow.createOrder(address(usdc), AMOUNT, PRICE);

        // First buyer locks half
        uint128 half = AMOUNT / 2;
        vm.prank(buyer);
        escrow.lockOrder(0, half);

        vm.prank(buyer);
        escrow.markPaid(0);

        vm.prank(seller);
        escrow.confirmPayment(0);

        // Order should reset to OPEN with remaining half
        (,,,,,, , uint128 remaining,) = escrow.orders(0);
        assertEq(remaining, AMOUNT - half);

        // Buyer got payout minus flat fee
        assertEq(usdc.balanceOf(buyer), half - FLAT_FEE);
    }

    function test_SellerCancel() public {
        vm.prank(seller);
        escrow.createOrder(address(usdc), AMOUNT, PRICE);

        vm.prank(seller);
        escrow.cancelOrder(0);

        assertEq(usdc.balanceOf(seller), AMOUNT);
    }

    function test_BuyerTimeout() public {
        vm.prank(seller);
        escrow.createOrder(address(usdc), AMOUNT, PRICE);

        vm.prank(buyer);
        escrow.lockOrder(0, AMOUNT);

        vm.warp(block.timestamp + 31 minutes);

        vm.prank(seller);
        escrow.timeoutCancel(0);

        // Order is reset to OPEN (funds stay in contract), not cancelled
        (,,, , CryptoBazaarEscrow.Status status,,,,) = escrow.orders(0);
        assertEq(uint8(status), uint8(CryptoBazaarEscrow.Status.OPEN));
    }

    function test_DisputeBuyerWins() public {
        vm.prank(seller);
        escrow.createOrder(address(usdc), AMOUNT, PRICE);

        vm.prank(buyer);
        escrow.lockOrder(0, AMOUNT);

        vm.prank(buyer);
        escrow.markPaid(0);

        vm.prank(seller);
        escrow.raiseDispute(0);

        escrow.resolveDispute(0, buyer);
        assertEq(usdc.balanceOf(buyer), AMOUNT);
    }

    function test_DisputeSellerWins() public {
        vm.prank(seller);
        escrow.createOrder(address(usdc), AMOUNT, PRICE);

        vm.prank(buyer);
        escrow.lockOrder(0, AMOUNT);

        vm.prank(buyer);
        escrow.markPaid(0);

        vm.prank(buyer);
        escrow.raiseDispute(0);

        // Seller wins — gets the lockedAmount (AMOUNT), remaining becomes 0
        escrow.resolveDispute(0, seller);
        assertEq(usdc.balanceOf(seller), AMOUNT);
    }

    function test_SellerCannotLock() public {
        vm.prank(seller);
        escrow.createOrder(address(usdc), AMOUNT, PRICE);

        vm.prank(seller);
        vm.expectRevert(CryptoBazaarEscrow.Unauthorized.selector);
        escrow.lockOrder(0, AMOUNT);
    }

    function test_NonWhitelistedTokenRejected() public {
        MockUSDC fake = new MockUSDC();
        fake.mint(seller, AMOUNT);
        vm.prank(seller);
        fake.approve(address(escrow), AMOUNT);

        vm.prank(seller);
        vm.expectRevert(CryptoBazaarEscrow.InvalidToken.selector);
        escrow.createOrder(address(fake), AMOUNT, PRICE);
    }
}
