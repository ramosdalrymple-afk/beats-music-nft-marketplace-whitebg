import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit';
import { ConnectButton } from '@mysten/dapp-kit';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navigation() {
  const router = useRouter();
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const tabs = [
    { name: 'Home', path: '/' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Marketplace', path: '/marketplace' },
    { name: 'Inventory', path: '/inventory' },
    { name: 'Beats Tap', path: '/beats-tap' },
    { name: 'Beats Music', path: '/beats-music' },
  ];

  const isActive = (path: string) => router.pathname === path;

  const shortenAddress = (addr: string | undefined) => {
    if (!addr) return '';
    return addr.slice(0, 6) + '...' + addr.slice(-4);
  };

  return (
    <nav className="sticky top-0 z-50 bg-gradient-dark border-b border-brand-purple/20 glass-dark">
      <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
        {/* Top Bar */}
        <div className="py-3 sm:py-4 flex items-center justify-between gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 font-black text-lg sm:text-2xl hover:text-brand-purple transition shrink-0">
            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-brand rounded-lg flex items-center justify-center">
              <span className="text-white text-base sm:text-lg">♪</span>
            </div>
            <span className="neon-text-glow hidden sm:inline text-xl sm:text-2xl">BEATS</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 flex-1">
            {/* Tab Navigation - Desktop */}
            <div className="flex items-center gap-1 flex-wrap justify-center flex-1">
              {tabs.map((tab) => (
                <Link
                  key={tab.path}
                  href={tab.path}
                  className={`px-3 md:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-sm md:text-base whitespace-nowrap transition ${
                    isActive(tab.path)
                      ? 'bg-gradient-brand text-white shadow-brand glow-brand'
                      : 'text-slate-400 hover:text-brand-cyan border border-brand-purple/20 hover:border-brand-purple/50'
                  }`}
                >
                  {tab.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Wallet */}
          <div className="hidden md:block shrink-0">
            {account ? (
              <div className="flex items-center gap-2 sm:gap-3 glass-dark rounded-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 border border-brand-purple/30 hover:border-brand-purple/60 transition text-xs sm:text-sm">
                <div className="w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-gradient-purple-orange flex items-center justify-center text-xs font-black text-white shrink-0">
                  {account.address.slice(2, 4).toUpperCase()}
                </div>
                <span className="text-brand-purple font-semibold">{shortenAddress(account.address)}</span>
                <button
                  onClick={() => disconnect()}
                  className="ml-0.5 sm:ml-1 p-1 hover:bg-brand-orange/20 rounded-full transition"
                >
                  <LogOut className="w-3 sm:w-4 h-3 sm:h-4 text-brand-orange" />
                </button>
              </div>
            ) : (
              <ConnectButton />
            )}
          </div>

          {/* Mobile Hamburger Menu */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-brand-purple/20 rounded-lg transition"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-brand-cyan" />
              ) : (
                <Menu className="w-6 h-6 text-brand-cyan" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-brand-purple/20">
            {/* Mobile Tabs */}
            <div className="py-4 space-y-2">
              {tabs.map((tab) => (
                <Link
                  key={tab.path}
                  href={tab.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-2 rounded-lg font-semibold text-sm transition ${
                    isActive(tab.path)
                      ? 'bg-gradient-brand text-white shadow-brand glow-brand'
                      : 'text-slate-400 hover:text-brand-cyan border border-brand-purple/20 hover:border-brand-purple/50'
                  }`}
                >
                  {tab.name}
                </Link>
              ))}
            </div>

            {/* Mobile Wallet */}
            {account ? (
              <div className="pt-4 border-t border-brand-purple/20">
                <div className="flex items-center gap-2 glass-dark rounded-full px-3 py-2 border border-brand-purple/30 hover:border-brand-purple/60 transition text-sm mb-3">
                  <div className="w-5 h-5 rounded-full bg-gradient-purple-orange flex items-center justify-center text-xs font-black text-white shrink-0">
                    {account.address.slice(2, 4).toUpperCase()}
                  </div>
                  <span className="text-brand-purple font-semibold flex-1">{shortenAddress(account.address)}</span>
                  <button
                    onClick={() => disconnect()}
                    className="p-1 hover:bg-brand-orange/20 rounded-full transition"
                  >
                    <LogOut className="w-4 h-4 text-brand-orange" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-4 border-t border-brand-purple/20 scale-75 sm:scale-100 origin-left">
                <ConnectButton />
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
