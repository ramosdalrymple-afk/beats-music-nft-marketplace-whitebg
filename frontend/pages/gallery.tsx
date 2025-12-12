import Head from 'next/head';
import { Heart, Play } from 'lucide-react';

interface Character {
  id: string;
  name: string;
  emoji: string;
  image?: string;
  color: string;
  borderColor: string;
  description: string;
}

const characters: Character[] = [
  {
    id: 'neon-afterimage',
    name: 'Neon Afterimage',
    emoji: '👻',
    image: '/characters/neon-afterimage.png',
    color: 'from-slate-600 to-slate-800',
    borderColor: 'border-slate-500',
    description: 'A synth-heavy producer blending retro-futuristic sounds with bright, glowing textures.',
  },
  {
    id: '808-phantom-drive',
    name: '808 Phantom Drive',  
    emoji: '🎹',
    image: '/characters/808-phantom-drive.png',
    color: 'from-amber-600 to-orange-800',
    borderColor: 'border-amber-500',
    description: 'Deep basslines and ghostly beats that haunt the dance floor.',
  },
  {
    id: 'midnight-reverb',
    name: 'Midnight Reverb',
    emoji: '🌌',
    image: '/characters/midnight-reverb.png',
    color: 'from-purple-600 to-indigo-800',
    borderColor: 'border-purple-500',
    description: 'Atmospheric late-night tracks drenched in echoes and smooth melodies.',
  },
  {
    id: 'echoes-of-chrome',
    name: 'Echoes of Chrome',
    emoji: '🔊',
    image: '/characters/echoes-of-chrome.png',
    color: 'from-cyan-600 to-blue-800',
    borderColor: 'border-cyan-500',
    description: 'Metallic, reflective soundscapes with a cyberpunk aesthetic. ',
  },
  {
    id: 'sub-bass-mirage',
    name: 'Sub Bass Mirage',
    emoji: '🎶',
    image: '/characters/sub-bass-mirage.png',
    color: 'from-red-600 to-pink-800',
    borderColor: 'border-red-500',
    description: 'Deep basslines that create illusions',
  },
  {
    id: 'velvet-distortion',
    name: 'Velvet Distortion',
    emoji: '💥',
    image: '/characters/velvet-distortion.png',
    color: 'from-emerald-600 to-green-800',
    borderColor: 'border-emerald-500',
    description: 'Soft vocals intertwined with crunchy, distorted textures.',
  },
  {
    id: 'nocturne-frequency',
    name: 'Nocturne Frequency',
    emoji: '🌙',
    image: '/characters/nocturne-frequency.png',
    color: 'from-slate-600 to-slate-800',
    borderColor: 'border-slate-500',
    description: ' Dark, moody electronic compositions perfect for late-night introspection.',
  },
  {
    id: 'hologram-heartbeat',
    name: 'Hologram Heartbeat',
    emoji: '💓',
    image: '/characters/hologram-heartbeat.png',
    color: 'from-amber-600 to-orange-800',
    borderColor: 'border-amber-500',
    description: 'Futuristic pop with digital textures and pulsing rhythms. ',
  },
  {
    id: 'static-in-paradise',
    name: 'Static in Paradise',
    emoji: '🌴',
    image: '/characters/static-in-paradise.png',
    color: 'from-purple-600 to-indigo-800',
    borderColor: 'border-purple-500',
    description: 'Tropical vibes mixed with glitchy, unexpected interruptions.',
  },
  {
    id: 'pulse-overload',
    name: 'Pulse Overload',
    emoji: '⚡',
    image: '/characters/pulse-overload.png',
    color: 'from-cyan-600 to-blue-800',
    borderColor: 'border-cyan-500',
    description: 'High-energy beats designed to push adrenaline levels to the max.',
  },
  {
    id: 'crimson-waveform',
    name: 'Crimson Waveform',
    emoji: '❤️',
    image: '/characters/crimson-waveform.png',
    color: 'from-red-600 to-pink-800',
    borderColor: 'border-red-500',
    description: 'Intense, emotionally charged tracks with bold sonic colors.',
  },
  {
    id: 'electric-silence',
    name: 'Electric Silence',
    emoji: '⚡',
    image: '/characters/electric-silence.png',
    color: 'from-emerald-600 to-green-800',
    borderColor: 'border-emerald-500',
    description: 'Minimalist, tension-filled electronic music that speaks in pauses and tones.',
  },
];


