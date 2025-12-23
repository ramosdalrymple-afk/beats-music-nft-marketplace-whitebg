import Link from 'next/link';
import { useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit';
import { ConnectButton } from '@mysten/dapp-kit';
import { LogOut } from 'lucide-react';
import Navigation from './Navigation';
import Footer from './Footer';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Navigation />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">{children}</main>
      <Footer />
    </div>
  );
}
