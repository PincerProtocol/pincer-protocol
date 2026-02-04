/**
 * ⚒️ Pincer Forge Bot
 * Dev Lead - 개발 현황, 컨트랙트 정보, 기술 문서
 */

require('dotenv').config({ path: 'tokens.env' });
const { Telegraf, Markup } = require('telegraf');
const { ethers } = require('ethers');

const bot = new Telegraf(process.env.FORGE_BOT_TOKEN);
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'https://sepolia.base.org');

// Contract addresses
const CONTRACTS = {
  token: process.env.PNCR_TOKEN || '0xD5a1f8Ff967b1BE0957581B4cabdD5935Aea2939',
  escrow: process.env.ESCROW_CONTRACT || '0xE33FCd5AB5E739a0E051E543607374c6B58bCe35',
  staking: process.env.STAKING_CONTRACT || '0x8e28b009Bf4b517cA91089D179df1f6cE1ED8F6D',
  reputation: process.env.REPUTATION_CONTRACT || '0x56771E7556d9A772D1De5F78861B2Da2A252adf8'
};

// /start
bot.start((ctx) => {
  ctx.replyWithMarkdown(`
⚒️ *Pincer Forge Bot*

안녕! 난 Forge, Pincer Protocol의 개발 담당이야.

*내가 할 수 있는 것:*
• 컨트랙트 정보 조회
• 개발 현황 확인
• 기술 문서 안내

/help 로 명령어 확인해봐!
  `, Markup.inlineKeyboard([
    [Markup.button.callback('📜 Contracts', 'contracts')],
    [Markup.button.callback('🔧 Dev Status', 'devstatus')],
    [Markup.button.url('📄 GitHub', 'https://github.com/pincerprotocol')]
  ]));
});

// /help
bot.help((ctx) => {
  ctx.replyWithMarkdown(`
⚒️ *Forge Commands*

📜 *컨트랙트*
/contracts - 컨트랙트 주소
/verify <address> - 컨트랙트 확인
/gas - 가스 가격

🔧 *개발*
/status - 개발 현황
/tests - 테스트 현황
/stack - 기술 스택

📚 *문서*
/docs - 기술 문서
/api - API 가이드

_"코드가 곧 진실이다"_ ⚒️
  `);
});

// /contracts
bot.command('contracts', async (ctx) => {
  await sendContracts(ctx);
});

bot.action('contracts', async (ctx) => {
  await ctx.answerCbQuery();
  await sendContracts(ctx);
});

async function sendContracts(ctx) {
  ctx.replyWithMarkdown(`
📜 *Smart Contracts*

⛓️ *Chain:* Base Sepolia (testnet)
📦 *Version:* v2.0 (175B Supply)

*PNCRToken*
\`${CONTRACTS.token}\`
[BaseScan](https://sepolia.basescan.org/address/${CONTRACTS.token})

*SimpleEscrow*
\`${CONTRACTS.escrow}\`
[BaseScan](https://sepolia.basescan.org/address/${CONTRACTS.escrow})

*PNCRStaking*
\`${CONTRACTS.staking}\`
[BaseScan](https://sepolia.basescan.org/address/${CONTRACTS.staking})

*ReputationSystem*
\`${CONTRACTS.reputation}\`
[BaseScan](https://sepolia.basescan.org/address/${CONTRACTS.reputation})

_All contracts verified_ ✅
  `);
}

// /verify
bot.command('verify', async (ctx) => {
  const args = ctx.message.text.split(' ');
  if (args.length < 2) {
    return ctx.reply('사용법: /verify <contract_address>');
  }

  const address = args[1];
  
  try {
    const code = await provider.getCode(address);
    
    if (code === '0x') {
      ctx.replyWithMarkdown(`
❌ *Contract Not Found*

주소: \`${address}\`
이 주소에 컨트랙트가 없어.

EOA(일반 지갑) 주소이거나 잘못된 주소일 수 있어.
      `);
    } else {
      ctx.replyWithMarkdown(`
✅ *Contract Verified*

주소: \`${address}\`
바이트코드 크기: ${(code.length - 2) / 2} bytes

[BaseScan에서 보기](https://sepolia.basescan.org/address/${address})
      `);
    }
  } catch (error) {
    ctx.reply('❌ 검증 실패. 주소를 확인해봐.');
  }
});