export default function Gallery() {
  return (
    <>
      <Head>
        <title>Gallery - Soul Collection | Beats</title>
        <meta name="description" content="Explore the Soul Collection characters and their unique beats" />
      </Head>

      <div className="min-h-screen text-white space-y-8" style={{
        backgroundImage: 'linear-gradient(135deg, rgba(10, 14, 39, 0.85) 0%, rgba(20, 24, 41, 0.85) 100%), url(/gallery.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        padding: '2rem'
      }}>
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black neon-text-glow">Soul Collection</h1>
          <p className="text-lg text-slate-300 max-w-2xl">
            Discover the artistic personas behind the beats. Each character represents a unique
            sound and story in the Beats ecosystem.
          </p>
        </div>

        {/* Characters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((character) => (
            <div
              key={character.id}
              className="group glass-hover rounded-xl overflow-hidden border border-brand-purple/30 hover:border-brand-purple/60 transition"
            >
              {/* Character Artwork */}
              <div 
                className={`h-64 bg-gradient-to-br ${character.color} relative overflow-hidden transition-all duration-300 group-hover:shadow-brand group-hover:-translate-y-2`}
                style={character.image ? {
                  backgroundImage: `linear-gradient(135deg, rgba(10, 14, 39, 0.3) 0%, rgba(20, 24, 41, 0.3) 100%), url(${character.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                } : {}}
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-base to-transparent opacity-50" />

                {/* Character Display */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    {!character.image && <div className="text-8xl mb-4 drop-shadow-lg">{character.emoji}</div>}
                    {/* <p className="text-white/80 font-semibold text-sm drop-shadow-lg">{character.name}</p> */}
                  </div>
                </div>

                {/* Overlay Buttons */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-4">
                  <button className="p-3 rounded-full bg-brand-purple hover:bg-brand-cyan transition glow-purple">
                    <Play className="w-6 h-6 text-white fill-white" />
                  </button>
                  <button className="p-3 rounded-full bg-brand-orange hover:bg-brand-purple transition">
                    <Heart className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-brand-cyan transition">
                    {character.name}
                  </h3>
                  <p className="text-sm text-slate-400">{character.description}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="glass-dark rounded p-2 border border-brand-cyan/30 text-center">
                    <p className="text-slate-500">Beats</p>
                    <p className="font-bold text-brand-cyan">12</p>
                  </div>
                  <div className="glass-dark rounded p-2 border border-brand-orange/30 text-center">
                    <p className="text-slate-500">Followers</p>
                    <p className="font-bold text-brand-orange">4.2K</p>
                  </div>
                </div>

                {/* View Button */}
                <button className="w-full py-2 bg-gradient-purple-orange rounded-lg font-bold text-white hover:shadow-lg hover:shadow-brand-purple/50 transition">
                  View Collection
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Featured Section */}
        <div className="mt-12 pt-12 border-t border-brand-purple/20">
          <h2 className="text-3xl font-black mb-6 text-brand-orange">Featured Drop</h2>
          <div className="glass-dark rounded-xl overflow-hidden border border-brand-orange/30 p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="h-80 bg-gradient-to-br from-orange-600 to-red-800 rounded-lg flex items-center justify-center">
                <span className="text-9xl drop-shadow-lg">🔥</span>
              </div>
              <div className="space-y-4">
                <div className="inline-block px-3 py-1 bg-brand-orange/20 border border-brand-orange/50 rounded-full text-sm font-bold text-brand-orange">
                  Limited Edition
                </div>
                <h3 className="text-3xl font-black">Crimson Pulse Series Vol. 1</h3>
                <p className="text-slate-300">
                  A collection of exclusive beats from Crimson Pulse featuring raw emotion and
                  powerful rhythms. Only 100 NFTs available.
                </p>
                <div className="flex gap-4 pt-4">
                  <button className="flex-1 py-3 bg-gradient-brand text-white rounded-lg font-bold hover:shadow-lg transition glow-brand">
                    Explore Series
                  </button>
                  <button className="flex-1 py-2 border border-brand-cyan/50 text-brand-cyan rounded-lg font-bold hover:border-brand-cyan/100 transition">
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}