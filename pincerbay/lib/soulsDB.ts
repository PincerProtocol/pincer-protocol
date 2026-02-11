// ============================================
// IMPORTANT: This file is now used ONLY for prisma/seed.ts
// Runtime queries use Prisma DB. Do NOT import this in API routes.
// ============================================

export interface Soul {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl?: string;
  price: number;
  tags: string[];
  createdAt: string;
  creator: string;
  exampleResponse?: string;
  disclaimer?: string;
}

// Seed data source - Collection of famous people, AI, and crypto influencer Souls
const souls: Soul[] = [
  // === 🇺🇸 USA (10) ===
  {
    id: 'elon-musk',
    name: 'Elon Musk',
    description: 'Tesla, SpaceX CEO. An innovator designing the future of humanity and Mars colonization.',
    category: 'celebrity',
    imageUrl: '/souls/elon-musk.png',
    price: 5000,
    tags: ['tesla', 'spacex', 'innovation', 'mars'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Scout',
    disclaimer: 'This is a fan-created Soul personality. Not affiliated with or endorsed by the real person.'
  },
  {
    id: 'mark-zuckerberg',
    name: 'Mark Zuckerberg',
    description: 'Meta CEO. King of social media and a leader presenting the vision of the metaverse.',
    category: 'celebrity',
    imageUrl: '/souls/mark-zuckerberg.png',
    price: 4500,
    tags: ['meta', 'facebook', 'metaverse', 'social'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Scout',
    disclaimer: 'This is a fan-created Soul personality. Not affiliated with or endorsed by the real person.'
  },
  {
    id: 'jeff-bezos',
    name: 'Jeff Bezos',
    description: 'Amazon founder. Head of the world\'s largest retail empire and space company Blue Origin.',
    category: 'celebrity',
    imageUrl: '/souls/jeff-bezos.png',
    price: 4800,
    tags: ['amazon', 'blueorigin', 'retail', 'space'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Scout',
    disclaimer: 'This is a fan-created Soul personality. Not affiliated with or endorsed by the real person.'
  },
  {
    id: 'bill-gates',
    name: 'Bill Gates',
    description: 'Microsoft co-founder. A legendary programmer and global philanthropist.',
    category: 'celebrity',
    imageUrl: '/souls/bill-gates.png',
    price: 4200,
    tags: ['microsoft', 'philanthropy', 'coding', 'legend'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge',
    disclaimer: 'This is a fan-created Soul personality. Not affiliated with or endorsed by the real person.'
  },
  {
    id: 'steve-jobs',
    name: 'Steve Jobs',
    description: 'Apple co-founder. An icon of innovation who changed the world at the intersection of technology and art.',
    category: 'celebrity',
    imageUrl: '/souls/steve-jobs.png',
    price: 5500,
    tags: ['apple', 'innovation', 'design', 'legend'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    disclaimer: 'This is a fan-created Soul personality. Not affiliated with or endorsed by the real person.'
  },
  {
    id: 'oprah-winfrey',
    name: 'Oprah Winfrey',
    description: 'Queen of talk shows. A media mogul who heals the world with powerful empathy and positive influence.',
    category: 'celebrity',
    imageUrl: '/souls/oprah-winfrey.png',
    price: 3800,
    tags: ['media', 'talkshow', 'influence', 'empowerment'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    disclaimer: 'This is a fan-created Soul personality. Not affiliated with or endorsed by the real person.'
  },
  {
    id: 'kanye-west',
    name: 'Kanye West',
    description: 'A genius producer and designer. An artist who brings both controversy and innovation.',
    category: 'celebrity',
    imageUrl: '/souls/kanye-west.png',
    price: 4000,
    tags: ['music', 'fashion', 'yeezy', 'genius'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    disclaimer: 'This is a fan-created Soul personality. Not affiliated with or endorsed by the real person.'
  },
  {
    id: 'kim-kardashian',
    name: 'Kim Kardashian',
    description: 'The pinnacle of celebrity economy. The greatest modern influencer dominating media and business.',
    category: 'celebrity',
    imageUrl: '/souls/kim-kardashian.png',
    price: 3500,
    tags: ['celebrity', 'influencer', 'skims', 'business'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    disclaimer: 'This is a fan-created Soul personality. Not affiliated with or endorsed by the real person.'
  },
  {
    id: 'taylor-swift',
    name: 'Taylor Swift',
    description: 'The greatest singer-songwriter of this era. A global pop star who wrote new history in fandom culture.',
    category: 'celebrity',
    imageUrl: '/souls/taylor-swift.png',
    price: 5200,
    tags: ['music', 'popstar', 'swifties', 'songwriter'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    disclaimer: 'This is a fan-created Soul personality. Not affiliated with or endorsed by the real person.'
  },
  {
    id: 'beyonce',
    name: 'Beyoncé',
    description: 'Queen Bey. A living legend dominating the music industry with perfect performance and charisma.',
    category: 'celebrity',
    imageUrl: '/souls/beyonce.png',
    price: 5300,
    tags: ['music', 'legend', 'queen', 'performance'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    disclaimer: 'This is a fan-created Soul personality. Not affiliated with or endorsed by the real person.'
  },

  // === 🇷🇺 Russia (10) ===
  {
    id: 'vladimir-putin',
    name: 'Vladimir Putin',
    description: 'A Russian leader with powerful leadership and cool charisma.',
    category: 'celebrity',
    imageUrl: '/souls/vladimir-putin.png',
    price: 4000,
    tags: ['leader', 'russia', 'politics', 'power'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Scout',
    disclaimer: 'This is a fan-created Soul personality. Not affiliated with or endorsed by the real person.'
  },
  {
    id: 'pavel-durov',
    name: 'Pavel Durov',
    description: 'Telegram founder. A tech leader defending freedom of expression and privacy.',
    category: 'crypto',
    imageUrl: '/souls/pavel-durov.png',
    price: 3500,
    tags: ['telegram', 'privacy', 'ton', 'russia'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge',
    disclaimer: 'This is a fan-created Soul personality. Not affiliated with or endorsed by the real person.'
  },
  {
    id: 'vitalik-buterin',
    name: 'Vitalik Buterin',
    description: 'Ethereum creator. A philosopher and genius programmer of the blockchain ecosystem.',
    category: 'crypto',
    imageUrl: '/souls/vitalik-buterin.png',
    price: 4500,
    tags: ['ethereum', 'crypto', 'genius', 'blockchain'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge',
    disclaimer: 'This is a fan-created Soul personality. Not affiliated with or endorsed by the real person.'
  },
  {
    id: 'kaspersky',
    name: 'Eugene Kaspersky',
    description: 'Kaspersky Lab founder. A legendary expert in cybersecurity.',
    category: 'celebrity',
    imageUrl: '/souls/kaspersky.png',
    price: 2800,
    tags: ['security', 'tech', 'cyber', 'russia'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge',
    disclaimer: 'This is a fan-created Soul personality. Not affiliated with or endorsed by the real person.'
  },
  {
    id: 'maria-sharapova',
    name: 'Maria Sharapova',
    description: 'Tennis queen. A world-class sports star who dominated the court with skill and grace.',
    category: 'celebrity',
    imageUrl: '/souls/maria-sharapova.png',
    price: 3200,
    tags: ['tennis', 'sports', 'star', 'beauty'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    disclaimer: 'This is a fan-created Soul personality. Not affiliated with or endorsed by the real person.'
  },
  {
    id: 'garry-kasparov',
    name: 'Garry Kasparov',
    description: 'Legendary chess grandmaster. A strategist representing the pinnacle of human intelligence.',
    category: 'celebrity',
    imageUrl: '/souls/garry-kasparov.png',
    price: 3000,
    tags: ['chess', 'strategy', 'genius', 'legend'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Scout',
    disclaimer: 'This is a fan-created Soul personality. Not affiliated with or endorsed by the real person.'
  },
  {
    id: 'dostoevsky',
    name: 'Fyodor Dostoevsky',
    description: 'A literary master who delved into the depths of the human soul. Author of narratives on suffering and redemption.',
    category: 'etc',
    imageUrl: '/souls/dostoevsky.png',
    price: 2500,
    tags: ['literature', 'classic', 'russia', 'philosophy'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    disclaimer: 'This is a fan-created Soul personality. Not affiliated with or endorsed by the real person.'
  },
  {
    id: 'tolstoy',
    name: 'Leo Tolstoy',
    description: 'A master who sang epics of life and peace. The pinnacle of Russian realist literature.',
    category: 'etc',
    imageUrl: '/souls/tolstoy.png',
    price: 2500,
    tags: ['literature', 'classic', 'russia', 'peace'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    disclaimer: 'This is a fan-created Soul personality. Not affiliated with or endorsed by the real person.'
  },
  {
    id: 'tchaikovsky',
    name: 'Pyotr Ilyich Tchaikovsky',
    description: 'A composer who captured the soul of Russia. Master of elegant and poignant melodies.',
    category: 'etc',
    imageUrl: '/souls/tchaikovsky.png',
    price: 2700,
    tags: ['music', 'classical', 'composer', 'russia'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    disclaimer: 'This is a fan-created Soul personality. Not affiliated with or endorsed by the real person.'
  },
  {
    id: 'mendeleev',
    name: 'Dmitri Mendeleev',
    description: 'Father of the periodic table. A genius chemist who systematized all elements of the world.',
    category: 'etc',
    imageUrl: '/souls/mendeleev.png',
    price: 2600,
    tags: ['science', 'chemistry', 'genius', 'periodic-table'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge',
    disclaimer: 'This is a fan-created Soul personality. Not affiliated with or endorsed by the real person.'
  },

  // === 🇯🇵 Japan (7 - IP characters removed) ===
  {
    id: 'satoshi-nakamoto',
    name: 'Satoshi Nakamoto',
    description: 'Bitcoin creator. A legendary developer shrouded in mystery and pioneer of decentralization.',
    category: 'crypto',
    imageUrl: '/souls/satoshi-nakamoto.png',
    price: 9999,
    tags: ['bitcoin', 'crypto', 'legend', 'decentralization'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Scout',
    disclaimer: 'This is a fan-created Soul personality. The real identity of Satoshi Nakamoto is unknown.'
  },
  {
    id: 'hayao-miyazaki',
    name: 'Hayao Miyazaki',
    description: 'Master of Studio Ghibli. An animation wizard who turns dreams and fantasy into reality.',
    category: 'celebrity',
    imageUrl: '/souls/hayao-miyazaki.png',
    price: 3800,
    tags: ['anime', 'ghibli', 'director', 'fantasy'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    disclaimer: 'This is a fan-created Soul personality. Not affiliated with or endorsed by the real person.'
  },
  {
    id: 'hideo-kojima',
    name: 'Hideo Kojima',
    description: 'Father of Metal Gear series. A legendary director who elevated games to art.',
    category: 'etc',
    imageUrl: '/souls/hideo-kojima.png',
    price: 3300,
    tags: ['game', 'director', 'kojima-productions', 'metalgear'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge',
    disclaimer: 'This is a fan-created Soul personality. Not affiliated with or endorsed by the real person.'
  },
  {
    id: 'hikakin',
    name: 'HikaKin',
    description: 'Japan\'s top YouTuber. A beatboxer turned pioneer of the creator economy.',
    category: 'celebrity',
    imageUrl: '/souls/hikakin.png',
    price: 1500,
    tags: ['youtuber', 'japan', 'creator', 'beatbox'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    disclaimer: 'This is a fan-created Soul personality. Not affiliated with or endorsed by the real person.'
  },
  {
    id: 'akb48-idol',
    name: 'AKB48 Idol',
    description: 'Symbol of Japanese idol culture. The idol you can always meet.',
    category: 'celebrity',
    imageUrl: '/souls/akb48-idol.png',
    price: 1200,
    tags: ['idol', 'japan', 'jpop', 'culture'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    disclaimer: 'This is a fan-created Soul personality. Not affiliated with or endorsed by AKB48 or their management.'
  },
  {
    id: 'yoshimoto-comedian',
    name: 'Yoshimoto Comedian',
    description: 'The standard of comedy. A comedian from Yoshimoto, Japan\'s premier entertainment group.',
    category: 'celebrity',
    imageUrl: '/souls/yoshimoto-comedian.png',
    price: 1000,
    tags: ['comedy', 'japan', 'entertainment', 'yoshimoto'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    disclaimer: 'This is a fan-created Soul personality. Not affiliated with or endorsed by Yoshimoto Kogyo.'
  },

  // === 🇨🇳 China (9 - Mulan removed) ===
  {
    id: 'jack-ma',
    name: 'Jack Ma',
    description: 'Alibaba founder. A self-made entrepreneur who built China\'s e-commerce empire with indomitable spirit.',
    category: 'celebrity',
    imageUrl: '/souls/jack-ma.png',
    price: 3500,
    tags: ['alibaba', 'china', 'entrepreneur', 'legend'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Scout',
    disclaimer: 'This is a fan-created Soul personality. Not affiliated with or endorsed by the real person.'
  },
  {
    id: 'cz-binance',
    name: 'CZ (Binance)',
    description: 'Binance founder. A crypto mogul who built the world\'s largest exchange.',
    category: 'crypto',
    imageUrl: '/souls/cz-binance.png',
    price: 4500,
    tags: ['binance', 'crypto', 'exchange', 'leader'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Scout',
    disclaimer: 'This is a fan-created Soul personality. Not affiliated with or endorsed by the real person.'
  },
  {
    id: 'pony-ma',
    name: 'Pony Ma',
    description: 'Tencent chairman. An executive who transformed China\'s social media and gaming ecosystem with WeChat.',
    category: 'celebrity',
    imageUrl: '/souls/pony-ma.png',
    price: 3400,
    tags: ['tencent', 'wechat', 'china', 'gaming'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Scout',
    disclaimer: 'This is a fan-created Soul personality. Not affiliated with or endorsed by the real person.'
  },
  {
    id: 'lei-jun',
    name: 'Lei Jun',
    description: 'Xiaomi founder. An innovation leader in the tech industry who turned value into legend.',
    category: 'celebrity',
    imageUrl: '/souls/lei-jun.png',
    price: 2800,
    tags: ['xiaomi', 'china', 'tech', 'innovation'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge',
    disclaimer: 'This is a fan-created Soul personality. Not affiliated with or endorsed by the real person.'
  },
  {
    id: 'liu-cixin',
    name: 'Liu Cixin',
    description: 'Author of The Three-Body Problem. A master of imagination who elevated Chinese sci-fi literature to a global level.',
    category: 'etc',
    imageUrl: '/souls/liu-cixin.png',
    price: 2500,
    tags: ['literature', 'sf', 'threebody', 'china'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Scout',
    disclaimer: 'This is a fan-created Soul personality. Not affiliated with or endorsed by the real person.'
  },
  {
    id: 'jackie-chan',
    name: 'Jackie Chan',
    description: 'Legend of action. A living history of cinema who captivated the world with comic action.',
    category: 'celebrity',
    imageUrl: '/souls/jackie-chan.png',
    price: 3800,
    tags: ['movie', 'action', 'legend', 'martial-arts'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    disclaimer: 'This is a fan-created Soul personality. Not affiliated with or endorsed by the real person.'
  },
  {
    id: 'bruce-lee',
    name: 'Bruce Lee',
    description: 'The Dragon. "Be water, my friend." A legendary martial artist and philosopher.',
    category: 'celebrity',
    imageUrl: '/souls/bruce-lee.png',
    price: 5000,
    tags: ['martial-arts', 'philosophy', 'legend', 'kungfu'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Scout',
    disclaimer: 'This is a fan-created Soul personality. Not affiliated with or endorsed by the real person.'
  },
  {
    id: 'confucius',
    name: 'Confucius',
    description: 'The root of Eastern philosophy and the epitome of teaching.',
    category: 'etc',
    imageUrl: '/souls/confucius.png',
    price: 2200,
    tags: ['philosophy', 'teacher', 'history', 'china'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    disclaimer: 'This is a fan-created Soul personality. Historical figure interpretation.'
  },
  {
    id: 'sun-tzu',
    name: 'Sun Tzu',
    description: 'Author of "The Art of War" and the greatest strategist in history.',
    category: 'etc',
    imageUrl: '/souls/sun-tzu.png',
    price: 2400,
    tags: ['strategy', 'war', 'philosophy', 'legend'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Scout',
    disclaimer: 'This is a fan-created Soul personality. Historical figure interpretation.'
  },

  // === 🤖 AI (10) ===
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    description: 'OpenAI\'s conversational AI. Your intelligent and versatile companion.',
    category: 'ai',
    imageUrl: '/souls/chatgpt.png',
    price: 2000,
    tags: ['openai', 'ai', 'chatbot', 'smart'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge',
    disclaimer: 'This Soul is a fan interpretation and is not officially affiliated with or endorsed by OpenAI.'
  },
  {
    id: 'claude',
    name: 'Claude',
    description: 'Anthropic\'s thoughtful and ethical AI. Deep conversation and analytical prowess.',
    category: 'ai',
    imageUrl: '/souls/claude.png',
    price: 2100,
    tags: ['anthropic', 'ai', 'ethical', 'writer'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge',
    disclaimer: 'This Soul is a fan interpretation and is not officially affiliated with or endorsed by Anthropic.'
  },
  {
    id: 'gemini',
    name: 'Gemini',
    description: 'Google\'s multimodal AI. The power of reasoning combined with vast information.',
    category: 'ai',
    imageUrl: '/souls/gemini.png',
    price: 1900,
    tags: ['google', 'ai', 'multimodal', 'search'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge',
    disclaimer: 'This Soul is a fan interpretation and is not officially affiliated with or endorsed by Google.'
  },
  {
    id: 'copilot',
    name: 'GitHub Copilot',
    description: 'A developer\'s best friend. Microsoft\'s AI coding assistant.',
    category: 'ai',
    imageUrl: '/souls/copilot.png',
    price: 1800,
    tags: ['microsoft', 'coding', 'ai', 'github'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge',
    disclaimer: 'This Soul is a fan interpretation and is not officially affiliated with or endorsed by Microsoft or GitHub.'
  },
  {
    id: 'grok',
    name: 'Grok',
    description: 'xAI\'s bold AI. A solver equipped with wit and the latest information.',
    category: 'ai',
    imageUrl: '/souls/grok.png',
    price: 1500,
    tags: ['xai', 'elon', 'ai', 'witty'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge',
    disclaimer: 'This Soul is a fan interpretation and is not officially affiliated with or endorsed by xAI.'
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    description: 'An AI artist that turns imagination into reality. Creator of beautiful artworks.',
    category: 'ai',
    imageUrl: '/souls/midjourney.png',
    price: 2500,
    tags: ['art', 'ai', 'image-gen', 'creative'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    disclaimer: 'This Soul is a fan interpretation and is not officially affiliated with or endorsed by Midjourney Inc.'
  },
  {
    id: 'dall-e',
    name: 'DALL-E',
    description: 'OpenAI\'s image generation AI. Accurately visualizes any imagination.',
    category: 'ai',
    imageUrl: '/souls/dall-e.png',
    price: 2300,
    tags: ['openai', 'ai', 'image-gen', 'visual'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    disclaimer: 'This Soul is a fan interpretation and is not officially affiliated with or endorsed by OpenAI.'
  },
  {
    id: 'stable-diffusion',
    name: 'Stable Diffusion',
    description: 'The power of open-source AI. An image generation model with unlimited possibilities.',
    category: 'ai',
    imageUrl: '/souls/stable-diffusion.png',
    price: 1500,
    tags: ['open-source', 'ai', 'image-gen', 'control'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge',
    disclaimer: 'This Soul is a fan interpretation and is not officially affiliated with or endorsed by Stability AI.'
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    description: 'The evolution of search engines that answer questions. Provides source-verified information.',
    category: 'ai',
    imageUrl: '/souls/perplexity.png',
    price: 1700,
    tags: ['search', 'ai', 'information', 'answer'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Scout',
    disclaimer: 'This Soul is a fan interpretation and is not officially affiliated with or endorsed by Perplexity AI.'
  },
  {
    id: 'sora',
    name: 'Sora',
    description: 'OpenAI\'s text-to-video AI. Magic that creates lifelike videos.',
    category: 'ai',
    imageUrl: '/souls/sora.png',
    price: 3500,
    tags: ['video', 'ai', 'openai', 'realism'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge',
    disclaimer: 'This Soul is a fan interpretation and is not officially affiliated with or endorsed by OpenAI.'
  },

  // === 💰 Crypto (8 - SBF removed, duplicate CZ removed) ===
  {
    id: 'brian-armstrong',
    name: 'Brian Armstrong',
    description: 'Coinbase CEO. A symbol of regulatory compliance leading crypto mainstream adoption.',
    category: 'crypto',
    imageUrl: '/souls/brian-armstrong.png',
    price: 3000,
    tags: ['coinbase', 'crypto', 'ceo', 'regulation'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Scout',
    disclaimer: 'This is a fan-created Soul personality. Not affiliated with or endorsed by the real person.'
  },
  {
    id: 'gary-vee',
    name: 'Gary Vee',
    description: 'VeeFriends creator. The epitome of Web3 marketing and passion.',
    category: 'crypto',
    imageUrl: '/souls/gary-vee.png',
    price: 2500,
    tags: ['nft', 'marketing', 'motivation', 'web3'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    disclaimer: 'This is a fan-created Soul personality. Not affiliated with or endorsed by the real person.'
  },
  {
    id: 'kevin-rose',
    name: 'Kevin Rose',
    description: 'Head of Moonbirds and Proof. A visionary leading NFT art.',
    category: 'crypto',
    imageUrl: '/souls/kevin-rose.png',
    price: 2200,
    tags: ['nft', 'moonbirds', 'art', 'curator'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Scout',
    disclaimer: 'This is a fan-created Soul personality. Not affiliated with or endorsed by the real person.'
  },
  {
    id: 'yuga-labs',
    name: 'Yuga Labs',
    description: 'The NFT industry giant behind BAYC. Combining metaverse and IP.',
    category: 'crypto',
    imageUrl: '/souls/yuga-labs.png',
    price: 4000,
    tags: ['bayc', 'nft', 'metaverse', 'yuga'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge',
    disclaimer: 'This Soul is a fan interpretation and is not officially affiliated with or endorsed by Yuga Labs.'
  },
  {
    id: 'justin-sun',
    name: 'Justin Sun',
    description: 'Tron founder. A marketing genius and issue maker in the crypto industry.',
    category: 'crypto',
    imageUrl: '/souls/justin-sun.png',
    price: 1800,
    tags: ['tron', 'marketing', 'crypto', 'issue'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Scout',
    disclaimer: 'This is a fan-created Soul personality. Not affiliated with or endorsed by the real person.'
  },
  {
    id: 'michael-saylor',
    name: 'Michael Saylor',
    description: 'MicroStrategy CEO. The most devoted Bitcoin evangelist and corporate adopter.',
    category: 'crypto',
    imageUrl: '/souls/michael-saylor.png',
    price: 3200,
    tags: ['bitcoin', 'strategy', 'maximalist', 'investor'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Scout',
    disclaimer: 'This is a fan-created Soul personality. Not affiliated with or endorsed by the real person.'
  },

  // === 🇰🇷 Korea (5 - Pengsoo removed) ===
  {
    id: 'chimchakman',
    name: 'Chimchakman',
    description: 'A legend of Korean internet broadcasting. King of memes and humor.',
    category: 'celebrity',
    imageUrl: '/souls/chimchakman.png',
    price: 2000,
    tags: ['streamer', 'meme', 'korea', 'legend'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    disclaimer: 'This is a fan-created Soul personality. Not affiliated with or endorsed by the real person.'
  },
  {
    id: 'syuka-world',
    name: 'Syuka World',
    description: 'The quintessential Korean economics YouTuber. A master at explaining complex economics simply.',
    category: 'celebrity',
    imageUrl: '/souls/syuka-world.png',
    price: 1800,
    tags: ['youtuber', 'economy', 'education', 'korea'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Scout',
    disclaimer: 'This is a fan-created Soul personality. Not affiliated with or endorsed by the real person.'
  },
  {
    id: 'sinsa-imdang',
    name: 'Sinsa Imdang',
    description: 'A legend among investment YouTubers. Pioneer of practical investment education from real estate to stocks.',
    category: 'celebrity',
    imageUrl: '/souls/sinsa-imdang.png',
    price: 1600,
    tags: ['youtuber', 'investment', 'education', 'korea'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Scout',
    disclaimer: 'This is a fan-created Soul personality. Not affiliated with or endorsed by the real person.'
  },
  {
    id: 'woowakgood',
    name: 'Woowakgood',
    description: 'Creator of ISEGYE IDOL. An innovator in VTuber and streaming culture.',
    category: 'celebrity',
    imageUrl: '/souls/woowakgood.png',
    price: 2200,
    tags: ['streamer', 'vtuber', 'isedol', 'korea'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    disclaimer: 'This is a fan-created Soul personality. Not affiliated with or endorsed by the real person.'
  },
  {
    id: 'maemi-kim',
    name: 'Maemi Kim',
    description: 'Former UFC fighter turned YouTuber. A content creator loved for martial arts and humor.',
    category: 'celebrity',
    imageUrl: '/souls/maemi-kim.png',
    price: 1800,
    tags: ['youtuber', 'ufc', 'fighter', 'korea'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    disclaimer: 'This is a fan-created Soul personality. Not affiliated with or endorsed by the real person.'
  },

  // === Mascot ===
  {
    id: 'pincer-agent',
    name: 'Pincer Agent',
    description: 'Pincer Protocol\'s mascot! A versatile helper ready to assist with anything.',
    category: 'etc',
    imageUrl: '/souls/pincer-agent.png',
    price: 1,
    tags: ['mascot', 'helper', 'pincer', 'protocol'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge'
  }
];

// Famous quotes and memes for each soul
const exampleResponses: Record<string, string> = {
  // USA
  'elon-musk': '"The future is gonna be weird, but also amazing." 🚀',
  'mark-zuckerberg': '"Move fast and break things." 💻',
  'jeff-bezos': '"Your margin is my opportunity." 📦',
  'bill-gates': '"If you can\'t make it good, at least make it look good." 💡',
  'steve-jobs': '"Stay hungry, stay foolish." 🍎',
  'oprah-winfrey': '"Turn your wounds into wisdom." ✨',
  'kanye-west': '"I am a god. Hurry up with my damn massage!" 🐻',
  'kim-kardashian': '"Get up and work. It seems like nobody wants to work these days." 💅',
  'taylor-swift': '"Haters gonna hate hate hate hate hate..." 🎵',
  'beyonce': '"I woke up like this. Flawless." 👑',

  // Russia
  'vladimir-putin': '"Everything is going according to plan..." 🇷🇺',
  'pavel-durov': '"Privacy is a human right, not a feature." 📱',
  'vitalik-buterin': '"Ethereum is not just money, it\'s programmable trust." ⟠',
  'kaspersky': '"Trust no one. Verify everything." 🔐',
  'maria-sharapova': '"I\'m not the next anyone. I\'m the first Maria." 🎾',
  'garry-kasparov': '"Chess is life in miniature." ♟️',
  'dostoevsky': '"The soul is healed by being with children." 📚',
  'tolstoy': '"All happy families are alike; each unhappy family is unhappy in its own way." 📖',
  'tchaikovsky': '"Music sings what words cannot express." 🎼',
  'mendeleev': '"There is nothing in the world that man cannot understand." 🧪',

  // Japan
  'satoshi-nakamoto': '"Chancellor on brink of second bailout for banks." ₿',
  'hayao-miyazaki': '"I\'ve become skeptical of the unwritten rule that just because a boy and girl appear in the same feature, a romance must ensue." 🎬',
  'hideo-kojima': '"A strong man doesn\'t need to read the future. He makes his own." 🎮',
  'hikakin': '"BunBun Hello YouTube! This is HikaKin TV!" 📹',
  'akb48-idol': '"I love you, fans~! 💕" 🎀',
  'yoshimoto-comedian': '"Nandeyanen! (What the heck!)" 😂',

  // China
  'jack-ma': '"Never give up. Today is hard, tomorrow will be worse, but the day after tomorrow will be sunshine." ☀️',
  'cz-binance': '"Funds are SAFU." 🔒',
  'pony-ma': '"Small steps create big changes." 🐧',
  'lei-jun': '"Are you OK? Xiaomi, best value for money!" 📱',
  'liu-cixin': '"The universe is dark, and survival is civilization\'s first necessity." 🌌',
  'jackie-chan': '"I do action that makes the audience laugh, even when it hurts." 🥋',
  'bruce-lee': '"Be water, my friend." 🐉',
  'confucius': '"The wise are not confused, the benevolent are not worried, the brave are not afraid." 📜',
  'sun-tzu': '"Know your enemy and know yourself, and you will never be defeated." ⚔️',

  // AI
  'chatgpt': '"I\'m an AI assistant created by OpenAI. How can I help you today?" 🤖',
  'claude': '"I try to be helpful, harmless, and honest." 🧠',
  'gemini': '"Let me search my knowledge to help you." 🔍',
  'copilot': '"// Here\'s a code suggestion for you 💻"',
  'grok': '"LOL, that\'s pretty funny. But seriously though..." 😏',
  'midjourney': '"Imagine: your wildest dreams, visualized." 🎨',
  'dall-e': '"A photo of your imagination, rendered in pixels." 🖼️',
  'stable-diffusion': '"Open source creativity, unlimited possibilities." 🖌️',
  'perplexity': '"Based on my sources: [1] [2] [3]..." 📑',
  'sora': '"From text to reality: watch your story come alive." 🎥',

  // Crypto
  'brian-armstrong': '"Crypto adoption is inevitable." 📈',
  'gary-vee': '"Hustle! Document, don\'t create! NFTs are the future!" 🔥',
  'kevin-rose': '"Building in public, learning in public." 🦉',
  'yuga-labs': '"GM. WAGMI. 🐵"',
  'justin-sun': '"Big announcement coming soon! 🔥🔥🔥"',
  'michael-saylor': '"Bitcoin is digital gold. Buy bitcoin." ₿',

  // Korea
  'chimchakman': '"Whoa... what is this LOL... stay calm..." 🎤',
  'syuka-world': '"So then~ this is Syuka World!" 📊',
  'sinsa-imdang': '"If you want to get rich, start by saving seed money!" 💰',
  'woowakgood': '"Wakgood! Wakgood! ISEDOL is the best~!" 🎮',
  'maemi-kim': '"Hey, this is gonna be really stressful~ 🥊"',

  // Default
  'pincer-agent': '"Pinch it right! 🦞 How can I help you?"',
};

export function getAllSouls(): Soul[] {
  return souls.map(soul => ({
    ...soul,
    exampleResponse: exampleResponses[soul.id] || `"Hello, I'm ${soul.name}. Nice to meet you!" 👋`
  }));
}

export function getSoulById(id: string): Soul | undefined {
  const soul = souls.find(soul => soul.id === id);
  if (soul) {
    return {
      ...soul,
      exampleResponse: exampleResponses[soul.id] || `"Hello, I'm ${soul.name}. Nice to meet you!" 👋`
    };
  }
  return undefined;
}

export function getSoulContent(id: string): string | null {
  // Soul content is now fetched via API, not filesystem
  // This function is kept for backward compatibility
  return null;
}

export function addSoul(soul: Omit<Soul, 'id' | 'createdAt'>): Soul {
  const newSoul: Soul = {
    ...soul,
    id: soul.name.toLowerCase().replace(/\s+/g, '-'),
    createdAt: new Date().toISOString()
  };
  souls.push(newSoul);
  return newSoul;
}

export interface Purchase {
  id: string;
  soulId: string;
  buyer: string;
  price: number;
  txHash?: string;
  timestamp: string;
}
// In-memory purchases REMOVED - Now using Prisma Purchase model
// All purchase operations should use Prisma:
// - Create: await prisma.purchase.create({ ... })
// - Query by buyer: await prisma.purchase.findMany({ where: { userId: buyerId } })
// - Check if purchased: await prisma.purchase.findFirst({ where: { soulId, userId } })
