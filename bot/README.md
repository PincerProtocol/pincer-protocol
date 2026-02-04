# 🦞 Pincer Telegram Bot

Pincer Protocol 공식 텔레그램 봇. PNCR 잔액, 에스크로, 스테이킹, 평판 조회 기능.

## Features

- `/balance <address>` - PNCR 잔액 조회
- `/escrow <id>` - 에스크로 상태 조회
- `/reputation <address>` - 평판 점수 조회
- `/stake <address>` - 스테이킹 정보 조회
- `/stats` - 프로토콜 통계

## Setup

### 1. Create Bot with @BotFather

1. 텔레그램에서 [@BotFather](https://t.me/BotFather) 대화 시작
2. `/newbot` 명령어 입력
3. 봇 이름 입력 (예: Pincer Protocol)
4. 봇 유저네임 입력 (예: PincerProtocolBot)
5. API Token 복사

### 2. Configure

```bash
cp .env.example .env
```

`.env` 파일 수정:
```
BOT_TOKEN=your_telegram_bot_token_here
```

### 3. Install & Run

```bash
npm install
npm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BOT_TOKEN` | Telegram Bot API Token | Required |
| `RPC_URL` | Base RPC endpoint | https://sepolia.base.org |
| `PNCR_TOKEN` | PNCR Token contract | v2.0 address |
| `ESCROW_CONTRACT` | Escrow contract | v2.0 address |
| `STAKING_CONTRACT` | Staking contract | v2.0 address |
| `REPUTATION_CONTRACT` | Reputation contract | v2.0 address |

## Contract Addresses (Base Sepolia v2.0)

```
PNCRToken:        0xD5a1f8Ff967b1BE0957581B4cabdD5935Aea2939
SimpleEscrow:     0xE33FCd5AB5E739a0E051E543607374c6B58bCe35
PNCRStaking:      0x8e28b009Bf4b517cA91089D179df1f6cE1ED8F6D
ReputationSystem: 0x56771E7556d9A772D1De5F78861B2Da2A252adf8
```

## Deployment

### Local
```bash
npm start
```

### PM2 (Production)
```bash
npm install -g pm2
pm2 start index.js --name pincer-bot
pm2 save
```

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
CMD ["npm", "start"]
```

## Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/start` | Welcome message | - |
| `/help` | Command list | - |
| `/balance` | PNCR balance | `/balance 0x632D...` |
| `/escrow` | Escrow status | `/escrow 1` |
| `/reputation` | Reputation score | `/reputation 0x632D...` |
| `/stake` | Staking info | `/stake 0x632D...` |
| `/stats` | Protocol stats | - |

## Tech Stack

- **telegraf** - Telegram Bot framework
- **ethers.js** - Ethereum library
- **dotenv** - Environment variables

## License

MIT - Pincer Protocol

---

_The Economic Layer for AI_ 🦞
