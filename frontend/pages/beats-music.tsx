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

  // Load favorites from storage on mount
  useEffect(() => {
    loadFavorites();
  }, []);

  // FIX 1: Use window.localStorage instead of window.storage
  const loadFavorites = () => {
    try {
      const result = window.localStorage.getItem('beats-favorites');
      if (result) {
        const favoritesArray = JSON.parse(result);
        setLiked(new Set(favoritesArray));
      }
    } catch (err) {
      console.log('No favorites found or error loading:', err);
    }
  };

  // FIX 2: Use window.localStorage instead of window.storage
  const saveFavorites = (newLiked: Set<string>) => {
    try {
      const favoritesArray = Array.from(newLiked);
      window.localStorage.setItem('beats-favorites', JSON.stringify(favoritesArray));
    } catch (err) {
      console.error('Error saving favorites:', err);
    }
  };

  useEffect(() => {
    if (account) {
      fetchUserNFTs();
    } else {
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setTracks([]);
      setProgress(0);
      setCurrentTrackIndex(0);
      setError('Please connect your wallet to access your music NFTs');
    }
  }, [client, account]);

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
      let allObjects: any[] = [];
      // FIX 3: Explicitly allow undefined in the type definition
      let cursor: string | null | undefined = null;
      let hasNextPage = true;

      // 🔁 PAGINATION LOOP
      while (hasNextPage) {
        const response = await client.getOwnedObjects({
          owner: account.address,
          cursor,
          limit: 50,
          options: {
            showContent: true,
            showType: true,
          },
        });

        allObjects.push(...response.data);
        cursor = response.nextCursor;
        hasNextPage = response.hasNextPage;
      }

      const musicNFTs: Track[] = [];

      for (const obj of allObjects) {
        try {
          const objData = obj.data;

          if (objData?.type?.includes('music_nft::MusicNFT')) {
            const nftContent = objData.content?.fields || {};

            if (nftContent.music_url) {
              musicNFTs.push({
                id: objData.objectId,
                title: nftContent.name || 'Unknown Track',
                artist: nftContent.creator
                  ? `${nftContent.creator.slice(0, 6)}...${nftContent.creator.slice(-4)}`
                  : 'Unknown Artist',
                duration: 180, // will be updated when metadata loads
                album: nftContent.attributes || 'Beats Collection',
                color: colors[musicNFTs.length % colors.length],
                musicUrl: nftContent.music_url.startsWith('http')
                  ? nftContent.music_url
                  : `https://${nftContent.music_url}`,
                imageUrl: nftContent.image_url
                  ? (nftContent.image_url.startsWith('http')
                      ? nftContent.image_url
                      : `https://${nftContent.image_url}`)
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

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = (isMuted ? 0 : volume) / 100;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setProgress(Math.floor(audio.currentTime));
    };

    const handleLoadedMetadata = () => {
      if (currentTrack) {
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
    saveFavorites(newLiked);
    
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

      <div className="min-h-screen text-gray-900 bg-white p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-500 via-cyan-400 to-orange-500 bg-clip-text text-transparent">
              Beats Music
            </h1>
            <p className="text-sm text-gray-700">
              Beats Music is a Blockchain music where Holders can use their NFTs to earn $SOUL Token. (TBA)
            </p>
          </div>

          {!account ? (
            <div className="rounded-3xl border-2 border-gray-200 bg-white p-12 text-center space-y-4 shadow-xl">
              <Wallet className="w-16 h-16 text-brand-purple mx-auto" />
              <h3 className="text-xl font-bold text-gray-900">Connect Your Wallet</h3>
              <p className="text-gray-600">Please connect your wallet to access your music NFT collection</p>
            </div>
          ) : loading ? (
            <div className="rounded-3xl border-2 border-gray-200 bg-white p-12 text-center space-y-4 shadow-xl">
              <div className="animate-spin w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-600">Loading your music collection...</p>
            </div>
          ) : error && tracks.length === 0 ? (
            <div className="rounded-3xl border-2 border-gray-200 bg-white p-12 text-center space-y-4 shadow-xl">
              <AlertCircle className="w-16 h-16 text-brand-purple/50 mx-auto" />
              <h3 className="text-xl font-bold text-gray-900">No Music NFTs Found</h3>
              <p className="text-gray-600">{error}</p>
              <button
                onClick={fetchUserNFTs}
                className="px-6 py-3 bg-gradient-purple-orange hover:shadow-lg text-white rounded-xl font-semibold transition-all inline-flex items-center gap-2 shadow-brand-purple/50"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh Collection
              </button>
            </div>
          ) : (
            <>
              {currentTrack && (
                <div className="rounded-3xl border-2 border-gray-200 overflow-hidden shadow-2xl bg-white relative">
                  <div className="grid md:grid-cols-2 gap-0 relative">
                    {/* Left Side - Album Art */}
                    <div className={`bg-gradient-to-br ${currentTrack.color} p-12 relative overflow-hidden flex flex-col justify-center min-h-[480px]`}>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
                      <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 bg-gradient-to-br ${currentTrack.color}`} />
                      <div className="absolute inset-0 backdrop-blur-[2px]" />
                      
                      <div className="relative z-10 flex items-center justify-center mb-8">
                        <div className="relative w-56 h-56 rounded-2xl shadow-2xl overflow-hidden">
                          <div className="absolute inset-0 rounded-2xl border-2 border-white/30 backdrop-blur-sm" />
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/30 via-white/10 to-transparent" />
                          
                          {currentTrack.imageUrl && (
                            <img
                              key={currentTrack.id}
                              src={currentTrack.imageUrl}
                              alt={currentTrack.title}
                              className="w-full h-full rounded-2xl object-cover absolute inset-0 z-10 shadow-inner"
                              onError={(e: any) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          <div className={`absolute inset-0 w-full h-full bg-gradient-to-br ${currentTrack.color} rounded-2xl flex items-center justify-center`}>
                            <Disc3 className="w-28 h-28 text-white opacity-30" />
                          </div>
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/10 to-white/30 pointer-events-none" />
                        </div>
                      </div>

                      <div className="relative z-10">
                        <div className="backdrop-blur-xl bg-black/30 rounded-xl p-5 border border-white/20 shadow-xl relative overflow-hidden">
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                          <h2 className="text-2xl font-bold tracking-wide relative">{currentTrack.album}</h2>
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Track List */}
                    <div className="bg-gray-50 p-6 flex flex-col relative border-l border-gray-200">

                      <div className="mb-5 flex items-center justify-between">
                        <div className="bg-white rounded-lg px-4 py-2.5 border-2 border-gray-200 shadow-md">
                          <h3 className="text-xs tracking-wide text-brand-cyan font-semibold mb-0.5">Now Playing</h3>
                          <h2 className="text-lg font-bold text-gray-900">{currentTrack.album}</h2>
                        </div>
                        <button
                          onClick={fetchUserNFTs}
                          disabled={loading}
                          className="p-2.5 hover:bg-gray-100 rounded-lg transition bg-white border-2 border-gray-200 shadow-md"
                        >
                          <RefreshCw className={`w-4 h-4 text-brand-cyan ${loading ? 'animate-spin' : ''}`} />
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-2 pr-2" style={{ maxHeight: '340px' }}>
                        {tracks.map((track, index) => (
                          <button
                            key={track.id}
                            onClick={() => {
                              setCurrentTrackIndex(index);
                              setProgress(0);
                              setIsPlaying(true);
                            }}
                            className={`w-full p-3.5 rounded-xl border-2 transition text-left ${
                              index === currentTrackIndex
                                ? 'border-brand-cyan bg-cyan-50 shadow-lg'
                                : 'border-gray-200 bg-white hover:border-brand-cyan/50 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-semibold text-brand-cyan w-5">{index + 1}.</span>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate text-gray-900">{track.title}</p>
                                <p className="text-xs text-gray-600 truncate">{track.artist}</p>
                              </div>
                              {liked.has(track.id) && (
                                <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 flex-shrink-0" />
                              )}
                              {index === currentTrackIndex && isPlaying && (
                                <div className="flex gap-0.5">
                                  <div className="w-0.5 h-3 bg-brand-cyan rounded-full animate-pulse" />
                                  <div className="w-0.5 h-3 bg-brand-cyan rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                                  <div className="w-0.5 h-3 bg-brand-cyan rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Controls */}
                  <div className="bg-gray-50 border-t-2 border-gray-200 p-6">

                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-200 relative shadow-md">
                        
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
                          <Music className="w-5 h-5 text-cyan-400" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base truncate text-gray-900">{currentTrack.title}</h3>
                        <p className="text-sm text-brand-cyan truncate">{currentTrack.artist}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={handlePreviousTrack}
                          className="text-brand-cyan hover:text-cyan-700 transition p-2 rounded-lg hover:bg-gray-100 border-2 border-transparent hover:border-gray-200"
                        >
                          <SkipBack className="w-5 h-5 fill-current" />
                        </button>

                        <button
                          onClick={handlePlayPause}
                          className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 hover:from-cyan-300 hover:to-cyan-500 transition transform hover:scale-105 flex items-center justify-center shadow-lg border-2 border-gray-200"
                        >
                          {isPlaying ? (
                            <Pause className="w-5 h-5 text-white fill-white" />
                          ) : (
                            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                          )}
                        </button>

                        <button
                          onClick={handleNextTrack}
                          className="text-brand-cyan hover:text-cyan-700 transition p-2 rounded-lg hover:bg-gray-100 border-2 border-transparent hover:border-gray-200"
                        >
                          <SkipForward className="w-5 h-5 fill-current" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={toggleLike}
                          className={`transition p-2 rounded-lg border-2 ${
                            liked.has(currentTrack.id)
                              ? 'text-red-500 bg-red-50 border-red-300'
                              : 'text-gray-400 hover:text-red-400 hover:bg-gray-100 border-gray-200'
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${liked.has(currentTrack.id) ? 'fill-red-500' : ''}`} />
                        </button>

                        <div className="flex items-center gap-2 bg-white rounded-lg px-2 py-1.5 border-2 border-gray-200 shadow-md">
                          <button
                            onClick={toggleMute}
                            className="text-brand-cyan hover:text-cyan-700 transition"
                          >
                            {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                          </button>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-20 h-1 rounded-full appearance-none cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, rgb(34, 211, 238) 0%, rgb(34, 211, 238) ${isMuted ? 0 : volume}%, rgb(209, 213, 219) ${isMuted ? 0 : volume}%, rgb(209, 213, 219) 100%)`
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 space-y-1.5">
                      <input
                        type="range"
                        min="0"
                        max={currentTrack.duration || 100}
                        value={progress}
                        onChange={handleProgressChange}
                        className="w-full h-1.5 bg-gray-300 rounded-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right,
                            rgb(6, 182, 212) 0%,
                            rgb(6, 182, 212) ${progressPercent}%,
                            rgb(209, 213, 219) ${progressPercent}%,
                            rgb(209, 213, 219) 100%)`,
                        }}
                      />
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>{formatTime(progress)}</span>
                        <span>{formatTime(currentTrack.duration)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Favorites Panel */}
              {liked.size > 0 && (
                <div className="rounded-3xl border-2 border-gray-200 overflow-hidden shadow-2xl bg-white">

                  <div className="bg-gradient-to-r from-red-50 via-pink-50 to-purple-50 border-b-2 border-gray-200 p-6">
                    <div className="flex items-center gap-3">
                      <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Favorite Tracks</h2>
                        <p className="text-sm text-gray-600">{liked.size} {liked.size === 1 ? 'track' : 'tracks'} in your favorites</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    {tracks.filter(track => liked.has(track.id)).map((track) => {
                      const trackIndex = tracks.findIndex(t => t.id === track.id);
                      const isCurrentTrack = trackIndex === currentTrackIndex;

                      return (
                        <div
                          key={track.id}
                          className={`rounded-xl border-2 p-4 transition ${
                            isCurrentTrack
                              ? 'border-brand-cyan bg-cyan-50 shadow-lg'
                              : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                          }`}
                        >

                          <div className="flex items-center gap-4">
                            <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
                              
                              {track.imageUrl && (
                                <img
                                  src={track.imageUrl}
                                  alt={track.title}
                                  className="w-full h-full object-cover absolute inset-0 z-10"
                                  onError={(e: any) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              )}
                              <div className={`absolute inset-0 w-full h-full bg-gradient-to-br ${track.color} rounded-lg flex items-center justify-center`}>
                                <Music className="w-6 h-6 text-white opacity-40" />
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base truncate text-gray-900">{track.title}</h3>
                              <p className="text-sm text-brand-cyan truncate">{track.artist}</p>
                              <p className="text-xs text-gray-500 truncate mt-0.5">{track.album}</p>
                            </div>

                            <div className="text-sm text-gray-600 flex-shrink-0">
                              {formatTime(track.duration)}
                            </div>

                            <button
                              onClick={() => {
                                setCurrentTrackIndex(trackIndex);
                                setProgress(0);
                                setIsPlaying(true);
                              }}
                              className="p-2.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-brand-cyan hover:text-cyan-700 border-2 border-brand-cyan/30 hover:border-brand-cyan/50 transition flex-shrink-0"
                            >
                              {isCurrentTrack && isPlaying ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </button>

                            <button
                              onClick={() => {
                                const newLiked = new Set(liked);
                                newLiked.delete(track.id);
                                setLiked(newLiked);

                                // FIX 4: Use component-level saveFavorites directly
                                saveFavorites(newLiked);

                                const sortTracksByFavorites = (tracksToSort: Track[]) => {
                                  const favorites = tracksToSort.filter(t => newLiked.has(t.id));
                                  const nonFavorites = tracksToSort.filter(t => !newLiked.has(t.id));
                                  return [...favorites, ...nonFavorites];
                                };

                                const sortedTracks = sortTracksByFavorites(tracks);
                                setTracks(sortedTracks);

                                if (isCurrentTrack) {
                                  const newIndex = sortedTracks.findIndex(t => t.id === track.id);
                                  if (newIndex !== -1) {
                                    setCurrentTrackIndex(newIndex);
                                  }
                                }
                              }}
                              className="p-2.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 border-2 border-red-300 hover:border-red-400 transition flex-shrink-0"
                            >
                              <Heart className="w-4 h-4 fill-current" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
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