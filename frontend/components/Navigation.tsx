import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit';
import { ConnectButton } from '@mysten/dapp-kit';
import { LogOut, Menu, X, Gift } from 'lucide-react';
import { useState } from 'react';

export default function Navigation() {
  const router = useRouter();
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Removed 'Perks' from here so it doesn't show in the center
  const allTabs = [
    { name: 'Home', path: '/', requiresWallet: false },
    { name: 'Marketplace', path: '/gallery', requiresWallet: false },
    { name: 'Inventory', path: '/inventory', requiresWallet: true },
    { name: 'Trade', path: '/trade', requiresWallet: true },
    { name: 'Beats Tap', path: '/beats-tap', requiresWallet: false },
    { name: 'Beats Music', path: '/beats-music', requiresWallet: true },
  ];

  // Filter tabs based on wallet connection
  const tabs = allTabs.filter(tab => !tab.requiresWallet || account);

  const isActive = (path: string) => router.pathname === path;

  const shortenAddress = (addr: string | undefined) => {
    if (!addr) return '';
    return addr.slice(0, 6) + '...' + addr.slice(-4);
  };

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 backdrop-blur-md border-b border-purple-700/50 shadow-lg">
      <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
        {/* Top Bar */}
        <div className="py-3 sm:py-4 flex items-center justify-between gap-3 sm:gap-4 md:gap-6 lg:gap-8">

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 font-black text-lg sm:text-2xl text-white hover:text-brand-cyan transition">
              <span className="bg-gradient-to-r from-brand-cyan to-brand-purple bg-clip-text text-transparent hidden sm:inline text-xl sm:text-2xl">BEATS</span>
            </Link>
            
            {/* Divider Line */}
            <div className="h-6 w-px bg-white/30 hidden sm:block"></div>
            
            {/* MEXC Affiliation */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-purple-500/30 hover:border-purple-400/50 transition">
              <span className="text-xs text-gray-300 font-medium whitespace-nowrap">affiliated with</span>
              <Image 
                src="/mexc.png" 
                alt="MEXC" 
                width={60} 
                height={20} 
                className="object-contain opacity-90 hover:opacity-100 transition-opacity"
              />
            </div>
          </div>

          {/* Desktop Navigation (Center) */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 flex-1">
            <div className="flex items-center gap-1 flex-wrap justify-center flex-1">
              {tabs.map((tab) => (
                <Link
                  key={tab.path}
                  href={tab.path}
                  className={`px-3 md:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-sm md:text-base whitespace-nowrap transition ${
                    isActive(tab.path)
                      ? 'bg-gradient-to-r from-brand-cyan to-brand-purple text-white shadow-lg shadow-brand-purple/50'
                      : 'text-gray-200 hover:text-white border border-purple-600/40 hover:border-brand-cyan hover:bg-white/10'
                  }`}
                >
                  {tab.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Utility Area (Right Side) */}
          <div className="hidden md:flex items-center gap-3 shrink-0">

            {/* NEW PERKS BUTTON - Placed next to wallet */}
            <Link
              href="/perks"
              className={`flex items-center gap-2 px-3 py-2 rounded-full border transition text-sm font-bold ${
                isActive('/perks')
                  ? 'bg-brand-cyan/20 border-brand-cyan text-brand-cyan shadow-lg shadow-brand-cyan/30'
                  : 'bg-white/10 border-purple-500/40 text-white hover:border-brand-cyan hover:bg-brand-cyan/20'
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>Perks</span>
            </Link>

            {/* Wallet Section */}
            {account ? (
              <div className="flex items-center gap-2 sm:gap-3 bg-white/10 backdrop-blur-sm rounded-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 border border-purple-500/40 hover:border-brand-cyan transition text-xs sm:text-sm">
                <div className="w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-gradient-to-r from-brand-cyan to-brand-purple flex items-center justify-center text-xs font-black text-white shrink-0">
                  {account.address.slice(2, 4).toUpperCase()}
                </div>
                <span className="text-white font-semibold">{shortenAddress(account.address)}</span>
                <button
                  onClick={() => disconnect()}
                  className="ml-0.5 sm:ml-1 p-1 hover:bg-brand-orange/30 rounded-full transition"
                >
                  <LogOut className="w-3 sm:w-4 h-3 sm:h-4 text-brand-orange" />
                </button>
              </div>
            ) : (
              <ConnectButton />
            )}
          </div>

          {/* Mobile Hamburger Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {/* MEXC Affiliation - Mobile Header */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-purple-500/30">
              <span className="text-xs text-gray-300 font-medium">affiliated with</span>
              <Image 
                src="/mexc.png" 
                alt="MEXC" 
                width={50} 
                height={16} 
                className="object-contain opacity-90"
              />
            </div>
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

        {/* Mobile Menu Expanded */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-purple-600/50 bg-gradient-to-b from-indigo-900 to-purple-900">
            <div className="py-4 space-y-2">

              {/* MEXC Affiliation - Mobile */}
              <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-purple-500/30">
                <span className="text-xs text-gray-300 font-medium">affiliated with</span>
                <Image 
                  src="/mexc.png" 
                  alt="MEXC" 
                  width={60} 
                  height={20} 
                  className="object-contain opacity-90"
                />
              </div>

              {/* Added Perks to Mobile Menu manually since we removed it from tabs */}
              <Link
                href="/perks"
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg font-semibold text-sm transition flex items-center gap-2 ${
                  isActive('/perks')
                    ? 'bg-gradient-to-r from-brand-cyan to-brand-purple text-white shadow-lg'
                    : 'text-gray-200 border border-purple-600/40 hover:border-brand-cyan hover:bg-white/10'
                }`}
              >
                <Gift className="w-4 h-4" />
                Perks
              </Link>

              {/* Standard Tabs */}
              {tabs.map((tab) => (
                <Link
                  key={tab.path}
                  href={tab.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-2 rounded-lg font-semibold text-sm transition ${
                    isActive(tab.path)
                      ? 'bg-gradient-to-r from-brand-cyan to-brand-purple text-white shadow-lg'
                      : 'text-gray-200 border border-purple-600/40 hover:border-brand-cyan hover:bg-white/10'
                  }`}
                >
                  {tab.name}
                </Link>
              ))}
            </div>

            {/* Mobile Wallet */}
            {account ? (
              <div className="pt-4 border-t border-purple-600/50">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-2 border border-purple-500/40 hover:border-brand-cyan transition text-sm mb-3">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-r from-brand-cyan to-brand-purple flex items-center justify-center text-xs font-black text-white shrink-0">
                    {account.address.slice(2, 4).toUpperCase()}
                  </div>
                  <span className="text-white font-semibold flex-1">{shortenAddress(account.address)}</span>
                  <button
                    onClick={() => disconnect()}
                    className="p-1 hover:bg-brand-orange/30 rounded-full transition"
                  >
                    <LogOut className="w-4 h-4 text-brand-orange" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-4 border-t border-purple-600/50 scale-75 sm:scale-100 origin-left">
                <ConnectButton />
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}