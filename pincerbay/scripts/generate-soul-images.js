const fs = require('fs');
const path = require('path');

const GEMINI_API_KEY = 'AIzaSyDy_6vZJWLMvPOdUA4VSIt-mzA0MnUg1kI';

// Soul 목록 (이름, 설명, 스타일 힌트)
const souls = [
  { id: 'elon-musk', name: 'Elon Musk', prompt: 'Digital art portrait of Elon Musk, tech entrepreneur, futuristic style, clean background' },
  { id: 'mark-zuckerberg', name: 'Mark Zuckerberg', prompt: 'Digital art portrait of Mark Zuckerberg, tech CEO, metaverse theme, clean background' },
  { id: 'naruto', name: 'Naruto Uzumaki', prompt: 'Digital art of Naruto Uzumaki anime character, ninja, orange outfit, determined expression' },
  { id: 'luffy', name: 'Monkey D. Luffy', prompt: 'Digital art of Monkey D. Luffy anime character, pirate, straw hat, adventurous smile' },
  { id: 'chatgpt', name: 'ChatGPT', prompt: 'Digital art logo representation of ChatGPT AI assistant, green and white theme, friendly robot' },
  { id: 'claude', name: 'Claude', prompt: 'Digital art logo representation of Claude AI assistant, orange and white theme, helpful robot' },
];

async function generateImage(prompt) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          responseModalities: ["image", "text"]
        }
      })
    }
  );
  
  const data = await response.json();
  console.log('Response:', JSON.stringify(data, null, 2));
  return data;
}

// Test with one image
async function main() {
  console.log('Testing Gemini Image Generation...');
  const result = await generateImage('Digital art portrait style, simple clean illustration of a tech entrepreneur, minimalist background');
  console.log('Result:', result);
}

main().catch(console.error);
