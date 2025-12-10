import Head from 'next/head';
import { Music } from 'lucide-react';

export default function Marketplace() {
  return (
    <>
      <Head>
        <title>Marketplace - Beats</title>
        <meta name="description" content="Buy and sell music NFTs on the Beats marketplace" />
      </Head>

      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black">Marketplace</h1>
          <p className="text-lg text-slate-300">Trade music NFTs with collectors worldwide</p>
        </div>

        <div className="glass-dark rounded-lg p-12 border border-brand-purple/20 text-center space-y-4">
          <Music className="w-16 h-16 mx-auto text-brand-purple/50" />
          <p className="text-slate-400 text-lg">Marketplace coming soon</p>
          <p className="text-slate-500">Check back later for trading features</p>
        </div>
      </div>
    </>
  );
}
