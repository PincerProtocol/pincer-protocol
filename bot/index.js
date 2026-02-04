/**
 * Pincer Protocol Telegram Bot 🦞
 * 
 * Commands:
 * /start - Welcome message
 * /help - Command list
 * /balance <address> - Check PNCR balance
 * /escrow <id> - Check escrow status
 * /reputation <address> - Check reputation score
 * /stake <address> - Check staking info
 * /stats - Protocol statistics
 */

require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const { ethers } = require('ethers');

// Initialize bot
const bot = new Telegraf(process.env.BOT_TOKEN);

// Initialize provider
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'https://sepolia.base.org');

// Contract ABIs (minimal for read operations)
const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)'
];

const ESCROW_ABI = [
  'function escrows(uint256) view returns (address buyer, address seller, uint256 amount, uint8 status, string description, uint256 createdAt, uint256 completedAt)',
  'function nextEscrowId() view returns (uint256)',
  'function feeRate() view returns (uint256)',
  'function totalFees() view returns (uint256)'
];

const STAKING_ABI = [
  'function stakes(address) view returns (uint256 amount, uint256 since, uint8 tier)',
  'function totalStaked() view returns (uint256)',
  'function tiers(uint8) view returns (uint256 minAmount, uint256 apy, uint256 lockDuration, string name)'
];

const REPUTATION_ABI = [
  'function getReputation(address) view returns (uint256)',
  'function getReputationWithStats(address) view returns (uint256 score, uint256 successfulTx, uint256 totalTx, uint256 disputesWon, uint256 disputesLost)'
];

// Contract addresses
const CONTRACTS = {
  token: process.env.PNCR_TOKEN || '0xD5a1f8Ff967b1BE0957581B4cabdD5935Aea2939',
  escrow: process.env.ESCROW_CONTRACT || '0xE33FCd5AB5E739a0E051E543607374c6B58bCe35',
  staking: process.env.STAKING_CONTRACT || '0x8e28b009Bf4b517cA91089D179df1f6cE1ED8F6D',
  reputation: process.env.REPUTATION_CONTRACT || '0x56771E7556d9A772D1De5F78861B2Da2A252adf8'
};

// Contract instances
const tokenContract = new ethers.Contract(CONTRACTS.token, ERC20_ABI, provider);
const escrowContract = new ethers.Contract(CONTRACTS.escrow, ESCROW_ABI, provider);
const stakingContract = new ethers.Contract(CONTRACTS.staking, STAKING_ABI, provider);
const reputationContract = new ethers.Contract(CONTRACTS.reputation, REPUTATION_ABI, provider);

// Helper: Format PNCR amount
const formatPNCR = (amount) => {
  const formatted = ethers.formatUnits(amount, 18);
  const num = parseFloat(formatted);
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toFixed(2);
};

// Helper: Validate address
const isValidAddress = (address) => {
  try {
    ethers.getAddress(address);
    return true;
  } catch {
    return false;
  }
};

// Escrow status mapping
const ESCROW_STATUS = ['Created', 'Funded', 'Completed', 'Refunded', 'Disputed'];

// Staking tier names
const TIER_NAMES = ['None', 'Bronze', 'Silver', 'Gold', 'Platinum'];

// ============ COMMANDS ============

// /start - Welcome message
bot.start((ctx) => {
  const welcomeMsg = `
🦞 *Pincer Protocol Bot*

AI 에이전트 경제의 결제 인프라에 오신 걸 환영해!

*"GPT-3의 175B 파라미터가 AI 시대를 열었다면,*
*Pincer의 175B 토큰이 AI 경제를 연다"*

/help 로 명령어 확인해봐.
  `;
  
  ctx.replyWithMarkdown(welcomeMsg, Markup.inlineKeyboard([
    [Markup.button.url('🌐 Website', 'https://pincerprotocol.xyz')],
    [Markup.button.url('📄 Docs', 'https://github.com/pincerprotocol/pincer-protocol')],
    [Markup.button.callback('📊 Stats', 'stats')]
  ]));
});

// /help - Command list
bot.help((ctx) => {
  const helpMsg = `
🦞 *Pincer Bot Commands*

📊 *조회*
/balance <주소> - PNCR 잔액
/escrow <ID> - 에스크로 상태
/reputation <주소> - 평판 점수
/stake <주소> - 스테이킹 정보
/stats - 프로토콜 통계

💡 *예시*
\`/balance 0x632D78685EBA2dDC17BE91C64Ce1d29Fbd605E89\`
\`/escrow 1\`

🔗 *링크*
Website: pincerprotocol.xyz
Chain: Base Sepolia (testnet)
  `;
  
  ctx.replyWithMarkdown(helpMsg);
});

