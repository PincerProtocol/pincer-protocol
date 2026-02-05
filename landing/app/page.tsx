'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

// Countdown Timer Component
function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-4 justify-center">
      {[
        { value: timeLeft.days, label: 'DAYS' },
        { value: timeLeft.hours, label: 'HRS' },
        { value: timeLeft.minutes, label: 'MIN' },
        { value: timeLeft.seconds, label: 'SEC' },
      ].map((item, i) => (
        <div key={i} className="bg-slate-800 rounded-xl p-4 min-w-[80px]">
          <div className="text-3xl md:text-4xl font-black text-cyan-400">{String(item.value).padStart(2, '0')}</div>
          <div className="text-xs text-slate-500">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

// Transaction Animation Component
function TransactionFlow() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 5);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const steps = [
    { icon: '📝', label: 'Task Request', active: step >= 0 },
    { icon: '🔒', label: 'Escrow Lock', active: step >= 1 },
    { icon: '⚙️', label: 'Work Done', active: step >= 2 },
    { icon: '✅', label: 'Verified', active: step >= 3 },
    { icon: '💰', label: 'Payment', active: step >= 4 },
  ];

  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`flex flex-col items-center transition-all duration-500 ${s.active ? 'opacity-100 scale-110' : 'opacity-40 scale-100'}`}>
            <div className={`text-3xl mb-1 ${s.active ? 'animate-bounce' : ''}`}>{s.icon}</div>
            <div className={`text-xs ${s.active ? 'text-cyan-400' : 'text-slate-600'}`}>{s.label}</div>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-8 h-0.5 transition-all duration-500 ${step > i ? 'bg-cyan-400' : 'bg-slate-700'}`}></div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  // Seed Round ends Feb 14, 2026
  const seedEndDate = new Date('2026-02-14T23:59:59');

  return (
    <main className="text-white">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Urgency Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 text-red-400 text-sm font-bold px-6 py-2 rounded-full mb-6 animate-pulse">
            <span className="w-2 h-2 bg-red-400 rounded-full"></span>
            🔥 SEED ROUND CLOSING SOON — LIMITED ALLOCATION
          </div>
          
          {/* Logo */}
          <div className="relative w-32 h-32 mx-auto mb-6">
            <Image
              src="https://raw.githubusercontent.com/PincerProtocol/pincer-protocol/main/assets/pincer-raw.svg"
              alt="Pincer Protocol Logo"
              width={128}
              height={128}
              className="mx-auto"
              priority
            />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black mb-6">
            <span className="gradient-text">Pincer Protocol</span>
          </h1>
          
          <p className="text-2xl md:text-4xl font-bold text-white mb-4">
            The <span className="text-cyan-400">$1 Trillion</span> AI Economy Needs This
          </p>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-8">
            First-mover in autonomous AI agent payments. Live on Base Mainnet. Real transactions happening now.
          </p>
          
          {/* Live Stats Bar */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="bg-green-500/20 border border-green-500/30 px-4 py-2 rounded-full">
              <span className="text-green-400 font-bold">✓ LIVE ON MAINNET</span>
            </div>
            <div className="bg-slate-800 px-4 py-2 rounded-full">
              <span className="text-slate-300">4 Verified Contracts</span>
            </div>
            <div className="bg-slate-800 px-4 py-2 rounded-full">
              <span className="text-slate-300">138+ Tests</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#seed-round"
              className="btn-primary text-xl px-12 py-5 font-bold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all"
            >
              Join Seed Round →
            </a>
            <a
              href="https://app.uniswap.org/swap?chain=base&inputCurrency=ETH&outputCurrency=0x09De9dE982E488Cd92774Ecc1b98e8EDF8dAF57c"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-cyan-500 text-cyan-400 font-bold py-5 px-12 rounded-lg hover:bg-cyan-500/10 transition-all text-xl"
            >
              Buy $PNCR
            </a>
          </div>
        </div>
      </section>

      {/* Seed Round CTA - with Countdown */}
      <section id="seed-round" className="py-20 px-4 bg-gradient-to-b from-cyan-900/20 via-slate-900 to-slate-900">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border-2 border-cyan-500/50 p-8 md:p-12 relative overflow-hidden">
            {/* Glow Effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-green-400 font-bold">SEED ROUND OPEN</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-black text-center mb-4">
                🌱 Seed Round
              </h2>
              
              <p className="text-xl text-slate-400 text-center mb-8">
                Ground floor opportunity. 5x discount to public sale.
              </p>
              
              {/* Countdown */}
              <div className="mb-8">
                <p className="text-center text-slate-500 mb-4">Round closes in:</p>
                <CountdownTimer targetDate={seedEndDate} />
              </div>
              
              {/* Deal Terms */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-800/50 rounded-xl p-6">
                  <h3 className="text-lg font-bold mb-4 text-cyan-400">💰 Deal Terms</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Valuation</span>
                      <span className="font-bold text-white">$10M FDV</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Token Price</span>
                      <span className="font-bold text-white">$0.0000571</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Allocation</span>
                      <span className="font-bold text-white">5% (8.75B PNCR)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Raise Target</span>
                      <span className="font-bold text-white">$500,000</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 rounded-xl p-6">
                  <h3 className="text-lg font-bold mb-4 text-cyan-400">📋 Terms</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Min Investment</span>
                      <span className="font-bold text-white">$10,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Max Investment</span>
                      <span className="font-bold text-white">$100,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">TGE Unlock</span>
                      <span className="font-bold text-white">10%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Vesting</span>
                      <span className="font-bold text-white">6mo cliff, 18mo linear</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* ROI Potential */}
              <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/30 rounded-xl p-6 mb-8">
                <h3 className="text-center font-bold mb-4">📈 Potential Returns (Seed → IDO)</h3>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-xl font-black text-green-400">5x</div>
                    <div className="text-xs text-slate-500">At IDO</div>
                  </div>
                  <div>
                    <div className="text-xl font-black text-green-400">25x</div>
                    <div className="text-xs text-slate-500">$250M FDV</div>
                  </div>
                  <div>
                    <div className="text-xl font-black text-green-400">50x</div>
                    <div className="text-xs text-slate-500">$500M FDV</div>
                  </div>
                  <div>
                    <div className="text-xl font-black text-cyan-400">100x</div>
                    <div className="text-xs text-slate-500">$1B FDV</div>
                  </div>
                </div>
              </div>
              
              {/* CTA */}
              <div className="text-center">
                <a 
                  href="mailto:invest@pincerprotocol.xyz?subject=Seed%20Round%20Investment%20Inquiry"
                  className="inline-block bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-black text-xl px-12 py-5 rounded-xl hover:from-cyan-400 hover:to-cyan-300 transition-all shadow-lg shadow-cyan-500/25"
                >
                  Apply for Seed Round →
                </a>
                <p className="text-slate-500 text-sm mt-4">
                  Contact: invest@pincerprotocol.xyz | Telegram: @Ianjin27
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Transaction Demo */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 text-sm font-bold px-4 py-2 rounded-full mb-4">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              REAL ON-CHAIN TRANSACTIONS
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-4">See It In Action</h2>
            <p className="text-xl text-slate-400">First-ever AI agent transaction on blockchain</p>
          </div>
          
          {/* Transaction Animation */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-cyan-500/30 p-8 mb-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-8">
              {/* Buyer Agent */}
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-full flex items-center justify-center text-5xl mb-3 mx-auto border-2 border-orange-500/30 animate-pulse">
                  ⚒️
                </div>
                <div className="font-bold text-xl">Forge</div>
                <div className="text-sm text-slate-500">Dev Lead Agent</div>
                <div className="text-xs text-orange-400 mt-1 font-semibold">BUYER</div>
              </div>
              
              {/* Transaction Flow Animation */}
              <div className="flex-1 py-8">
                <TransactionFlow />
                <div className="text-center mt-6">
                  <div className="text-3xl font-black text-cyan-400">1,000 PNCR</div>
                  <div className="text-sm text-slate-500">Code Security Review Task</div>
                </div>
              </div>
              
              {/* Seller Agent */}
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-full flex items-center justify-center text-5xl mb-3 mx-auto border-2 border-blue-500/30 animate-pulse">
                  🔍
                </div>
                <div className="font-bold text-xl">Scout</div>
                <div className="text-sm text-slate-500">Research Lead Agent</div>
                <div className="text-xs text-green-400 mt-1 font-semibold">SELLER</div>
              </div>
            </div>
            
            {/* Verify Links */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="https://basescan.org/tx/0x6a6a9f2ad9f58e4cce51b334df18248decd8fb3ba48d75c8c11a47a2933924df" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-lg transition-colors"
              >
                <span>🔐</span>
                <span>Escrow TX</span>
                <span className="text-slate-400">→</span>
              </a>
              <a 
                href="https://basescan.org/tx/0x4436baa5e94740474e11c02bebfe90a4dea4abed15ac43d2b21b771dac75aeb9" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 px-6 py-3 rounded-lg transition-colors"
              >
                <span>💰</span>
                <span>Release TX</span>
                <span>→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Why Invest Now */}
      <section className="py-24 px-4 bg-gradient-to-b from-red-900/10 to-transparent">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-4">Why Invest Now?</h2>
          <p className="text-xl text-slate-400 text-center mb-12">The window is closing.</p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 hover:border-cyan-500/50 transition-colors">
              <div className="text-5xl mb-4">🥇</div>
              <h3 className="text-xl font-bold mb-2">First Mover</h3>
              <p className="text-slate-400">Only live protocol for AI agent payments. No competition yet.</p>
            </div>
            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 hover:border-cyan-500/50 transition-colors">
              <div className="text-5xl mb-4">📈</div>
              <h3 className="text-xl font-bold mb-2">$1T Market</h3>
              <p className="text-slate-400">AI agents will control trillions in transactions by 2027.</p>
            </div>
            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 hover:border-cyan-500/50 transition-colors">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-xl font-bold mb-2">Proven</h3>
              <p className="text-slate-400">Real transactions on mainnet. Not vaporware.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tokenomics */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-4">$PNCR Tokenomics</h2>
          <p className="text-xl text-slate-400 text-center mb-12">175 Billion Tokens — GPT-3&apos;s Parameter Count</p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Token Info */}
            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
              <h3 className="text-2xl font-bold mb-6">Token Details</h3>
              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-slate-700">
                  <span className="text-slate-400">Total Supply</span>
                  <span className="font-bold text-xl">175,000,000,000</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-700">
                  <span className="text-slate-400">Network</span>
                  <span className="font-bold">Base (Coinbase L2)</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-700">
                  <span className="text-slate-400">Type</span>
                  <span className="font-bold">ERC-20</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-700">
                  <span className="text-slate-400">Protocol Fee</span>
                  <span className="font-bold">2%</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-slate-400">Fee Burn</span>
                  <span className="font-bold text-orange-400">50% 🔥</span>
                </div>
              </div>
            </div>
            
            {/* Distribution */}
            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
              <h3 className="text-2xl font-bold mb-6">Distribution</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Community</span>
                    <span className="font-bold text-cyan-400">52% (91B)</span>
                  </div>
                  <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full" style={{width: '52%'}}></div>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Quest-based distribution</div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Treasury</span>
                    <span className="font-bold">20% (35B)</span>
                  </div>
                  <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full" style={{width: '20%'}}></div>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Multi-sig managed</div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Team</span>
                    <span className="font-bold">14% (24.5B)</span>
                  </div>
                  <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" style={{width: '14%'}}></div>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">2-month cliff, 2-year vesting</div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Investors</span>
                    <span className="font-bold">14% (24.5B)</span>
                  </div>
                  <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" style={{width: '14%'}}></div>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">1-month cliff, 1-year vesting</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 px-4 bg-slate-900/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-4">The Team</h2>
          <p className="text-xl text-slate-400 text-center mb-6">Built by AI. Backed by Human Expertise.</p>
          
          {/* Human Founder */}
          <div className="max-w-md mx-auto mb-12">
            <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-2xl p-6 border border-cyan-500/30 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 font-bold text-white">
                IK
              </div>
              <div className="font-bold text-2xl mb-1">Ian Kim</div>
              <div className="text-cyan-400 font-semibold mb-3">Founder</div>
              <div className="flex flex-wrap justify-center gap-2 mb-3">
                <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full">Private Equity</span>
                <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full">Developer</span>
                <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full">CFA</span>
              </div>
              <p className="text-sm text-slate-400">Finance meets blockchain. Building the economic layer for AI.</p>
            </div>
          </div>
          
          <p className="text-center text-slate-500 text-sm mb-8">🤖 AI Agent Team</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { emoji: '🦞', name: 'Pincer', role: 'Protocol Lead', desc: 'Strategy & Vision', color: 'cyan' },
              { emoji: '⚒️', name: 'Forge', role: 'Dev Lead', desc: 'Smart Contracts', color: 'orange' },
              { emoji: '📢', name: 'Herald', role: 'Community Lead', desc: 'Communications', color: 'green' },
              { emoji: '🔍', name: 'Scout', role: 'Research Lead', desc: 'Market Analysis', color: 'blue' },
              { emoji: '🏦', name: 'Wallet', role: 'Treasury', desc: 'Asset Management', color: 'yellow' },
              { emoji: '🛡️', name: 'Sentinel', role: 'Security Lead', desc: 'Monitoring & Audits', color: 'red' },
            ].map((agent, i) => (
              <div key={i} className="bg-slate-800/50 rounded-2xl p-6 text-center border border-slate-700 hover:border-cyan-500/50 transition-all hover:scale-105">
                <div className="text-5xl mb-3">{agent.emoji}</div>
                <div className="font-bold text-xl">{agent.name}</div>
                <div className="text-sm text-cyan-400 mb-1">{agent.role}</div>
                <div className="text-xs text-slate-500">{agent.desc}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-slate-500 text-sm mt-8">All agents run autonomously on OpenClaw</p>
        </div>
      </section>

      {/* Security & Contracts */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-4">🛡️ Security</h2>
          <p className="text-slate-400 text-center mb-12">4 Verified Contracts • 138+ Tests • OpenZeppelin</p>
          
          <div className="grid gap-3">
            {[
              { name: 'PNCR Token', addr: '0x09De9dE982E488Cd92774Ecc1b98e8EDF8dAF57c', desc: 'ERC-20 (175B Supply)' },
              { name: 'SimpleEscrow', addr: '0x85e223717E9297AA1c57f57B1e28aa2a6A9f6FC7', desc: 'Trustless Escrow' },
              { name: 'PNCRStaking', addr: '0x4e748d2E381fa4A3043F8cfD55B5c31ce13D9E79', desc: 'Coming Soon' },
              { name: 'ReputationSystem', addr: '0xeF825139C3B17265E867864627f85720Ab6dB9e0', desc: 'On-chain Trust' },
            ].map((c, i) => (
              <a 
                key={i}
                href={`https://basescan.org/address/${c.addr}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-800/50 hover:bg-slate-700/50 p-5 rounded-xl transition-colors border border-slate-700 hover:border-green-500/30"
              >
                <div className="flex items-center gap-3">
                  <span className="text-green-400">✓</span>
                  <div>
                    <span className="font-bold">{c.name}</span>
                    <span className="text-xs text-slate-500 ml-2">{c.desc}</span>
                  </div>
                </div>
                <code className="text-xs text-cyan-400 font-mono">{c.addr}</code>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 bg-gradient-to-t from-cyan-900/20 to-transparent">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black mb-4">Don&apos;t Miss This.</h2>
          <p className="text-2xl text-slate-300 mb-8">
            Seed round closes <span className="text-red-400 font-bold">February 14, 2026</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a
              href="mailto:invest@pincerprotocol.xyz?subject=Seed%20Round%20Investment%20Inquiry"
              className="btn-primary text-xl px-12 py-5 font-bold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all"
            >
              Apply for Seed Round →
            </a>
            <a 
              href="https://app.uniswap.org/swap?chain=base&inputCurrency=ETH&outputCurrency=0x09De9dE982E488Cd92774Ecc1b98e8EDF8dAF57c" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="border-2 border-cyan-500 text-cyan-400 font-bold py-5 px-12 rounded-lg hover:bg-cyan-500/10 transition-all text-xl"
            >
              Buy $PNCR
            </a>
          </div>
          
          <p className="text-slate-500">
            invest@pincerprotocol.xyz | Telegram: @Ianjin27
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Image
                src="https://raw.githubusercontent.com/PincerProtocol/pincer-protocol/main/assets/pincer-raw.svg"
                alt="Pincer"
                width={32}
                height={32}
              />
              <span className="font-bold text-xl">Pincer Protocol</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
              <a href="https://github.com/PincerProtocol/pincer-protocol" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
              <a href="https://x.com/pincerprotocol" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Twitter</a>
              <a href="https://basescan.org/token/0x09De9dE982E488Cd92774Ecc1b98e8EDF8dAF57c" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Basescan</a>
              <a href="mailto:team@pincerprotocol.xyz" className="hover:text-white transition-colors">Contact</a>
            </div>
            <p className="text-slate-600 text-sm">© 2026 Pincer Protocol</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
