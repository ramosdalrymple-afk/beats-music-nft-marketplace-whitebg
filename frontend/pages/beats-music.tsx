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
      setLiked(new Set());
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
            
            if (nftContent.music_url) {
              musicNFTs.push({
                id: objData.objectId,
                title: nftContent.name || 'Unknown Track',
                artist: nftContent.creator ? `${nftContent.creator.slice(0, 6)}...${nftContent.creator.slice(-4)}` : 'Unknown Artist',
                duration: 180,
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

      <div className="min-h-screen text-white bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-500 via-cyan-400 to-orange-500 bg-clip-text text-transparent">
              Beats Music
            </h1>
            <p className="text-sm text-slate-300">
              Beats Music is a Blockchain music where Holders can use their NFTs to earn $SOUL Token. (TBA)
            </p>
          </div>

          {!account ? (
            <div className="rounded-3xl border border-purple-500/20 backdrop-blur-xl bg-slate-900/60 p-12 text-center space-y-4 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
              <Wallet className="w-16 h-16 text-purple-500 mx-auto relative z-10" />
              <h3 className="text-xl font-bold text-white relative z-10">Connect Your Wallet</h3>
              <p className="text-slate-400 relative z-10">Please connect your wallet to access your music NFT collection</p>
            </div>
          ) : loading ? (
            <div className="rounded-3xl border border-purple-500/20 backdrop-blur-xl bg-slate-900/60 p-12 text-center space-y-4 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
              <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto relative z-10"></div>
              <p className="text-slate-400 relative z-10">Loading your music collection...</p>
            </div>
          ) : error && tracks.length === 0 ? (
            <div className="rounded-3xl border border-purple-500/20 backdrop-blur-xl bg-slate-900/60 p-12 text-center space-y-4 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
              <AlertCircle className="w-16 h-16 text-purple-500/50 mx-auto relative z-10" />
              <h3 className="text-xl font-bold text-white relative z-10">No Music NFTs Found</h3>
              <p className="text-slate-400 relative z-10">{error}</p>
              <button
                onClick={fetchUserNFTs}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold transition-all inline-flex items-center gap-2 relative z-10 shadow-lg shadow-purple-500/30"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh Collection
              </button>
            </div>
          ) : (
            <>
              {currentTrack && (
                <div className="rounded-3xl border border-white/10 overflow-hidden shadow-2xl backdrop-blur-xl bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 relative">
                  {/* Main glossy overlays */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-tl from-white/5 via-transparent to-transparent pointer-events-none" />
                  
                  <div className="grid md:grid-cols-2 gap-0 relative">
                    {/* Left Side - Album Art and Info */}
                    <div className={`bg-gradient-to-br ${currentTrack.color} p-10 relative overflow-hidden flex flex-col justify-between min-h-[500px]`}>
                      {/* Glossy glass morphism layers */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
                      <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 bg-gradient-to-br ${currentTrack.color}`} />
                      <div className="absolute inset-0 backdrop-blur-[2px]" />
                      
                      {/* Album Art */}
                      <div className="relative z-10 flex-1 flex items-center justify-center">
                        <div className="relative w-64 h-64 rounded-3xl shadow-2xl overflow-hidden">
                          {/* Glossy border effect */}
                          <div className="absolute inset-0 rounded-3xl border-4 border-white/30 backdrop-blur-sm" />
                          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/30 via-white/10 to-transparent" />
                          
                          {currentTrack.imageUrl && (
                            <img
                              key={currentTrack.id}
                              src={currentTrack.imageUrl}
                              alt={currentTrack.title}
                              className="w-full h-full rounded-3xl object-cover absolute inset-0 z-10 shadow-inner"
                              onError={(e: any) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          <div className={`absolute inset-0 w-full h-full bg-gradient-to-br ${currentTrack.color} rounded-3xl flex items-center justify-center`}>
                            <Disc3 className="w-32 h-32 text-white opacity-30" />
                          </div>
                          {/* Glass reflection */}
                          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-transparent via-white/10 to-white/30 pointer-events-none" />
                        </div>
                      </div>

                      {/* Album Info */}
                      <div className="relative z-10 space-y-2">
                        <div className="backdrop-blur-xl bg-black/30 rounded-2xl p-4 border border-white/20 shadow-xl relative overflow-hidden">
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                          <h2 className="text-3xl font-black uppercase tracking-tight relative">{currentTrack.album}</h2>
                          {/* <div className="flex items-center gap-1 mt-2 relative">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star} className="text-yellow-400 text-xl drop-shadow-lg">★</span>
                            ))}
                            <span className="ml-2 text-lg font-bold drop-shadow-lg">5.0</span>
                          </div> */}
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Track List */}
                    <div className="bg-slate-900/80 backdrop-blur-2xl p-8 flex flex-col relative">
                      {/* Glossy overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
                      
                      {/* Header */}
                      <div className="mb-6 flex items-center justify-between relative z-10">
                        <div className="backdrop-blur-xl bg-white/5 rounded-xl p-3 border border-white/10 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                          <h3 className="text-sm uppercase tracking-wider text-cyan-400 font-bold drop-shadow-lg relative">Now Playing</h3>
                          <h2 className="text-2xl font-black uppercase relative">{currentTrack.album}</h2>
                        </div>
                        <button
                          onClick={fetchUserNFTs}
                          disabled={loading}
                          className="p-3 hover:bg-white/10 rounded-xl transition backdrop-blur-xl bg-white/5 border border-white/10 shadow-lg relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                          <RefreshCw className={`w-5 h-5 relative z-10 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                      </div>

                      {/* Track List */}
                      <div className="flex-1 overflow-y-auto space-y-3 pr-2 relative z-10" style={{ maxHeight: '320px' }}>
                        {tracks.map((track, index) => (
                          <button
                            key={track.id}
                            onClick={() => {
                              setCurrentTrackIndex(index);
                              setProgress(0);
                              setIsPlaying(true);
                            }}
                            className={`w-full p-5 rounded-2xl border-2 transition text-left relative overflow-hidden group ${
                              index === currentTrackIndex
                                ? 'border-cyan-400/50 bg-gradient-to-br from-cyan-500/20 via-cyan-500/10 to-transparent shadow-lg shadow-cyan-400/20'
                                : 'border-white/10 bg-gradient-to-br from-slate-800/40 to-slate-800/20 hover:border-cyan-400/30 hover:from-slate-800/60 hover:to-slate-800/40'
                            }`}
                          >
                            {/* Glossy overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
                            <div className="absolute inset-0 backdrop-blur-sm pointer-events-none" />
                            
                            <div className="flex items-center gap-4 relative z-10">
                              <span className="text-lg font-bold text-cyan-400 w-6 drop-shadow-lg">{index + 1}.</span>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-base uppercase truncate tracking-wide drop-shadow-sm">{track.title}</p>
                                <p className="text-xs text-slate-400 uppercase truncate">{track.artist}</p>
                              </div>
                              {liked.has(track.id) && (
                                <Heart className="w-4 h-4 text-red-500 fill-red-500 flex-shrink-0 drop-shadow-lg" />
                              )}
                              {index === currentTrackIndex && isPlaying && (
                                <div className="flex gap-1">
                                  <div className="w-1 h-4 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50" />
                                  <div className="w-1 h-4 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50" style={{ animationDelay: '0.1s' }} />
                                  <div className="w-1 h-4 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50" style={{ animationDelay: '0.2s' }} />
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Controls Bar */}
                  <div className="bg-slate-900/90 backdrop-blur-2xl border-t border-white/10 p-8 relative">
                    {/* Glossy overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                    
                    <div className="flex items-center gap-8 relative z-10">
                      {/* Current Track Thumbnail */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-white/20 relative shadow-xl">
                        {/* Glossy effect on thumbnail */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none z-20" />
                        
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
                          <Music className="w-6 h-6 text-cyan-400 drop-shadow-lg" />
                        </div>
                      </div>

                      {/* Track Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg uppercase truncate drop-shadow-sm">{currentTrack.title}</h3>
                        <p className="text-sm text-cyan-400 uppercase truncate drop-shadow-sm">{currentTrack.artist}</p>
                      </div>

                      {/* Main Controls */}
                      <div className="flex items-center gap-4">
                        <button
                          onClick={handlePreviousTrack}
                          className="text-cyan-400 hover:text-cyan-300 transition p-2 rounded-xl hover:bg-white/5 backdrop-blur-xl border border-transparent hover:border-white/10 relative overflow-hidden group"
                          title="Previous track"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition pointer-events-none" />
                          <SkipBack className="w-7 h-7 fill-current drop-shadow-lg relative z-10" />
                        </button>

                        <button
                          onClick={handlePlayPause}
                          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 hover:from-cyan-300 hover:to-cyan-500 transition transform hover:scale-105 flex items-center justify-center shadow-xl shadow-cyan-400/30 border-2 border-white/20 relative overflow-hidden"
                        >
                          {/* Glossy overlay on play button */}
                          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none" />
                          
                          {isPlaying ? (
                            <Pause className="w-7 h-7 text-slate-900 fill-slate-900 relative z-10 drop-shadow-md" />
                          ) : (
                            <Play className="w-7 h-7 text-slate-900 fill-slate-900 ml-1 relative z-10 drop-shadow-md" />
                          )}
                        </button>

                        <button
                          onClick={handleNextTrack}
                          className="text-cyan-400 hover:text-cyan-300 transition p-2 rounded-xl hover:bg-white/5 backdrop-blur-xl border border-transparent hover:border-white/10 relative overflow-hidden group"
                          title="Next track"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition pointer-events-none" />
                          <SkipForward className="w-7 h-7 fill-current drop-shadow-lg relative z-10" />
                        </button>
                      </div>

                      {/* Additional Controls */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={toggleLike}
                          className={`transition p-2 rounded-xl backdrop-blur-xl border relative overflow-hidden ${
                            liked.has(currentTrack.id) 
                              ? 'text-red-500 bg-red-500/10 border-red-500/30' 
                              : 'text-slate-400 hover:text-red-400 hover:bg-white/5 border-transparent hover:border-white/10'
                          }`}
                          title="Like track"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                          <Heart className={`w-6 h-6 relative z-10 ${liked.has(currentTrack.id) ? 'fill-red-500 drop-shadow-lg' : ''}`} />
                        </button>

                        {/* <button className="text-cyan-400 hover:text-cyan-300 transition p-2 rounded-xl hover:bg-white/5 backdrop-blur-xl border border-transparent hover:border-white/10 relative overflow-hidden group">
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition pointer-events-none" />
                          <div className="flex flex-col gap-1 relative z-10">
                            <div className="w-6 h-0.5 bg-current rounded-full" />
                            <div className="w-6 h-0.5 bg-current rounded-full" />
                            <div className="w-6 h-0.5 bg-current rounded-full" />
                          </div>
                        </button> */}

                        <div className="flex items-center gap-2 backdrop-blur-xl bg-white/5 rounded-xl p-2 border border-white/10 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                          <button
                            onClick={toggleMute}
                            className="text-cyan-400 hover:text-cyan-300 transition relative z-10"
                          >
                            {isMuted || volume === 0 ? <VolumeX className="w-6 h-6 drop-shadow-lg" /> : <Volume2 className="w-6 h-6 drop-shadow-lg" />}
                          </button>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-24 h-1 rounded-full appearance-none cursor-pointer relative z-10"
                            style={{
                              background: `linear-gradient(to right, rgb(34, 211, 238) 0%, rgb(34, 211, 238) ${isMuted ? 0 : volume}%, rgb(51, 65, 85) ${isMuted ? 0 : volume}%, rgb(51, 65, 85) 100%)`
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