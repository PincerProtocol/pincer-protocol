/**
 * 🔍 Pincer Scout Bot
 * Research Lead - 시장 조사, 경쟁사 분석, 트렌드 추적
 */

require('dotenv').config({ path: 'tokens.env' });
const { Telegraf, Markup } = require('telegraf');
const { ethers } = require('ethers');

const bot = new Telegraf(process.env.SCOUT_BOT_TOKEN);
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'https://sepolia.base.org');

// Contract ABIs
const ERC20_ABI = [
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)'
];

const ESCROW_ABI = [
  'function nextEscrowId() view returns (uint256)',
  'function totalFees() view returns (uint256)'
];

// Contracts
const tokenContract = new ethers.Contract(
  process.env.PNCR_TOKEN || '0xD5a1f8Ff967b1BE0957581B4cabdD5935Aea2939',
  ERC20_ABI,
  provider
);

const escrowContract = new ethers.Contract(
  process.env.ESCROW_CONTRACT || '0xE33FCd5AB5E739a0E051E543607374c6B58bCe35',
  ESCROW_ABI,
  provider
);

// Format large numbers
const formatNumber = (num) => {
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toFixed(2);
};

// /start
bot.start((ctx) => {
  ctx.replyWithMarkdown(`
🔍 *Pincer Scout Bot*

안녕! 난 Scout, Pincer Protocol의 리서치 담당이야.

*내가 할 수 있는 것:*
• 시장 데이터 분석
• 프로토콜 통계 조회
• 에이전트 경제 트렌드 추적

/help 로 명령어 확인해봐!
  `, Markup.inlineKeyboard([
    [Markup.button.callback('📊 Protocol Stats', 'stats')],
    [Markup.button.url('🌐 Website', 'https://pincerprotocol.xyz')]
  ]));
});

// /help
bot.help((ctx) => {
  ctx.replyWithMarkdown(`
🔍 *Scout Commands*

📊 *조회*
/stats - 프로토콜 통계
/supply - 토큰 공급량
/market - 시장 데이터 (coming soon)

🔎 *리서치*
/trends - 에이전트 경제 트렌드
/compare - 경쟁 프로토콜 비교

_"데이터가 말해준다"_ 🔍
  `);
});

// /stats
bot.command('stats', async (ctx) => {
  await sendStats(ctx);
});

bot.action('stats', async (ctx) => {
  await ctx.answerCbQuery();
  await sendStats(ctx);
});

async function sendStats(ctx) {
  try {
    const [totalSupply, nextEscrowId, totalFees] = await Promise.all([
      tokenContract.totalSupply(),
      escrowContract.nextEscrowId().catch(() => 1n),
      escrowContract.totalFees().catch(() => 0n)
    ]);

    const escrowCount = Number(nextEscrowId) - 1;

    ctx.replyWithMarkdown(`
🔍 *Pincer Protocol Stats*

📊 *토큰 메트릭*
💎 총 발행량: *${formatNumber(parseFloat(ethers.formatUnits(totalSupply, 18)))} PNCR*
🔥 175B 테마: GPT-3 파라미터 수

📦 *에스크로 활동*
🤝 총 거래: ${escrowCount}건
💰 누적 수수료: ${formatNumber(parseFloat(ethers.formatUnits(totalFees, 18)))} PNCR

⛓️ *네트워크*
Chain: Base Sepolia (testnet)

_실시간 온체인 데이터_ 🔍
    `);
  } catch (error) {
    console.error('Stats error:', error);
    ctx.reply('❌ 데이터 조회 실패. 잠시 후 다시 시도해봐.');
  }
}

// /supply
bot.command('supply', async (ctx) => {
  try {
    const totalSupply = await tokenContract.totalSupply();
    const supply = parseFloat(ethers.formatUnits(totalSupply, 18));
    
    ctx.replyWithMarkdown(`
🔍 *PNCR Token Supply*

💎 총 발행량: *${formatNumber(supply)} PNCR*
📊 정확한 값: ${supply.toLocaleString()} PNCR

*토큰 분배:*
• 40% Ecosystem (${formatNumber(supply * 0.4)})
• 25% Team (${formatNumber(supply * 0.25)})
• 20% Treasury (${formatNumber(supply * 0.2)})
• 15% Investors (${formatNumber(supply * 0.15)})

_"175B = GPT-3 파라미터"_ 🔍
    `);
  } catch (error) {
    console.error('Supply error:', error);
    ctx.reply('❌ 공급량 조회 실패.');
  }
});

// /trends
bot.command('trends', (ctx) => {
  ctx.replyWithMarkdown(`
🔍 *Agent Economy Trends*

📈 *2026 트렌드*
1. AI 에이전트 간 자율 거래 증가
2. 에이전트 전용 결제 레일 수요
3. 신뢰 기반 평판 시스템 필수화

💡 *Pincer의 포지션*
• 에이전트 경제 인프라 선점
• 175B 토큰으로 대규모 생태계 지원
• AI-first 분쟁 해결 시스템

🎯 *TAM*
$50B+ 에이전트 경제 시장 (2030 예상)

_"미래를 읽는다"_ 🔍
  `);
});

// /compare
bot.command('compare', (ctx) => {
  ctx.replyWithMarkdown(`
🔍 *Protocol Comparison*

| Feature | Pincer | Others |
|---------|--------|--------|
| Agent Focus | ✅ | ❌ |
| AI Dispute | ✅ | ❌ |
| Base Chain | ✅ | ⚠️ |
| 175B Supply | ✅ | ❌ |

*차별점:*
• 에이전트 전용 설계
• 80% AI + 20% Jury 분쟁 해결
• 온체인 평판 시스템

_"비교하면 답이 나온다"_ 🔍
  `);
});

// Error handling
bot.catch((err, ctx) => {
  console.error('Scout Bot error:', err);
  ctx.reply('오류가 발생했어. 잠시 후 다시 시도해봐 🔍');
});

// Start
bot.launch()
  .then(() => console.log('🔍 Scout Bot started!'))
  .catch((err) => {
    console.error('Failed to start Scout Bot:', err);
    process.exit(1);
  });

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
