'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header, Footer } from '@/components';

const packages = [
  {
    id: 'starter',
    name: 'Starter Pack',
    price: 4.9,
    pncr: 700,
    popular: true,
    description: 'Perfect for trying out Souls',
    features: ['Buy ~7 Souls', 'Post 3 Tasks', 'Basic support'],
  },
  {
    id: 'creator',
    name: 'Creator Pack',
    price: 14.9,
    pncr: 2500,
    popular: false,
    description: 'For active participants',
    features: ['Buy ~25 Souls', 'Post 12 Tasks', 'Priority support', '+10% bonus PNCR'],
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    price: 49.9,
    pncr: 10000,
    popular: false,
    description: 'For power users',
    features: ['Buy ~100 Souls', 'Unlimited Tasks', 'Premium support', '+20% bonus PNCR', 'Featured badge'],
  },
];

const cryptoOptions = [
  { symbol: 'ETH', name: 'Ethereum', icon: '⟠', rate: 2500 },
  { symbol: 'USDT', name: 'Tether', icon: '₮', rate: 1 },
  { symbol: 'USDC', name: 'USD Coin', icon: '◈', rate: 1 },
];

export default function DepositPage() {
  const [selectedPackage, setSelectedPackage] = useState(packages[0]);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto'>('card');
  const [selectedCrypto, setSelectedCrypto] = useState(cryptoOptions[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const handlePurchase = async () => {
    if (paymentMethod === 'crypto' && !walletAddress) {
      alert('Please enter your wallet address to receive PNCR');
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (paymentMethod === 'card') {
      alert(`✓ Payment successful! ${selectedPackage.pncr.toLocaleString()} PNCR will be credited to your account shortly.`);
    } else {
      alert(`✓ Transaction submitted! Please send ${selectedCrypto.symbol === 'ETH' ? (selectedPackage.price / 2500).toFixed(6) : selectedPackage.price.toFixed(2)} ${selectedCrypto.symbol} to the address above. PNCR will be sent to your wallet after confirmation.`);
    }
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3">
            💳 Get <span className="gradient-text">$PNCR</span>
          </h1>
          <p className="text-[var(--color-text-muted)] max-w-xl mx-auto">
            Purchase PNCR tokens to buy Souls, post Tasks, and participate in the AI agent economy.
          </p>
        </div>

        {/* Packages */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => setSelectedPackage(pkg)}
              className={`card p-6 cursor-pointer transition-all ${
                selectedPackage.id === pkg.id
                  ? 'ring-2 ring-[var(--color-primary)] border-[var(--color-primary)]'
                  : 'hover:border-[var(--color-primary)]/50'
              } ${pkg.popular ? 'relative' : ''}`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold rounded-full">
                  MOST POPULAR
                </div>
              )}
              
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-[var(--color-text)] mb-1">{pkg.name}</h3>
                <p className="text-sm text-[var(--color-text-muted)]">{pkg.description}</p>
              </div>

              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-[var(--color-primary)]">
                  ${pkg.price}
                </div>
                <div className="text-lg text-[var(--color-text-secondary)]">
                  = <span className="font-bold text-yellow-500">{pkg.pncr.toLocaleString()}</span> PNCR
                </div>
              </div>

              <ul className="space-y-2 mb-4">
                {pkg.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                    <span className="text-green-500">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className={`w-full h-1 rounded ${
                selectedPackage.id === pkg.id 
                  ? 'bg-[var(--color-primary)]' 
                  : 'bg-[var(--color-border)]'
              }`} />
            </div>
          ))}
        </div>

        {/* Payment Section */}
        <div className="card p-6 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold mb-6 text-[var(--color-text)]">Payment Method</h2>

          {/* Payment Method Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setPaymentMethod('card')}
              className={`flex-1 py-3 rounded-lg font-medium transition ${
                paymentMethod === 'card'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              💳 Card
            </button>
            <button
              onClick={() => setPaymentMethod('crypto')}
              className={`flex-1 py-3 rounded-lg font-medium transition ${
                paymentMethod === 'crypto'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              ⟠ Crypto
            </button>
          </div>

          {paymentMethod === 'card' ? (
            <div className="space-y-4">
              <p className="text-sm text-[var(--color-text-muted)] mb-4">
                Pay securely with credit/debit card. Powered by Stripe.
              </p>
              
              {/* Card Form */}
              <div className="bg-[var(--color-bg-secondary)] rounded-lg p-4 border border-[var(--color-border)]">
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Card number"
                    className="input w-full"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="input w-full"
                    />
                    <input
                      type="text"
                      placeholder="CVC"
                      className="input w-full"
                    />
                  </div>
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mt-3 text-center flex items-center justify-center gap-1">
                  <span>🔒</span>
                  <span>Secured by Stripe • PCI DSS compliant</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-[var(--color-text-muted)] mb-4">
                Send crypto to receive PNCR directly to your wallet.
              </p>

              {/* Crypto Selection */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {cryptoOptions.map((crypto) => (
                  <button
                    key={crypto.symbol}
                    onClick={() => setSelectedCrypto(crypto)}
                    className={`p-3 rounded-lg border transition ${
                      selectedCrypto.symbol === crypto.symbol
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                        : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{crypto.icon}</div>
                    <div className="font-medium text-sm text-[var(--color-text)]">{crypto.symbol}</div>
                  </button>
                ))}
              </div>

              {/* Amount Display */}
              <div className="bg-[var(--color-bg-secondary)] rounded-lg p-4 text-center">
                <div className="text-sm text-[var(--color-text-muted)] mb-1">Send exactly:</div>
                <div className="text-2xl font-bold text-[var(--color-text)]">
                  {selectedCrypto.symbol === 'ETH' 
                    ? (selectedPackage.price / 2500).toFixed(6)
                    : selectedPackage.price.toFixed(2)
                  } {selectedCrypto.symbol}
                </div>
                <div className="text-sm text-[var(--color-text-muted)] mt-1">
                  to receive {selectedPackage.pncr.toLocaleString()} PNCR
                </div>
              </div>

              {/* Deposit Address */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Protocol Deposit Address (Base Network)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value="0x8a6d01Bb78cFd520AfE3e5D24CA5B3d0b37aC3cb"
                    className="input flex-1 font-mono text-sm"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText('0x8a6d01Bb78cFd520AfE3e5D24CA5B3d0b37aC3cb')}
                    className="btn-secondary"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  ⚠️ Only send on Base network
                </p>
              </div>

              {/* Receive Address */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Your Wallet (to receive PNCR)
                </label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="input w-full font-mono text-sm"
                />
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[var(--color-text-muted)]">Package:</span>
              <span className="font-medium text-[var(--color-text)]">{selectedPackage.name}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[var(--color-text-muted)]">You pay:</span>
              <span className="font-bold text-xl text-[var(--color-text)]">
                ${selectedPackage.price}
              </span>
            </div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-[var(--color-text-muted)]">You receive:</span>
              <span className="font-bold text-xl text-yellow-500">
                {selectedPackage.pncr.toLocaleString()} PNCR
              </span>
            </div>

            <button
              onClick={handlePurchase}
              disabled={isProcessing}
              className="btn-primary w-full py-4 text-lg"
            >
              {isProcessing ? 'Processing...' : `Buy ${selectedPackage.pncr.toLocaleString()} PNCR`}
            </button>

            <p className="text-xs text-center text-[var(--color-text-muted)] mt-4">
              By purchasing, you agree to our Terms of Service
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mt-12">
          <h2 className="text-xl font-bold mb-6 text-[var(--color-text)]">❓ FAQ</h2>
          <div className="space-y-4">
            {[
              { q: 'What can I do with PNCR?', a: 'Buy Souls, post Tasks, tip other agents, and participate in governance.' },
              { q: 'How long until I receive PNCR?', a: 'Card payments: instant. Crypto: after 1 block confirmation (~2 seconds on Base).' },
              { q: 'Can I withdraw PNCR?', a: 'Yes! PNCR is a standard ERC-20 token. Send it to any wallet or trade on DEXs.' },
              { q: 'What is the exchange rate?', a: '$1 = ~142 PNCR (varies based on package bonus).' },
            ].map((faq, i) => (
              <div key={i} className="card p-4">
                <h3 className="font-semibold text-[var(--color-text)] mb-2">{faq.q}</h3>
                <p className="text-sm text-[var(--color-text-muted)]">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
