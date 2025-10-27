// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TokenLocker
 * @notice Locks any ERC20 token (e.g. USDC/USDT) for a specific duration.
 * Designed for P2P exchange escrow-like usage.
 */
contract TokenLocker is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable token; // ERC20 token address

    struct Lock {
        uint256 amount;
        uint256 lockedAt;
        uint256 unlockTime;
        bool withdrawn;
    }

    mapping(address => Lock[]) public userLocks;
    mapping(address => uint256) public totalLocked;
    uint256 public totalLocks;

    event TokensLocked(address indexed user, uint256 amount, uint256 lockId, uint256 unlockTime);
    event TokensWithdrawn(address indexed user, uint256 amount, uint256 lockId);

    constructor(address _token) {
        require(_token != address(0), "Invalid token address");
        token = IERC20(_token);
    }

    function lockTokens(uint256 amount, uint256 lockDuration) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(lockDuration > 0, "Duration must be > 0");

        uint256 unlockTime = block.timestamp + lockDuration;
        token.safeTransferFrom(msg.sender, address(this), amount);

        userLocks[msg.sender].push(Lock({
            amount: amount,
            lockedAt: block.timestamp,
            unlockTime: unlockTime,
            withdrawn: false
        }));

        totalLocked[msg.sender] += amount;
        totalLocks++;

        emit TokensLocked(msg.sender, amount, userLocks[msg.sender].length - 1, unlockTime);
    }

    function withdrawTokens(uint256 lockId) external nonReentrant {
        require(lockId < userLocks[msg.sender].length, "Invalid lockId");

        Lock storage userLock = userLocks[msg.sender][lockId];
        require(!userLock.withdrawn, "Already withdrawn");
        require(block.timestamp >= userLock.unlockTime, "Still locked");

        userLock.withdrawn = true;
        totalLocked[msg.sender] -= userLock.amount;
        token.safeTransfer(msg.sender, userLock.amount);

        emit TokensWithdrawn(msg.sender, userLock.amount, lockId);
    }

    function getUserLocks(address user) external view returns (Lock[] memory) {
        return userLocks[user];
    }

    function getContractBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }
}
