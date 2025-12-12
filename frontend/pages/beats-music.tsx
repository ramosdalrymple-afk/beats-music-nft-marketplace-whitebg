'use client';

import Head from 'next/head';
import { Music, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Disc3, Heart } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface Track {
  id: number;
  title: string;
  artist: string;
  duration: number;
  album: string;
  color: string;
}

const beatTracks: Track[] = [
  { id: 1, title: 'Neon Dreams', artist: 'Faceless West', duration: 245, album: 'Electric Horizon', color: 'from-purple-600 to-pink-600' },
  { id: 2, title: 'Cyber Pulse', artist: 'A$AP Mercy', duration: 198, album: 'Digital Hearts', color: 'from-cyan-600 to-blue-600' },
  { id: 3, title: 'Lunar Vibes', artist: 'Luna Sonic', duration: 267, album: 'Moonlight Echo', color: 'from-blue-600 to-indigo-600' },
  { id: 4, title: 'Crimson Beat', artist: 'Crimson Pulse', duration: 215, album: 'Red Frequency', color: 'from-red-600 to-pink-600' },
  { id: 5, title: 'Echo Synth', artist: 'Echo Verse', duration: 289, album: 'Reverb Tales', color: 'from-orange-600 to-red-600' },
];

export default function BeatsMusic() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentTrack = beatTracks[currentTrackIndex];

  // Handle play/pause progress ticking
  useEffect(() => {
    if (isPlaying) {
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= currentTrack.duration) {
            handleNextTrack();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [isPlaying, currentTrack.duration]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNextTrack = () => {
    setProgress(0);
    setCurrentTrackIndex((prev) => (prev + 1) % beatTracks.length);
    setIsPlaying(true);
  };

  const handlePreviousTrack = () => {
    if (progress > 5) {
      setProgress(0);
    } else {
      setProgress(0);
      setCurrentTrackIndex((prev) => (prev - 1 + beatTracks.length) % beatTracks.length);
    }
    setIsPlaying(true);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProgress(parseInt(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleLike = () => {
    const newLiked = new Set(liked);
    if (newLiked.has(currentTrack.id)) {
      newLiked.delete(currentTrack.id);
    } else {
      newLiked.add(currentTrack.id);
    }
    setLiked(newLiked);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = (progress / currentTrack.duration) * 100;

  return (
    <>
      <Head>
        <title>Beats Music - Beats</title>
        <meta name="description" content="Explore and stream music from Beats artists" />
      </Head>

      <div
        className="min-h-screen text-white"
        style={{
          backgroundImage:
            'linear-gradient(135deg, rgba(10, 14, 39, 0.85) 0%, rgba(20, 24, 41, 0.85) 100%), url(/beats-music-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          padding: '1.5rem',
        }}
      >
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-brand-purple via-brand-cyan to-brand-orange bg-clip-text text-transparent">
              Beats Music
            </h1>
            <p className="text-sm text-slate-300">
              Beats Music is a Blockchain music were Holders can use their NFT’s to earn $SOUL Token. (TBA)
              </p>
          </div>

          {/* Main Player */}
          <div className="glass-dark rounded-2xl border border-brand-purple/30 overflow-hidden shadow-2xl">
            {/* Album Art Section */}
            <div className={`bg-gradient-to-br ${currentTrack.color} p-3 md:p-4 relative overflow-hidden`}>
              {/* Animated background glow */}
              <div className="absolute inset-0 bg-gradient-to-t from-dark-base to-transparent opacity-40" />
              <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-20 bg-gradient-to-br ${currentTrack.color}`} />

              {/* Album Display */}
              <div className="relative z-10 flex justify-center items-center h-32 md:h-40">
                <div
                  className={`relative w-40 h-40 md:w-52 md:h-52 rounded-2xl shadow-2xl ${isPlaying ? 'animate-spin' : ''}`}
                  style={{
                    animationDuration: '6s',
                    animationPlayState: isPlaying ? 'running' : 'paused',
                  }}
                >
                  <div className={`w-full h-full bg-gradient-to-br ${currentTrack.color} rounded-2xl flex items-center justify-center`}>
                    <Disc3 className="w-20 h-20 md:w-32 md:h-32 text-white opacity-40" />
                  </div>
                  {/* Vinyl shine effect */}
                  <div className="absolute inset-2 rounded-2xl border border-white/20" />
                </div>
              </div>
            </div>

            {/* Track Info and Controls */}
            <div className="p-6 md:p-8 space-y-6">
              {/* Track Details */}
              <div className="space-y-1">
                <div>
                  <h2 className="text-xl md:text-2xl font-black mb-1">{currentTrack.title}</h2>
                  <p className="text-sm text-brand-cyan">{currentTrack.artist}</p>
                  <p className="text-slate-400 text-xs mt-1">{currentTrack.album}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max={currentTrack.duration}
                  value={progress}
                  onChange={handleProgressChange}
                  className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-brand-purple"
                  style={{
                    background: `linear-gradient(to right, 
                      rgb(168, 85, 247) 0%, 
                      rgb(168, 85, 247) ${progressPercent}%, 
                      rgb(51, 65, 85) ${progressPercent}%, 
                      rgb(51, 65, 85) 100%)`,
                  }}
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{formatTime(progress)}</span>
                  <span>{formatTime(currentTrack.duration)}</span>
                </div>
              </div>

              {/* Main Controls */}
              <div className="flex justify-center items-center gap-3">
                <button
                  onClick={handlePreviousTrack}
                  className="p-2 rounded-full hover:bg-brand-purple/20 transition hover:text-brand-purple"
                  title="Previous track"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  onClick={handlePlayPause}
                  className="p-3 rounded-full bg-gradient-to-r from-brand-purple to-brand-cyan hover:shadow-brand transition transform hover:scale-105"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 text-white fill-white" />
                  ) : (
                    <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                  )}
                </button>

                <button
                  onClick={handleNextTrack}
                  className="p-2 rounded-full hover:bg-brand-purple/20 transition hover:text-brand-purple"
                  title="Next track"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                <button
                  onClick={toggleLike}
                  className={`p-2 rounded-full transition ${
                    liked.has(currentTrack.id) ? 'text-red-500 bg-red-500/20' : 'hover:bg-brand-purple/20 hover:text-red-400'
                  }`}
                  title="Like track"
                >
                  <Heart className={`w-4 h-4 ${liked.has(currentTrack.id) ? 'fill-red-500' : ''}`} />
                </button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className={`p-1.5 rounded-lg transition ${isMuted ? 'text-red-400 bg-red-500/20' : 'hover:bg-brand-purple/20'}`}
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="flex-1 h-1 bg-slate-700 rounded-full appearance-none cursor-pointer accent-brand-cyan"
                  style={{
                    background: `linear-gradient(to right, 
                      rgb(6, 182, 212) 0%, 
                      rgb(6, 182, 212) ${isMuted ? 0 : volume}%, 
                      rgb(51, 65, 85) ${isMuted ? 0 : volume}%, 
                      rgb(51, 65, 85) 100%)`,
                  }}
                />
                <span className="text-xs text-slate-400 w-6">{isMuted ? 0 : volume}%</span>
              </div>
            </div>
          </div>

          {/* Playlist */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold">Now Playing</h3>
            <div className="grid gap-2">
              {beatTracks.map((track, index) => (
                <button
                  key={track.id}
                  onClick={() => {
                    setCurrentTrackIndex(index);
                    setProgress(0);
                    setIsPlaying(true);
                  }}
                  className={`p-2 rounded-lg border transition text-left ${
                    index === currentTrackIndex
                      ? 'glass-dark border-brand-purple/50 bg-brand-purple/10 shadow-brand'
                      : 'glass-dark border-brand-purple/20 hover:border-brand-purple/50 hover:bg-brand-purple/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${track.color}`}>
                      <Music className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{track.title}</p>
                      <p className="text-xs text-slate-400">{track.artist}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{formatTime(track.duration)}</span>
                      {index === currentTrackIndex && isPlaying && (
                        <div className="flex gap-1">
                          <div className="w-1 h-4 bg-brand-purple rounded-full animate-pulse" />
                          <div className="w-1 h-4 bg-brand-purple rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                          <div className="w-1 h-4 bg-brand-purple rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
