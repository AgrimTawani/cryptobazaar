// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title EscrowContract
 * @notice P2P Escrow for USDC/USDT orders on CryptoBazaar
 * @dev Holds tokens in escrow until seller releases to buyer
 */
contract EscrowContract is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable token; // USDC or USDT address

    enum OrderStatus {
        ACTIVE,
        COMPLETED,
        CANCELLED,
        EXPIRED
    }

    struct Order {
        uint256 orderId;
        address seller;
        uint256 amount;
        uint256 rate;
        uint256 createdAt;
        uint256 expiresAt;
        address buyer;
        OrderStatus status;
    }

    // State variables
    uint256 public orderCounter;
    mapping(uint256 => Order) public orders;
    mapping(address => uint256[]) public sellerOrders;

    // Events
    event OrderCreated(
        uint256 indexed orderId,
        address indexed seller,
        uint256 amount,
        uint256 rate,
        uint256 expiresAt
    );
    event OrderReleased(
        uint256 indexed orderId,
        address indexed buyer,
        uint256 amount
    );
    event OrderCancelled(uint256 indexed orderId, address indexed seller);
    event OrderExpired(uint256 indexed orderId, address indexed seller);

    constructor(address _token) {
        require(_token != address(0), "Invalid token address");
        token = IERC20(_token);
    }

    /**
     * @notice Create a new sell order by locking tokens in escrow
     * @param amount Amount of tokens to sell
     * @param rate INR rate per token
     * @param duration Order duration in seconds
     * @return orderId The created order ID
     */
    function createOrder(
        uint256 amount,
        uint256 rate,
        uint256 duration
    ) external nonReentrant returns (uint256) {
        require(amount > 0, "Amount must be greater than 0");
        require(rate > 0, "Rate must be greater than 0");
        require(duration > 0, "Duration must be greater than 0");

        // Transfer tokens from seller to escrow
        token.safeTransferFrom(msg.sender, address(this), amount);

        // Create order
        uint256 orderId = orderCounter++;
        uint256 expiresAt = block.timestamp + duration;

        orders[orderId] = Order({
            orderId: orderId,
            seller: msg.sender,
            amount: amount,
            rate: rate,
            createdAt: block.timestamp,
            expiresAt: expiresAt,
            buyer: address(0),
            status: OrderStatus.ACTIVE
        });

        sellerOrders[msg.sender].push(orderId);

        emit OrderCreated(orderId, msg.sender, amount, rate, expiresAt);

        return orderId;
    }

    /**
     * @notice Release escrowed tokens to buyer (called by seller after payment)
     * @param orderId The order ID
     * @param buyer The buyer's wallet address
     */
    function releaseOrder(uint256 orderId, address buyer)
        external
        nonReentrant
    {
        Order storage order = orders[orderId];

        require(order.seller == msg.sender, "Only seller can release");
        require(order.status == OrderStatus.ACTIVE, "Order not active");
        require(buyer != address(0), "Invalid buyer address");
        require(
            block.timestamp <= order.expiresAt,
            "Order expired"
        );

        // Update order
        order.buyer = buyer;
        order.status = OrderStatus.COMPLETED;

        // Transfer tokens to buyer
        token.safeTransfer(buyer, order.amount);

        emit OrderReleased(orderId, buyer, order.amount);
    }

    /**
     * @notice Cancel order and return tokens to seller
     * @param orderId The order ID
     */
    function cancelOrder(uint256 orderId) external nonReentrant {
        Order storage order = orders[orderId];

        require(order.seller == msg.sender, "Only seller can cancel");
        require(order.status == OrderStatus.ACTIVE, "Order not active");
        require(order.buyer == address(0), "Buyer already committed");

        // Update status
        order.status = OrderStatus.CANCELLED;

        // Return tokens to seller
        token.safeTransfer(order.seller, order.amount);

        emit OrderCancelled(orderId, order.seller);
    }

    /**
     * @notice Expire order and return tokens to seller (callable by anyone)
     * @param orderId The order ID
     */
    function expireOrder(uint256 orderId) external nonReentrant {
        Order storage order = orders[orderId];

        require(order.status == OrderStatus.ACTIVE, "Order not active");
        require(block.timestamp > order.expiresAt, "Order not expired yet");
        require(order.buyer == address(0), "Order already has buyer");

        // Update status
        order.status = OrderStatus.EXPIRED;

        // Return tokens to seller
        token.safeTransfer(order.seller, order.amount);

        emit OrderExpired(orderId, order.seller);
    }

    /**
     * @notice Get order details
     * @param orderId The order ID
     */
    function getOrder(uint256 orderId) external view returns (Order memory) {
        return orders[orderId];
    }

    /**
     * @notice Get all orders by seller
     * @param seller The seller's address
     */
    function getSellerOrders(address seller)
        external
        view
        returns (uint256[] memory)
    {
        return sellerOrders[seller];
    }

    /**
     * @notice Get total number of orders created
     */
    function getTotalOrders() external view returns (uint256) {
        return orderCounter;
    }

    /**
     * @notice Get contract's token balance
     */
    function getContractBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }
}
