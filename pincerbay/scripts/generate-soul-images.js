const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// 전체 Soul 목록 (60+명)
const souls = [
  // === 🇺🇸 미국 (10명) ===
  { id: "elon-musk", name: "ELON MUSK", title: "TECH VISIONARY", style: "Elon Musk side profile" },
  { id: "mark-zuckerberg", name: "MARK ZUCKERBERG", title: "META CEO", style: "Mark Zuckerberg with short curly hair" },
  { id: "jeff-bezos", name: "JEFF BEZOS", title: "AMAZON FOUNDER", style: "Jeff Bezos bald man confident expression" },
  { id: "bill-gates", name: "BILL GATES", title: "MICROSOFT FOUNDER", style: "Bill Gates with glasses, tech philanthropist" },
  { id: "steve-jobs", name: "STEVE JOBS", title: "APPLE FOUNDER", style: "Steve Jobs with glasses and black turtleneck" },
  { id: "oprah-winfrey", name: "OPRAH WINFREY", title: "MEDIA QUEEN", style: "Oprah Winfrey confident African American woman" },
  { id: "kanye-west", name: "KANYE WEST", title: "ARTIST", style: "Kanye West African American man artistic" },
  { id: "kim-kardashian", name: "KIM KARDASHIAN", title: "INFLUENCER", style: "Kim Kardashian glamorous woman" },
  { id: "taylor-swift", name: "TAYLOR SWIFT", title: "POP STAR", style: "Taylor Swift blonde woman singer" },
  { id: "beyonce", name: "BEYONCÉ", title: "QUEEN BEY", style: "Beyonce African American woman powerful" },

  // === 🇷🇺 러시아 (10명) ===
  { id: "vladimir-putin", name: "VLADIMIR PUTIN", title: "LEADER", style: "Vladimir Putin serious expression" },
  { id: "pavel-durov", name: "PAVEL DUROV", title: "TELEGRAM FOUNDER", style: "Pavel Durov young man tech entrepreneur" },
  { id: "kaspersky", name: "EUGENE KASPERSKY", title: "SECURITY EXPERT", style: "Eugene Kaspersky tech security expert" },
  { id: "maria-sharapova", name: "MARIA SHARAPOVA", title: "TENNIS STAR", style: "Maria Sharapova elegant blonde woman athlete" },
  { id: "garry-kasparov", name: "GARRY KASPAROV", title: "CHESS MASTER", style: "Garry Kasparov chess grandmaster" },
  { id: "dostoevsky", name: "DOSTOEVSKY", title: "WRITER", style: "Fyodor Dostoevsky 19th century Russian author with beard" },
  { id: "tolstoy", name: "LEO TOLSTOY", title: "AUTHOR", style: "Leo Tolstoy old man with long beard Russian author" },
  { id: "tchaikovsky", name: "TCHAIKOVSKY", title: "COMPOSER", style: "Pyotr Tchaikovsky classical composer with beard" },
  { id: "mendeleev", name: "MENDELEEV", title: "SCIENTIST", style: "Dmitri Mendeleev scientist with long beard and hair" },

  // === 🇯🇵 일본 (10명) ===
  { id: "naruto", name: "NARUTO", title: "NINJA HERO", style: "Naruto Uzumaki anime character with spiky blonde hair and headband, ANIME STYLE" },
  { id: "luffy", name: "LUFFY", title: "PIRATE CAPTAIN", style: "Monkey D Luffy anime character with straw hat, ANIME STYLE" },
  { id: "goku", name: "GOKU", title: "SAIYAN WARRIOR", style: "Son Goku anime character with spiky black hair, ANIME STYLE" },
  { id: "pikachu", name: "PIKACHU", title: "POKEMON", style: "Pikachu yellow electric mouse pokemon character, ANIME STYLE" },
  { id: "satoshi-nakamoto", name: "SATOSHI NAKAMOTO", title: "BITCOIN CREATOR", style: "mysterious anonymous figure with question mark or shadow" },
  { id: "hayao-miyazaki", name: "HAYAO MIYAZAKI", title: "DIRECTOR", style: "Hayao Miyazaki old Japanese man with glasses and white beard" },
  { id: "hideo-kojima", name: "HIDEO KOJIMA", title: "GAME DESIGNER", style: "Hideo Kojima Japanese man with glasses" },
  { id: "hikakin", name: "HIKAKIN", title: "YOUTUBER", style: "friendly young Japanese male YouTuber" },
  { id: "akb48-idol", name: "AKB48 IDOL", title: "POP IDOL", style: "cute Japanese female idol singer, ANIME STYLE" },
  { id: "yoshimoto-comedian", name: "YOSHIMOTO", title: "COMEDIAN", style: "funny Japanese comedian" },

  // === 🇨🇳 중국 (10명) ===
  { id: "jack-ma", name: "JACK MA", title: "ALIBABA FOUNDER", style: "Jack Ma Chinese businessman with distinct features" },
  { id: "cz-binance", name: "CZ", title: "BINANCE FOUNDER", style: "Changpeng Zhao CZ Asian man friendly smile" },
  { id: "pony-ma", name: "PONY MA", title: "TENCENT CEO", style: "Ma Huateng Chinese tech executive" },
  { id: "lei-jun", name: "LEI JUN", title: "XIAOMI FOUNDER", style: "Lei Jun Chinese tech entrepreneur" },
  { id: "liu-cixin", name: "LIU CIXIN", title: "SF AUTHOR", style: "Liu Cixin Chinese author with glasses" },
  { id: "jackie-chan", name: "JACKIE CHAN", title: "ACTION LEGEND", style: "Jackie Chan Chinese martial artist actor" },
  { id: "bruce-lee", name: "BRUCE LEE", title: "MARTIAL ARTIST", style: "Bruce Lee iconic martial artist" },
  { id: "confucius", name: "CONFUCIUS", title: "PHILOSOPHER", style: "Confucius ancient Chinese philosopher with traditional hat and beard" },
  { id: "sun-tzu", name: "SUN TZU", title: "STRATEGIST", style: "Sun Tzu ancient Chinese military strategist" },
  { id: "mulan", name: "MULAN", title: "WARRIOR", style: "Mulan Chinese female warrior, ANIME STYLE" },

  // === 🤖 AI (10명) ===
  { id: "chatgpt", name: "CHATGPT", title: "AI ASSISTANT", style: "abstract AI assistant, friendly robotic face with green glow" },
  { id: "claude", name: "CLAUDE", title: "AI ASSISTANT", style: "abstract AI assistant, thoughtful robotic face with orange glow" },
  { id: "gemini", name: "GEMINI", title: "AI ASSISTANT", style: "abstract AI assistant, dual symmetrical face with blue glow" },
  { id: "copilot", name: "COPILOT", title: "CODE ASSISTANT", style: "abstract AI assistant, coding theme with purple glow" },
  { id: "grok", name: "GROK", title: "AI ASSISTANT", style: "abstract AI assistant, witty expression with X logo theme" },
  { id: "midjourney", name: "MIDJOURNEY", title: "AI ARTIST", style: "abstract AI artist, creative colorful abstract face" },
  { id: "dall-e", name: "DALL-E", title: "IMAGE AI", style: "abstract AI artist, visual creative abstract face" },
  { id: "stable-diffusion", name: "STABLE DIFFUSION", title: "IMAGE AI", style: "abstract AI, open source theme abstract face" },
  { id: "perplexity", name: "PERPLEXITY", title: "SEARCH AI", style: "abstract AI, search and knowledge theme" },
  { id: "sora", name: "SORA", title: "VIDEO AI", style: "abstract AI, video and motion theme" },

  // === 💰 크립토 (10명) ===
  { id: "vitalik-buterin", name: "VITALIK BUTERIN", title: "ETHEREUM FOUNDER", style: "Vitalik Buterin thin young man" },
  { id: "brian-armstrong", name: "BRIAN ARMSTRONG", title: "COINBASE CEO", style: "Brian Armstrong bald American tech CEO" },
  { id: "sbf-lesson", name: "SBF", title: "LESSON", style: "abstract warning symbol, cautionary figure" },
  { id: "gary-vee", name: "GARY VEE", title: "NFT KING", style: "Gary Vaynerchuk energetic man" },
  { id: "kevin-rose", name: "KEVIN ROSE", title: "NFT CURATOR", style: "Kevin Rose tech entrepreneur" },
  { id: "yuga-labs", name: "YUGA LABS", title: "BAYC CREATOR", style: "abstract ape silhouette artistic" },
  { id: "do-kwon-lesson", name: "DO KWON", title: "LESSON", style: "abstract warning symbol, cautionary figure" },
  { id: "justin-sun", name: "JUSTIN SUN", title: "TRON FOUNDER", style: "Justin Sun young Asian man" },
  { id: "michael-saylor", name: "MICHAEL SAYLOR", title: "BTC MAXIMALIST", style: "Michael Saylor confident businessman" },
  { id: "maemi-kim-crypto", name: "MAEMI KIM", title: "CRYPTO ARTIST", style: "Korean female artist creative" },

  // === 기타 (1명) ===
  { id: "pincer-agent", name: "PINCER", title: "PROTOCOL AGENT", style: "cute lobster mascot character, friendly" },

  // === 전문가 타입 (3명) ===
  { id: "cryptoanalyst-pro", name: "CRYPTO ANALYST", title: "BLOCKCHAIN EXPERT", style: "professional analyst with glasses" },
  { id: "creative-writer", name: "CREATIVE WRITER", title: "STORYTELLER", style: "creative person with thoughtful artistic expression" },
  { id: "security-auditor", name: "SECURITY AUDITOR", title: "SECURITY EXPERT", style: "serious professional with analytical expression" },
];

