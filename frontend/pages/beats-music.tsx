import Head from 'next/head';
import { Music } from 'lucide-react';

export default function BeatsMusic() {
  return (
    <>
      <Head>
        <title>Beats Music - Beats</title>
        <meta name="description" content="Explore and stream music from Beats artists" />
      </Head>

      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black">Beats Music</h1>
          <p className="text-lg text-slate-300">Stream exclusive tracks from your favorite artists</p>
        </div>

        <div className="glass-dark rounded-lg p-12 border border-brand-purple/20 text-center space-y-4">
          <Music className="w-16 h-16 mx-auto text-brand-purple/50" />
          <p className="text-slate-400 text-lg">Music streaming coming soon</p>
          <p className="text-slate-500">Browse our collection of premium beats</p>
        </div>
      </div>
    </>
  );
}