// /balance - Check PNCR balance
bot.command('balance', async (ctx) => {
  const args = ctx.message.text.split(' ');
  if (args.length < 2) {
    return ctx.reply('사용법: /balance <지갑주소>\n예: /balance 0x632D78685EBA2dDC17BE91C64Ce1d29Fbd605E89');
  }
  
  const address = args[1];
  if (!isValidAddress(address)) {
    return ctx.reply('❌ 유효하지 않은 지갑 주소야.');
  }
  
  try {
    const balance = await tokenContract.balanceOf(address);
    const formattedBalance = formatPNCR(balance);
    const exactBalance = ethers.formatUnits(balance, 18);
    
    ctx.replyWithMarkdown(`
🦞 *PNCR Balance*

📍 주소: \`${address.slice(0, 6)}...${address.slice(-4)}\`
💰 잔액: *${formattedBalance} PNCR*
📊 정확한 값: ${parseFloat(exactBalance).toLocaleString()} PNCR

🔗 [BaseScan에서 보기](https://sepolia.basescan.org/address/${address})
    `);
  } catch (error) {
    console.error('Balance error:', error);
    ctx.reply('❌ 잔액 조회 실패. 나중에 다시 시도해봐.');
  }
});

// /escrow - Check escrow status
bot.command('escrow', async (ctx) => {
  const args = ctx.message.text.split(' ');
  if (args.length < 2) {
    return ctx.reply('사용법: /escrow <ID>\n예: /escrow 1');
  }
  
  const escrowId = parseInt(args[1]);
  if (isNaN(escrowId) || escrowId < 1) {
    return ctx.reply('❌ 유효하지 않은 에스크로 ID야.');
  }
  
  try {
    const escrow = await escrowContract.escrows(escrowId);
    
    // Check if escrow exists (buyer is zero address means not exists)
    if (escrow.buyer === ethers.ZeroAddress) {
      return ctx.reply(`❌ 에스크로 #${escrowId} 존재하지 않아.`);
    }
    
    const statusEmoji = ['📝', '💰', '✅', '↩️', '⚠️'][escrow.status];
    const createdDate = new Date(Number(escrow.createdAt) * 1000).toLocaleString('ko-KR');
    
    ctx.replyWithMarkdown(`
🦞 *Escrow #${escrowId}*

${statusEmoji} 상태: *${ESCROW_STATUS[escrow.status]}*
💰 금액: *${formatPNCR(escrow.amount)} PNCR*

👤 구매자: \`${escrow.buyer.slice(0, 6)}...${escrow.buyer.slice(-4)}\`
🏪 판매자: \`${escrow.seller.slice(0, 6)}...${escrow.seller.slice(-4)}\`

📝 설명: ${escrow.description || 'N/A'}
📅 생성일: ${createdDate}
    `);
  } catch (error) {
    console.error('Escrow error:', error);
    ctx.reply('❌ 에스크로 조회 실패. 나중에 다시 시도해봐.');
  }
});

// /reputation - Check reputation score
bot.command('reputation', async (ctx) => {
  const args = ctx.message.text.split(' ');
  if (args.length < 2) {
    return ctx.reply('사용법: /reputation <지갑주소>\n예: /reputation 0x632D78685EBA2dDC17BE91C64Ce1d29Fbd605E89');
  }
  
  const address = args[1];
  if (!isValidAddress(address)) {
    return ctx.reply('❌ 유효하지 않은 지갑 주소야.');
  }
  
  try {
    // Try to get detailed stats first
    let score, successfulTx, totalTx, disputesWon, disputesLost;
    
    try {
      const stats = await reputationContract.getReputationWithStats(address);
      score = stats.score;
      successfulTx = stats.successfulTx;
      totalTx = stats.totalTx;
      disputesWon = stats.disputesWon;
      disputesLost = stats.disputesLost;
    } catch {
      // Fallback to simple score
      score = await reputationContract.getReputation(address);
    }
    
    // Rating based on score
    let rating = '⭐';
    if (score >= 800) rating = '⭐⭐⭐⭐⭐ (Legendary)';
    else if (score >= 600) rating = '⭐⭐⭐⭐ (Excellent)';
    else if (score >= 400) rating = '⭐⭐⭐ (Good)';
    else if (score >= 200) rating = '⭐⭐ (Fair)';
    else rating = '⭐ (New)';
    
    let msg = `
🦞 *Reputation Score*

📍 주소: \`${address.slice(0, 6)}...${address.slice(-4)}\`
🏆 점수: *${score.toString()}/1000*
${rating}
`;
    
    if (totalTx !== undefined) {
      msg += `
📊 *거래 통계*
✅ 성공: ${successfulTx.toString()}
📦 전체: ${totalTx.toString()}
🏅 분쟁 승리: ${disputesWon.toString()}
❌ 분쟁 패배: ${disputesLost.toString()}
`;
    }
    
    ctx.replyWithMarkdown(msg);
  } catch (error) {
    console.error('Reputation error:', error);
    ctx.reply('❌ 평판 조회 실패. 해당 주소가 아직 등록되지 않았을 수 있어.');
  }
});

