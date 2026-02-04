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
 * - 총 발행량: 1750억 PNCR (GPT-3 파라미터 수와 동일, 추가 발행 불가)
 * - 초기 분배: Team 15%, Ecosystem 25%, Liquidity 20%, Community 40%
 * 
 * "GPT-3의 175B 파라미터가 AI 시대를 열었다면,
 *  Pincer의 175B 토큰이 AI 경제를 연다"
 */
contract PNCRToken is ERC20, ERC20Burnable, Ownable {
    /// @notice 최대 발행량 (1750억 PNCR - GPT-3 파라미터 수와 동일)
    uint256 public constant MAX_SUPPLY = 175_000_000_000 * 10**18;

    /// @notice 분배 비율 (basis points, 10000 = 100%)
    uint256 public constant TEAM_SHARE = 1500;        // 15%
    uint256 public constant ECOSYSTEM_SHARE = 2500;   // 25%
    uint256 public constant LIQUIDITY_SHARE = 2000;   // 20%
    uint256 public constant COMMUNITY_SHARE = 4000;   // 40%

    /// @notice 분배 지갑 주소 (추적용)
    address public immutable teamWallet;
    address public immutable ecosystemWallet;
    address public immutable liquidityWallet;
    address public immutable communityWallet;

    /**
     * @dev 컨트랙트 배포 시 토큰 발행 및 분배
     * @param _teamWallet 팀 지갑 (15%)
     * @param _ecosystemWallet 생태계 펀드 지갑 (25%)
     * @param _liquidityWallet 유동성 지갑 (20%)
     * @param _communityWallet 커뮤니티/에어드랍 지갑 (40%)
     */
    constructor(
        address _teamWallet,
        address _ecosystemWallet,
        address _liquidityWallet,
        address _communityWallet
    ) ERC20("Pincer", "PNCR") Ownable(msg.sender) {
        require(_teamWallet != address(0), "Team wallet is zero address");
        require(_ecosystemWallet != address(0), "Ecosystem wallet is zero address");
        require(_liquidityWallet != address(0), "Liquidity wallet is zero address");
        require(_communityWallet != address(0), "Community wallet is zero address");

        teamWallet = _teamWallet;
        ecosystemWallet = _ecosystemWallet;
        liquidityWallet = _liquidityWallet;
        communityWallet = _communityWallet;

        // 초기 분배 - constructor에서만 mint 가능
        _mint(_teamWallet, MAX_SUPPLY * TEAM_SHARE / 10000);           // 262.5억 PNCR (15%)
        _mint(_ecosystemWallet, MAX_SUPPLY * ECOSYSTEM_SHARE / 10000); // 437.5억 PNCR (25%)
        _mint(_liquidityWallet, MAX_SUPPLY * LIQUIDITY_SHARE / 10000); // 350억 PNCR (20%)
        _mint(_communityWallet, MAX_SUPPLY * COMMUNITY_SHARE / 10000); // 700억 PNCR (40%)
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
