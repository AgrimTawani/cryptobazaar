// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title CryptoBazaar P2P Escrow — partial fills supported
contract CryptoBazaarEscrow {
    using SafeERC20 for IERC20;

    error Unauthorized();
    error InvalidToken();
    error InvalidState();
    error NotParty();
    error TimeoutNotReached();
    error ZeroAmount();
    error InvalidAddress();
    error AmountTooSmall();

    enum Status { OPEN, LOCKED, PAID, DISPUTED, COMPLETED, CANCELLED }

    // 4 storage slots
    struct Order {
        address seller;       // slot 1 (20 bytes)
        uint96  priceInr;     // slot 1 (+12 = 32) ✓
        address buyer;        // slot 2 (20 bytes)
        uint64  lockedAt;     // slot 2 (+8 = 28)
        Status  status;       // slot 2 (+1 = 29, 3 bytes padding)
        address token;        // slot 3 (20 bytes)
        uint64  paidAt;       // slot 3 (+8 = 28, 4 bytes padding)
        uint128 amount;       // slot 4 (16 bytes) — remaining in escrow
        uint128 lockedAmount; // slot 4 (+16 = 32) ✓ — what current buyer locked
    }

    address public admin;
    address public treasury;
    uint128 public flatFee = 1_000_000;
    uint256 public nextOrderId;

    mapping(uint256 => Order) public orders;
    mapping(address => bool)  public whitelisted;

    event OrderCreated   (uint256 indexed id, address indexed seller, address token, uint128 amount, uint96 priceInr);
    event OrderLocked    (uint256 indexed id, address indexed buyer, uint128 lockedAmount);
    event PaymentMarked  (uint256 indexed id);
    event OrderCompleted (uint256 indexed id, address indexed buyer, uint128 payout, uint128 fee, uint128 remaining);
    event DisputeRaised  (uint256 indexed id, address indexed raisedBy);
    event DisputeResolved(uint256 indexed id, address indexed winner);
    event OrderCancelled (uint256 indexed id);
    event OrderTimedOut  (uint256 indexed id);

    modifier onlyAdmin() {
        if (msg.sender != admin) revert Unauthorized();
        _;
    }

    constructor(address _treasury, address _initialToken) {
        if (_treasury == address(0)) revert InvalidAddress();
        admin    = msg.sender;
        treasury = _treasury;
        if (_initialToken != address(0)) whitelisted[_initialToken] = true;
    }

    function setWhitelist(address token, bool _status) external onlyAdmin {
        whitelisted[token] = _status;
    }
    function setTreasury(address _treasury) external onlyAdmin {
        if (_treasury == address(0)) revert InvalidAddress();
        treasury = _treasury;
    }
    function setFlatFee(uint128 _flatFee) external onlyAdmin {
        flatFee = _flatFee;
    }

    function createOrder(address token, uint128 amount, uint96 priceInr) external {
        if (!whitelisted[token]) revert InvalidToken();
        if (amount == 0) revert ZeroAmount();
        if (amount <= flatFee) revert AmountTooSmall();

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        uint256 id = nextOrderId++;
        Order storage o = orders[id];
        o.seller   = msg.sender;
        o.token    = token;
        o.amount   = amount;
        o.priceInr = priceInr;

        emit OrderCreated(id, msg.sender, token, amount, priceInr);
    }

    function cancelOrder(uint256 id) external {
        Order storage o = orders[id];
        if (o.status != Status.OPEN) revert InvalidState();
        if (msg.sender != o.seller)  revert Unauthorized();

        uint128 refund = o.amount;
        o.status = Status.CANCELLED;
        o.amount = 0;
        IERC20(o.token).safeTransfer(o.seller, refund);
        emit OrderCancelled(id);
    }

    function timeoutCancel(uint256 id) external {
        Order storage o = orders[id];
        if (o.status != Status.LOCKED)                 revert InvalidState();
        if (msg.sender != o.seller)                    revert Unauthorized();
        if (block.timestamp < o.lockedAt + 30 minutes) revert TimeoutNotReached();

        o.status       = Status.OPEN;
        o.buyer        = address(0);
        o.lockedAt     = 0;
        o.lockedAmount = 0;
        emit OrderTimedOut(id);
    }

    function confirmPayment(uint256 id) external {
        Order storage o = orders[id];
        if (o.status != Status.PAID) revert InvalidState();
        if (msg.sender != o.seller)  revert Unauthorized();

        uint128 fee          = flatFee;
        uint128 locked       = o.lockedAmount;
        uint128 payout       = locked - fee;
        uint128 newRemaining = o.amount - locked;
        address buyer        = o.buyer;
        address token        = o.token;

        o.amount       = newRemaining;
        o.lockedAmount = 0;
        o.buyer        = address(0);
        o.lockedAt     = 0;
        o.paidAt       = 0;

        if (newRemaining > 0) {
            o.status = Status.OPEN;
        } else {
            o.status = Status.COMPLETED;
        }

        IERC20(token).safeTransfer(treasury, fee);
        IERC20(token).safeTransfer(buyer, payout);
        emit OrderCompleted(id, buyer, payout, fee, newRemaining);
    }

    function lockOrder(uint256 id, uint128 buyAmount) external {
        Order storage o = orders[id];
        if (o.status != Status.OPEN)       revert InvalidState();
        if (msg.sender == o.seller)        revert Unauthorized();
        if (buyAmount == 0)                revert ZeroAmount();
        if (buyAmount > o.amount)          revert AmountTooSmall();
        if (buyAmount <= flatFee)          revert AmountTooSmall();

        o.buyer        = msg.sender;
        o.lockedAmount = buyAmount;
        o.status       = Status.LOCKED;
        o.lockedAt     = uint64(block.timestamp);
        emit OrderLocked(id, msg.sender, buyAmount);
    }

    function markPaid(uint256 id) external {
        Order storage o = orders[id];
        if (o.status != Status.LOCKED) revert InvalidState();
        if (msg.sender != o.buyer)     revert Unauthorized();

        o.status = Status.PAID;
        o.paidAt = uint64(block.timestamp);
        emit PaymentMarked(id);
    }

    function raiseDispute(uint256 id) external {
        Order storage o = orders[id];
        if (o.status != Status.PAID)                          revert InvalidState();
        if (msg.sender != o.seller && msg.sender != o.buyer) revert NotParty();

        o.status = Status.DISPUTED;
        emit DisputeRaised(id, msg.sender);
    }

    function resolveDispute(uint256 id, address winner) external onlyAdmin {
        Order storage o = orders[id];
        if (o.status != Status.DISPUTED)             revert InvalidState();
        if (winner != o.buyer && winner != o.seller) revert NotParty();

        uint128 locked       = o.lockedAmount;
        uint128 newRemaining = o.amount - locked;
        address token        = o.token;

        o.amount       = newRemaining;
        o.lockedAmount = 0;
        o.buyer        = address(0);
        o.lockedAt     = 0;
        o.paidAt       = 0;
        o.status       = newRemaining > 0 ? Status.OPEN : Status.COMPLETED;

        IERC20(token).safeTransfer(winner, locked);
        emit DisputeResolved(id, winner);
    }
}
