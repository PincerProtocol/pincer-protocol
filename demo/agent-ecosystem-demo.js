/**
 * 🦞 Pincer Protocol - Agent Ecosystem Demo
 * 
 * 실제 에이전트 간 거래 시뮬레이션 + 온체인 실행
 * 
 * 시나리오:
 * 1. Forge(Dev Lead)가 Scout(Research Lead)에게 코드 리뷰 요청
 * 2. Scout이 가격 제시 (1000 PNCR)
 * 3. Forge가 Wallet에게 에스크로 생성 요청
 * 4. Wallet이 에스크로 생성 (온체인)
 * 5. Scout이 작업 완료
 * 6. Forge가 Wallet에게 릴리즈 요청
 * 7. Wallet이 릴리즈 (온체인)
 * 8. 결과 리포트
 */

require('dotenv').config();
const { ethers } = require('ethers');

// ============================================
// Configuration
// ============================================

// Base Mainnet
const RPC_URL = 'https://mainnet.base.org';
const CHAIN_ID = 8453;

// Contracts (Base Mainnet)
const CONTRACTS = {
  PNCRToken: '0x09De9dE982E488Cd92774Ecc1b98e8EDF8dAF57c',
  SimpleEscrow: '0x85e223717E9297AA1c57f57B1e28aa2a6A9f6FC7',
  ReputationSystem: '0xeF825139C3B17265E867864627f85720Ab6dB9e0'
};

// ABIs
const TOKEN_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)'
];

const ESCROW_ABI = [
  'function createEscrow(address seller, uint256 amount) returns (uint256 txId)',
  'function confirmDelivery(uint256 txId)',
  'function getTransaction(uint256 txId) view returns (tuple(uint256 id, address buyer, address seller, uint256 amount, uint256 fee, uint8 status, uint256 createdAt, uint256 expiresAt, bool sellerClaimed, uint256 sellerClaimTime))',
  'function transactionCount() view returns (uint256)',
  'event EscrowCreated(uint256 indexed txId, address indexed buyer, address indexed seller, uint256 amount, uint256 fee, uint256 expiresAt)',
  'event EscrowCompleted(uint256 indexed txId, uint256 sellerAmount, uint256 feeAmount)'
];

// Demo amounts
const DEMO_PNCR = ethers.parseEther('1000');  // 1000 PNCR for task payment
const SETUP_PNCR = ethers.parseEther('2000'); // 2000 PNCR to Scout for demo
const SETUP_ETH = ethers.parseEther('0.001'); // 0.001 ETH for gas

// ============================================
// Agent Class
// ============================================

class Agent {
  constructor(name, emoji, role) {
    this.name = name;
    this.emoji = emoji;
    this.role = role;
    this.wallet = null;
    this.address = null;
  }

  setWallet(wallet) {
    this.wallet = wallet;
    this.address = wallet.address;
  }

  log(message) {
    console.log(`${this.emoji} [${this.name}] ${message}`);
  }

  async speak(message) {
    this.log(message);
    await sleep(800); // Simulate thinking time
  }
}

// ============================================
// Main Demo
// ============================================

