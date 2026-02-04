// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PNCRToken
 * @dev Pincer Protocol의 기본 토큰
 * @author Pincer Protocol 🦞
 * 
 * - 총 발행량: 175B PNCR (GPT-3 파라미터 수와 동일, 추가 발행 불가)
 * - 분배: Community 52%, Treasury 20%, Team 14%, Investors 14%
 * 
 * "GPT-3의 175B 파라미터가 AI 시대를 열었다면,
 *  Pincer의 175B 토큰이 AI 경제를 연다"
 */
contract PNCRToken is ERC20, ERC20Burnable, Ownable {
    /// @notice 최대 발행량 (175B PNCR)
    uint256 public constant MAX_SUPPLY = 175_000_000_000 * 10**18;

    /// @notice 분배 비율 (basis points, 10000 = 100%)
    uint256 public constant COMMUNITY_SHARE = 5200;   // 52% (91B) - Quests, Airdrops, Liquidity, Staking
    uint256 public constant TREASURY_SHARE = 2000;    // 20% (35B) - DAO/Multisig managed
    uint256 public constant TEAM_SHARE = 1400;        // 14% (24.5B) - 1mo cliff, 2yr vesting
    uint256 public constant INVESTOR_SHARE = 1400;    // 14% (24.5B) - Negotiable

    /// @notice 분배 지갑 주소 (추적용)
    address public immutable communityWallet;
    address public immutable treasuryWallet;
    address public immutable teamWallet;
    address public immutable investorWallet;

    /**
     * @dev 컨트랙트 배포 시 토큰 발행 및 분배
     * @param _communityWallet 커뮤니티 지갑 (52%) - Quests, Airdrops, LP incentives
     * @param _treasuryWallet 재무 지갑 (20%) - DAO/Multisig managed
     * @param _teamWallet 팀 지갑 (14%) - 1 month cliff, 2 year vesting
     * @param _investorWallet 투자자 지갑 (14%) - Terms negotiable
     */
    constructor(
        address _communityWallet,
        address _treasuryWallet,
        address _teamWallet,
        address _investorWallet
    ) ERC20("Pincer", "PNCR") Ownable(msg.sender) {
        require(_communityWallet != address(0), "Community wallet is zero address");
        require(_treasuryWallet != address(0), "Treasury wallet is zero address");
        require(_teamWallet != address(0), "Team wallet is zero address");
        require(_investorWallet != address(0), "Investor wallet is zero address");

        communityWallet = _communityWallet;
        treasuryWallet = _treasuryWallet;
        teamWallet = _teamWallet;
        investorWallet = _investorWallet;

        // 초기 분배 - constructor에서만 mint 가능
        _mint(_communityWallet, MAX_SUPPLY * COMMUNITY_SHARE / 10000);  // 91B PNCR (52%)
        _mint(_treasuryWallet, MAX_SUPPLY * TREASURY_SHARE / 10000);    // 35B PNCR (20%)
        _mint(_teamWallet, MAX_SUPPLY * TEAM_SHARE / 10000);            // 24.5B PNCR (14%)
        _mint(_investorWallet, MAX_SUPPLY * INVESTOR_SHARE / 10000);    // 24.5B PNCR (14%)
    }

    /**
     * @dev 토큰 소각 (ERC20Burnable에서 상속)
     * 누구나 자신의 토큰을 소각할 수 있음
     * @param amount 소각할 토큰 양
     */
    function burn(uint256 amount) public override {
        super.burn(amount);
    }

    /**
     * @dev 승인된 토큰 소각 (ERC20Burnable에서 상속)
     * @param account 토큰 소유자 주소
     * @param amount 소각할 토큰 양
     */
    function burnFrom(address account, uint256 amount) public override {
        super.burnFrom(account, amount);
    }
}