async function generateSoulImage(soul) {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-exp-image-generation",
    generationConfig: {
      responseModalities: ["image", "text"],
    }
  });

  const prompt = `Create a SMOOTH low-poly geometric portrait illustration, premium quality:

Subject: ${soul.style}

EXACT STYLE REQUIREMENTS:
- SMOOTH LOW-POLY style - soft geometric shapes, NOT too angular or sharp
- Polygons should blend smoothly, elegant and refined look
- Color palette: grayscale with subtle warm tones for skin (cream/beige undertones)
- SIDE PROFILE VIEW - face looking to the RIGHT
- Dark clothing (black/navy suit or jacket)
- Light gray background with SUBTLE thin circuit board pattern (thin lines with small circular nodes)
- Premium, sophisticated, elegant aesthetic

TEXT AT BOTTOM (EXACT FORMAT):
"${soul.name}" in BOLD BLACK font, then " - " then "${soul.title}" in LIGHT GRAY thinner font

Overall feeling: premium, sophisticated, modern tech aesthetic. Like a high-end profile card.

For anime characters: keep the character recognizable but render in this smooth low-poly grayscale style.
For historical figures: interpret in this modern geometric style.
For abstract AI: create an artistic abstract representation in this style.`;

  try {
    const response = await model.generateContent(prompt);
    const result = response.response;
    
    for (const part of result.candidates[0].content.parts) {
      if (part.inlineData) {
        const imageData = part.inlineData.data;
        const outputPath = path.join(__dirname, "..", "public", "souls", `${soul.id}.png`);
        fs.writeFileSync(outputPath, Buffer.from(imageData, "base64"));
        console.log(`✅ ${soul.id}`);
        return true;
      }
    }
    console.log(`❌ No image: ${soul.id}`);
    return false;
  } catch (error) {
    console.error(`❌ Error ${soul.id}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log("🎨 Soul Image Generator - Full Collection\n");
  console.log(`Total: ${souls.length} souls\n`);
  
  let success = 0;
  let failed = 0;
  
  for (let i = 0; i < souls.length; i++) {
    const soul = souls[i];
    process.stdout.write(`[${i + 1}/${souls.length}] ${soul.id}... `);
    
    const result = await generateSoulImage(soul);
    if (result) {
      success++;
    } else {
      failed++;
    }
    
    // Delay between requests
    if (i < souls.length - 1) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  
  console.log(`\n✨ Complete! Success: ${success}, Failed: ${failed}`);
}

main();
