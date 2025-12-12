'use client';

import Head from 'next/head';
import { Music, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Disc3, Heart, RefreshCw, AlertCircle, Wallet } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  album: string;
  color: string;
  musicUrl: string;
  imageUrl: string;
}

export default function BeatsMusic() {
  const account = useCurrentAccount();
  const client = useSuiClient();

  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = tracks[currentTrackIndex];

  // Color palette for tracks without specific colors
  const colors = [
    'from-purple-600 to-pink-600',
    'from-cyan-600 to-blue-600',
    'from-blue-600 to-indigo-600',
    'from-red-600 to-pink-600',
    'from-orange-600 to-red-600',
    'from-green-600 to-teal-600',
    'from-yellow-600 to-orange-600',
    'from-indigo-600 to-purple-600',
  ];

  useEffect(() => {
    if (account) {
      fetchUserNFTs();
    } else {
      // Stop playback when wallet disconnects
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setTracks([]);
      setLiked(new Set());
      setProgress(0);
      setCurrentTrackIndex(0);
      setError('Please connect your wallet to access your music NFTs');
    }
  }, [client, account]);

  // Sort tracks with favorites first
  const sortTracksByFavorites = (tracksToSort: Track[]) => {
    const favorites = tracksToSort.filter(t => liked.has(t.id));
    const nonFavorites = tracksToSort.filter(t => !liked.has(t.id));
    return [...favorites, ...nonFavorites];
  };

  const fetchUserNFTs = async () => {
    if (!client || !account) return;
    
    setLoading(true);
    setError('');
    
    try {
      const ownedObjects = await client.getOwnedObjects({
        owner: account.address,
        options: {
          showContent: true,
          showType: true,
        },
      });

      const musicNFTs: Track[] = [];
      
      for (const obj of ownedObjects.data) {
        try {
          const objData = obj.data;
          
          if (objData?.type && objData.type.includes('music_nft::MusicNFT')) {
            const nftContent = objData.content?.fields || {};
            
            // Only add NFTs that have a music URL
            if (nftContent.music_url) {
              musicNFTs.push({
                id: objData.objectId,
                title: nftContent.name || 'Unknown Track',
                artist: nftContent.creator ? `${nftContent.creator.slice(0, 6)}...${nftContent.creator.slice(-4)}` : 'Unknown Artist',
                duration: 180, // Default duration, will be updated when audio loads
                album: nftContent.attributes || 'Beats Collection',
                color: colors[musicNFTs.length % colors.length],
                musicUrl: nftContent.music_url.startsWith('http') ? nftContent.music_url : `https://${nftContent.music_url}`,
                imageUrl: nftContent.image_url 
                  ? (nftContent.image_url.startsWith('http') ? nftContent.image_url : `https://${nftContent.image_url}`)
                  : '',
              });
            }
          }
        } catch (err) {
          console.error('Error processing NFT:', err);
        }
      }

      if (musicNFTs.length === 0) {
        setError('No music NFTs found in your wallet. Mint or purchase music NFTs to start listening!');
      }

      const sortedTracks = sortTracksByFavorites(musicNFTs);
      setTracks(sortedTracks);
      
    } catch (err: any) {
      console.error('Error fetching NFTs:', err);
      setError(err.message || 'Failed to fetch your music NFTs');
    } finally {
      setLoading(false);
    }
  };

  // Audio element management
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.musicUrl;
      audioRef.current.volume = (isMuted ? 0 : volume) / 100;
      
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.error('Error playing audio:', err);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentTrackIndex, currentTrack]);

  // Update audio playback state
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.error('Error playing audio:', err);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = (isMuted ? 0 : volume) / 100;
    }
  }, [volume, isMuted]);

  // Handle audio time updates
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setProgress(Math.floor(audio.currentTime));
    };

    const handleLoadedMetadata = () => {
      if (currentTrack) {
        // Update duration when audio loads
        const newTracks = [...tracks];
        newTracks[currentTrackIndex].duration = Math.floor(audio.duration);
        setTracks(newTracks);
      }
    };

    const handleEnded = () => {
      handleNextTrack();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex, tracks]);

  const handlePlayPause = () => {
    if (!currentTrack) return;
    setIsPlaying(!isPlaying);
  };

  const handleNextTrack = () => {
    if (tracks.length === 0) return;
    setProgress(0);
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    setIsPlaying(true);
  };

  const handlePreviousTrack = () => {
    if (tracks.length === 0) return;
    if (progress > 5) {
      setProgress(0);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    } else {
      setProgress(0);
      setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    }
    setIsPlaying(true);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseInt(e.target.value);
    setProgress(newProgress);
    if (audioRef.current) {
      audioRef.current.currentTime = newProgress;
    }
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
    if (!currentTrack) return;
    const newLiked = new Set(liked);
    if (newLiked.has(currentTrack.id)) {
      newLiked.delete(currentTrack.id);
    } else {
      newLiked.add(currentTrack.id);
    }
    setLiked(newLiked);
    
    const sortedTracks = sortTracksByFavorites(tracks);
    setTracks(sortedTracks);
    
    const newIndex = sortedTracks.findIndex(t => t.id === currentTrack.id);
    if (newIndex !== -1) {
      setCurrentTrackIndex(newIndex);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === 0) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = currentTrack && currentTrack.duration > 0 ? (progress / currentTrack.duration) * 100 : 0;

  return (
    <>
      <Head>
        <title>Beats Music - Beats</title>
        <meta name="description" content="Explore and stream music from Beats artists" />
      </Head>

      <audio ref={audioRef} />

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
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-brand-purple via-brand-cyan to-brand-orange bg-clip-text text-transparent">
              Beats Music
            </h1>
            <p className="text-sm text-slate-300">
              Beats Music is a Blockchain music where Holders can use their NFT's to earn $SOUL Token. (TBA)
            </p>
          </div>

          {!account ? (
            <div className="rounded-2xl border border-brand-purple/20 backdrop-blur-md bg-slate-900/40 p-12 text-center space-y-4">
              <Wallet className="w-16 h-16 text-brand-purple mx-auto" />
              <h3 className="text-xl font-bold text-white">Connect Your Wallet</h3>
              <p className="text-slate-400">Please connect your wallet to access your music NFT collection</p>
            </div>
          ) : loading ? (
            <div className="rounded-2xl border border-brand-purple/20 backdrop-blur-md bg-slate-900/40 p-12 text-center space-y-4">
              <div className="animate-spin w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full mx-auto"></div>
              <p className="text-slate-400">Loading your music collection...</p>
            </div>
          ) : error && tracks.length === 0 ? (
            <div className="rounded-2xl border border-brand-purple/20 backdrop-blur-md bg-slate-900/40 p-12 text-center space-y-4">
              <AlertCircle className="w-16 h-16 text-brand-purple/50 mx-auto" />
              <h3 className="text-xl font-bold text-white">No Music NFTs Found</h3>
              <p className="text-slate-400">{error}</p>
              <button
                onClick={fetchUserNFTs}
                className="px-6 py-3 bg-brand-purple hover:bg-brand-purple/80 text-white rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh Collection
              </button>
            </div>
          ) : (
            <>
              {/* Main Player - Horizontal Layout */}
              {currentTrack && (
                <div className="rounded-2xl border border-brand-purple/20 overflow-hidden shadow-2xl backdrop-blur-md bg-slate-900/40">
                  <div className="grid md:grid-cols-2 gap-0">
                    {/* Left Side - Album Art and Info */}
                    <div className={`bg-gradient-to-br ${currentTrack.color} p-10 relative overflow-hidden flex flex-col justify-between min-h-[500px]`}>
                      {/* Background decorations */}
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-base/40 to-transparent" />
                      <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-30 bg-gradient-to-br ${currentTrack.color}`} />
                      
                      {/* Album Art */}
                      <div className="relative z-10 flex-1 flex items-center justify-center">
                        <div className="relative w-64 h-64 rounded-2xl shadow-2xl border-4 border-white/20 overflow-hidden">
                          {currentTrack.imageUrl && (
                            <img
                              key={currentTrack.id}
                              src={currentTrack.imageUrl}
                              alt={currentTrack.title}
                              className="w-full h-full rounded-xl object-cover absolute inset-0 z-10"
                              onError={(e: any) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          <div className={`absolute inset-0 w-full h-full bg-gradient-to-br ${currentTrack.color} rounded-xl flex items-center justify-center`}>
                            <Disc3 className="w-32 h-32 text-white opacity-40" />
                          </div>
                        </div>
                      </div>

                      {/* Album Info */}
                      <div className="relative z-10 space-y-2">
                        <h2 className="text-3xl font-black uppercase tracking-tight">{currentTrack.album}</h2>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className="text-yellow-400 text-xl">★</span>
                          ))}
                          <span className="ml-2 text-lg font-bold">5.0</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Track List */}
                    <div className="bg-slate-900/60 backdrop-blur-xl p-8 flex flex-col">
                      {/* Header */}
                      <div className="mb-6 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm uppercase tracking-wider text-brand-cyan font-bold">Now Playing</h3>
                          <h2 className="text-2xl font-black uppercase">{currentTrack.album}</h2>
                        </div>
                        <button
                          onClick={fetchUserNFTs}
                          disabled={loading}
                          className="p-2 hover:bg-brand-purple/20 rounded-lg transition"
                        >
                          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                      </div>

                      {/* Track List */}
                      <div className="flex-1 overflow-y-auto space-y-3 pr-2" style={{ maxHeight: '320px' }}>
                        {tracks.map((track, index) => (
                          <button
                            key={track.id}
                            onClick={() => {
                              setCurrentTrackIndex(index);
                              setProgress(0);
                              setIsPlaying(true);
                            }}
                            className={`w-full p-5 rounded-xl border-2 transition text-left ${
                              index === currentTrackIndex
                                ? 'border-brand-cyan bg-brand-cyan/10 shadow-lg shadow-brand-cyan/20'
                                : 'border-transparent bg-slate-800/30 hover:border-brand-cyan/50 hover:bg-slate-800/50'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-lg font-bold text-brand-cyan w-6">{index + 1}.</span>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-base uppercase truncate tracking-wide">{track.title}</p>
                                <p className="text-xs text-slate-400 uppercase truncate">{track.artist}</p>
                              </div>
                              {liked.has(track.id) && (
                                <Heart className="w-4 h-4 text-red-500 fill-red-500 flex-shrink-0" />
                              )}
                              {index === currentTrackIndex && isPlaying && (
                                <div className="flex gap-1">
                                  <div className="w-1 h-4 bg-brand-cyan rounded-full animate-pulse" />
                                  <div className="w-1 h-4 bg-brand-cyan rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                                  <div className="w-1 h-4 bg-brand-cyan rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Controls Bar */}
                  <div className="bg-slate-900/70 backdrop-blur-xl border-t border-brand-purple/20 p-8">
                    <div className="flex items-center gap-8">
                      {/* Current Track Thumbnail */}
                      <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-brand-cyan/30 relative">
                        {currentTrack.imageUrl && (
                          <img
                            key={currentTrack.id}
                            src={currentTrack.imageUrl}
                            alt={currentTrack.title}
                            className="w-full h-full object-cover absolute inset-0 z-10"
                            onError={(e: any) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                        <div className="w-full h-full flex items-center justify-center absolute inset-0">
                          <Music className="w-6 h-6 text-brand-cyan" />
                        </div>
                      </div>

                      {/* Track Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg uppercase truncate">{currentTrack.title}</h3>
                        <p className="text-sm text-brand-cyan uppercase truncate">{currentTrack.artist}</p>
                      </div>

                      {/* Main Controls */}
                      <div className="flex items-center gap-4">
                        <button
                          onClick={handlePreviousTrack}
                          className="text-brand-cyan hover:text-brand-cyan/80 transition"
                          title="Previous track"
                        >
                          <SkipBack className="w-7 h-7 fill-current" />
                        </button>

                        <button
                          onClick={handlePlayPause}
                          className="w-14 h-14 rounded-full bg-brand-cyan hover:bg-brand-cyan/80 transition transform hover:scale-105 flex items-center justify-center"
                        >
                          {isPlaying ? (
                            <Pause className="w-7 h-7 text-dark-base fill-dark-base" />
                          ) : (
                            <Play className="w-7 h-7 text-dark-base fill-dark-base ml-1" />
                          )}
                        </button>

                        <button
                          onClick={handleNextTrack}
                          className="text-brand-cyan hover:text-brand-cyan/80 transition"
                          title="Next track"
                        >
                          <SkipForward className="w-7 h-7 fill-current" />
                        </button>
                      </div>

                      {/* Additional Controls */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={toggleLike}
                          className={`transition ${
                            liked.has(currentTrack.id) ? 'text-red-500' : 'text-slate-400 hover:text-red-400'
                          }`}
                          title="Like track"
                        >
                          <Heart className={`w-6 h-6 ${liked.has(currentTrack.id) ? 'fill-red-500' : ''}`} />
                        </button>

                        <button className="text-brand-cyan hover:text-brand-cyan/80 transition">
                          <div className="flex flex-col gap-1">
                            <div className="w-6 h-0.5 bg-current" />
                            <div className="w-6 h-0.5 bg-current" />
                            <div className="w-6 h-0.5 bg-current" />
                          </div>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={toggleMute}
                            className="text-brand-cyan hover:text-brand-cyan/80 transition"
                          >
                            {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                          </button>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-24 h-1 bg-slate-700 rounded-full appearance-none cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, 
                                rgb(6, 182, 212) 0%, 
                                rgb(6, 182, 212) ${isMuted ? 0 : volume}%, 
                                rgb(51, 65, 85) ${isMuted ? 0 : volume}%, 
                                rgb(51, 65, 85) 100%)`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-6 space-y-2">
                      <input
                        type="range"
                        min="0"
                        max={currentTrack.duration || 100}
                        value={progress}
                        onChange={handleProgressChange}
                        className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, 
                            rgb(6, 182, 212) 0%, 
                            rgb(6, 182, 212) ${progressPercent}%, 
                            rgb(51, 65, 85) ${progressPercent}%, 
                            rgb(51, 65, 85) 100%)`,
                        }}
                      />
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>{formatTime(progress)}</span>
                        <span>{formatTime(currentTrack.duration)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}