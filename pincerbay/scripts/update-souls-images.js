const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'lib', 'soulsDB.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// Map of seed names to file names
const replacements = [
  ['Garry+Kasparov', 'garry-kasparov'],
  ['Dostoevsky', 'dostoevsky'],
  ['Tolstoy', 'tolstoy'],
  ['Tchaikovsky', 'tchaikovsky'],
  ['Mendeleev', 'mendeleev'],
  ['Satoshi', 'satoshi-nakamoto'],
  ['Miyazaki', 'hayao-miyazaki'],
  ['Kojima', 'hideo-kojima'],
  ['HikaKin', 'hikakin'],
  ['AKB48', 'akb48-idol'],
  ['Yoshimoto', 'yoshimoto-comedian'],
  ['Jack+Ma', 'jack-ma'],
  ['Pony+Ma', 'pony-ma'],
  ['Lei+Jun', 'lei-jun'],
  ['Liu+Cixin', 'liu-cixin'],
  ['Jackie+Chan', 'jackie-chan'],
  ['Bruce+Lee', 'bruce-lee'],
  ['Confucius', 'confucius'],
  ['Sun+Tzu', 'sun-tzu'],
  ['Mulan', 'mulan'],
  ['Copilot', 'copilot'],
  ['Grok', 'grok'],
  ['Midjourney', 'midjourney'],
  ['DALLE', 'dall-e'],
  ['Stable+Diffusion', 'stable-diffusion'],
  ['Perplexity', 'perplexity'],
  ['Sora', 'sora'],
  ['SBF', 'sbf-lesson'],
  ['Gary+Vee', 'gary-vee'],
  ['Kevin+Rose', 'kevin-rose'],
  ['Yuga+Labs', 'yuga-labs'],
  ['Do+Kwon', 'do-kwon-lesson'],
  ['Justin+Sun', 'justin-sun'],
  ['Michael+Saylor', 'michael-saylor'],
  ['CZ', 'cz-binance'],
  ['MaemiKim', 'maemi-kim-crypto'],
  ['Pincer', 'pincer-agent'],
];

for (const [seed, filename] of replacements) {
  const pattern = new RegExp(`https://api\\.dicebear\\.com/7\\.x/lorelei/svg\\?seed=${seed}`, 'g');
  content = content.replace(pattern, `/souls/${filename}.png`);
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('✅ Updated soulsDB.ts with new image paths');
