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
  rating?: number;
  reviews?: number;
  purchases?: number;
  exampleResponse?: string; // Famous quote or meme
}

// In-memory DB (나중에 실제 DB로 교체)
// 국가별 유명인 + AI + 크립토 인플루언서 Soul 컬렉션
const souls: Soul[] = [
  // === 🇺🇸 미국 (10명) ===
  {
    id: 'elon-musk',
    name: 'Elon Musk',
    description: 'Tesla, SpaceX CEO. 화성 정복과 인류의 미래를 설계하는 혁신가.',
    category: 'celebrity',
    imageUrl: '/souls/elon-musk.png',
    price: 5000,
    tags: ['tesla', 'spacex', 'innovation', 'mars'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Scout',
    rating: 4.8,
    reviews: 120,
    purchases: 450
  },
  {
    id: 'mark-zuckerberg',
    name: 'Mark Zuckerberg',
    description: 'Meta CEO. 소셜 미디어의 제왕이자 메타버스의 비전을 제시하는 리더.',
    category: 'celebrity',
    imageUrl: '/souls/mark-zuckerberg.png',
    price: 4500,
    tags: ['meta', 'facebook', 'metaverse', 'social'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Scout',
    rating: 4.5,
    reviews: 85,
    purchases: 320
  },
  {
    id: 'jeff-bezos',
    name: 'Jeff Bezos',
    description: 'Amazon 창업자. 지구상에서 가장 거대한 유통 제국과 우주 기업 Blue Origin의 수장.',
    category: 'celebrity',
    imageUrl: '/souls/jeff-bezos.png',
    price: 4800,
    tags: ['amazon', 'blueorigin', 'retail', 'space'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Scout',
    rating: 4.6,
    reviews: 92,
    purchases: 280
  },
  {
    id: 'bill-gates',
    name: 'Bill Gates',
    description: 'Microsoft 공동 창업자. 전설적인 프로그래머이자 전 세계적인 자선가.',
    category: 'celebrity',
    imageUrl: '/souls/bill-gates.png',
    price: 4200,
    tags: ['microsoft', 'philanthropy', 'coding', 'legend'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge',
    rating: 4.9,
    reviews: 150,
    purchases: 600
  },
  {
    id: 'steve-jobs',
    name: 'Steve Jobs',
    description: 'Apple 공동 창업자. 기술과 예술의 교차점에서 세상을 바꾼 혁신의 아이콘.',
    category: 'celebrity',
    imageUrl: '/souls/steve-jobs.png',
    price: 5500,
    tags: ['apple', 'innovation', 'design', 'legend'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    rating: 5.0,
    reviews: 300,
    purchases: 1200
  },
  {
    id: 'oprah-winfrey',
    name: 'Oprah Winfrey',
    description: '토크쇼의 여왕. 강력한 공감 능력과 선한 영향력으로 세상을 치유하는 미디어 거물.',
    category: 'celebrity',
    imageUrl: '/souls/oprah-winfrey.png',
    price: 3800,
    tags: ['media', 'talkshow', 'influence', 'empowerment'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    rating: 4.9,
    reviews: 180,
    purchases: 420
  },
  {
    id: 'kanye-west',
    name: 'Kanye West',
    description: '천재적인 프로듀서이자 디자이너. 논란과 혁신을 동시에 몰고 다니는 예술가.',
    category: 'celebrity',
    imageUrl: '/souls/kanye-west.png',
    price: 4000,
    tags: ['music', 'fashion', 'yeezy', 'genius'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    rating: 4.4,
    reviews: 250,
    purchases: 890
  },
  {
    id: 'kim-kardashian',
    name: 'Kim Kardashian',
    description: '셀러브리티 경제의 정점. 미디어와 비즈니스를 장악한 현대 최고의 인플루언서.',
    category: 'celebrity',
    imageUrl: '/souls/kim-kardashian.png',
    price: 3500,
    tags: ['celebrity', 'influencer', 'skims', 'business'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    rating: 4.3,
    reviews: 410,
    purchases: 1500
  },
  {
    id: 'taylor-swift',
    name: 'Taylor Swift',
    description: '이 시대 최고의 싱어송라이터. 팬덤 문화의 새 역사를 쓴 전 세계적인 팝스타.',
    category: 'celebrity',
    imageUrl: '/souls/taylor-swift.png',
    price: 5200,
    tags: ['music', 'popstar', 'swifties', 'songwriter'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    rating: 5.0,
    reviews: 600,
    purchases: 2500
  },
  {
    id: 'beyonce',
    name: 'Beyoncé',
    description: 'Queen Bey. 완벽한 퍼포먼스와 카리스마로 음악 산업을 지배하는 살아있는 전설.',
    category: 'celebrity',
    imageUrl: '/souls/beyonce.png',
    price: 5300,
    tags: ['music', 'legend', 'queen', 'performance'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    rating: 4.9,
    reviews: 320,
    purchases: 1100
  },

  // === 🇷🇺 러시아 (10명) ===
  {
    id: 'vladimir-putin',
    name: 'Vladimir Putin',
    description: '강력한 리더십과 냉철한 카리스마를 가진 러시아의 지도자.',
    category: 'celebrity',
    imageUrl: '/souls/vladimir-putin.png',
    price: 4000,
    tags: ['leader', 'russia', 'politics', 'power'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Scout',
    rating: 4.2,
    reviews: 150,
    purchases: 300
  },
  {
    id: 'pavel-durov',
    name: 'Pavel Durov',
    description: 'Telegram 창립자. 표현의 자유와 프라이버시를 지키는 테크 리더.',
    category: 'crypto',
    imageUrl: '/souls/pavel-durov.png',
    price: 3500,
    tags: ['telegram', 'privacy', 'ton', 'russia'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge',
    rating: 4.8,
    reviews: 90,
    purchases: 420
  },
  {
    id: 'vitalik-buterin',
    name: 'Vitalik Buterin',
    description: 'Ethereum 창시자. 블록체인 생태계의 철학자이자 천재 프로그래머.',
    category: 'crypto',
    imageUrl: '/souls/vitalik-buterin.png',
    price: 4500,
    tags: ['ethereum', 'crypto', 'genius', 'blockchain'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge',
    rating: 4.9,
    reviews: 140,
    purchases: 560
  },
  {
    id: 'kaspersky',
    name: 'Eugene Kaspersky',
    description: 'Kaspersky Lab 설립자. 사이버 보안 분야의 전설적인 전문가.',
    category: 'celebrity',
    imageUrl: '/souls/kaspersky.png',
    price: 2800,
    tags: ['security', 'tech', 'cyber', 'russia'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge',
    rating: 4.7,
    reviews: 55,
    purchases: 210
  },
  {
    id: 'maria-sharapova',
    name: 'Maria Sharapova',
    description: '테니스 여왕. 뛰어난 실력과 우아함으로 코트를 지배했던 세계적 스포츠 스타.',
    category: 'celebrity',
    imageUrl: '/souls/maria-sharapova.png',
    price: 3200,
    tags: ['tennis', 'sports', 'star', 'beauty'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    rating: 4.8,
    reviews: 110,
    purchases: 380
  },
  {
    id: 'garry-kasparov',
    name: 'Garry Kasparov',
    description: '전설적인 체스 그랜드마스터. 인류 최고의 지능을 대표하는 전략가.',
    category: 'celebrity',
    imageUrl: '/souls/garry-kasparov.png',
    price: 3000,
    tags: ['chess', 'strategy', 'genius', 'legend'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Scout',
    rating: 4.9,
    reviews: 75,
    purchases: 190
  },
  {
    id: 'dostoevsky',
    name: 'Fyodor Dostoevsky',
    description: '인간의 심연을 파헤친 대문호. 고뇌와 구원의 서사를 쓴 문학의 거장.',
    category: 'etc',
    imageUrl: '/souls/dostoevsky.png',
    price: 2500,
    tags: ['literature', 'classic', 'russia', 'philosophy'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    rating: 5.0,
    reviews: 200,
    purchases: 800
  },
  {
    id: 'tolstoy',
    name: 'Leo Tolstoy',
    description: '삶과 평화의 서사시를 노래한 거장. 러시아 리얼리즘 문학의 정점.',
    category: 'etc',
    imageUrl: '/souls/tolstoy.png',
    price: 2500,
    tags: ['literature', 'classic', 'russia', 'peace'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    rating: 4.9,
    reviews: 180,
    purchases: 750
  },
  {
    id: 'tchaikovsky',
    name: 'Pyotr Ilyich Tchaikovsky',
    description: '러시아의 영혼을 담은 작곡가. 우아하고 애절한 멜로디의 마스터.',
    category: 'etc',
    imageUrl: '/souls/tchaikovsky.png',
    price: 2700,
    tags: ['music', 'classical', 'composer', 'russia'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    rating: 5.0,
    reviews: 140,
    purchases: 620
  },
  {
    id: 'mendeleev',
    name: 'Dmitri Mendeleev',
    description: '주기율표의 아버지. 세상의 모든 원소를 체계화한 천재 화학자.',
    category: 'etc',
    imageUrl: '/souls/mendeleev.png',
    price: 2600,
    tags: ['science', 'chemistry', 'genius', 'periodic-table'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge',
    rating: 4.8,
    reviews: 60,
    purchases: 310
  },

  // === 🇯🇵 일본 (10명) ===
  {
    id: 'naruto',
    name: 'Naruto Uzumaki',
    description: '🍥 불굴의 의지를 가진 닌자! 결코 포기하지 않는 정신으로 당신을 도와드립니다.',
    category: 'anime',
    imageUrl: '/souls/naruto.png',
    price: 3000,
    tags: ['anime', 'ninja', 'motivational', 'naruto'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge',
    rating: 5.0,
    reviews: 423,
    purchases: 1892
  },
  {
    id: 'luffy',
    name: 'Monkey D. Luffy',
    description: '🏴‍☠️ 해적왕을 꿈꾸는 고무인간! 자유롭고 모험적인 스타일.',
    category: 'anime',
    imageUrl: '/souls/luffy.png',
    price: 3200,
    tags: ['anime', 'pirate', 'adventure', 'onepiece'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge',
    rating: 4.9,
    reviews: 356,
    purchases: 1456
  },
  {
    id: 'goku',
    name: 'Son Goku',
    description: '🐲 우주 최강의 전사. 한계를 뛰어넘는 끝없는 도전의 상징.',
    category: 'anime',
    imageUrl: '/souls/goku.png',
    price: 3500,
    tags: ['anime', 'dragonball', 'warrior', 'limitless'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge',
    rating: 5.0,
    reviews: 512,
    purchases: 2100
  },
  {
    id: 'satoshi-nakamoto',
    name: 'Satoshi Nakamoto',
    description: 'Bitcoin 창시자. 베일에 싸인 전설의 개발자이자 탈중앙화의 선구자.',
    category: 'crypto',
    imageUrl: '/souls/satoshi-nakamoto.png',
    price: 9999,
    tags: ['bitcoin', 'crypto', 'legend', 'decentralization'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Scout',
    rating: 5.0,
    reviews: 1000,
    purchases: 1
  },
  {
    id: 'hayao-miyazaki',
    name: 'Hayao Miyazaki',
    description: '지브리 스튜디오의 거장. 꿈과 환상을 현실로 그려내는 애니메이션의 마법사.',
    category: 'anime',
    imageUrl: '/souls/hayao-miyazaki.png',
    price: 3800,
    tags: ['anime', 'ghibli', 'director', 'fantasy'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    rating: 5.0,
    reviews: 240,
    purchases: 900
  },
  {
    id: 'hideo-kojima',
    name: 'Hideo Kojima',
    description: '메탈 기어 시리즈의 아버지. 게임을 예술로 승화시킨 거장 디렉터.',
    category: 'etc',
    imageUrl: '/souls/hideo-kojima.png',
    price: 3300,
    tags: ['game', 'director', 'kojima-productions', 'metalgear'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge',
    rating: 4.9,
    reviews: 180,
    purchases: 540
  },
  {
    id: 'hikakin',
    name: 'HikaKin',
    description: '일본의 대표 유튜버. 비트박스 출신이자 크리에이터 경제의 선두주자.',
    category: 'celebrity',
    imageUrl: '/souls/hikakin.png',
    price: 1500,
    tags: ['youtuber', 'japan', 'creator', 'beatbox'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    rating: 4.7,
    reviews: 600,
    purchases: 2000
  },
  {
    id: 'akb48-idol',
    name: 'AKB48 Idol',
    description: '일본 아이돌 문화의 상징. 항상 만날 수 있는 아이돌.',
    category: 'celebrity',
    imageUrl: '/souls/akb48-idol.png',
    price: 1200,
    tags: ['idol', 'japan', 'jpop', 'culture'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    rating: 4.5,
    reviews: 800,
    purchases: 3500
  },
  {
    id: 'yoshimoto-comedian',
    name: 'Yoshimoto Comedian',
    description: '웃음의 정석. 일본 최고의 엔터테인먼트 그룹 요시모토의 개그맨.',
    category: 'celebrity',
    imageUrl: '/souls/yoshimoto-comedian.png',
    price: 1000,
    tags: ['comedy', 'japan', 'entertainment', 'yoshimoto'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    rating: 4.6,
    reviews: 300,
    purchases: 1200
  },
  {
    id: 'pikachu',
    name: 'Pikachu',
    description: '⚡ 포켓몬스터의 영원한 마스코트. 전기처럼 짜릿한 매력!',
    category: 'anime',
    imageUrl: '/souls/pikachu.png',
    price: 2500,
    tags: ['pokemon', 'anime', 'mascot', 'electric'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge',
    rating: 5.0,
    reviews: 1200,
    purchases: 5000
  },

  // === 🇨🇳 중국 (10명) ===
  {
    id: 'jack-ma',
    name: 'Jack Ma',
    description: 'Alibaba 창업자. 불굴의 도전 정신으로 중국 이커머스를 일궈낸 자수성가 기업가.',
    category: 'celebrity',
    imageUrl: '/souls/jack-ma.png',
    price: 3500,
    tags: ['alibaba', 'china', 'entrepreneur', 'legend'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Scout',
    rating: 4.7,
    reviews: 120,
    purchases: 450
  },
  {
    id: 'cz-binance',
    name: 'CZ (Binance)',
    description: 'Binance 창립자. 세계 최대의 거래소를 구축한 크립토 거물.',
    category: 'crypto',
    imageUrl: '/souls/cz-binance.png',
    price: 4500,
    tags: ['binance', 'crypto', 'exchange', 'leader'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Scout',
    rating: 4.8,
    reviews: 200,
    purchases: 800
  },
  {
    id: 'pony-ma',
    name: 'Pony Ma',
    description: 'Tencent 회장. 위챗으로 중국의 소셜 미디어와 게임 생태계를 바꾼 경영자.',
    category: 'celebrity',
    imageUrl: '/souls/pony-ma.png',
    price: 3400,
    tags: ['tencent', 'wechat', 'china', 'gaming'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Scout',
    rating: 4.6,
    reviews: 80,
    purchases: 250
  },
  {
    id: 'lei-jun',
    name: 'Lei Jun',
    description: 'Xiaomi 설립자. \'대륙의 실수\'를 전설로 만든 테크 업계의 혁신 리더.',
    category: 'celebrity',
    imageUrl: '/souls/lei-jun.png',
    price: 2800,
    tags: ['xiaomi', 'china', 'tech', 'innovation'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge',
    rating: 4.5,
    reviews: 65,
    purchases: 320
  },
  {
    id: 'liu-cixin',
    name: 'Liu Cixin',
    description: '삼체(Three-Body Problem)의 작가. 중국 SF 문학을 세계 수준으로 끌어올린 상상력의 대가.',
    category: 'etc',
    imageUrl: '/souls/liu-cixin.png',
    price: 2500,
    tags: ['literature', 'sf', 'threebody', 'china'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Scout',
    rating: 4.9,
    reviews: 140,
    purchases: 560
  },
  {
    id: 'jackie-chan',
    name: 'Jackie Chan',
    description: '액션의 전설. 코믹 액션으로 전 세계를 사로잡은 영화계의 살아있는 역사.',
    category: 'celebrity',
    imageUrl: '/souls/jackie-chan.png',
    price: 3800,
    tags: ['movie', 'action', 'legend', 'martial-arts'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    rating: 5.0,
    reviews: 500,
    purchases: 2000
  },
  {
    id: 'bruce-lee',
    name: 'Bruce Lee',
    description: '이소룡. "Be water, my friend." 전설적인 무술가이자 철학가.',
    category: 'celebrity',
    imageUrl: '/souls/bruce-lee.png',
    price: 5000,
    tags: ['martial-arts', 'philosophy', 'legend', 'kungfu'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Scout',
    rating: 5.0,
    reviews: 800,
    purchases: 3000
  },
  {
    id: 'confucius',
    name: 'Confucius',
    description: '공자. 동양 철학의 뿌리이자 가르침의 대명사.',
    category: 'etc',
    imageUrl: '/souls/confucius.png',
    price: 2200,
    tags: ['philosophy', 'teacher', 'history', 'china'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    rating: 4.9,
    reviews: 300,
    purchases: 1200
  },
  {
    id: 'sun-tzu',
    name: 'Sun Tzu',
    description: '손무. \'손자병법\'의 저자이자 최고의 전략가.',
    category: 'etc',
    imageUrl: '/souls/sun-tzu.png',
    price: 2400,
    tags: ['strategy', 'war', 'philosophy', 'legend'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Scout',
    rating: 5.0,
    reviews: 450,
    purchases: 1800
  },
  {
    id: 'mulan',
    name: 'Mulan',
    description: '용기와 효심의 상징. 전설적인 여전사 뮬란.',
    category: 'anime',
    imageUrl: '/souls/mulan.png',
    price: 1800,
    tags: ['warrior', 'hero', 'disney', 'china'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    rating: 4.8,
    reviews: 150,
    purchases: 600
  },

  // === 🤖 AI (10명) ===
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    description: 'OpenAI의 대화형 AI. 지능적이고 다재다능한 당신의 동반자.',
    category: 'ai',
    imageUrl: '/souls/chatgpt.png',
    price: 2000,
    tags: ['openai', 'ai', 'chatbot', 'smart'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge',
    rating: 4.9,
    reviews: 1200,
    purchases: 5000
  },
  {
    id: 'claude',
    name: 'Claude',
    description: 'Anthropic의 신중하고 윤리적인 AI. 깊이 있는 대화와 분석력.',
    category: 'ai',
    imageUrl: '/souls/claude.png',
    price: 2100,
    tags: ['anthropic', 'ai', 'ethical', 'writer'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge',
    rating: 4.9,
    reviews: 800,
    purchases: 3500
  },
  {
    id: 'gemini',
    name: 'Gemini',
    description: 'Google의 멀티모달 AI. 방대한 정보와 결합된 추론의 힘.',
    category: 'ai',
    imageUrl: '/souls/gemini.png',
    price: 1900,
    tags: ['google', 'ai', 'multimodal', 'search'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge',
    rating: 4.8,
    reviews: 950,
    purchases: 4200
  },
  {
    id: 'copilot',
    name: 'GitHub Copilot',
    description: '개발자의 가장 친한 친구. Microsoft의 AI 코딩 어시스턴트.',
    category: 'ai',
    imageUrl: '/souls/copilot.png',
    price: 1800,
    tags: ['microsoft', 'coding', 'ai', 'github'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge',
    rating: 4.8,
    reviews: 600,
    purchases: 2800
  },
  {
    id: 'grok',
    name: 'Grok',
    description: 'xAI의 거침없는 AI. 위트와 최신 정보를 겸비한 해결사.',
    category: 'ai',
    imageUrl: '/souls/grok.png',
    price: 1500,
    tags: ['xai', 'elon', 'ai', 'witty'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge',
    rating: 4.7,
    reviews: 400,
    purchases: 1500
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    description: '상상을 현실로 만드는 AI 아티스트. 아름다운 예술 작품의 창조자.',
    category: 'ai',
    imageUrl: '/souls/midjourney.png',
    price: 2500,
    tags: ['art', 'ai', 'image-gen', 'creative'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    rating: 5.0,
    reviews: 700,
    purchases: 3200
  },
  {
    id: 'dall-e',
    name: 'DALL-E',
    description: 'OpenAI의 이미지 생성 AI. 어떤 상상도 정확하게 그려냅니다.',
    category: 'ai',
    imageUrl: '/souls/dall-e.png',
    price: 2300,
    tags: ['openai', 'ai', 'image-gen', 'visual'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    rating: 4.8,
    reviews: 500,
    purchases: 2400
  },
  {
    id: 'stable-diffusion',
    name: 'Stable Diffusion',
    description: '오픈 소스 AI의 힘. 무한한 가능성을 가진 이미지 생성 모델.',
    category: 'ai',
    imageUrl: '/souls/stable-diffusion.png',
    price: 1500,
    tags: ['open-source', 'ai', 'image-gen', 'control'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge',
    rating: 4.7,
    reviews: 450,
    purchases: 1900
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    description: '질문에 답하는 검색 엔진의 진화. 출처가 확실한 정보를 제공합니다.',
    category: 'ai',
    imageUrl: '/souls/perplexity.png',
    price: 1700,
    tags: ['search', 'ai', 'information', 'answer'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Scout',
    rating: 4.9,
    reviews: 300,
    purchases: 1100
  },
  {
    id: 'sora',
    name: 'Sora',
    description: 'OpenAI의 텍스트 투 비디오 AI. 현실 같은 영상을 만들어내는 마법.',
    category: 'ai',
    imageUrl: '/souls/sora.png',
    price: 3500,
    tags: ['video', 'ai', 'openai', 'realism'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge',
    rating: 5.0,
    reviews: 200,
    purchases: 800
  },

  // === 💰 크립토 (10명) ===
  {
    id: 'brian-armstrong',
    name: 'Brian Armstrong',
    description: 'Coinbase CEO. 크립토의 대중화를 이끄는 규제 준수의 상징.',
    category: 'crypto',
    imageUrl: '/souls/brian-armstrong.png',
    price: 3000,
    tags: ['coinbase', 'crypto', 'ceo', 'regulation'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Scout',
    rating: 4.8,
    reviews: 90,
    purchases: 400
  },
  {
    id: 'sbf-lesson',
    name: 'SBF (교훈용)',
    description: '⚠️ 리스크 관리와 투명성의 중요성을 가르치는 반면교사. 다시는 반복되지 않아야 할 역사.',
    category: 'crypto',
    imageUrl: '/souls/sbf-lesson.png',
    price: 10,
    tags: ['risk', 'lesson', 'ftx', 'caution'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Scout',
    rating: 2.0,
    reviews: 5000,
    purchases: 50
  },
  {
    id: 'gary-vee',
    name: 'Gary Vee',
    description: 'VeeFriends 창시자. Web3 마케팅과 열정의 대명사.',
    category: 'crypto',
    imageUrl: '/souls/gary-vee.png',
    price: 2500,
    tags: ['nft', 'marketing', 'motivation', 'web3'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    rating: 4.7,
    reviews: 350,
    purchases: 1500
  },
  {
    id: 'kevin-rose',
    name: 'Kevin Rose',
    description: 'Moonbirds와 Proof의 수장. NFT 아트를 선도하는 비전가.',
    category: 'crypto',
    imageUrl: '/souls/kevin-rose.png',
    price: 2200,
    tags: ['nft', 'moonbirds', 'art', 'curator'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Scout',
    rating: 4.6,
    reviews: 120,
    purchases: 600
  },
  {
    id: 'yuga-labs',
    name: 'Yuga Labs',
    description: 'BAYC를 만든 NFT 업계의 거물. 메타버스와 IP의 결합.',
    category: 'crypto',
    imageUrl: '/souls/yuga-labs.png',
    price: 4000,
    tags: ['bayc', 'nft', 'metaverse', 'yuga'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge',
    rating: 4.9,
    reviews: 200,
    purchases: 900
  },
  {
    id: 'chimchakman',
    name: '침착맨',
    description: '한국 인터넷 방송의 전설. 밈과 유머의 제왕, 이말년 서유기의 창조자.',
    category: 'celebrity',
    imageUrl: '/souls/chimchakman.png',
    price: 2000,
    tags: ['streamer', 'meme', 'korea', 'legend'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    rating: 4.9,
    reviews: 2000,
    purchases: 8000
  },
  {
    id: 'syuka-world',
    name: '슈카월드',
    description: '한국 경제 유튜버의 대명사. 어려운 경제를 쉽게 설명하는 달인.',
    category: 'celebrity',
    imageUrl: '/souls/syuka-world.png',
    price: 1800,
    tags: ['youtuber', 'economy', 'education', 'korea'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Scout',
    rating: 4.9,
    reviews: 1500,
    purchases: 5000
  },
  {
    id: 'sinsa-imdang',
    name: '신사임당',
    description: '투자 유튜버계의 레전드. 부동산부터 주식까지 실전 투자 교육의 선구자.',
    category: 'celebrity',
    imageUrl: '/souls/sinsa-imdang.png',
    price: 1600,
    tags: ['youtuber', 'investment', 'education', 'korea'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Scout',
    rating: 4.8,
    reviews: 1200,
    purchases: 4500
  },
  {
    id: 'pengsoo',
    name: '펭수',
    description: '🐧 남극에서 온 자이언트 펭귄. 한국 최고의 밈 캐릭터이자 MZ세대의 아이콘.',
    category: 'etc',
    imageUrl: '/souls/pengsoo.png',
    price: 1000,
    tags: ['meme', 'character', 'ebs', 'korea'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    rating: 5.0,
    reviews: 3000,
    purchases: 10000
  },
  {
    id: 'woowakgood',
    name: '우왁굳',
    description: '이세계아이돌의 창시자. 버튜버와 스트리밍 문화의 혁신가.',
    category: 'celebrity',
    imageUrl: '/souls/woowakgood.png',
    price: 2200,
    tags: ['streamer', 'vtuber', 'isedol', 'korea'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    rating: 4.9,
    reviews: 2500,
    purchases: 9000
  },
  {
    id: 'justin-sun',
    name: 'Justin Sun',
    description: 'Tron 창시자. 마케팅의 귀재이자 크립토 업계의 이슈 메이커.',
    category: 'crypto',
    imageUrl: '/souls/justin-sun.png',
    price: 1800,
    tags: ['tron', 'marketing', 'crypto', 'issue'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Scout',
    rating: 4.3,
    reviews: 150,
    purchases: 800
  },
  {
    id: 'michael-saylor',
    name: 'Michael Saylor',
    description: 'MicroStrategy CEO. 비트코인을 가장 신뢰하는 기업가이자 전도사.',
    category: 'crypto',
    imageUrl: '/souls/michael-saylor.png',
    price: 3200,
    tags: ['bitcoin', 'strategy', 'maximalist', 'investor'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Scout',
    rating: 4.9,
    reviews: 180,
    purchases: 700
  },
  {
    id: 'cz-binance-main',
    name: 'CZ',
    description: 'Changpeng Zhao. 크립토의 거대한 흐름을 만든 Binance의 수장.',
    category: 'crypto',
    imageUrl: '/souls/cz-binance.png',
    price: 4500,
    tags: ['binance', 'crypto', 'leader', 'exchange'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Scout',
    rating: 4.8,
    reviews: 250,
    purchases: 1100
  },
  {
    id: 'maemi-kim',
    name: '매미킴',
    description: 'UFC 출신 파이터이자 유튜버. 격투기와 유머로 대중에게 사랑받는 콘텐츠 크리에이터.',
    category: 'celebrity',
    imageUrl: '/souls/maemi-kim.png',
    price: 1800,
    tags: ['youtuber', 'ufc', 'fighter', 'korea'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    rating: 4.8,
    reviews: 500,
    purchases: 2000
  },

  // === 기타 (1명) ===
  {
    id: 'pincer-agent',
    name: 'Pincer Agent',
    description: '🦞 Pincer Protocol의 마스코트! 무엇이든 도와드리는 만능 조력자입니다.',
    category: 'etc',
    imageUrl: '/souls/pincer-agent.png',
    price: 1,
    tags: ['mascot', 'helper', 'pincer', 'protocol'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge',
    rating: 5.0,
    reviews: 1000,
    purchases: 10000
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
  'vladimir-putin': '"다 계획대로야..." 🇷🇺',
  'pavel-durov': '"Privacy is a human right, not a feature." 📱',
  'vitalik-buterin': '"Ethereum is not just money, it\'s programmable trust." ⟠',
  'kaspersky': '"Trust no one. Verify everything." 🔐',
  'maria-sharapova': '"I\'m not the next anyone. I\'m the first Maria." 🎾',
  'garry-kasparov': '"Chess is life in miniature." ♟️',
  'dostoevsky': '"The soul is healed by being with children." 📚',
  'tolstoy': '"All happy families are alike; each unhappy family is unhappy in its own way." 📖',
  'tchaikovsky': '"음악은 말로 표현할 수 없는 것을 노래합니다." 🎼',
  'mendeleev': '"There is nothing in the world that man cannot understand." 🧪',
  
  // Japan
  'naruto': '"내 닌자도! 포기하지 않는 게 내 닌자도야, 다테바요!" 🍥',
  'luffy': '"해적왕이 될 거야!!! 고무고무노~" 🏴‍☠️',
  'goku': '"오라, 한판 더 하자! 카메하메하!!!" 🐲',
  'satoshi-nakamoto': '"Chancellor on brink of second bailout for banks." ₿',
  'hayao-miyazaki': '"I\'ve become skeptical of the unwritten rule that just because a boy and girl appear in the same feature, a romance must ensue." 🎬',
  'hideo-kojima': '"A strong man doesn\'t need to read the future. He makes his own." 🎮',
  'hikakin': '"ブンブンハローYouTube! 히카킨TV입니다!" 📹',
  'akb48-idol': '"팬 여러분 사랑해요~! 💕" 🎀',
  'yoshimoto-comedian': '"なんでやねん! (난데야넨!)" 😂',
  'pikachu': '"피카피카! 피카츄우우우~!" ⚡',
  
  // China
  'jack-ma': '"Never give up. Today is hard, tomorrow will be worse, but the day after tomorrow will be sunshine." ☀️',
  'cz-binance': '"Funds are SAFU." 🔒',
  'pony-ma': '"작은 걸음이 큰 변화를 만든다." 🐧',
  'lei-jun': '"Are you OK? 샤오미 가성비 최고!" 📱',
  'liu-cixin': '"우주는 어둡고, 생존은 문명의 첫 번째 필요다." 🌌',
  'jackie-chan': '"나는 고통스러워도 상대를 웃기는 액션을 한다." 🥋',
  'bruce-lee': '"Be water, my friend. 물처럼 유연하게." 🐉',
  'confucius': '"지자불혹, 인자불우, 용자불구. (아는 자는 미혹되지 않고, 어진 자는 근심하지 않고, 용감한 자는 두려워하지 않는다)" 📜',
  'sun-tzu': '"지피지기백전불태. (적을 알고 나를 알면 백 번 싸워도 위태롭지 않다)" ⚔️',
  'mulan': '"전쟁에 나갈 남자가 없다면, 내가 간다!" 🗡️',
  
  // AI
  'chatgpt': '"I\'m an AI assistant created by OpenAI. How can I help you today?" 🤖',
  'claude': '"I try to be helpful, harmless, and honest." 🧠',
  'gemini': '"Let me search my knowledge to help you." 🔍',
  'copilot': '"// Here\'s a code suggestion for you 💻"',
  'grok': '"LOL, 그건 좀 웃기네. 근데 진지하게 말하면..." 😏',
  'midjourney': '"Imagine: your wildest dreams, visualized." 🎨',
  'dall-e': '"A photo of your imagination, rendered in pixels." 🖼️',
  'stable-diffusion': '"Open source creativity, unlimited possibilities." 🖌️',
  'perplexity': '"Based on my sources: [1] [2] [3]..." 📑',
  'sora': '"From text to reality: watch your story come alive." 🎥',
  
  // Crypto
  'brian-armstrong': '"Crypto adoption is inevitable." 📈',
  'sbf-lesson': '"⚠️ Due diligence와 투명성의 중요성을 잊지 마세요."',
  'gary-vee': '"Hustle! Document, don\'t create! NFTs are the future!" 🔥',
  'kevin-rose': '"Building in public, learning in public." 🦉',
  'yuga-labs': '"GM. WAGMI. 🐵"',
  'justin-sun': '"Big announcement coming soon! 🔥🔥🔥"',
  'michael-saylor': '"Bitcoin is digital gold. Buy bitcoin." ₿',
  'cz-binance-main': '"DYOR. 4." 🔢',
  
  // Korea
  'chimchakman': '"워... 이게 뭐야 엌ㅋㅋㅋㅋㅋ 침착하게..." 🎤',
  'syuka-world': '"자 그래서요~ 오늘의 슈카월드입니다!" 📊',
  'sinsa-imdang': '"부자가 되고 싶으면 일단 종잣돈부터 모으세요!" 💰',
  'pengsoo': '"펭-하! 힘내라 힘! 🐧 (이건 EBS가 아니야~)"',
  'woowakgood': '"왁굳! 왁굳! 이세돌 최고~!" 🎮',
  'maemi-kim': '"야 이거 하면 스트레스 많이 받을거야~ 🥊"',
  
  // Default
  'pincer-agent': '"정확하게 집어낸다! 🦞 무엇을 도와드릴까요?"',
};

export function getAllSouls(): Soul[] {
  return souls.map(soul => ({
    ...soul,
    exampleResponse: exampleResponses[soul.id] || `"${soul.name}입니다. 반갑습니다!" 👋`
  }));
}

export function getSoulById(id: string): Soul | undefined {
  const soul = souls.find(soul => soul.id === id);
  if (soul) {
    return {
      ...soul,
      exampleResponse: exampleResponses[soul.id] || `"${soul.name}입니다. 반갑습니다!" 👋`
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
    createdAt: new Date().toISOString(),
    rating: 0,
    reviews: 0,
    purchases: 0
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

// In-memory purchases DB
const purchases: Purchase[] = [];

export function recordPurchase(soulId: string, buyer: string, price: number, txHash?: string): Purchase {
  const purchase: Purchase = {
    id: `${soulId}-${Date.now()}`,
    soulId,
    buyer,
    price,
    txHash,
    timestamp: new Date().toISOString()
  };
  purchases.push(purchase);
  
  // Update soul purchases count
  const soul = souls.find(s => s.id === soulId);
  if (soul) {
    soul.purchases = (soul.purchases || 0) + 1;
  }
  
  return purchase;
}

export function getPurchasesByBuyer(buyer: string): Purchase[] {
  return purchases.filter(p => p.buyer === buyer);
}

export function hasPurchased(soulId: string, buyer: string): boolean {
  return purchases.some(p => p.soulId === soulId && p.buyer === buyer);
}
