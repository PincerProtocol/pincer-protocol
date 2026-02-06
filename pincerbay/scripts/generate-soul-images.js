const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const souls = [
  // Anime characters
  { id: "naruto", name: "NARUTO", title: "NINJA HERO", style: "Naruto Uzumaki anime character with spiky blonde hair and Konoha headband" },
  { id: "luffy", name: "LUFFY", title: "PIRATE CAPTAIN", style: "Monkey D Luffy anime character with straw hat from One Piece" },
  { id: "goku", name: "GOKU", title: "SAIYAN WARRIOR", style: "Son Goku anime character with spiky black hair from Dragon Ball" },
  { id: "pikachu", name: "PIKACHU", title: "ELECTRIC POKEMON", style: "Pikachu yellow electric mouse pokemon character" },
  
  // Japanese celebrities
  { id: "hikakin", name: "HIKAKIN", title: "YOUTUBER", style: "friendly young Japanese male YouTuber" },
  
  // Crypto figures
  { id: "vitalik-buterin", name: "VITALIK BUTERIN", title: "ETHEREUM FOUNDER", style: "young man with thin face and short hair, tech entrepreneur" },
  { id: "cz-binance", name: "CZ", title: "BINANCE FOUNDER", style: "Asian man with friendly smile, crypto executive" },
  { id: "brian-armstrong", name: "BRIAN ARMSTRONG", title: "COINBASE CEO", style: "bald American man, tech CEO" },
  
  // Tech figures
  { id: "elon-musk", name: "ELON MUSK", title: "TECH VISIONARY", style: "Elon Musk side profile" },
  { id: "steve-jobs", name: "STEVE JOBS", title: "APPLE FOUNDER", style: "Steve Jobs with glasses and black turtleneck" },
  { id: "mark-zuckerberg", name: "MARK ZUCKERBERG", title: "META CEO", style: "young man with short curly hair, tech CEO" },
  { id: "jeff-bezos", name: "JEFF BEZOS", title: "AMAZON FOUNDER", style: "bald man with confident expression, business mogul" },
  { id: "bill-gates", name: "BILL GATES", title: "MICROSOFT FOUNDER", style: "man with glasses, tech philanthropist" },
  
  // AI assistants
  { id: "chatgpt", name: "CHATGPT", title: "AI ASSISTANT", style: "abstract humanoid AI assistant representation, friendly robotic face" },
  { id: "claude", name: "CLAUDE", title: "AI ASSISTANT", style: "abstract humanoid AI assistant representation, thoughtful robotic face" },
  { id: "gemini", name: "GEMINI", title: "AI ASSISTANT", style: "abstract humanoid AI assistant representation, dual-faced symmetrical" },
  
  // Professional types
  { id: "cryptoanalyst-pro", name: "CRYPTO ANALYST", title: "BLOCKCHAIN EXPERT", style: "professional analyst with glasses, serious expression" },
  { id: "creative-writer", name: "CREATIVE WRITER", title: "STORYTELLER", style: "creative person with thoughtful artistic expression" },
  { id: "security-auditor", name: "SECURITY AUDITOR", title: "SECURITY EXPERT", style: "serious professional with stern analytical expression" },
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
Example: "ELON MUSK - TECH VISIONARY"

Overall feeling: premium, sophisticated, modern tech aesthetic. Like a high-end profile card.

For anime characters: keep the character recognizable but render in this smooth low-poly grayscale style.`;

  // Generating message moved to main()
  
  try {
    const response = await model.generateContent(prompt);
    const result = response.response;
    
    for (const part of result.candidates[0].content.parts) {
      if (part.inlineData) {
        const imageData = part.inlineData.data;
        const outputPath = path.join(__dirname, "..", "public", "souls", `${soul.id}.png`);
        fs.writeFileSync(outputPath, Buffer.from(imageData, "base64"));
        console.log(`✅ Saved: ${outputPath}`);
        return true;
      }
    }
    console.log(`❌ No image in response for ${soul.id}`);
    return false;
  } catch (error) {
    console.error(`❌ Error for ${soul.id}:`, error.message);
    return false;
  }
}

async function main() {
  console.log("🎨 Soul Image Generator - Smooth Low-poly Style\n");
  console.log(`Total souls to generate: ${souls.length}\n`);
  
  let success = 0;
  let failed = 0;
  
  for (let i = 0; i < souls.length; i++) {
    const soul = souls[i];
    console.log(`[${i + 1}/${souls.length}] Generating: ${soul.id}...`);
    
    const result = await generateSoulImage(soul);
    if (result) {
      success++;
    } else {
      failed++;
    }
    
    // Delay between requests to avoid rate limiting
    if (i < souls.length - 1) {
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  
  console.log(`\n✨ Generation complete! Success: ${success}, Failed: ${failed}`);
}

main();
