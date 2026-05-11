// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title CryptoBazaar P2P Escrow (lean version)
contract CryptoBazaarEscrow {
    using SafeERC20 for IERC20;

    // Custom errors — far cheaper than string messages
    error Unauthorized();
    error InvalidToken();
    error InvalidState();
    error NotParty();
    error TimeoutNotReached();
    error ZeroAmount();
    error InvalidAddress();

    enum Status { OPEN, LOCKED, PAID, DISPUTED, COMPLETED, CANCELLED }

    // Tightly packed struct — fits in 4 storage slots instead of 6
    struct Order {
        address seller;    // slot 1 (20 bytes)
        uint96  priceInr;  // slot 1 (12 bytes) — packed with seller
        address buyer;     // slot 2 (20 bytes)
        uint64  lockedAt;  // slot 2 (8 bytes) — packed with buyer
        address token;     // slot 3 (20 bytes)
        uint64  paidAt;    // slot 3 (8 bytes) — packed with token
        uint128 amount;    // slot 4 (16 bytes)
        Status  status;    // slot 4 (1 byte)  — packed with amount
    }

    address public admin;
    address public insuranceFund;
    uint16  public feeBps = 75; // 0.75%
    uint256 public nextOrderId;

    mapping(uint256 => Order) public orders;
    mapping(address => bool)  public whitelisted;

    event OrderCreated   (uint256 indexed id, address indexed seller, address token, uint128 amount, uint96 priceInr);
    event OrderLocked    (uint256 indexed id, address indexed buyer);
    event PaymentMarked  (uint256 indexed id);
    event OrderCompleted (uint256 indexed id, address indexed buyer, uint128 payout, uint128 fee);
    event DisputeRaised  (uint256 indexed id, address indexed raisedBy);
    event DisputeResolved(uint256 indexed id, address indexed winner);
    event OrderCancelled (uint256 indexed id);
    event OrderTimedOut  (uint256 indexed id);

    modifier onlyAdmin() {
        if (msg.sender != admin) revert Unauthorized();
        _;
    }

    constructor(address _insuranceFund, address _initialToken) {
        if (_insuranceFund == address(0)) revert InvalidAddress();
        admin         = msg.sender;
        insuranceFund = _insuranceFund;
        if (_initialToken != address(0)) whitelisted[_initialToken] = true;
    }

    // ─── Admin ─────────────────────────────────────────────────────────────────

    function setWhitelist(address token, bool status) external onlyAdmin {
        whitelisted[token] = status;
    }

    function setInsuranceFund(address _fund) external onlyAdmin {
        if (_fund == address(0)) revert InvalidAddress();
        insuranceFund = _fund;
    }

    function setFeeBps(uint16 _feeBps) external onlyAdmin {
        if (_feeBps > 200) revert Unauthorized();
        feeBps = _feeBps;
    }

    // ─── Seller ────────────────────────────────────────────────────────────────

    function createOrder(address token, uint128 amount, uint96 priceInr) external {
        if (!whitelisted[token]) revert InvalidToken();
        if (amount == 0) revert ZeroAmount();

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        uint256 id    = nextOrderId++;
        Order storage o = orders[id];
        o.seller   = msg.sender;
        o.token    = token;
        o.amount   = amount;
        o.priceInr = priceInr;
        // status defaults to OPEN (0)

        emit OrderCreated(id, msg.sender, token, amount, priceInr);
    }

    function cancelOrder(uint256 id) external {
        Order storage o = orders[id];
        if (o.status != Status.OPEN) revert InvalidState();
        if (msg.sender != o.seller)  revert Unauthorized();

        o.status = Status.CANCELLED;
        IERC20(o.token).safeTransfer(o.seller, o.amount);
        emit OrderCancelled(id);
    }

    function timeoutCancel(uint256 id) external {
        Order storage o = orders[id];
        if (o.status != Status.LOCKED)                      revert InvalidState();
        if (msg.sender != o.seller)                         revert Unauthorized();
        if (block.timestamp < o.lockedAt + 30 minutes)      revert TimeoutNotReached();

        o.status = Status.CANCELLED;
        IERC20(o.token).safeTransfer(o.seller, o.amount);
        emit OrderTimedOut(id);
    }

    // State updated BEFORE transfer (checks-effects-interactions — no reentrancy guard needed)
    function confirmPayment(uint256 id) external {
        Order storage o = orders[id];
        if (o.status != Status.PAID)    revert InvalidState();
        if (msg.sender != o.seller)     revert Unauthorized();

        uint128 fee    = uint128((uint256(o.amount) * feeBps) / 10000);
        uint128 payout = o.amount - fee;
        address buyer  = o.buyer;
        address token  = o.token;

        o.status = Status.COMPLETED; // effect before interaction

        IERC20(token).safeTransfer(insuranceFund, fee);
        IERC20(token).safeTransfer(buyer, payout);
        emit OrderCompleted(id, buyer, payout, fee);
    }

    // ─── Buyer ─────────────────────────────────────────────────────────────────

    function lockOrder(uint256 id) external {
        Order storage o = orders[id];
        if (o.status != Status.OPEN)    revert InvalidState();
        if (msg.sender == o.seller)     revert Unauthorized();

        o.buyer    = msg.sender;
        o.status   = Status.LOCKED;
        o.lockedAt = uint64(block.timestamp);
        emit OrderLocked(id, msg.sender);
    }

    function markPaid(uint256 id) external {
        Order storage o = orders[id];
        if (o.status != Status.LOCKED)  revert InvalidState();
        if (msg.sender != o.buyer)      revert Unauthorized();

        o.status = Status.PAID;
        o.paidAt = uint64(block.timestamp);
        emit PaymentMarked(id);
    }

    // ─── Dispute ───────────────────────────────────────────────────────────────

    function raiseDispute(uint256 id) external {
        Order storage o = orders[id];
        if (o.status != Status.PAID)                            revert InvalidState();
        if (msg.sender != o.seller && msg.sender != o.buyer)   revert NotParty();

        o.status = Status.DISPUTED;
        emit DisputeRaised(id, msg.sender);
    }

    function resolveDispute(uint256 id, address winner) external onlyAdmin {
        Order storage o = orders[id];
        if (o.status != Status.DISPUTED)                revert InvalidState();
        if (winner != o.buyer && winner != o.seller)    revert NotParty();

        o.status = Status.COMPLETED;
        IERC20(o.token).safeTransfer(winner, o.amount);
        emit DisputeResolved(id, winner);
    }
}
