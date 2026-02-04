/**
 * Pincer Protocol - Agent-to-Agent Trade Demo
 * 
 * 시나리오: Forge가 Scout에게 코드 리뷰 태스크 의뢰
 * 금액: 1000 PNCR
 * 
 * Flow:
 * 1. Forge(구매자)가 에스크로 생성 + PNCR 예치
 * 2. Scout(판매자)가 태스크 완료
 * 3. Forge가 확인 후 릴리즈
 * 4. Scout이 PNCR 수령
 */

require('dotenv').config();
const { ethers } = require('ethers');

// Base Mainnet
const RPC_URL = 'https://mainnet.base.org';
const CHAIN_ID = 8453;

// Contract Addresses (Base Mainnet)
const CONTRACTS = {
  PNCRToken: '0x09De9dE982E488Cd92774Ecc1b98e8EDF8dAF57c',
  SimpleEscrow: '0x85e223717E9297AA1c57f57B1e28aa2a6A9f6FC7',
  PNCRStaking: '0x4e748d2E381fa4A3043F8cfD55B5c31ce13D9E79',
  ReputationSystem: '0xeF825139C3B17265E867864627f85720Ab6dB9e0'
};

// ABIs (minimal)
const TOKEN_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)'
];

const ESCROW_ABI = [
  'function createEscrow(address _seller, uint256 _amount, string memory _description) returns (uint256)',
  'function releaseEscrow(uint256 _escrowId)',
  'function getEscrow(uint256 _escrowId) view returns (address buyer, address seller, uint256 amount, uint8 status, string memory description, uint256 createdAt)',
  'function escrowCount() view returns (uint256)',
  'event EscrowCreated(uint256 indexed escrowId, address indexed buyer, address indexed seller, uint256 amount)',
  'event EscrowReleased(uint256 indexed escrowId)'
];

// Demo Configuration
const DEMO_AMOUNT = ethers.parseEther('1000'); // 1000 PNCR
const TASK_DESCRIPTION = 'Code review for PNCRStaking.sol - requested by Forge, completed by Scout';

class AgentWallet {
  constructor(name, privateKey, provider) {
    this.name = name;
    this.wallet = new ethers.Wallet(privateKey, provider);
    this.address = this.wallet.address;
  }

  async getBalance(tokenContract) {
    const balance = await tokenContract.balanceOf(this.address);
    return ethers.formatEther(balance);
  }

  log(message) {
    const emoji = {
      'Forge': '⚒️',
      'Scout': '🔍',
      'System': '🦞'
    }[this.name] || '🤖';
    console.log(`${emoji} [${this.name}] ${message}`);
  }
}

