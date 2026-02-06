const fs = require('fs');

// Read the file
let content = fs.readFileSync('lib/soulsDB.ts', 'utf8');

// Map of soul IDs to their local image paths
const imageMap = {
  'elon-musk': '/souls/elon-musk.png',
  'mark-zuckerberg': '/souls/mark-zuckerberg.png',
  'jeff-bezos': '/souls/jeff-bezos.png',
  'bill-gates': '/souls/bill-gates.png',
  'steve-jobs': '/souls/steve-jobs.png',
  'naruto': '/souls/naruto.png',
  'luffy': '/souls/luffy.png',
  'goku': '/souls/goku.png',
  'pikachu': '/souls/pikachu.png',
  'chatgpt': '/souls/chatgpt.png',
  'claude': '/souls/claude.png',
  'gemini': '/souls/gemini.png',
  'vitalik-buterin': '/souls/vitalik-buterin.png',
  'cz-binance': '/souls/cz-binance.png',
  'brian-armstrong': '/souls/brian-armstrong.png',
};

// Replace each soul's imageUrl
for (const [id, localPath] of Object.entries(imageMap)) {
  // Match the imageUrl line for this soul
  const regex = new RegExp(
    `(id: '${id}'[\\s\\S]*?imageUrl: ')[^']+(')`
  );
  content = content.replace(regex, `$1${localPath}$2`);
}

fs.writeFileSync('lib/soulsDB.ts', content, 'utf8');
console.log('Done! Updated imageUrls to local paths.');