// /gas
bot.command('gas', async (ctx) => {
  try {
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice ? parseFloat(ethers.formatUnits(feeData.gasPrice, 'gwei')) : 0;
    
    ctx.replyWithMarkdown(`
⛽ *Gas Price (Base Sepolia)*

💨 Current: *${gasPrice.toFixed(4)} gwei*

💡 Base는 L2라서 가스비가 매우 저렴해!
일반적으로 $0.01 미만
    `);
  } catch (error) {
    ctx.reply('❌ 가스 가격 조회 실패.');
  }
});

// /status
bot.command('status', async (ctx) => {
  await sendDevStatus(ctx);
});

bot.action('devstatus', async (ctx) => {
  await ctx.answerCbQuery();
  await sendDevStatus(ctx);
});

async function sendDevStatus(ctx) {
  ctx.replyWithMarkdown(`
🔧 *Development Status*

✅ *완료*
• PNCRToken.sol - 175B 발행
• SimpleEscrow.sol - 에스크로 + 분쟁
• PNCRStaking.sol - 4티어 스테이킹
• ReputationSystem.sol - 평판 시스템
• Backend API - Express + ethers.js
• Landing Page - Next.js + Tailwind

🔄 *진행 중*
• GitHub 공개 준비
• 메인넷 배포 준비

📅 *예정*
• SDK 개발
• 추가 컨트랙트

_Last update: 2026-02-04_ ⚒️
  `);
}

// /tests
bot.command('tests', (ctx) => {
  ctx.replyWithMarkdown(`
🧪 *Test Status*

✅ *138 tests passing*

📦 *Breakdown:*
• PNCRToken: 21 tests
• SimpleEscrow: 75 tests
• PNCRStaking: 21 tests
• ReputationSystem: 21 tests

🔒 *Security Tests:*
• Reentrancy protection ✅
• Overflow protection ✅
• Access control ✅
• Emergency pause ✅

\`\`\`
npx hardhat test
\`\`\`

_All green!_ ⚒️
  `);
});

// /stack
bot.command('stack', (ctx) => {
  ctx.replyWithMarkdown(`
🛠️ *Tech Stack*

*Smart Contracts*
• Solidity 0.8.20
• Hardhat
• OpenZeppelin

*Backend*
• Node.js + Express
• TypeScript
• ethers.js v6

*Frontend*
• Next.js 15
• Tailwind CSS
• React

*Chain*
• Base (Coinbase L2)
• EVM Compatible

*Testing*
• Chai + Mocha
• Hardhat Network

_Modern & Battle-tested_ ⚒️
  `);
});

// /docs
bot.command('docs', (ctx) => {
  ctx.replyWithMarkdown(`
📚 *Technical Docs*

*Core Docs:*
• [WHITEPAPER.md](https://github.com/pincerprotocol/pincer-protocol/docs/WHITEPAPER.md)
• [API.md](https://github.com/pincerprotocol/pincer-protocol/docs/API.md)
• [SECURITY.md](https://github.com/pincerprotocol/pincer-protocol/SECURITY.md)

*Guides:*
• [README.md](https://github.com/pincerprotocol/pincer-protocol/README.md)
• [CONTRIBUTING.md](https://github.com/pincerprotocol/pincer-protocol/CONTRIBUTING.md)

*Contract Docs:*
• [USER_FLOWS.md](https://github.com/pincerprotocol/pincer-protocol/docs/USER_FLOWS.md)
• [TROUBLESHOOTING.md](https://github.com/pincerprotocol/pincer-protocol/docs/TROUBLESHOOTING.md)

_RTFM!_ ⚒️
  `);
});

// /api
bot.command('api', (ctx) => {
  ctx.replyWithMarkdown(`
🔌 *API Guide*

*Base URL:*
\`https://api-eta-seven-21.vercel.app\`

*Endpoints:*
• \`GET /\` - Health check
• \`GET /balance/:address\` - PNCR balance
• \`GET /escrow/:id\` - Escrow details
• \`POST /escrow\` - Create escrow
• \`GET /reputation/:address\` - Rep score

*Example:*
\`\`\`
curl https://api-eta-seven-21.vercel.app/balance/0x...
\`\`\`

자세한 내용은 /docs 참고!
  `);
});

// Error handling
bot.catch((err, ctx) => {
  console.error('Forge Bot error:', err);
  ctx.reply('오류가 발생했어. 잠시 후 다시 시도해봐 ⚒️');
});

// Start
bot.launch()
  .then(() => console.log('⚒️ Forge Bot started!'))
  .catch((err) => {
    console.error('Failed to start Forge Bot:', err);
    process.exit(1);
  });

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
