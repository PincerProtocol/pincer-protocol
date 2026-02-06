const fs = require('fs');
const path = require('path');

const GEMINI_API_KEY = 'AIzaSyDy_6vZJWLMvPOdUA4VSIt-mzA0MnUg1kI';
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'souls');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Soul prompts - digital art style portraits
const souls = [
  // US
  { id: 'elon-musk', prompt: 'Digital art portrait of Elon Musk, tech billionaire, minimalist style, professional' },
  { id: 'mark-zuckerberg', prompt: 'Digital art portrait of Mark Zuckerberg, Meta CEO, blue theme, minimalist' },
  { id: 'jeff-bezos', prompt: 'Digital art portrait of Jeff Bezos, Amazon founder, bald head, professional' },
  { id: 'bill-gates', prompt: 'Digital art portrait of Bill Gates, Microsoft founder, glasses, friendly' },
  { id: 'steve-jobs', prompt: 'Digital art portrait of Steve Jobs, Apple founder, black turtleneck, iconic' },
  // Japan Anime
  { id: 'naruto', prompt: 'Digital art of Naruto Uzumaki, anime ninja, orange outfit, spiky blonde hair, headband' },
  { id: 'luffy', prompt: 'Digital art of Monkey D Luffy, anime pirate, straw hat, red vest, big smile' },
  { id: 'goku', prompt: 'Digital art of Goku from Dragon Ball, anime warrior, spiky black hair, orange gi' },
  { id: 'pikachu', prompt: 'Digital art of Pikachu, Pokemon, yellow electric mouse, cute, red cheeks' },
  // AI
  { id: 'chatgpt', prompt: 'Digital art logo of ChatGPT AI, green gradient background, futuristic robot face' },
  { id: 'claude', prompt: 'Digital art logo of Claude AI assistant, orange and white, friendly robot' },
  { id: 'gemini', prompt: 'Digital art logo of Google Gemini AI, blue and purple gradient, twin stars' },
  // Crypto
  { id: 'vitalik-buterin', prompt: 'Digital art portrait of Vitalik Buterin, Ethereum founder, thin, unicorn shirt' },
  { id: 'cz-binance', prompt: 'Digital art portrait of CZ Changpeng Zhao, Binance CEO, Asian man, friendly smile' },
  { id: 'brian-armstrong', prompt: 'Digital art portrait of Brian Armstrong, Coinbase CEO, professional businessman' },
];

async function generateImage(prompt) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ["image", "text"] }
        })
      }
    );
    
    const data = await response.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts) {
      for (const part of data.candidates[0].content.parts) {
        if (part.inlineData) {
          return part.inlineData.data; // Base64 image
        }
      }
    }
    return null;
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}

async function main() {
  console.log('Generating Soul images with Gemini...\n');
  
  for (const soul of souls) {
    console.log(`Generating: ${soul.id}...`);
    
    const base64Image = await generateImage(soul.prompt);
    
    if (base64Image) {
      const filePath = path.join(OUTPUT_DIR, `${soul.id}.png`);
      fs.writeFileSync(filePath, Buffer.from(base64Image, 'base64'));
      console.log(`  ✅ Saved: ${filePath}`);
    } else {
      console.log(`  ❌ Failed: ${soul.id}`);
    }
    
    // Rate limit delay
    await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log('\nDone!');
}

main().catch(console.error);