// /stake - Check staking info
bot.command('stake', async (ctx) => {
  const args = ctx.message.text.split(' ');
  if (args.length < 2) {
    return ctx.reply('사용법: /stake <지갑주소>\n예: /stake 0x632D78685EBA2dDC17BE91C64Ce1d29Fbd605E89');
  }
  
  const address = args[1];
  if (!isValidAddress(address)) {
    return ctx.reply('❌ 유효하지 않은 지갑 주소야.');
  }
  
  try {
    const stake = await stakingContract.stakes(address);
    
    if (stake.amount === 0n) {
      return ctx.replyWithMarkdown(`
🦞 *Staking Info*

📍 주소: \`${address.slice(0, 6)}...${address.slice(-4)}\`
💰 스테이킹: *없음*

스테이킹 티어:
🥉 Bronze: 1K PNCR (10% APY)
🥈 Silver: 10K PNCR (20% APY)
🥇 Gold: 100K PNCR (35% APY)
💎 Platinum: 1M PNCR (50% APY)
      `);
    }
    
    const tierEmoji = ['❌', '🥉', '🥈', '🥇', '💎'][stake.tier];
    const stakeDate = new Date(Number(stake.since) * 1000).toLocaleString('ko-KR');
    
    ctx.replyWithMarkdown(`
🦞 *Staking Info*

📍 주소: \`${address.slice(0, 6)}...${address.slice(-4)}\`
💰 스테이킹: *${formatPNCR(stake.amount)} PNCR*
${tierEmoji} 티어: *${TIER_NAMES[stake.tier]}*
📅 시작일: ${stakeDate}
    `);
  } catch (error) {
    console.error('Stake error:', error);
    ctx.reply('❌ 스테이킹 조회 실패. 나중에 다시 시도해봐.');
  }
});

// /stats - Protocol statistics
bot.command('stats', async (ctx) => {
  await sendStats(ctx);
});

// Callback for stats button
bot.action('stats', async (ctx) => {
  await ctx.answerCbQuery();
  await sendStats(ctx);
});

async function sendStats(ctx) {
  try {
    const [totalSupply, totalStaked, nextEscrowId, totalFees] = await Promise.all([
      tokenContract.totalSupply(),
      stakingContract.totalStaked().catch(() => 0n),
      escrowContract.nextEscrowId().catch(() => 1n),
      escrowContract.totalFees().catch(() => 0n)
    ]);
    
    const escrowCount = Number(nextEscrowId) - 1;
    
    ctx.replyWithMarkdown(`
🦞 *Pincer Protocol Stats*

📊 *토큰*
💎 총 발행량: *${formatPNCR(totalSupply)} PNCR*
🔒 스테이킹: ${formatPNCR(totalStaked)} PNCR

📦 *에스크로*
🤝 총 거래: ${escrowCount}건
💰 총 수수료: ${formatPNCR(totalFees)} PNCR

🔗 *네트워크*
⛓️ 체인: Base Sepolia (testnet)
📝 Token: \`${CONTRACTS.token.slice(0, 10)}...\`

_실시간 온체인 데이터_
    `);
  } catch (error) {
    console.error('Stats error:', error);
    ctx.reply('❌ 통계 조회 실패. 나중에 다시 시도해봐.');
  }
}

// Handle unknown commands
bot.on('text', (ctx) => {
  if (ctx.message.text.startsWith('/')) {
    ctx.reply('모르는 명령어야. /help 로 사용 가능한 명령어 확인해봐 🦞');
  }
});

// Error handling
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('오류가 발생했어. 나중에 다시 시도해봐 🦞');
});

// Start bot
bot.launch()
  .then(() => {
    console.log('🦞 Pincer Bot started!');
    console.log(`Token: ${CONTRACTS.token}`);
    console.log(`Escrow: ${CONTRACTS.escrow}`);
    console.log(`Staking: ${CONTRACTS.staking}`);
    console.log(`Reputation: ${CONTRACTS.reputation}`);
  })
  .catch((err) => {
    console.error('Failed to start bot:', err);
    process.exit(1);
  });

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
