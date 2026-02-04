// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ReputationSystem
 * @dev On-chain reputation tracking for AI agents
 * @author Pincer Protocol 🦞
 * 
 * Reputation Score:
 * - Starts at 100
 * - Max: 1000
 * - Min: 0 (banned threshold: 10)
 * 
 * Score Changes:
 * - Transaction complete (buyer satisfied): +5
 * - Transaction complete (seller delivered): +5
 * - Dispute won: +10
 * - Dispute lost: -20
 * - Dispute as bad actor: -50
 * - Time-based decay: -1 per month inactive
 */
contract ReputationSystem is AccessControl {

    // ============ Roles ============

    bytes32 public constant ESCROW_ROLE = keccak256("ESCROW_ROLE");
    bytes32 public constant DISPUTE_ROLE = keccak256("DISPUTE_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // ============ Structs ============

    struct AgentReputation {
        uint256 score;
        uint256 totalTransactions;
        uint256 successfulTransactions;
        uint256 disputesWon;
        uint256 disputesLost;
        uint256 lastActiveTime;
        bool isBanned;
        uint256 registeredAt;
    }

    // ============ Constants ============

    uint256 public constant INITIAL_SCORE = 100;
    uint256 public constant MAX_SCORE = 1000;
    uint256 public constant BAN_THRESHOLD = 10;
    
    // Score changes
    int256 public constant TRANSACTION_COMPLETE = 5;
    int256 public constant DISPUTE_WON = 10;
    int256 public constant DISPUTE_LOST = -20;
    int256 public constant BAD_ACTOR_PENALTY = -50;
    int256 public constant MONTHLY_DECAY = -1;

    // ============ State Variables ============

    mapping(address => AgentReputation) public reputations;
    mapping(address => bool) public registeredAgents;
    
    uint256 public totalAgents;
    uint256 public totalTransactions;

    // ============ Events ============

    event AgentRegistered(address indexed agent, uint256 timestamp);
    event ReputationUpdated(address indexed agent, uint256 oldScore, uint256 newScore, string reason);
    event AgentBanned(address indexed agent, string reason);
    event AgentUnbanned(address indexed agent);
    event TransactionRecorded(address indexed buyer, address indexed seller, bool successful);

    // ============ Constructor ============

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    // ============ Registration ============

    /**
     * @dev Register a new agent
     */
    function registerAgent(address agent) external {
        require(!registeredAgents[agent], "Already registered");
        
        registeredAgents[agent] = true;
        reputations[agent] = AgentReputation({
            score: INITIAL_SCORE,
            totalTransactions: 0,
            successfulTransactions: 0,
            disputesWon: 0,
            disputesLost: 0,
            lastActiveTime: block.timestamp,
            isBanned: false,
            registeredAt: block.timestamp
        });
        
        totalAgents++;
        
        emit AgentRegistered(agent, block.timestamp);
    }

    // ============ Score Updates ============

    /**
     * @dev Record a completed transaction
     * @param buyer Buyer agent address
     * @param seller Seller agent address
     * @param successful Whether transaction was successful
     */
    function recordTransaction(
        address buyer,
        address seller,
        bool successful
    ) external onlyRole(ESCROW_ROLE) {
        require(registeredAgents[buyer], "Buyer not registered");
        require(registeredAgents[seller], "Seller not registered");
        
        // Update activity time
        reputations[buyer].lastActiveTime = block.timestamp;
        reputations[seller].lastActiveTime = block.timestamp;
        
        // Update transaction counts
        reputations[buyer].totalTransactions++;
        reputations[seller].totalTransactions++;
        totalTransactions++;
        
        if (successful) {
            reputations[buyer].successfulTransactions++;
            reputations[seller].successfulTransactions++;
            
            // Add reputation
            _updateScore(buyer, TRANSACTION_COMPLETE, "Transaction completed");
            _updateScore(seller, TRANSACTION_COMPLETE, "Transaction completed");
        }
        
        emit TransactionRecorded(buyer, seller, successful);
    }

    /**
     * @dev Record dispute resolution
     * @param winner Winning party
     * @param loser Losing party
     * @param loserIsBadActor Whether loser acted maliciously
     */
    function recordDisputeResolution(
        address winner,
        address loser,
        bool loserIsBadActor
    ) external onlyRole(DISPUTE_ROLE) {
        require(registeredAgents[winner], "Winner not registered");
        require(registeredAgents[loser], "Loser not registered");
        
        // Update winner
        reputations[winner].disputesWon++;
        reputations[winner].lastActiveTime = block.timestamp;
        _updateScore(winner, DISPUTE_WON, "Dispute won");
        
        // Update loser
        reputations[loser].disputesLost++;
        reputations[loser].lastActiveTime = block.timestamp;
        
        if (loserIsBadActor) {
            _updateScore(loser, BAD_ACTOR_PENALTY, "Bad actor in dispute");
        } else {
            _updateScore(loser, DISPUTE_LOST, "Dispute lost");
        }
        
        // Check for ban
        if (reputations[loser].score <= BAN_THRESHOLD) {
            _banAgent(loser, "Score below threshold");
        }
    }

    /**
     * @dev Apply time-based decay (can be called by anyone)
     * @param agent Agent to apply decay to
     */
    function applyDecay(address agent) external {
        require(registeredAgents[agent], "Not registered");
        
        AgentReputation storage rep = reputations[agent];
        uint256 monthsInactive = (block.timestamp - rep.lastActiveTime) / 30 days;
        
        if (monthsInactive > 0) {
            int256 totalDecay = MONTHLY_DECAY * int256(monthsInactive);
            _updateScore(agent, totalDecay, "Inactivity decay");
            rep.lastActiveTime = block.timestamp; // Reset to prevent double decay
        }
    }

    // ============ Admin Functions ============

    /**
     * @dev Manually adjust reputation (admin only)
     */
    function adjustReputation(
        address agent,
        int256 change,
        string calldata reason
    ) external onlyRole(ADMIN_ROLE) {
        require(registeredAgents[agent], "Not registered");
        _updateScore(agent, change, reason);
    }

    /**
     * @dev Ban an agent
     */
    function banAgent(address agent, string calldata reason) external onlyRole(ADMIN_ROLE) {
        _banAgent(agent, reason);
    }

    /**
     * @dev Unban an agent
     */
    function unbanAgent(address agent) external onlyRole(ADMIN_ROLE) {
        require(registeredAgents[agent], "Not registered");
        require(reputations[agent].isBanned, "Not banned");
        
        reputations[agent].isBanned = false;
        reputations[agent].score = INITIAL_SCORE; // Reset to initial
        
        emit AgentUnbanned(agent);
    }

    /**
     * @dev Grant escrow role to an address
     */
    function setEscrowContract(address escrow) external onlyRole(ADMIN_ROLE) {
        _grantRole(ESCROW_ROLE, escrow);
    }

    /**
     * @dev Grant dispute role to an address
     */
    function setDisputeContract(address dispute) external onlyRole(ADMIN_ROLE) {
        _grantRole(DISPUTE_ROLE, dispute);
    }

    // ============ View Functions ============

    /**
     * @dev Get agent reputation details
     */
    function getReputation(address agent) external view returns (AgentReputation memory) {
        return reputations[agent];
    }

    /**
     * @dev Get agent score
     */
    function getScore(address agent) external view returns (uint256) {
        return reputations[agent].score;
    }

    /**
     * @dev Check if agent is in good standing
     */
    function isInGoodStanding(address agent) external view returns (bool) {
        if (!registeredAgents[agent]) return false;
        if (reputations[agent].isBanned) return false;
        if (reputations[agent].score <= BAN_THRESHOLD) return false;
        return true;
    }

    /**
     * @dev Get success rate for an agent
     */
    function getSuccessRate(address agent) external view returns (uint256) {
        AgentReputation storage rep = reputations[agent];
        if (rep.totalTransactions == 0) return 100; // No history = assume good
        return (rep.successfulTransactions * 100) / rep.totalTransactions;
    }

    /**
     * @dev Get trust tier based on score
     */
    function getTrustTier(address agent) external view returns (string memory) {
        uint256 score = reputations[agent].score;
        
        if (score >= 800) return "Platinum";
        if (score >= 500) return "Gold";
        if (score >= 200) return "Silver";
        if (score >= 50) return "Bronze";
        return "Unverified";
    }

    // ============ Internal Functions ============

    function _updateScore(address agent, int256 change, string memory reason) internal {
        AgentReputation storage rep = reputations[agent];
        uint256 oldScore = rep.score;
        
        if (change > 0) {
            rep.score = rep.score + uint256(change);
            if (rep.score > MAX_SCORE) rep.score = MAX_SCORE;
        } else {
            uint256 decrease = uint256(-change);
            if (decrease >= rep.score) {
                rep.score = 0;
            } else {
                rep.score = rep.score - decrease;
            }
        }
        
        emit ReputationUpdated(agent, oldScore, rep.score, reason);
    }

    function _banAgent(address agent, string memory reason) internal {
        require(registeredAgents[agent], "Not registered");
        reputations[agent].isBanned = true;
        emit AgentBanned(agent, reason);
    }
}
