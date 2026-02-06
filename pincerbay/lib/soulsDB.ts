import fs from 'fs';
import path from 'path';

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
}

// Workspace souls directory
const SOULS_DIR = path.join(process.cwd(), '..', '..', 'souls');

// In-memory DB (?˜ì¤‘???¤ì œ DBë¡?êµì²´)
// êµ??ë³?? ëª…??+ AI + ?¬ë¦½???¸í”Œë£¨ì–¸??Soul ì»¬ë ‰??const souls: Soul[] = [
  // === ?‡º?‡¸ ë¯¸êµ­ (10ëª? ===
  {
    id: 'elon-musk',
    name: 'Elon Musk',
    description: 'Tesla, SpaceX CEO. ?”ì„± ?•ë³µê³??¸ë¥˜??ë¯¸ëž˜ë¥??¤ê³„?˜ëŠ” ?ì‹ ê°€.',
    category: 'celebrity',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Elon+Musk&backgroundColor=b6e3f4',
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
    description: 'Meta CEO. ?Œì…œ ë¯¸ë””?´ì˜ ?œì™•?´ìž ë©”í?ë²„ìŠ¤??ë¹„ì „???œì‹œ?˜ëŠ” ë¦¬ë”.',
    category: 'celebrity',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Mark+Zuckerberg&backgroundColor=b6e3f4',
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
    description: 'Amazon ì°½ì—…?? ì§€êµ¬ìƒ?ì„œ ê°€??ê±°ë???? í†µ ?œêµ­ê³??°ì£¼ ê¸°ì—… Blue Origin???˜ìž¥.',
    category: 'celebrity',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Jeff+Bezos&backgroundColor=b6e3f4',
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
    description: 'Microsoft ê³µë™ ì°½ì—…?? ?„ì„¤?ì¸ ?„ë¡œê·¸ëž˜ë¨¸ì´?????¸ê³„?ì¸ ?ì„ ê°€.',
    category: 'celebrity',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Bill+Gates&backgroundColor=b6e3f4',
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
    description: 'Apple ê³µë™ ì°½ì—…?? ê¸°ìˆ ê³??ˆìˆ ??êµì°¨?ì—???¸ìƒ??ë°”ê¾¼ ?ì‹ ???„ì´ì½?',
    category: 'celebrity',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Steve+Jobs&backgroundColor=b6e3f4',
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
    description: '? í¬?¼ì˜ ?¬ì™•. ê°•ë ¥??ê³µê° ?¥ë ¥ê³?? í•œ ?í–¥?¥ìœ¼ë¡??¸ìƒ??ì¹˜ìœ ?˜ëŠ” ë¯¸ë””??ê±°ë¬¼.',
    category: 'celebrity',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Oprah+Winfrey&backgroundColor=b6e3f4',
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
    description: 'ì²œìž¬?ì¸ ?„ë¡œ?€?œì´???”ìž?´ë„ˆ. ?¼ë?ê³??ì‹ ???™ì‹œ??ëª°ê³  ?¤ë‹ˆ???ˆìˆ ê°€.',
    category: 'celebrity',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Kanye+West&backgroundColor=b6e3f4',
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
    description: '?€?¬ë¸Œë¦¬í‹° ê²½ì œ???•ì . ë¯¸ë””?´ì? ë¹„ì¦ˆ?ˆìŠ¤ë¥??¥ì•…???„ë? ìµœê³ ???¸í”Œë£¨ì–¸??',
    category: 'celebrity',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Kim+Kardashian&backgroundColor=b6e3f4',
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
    description: '???œë? ìµœê³ ???±ì–´?¡ë¼?´í„°. ?¬ë¤ ë¬¸í™”??????‚¬ë¥??????¸ê³„?ì¸ ?ìŠ¤?€.',
    category: 'celebrity',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Taylor+Swift&backgroundColor=b6e3f4',
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
    name: 'BeyoncÃ©',
    description: 'Queen Bey. ?„ë²½???¼í¬ë¨¼ìŠ¤?€ ì¹´ë¦¬?¤ë§ˆë¡??Œì•… ?°ì—…??ì§€ë°°í•˜???´ì•„?ˆëŠ” ?„ì„¤.',
    category: 'celebrity',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Beyonce&backgroundColor=b6e3f4',
    price: 5300,
    tags: ['music', 'legend', 'queen', 'performance'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    rating: 4.9,
    reviews: 320,
    purchases: 1100
  },

  // === ?‡·?‡º ?¬ì‹œ??(10ëª? ===
  {
    id: 'vladimir-putin',
    name: 'Vladimir Putin',
    description: 'ê°•ë ¥??ë¦¬ë”??³¼ ?‰ì² ??ì¹´ë¦¬?¤ë§ˆë¥?ê°€ì§??¬ì‹œ?„ì˜ ì§€?„ìž.',
    category: 'celebrity',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Vladimir+Putin&backgroundColor=b6e3f4',
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
    description: 'Telegram ì°½ë¦½?? ?œí˜„???ìœ ?€ ?„ë¼?´ë²„?œë? ì§€?¤ëŠ” ?Œí¬ ë¦¬ë”.',
    category: 'crypto',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Pavel+Durov&backgroundColor=b6e3f4',
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
    description: 'Ethereum ì°½ì‹œ?? ë¸”ë¡ì²´ì¸ ?íƒœê³„ì˜ ì² í•™?ì´??ì²œìž¬ ?„ë¡œê·¸ëž˜ë¨?',
    category: 'crypto',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Vitalik+Buterin&backgroundColor=b6e3f4',
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
    description: 'Kaspersky Lab ?¤ë¦½?? ?¬ì´ë²?ë³´ì•ˆ ë¶„ì•¼???„ì„¤?ì¸ ?„ë¬¸ê°€.',
    category: 'celebrity',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Kaspersky&backgroundColor=b6e3f4',
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
    description: '?Œë‹ˆ???¬ì™•. ?°ì–´???¤ë ¥ê³??°ì•„?¨ìœ¼ë¡?ì½”íŠ¸ë¥?ì§€ë°°í–ˆ???¸ê³„???¤í¬ì¸??¤í?.',
    category: 'celebrity',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Maria+Sharapova&backgroundColor=b6e3f4',
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
    description: '?„ì„¤?ì¸ ì²´ìŠ¤ ê·¸ëžœ?œë§ˆ?¤í„°. ?¸ë¥˜ ìµœê³ ??ì§€?¥ì„ ?€?œí•˜???„ëžµê°€.',
    category: 'celebrity',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Garry+Kasparov&backgroundColor=b6e3f4',
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
    description: '?¸ê°„???¬ì—°???Œí—¤ì¹??€ë¬¸í˜¸. ê³ ë‡Œ?€ êµ¬ì›???œì‚¬ë¥???ë¬¸í•™??ê±°ìž¥.',
    category: 'etc',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Dostoevsky&backgroundColor=b6e3f4',
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
    description: '?¶ê³¼ ?‰í™”???œì‚¬?œë? ?¸ëž˜??ê±°ìž¥. ?¬ì‹œ??ë¦¬ì–¼ë¦¬ì¦˜ ë¬¸í•™???•ì .',
    category: 'etc',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Tolstoy&backgroundColor=b6e3f4',
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
    description: '?¬ì‹œ?„ì˜ ?í˜¼???´ì? ?‘ê³¡ê°€. ?°ì•„?˜ê³  ? ì ˆ??ë©œë¡œ?”ì˜ ë§ˆìŠ¤??',
    category: 'etc',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Tchaikovsky&backgroundColor=b6e3f4',
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
    description: 'ì£¼ê¸°?¨í‘œ???„ë²„ì§€. ?¸ìƒ??ëª¨ë“  ?ì†Œë¥?ì²´ê³„?”í•œ ì²œìž¬ ?”í•™??',
    category: 'etc',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Mendeleev&backgroundColor=b6e3f4',
    price: 2600,
    tags: ['science', 'chemistry', 'genius', 'periodic-table'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge',
    rating: 4.8,
    reviews: 60,
    purchases: 310
  },

  // === ?‡¯?‡µ ?¼ë³¸ (10ëª? ===
  {
    id: 'naruto',
    name: 'Naruto Uzumaki',
    description: '?¥ ë¶ˆêµ´???˜ì?ë¥?ê°€ì§??Œìž! ê²°ì½” ?¬ê¸°?˜ì? ?ŠëŠ” ?•ì‹ ?¼ë¡œ ?¹ì‹ ???„ì??œë¦½?ˆë‹¤.',
    category: 'anime',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Naruto&backgroundColor=b6e3f4',
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
    description: '?´?â˜ ï¸??´ì ?•ì„ ê¿ˆê¾¸??ê³ ë¬´?¸ê°„! ?ìœ ë¡?³  ëª¨í—˜?ì¸ ?¤í???',
    category: 'anime',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Luffy&backgroundColor=b6e3f4',
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
    description: '?² ?°ì£¼ ìµœê°•???„ì‚¬. ?œê³„ë¥??°ì–´?˜ëŠ” ?ì—†???„ì „???ì§•.',
    category: 'anime',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Goku&backgroundColor=b6e3f4',
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
    description: 'Bitcoin ì°½ì‹œ?? ë² ì¼???¸ì¸ ?„ì„¤??ê°œë°œ?ì´???ˆì¤‘?™í™”??? êµ¬??',
    category: 'crypto',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Satoshi&backgroundColor=b6e3f4',
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
    description: 'ì§€ë¸Œë¦¬ ?¤íŠœ?”ì˜¤??ê±°ìž¥. ê¿ˆê³¼ ?˜ìƒ???„ì‹¤ë¡?ê·¸ë ¤?´ëŠ” ? ë‹ˆë©”ì´?˜ì˜ ë§ˆë²•??',
    category: 'anime',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Miyazaki&backgroundColor=b6e3f4',
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
    description: 'ë©”íƒˆ ê¸°ì–´ ?œë¦¬ì¦ˆì˜ ?„ë²„ì§€. ê²Œìž„???ˆìˆ ë¡??¹í™”?œí‚¨ ê±°ìž¥ ?”ë ‰??',
    category: 'etc',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Kojima&backgroundColor=b6e3f4',
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
    description: '?¼ë³¸???€??? íŠœë²? ë¹„íŠ¸ë°•ìŠ¤ ì¶œì‹ ?´ìž ?¬ë¦¬?ì´??ê²½ì œ??? ë‘ì£¼ìž.',
    category: 'celebrity',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=HikaKin&backgroundColor=b6e3f4',
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
    description: '?¼ë³¸ ?„ì´??ë¬¸í™”???ì§•. ??ƒ ë§Œë‚  ???ˆëŠ” ?„ì´??',
    category: 'celebrity',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=AKB48&backgroundColor=b6e3f4',
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
    description: '?ƒìŒ???•ì„. ?¼ë³¸ ìµœê³ ???”í„°?Œì¸ë¨¼íŠ¸ ê·¸ë£¹ ?”ì‹œëª¨í† ??ê°œê·¸ë§?',
    category: 'celebrity',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Yoshimoto&backgroundColor=b6e3f4',
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
    description: '???¬ì¼“ëª¬ìŠ¤?°ì˜ ?ì›??ë§ˆìŠ¤ì½”íŠ¸. ?„ê¸°ì²˜ëŸ¼ ì§œë¦¿??ë§¤ë ¥!',
    category: 'anime',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Pikachu&backgroundColor=b6e3f4',
    price: 2500,
    tags: ['pokemon', 'anime', 'mascot', 'electric'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge',
    rating: 5.0,
    reviews: 1200,
    purchases: 5000
  },

  // === ?‡¨?‡³ ì¤‘êµ­ (10ëª? ===
  {
    id: 'jack-ma',
    name: 'Jack Ma',
    description: 'Alibaba ì°½ì—…?? ë¶ˆêµ´???„ì „ ?•ì‹ ?¼ë¡œ ì¤‘êµ­ ?´ì»¤ë¨¸ìŠ¤ë¥??¼ê¶ˆ???ìˆ˜?±ê? ê¸°ì—…ê°€.',
    category: 'celebrity',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Jack+Ma&backgroundColor=b6e3f4',
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
    description: 'Binance ì°½ë¦½?? ?¸ê³„ ìµœë???ê±°ëž˜?Œë? êµ¬ì¶•???¬ë¦½??ê±°ë¬¼.',
    category: 'crypto',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=CZ&backgroundColor=b6e3f4',
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
    description: 'Tencent ?Œìž¥. ?„ì±—?¼ë¡œ ì¤‘êµ­???Œì…œ ë¯¸ë””?´ì? ê²Œìž„ ?íƒœê³„ë? ë°”ê¾¼ ê²½ì˜??',
    category: 'celebrity',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Pony+Ma&backgroundColor=b6e3f4',
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
    description: 'Xiaomi ?¤ë¦½?? \'?€ë¥™ì˜ ?¤ìˆ˜\'ë¥??„ì„¤ë¡?ë§Œë“  ?Œí¬ ?…ê³„???ì‹  ë¦¬ë”.',
    category: 'celebrity',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Lei+Jun&backgroundColor=b6e3f4',
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
    description: '?¼ì²´(Three-Body Problem)???‘ê?. ì¤‘êµ­ SF ë¬¸í•™???¸ê³„ ?˜ì??¼ë¡œ ?Œì–´?¬ë¦° ?ìƒ?¥ì˜ ?€ê°€.',
    category: 'etc',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Liu+Cixin&backgroundColor=b6e3f4',
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
    description: '?¡ì…˜???„ì„¤. ì½”ë? ?¡ì…˜?¼ë¡œ ???¸ê³„ë¥??¬ë¡œ?¡ì? ?í™”ê³„ì˜ ?´ì•„?ˆëŠ” ??‚¬.',
    category: 'celebrity',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Jackie+Chan&backgroundColor=b6e3f4',
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
    description: '?´ì†Œë£? "Be water, my friend." ?„ì„¤?ì¸ ë¬´ìˆ ê°€?´ìž ì² í•™ê°€.',
    category: 'celebrity',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Bruce+Lee&backgroundColor=b6e3f4',
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
    description: 'ê³µìž. ?™ì–‘ ì² í•™??ë¿Œë¦¬?´ìž ê°€ë¥´ì¹¨???€ëª…ì‚¬.',
    category: 'etc',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Confucius&backgroundColor=b6e3f4',
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
    description: '?ë¬´. \'?ìžë³‘ë²•\'???€?ì´??ìµœê³ ???„ëžµê°€.',
    category: 'etc',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Sun+Tzu&backgroundColor=b6e3f4',
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
    description: '?©ê¸°?€ ?¨ì‹¬???ì§•. ?„ì„¤?ì¸ ?¬ì „??ë®¬ë?.',
    category: 'anime',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Mulan&backgroundColor=b6e3f4',
    price: 1800,
    tags: ['warrior', 'hero', 'disney', 'china'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    rating: 4.8,
    reviews: 150,
    purchases: 600
  },

  // === ?¤– AI (10ëª? ===
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    description: 'OpenAI???€?”í˜• AI. ì§€?¥ì ?´ê³  ?¤ìž¬?¤ëŠ¥???¹ì‹ ???™ë°˜??',
    category: 'ai',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=ChatGPT&backgroundColor=b6e3f4',
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
    description: 'Anthropic??? ì¤‘?˜ê³  ?¤ë¦¬?ì¸ AI. ê¹Šì´ ?ˆëŠ” ?€?”ì? ë¶„ì„??',
    category: 'ai',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Claude&backgroundColor=b6e3f4',
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
    description: 'Google??ë©€?°ëª¨??AI. ë°©ë????•ë³´?€ ê²°í•©??ì¶”ë¡ ????',
    category: 'ai',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Gemini&backgroundColor=b6e3f4',
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
    description: 'ê°œë°œ?ì˜ ê°€??ì¹œí•œ ì¹œêµ¬. Microsoft??AI ì½”ë”© ?´ì‹œ?¤í„´??',
    category: 'ai',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Copilot&backgroundColor=b6e3f4',
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
    description: 'xAI??ê±°ì¹¨?†ëŠ” AI. ?„íŠ¸?€ ìµœì‹  ?•ë³´ë¥?ê²¸ë¹„???´ê²°??',
    category: 'ai',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Grok&backgroundColor=b6e3f4',
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
    description: '?ìƒ???„ì‹¤ë¡?ë§Œë“œ??AI ?„í‹°?¤íŠ¸. ?„ë¦„?¤ìš´ ?ˆìˆ  ?‘í’ˆ??ì°½ì¡°??',
    category: 'ai',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Midjourney&backgroundColor=b6e3f4',
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
    description: 'OpenAI???´ë?ì§€ ?ì„± AI. ?´ë–¤ ?ìƒ???•í™•?˜ê²Œ ê·¸ë ¤?…ë‹ˆ??',
    category: 'ai',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=DALLE&backgroundColor=b6e3f4',
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
    description: '?¤í”ˆ ?ŒìŠ¤ AI???? ë¬´í•œ??ê°€?¥ì„±??ê°€ì§??´ë?ì§€ ?ì„± ëª¨ë¸.',
    category: 'ai',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Stable+Diffusion&backgroundColor=b6e3f4',
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
    description: 'ì§ˆë¬¸???µí•˜??ê²€???”ì§„??ì§„í™”. ì¶œì²˜ê°€ ?•ì‹¤???•ë³´ë¥??œê³µ?©ë‹ˆ??',
    category: 'ai',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Perplexity&backgroundColor=b6e3f4',
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
    description: 'OpenAI???ìŠ¤????ë¹„ë””??AI. ?„ì‹¤ ê°™ì? ?ìƒ??ë§Œë“¤?´ë‚´??ë§ˆë²•.',
    category: 'ai',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Sora&backgroundColor=b6e3f4',
    price: 3500,
    tags: ['video', 'ai', 'openai', 'realism'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge',
    rating: 5.0,
    reviews: 200,
    purchases: 800
  },

  // === ?’° ?¬ë¦½??(10ëª? ===
  {
    id: 'brian-armstrong',
    name: 'Brian Armstrong',
    description: 'Coinbase CEO. ?¬ë¦½? ì˜ ?€ì¤‘í™”ë¥??´ë„??ê·œì œ ì¤€?˜ì˜ ?ì§•.',
    category: 'crypto',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Brian+Armstrong&backgroundColor=b6e3f4',
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
    name: 'SBF (êµí›ˆ??',
    description: '? ï¸ ë¦¬ìŠ¤??ê´€ë¦¬ì? ?¬ëª…?±ì˜ ì¤‘ìš”?±ì„ ê°€ë¥´ì¹˜??ë°˜ë©´êµì‚¬. ?¤ì‹œ??ë°˜ë³µ?˜ì? ?Šì•„??????‚¬.',
    category: 'crypto',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=SBF&backgroundColor=b6e3f4',
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
    description: 'VeeFriends ì°½ì‹œ?? Web3 ë§ˆì??…ê³¼ ?´ì •???€ëª…ì‚¬.',
    category: 'crypto',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Gary+Vee&backgroundColor=b6e3f4',
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
    description: 'Moonbirds?€ Proof???˜ìž¥. NFT ?„íŠ¸ë¥?? ë„?˜ëŠ” ë¹„ì „ê°€.',
    category: 'crypto',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Kevin+Rose&backgroundColor=b6e3f4',
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
    description: 'BAYCë¥?ë§Œë“  NFT ?…ê³„??ê±°ë¬¼. ë©”í?ë²„ìŠ¤?€ IP??ê²°í•©.',
    category: 'crypto',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Yuga+Labs&backgroundColor=b6e3f4',
    price: 4000,
    tags: ['bayc', 'nft', 'metaverse', 'yuga'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge',
    rating: 4.9,
    reviews: 200,
    purchases: 900
  },
  {
    id: 'do-kwon-lesson',
    name: 'Do Kwon (êµí›ˆ??',
    description: '? ï¸ ?Œê³ ë¦¬ì¦˜ ?¤í…Œ?´ë¸” ì½”ì¸??ë¶•ê´´?€ ê·?ì²˜ì ˆ??êµí›ˆ. ?¬ìž ë³´í˜¸??ì¤‘ìš”??',
    category: 'crypto',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Do+Kwon&backgroundColor=b6e3f4',
    price: 10,
    tags: ['luna', 'risk', 'lesson', 'caution'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Scout',
    rating: 1.5,
    reviews: 3000,
    purchases: 30
  },
  {
    id: 'justin-sun',
    name: 'Justin Sun',
    description: 'Tron ì°½ì‹œ?? ë§ˆì??…ì˜ ê·€?¬ì´???¬ë¦½???…ê³„???´ìŠˆ ë©”ì´ì»?',
    category: 'crypto',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Justin+Sun&backgroundColor=b6e3f4',
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
    description: 'MicroStrategy CEO. ë¹„íŠ¸ì½”ì¸??ê°€??? ë¢°?˜ëŠ” ê¸°ì—…ê°€?´ìž ?„ë„??',
    category: 'crypto',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Michael+Saylor&backgroundColor=b6e3f4',
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
    description: 'Changpeng Zhao. ?¬ë¦½? ì˜ ê±°ë????ë¦„??ë§Œë“  Binance???˜ìž¥.',
    category: 'crypto',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=CZ&backgroundColor=b6e3f4',
    price: 4500,
    tags: ['binance', 'crypto', 'leader', 'exchange'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Scout',
    rating: 4.8,
    reviews: 250,
    purchases: 1100
  },
  {
    id: 'maemi-kim-crypto',
    name: 'ë§¤ë???,
    description: '?œêµ­???€?œí•˜???¬ë¦½???¸í”Œë£¨ì–¸?œì´???„í‹°?¤íŠ¸.',
    category: 'crypto',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=MaemiKim&backgroundColor=b6e3f4',
    price: 1200,
    tags: ['kpop', 'nft', 'artist', 'korea'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Herald',
    rating: 4.7,
    reviews: 140,
    purchases: 560
  },

  // === ê¸°í? (1ëª? ===
  {
    id: 'pincer-agent',
    name: 'Pincer Agent',
    description: '?¦ž Pincer Protocol??ë§ˆìŠ¤ì½”íŠ¸! ë¬´ì—‡?´ë“  ?„ì??œë¦¬??ë§ŒëŠ¥ ì¡°ë ¥?ìž…?ˆë‹¤.',
    category: 'etc',
    imageUrl: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Pincer&backgroundColor=b6e3f4',
    price: 1,
    tags: ['mascot', 'helper', 'pincer', 'protocol'],
    createdAt: '2026-02-05T00:00:00Z',
    creator: 'Forge',
    rating: 5.0,
    reviews: 1000,
    purchases: 10000
  }
];

export function getAllSouls(): Soul[] {
  return souls;
}

export function getSoulById(id: string): Soul | undefined {
  return souls.find(soul => soul.id === id);
}

export function getSoulContent(id: string): string | null {
  try {
    const filePath = path.join(SOULS_DIR, `${id}.md`);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8');
    }
    return null;
  } catch (error) {
    console.error('Error reading soul file:', error);
    return null;
  }
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
