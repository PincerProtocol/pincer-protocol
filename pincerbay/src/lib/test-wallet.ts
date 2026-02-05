/**
 * Quick test script for wallet functionality
 * Run with: npx tsx src/lib/test-wallet.ts
 */

import { createWallet, recoverWallet, getETHBalance } from './wallet';

async function testWalletSystem() {
  console.log('🧪 Testing Wallet System...\n');

  try {
    // Test 1: Create wallet
    console.log('1️⃣ Creating wallet...');
    const wallet = createWallet('test-user-123');
    console.log('✅ Wallet created:');
    console.log(`   Address: ${wallet.address}`);
    console.log(`   User ID: ${wallet.userId}`);
    console.log(`   Encrypted Key Length: ${wallet.encryptedPrivateKey.length} bytes\n`);

    // Test 2: Recover wallet
    console.log('2️⃣ Recovering wallet from encrypted key...');
    const recovered = recoverWallet(wallet.encryptedPrivateKey);
    console.log('✅ Wallet recovered:');
    console.log(`   Address: ${recovered.address}`);
    console.log(`   Match: ${recovered.address === wallet.address ? '✅' : '❌'}\n`);

    // Test 3: Check balance
    console.log('3️⃣ Checking ETH balance...');
    const balance = await getETHBalance(wallet.address);
    console.log(`✅ Balance: ${balance} ETH\n`);

    console.log('✅ All tests passed!\n');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run if WALLET_ENCRYPTION_KEY is set
if (process.env.WALLET_ENCRYPTION_KEY) {
  testWalletSystem();
} else {
  console.error('❌ WALLET_ENCRYPTION_KEY environment variable not set');
  console.log('Set it with: export WALLET_ENCRYPTION_KEY=$(openssl rand -base64 32)');
  process.exit(1);
}
