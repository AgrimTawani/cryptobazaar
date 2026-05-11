// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title CryptoBazaar P2P Escrow
/// @notice One master contract handles all orders for all whitelisted tokens (USDT + USDC).
///         Seller deposits → buyer locks → buyer marks paid → seller confirms → funds released.
contract CryptoBazaarEscrow is ReentrancyGuard, AccessControl {
    using SafeERC20 for IERC20;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    enum Status { OPEN, LOCKED, PAID, DISPUTED, COMPLETED, CANCELLED }

    struct Order {
        uint256  id;
        address  seller;
        address  buyer;       // address(0) until lockOrder()
        address  token;       // USDT or USDC contract address
        uint256  amount;      // in token's native units
        uint256  priceInr;    // INR per unit × 100  (e.g. 9500 = ₹95.00) — display only
        Status   status;
        uint256  createdAt;
        uint256  lockedAt;    // set in lockOrder — drives 30-min buyer timeout
        uint256  paidAt;      // set in markPaid  — drives 15-min seller timeout (off-chain)
    }

    mapping(uint256 => Order)  public orders;
    mapping(address => bool)   public whitelistedTokens;
    uint256                    public nextOrderId;
    address                    public insuranceFund;
    uint256                    public feeBps = 75; // 0.75%

    // ─── Events ────────────────────────────────────────────────────────────────
    event OrderCreated   (uint256 indexed id, address indexed seller, address token, uint256 amount, uint256 priceInr);
    event OrderLocked    (uint256 indexed id, address indexed buyer);
    event PaymentMarked  (uint256 indexed id);
    event OrderCompleted (uint256 indexed id, address indexed buyer, uint256 amountOut, uint256 fee);
    event DisputeRaised  (uint256 indexed id, address indexed raisedBy);
    event DisputeResolved(uint256 indexed id, address indexed winner);
    event OrderCancelled (uint256 indexed id);
    event OrderTimedOut  (uint256 indexed id);
    event TokenWhitelisted(address indexed token, bool status);

    // ─── Constructor ───────────────────────────────────────────────────────────
    constructor(address _insuranceFund) {
        require(_insuranceFund != address(0), "Invalid insurance fund");
        insuranceFund = _insuranceFund;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    // ─── Admin ─────────────────────────────────────────────────────────────────

    function setTokenWhitelist(address token, bool status) external onlyRole(ADMIN_ROLE) {
        whitelistedTokens[token] = status;
        emit TokenWhitelisted(token, status);
    }

    function setInsuranceFund(address _insuranceFund) external onlyRole(ADMIN_ROLE) {
        require(_insuranceFund != address(0), "Invalid address");
        insuranceFund = _insuranceFund;
    }

    function setFeeBps(uint256 _feeBps) external onlyRole(ADMIN_ROLE) {
        require(_feeBps <= 200, "Max fee 2%");
        feeBps = _feeBps;
    }

    // ─── Seller ────────────────────────────────────────────────────────────────

    /// @notice Seller deposits tokens and lists an order.
    ///         Seller must call token.approve(escrow, amount) first.
    function createOrder(address token, uint256 amount, uint256 priceInr) external nonReentrant {
        require(whitelistedTokens[token], "Token not whitelisted");
        require(amount > 0, "Amount must be > 0");

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        uint256 id = nextOrderId++;
        orders[id] = Order({
            id:        id,
            seller:    msg.sender,
            buyer:     address(0),
            token:     token,
            amount:    amount,
            priceInr:  priceInr,
            status:    Status.OPEN,
            createdAt: block.timestamp,
            lockedAt:  0,
            paidAt:    0
        });

        emit OrderCreated(id, msg.sender, token, amount, priceInr);
    }

    /// @notice Seller cancels before any buyer has locked.
    function cancelOrder(uint256 id) external nonReentrant {
        Order storage o = orders[id];
        require(o.status == Status.OPEN, "Only open orders can be cancelled");
        require(msg.sender == o.seller, "Only seller");

        o.status = Status.CANCELLED;
        IERC20(o.token).safeTransfer(o.seller, o.amount);

        emit OrderCancelled(id);
    }

    /// @notice Seller reclaims funds if buyer locked but didn't mark paid within 30 minutes.
    function timeoutCancel(uint256 id) external nonReentrant {
        Order storage o = orders[id];
        require(o.status == Status.LOCKED, "Order not locked");
        require(msg.sender == o.seller, "Only seller");
        require(block.timestamp >= o.lockedAt + 30 minutes, "Timeout not reached yet");

        o.status = Status.CANCELLED;
        IERC20(o.token).safeTransfer(o.seller, o.amount);

        emit OrderTimedOut(id);
    }

    /// @notice Seller confirms INR was received — releases funds to buyer minus fee.
    function confirmPayment(uint256 id) external nonReentrant {
        Order storage o = orders[id];
        require(o.status == Status.PAID, "Order not in PAID state");
        require(msg.sender == o.seller, "Only seller");

        uint256 fee    = (o.amount * feeBps) / 10000;
        uint256 payout = o.amount - fee;

        o.status = Status.COMPLETED;

        IERC20(o.token).safeTransfer(insuranceFund, fee);
        IERC20(o.token).safeTransfer(o.buyer, payout);

        emit OrderCompleted(id, o.buyer, payout, fee);
    }

    // ─── Buyer ─────────────────────────────────────────────────────────────────

    /// @notice Buyer locks the order — their address is bound here, not before.
    function lockOrder(uint256 id) external nonReentrant {
        Order storage o = orders[id];
        require(o.status == Status.OPEN, "Order not open");
        require(msg.sender != o.seller, "Seller cannot buy own order");

        o.buyer    = msg.sender;
        o.status   = Status.LOCKED;
        o.lockedAt = block.timestamp;

        emit OrderLocked(id, msg.sender);
    }

    /// @notice Buyer marks INR payment as sent (after sending via UPI/IMPS/NEFT).
    function markPaid(uint256 id) external {
        Order storage o = orders[id];
        require(o.status == Status.LOCKED, "Order not locked");
        require(msg.sender == o.buyer, "Only buyer");

        o.status = Status.PAID;
        o.paidAt = block.timestamp;

        emit PaymentMarked(id);
    }

    // ─── Dispute ───────────────────────────────────────────────────────────────

    /// @notice Either party raises a dispute after buyer marks paid.
    function raiseDispute(uint256 id) external {
        Order storage o = orders[id];
        require(o.status == Status.PAID, "Can only dispute after payment is marked");
        require(msg.sender == o.seller || msg.sender == o.buyer, "Not a party to this order");

        o.status = Status.DISPUTED;
        emit DisputeRaised(id, msg.sender);
    }

    /// @notice Admin (multisig on mainnet) resolves dispute — sends funds to winner.
    function resolveDispute(uint256 id, address winner) external nonReentrant onlyRole(ADMIN_ROLE) {
        Order storage o = orders[id];
        require(o.status == Status.DISPUTED, "Order not disputed");
        require(winner == o.buyer || winner == o.seller, "Winner must be a party");

        o.status = Status.COMPLETED;
        IERC20(o.token).safeTransfer(winner, o.amount);

        emit DisputeResolved(id, winner);
    }
}