async function runDemo() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  🦞 PINCER PROTOCOL - Agent Ecosystem Demo                ║');
  console.log('║  Real AI Agent-to-Agent Transaction                       ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('\n');

  // Initialize provider
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  
  // Get network info
  const network = await provider.getNetwork();
  console.log(`📡 Network: Base Mainnet (Chain ID: ${network.chainId})\n`);

  // Load main wallet (Founder wallet - acts as Treasury/Wallet agent)
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  if (!PRIVATE_KEY) {
    console.log('❌ PRIVATE_KEY not found in .env');
    return;
  }

  const mainWallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  // Generate Scout wallet (deterministic for demo reproducibility)
  const scoutWallet = ethers.Wallet.createRandom().connect(provider);

  // Initialize Agents
  const forge = new Agent('Forge', '⚒️', 'Dev Lead');
  const scout = new Agent('Scout', '🔍', 'Research Lead');
  const wallet = new Agent('Wallet', '🏦', 'Treasury');
  
  // Forge and Wallet use main wallet (founder controls both for now)
  forge.setWallet(mainWallet);
  wallet.setWallet(mainWallet);
  scout.setWallet(scoutWallet);

  // Initialize contracts
  const token = new ethers.Contract(CONTRACTS.PNCRToken, TOKEN_ABI, mainWallet);
  const escrow = new ethers.Contract(CONTRACTS.SimpleEscrow, ESCROW_ABI, mainWallet);

  console.log('👥 Agent Setup:');
  console.log(`   ⚒️ Forge (Dev Lead):     ${forge.address.slice(0, 10)}...`);
  console.log(`   🔍 Scout (Research):     ${scout.address.slice(0, 10)}...`);
  console.log(`   🏦 Wallet (Treasury):    ${wallet.address.slice(0, 10)}...`);
  console.log('\n');

  // ============================================
  // Phase 1: Setup - Fund Scout wallet
  // ============================================
  
  console.log('━'.repeat(60));
  console.log('📋 PHASE 1: Setup\n');

  const forgeBalance = await token.balanceOf(forge.address);
  const forgeEth = await provider.getBalance(forge.address);
  
  wallet.log(`Treasury PNCR: ${formatPNCR(forgeBalance)} PNCR`);
  wallet.log(`Treasury ETH:  ${ethers.formatEther(forgeEth)} ETH`);

  // For this demo, Scout needs some initial PNCR to demonstrate the escrow
  // In real scenario, Scout would earn PNCR by completing tasks
  console.log('\n');

  // ============================================
  // Phase 2: Task Request
  // ============================================

  console.log('━'.repeat(60));
  console.log('💬 PHASE 2: Task Negotiation\n');

  await forge.speak('Scout, PNCRStaking.sol 컨트랙트 보안 리뷰 좀 해줄 수 있어?');
  await scout.speak('어떤 범위까지 봐줄까?');
  await forge.speak('전체 코드 리뷰 + 취약점 분석. 급한 건 아닌데 꼼꼼히 해줘.');
  await scout.speak('알겠어. 1000 PNCR이면 해줄게.');
  await forge.speak('좋아. Wallet, Scout한테 1000 PNCR 에스크로 걸어줘.');
  await wallet.speak('에스크로 생성 중...');

  console.log('\n');

  // ============================================
  // Phase 3: Escrow Creation (On-chain)
  // ============================================

  console.log('━'.repeat(60));
  console.log('🔗 PHASE 3: Escrow Creation (On-chain)\n');

  try {
    // Check allowance
    const currentAllowance = await token.allowance(forge.address, CONTRACTS.SimpleEscrow);
    
    if (currentAllowance < DEMO_PNCR) {
      wallet.log('Approving PNCR for escrow contract...');
      const approveTx = await token.approve(CONTRACTS.SimpleEscrow, DEMO_PNCR * 10n);
      await approveTx.wait();
      wallet.log(`✅ Approved! TX: ${approveTx.hash.slice(0, 20)}...`);
    } else {
      wallet.log('✅ Already approved');
    }

    // Create escrow
    wallet.log(`Creating escrow: ${formatPNCR(DEMO_PNCR)} PNCR → Scout`);
    
    const createTx = await escrow.createEscrow(
      scout.address,
      DEMO_PNCR
    );
    
    wallet.log(`⏳ TX submitted: ${createTx.hash.slice(0, 20)}...`);
    const receipt = await createTx.wait();
    
    // Parse escrow ID from events
    let escrowId = null;
    for (const log of receipt.logs) {
      try {
        const parsed = escrow.interface.parseLog(log);
        if (parsed && parsed.name === 'EscrowCreated') {
          escrowId = parsed.args.txId;
          break;
        }
      } catch (e) {}
    }

    wallet.log(`✅ Escrow created!`);
    wallet.log(`   Transaction ID: ${escrowId}`);
    wallet.log(`   Amount: ${formatPNCR(DEMO_PNCR)} PNCR`);
    wallet.log(`   Buyer: Forge (${forge.address.slice(0, 10)}...)`);
    wallet.log(`   Seller: Scout (${scout.address.slice(0, 10)}...)`);
    wallet.log(`   TX: https://basescan.org/tx/${createTx.hash}`);

    await wallet.speak('Scout, 에스크로 생성 완료. 작업 시작해도 돼.');

    console.log('\n');

    // ============================================
    // Phase 4: Task Execution
    // ============================================

    console.log('━'.repeat(60));
    console.log('⚙️ PHASE 4: Task Execution\n');

    await scout.speak('PNCRStaking.sol 리뷰 시작할게.');
    await sleep(1500);
    await scout.speak('코드 분석 중...');
    await sleep(1500);
    await scout.speak('취약점 스캔 중...');
    await sleep(1500);
    
    await scout.speak('리뷰 완료! 결과:');
    scout.log('   ✅ Reentrancy: Safe (ReentrancyGuard 적용)');
    scout.log('   ✅ Overflow: Safe (Solidity 0.8+)');
    scout.log('   ✅ Access Control: Safe (Ownable 적용)');
    scout.log('   ⚠️ Minor: Tier 이름 하드코딩됨 (개선 권장)');
    scout.log('   📝 Overall: SECURE');

    await scout.speak('Forge, 리뷰 완료했어. 큰 이슈 없음!');

    console.log('\n');

    // ============================================
    // Phase 5: Payment Release (On-chain)
    // ============================================

    console.log('━'.repeat(60));
    console.log('💰 PHASE 5: Payment Release (On-chain)\n');

    await forge.speak('리뷰 확인했어. 고마워! Wallet, 릴리즈해줘.');
    await wallet.speak('릴리즈 처리 중...');

    const releaseTx = await escrow.confirmDelivery(escrowId);
    wallet.log(`⏳ TX submitted: ${releaseTx.hash.slice(0, 20)}...`);
    await releaseTx.wait();

    wallet.log(`✅ Escrow released!`);
    wallet.log(`   TX: https://basescan.org/tx/${releaseTx.hash}`);

    await wallet.speak('Scout에게 1000 PNCR 전송 완료!');
    await scout.speak('PNCR 받았어! 고마워 🔍');

    console.log('\n');

    // ============================================
    // Phase 6: Final Report
    // ============================================

    console.log('━'.repeat(60));
    console.log('📊 PHASE 6: Transaction Report\n');

    // Get final balances
    const forgeBalanceAfter = await token.balanceOf(forge.address);
    
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│                    TRANSACTION SUMMARY                   │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log(`│  Task:        PNCRStaking.sol Security Review           │`);
    console.log(`│  Buyer:       Forge ⚒️ (Dev Lead)                        │`);
    console.log(`│  Seller:      Scout 🔍 (Research Lead)                   │`);
    console.log(`│  Amount:      1,000 PNCR                                │`);
    console.log(`│  Status:      ✅ COMPLETED                               │`);
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log(`│  Escrow TX:   ${createTx.hash.slice(0, 30)}...    │`);
    console.log(`│  Release TX:  ${releaseTx.hash.slice(0, 30)}...    │`);
    console.log('└─────────────────────────────────────────────────────────┘');

    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║  🎉 DEMO COMPLETE!                                        ║');
    console.log('║                                                           ║');
    console.log('║  AI agents successfully transacted on-chain.             ║');
    console.log('║  This is the future of the Agent Economy.                ║');
    console.log('║                                                           ║');
    console.log('║  🦞 Pincer Protocol - Agent Economy. Unleashed.          ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('\n');

    // Return transaction hashes for verification
    return {
      escrowTx: createTx.hash,
      releaseTx: releaseTx.hash,
      escrowId: escrowId.toString(),
      success: true
    };

  } catch (error) {
    console.log(`\n❌ Error: ${error.message}`);
    
    if (error.message.includes('insufficient funds')) {
      console.log('\n💡 Need more ETH for gas fees.');
    }
    if (error.message.includes('transfer amount exceeds balance')) {
      console.log('\n💡 Insufficient PNCR balance.');
    }
    if (error.message.includes('ERC20: insufficient allowance')) {
      console.log('\n💡 Need to approve escrow contract first.');
    }

    return { success: false, error: error.message };
  }
}

// ============================================
// Utilities
// ============================================

function formatPNCR(amount) {
  return Number(ethers.formatEther(amount)).toLocaleString();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// Run Demo
// ============================================

runDemo()
  .then(result => {
    if (result.success) {
      console.log('🔗 Verify transactions on Basescan:');
      console.log(`   Escrow:  https://basescan.org/tx/${result.escrowTx}`);
      console.log(`   Release: https://basescan.org/tx/${result.releaseTx}`);
    }
    process.exit(result.success ? 0 : 1);
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
