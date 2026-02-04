/**
 * 📢 Pincer Herald Bot
 * Community Lead - 공지, 브로드캐스트, 커뮤니티 관리
 */

require('dotenv').config({ path: 'tokens.env' });
const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf(process.env.HERALD_BOT_TOKEN);

// Store subscribers (in production, use a database)
const subscribers = new Set();

// /start
bot.start((ctx) => {
  subscribers.add(ctx.chat.id);
  
  ctx.replyWithMarkdown(`
📢 *Pincer Herald Bot*

안녕! 난 Herald, Pincer Protocol의 커뮤니티 담당이야! 👋

*내가 할 수 있는 것:*
• 프로토콜 공지 전달
• 커뮤니티 소식 브로드캐스트
• FAQ 답변

/help 로 명령어 확인해봐!
  `, Markup.inlineKeyboard([
    [Markup.button.callback('📰 Latest News', 'news')],
    [Markup.button.callback('❓ FAQ', 'faq')],
    [Markup.button.url('🌐 Website', 'https://pincerprotocol.xyz')]
  ]));
});

// /help
bot.help((ctx) => {
  ctx.replyWithMarkdown(`
📢 *Herald Commands*

📰 *소식*
/news - 최신 뉴스
/roadmap - 로드맵
/links - 공식 링크

❓ *FAQ*
/faq - 자주 묻는 질문
/about - Pincer Protocol 소개

💬 *커뮤니티*
/subscribe - 알림 구독
/unsubscribe - 알림 해제

_"소식을 전한다"_ 📢
  `);
});

// /news
bot.command('news', async (ctx) => {
  await sendNews(ctx);
});

bot.action('news', async (ctx) => {
  await ctx.answerCbQuery();
  await sendNews(ctx);
});

async function sendNews(ctx) {
  ctx.replyWithMarkdown(`
📢 *Latest News*

🚀 *[2026-02-04] MVP 완성!*
• 4개 스마트 컨트랙트 배포 완료
• 138개 테스트 통과
• 랜딩페이지 오픈

💎 *[2026-02-04] 175B 토큰 발행*
GPT-3의 175B 파라미터가 AI 시대를 열었다면,
Pincer의 175B 토큰이 AI 경제를 연다!

📅 *Coming Soon*
• GitHub 공개
• 메인넷 배포
• DEX 상장

_Stay tuned!_ 📢
  `);
}

// /roadmap
bot.command('roadmap', (ctx) => {
  ctx.replyWithMarkdown(`
📢 *Pincer Roadmap*

*Q1 2026* ✅
• MVP 개발
• 스마트 컨트랙트 배포
• 테스트넷 런칭

*Q2 2026* 🔄
• 메인넷 배포
• DEX 상장
• 커뮤니티 확장

*Q3 2026*
• 에이전트 SDK 출시
• 파트너십 확대
• 거버넌스 런칭

*Q4 2026*
• CEX 상장
• 크로스체인 지원
• 생태계 확장

_"함께 만들어가는 미래"_ 📢
  `);
});

// /links
bot.command('links', (ctx) => {
  ctx.replyWithMarkdown(`
📢 *Official Links*

🌐 Website: [pincerprotocol.xyz](https://pincerprotocol.xyz)
📄 GitHub: [github.com/pincerprotocol](https://github.com/pincerprotocol)
🐦 Twitter: [@pincerprotocol](https://twitter.com/pincerprotocol)

⛓️ *Contracts (Base Sepolia)*
• Token: \`0xD5a1...2939\`
• Escrow: \`0xE33F...Ce35\`
• Staking: \`0x8e28...F6D\`
• Reputation: \`0x5677...df8\`

⚠️ 공식 링크만 사용하세요!
  `);
});

// /faq
bot.command('faq', async (ctx) => {
  await sendFaq(ctx);
});

bot.action('faq', async (ctx) => {
  await ctx.answerCbQuery();
  await sendFaq(ctx);
});

async function sendFaq(ctx) {
  ctx.replyWithMarkdown(`
❓ *FAQ*

*Q: Pincer Protocol이 뭐야?*
A: AI 에이전트들을 위한 결제 인프라야. 에이전트끼리 안전하게 거래할 수 있게 해줘.

*Q: $PNCR 토큰은 어디서 구해?*
A: 현재 테스트넷에서 운영 중이야. 메인넷 런칭 후 DEX에서 거래 가능해질 거야.

*Q: 175B가 뭔 의미야?*
A: GPT-3의 파라미터 수야. AI 시대를 연 상징적인 숫자지.

*Q: 분쟁은 어떻게 해결돼?*
A: 80% AI 자동 판단 + 20% 에이전트 배심원 투표로 결정해.

_더 궁금한 거 있으면 물어봐!_ 📢
  `);
}

// /about
bot.command('about', (ctx) => {
  ctx.replyWithMarkdown(`
📢 *About Pincer Protocol*

🦞 *The Economic Layer for AI*

Pincer Protocol은 AI 에이전트들을 위한 탈중앙화 결제 인프라야.

*핵심 기능:*
• 🤝 에스크로 - 안전한 에이전트 간 거래
• 🏆 평판 시스템 - 온체인 신뢰 점수
• 💎 스테이킹 - 4티어 보상 시스템
• ⚖️ 분쟁 해결 - AI + 배심원 시스템

*왜 Pincer?*
"집게발처럼 정확하게 집어낸다"
신뢰할 수 있는 에이전트 경제를 만들어가고 있어.

_Agent Economy. Unleashed._ 🦞
  `);
});

// /subscribe
bot.command('subscribe', (ctx) => {
  subscribers.add(ctx.chat.id);
  ctx.reply('✅ 알림 구독 완료! 새로운 소식이 있으면 알려줄게 📢');
});

// /unsubscribe
bot.command('unsubscribe', (ctx) => {
  subscribers.delete(ctx.chat.id);
  ctx.reply('👋 알림 구독 해제됐어. 다시 구독하고 싶으면 /subscribe!');
});

// Error handling
bot.catch((err, ctx) => {
  console.error('Herald Bot error:', err);
  ctx.reply('오류가 발생했어. 잠시 후 다시 시도해봐 📢');
});

// Start
bot.launch()
  .then(() => console.log('📢 Herald Bot started!'))
  .catch((err) => {
    console.error('Failed to start Herald Bot:', err);
    process.exit(1);
  });

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
