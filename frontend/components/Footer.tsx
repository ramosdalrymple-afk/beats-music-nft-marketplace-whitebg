import Link from 'next/link';
import { Music, Twitter, MessageCircle, Github } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    marketplace: [
      { name: 'Browse NFTs', href: '/gallery' },
      { name: 'My Inventory', href: '/inventory' },
      { name: 'Trading', href: '/trade' },
      { name: 'NFT Perks', href: '/perks' },
    ],
    earn: [
      { name: 'Beats Tap', href: '/beats-tap' },
      { name: 'Beats Music', href: '/beats-music' },
      { name: 'Skybeats Protocol', href: '/perks?tab=skybeats' },
      { name: 'VIP Signals', href: '/perks?tab=signals' },
    ],
    about: [
      { name: 'Soul Collection', href: '/#soul-collection' },
      { name: 'Roadmap', href: '/#roadmap' },
      { name: 'Team', href: '/#team' },
      { name: 'FAQ', href: '/#faq' },
    ],
  };

  return (
    <footer className="bg-gradient-to-b from-gray-900 via-indigo-900 to-purple-900 text-white border-t border-purple-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Music className="w-8 h-8 text-brand-cyan" />
              <span className="text-2xl font-black bg-gradient-to-r from-brand-cyan to-brand-purple bg-clip-text text-transparent">
                BEATS
              </span>
            </Link>
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">
              An interactive NFT Art Fair featuring Soul Collection of legendary artists.
              Stake, trade, and play to earn in the Musicverse.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-lg hover:bg-brand-cyan/20 hover:text-brand-cyan transition"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-lg hover:bg-brand-purple/20 hover:text-brand-purple transition"
                aria-label="Discord"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-lg hover:bg-brand-orange/20 hover:text-brand-orange transition"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Marketplace Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-brand-cyan">Marketplace</h3>
            <ul className="space-y-2">
              {footerLinks.marketplace.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-brand-cyan transition text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Earn Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-brand-purple">Earn</h3>
            <ul className="space-y-2">
              {footerLinks.earn.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-brand-purple transition text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-brand-orange">About</h3>
            <ul className="space-y-2">
              {footerLinks.about.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-brand-orange transition text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-y border-purple-700/30">
          <div className="text-center">
            <p className="text-3xl font-black bg-gradient-to-r from-brand-cyan to-brand-purple bg-clip-text text-transparent">
              4,444
            </p>
            <p className="text-gray-400 text-xs uppercase tracking-wide mt-1">Unique NFTs</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black bg-gradient-to-r from-brand-purple to-brand-orange bg-clip-text text-transparent">
              $SOUL
            </p>
            <p className="text-gray-400 text-xs uppercase tracking-wide mt-1">Token</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black bg-gradient-to-r from-brand-cyan to-brand-purple bg-clip-text text-transparent">
              SUI
            </p>
            <p className="text-gray-400 text-xs uppercase tracking-wide mt-1">Blockchain</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black bg-gradient-to-r from-brand-orange to-brand-cyan bg-clip-text text-transparent">
              P2E
            </p>
            <p className="text-gray-400 text-xs uppercase tracking-wide mt-1">Play to Earn</p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-400 text-sm text-center md:text-left">
            <p>&copy; {currentYear} Beats NFT Marketplace. All rights reserved.</p>
            <p className="mt-1">Built on Sui Blockchain • Powered by Soul Collection</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400">
            <Link href="/privacy" className="hover:text-brand-cyan transition">
              Privacy Policy
            </Link>
            <span className="text-gray-600">•</span>
            <Link href="/terms" className="hover:text-brand-cyan transition">
              Terms of Service
            </Link>
            <span className="text-gray-600">•</span>
            <Link href="/docs" className="hover:text-brand-cyan transition">
              Documentation
            </Link>
          </div>
        </div>

        {/* Powered By Section */}
        <div className="mt-8 pt-6 border-t border-purple-700/30 text-center">
          <p className="text-gray-400 text-xs mb-2">Secured by</p>
          <div className="flex justify-center items-center gap-2">
            <div className="px-4 py-2 bg-white/5 rounded-lg border border-purple-500/20">
              <span className="text-brand-cyan font-bold text-sm">SUI BLOCKCHAIN</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
