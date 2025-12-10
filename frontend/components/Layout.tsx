import Link from 'next/link';
import { useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit';
import { ConnectButton } from '@mysten/dapp-kit';
import { LogOut } from 'lucide-react';
import Navigation from './Navigation';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-dark text-white">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
