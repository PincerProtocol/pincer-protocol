const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// 새로 추가된 한국 유명인
const souls = [
  { id: "chimchakman", name: "침착맨", title: "MEME KING", style: "Korean male streamer with glasses, cartoon/webtoon style face, friendly humorous expression" },
  { id: "syuka-world", name: "슈카월드", title: "ECONOMY EXPERT", style: "Korean male YouTuber, professional look, knowledgeable expression" },
  { id: "sinsa-imdang", name: "신사임당", title: "INVESTMENT GURU", style: "Korean female YouTuber, professional elegant look, confident expression" },
  { id: "pengsoo", name: "펭수", title: "MEME CHARACTER", style: "giant penguin character, cute and funny, EBS mascot style" },
  { id: "woowakgood", name: "우왁굳", title: "VTUBER CREATOR", style: "Korean male streamer, creative artistic expression, virtual idol creator" },
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

Overall feeling: premium, sophisticated, modern tech aesthetic. Like a high-end profile card.`;

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
  console.log("🎨 Korean Soul Image Generator\n");
  
  for (let i = 0; i < souls.length; i++) {
    const soul = souls[i];
    console.log(`[${i + 1}/${souls.length}] ${soul.id}...`);
    await generateSoulImage(soul);
    if (i < souls.length - 1) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  
  console.log("\n✨ Complete!");
}

main();
