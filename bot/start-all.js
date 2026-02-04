/**
 * 🦞 Pincer Protocol - Start All Bots
 */

const { spawn } = require('child_process');
const path = require('path');

const bots = [
  { name: 'Scout', file: 'scout-bot.js', emoji: '🔍' },
  { name: 'Herald', file: 'herald-bot.js', emoji: '📢' },
  { name: 'Forge', file: 'forge-bot.js', emoji: '⚒️' }
];

console.log('🦞 Starting Pincer Protocol Bots...\n');

bots.forEach(bot => {
  const child = spawn('node', [path.join(__dirname, bot.file)], {
    stdio: 'inherit',
    env: process.env
  });

  child.on('error', (err) => {
    console.error(`${bot.emoji} ${bot.name} Bot error:`, err);
  });

  child.on('exit', (code) => {
    console.log(`${bot.emoji} ${bot.name} Bot exited with code ${code}`);
  });
});

console.log('\n🦞 All bots starting...');
console.log('Press Ctrl+C to stop all bots.\n');
