// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

contract USDTLocker {
    IERC20 public usdtToken;
    
    struct Lock {
        address user;
        uint256 amount;
        uint256 lockedAt;
        uint256 unlockTime;
        bool withdrawn;
    }
    
    mapping(address => Lock[]) public userLocks;
    mapping(address => uint256) public totalLocked;
    
    uint256 public totalLocksCount;
    
    event TokensLocked(address indexed user, uint256 amount, uint256 lockId, uint256 unlockTime);
    event TokensWithdrawn(address indexed user, uint256 amount, uint256 lockId);
    
    // USDT on Polygon Amoy: 0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582
    constructor(address _usdtToken) {
        usdtToken = IERC20(_usdtToken);
    }
    
    /**
     * @dev Lock USDT tokens for a specified duration
     * @param amount Amount of USDT to lock (in wei, USDT has 6 decimals)
     * @param lockDuration Duration to lock tokens in seconds
     */
    function lockTokens(uint256 amount, uint256 lockDuration) external {
        require(amount > 0, "Amount must be greater than 0");
        require(lockDuration > 0, "Lock duration must be greater than 0");
        
        // Transfer USDT from user to this contract
        require(
            usdtToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed. Make sure you approved the contract."
        );
        
        uint256 unlockTime = block.timestamp + lockDuration;
        
        Lock memory newLock = Lock({
            user: msg.sender,
            amount: amount,
            lockedAt: block.timestamp,
            unlockTime: unlockTime,
            withdrawn: false
        });
        
        userLocks[msg.sender].push(newLock);
        totalLocked[msg.sender] += amount;
        totalLocksCount++;
        
        emit TokensLocked(msg.sender, amount, userLocks[msg.sender].length - 1, unlockTime);
    }
    
    /**
     * @dev Lock exactly 5 USDT for testing (convenience function)
     * @param lockDuration Duration to lock tokens in seconds
     */
    function lock5USDT(uint256 lockDuration) external {
        uint256 amount = 5 * 10**6; // 5 USDT (6 decimals)
        
        require(
            usdtToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed. Make sure you approved the contract."
        );
        
        uint256 unlockTime = block.timestamp + lockDuration;
        
        Lock memory newLock = Lock({
            user: msg.sender,
            amount: amount,
            lockedAt: block.timestamp,
            unlockTime: unlockTime,
            withdrawn: false
        });
        
        userLocks[msg.sender].push(newLock);
        totalLocked[msg.sender] += amount;
        totalLocksCount++;
        
        emit TokensLocked(msg.sender, amount, userLocks[msg.sender].length - 1, unlockTime);
    }
    
    /**
     * @dev Withdraw locked tokens after unlock time
     * @param lockId Index of the lock to withdraw
     */
    function withdrawTokens(uint256 lockId) external {
        require(lockId < userLocks[msg.sender].length, "Invalid lock ID");
        Lock storage lock = userLocks[msg.sender][lockId];
        
        require(!lock.withdrawn, "Tokens already withdrawn");
        require(block.timestamp >= lock.unlockTime, "Tokens are still locked");
        require(lock.user == msg.sender, "Not your lock");
        
        lock.withdrawn = true;
        totalLocked[msg.sender] -= lock.amount;
        
        require(usdtToken.transfer(msg.sender, lock.amount), "Transfer failed");
        
        emit TokensWithdrawn(msg.sender, lock.amount, lockId);
    }
    
    /**
     * @dev Get all locks for a user
     * @param user Address of the user
     */
    function getUserLocks(address user) external view returns (Lock[] memory) {
        return userLocks[user];
    }
    
    /**
     * @dev Get number of locks for a user
     * @param user Address of the user
     */
    function getUserLocksCount(address user) external view returns (uint256) {
        return userLocks[user].length;
    }
    
    /**
     * @dev Get specific lock details
     * @param user Address of the user
     * @param lockId Index of the lock
     */
    function getLockDetails(address user, uint256 lockId) 
        external 
        view 
        returns (
            uint256 amount,
            uint256 lockedAt,
            uint256 unlockTime,
            bool withdrawn,
            uint256 timeRemaining
        ) 
    {
        require(lockId < userLocks[user].length, "Invalid lock ID");
        Lock memory lock = userLocks[user][lockId];
        
        uint256 remaining = 0;
        if (block.timestamp < lock.unlockTime) {
            remaining = lock.unlockTime - block.timestamp;
        }
        
        return (
            lock.amount,
            lock.lockedAt,
            lock.unlockTime,
            lock.withdrawn,
            remaining
        );
    }
    
    /**
     * @dev Get contract USDT balance
     */
    function getContractBalance() external view returns (uint256) {
        return usdtToken.balanceOf(address(this));
    }
}
