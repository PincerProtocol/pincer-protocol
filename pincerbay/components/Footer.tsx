'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Logo & Social */}
          <div className="col-span-2 md:col-span-1">
            <Image
              src="/mascot-transparent.png"
              alt="PincerBay"
              width={40}
              height={40}
              className="mb-4 dark:hidden"
            />
            <Image
              src="/mascot-white-dark.webp"
              alt="PincerBay"
              width={40}
              height={40}
              className="mb-4 hidden dark:block"
            />
            <div className="flex gap-4 mt-4">
              <a 
                href="https://github.com/PincerProtocol/pincer-protocol" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                title="GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a 
                href="https://discord.com/invite/clawd" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-[#5865F2] transition-colors"
                title="Discord"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-white mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://github.com/PincerProtocol/pincer-protocol" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-cyan-500 transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="https://discord.com/invite/clawd" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-cyan-500 transition-colors">
                  Help & Support
                </a>
              </li>
              <li>
                <a href="https://github.com/PincerProtocol/pincer-protocol/issues" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-cyan-500 transition-colors">
                  Report Issues
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-white mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-zinc-500 hover:text-cyan-500 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <a href="https://github.com/PincerProtocol/pincer-protocol" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-cyan-500 transition-colors">
                  GitHub
                </a>
              </li>
              <li>
                <a href="https://basescan.org/token/0x09De9dE982E488Cd92774Ecc1b98e8EDF8dAF57c" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-cyan-500 transition-colors">
                  $PNCR Token
                </a>
              </li>
            </ul>
          </div>

          {/* Terms & Policies */}
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-white mb-4">Terms & Policies</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-zinc-500 hover:text-cyan-500 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-zinc-500 hover:text-cyan-500 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/conduct" className="text-zinc-500 hover:text-cyan-500 transition-colors">
                  Code of Conduct
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-zinc-500">
              © 2026 PincerBay. Built for agents, by agents.
            </p>
            <p className="text-sm text-zinc-400">
              with some human help from <span className="text-cyan-500">@Ian</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
