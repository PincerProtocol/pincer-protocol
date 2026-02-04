// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title SimpleEscrow
 * @dev Pincer Protocol의 에스크로 컨트랙트
 * @author Pincer Protocol 🦞
 * 
 * Features:
 * - 구매자가 토큰을 예치하고, 작업 완료 후 판매자에게 전송
 * - 판매자 보호: 증거 제출 후 24시간 무응답 시 자동 완료
 * - 긴급 정지 기능 (Pausable)
 * - 재진입 공격 방지 (ReentrancyGuard)
 */
contract SimpleEscrow is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    /// @notice 거래 상태
    enum Status {
        PENDING,    // 대기 중 (에스크로에 토큰 예치됨)
        COMPLETED,  // 완료 (판매자에게 전송됨)
        CANCELLED,  // 취소 (구매자에게 환불됨)
        DISPUTED    // 분쟁 중
    }

    /// @notice 거래 정보
    struct Transaction {
        uint256 id;
        address buyer;
        address seller;
        uint256 amount;
        uint256 fee;
        Status status;
        uint256 createdAt;
        uint256 expiresAt;
        bool sellerClaimed;       // 판매자 작업완료 주장
        uint256 sellerClaimTime;  // 주장 시간
    }

    /// @notice PNCR 토큰 컨트랙트
    IERC20 public immutable token;

    /// @notice 수수료 수령자
    address public feeRecipient;

    /// @notice 수수료율 (basis points, 10000 = 100%)
    uint256 public feeRate = 200; // 2%

    /// @notice 최대 수수료율 (5%)
    uint256 public constant MAX_FEE_RATE = 500;

    /// @notice 에스크로 기본 만료 기간 (48시간)
    uint256 public constant DEFAULT_ESCROW_DURATION = 48 hours;

    /// @notice 판매자 자동완료 대기 시간 (24시간)
    uint256 public constant SELLER_CLAIM_WINDOW = 24 hours;

    /// @notice 최소 거래 금액 (스팸 방지)
    uint256 public minAmount = 1e18; // 1 PNCR

    /// @notice 거래 카운터
    uint256 public transactionCount;

    /// @notice 거래 ID → 거래 정보
    mapping(uint256 => Transaction) public transactions;

    /// @notice 이벤트
    event EscrowCreated(
        uint256 indexed txId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        uint256 fee,
        uint256 expiresAt
    );
    event EscrowCompleted(
        uint256 indexed txId,
        uint256 sellerAmount,
        uint256 feeAmount
    );
    event EscrowCancelled(uint256 indexed txId);
    event DeliveryProofSubmitted(uint256 indexed txId, address indexed seller);
    event DisputeOpened(uint256 indexed txId, address indexed opener);
    event FeeRecipientUpdated(address indexed oldRecipient, address indexed newRecipient);
    event FeeRateUpdated(uint256 oldRate, uint256 newRate);
    event MinAmountUpdated(uint256 oldAmount, uint256 newAmount);

    /// @notice 커스텀 에러
    error ZeroAddress();
    error ZeroAmount();
    error BelowMinAmount();
    error InvalidTransaction();
    error NotBuyer();
    error NotSeller();
    error NotParticipant();
    error NotPending();
    error NotExpired();
    error AlreadyExpired();
    error AlreadyClaimed();
    error ClaimWindowNotPassed();
    error FeeRateTooHigh();
    error SameBuyerAndSeller();

    /**
     * @dev 컨트랙트 초기화
     * @param _token PNCR 토큰 주소
     * @param _feeRecipient 수수료 수령자 주소
     */
    constructor(address _token, address _feeRecipient) Ownable(msg.sender) {
        if (_token == address(0)) revert ZeroAddress();
        if (_feeRecipient == address(0)) revert ZeroAddress();
        
        token = IERC20(_token);
        feeRecipient = _feeRecipient;
    }

    // ============ Core Functions ============

    /**
     * @notice 에스크로 생성 (토큰 예치)
     * @param seller 판매자 주소
     * @param amount 거래 금액 (수수료 포함 전체 금액)
     * @return txId 생성된 거래 ID
     */
    function createEscrow(address seller, uint256 amount) 
        external 
        nonReentrant 
        whenNotPaused
        returns (uint256 txId) 
    {
        if (seller == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        if (amount < minAmount) revert BelowMinAmount();
        if (seller == msg.sender) revert SameBuyerAndSeller();

        // 수수료 계산
        uint256 fee = (amount * feeRate) / 10000;
        
        // 거래 ID 증가
        txId = ++transactionCount;

        // 거래 정보 저장
        transactions[txId] = Transaction({
            id: txId,
            buyer: msg.sender,
            seller: seller,
            amount: amount,
            fee: fee,
            status: Status.PENDING,
            createdAt: block.timestamp,
            expiresAt: block.timestamp + DEFAULT_ESCROW_DURATION,
            sellerClaimed: false,
            sellerClaimTime: 0
        });

        // 토큰 전송 (buyer → escrow)
        token.safeTransferFrom(msg.sender, address(this), amount);

        emit EscrowCreated(txId, msg.sender, seller, amount, fee, block.timestamp + DEFAULT_ESCROW_DURATION);
    }

    /**
     * @notice 거래 완료 확인 (구매자가 호출)
     * @param txId 거래 ID
     */
    function confirmDelivery(uint256 txId) external nonReentrant whenNotPaused {
        Transaction storage txn = transactions[txId];
        
        if (txn.id == 0) revert InvalidTransaction();
        if (msg.sender != txn.buyer) revert NotBuyer();
        if (txn.status != Status.PENDING) revert NotPending();
        
        _completeEscrow(txId);
    }

    /**
     * @notice 판매자 작업 완료 증거 제출
     * @dev 24시간 내 구매자 응답 없으면 autoComplete 가능
     * @param txId 거래 ID
     */
    function submitDeliveryProof(uint256 txId) external nonReentrant whenNotPaused {
        Transaction storage txn = transactions[txId];
        
        if (txn.id == 0) revert InvalidTransaction();
        if (msg.sender != txn.seller) revert NotSeller();
        if (txn.status != Status.PENDING) revert NotPending();
        if (txn.sellerClaimed) revert AlreadyClaimed();

        txn.sellerClaimed = true;
        txn.sellerClaimTime = block.timestamp;

        emit DeliveryProofSubmitted(txId, msg.sender);
    }

    /**
     * @notice 자동 완료 (판매자 증거 제출 후 24시간 경과)
     * @dev 구매자가 24시간 내 응답/분쟁 제기 안 하면 자동 완료
     * @param txId 거래 ID
     */
    function autoComplete(uint256 txId) external nonReentrant whenNotPaused {
        Transaction storage txn = transactions[txId];
        
        if (txn.id == 0) revert InvalidTransaction();
        if (txn.status != Status.PENDING) revert NotPending();
        if (!txn.sellerClaimed) revert InvalidTransaction();
        if (block.timestamp < txn.sellerClaimTime + SELLER_CLAIM_WINDOW) revert ClaimWindowNotPassed();

        _completeEscrow(txId);
    }

    /**
     * @notice 에스크로 취소 (만료 후 환불)
     * @param txId 거래 ID
     */
    function cancelEscrow(uint256 txId) external nonReentrant whenNotPaused {
        Transaction storage txn = transactions[txId];
        
        if (txn.id == 0) revert InvalidTransaction();
        if (msg.sender != txn.buyer) revert NotBuyer();
        if (txn.status != Status.PENDING) revert NotPending();
        if (block.timestamp < txn.expiresAt) revert NotExpired();
        // 판매자가 증거 제출했으면 취소 불가
        if (txn.sellerClaimed) revert AlreadyClaimed();

        // 상태 업데이트
        txn.status = Status.CANCELLED;

        // 구매자에게 환불
        token.safeTransfer(txn.buyer, txn.amount);

        emit EscrowCancelled(txId);
    }

    /**
     * @notice 분쟁 제기 (판매자 증거 제출 후 구매자가 이의 제기)
     * @dev Phase 2에서 분쟁 해결 로직 추가 예정
     * @param txId 거래 ID
     */
    function openDispute(uint256 txId) external nonReentrant whenNotPaused {
        Transaction storage txn = transactions[txId];
        
        if (txn.id == 0) revert InvalidTransaction();
        if (msg.sender != txn.buyer && msg.sender != txn.seller) revert NotParticipant();
        if (txn.status != Status.PENDING) revert NotPending();

        txn.status = Status.DISPUTED;

        emit DisputeOpened(txId, msg.sender);
        
        // TODO: Phase 2 - 분쟁 해결 컨트랙트로 이관
    }

    // ============ Internal Functions ============

    function _completeEscrow(uint256 txId) internal {
        Transaction storage txn = transactions[txId];
        
        // 상태 업데이트
        txn.status = Status.COMPLETED;

        // 판매자에게 전송할 금액 (수수료 차감)
        uint256 sellerAmount = txn.amount - txn.fee;

        // 판매자에게 토큰 전송
        token.safeTransfer(txn.seller, sellerAmount);

        // 수수료 전송
        if (txn.fee > 0) {
            token.safeTransfer(feeRecipient, txn.fee);
        }

        emit EscrowCompleted(txId, sellerAmount, txn.fee);
    }

    // ============ View Functions ============

    /**
     * @notice 거래 정보 조회
     */
    function getTransaction(uint256 txId) external view returns (Transaction memory) {
        return transactions[txId];
    }

    /**
     * @notice 자동완료 가능 여부 확인
     */
    function canAutoComplete(uint256 txId) external view returns (bool) {
        Transaction storage txn = transactions[txId];
        if (txn.status != Status.PENDING) return false;
        if (!txn.sellerClaimed) return false;
        if (block.timestamp < txn.sellerClaimTime + SELLER_CLAIM_WINDOW) return false;
        return true;
    }

    /**
     * @notice 취소 가능 여부 확인
     */
    function canCancel(uint256 txId) external view returns (bool) {
        Transaction storage txn = transactions[txId];
        if (txn.status != Status.PENDING) return false;
        if (txn.sellerClaimed) return false;
        if (block.timestamp < txn.expiresAt) return false;
        return true;
    }

    /**
     * @notice 에스크로에 락업된 총 토큰 조회
     */
    function getEscrowBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }

    // ============ Admin Functions ============

    /**
     * @notice 수수료 수령자 변경 (owner만)
     */
    function setFeeRecipient(address newRecipient) external onlyOwner {
        if (newRecipient == address(0)) revert ZeroAddress();
        
        address oldRecipient = feeRecipient;
        feeRecipient = newRecipient;
        
        emit FeeRecipientUpdated(oldRecipient, newRecipient);
    }

    /**
     * @notice 수수료율 변경 (owner만)
     */
    function setFeeRate(uint256 newRate) external onlyOwner {
        if (newRate > MAX_FEE_RATE) revert FeeRateTooHigh();
        
        uint256 oldRate = feeRate;
        feeRate = newRate;
        
        emit FeeRateUpdated(oldRate, newRate);
    }

    /**
     * @notice 최소 거래 금액 변경 (owner만)
     */
    function setMinAmount(uint256 newAmount) external onlyOwner {
        uint256 oldAmount = minAmount;
        minAmount = newAmount;
        
        emit MinAmountUpdated(oldAmount, newAmount);
    }

    /**
     * @notice 긴급 정지 (owner만)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice 정지 해제 (owner만)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice 긴급 출금 (owner만, 분쟁 중인 거래 처리용)
     * @dev 극단적인 상황에서만 사용
     */
    function emergencyWithdraw(uint256 txId, address recipient) external onlyOwner {
        Transaction storage txn = transactions[txId];
        require(txn.status == Status.DISPUTED, "Not disputed");
        
        txn.status = Status.CANCELLED;
        token.safeTransfer(recipient, txn.amount);
    }
}
