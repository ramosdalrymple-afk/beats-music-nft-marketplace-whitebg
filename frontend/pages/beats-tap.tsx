import Head from 'next/head';
import { useState } from 'react';
import ListenToEarnPlayer from '@/components/ListenToEarnPlayer';
import { Zap, Award, TrendingUp } from 'lucide-react';

interface BeatSession {
  character: string;
  beatTitle: string;
  artist: string;
  emoji: string;
  image: string;
}

const beatSessions: BeatSession[] = [
  {
    character: 'Faceless West',
    beatTitle: 'Lost Whispers',
    artist: 'Faceless West',
    emoji: '👻',
    image: '/character/faceless-west.png',
  },
  {
    character: 'A$AP Mercy',
    beatTitle: 'Golden Hour',
    artist: 'A$AP Mercy',
    emoji: '💰',
    image: '/character/asap-mercy.png',
  },
  {
    character: 'Luna Sonic',
    beatTitle: 'Moonlit Dreams',
    artist: 'Luna Sonic',
    emoji: '🌙',
    image: '/character/luna-sonic.png',
  },
];

export default function BeatsTap() {
  const [selectedBeat, setSelectedBeat] = useState(beatSessions[0]);
  const [totalEarnings, setTotalEarnings] = useState(12.45);
  const [dailyGoal, setDailyGoal] = useState(5);

  return (
    <>
      <Head>
        <title>Beats Tap - Listen to Earn | Beats</title>
        <meta name="description" content="Earn SUI by listening to amazing music" />
      </Head>

      <div className="min-h-screen text-white space-y-8" style={{
        backgroundImage: 'linear-gradient(135deg, rgba(10, 14, 39, 0.85) 0%, rgba(20, 24, 41, 0.85) 100%), url(/beats-tap-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        padding: '2rem'
      }}>
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-6 h-6 text-brand-orange animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-black neon-text-glow">Listen to Earn</h1>
          </div>
          <p className="text-lg text-slate-300">
            Beats Music is a Blockchain music were Holders can use their NFT’s to earn $SOUL Token. (TBA)
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Player Section */}
          <div className="lg:col-span-2">
            <ListenToEarnPlayer
              beatTitle={selectedBeat.beatTitle}
              artist={selectedBeat.artist}
              characterName={selectedBeat.character}
            />
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            {/* Total Stats */}
            <div className="glass-dark rounded-lg p-6 border border-brand-purple/30 space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Award className="w-5 h-5 text-brand-orange" />
                Today's Stats
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Total Earned</p>
                  <p className="text-3xl font-black text-brand-cyan">{totalEarnings} SUI</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Daily Goal</p>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-brand-orange">{dailyGoal}/50</span>
                    <div className="flex-1 h-2 bg-dark-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-purple-orange transition-all"
                        style={{ width: `${(dailyGoal / 50) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Boost Info */}
            <div className="glass-dark rounded-lg p-6 border border-brand-orange/30 space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Zap className="w-5 h-5 text-brand-orange" />
                Active Boosts
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Soul Collection Boost</span>
                  <span className="font-bold text-brand-orange">+50%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Streak Bonus</span>
                  <span className="font-bold text-brand-purple">+1.5x</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Referral Boost</span>
                  <span className="font-bold text-brand-cyan">+10%</span>
                </div>
                <div className="pt-3 border-t border-brand-orange/20">
                  <p className="font-bold text-brand-orange">Total Multiplier: 2.9x</p>
                </div>
              </div>
            </div>

            {/* Leaderboard Preview */}
            <div className="glass-dark rounded-lg p-6 border border-brand-cyan/30 space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-brand-cyan" />
                Weekly Leaders
              </h3>
              <div className="space-y-2 text-sm">
                {[
                  { rank: 1, name: 'SonicMaster', earnings: 245.3 },
                  { rank: 2, name: 'BeatHunter', earnings: 198.5 },
                  { rank: 3, name: 'You', earnings: totalEarnings },
                ].map((user) => (
                  <div key={user.rank} className="flex justify-between items-center py-2 border-b border-brand-cyan/10 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-brand-orange w-6">{user.rank}.</span>
                      <span className={user.name === 'You' ? 'text-brand-cyan font-bold' : 'text-slate-400'}>
                        {user.name}
                      </span>
                    </div>
                    <span className="font-bold text-brand-purple">{user.earnings}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Beat Selection */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Now Playing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {beatSessions.map((beat, index) => (
              <button
                key={index}
                onClick={() => setSelectedBeat(beat)}
                className={`p-4 rounded-lg transition-all duration-300 border overflow-hidden relative group hover:shadow-brand hover:-translate-y-2 ${
                  selectedBeat.character === beat.character
                    ? 'border-brand-purple/50 shadow-brand'
                    : 'border-brand-purple/20 hover:border-brand-purple/50'
                }`}
                style={{
                  backgroundImage: `url(${beat.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {/* Dark overlay */}
                <div className={`absolute inset-0 transition ${
                  selectedBeat.character === beat.character
                    ? 'bg-gradient-to-t from-dark-base via-dark-base/50 to-transparent'
                    : 'bg-gradient-to-t from-dark-base via-dark-base/70 to-transparent'
                }`} />
                
                {/* Content */}
                <div className="relative z-10">
                  <h3 className="font-bold mb-1 text-white">{beat.character}</h3>
                  <p className="text-sm opacity-75 text-gray-300">{beat.beatTitle}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gradient-to-r from-brand-purple/10 via-brand-cyan/10 to-brand-orange/10 rounded-lg p-6 border border-brand-purple/20">
          <h2 className="text-2xl font-bold mb-4">How Listen to Earn Works</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="w-10 h-10 bg-brand-purple rounded-full flex items-center justify-center font-black mb-2">
                1
              </div>
              <h3 className="font-bold">$SOUL Token</h3>
              <p className="text-slate-400 text-sm">
                $SOUL Token will be used to create, power 
                and sustain the Beats ecosystem.
                To this end the team has created a 
                tokenomics model that ensures enough 
                token liquidity at each stage of project 
                development as well as healthy token 
                release rate compensated by a built-in 
                token burn mechanism.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 bg-brand-orange rounded-full flex items-center justify-center font-black mb-2">
                2
              </div>
              <h3 className="font-bold">Currency:</h3>
              <p className="text-slate-400 text-sm">
                $SOUL Token will serve as the basic currency 
                for Beats Marketplace. 
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 bg-brand-cyan rounded-full flex items-center justify-center font-black mb-2">
                3
              </div>
              <h3 className="font-bold">Premium Services</h3>
              <p className="text-slate-400 text-sm">
                $SOUL Token will be the ticket to accessing a 
                range of other In-app and cloud services as 
                development continues. Will also be used in 
                purchasing Merch, event ticket, auctions and 
                more!
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
