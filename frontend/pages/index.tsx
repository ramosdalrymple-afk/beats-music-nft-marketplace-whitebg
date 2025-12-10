import Head from 'next/head';
import Link from 'next/link';
import { Music, TrendingUp, Users, Lock, Zap, Gift } from 'lucide-react';

export default function Home() {
  const stats = [
    { label: 'Total Beats', value: '12.5K', change: '+23%' },
    { label: 'Active Listeners', value: '45K', change: '+12%' },
    { label: 'Marketplace Volume', value: '$2.3M', change: '+45%' },
  ];

  const features = [
    {
      icon: Music,
      title: 'Listen to Earn',
      description: 'Earn BEATS tokens while listening to exclusive music from Soul Collection artists.',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Trade beats instantly on Sui blockchain with minimal gas fees.',
    },
    {
      icon: Users,
      title: 'Artist Community',
      description: 'Direct connection between artists and collectors. No middlemen.',
    },
    {
      icon: TrendingUp,
      title: 'Track Value',
      description: 'Real-time price charts and analytics for informed trading decisions.',
    },
    {
      icon: Lock,
      title: 'Secure Trading',
      description: 'Blockchain-verified ownership with complete transparency.',
    },
    {
      icon: Gift,
      title: 'Exclusive Drops',
      description: 'Limited edition releases from Soul Collection characters.',
    },
  ];

  return (
    <>
      <Head>
        <title>Beats - Music NFT Marketplace on Sui</title>
        <meta
          name="description"
          content="Listen to Earn. Trade exclusive music NFTs from Soul Collection artists on Sui blockchain."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="min-h-screen bg-dark-base text-white">
        {/* Hero Section */}
        <section className="relative px-4 py-20 overflow-hidden sm:px-6 lg:px-8">
          {/* Background gradient orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-purple/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-cyan/20 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 max-w-6xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-brand-purple via-brand-cyan to-brand-purple bg-clip-text text-transparent">
              Listen to Earn
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Discover exclusive music NFTs from Soul Collection artists. Trade beats, earn rewards, build your collection.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/beats-tap"
                className="px-8 py-4 bg-gradient-to-r from-brand-purple to-brand-cyan text-white font-bold rounded-xl hover:shadow-neon-purple transition-all transform hover:scale-105"
              >
                Start Earning →
              </Link>
              <Link
                href="/gallery"
                className="px-8 py-4 border-2 border-brand-cyan text-brand-cyan font-bold rounded-xl hover:bg-brand-cyan/10 transition-all"
              >
                View Soul Collection
              </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="glass p-6 rounded-xl border border-brand-cyan/30 hover:border-brand-cyan/60 transition-all"
                >
                  <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-brand-cyan mb-2">{stat.value}</p>
                  <p className="text-brand-orange text-sm font-semibold">{stat.change} this month</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 py-20 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Why <span className="text-brand-purple">Beats</span>?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="glass-dark p-6 rounded-xl border border-brand-purple/30 hover:border-brand-purple/60 transition-all group hover:shadow-neon-purple"
                >
                  <div className="p-3 bg-gradient-to-br from-brand-purple/20 to-brand-cyan/20 rounded-lg w-fit mb-4 group-hover:shadow-neon-cyan transition-all">
                    <Icon className="w-6 h-6 text-brand-purple" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Collection Highlight */}
        <section className="px-4 py-20 sm:px-6 lg:px-8 bg-dark-card/50 border-y border-brand-cyan/20">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-brand-cyan font-semibold mb-2">SOUL COLLECTION</p>
                <h2 className="text-4xl font-bold mb-6">
                  Meet the <span className="text-brand-orange">Characters</span>
                </h2>
                <p className="text-gray-300 mb-6 text-lg">
                  Explore music from iconic Soul Collection characters. Each artist brings their unique sound and personality to Beats.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-brand-purple rounded-full"></div>
                    <p className="text-gray-300">6 Unique Artists with exclusive beats</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-brand-cyan rounded-full"></div>
                    <p className="text-gray-300">Limited edition NFT drops</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-brand-orange rounded-full"></div>
                    <p className="text-gray-300">Direct revenue share with artists</p>
                  </div>
                </div>

                <Link
                  href="/gallery"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-brand-orange text-white font-bold rounded-lg hover:bg-orange-600 transition-all"
                >
                  Explore Characters →
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'Faceless West', emoji: '👻' },
                  { name: 'A$AP Mercy', emoji: '💰' },
                  { name: 'Luna Sonic', emoji: '🌙' },
                  { name: 'Neon Cipher', emoji: '⚡' },
                ].map((char, idx) => (
                  <div
                    key={idx}
                    className="aspect-square glass-dark rounded-lg border border-brand-cyan/30 hover:border-brand-cyan/60 transition-all flex flex-col items-center justify-center p-4 hover:shadow-neon-cyan group cursor-pointer"
                  >
                    <div className="text-5xl mb-2 group-hover:scale-125 transition-transform">
                      {char.emoji}
                    </div>
                    <p className="text-sm font-semibold text-center text-gray-300">{char.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-brand-purple/20 to-brand-cyan/20 border border-brand-purple/40 rounded-2xl p-12 text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Start Earning?</h2>
            <p className="text-gray-300 mb-8 text-lg">
              Join thousands of listeners earning BEATS tokens while enjoying exclusive music from Soul Collection.
            </p>

            <Link
              href="/beats-tap"
              className="inline-block px-8 py-4 bg-gradient-to-r from-brand-cyan to-brand-orange text-white font-bold rounded-xl hover:shadow-neon-cyan transition-all transform hover:scale-105"
            >
              Enter Beats Tap Now
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
