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
  const [trackDurations, setTrackDurations] = useState<{[key: string]: number}>({});

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

  // Load favorites from localStorage on mount
  useEffect(() => {
    if (account) {
      const savedFavorites = localStorage.getItem(`beats_favorites_${account.address}`);
      if (savedFavorites) {
        setLiked(new Set(JSON.parse(savedFavorites)));
      }
    }
  }, [account]);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (account) {
      if (liked.size > 0) {
        localStorage.setItem(`beats_favorites_${account.address}`, JSON.stringify(Array.from(liked)));
      } else {
        localStorage.removeItem(`beats_favorites_${account.address}`);
      }
    }
  }, [liked, account]);

  useEffect(() => {
    if (account) {
      fetchUserNFTs();
    } else {
      setTracks([]);
      setLiked(new Set());
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
                duration: trackDurations[objData.objectId] || 0, // Use cached duration or 0
                album: nftContent.attributes || 'Beats Collection',
                color: colors[musicNFTs.length % colors.length],
                musicUrl: nftContent.music_url.startsWith('http') ? nftContent.music_url : `https://${nftContent.music_url}`,
                imageUrl: nftContent.image_url || 'https://via.placeholder.com/400x400/8b5cf6/ffffff?text=Music+NFT',
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

      // Sort tracks: favorites first, then regular tracks
      const sortedTracks = sortTracksByFavorites(musicNFTs);
      setTracks(sortedTracks);

      // Preload durations for all tracks
      preloadTrackDurations(musicNFTs);
      
    } catch (err: any) {
      console.error('Error fetching NFTs:', err);
      setError(err.message || 'Failed to fetch your music NFTs');
    } finally {
      setLoading(false);
    }
  };

  // Preload all track durations
  const preloadTrackDurations = (tracksToLoad: Track[]) => {
    tracksToLoad.forEach(track => {
      // Skip if we already have the duration
      if (trackDurations[track.id]) return;

      const audio = new Audio();
      audio.src = track.musicUrl;
      
      audio.addEventListener('loadedmetadata', () => {
        const duration = Math.floor(audio.duration);
        if (!isNaN(duration) && duration > 0) {
          setTrackDurations(prev => ({
            ...prev,
            [track.id]: duration
          }));
          
          // Update tracks array with new duration
          setTracks(currentTracks => 
            currentTracks.map(t => 
              t.id === track.id ? { ...t, duration } : t
            )
          );
        }
      });

      audio.addEventListener('error', (e) => {
        console.error('Error loading audio metadata for', track.title, e);
      });
    });
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
        const duration = Math.floor(audio.duration);
        if (!isNaN(duration) && duration > 0) {
          // Update duration in cache
          setTrackDurations(prev => ({
            ...prev,
            [currentTrack.id]: duration
          }));
          
          // Update current track duration
          setTracks(currentTracks => 
            currentTracks.map(t => 
              t.id === currentTrack.id ? { ...t, duration } : t
            )
          );
        }
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
  }, [currentTrackIndex, currentTrack]);

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
    
    // Re-sort tracks after liking/unliking
    const sortedTracks = sortTracksByFavorites(tracks);
    setTracks(sortedTracks);
    
    // Find the new index of current track after sorting
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

      {/* Hidden audio element */}
      <audio ref={audioRef} preload="metadata" />

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
              Beats Music is a Blockchain music where Holders can use their NFT's to earn $SOUL Token. (TBA)
            </p>
          </div>

          {!account ? (
            <div className="glass-dark rounded-2xl border border-brand-purple/30 p-12 text-center space-y-4">
              <Wallet className="w-16 h-16 text-brand-purple mx-auto" />
              <h3 className="text-xl font-bold text-white">Connect Your Wallet</h3>
              <p className="text-slate-400">Please connect your wallet to access your music NFT collection</p>
            </div>
          ) : loading ? (
            <div className="glass-dark rounded-2xl border border-brand-purple/30 p-12 text-center space-y-4">
              <div className="animate-spin w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full mx-auto"></div>
              <p className="text-slate-400">Loading your music collection...</p>
            </div>
          ) : error && tracks.length === 0 ? (
            <div className="glass-dark rounded-2xl border border-brand-purple/30 p-12 text-center space-y-4">
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
              {/* Main Player */}
              {currentTrack && (
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
                        {currentTrack.imageUrl && currentTrack.imageUrl !== 'https://via.placeholder.com/400x400/8b5cf6/ffffff?text=Music+NFT' ? (
                          <img
                            src={currentTrack.imageUrl.startsWith('http') ? currentTrack.imageUrl : `https://${currentTrack.imageUrl}`}
                            alt={currentTrack.title}
                            className="w-full h-full rounded-2xl object-cover"
                            onError={(e: any) => {
                              e.target.style.display = 'none';
                              const parent = e.target.parentElement;
                              if (parent) {
                                parent.innerHTML = `<div class="w-full h-full bg-gradient-to-br ${currentTrack.color} rounded-2xl flex items-center justify-center"><svg class="w-20 h-20 md:w-32 md:h-32 text-white opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle><line x1="12" y1="2" x2="12" y2="10"></line></svg></div><div class="absolute inset-2 rounded-2xl border border-white/20"></div>`;
                              }
                            }}
                          />
                        ) : (
                          <>
                            <div className={`w-full h-full bg-gradient-to-br ${currentTrack.color} rounded-2xl flex items-center justify-center`}>
                              <Disc3 className="w-20 h-20 md:w-32 md:h-32 text-white opacity-40" />
                            </div>
                            <div className="absolute inset-2 rounded-2xl border border-white/20" />
                          </>
                        )}
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
                        max={currentTrack.duration || 100}
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
              )}

              {/* Playlist */}
              {tracks.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">Now Playing</h3>
                    <button
                      onClick={fetchUserNFTs}
                      disabled={loading}
                      className="px-4 py-2 bg-brand-purple/20 hover:bg-brand-purple/30 border border-brand-purple/30 rounded-lg font-semibold transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                      {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                  </div>
                  <div className="grid gap-2">
                    {tracks.map((track, index) => (
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
                          {/* NFT Image Thumbnail */}
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-slate-700 to-slate-800">
                            {track.imageUrl && track.imageUrl !== 'https://via.placeholder.com/400x400/8b5cf6/ffffff?text=Music+NFT' ? (
                              <img
                                src={track.imageUrl.startsWith('http') ? track.imageUrl : `https://${track.imageUrl}`}
                                alt={track.title}
                                className="w-full h-full object-cover"
                                onError={(e: any) => {
                                  e.target.style.display = 'none';
                                  const parent = e.target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-5 h-5 text-brand-purple" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg></div>';
                                  }
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Music className="w-5 h-5 text-brand-purple" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm truncate">{track.title}</p>
                              {liked.has(track.id) && (
                                <Heart className="w-3 h-3 text-red-500 fill-red-500 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-slate-400 truncate">{track.artist}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
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
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}