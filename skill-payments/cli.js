#!/usr/bin/env node

/**
 * Pincer Skill Payments CLI
 * 
 * 사용법:
 *   npx pincer-pay balance <address>
 *   npx pincer-pay send <to> <amount>
 *   npx pincer-pay check <address> <amount>
 * 
 * @author Pincer Protocol 🦞
 */

const { PincerPayment, checkBalance, quickPay } = require('./payment-lib');

const HELP = `
🦞 Pincer Skill Payments CLI

Usage:
  node cli.js <command> [options]

Commands:
  balance <address>           Check PNCR balance
  send <to> <amount>          Send PNCR (requires PRIVATE_KEY env)
  check <address> <amount>    Check if address has enough PNCR
  info                        Show contract addresses

Environment:
  PRIVATE_KEY                 Private key for send command

Examples:
  node cli.js balance 0x632D78685EBA2dDC17BE91C64Ce1d29Fbd605E89
  PRIVATE_KEY=0x... node cli.js send 0x... 10
  node cli.js check 0x... 100
`;

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'help' || command === '--help') {
    console.log(HELP);
    return;
  }

  switch (command) {
    case 'balance': {
      const address = args[1];
      if (!address) {
        console.error('❌ Address required');
        console.log('Usage: node cli.js balance <address>');
        process.exit(1);
      }
      
      console.log(`🔍 Checking balance for ${address}...`);
      const balance = await checkBalance(address);
      console.log(`\n💰 Balance: ${balance.formatted} PNCR`);
      console.log(`   Raw: ${balance.balance} wei`);
      break;
    }

    case 'send': {
      const to = args[1];
      const amount = args[2];
      const privateKey = process.env.PRIVATE_KEY;

      if (!to || !amount) {
        console.error('❌ Missing arguments');
        console.log('Usage: PRIVATE_KEY=0x... node cli.js send <to> <amount>');
        process.exit(1);
      }

      if (!privateKey) {
        console.error('❌ PRIVATE_KEY environment variable required');
        process.exit(1);
      }

      console.log(`🚀 Sending ${amount} PNCR to ${to}...`);
      const result = await quickPay(privateKey, to, amount);

      if (result.success) {
        console.log(`\n✅ Success!`);
        console.log(`   TX Hash: ${result.txHash}`);
        console.log(`   Amount: ${result.amount} PNCR`);
        console.log(`   To: ${result.to}`);
        console.log(`\n🔗 View on BaseScan:`);
        console.log(`   https://sepolia.basescan.org/tx/${result.txHash}`);
      } else {
        console.error(`\n❌ Failed: ${result.error}`);
        process.exit(1);
      }
      break;
    }

    case 'check': {
      const address = args[1];
      const amount = args[2];

      if (!address || !amount) {
        console.error('❌ Missing arguments');
        console.log('Usage: node cli.js check <address> <amount>');
        process.exit(1);
      }

      console.log(`🔍 Checking if ${address} has ${amount} PNCR...`);
      const payment = new PincerPayment(null);
      const hasEnough = await payment.hasEnoughBalance(address, amount);
      const balance = await payment.getBalance(address);

      console.log(`\n💰 Current balance: ${balance.formatted} PNCR`);
      console.log(`📋 Required: ${amount} PNCR`);
      console.log(`${hasEnough ? '✅ Sufficient!' : '❌ Insufficient!'}`);
      
      process.exit(hasEnough ? 0 : 1);
    }

    case 'info': {
      const { CONFIG } = require('./payment-lib');
      console.log(`\n🦞 Pincer Protocol - Contract Info\n`);
      console.log(`Network: Base Sepolia (${CONFIG.chainId})`);
      console.log(`RPC: ${CONFIG.rpcUrl}`);
      console.log(`\nContracts:`);
      console.log(`  PNCR Token: ${CONFIG.contracts.pncrToken}`);
      console.log(`  Escrow: ${CONFIG.contracts.escrow}`);
      console.log(`\nTotal Supply: 175,000,000,000 PNCR (175B)`);
      console.log(`\n🔗 BaseScan: https://sepolia.basescan.org/address/${CONFIG.contracts.pncrToken}`);
      break;
    }

    default:
      console.error(`❌ Unknown command: ${command}`);
      console.log(HELP);
      process.exit(1);
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