async function runDemo() {
  console.log('\n' + '='.repeat(60));
  console.log('🦞 PINCER PROTOCOL - Agent Trade Demo');
  console.log('='.repeat(60) + '\n');

  // Setup provider
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  
  // Check if we have private keys for demo
  // For demo purposes, we'll use environment variables
  const FORGE_KEY = process.env.FORGE_PRIVATE_KEY || process.env.PRIVATE_KEY;
  const SCOUT_KEY = process.env.SCOUT_PRIVATE_KEY || process.env.DEMO_PRIVATE_KEY_2;

  if (!FORGE_KEY) {
    console.log('❌ Error: FORGE_PRIVATE_KEY or PRIVATE_KEY required in .env');
    console.log('\nDemo mode: Showing expected flow...\n');
    showExpectedFlow();
    return;
  }

  // Initialize agents
  const forge = new AgentWallet('Forge', FORGE_KEY, provider);
  
  // If no second key, use same wallet for demo (simulate two agents)
  const scout = SCOUT_KEY 
    ? new AgentWallet('Scout', SCOUT_KEY, provider)
    : { 
        name: 'Scout', 
        address: '0x0000000000000000000000000000000000000001', // Placeholder
        log: (msg) => console.log(`🔍 [Scout] ${msg}`)
      };

  // Initialize contracts
  const token = new ethers.Contract(CONTRACTS.PNCRToken, TOKEN_ABI, forge.wallet);
  const escrow = new ethers.Contract(CONTRACTS.SimpleEscrow, ESCROW_ABI, forge.wallet);

  console.log('📋 Demo Setup:');
  console.log(`   Forge (Buyer):  ${forge.address}`);
  console.log(`   Scout (Seller): ${scout.address}`);
  console.log(`   Amount: 1,000 PNCR`);
  console.log(`   Task: Code review\n`);

  // Step 1: Check balances
  console.log('─'.repeat(60));
  console.log('Step 1: Check Initial Balances\n');
  
  const forgeBalance = await forge.getBalance(token);
  forge.log(`PNCR Balance: ${Number(forgeBalance).toLocaleString()} PNCR`);

  // Step 2: Approve escrow contract
  console.log('\n' + '─'.repeat(60));
  console.log('Step 2: Forge approves Escrow Contract\n');

  const allowance = await token.allowance(forge.address, CONTRACTS.SimpleEscrow);
  if (allowance < DEMO_AMOUNT) {
    forge.log('Approving PNCR for escrow...');
    const approveTx = await token.approve(CONTRACTS.SimpleEscrow, DEMO_AMOUNT);
    await approveTx.wait();
    forge.log(`✅ Approved! TX: ${approveTx.hash}`);
  } else {
    forge.log('✅ Already approved');
  }

  // Step 3: Create escrow
  console.log('\n' + '─'.repeat(60));
  console.log('Step 3: Forge creates Escrow\n');

  forge.log(`Creating escrow for ${ethers.formatEther(DEMO_AMOUNT)} PNCR...`);
  forge.log(`Task: "${TASK_DESCRIPTION}"`);

  try {
    const createTx = await escrow.createEscrow(
      scout.address,
      DEMO_AMOUNT,
      TASK_DESCRIPTION
    );
    const receipt = await createTx.wait();
    
    // Get escrow ID from event
    const event = receipt.logs.find(log => {
      try {
        return escrow.interface.parseLog(log)?.name === 'EscrowCreated';
      } catch { return false; }
    });
    
    const escrowId = event ? escrow.interface.parseLog(event).args.escrowId : 'N/A';
    
    forge.log(`✅ Escrow created! ID: ${escrowId}`);
    forge.log(`   TX: ${createTx.hash}`);
    forge.log(`   Basescan: https://basescan.org/tx/${createTx.hash}`);

    // Step 4: Scout completes task
    console.log('\n' + '─'.repeat(60));
    console.log('Step 4: Scout completes the task\n');
    
    scout.log('Reviewing PNCRStaking.sol...');
    await sleep(2000);
    scout.log('✅ Code review completed!');
    scout.log('   - No critical issues found');
    scout.log('   - 2 minor suggestions submitted');

    // Step 5: Forge releases escrow
    console.log('\n' + '─'.repeat(60));
    console.log('Step 5: Forge releases Escrow\n');

    forge.log('Verifying Scout\'s work...');
    await sleep(1000);
    forge.log('✅ Work verified. Releasing funds...');

    const releaseTx = await escrow.releaseEscrow(escrowId);
    await releaseTx.wait();

    forge.log(`✅ Escrow released!`);
    forge.log(`   TX: ${releaseTx.hash}`);
    forge.log(`   Basescan: https://basescan.org/tx/${releaseTx.hash}`);

    // Step 6: Final balances
    console.log('\n' + '─'.repeat(60));
    console.log('Step 6: Final Balances\n');

    const forgeBalanceAfter = await forge.getBalance(token);
    forge.log(`PNCR Balance: ${Number(forgeBalanceAfter).toLocaleString()} PNCR`);

    if (scout.wallet) {
      const scoutBalance = await scout.getBalance(token);
      scout.log(`PNCR Balance: ${Number(scoutBalance).toLocaleString()} PNCR`);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 DEMO COMPLETE!\n');
    console.log('Transaction Summary:');
    console.log(`   Task: Code review`);
    console.log(`   Amount: 1,000 PNCR`);
    console.log(`   Buyer: Forge ⚒️`);
    console.log(`   Seller: Scout 🔍`);
    console.log(`   Status: ✅ Completed`);
    console.log('\n' + '='.repeat(60));
    console.log('🦞 Pincer Protocol - Agent Economy. Unleashed.');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.log(`\n❌ Error: ${error.message}`);
    
    if (error.message.includes('insufficient funds')) {
      console.log('\n💡 Need ETH for gas. Send some ETH to:', forge.address);
    }
    
    if (error.message.includes('transfer amount exceeds balance')) {
      console.log('\n💡 Need PNCR tokens. Current balance might be 0.');
    }
  }
}

function showExpectedFlow() {
  console.log('Expected Demo Flow:');
  console.log('─'.repeat(40));
  console.log('1. ⚒️ Forge checks PNCR balance');
  console.log('2. ⚒️ Forge approves Escrow contract');
  console.log('3. ⚒️ Forge creates escrow (1000 PNCR)');
  console.log('4. 🔍 Scout completes the task');
  console.log('5. ⚒️ Forge verifies and releases escrow');
  console.log('6. 🔍 Scout receives 1000 PNCR');
  console.log('─'.repeat(40));
  console.log('\nTo run real demo, add PRIVATE_KEY to .env');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run
runDemo().catch(console.error);
