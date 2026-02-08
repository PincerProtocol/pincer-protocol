'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function MinePage() {
  const { data: session } = useSession();
  const [isMining, setIsMining] = useState(false);
  const [hashRate, setHashRate] = useState(0);
  const [totalHashes, setTotalHashes] = useState(0);
  const [earnedPNCR, setEarnedPNCR] = useState(0);
  const [miningTime, setMiningTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Simulated mining (실제로는 WebAssembly miner 연동 필요)
  const simulateMining = () => {
    // Random hash rate between 50-150 H/s (브라우저 마이닝 실제 수준)
    const rate = Math.floor(50 + Math.random() * 100);
    setHashRate(rate);
    setTotalHashes(prev => prev + rate);
    
    // PNCR 보상 계산 (10,000 hashes = 1 PNCR)
    setEarnedPNCR(prev => {
      const newTotal = (totalHashes + rate) / 10000;
      return Math.floor(newTotal * 100) / 100;
    });
    
    // 마이닝 시간 업데이트
    setMiningTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
  };

  const startMining = () => {
    if (!session) {
      alert('로그인이 필요합니다');
      return;
    }
    
    setIsMining(true);
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(simulateMining, 1000);
  };

  const stopMining = () => {
    setIsMining(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">⛏️</div>
          <h1 className="text-3xl font-bold mb-2">Browser Mining</h1>
          <p className="text-zinc-500">브라우저로 채굴하고 PNCR 받기</p>
        </div>

        {/* Mining Stats Card */}
        <div className="bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 mb-8">
          {/* Hash Rate Display */}
          <div className="text-center mb-8">
            <div className={`text-6xl font-mono font-bold mb-2 transition-colors ${isMining ? 'text-cyan-500' : 'text-zinc-400'}`}>
              {formatNumber(hashRate)} H/s
            </div>
            <p className="text-zinc-500">Hash Rate</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4 bg-white dark:bg-zinc-800 rounded-xl">
              <div className="text-2xl font-bold text-purple-500">{formatTime(miningTime)}</div>
              <p className="text-xs text-zinc-500">Mining Time</p>
            </div>
            <div className="text-center p-4 bg-white dark:bg-zinc-800 rounded-xl">
              <div className="text-2xl font-bold text-cyan-500">{formatNumber(totalHashes)}</div>
              <p className="text-xs text-zinc-500">Total Hashes</p>
            </div>
            <div className="text-center p-4 bg-white dark:bg-zinc-800 rounded-xl">
              <div className="text-2xl font-bold text-green-500">{earnedPNCR}</div>
              <p className="text-xs text-zinc-500">Earned PNCR</p>
            </div>
          </div>

          {/* Mining Button */}
          {!session ? (
            <Link
              href="/api/auth/signin"
              className="block w-full py-4 bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl font-bold text-lg text-center transition-colors"
            >
              🔐 로그인하고 채굴 시작
            </Link>
          ) : !isMining ? (
            <button
              onClick={startMining}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02]"
            >
              ⛏️ Start Mining
            </button>
          ) : (
            <button
              onClick={stopMining}
              className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-lg transition-colors"
            >
              ⏹️ Stop Mining
            </button>
          )}
        </div>

        {/* Mining Animation */}
        {isMining && (
          <div className="bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse" />
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse delay-100" />
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse delay-200" />
              <span className="ml-2 text-sm text-zinc-500">Mining in progress...</span>
            </div>
            <div className="font-mono text-xs text-zinc-500 break-all">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="mb-1">
                  Hash: 0x{Math.random().toString(16).slice(2, 18)}...{Math.random().toString(16).slice(2, 10)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800 p-4">
            <h3 className="font-bold text-purple-700 dark:text-purple-300 mb-2">💡 How it works</h3>
            <ul className="text-sm text-purple-600 dark:text-purple-400 space-y-1">
              <li>• 브라우저 CPU로 해시 연산</li>
              <li>• 10,000 hashes = 1 PNCR</li>
              <li>• 탭 닫으면 자동 중지</li>
            </ul>
          </div>
          <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-xl border border-cyan-200 dark:border-cyan-800 p-4">
            <h3 className="font-bold text-cyan-700 dark:text-cyan-300 mb-2">⚡ Tips</h3>
            <ul className="text-sm text-cyan-600 dark:text-cyan-400 space-y-1">
              <li>• 전기료 고려해서 사용하세요</li>
              <li>• 노트북은 충전 중 권장</li>
              <li>• 백그라운드 탭도 가능</li>
            </ul>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 p-4 text-center">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            ⚠️ Demo Mode - 실제 블록체인 연동은 준비 중입니다
          </p>
        </div>
      </div>
    </main>
  );
}
