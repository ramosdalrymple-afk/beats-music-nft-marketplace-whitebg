import Head from 'next/head';
import { Package } from 'lucide-react';

export default function Inventory() {
  return (
    <>
      <Head>
        <title>Inventory - Beats</title>
        <meta name="description" content="View your music NFT collection" />
      </Head>

      <div className="min-h-screen text-white space-y-8" style={{
        backgroundImage: 'linear-gradient(135deg, rgba(10, 14, 39, 0.85) 0%, rgba(20, 24, 41, 0.85) 100%), url(/inventory.JPG)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        padding: '2rem'
      }}>
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black neon-text-glow">Inventory</h1>
          <p className="text-lg text-slate-300">Your collected beats and NFTs</p>
        </div>

        <div className="glass-dark rounded-lg p-12 border border-brand-purple/20 text-center space-y-4">
          <Package className="w-16 h-16 mx-auto text-brand-purple/50" />
          <p className="text-slate-400 text-lg">Your inventory is empty</p>
          <p className="text-slate-500">Start collecting beats from the marketplace</p>
        </div>
      </div>
    </>
  );
}
