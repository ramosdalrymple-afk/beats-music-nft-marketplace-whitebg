import Head from 'next/head';
import { Music } from 'lucide-react';

export default function Marketplace() {
  return (
    <>
      <Head>
        <title>Marketplace - Beats</title>
        <meta name="description" content="Buy and sell music NFTs on the Beats marketplace" />
      </Head>

      <div className="min-h-screen text-white space-y-8" style={{
        backgroundImage: 'linear-gradient(135deg, rgba(10, 14, 39, 0.85) 0%, rgba(20, 24, 41, 0.85) 100%), url(/marketplace.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        padding: '2rem'
      }}>
        <div className="space-y-2">
          {/* <h1 className="text-4xl md:text-5xl font-black">Marketplace</h1> */}
          <h1 className="text-4xl md:text-5xl font-black neon-text-glow">Marketplace</h1>
          <p className="text-lg text-slate-300">
            Beats Marketplace is the heart of the Beats' 
            project. It is created to support the project 
            perfectly. Designed to open doors to different 
            creators everywhere and to be the main 
            platform where they can auction their own 
            creations or arts. The team has worked 
            entirely to develop its own token which will 
            generate higher demand for the market - 
            the $SOUL Token. Every art is purchased 
            using the $SOUL Token. With all these 
            amazing features, it is one step away from a 
            great and bigger community of Beats 
            Marketplace users.
            </p>
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
