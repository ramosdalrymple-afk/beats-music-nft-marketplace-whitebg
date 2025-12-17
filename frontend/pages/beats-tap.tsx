import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import { Music, Play, Pause, Clock, Coins, Award, TrendingUp, Zap, RefreshCw, AlertCircle, Repeat, Disc, Volume2, Volume1, VolumeX, X } from 'lucide-react';
import { useCurrentAccount, useSuiClient, useSignAndExecuteTransactionBlock } from '@mysten/dapp-kit';
import { TransactionBlock } from '@mysten/sui.js/transactions';

// --- Constants (Unchanged) ---
const PACKAGE_ID = '0x989abceb5afcc1ee7f460b41e79f03ee4d3406191ee964da95db51a20fa95f27';
const MARKETPLACE_ID = '0xc92b9ba2f210fadaa565de58660757916c48fd44521998296c4157d0764b5cac';
const CLOCK_ID = '0x6';

export default function BeatsTap() {
  // --- Logic & State ---
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutate: signAndExecuteTransactionBlock } = useSignAndExecuteTransactionBlock();
  
  const [listedMusic, setListedMusic] = useState<any[]>([]);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [playingTrack, setPlayingTrack] = useState<any>(null);
  
  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [volume, setVolume] = useState(0.5); // Default to 50%
  const [isMuted, setIsMuted] = useState(false);
  
  const [listeningTime, setListeningTime] = useState(0);
  const [pendingRewards, setPendingRewards] = useState(0);
  const [marketplaceStats, setMarketplaceStats] = useState({ totalMusic: 0, totalListens: 0, totalRewards: 0, poolBalance: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const BLOCKED_NFTS = new Set(['0x1de1522f65eb06dab7e9a8497700067e24cc5c8fd4d178765b895f4e8c44dba5']);

  // --- Functions ---
  const fetchListedMusic = async () => {
    if (!client) return;
    try {
      const tx = new TransactionBlock();
      tx.moveCall({
        target: `${PACKAGE_ID}::music_marketplace::get_marketplace_stats`,
        arguments: [tx.object(MARKETPLACE_ID)],
      });

      const result = await client.devInspectTransactionBlock({
        sender: account?.address || '0x0000000000000000000000000000000000000000000000000000000000000000',
        transactionBlock: tx,
      });

      if (result.results?.[0]?.returnValues) {
        const [musicCount, listens, rewards, pool] = result.results[0].returnValues;
        setMarketplaceStats({
          totalMusic: Number(new DataView(new Uint8Array(musicCount[0]).buffer).getBigUint64(0, true)),
          totalListens: Number(new DataView(new Uint8Array(listens[0]).buffer).getBigUint64(0, true)),
          totalRewards: Number(new DataView(new Uint8Array(rewards[0]).buffer).getBigUint64(0, true)) / 1_000_000_000,
          poolBalance: Number(new DataView(new Uint8Array(pool[0]).buffer).getBigUint64(0, true)) / 1_000_000_000,
        });
      }

      const marketplaceObject = await client.getObject({
        id: MARKETPLACE_ID,
        options: { showContent: true }
      });

      if (marketplaceObject?.data?.content?.fields) {
        const musicLibrary = (marketplaceObject.data.content.fields as any).music_library;
        
        if (musicLibrary?.fields?.id?.id) {
          const tableId = musicLibrary.fields.id.id;
          let allDynamicFields: any[] = [];
          let hasNextPage = true;
          let cursor = null;

          while (hasNextPage) {
            const dynamicFieldsResponse = await client.getDynamicFields({
              parentId: tableId,
              cursor: cursor,
              limit: 50,
            });

            allDynamicFields = allDynamicFields.concat(dynamicFieldsResponse.data);
            hasNextPage = dynamicFieldsResponse.hasNextPage;
            cursor = dynamicFieldsResponse.nextCursor;
          }

          const musicPromises = allDynamicFields.map(async (field) => {
            try {
              const fieldObject = await client.getObject({
                id: field.objectId,
                options: { showContent: true }
              });

              if (fieldObject?.data?.content?.fields) {
                const fields = fieldObject.data.content.fields as any;
                if (fields.value?.fields) {
                  const listing = fields.value.fields;
                  const nft = listing.nft.fields;
                  
                  return {
                    id: field.name.value,
                    title: nft.name || 'Untitled',
                    artist: nft.creator ? `${nft.creator.slice(0, 6)}...${nft.creator.slice(-4)}` : 'Unknown',
                    image: nft.image_url || 'https://via.placeholder.com/300',
                    audioUrl: nft.music_url || '',
                    description: nft.description || '',
                    totalListens: Number(listing.total_listens || 0),
                    totalListenTime: Number(listing.total_listen_time_seconds || 0),
                    owner: listing.owner || '',
                  };
                }
              }
            } catch (err) {
              console.error('Error fetching music NFT:', err);
              return null;
            }
          });

          const musicList = (await Promise.all(musicPromises))
            .filter(m => m !== null && !BLOCKED_NFTS.has(m.id));
          setListedMusic(musicList);
        }
      }
    } catch (err) {
      console.error('Error fetching music:', err);
    }
  };

  const checkActiveSession = async () => {
    if (!client || !account) return;
    try {
      const tx = new TransactionBlock();
      tx.moveCall({
        target: `${PACKAGE_ID}::music_marketplace::is_listening`,
        arguments: [tx.object(MARKETPLACE_ID), tx.pure.address(account.address)],
      });

      const result = await client.devInspectTransactionBlock({
        sender: account.address,
        transactionBlock: tx,
      });

      if (result.results?.[0]?.returnValues?.[0]) {
        const isListening = new Uint8Array(result.results[0].returnValues[0][0])[0] === 1;
        
        if (isListening) {
          const tx2 = new TransactionBlock();
          tx2.moveCall({
            target: `${PACKAGE_ID}::music_marketplace::get_listening_session`,
            arguments: [tx2.object(MARKETPLACE_ID), tx2.pure.address(account.address)],
          });

          const sessionResult = await client.devInspectTransactionBlock({
            sender: account.address,
            transactionBlock: tx2,
          });

          if (sessionResult.results?.[0]?.returnValues) {
            const [nftId, startTime, seconds, rewards] = sessionResult.results[0].returnValues;
            const nftIdStr = '0x' + Array.from(new Uint8Array(nftId[0])).map(b => b.toString(16).padStart(2, '0')).join('');
            const totalSeconds = Number(new DataView(new Uint8Array(seconds[0]).buffer).getBigUint64(0, true));
            const pendingRewardsMist = Number(new DataView(new Uint8Array(rewards[0]).buffer).getBigUint64(0, true));
            
            if (!currentSession) {
              setCurrentSession({
                nftId: nftIdStr,
                startTime: Number(new DataView(new Uint8Array(startTime[0]).buffer).getBigUint64(0, true)),
                totalSeconds: totalSeconds,
                pendingRewards: pendingRewardsMist / 1_000_000_000,
              });
              setListeningTime(totalSeconds);
              setPendingRewards(pendingRewardsMist / 1_000_000_000);
              
              const track = listedMusic.find(m => m.id === nftIdStr);
              if (track) {
                setPlayingTrack(track);
              }
            }
          }
        } else {
          if (currentSession) {
            setCurrentSession(null);
            setPlayingTrack(null);
            setIsPlaying(false);
            setListeningTime(0);
            setPendingRewards(0);
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }
          }
        }
      }
    } catch (err) {
      console.error('Error checking session:', err);
    }
  };

  useEffect(() => {
    fetchListedMusic();
  }, [client, account]);
  
  useEffect(() => {
    if (account && listedMusic.length > 0) {
      checkActiveSession();
    }
  }, [account, listedMusic.length]);

  useEffect(() => {
    if (isPlaying && currentSession) {
      const interval = setInterval(() => {
        setListeningTime(prev => prev + 1);
        setPendingRewards(prev => prev + 0.0000001);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, currentSession]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      console.log('Audio ended');
      setIsPlaying(false);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isLooping;
    }
  }, [isLooping]);

  // Sync Volume State
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const startListening = async (nftId: string) => {
    if (!account) {
      setError('Please connect your wallet');
      return;
    }
    setLoading(true);
    try {
      const tx = new TransactionBlock();
      tx.moveCall({
        target: `${PACKAGE_ID}::music_marketplace::start_listening`,
        arguments: [
          tx.object(MARKETPLACE_ID),
          tx.pure.id(nftId),
          tx.object(CLOCK_ID),
        ],
      });

      signAndExecuteTransactionBlock(
        { transactionBlock: tx },
        {
          onSuccess: () => {
            setSuccess('Started listening! Rewards are accumulating...');
            const track = listedMusic.find(m => m.id === nftId);
            setCurrentSession({ nftId, startTime: Date.now(), totalSeconds: 0, pendingRewards: 0 });
            setPlayingTrack(track);
            setListeningTime(0);
            setPendingRewards(0);
            
            if (audioRef.current && track?.audioUrl) {
              audioRef.current.src = track.audioUrl;
              audioRef.current.load();
              // Apply volume setting immediately on load
              audioRef.current.volume = isMuted ? 0 : volume;
              
              const playPromise = audioRef.current.play();
              if (playPromise !== undefined) {
                playPromise
                  .then(() => setIsPlaying(true))
                  .catch(err => {
                    console.error('Audio play error:', err);
                    setError('Failed to play audio. Click the play button to start.');
                    setIsPlaying(false);
                  });
              }
            }
            fetchListedMusic();
          },
          onError: (error: any) => setError(error.message || 'Failed to start listening'),
        }
      );
    } catch (err: any) {
      setError(err.message || 'Failed to start listening');
    } finally {
      setLoading(false);
    }
  };

  const updateListening = async () => {
    if (!currentSession) return;
    setLoading(true);
    try {
      const tx = new TransactionBlock();
      tx.moveCall({
        target: `${PACKAGE_ID}::music_marketplace::update_listening`,
        arguments: [
          tx.object(MARKETPLACE_ID),
          tx.pure.u64(10),
          tx.object(CLOCK_ID),
        ],
      });

      signAndExecuteTransactionBlock(
        { transactionBlock: tx },
        {
          onSuccess: () => {
            setSuccess('Listening time updated!');
            checkActiveSession();
          },
          onError: (error: any) => setError(error.message || 'Failed to update listening'),
        }
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update listening');
    } finally {
      setLoading(false);
    }
  };

  const claimAndStop = async () => {
    if (!currentSession) return;
    setLoading(true);
    try {
      const tx = new TransactionBlock();
      tx.moveCall({
        target: `${PACKAGE_ID}::music_marketplace::update_listening`,
        arguments: [
          tx.object(MARKETPLACE_ID),
          tx.pure.u64(Math.floor(listeningTime)),
          tx.object(CLOCK_ID),
        ],
      });
      tx.moveCall({
        target: `${PACKAGE_ID}::music_marketplace::claim_rewards`,
        arguments: [tx.object(MARKETPLACE_ID)],
      });
      tx.moveCall({
        target: `${PACKAGE_ID}::music_marketplace::stop_listening`,
        arguments: [tx.object(MARKETPLACE_ID)],
      });

      signAndExecuteTransactionBlock(
        { transactionBlock: tx },
        {
          onSuccess: () => {
            setSuccess(`Claimed ${pendingRewards.toFixed(8)} SUI!`);
            setCurrentSession(null);
            setPlayingTrack(null);
            setIsPlaying(false);
            setListeningTime(0);
            setPendingRewards(0);
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }
            setTimeout(() => fetchListedMusic(), 2000);
          },
          onError: (error: any) => setError(error.message || 'Failed to claim and stop'),
        }
      );
    } catch (err: any) {
      setError(err.message || 'Failed to claim and stop');
    } finally {
      setLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch(err => {
              console.error('Audio play error:', err);
              setError('Failed to play audio. The audio file may be invalid or blocked.');
            });
        }
      }
    }
  };

  const toggleLoop = () => setIsLooping(!isLooping);
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Head>
        <title>Beats Tap - Listen to Earn</title>
        <meta name="description" content="Earn SUI by listening to amazing music" />
      </Head>

      <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-purple-500/30 relative overflow-hidden font-sans pb-32">
        <audio ref={audioRef} crossOrigin="anonymous" />
        
        {/* Ambient Background */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/10 blur-[120px]" />
        </div>

        {/* Notifications */}
        <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2 max-w-sm w-full">
          {error && (
            <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 text-red-200 p-4 rounded-xl shadow-2xl flex items-start gap-3 animate-in slide-in-from-right">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-sm">{error}</div>
              <button onClick={() => setError('')} className="text-red-400 hover:text-white transition-colors">✕</button>
            </div>
          )}
          {success && (
            <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/20 text-emerald-200 p-4 rounded-xl shadow-2xl flex items-start gap-3 animate-in slide-in-from-right">
              <Zap className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-sm">{success}</div>
              <button onClick={() => setSuccess('')} className="text-emerald-400 hover:text-white transition-colors">✕</button>
            </div>
          )}
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row items-end justify-between gap-6 pb-6 border-b border-white/5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-400 mb-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Sui Network Live
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-orange-400">
                Beats Tap
              </h1>
              <p className="text-lg text-slate-400 max-w-xl">
                The first Listen-to-Earn protocol on Sui. Stream high-quality tracks and earn automatic rewards every second.
              </p>
            </div>
            
            <button 
              onClick={fetchListedMusic}
              disabled={loading}
              className="group flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform'}`} />
              <span className="font-medium">Refresh Library</span>
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative group overflow-hidden rounded-2xl p-5 bg-slate-900/50 border border-white/10 backdrop-blur-md">
              <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <Award className="w-20 h-20 rotate-12" />
              </div>
              <h3 className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-purple-400" /> Marketplace
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xl md:text-2xl font-bold text-white leading-tight">{marketplaceStats.totalMusic - 1}</div>
                  <div className="text-[10px] text-slate-500 font-medium uppercase mt-1">Tracks</div>
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-bold text-white leading-tight">{marketplaceStats.totalListens}</div>
                  <div className="text-[10px] text-slate-500 font-medium uppercase mt-1">Plays</div>
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-bold text-emerald-400 leading-tight">{marketplaceStats.totalRewards.toFixed(2)}</div>
                  <div className="text-[10px] text-slate-500 font-medium uppercase mt-1">Dist. (SUI)</div>
                </div>
              </div>
            </div>

            <div className="relative group overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-orange-500/10 to-purple-600/5 border border-white/10 backdrop-blur-md">
              <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <Zap className="w-20 h-20 rotate-12 text-orange-500" />
              </div>
              <h3 className="text-xs uppercase tracking-wider text-orange-400/80 font-semibold mb-3 flex items-center gap-2">
                <Coins className="w-3.5 h-3.5" /> Reward Pool
              </h3>
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400 leading-none">
                    {marketplaceStats.poolBalance.toFixed(4)}
                  </span>
                  <span className="text-sm font-bold text-slate-500">SUI</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 w-[45%]" />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Rate: 100 MIST/s</span>
                  <span className="flex items-center gap-1 text-emerald-400"><div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"/> Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Music Library */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Disc className="w-6 h-6 text-cyan-400" /> 
              Featured Tracks
            </h2>

            {!account ? (
              <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed border-slate-800 bg-slate-900/30">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                  <Volume2 className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-lg font-medium text-slate-300">Connect Wallet</h3>
                <p className="text-slate-500 text-sm mt-1">Connect your Sui wallet to start earning</p>
              </div>
            ) : listedMusic.length === 0 ? (
              <div className="text-center py-20 rounded-3xl bg-slate-900/30 border border-white/5">
                <Music className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-400">No music listed yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {listedMusic.map((track) => (
                  <div key={track.id} className="group relative bg-slate-900/40 border border-white/5 rounded-2xl p-4 hover:bg-white/5 hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-1">
                    <div className="relative aspect-square rounded-xl overflow-hidden mb-4 shadow-lg bg-slate-800">
                      <img 
                        src={track.image} 
                        alt={track.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e: any) => { e.target.src = 'https://via.placeholder.com/300?text=No+Image'; }}
                      />
                      <button 
                        onClick={() => startListening(track.id)}
                        disabled={loading || currentSession !== null}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm cursor-pointer disabled:cursor-not-allowed"
                      >
                         <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center pl-1 hover:scale-110 transition-transform">
                            {currentSession?.nftId === track.id ? (
                                <div className="flex gap-1 h-4 items-end">
                                    <div className="w-1 bg-black h-full animate-[bounce_1s_infinite]"></div>
                                    <div className="w-1 bg-black h-2/3 animate-[bounce_1.2s_infinite]"></div>
                                    <div className="w-1 bg-black h-full animate-[bounce_0.8s_infinite]"></div>
                                </div>
                            ) : (
                                <Play className="w-6 h-6 fill-current" />
                            )}
                         </div>
                      </button>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-white truncate pr-2">{track.title}</h4>
                      <p className="text-sm text-slate-400 truncate">{track.artist}</p>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-t border-white/5 pt-3">
                      <div className="flex items-center gap-1.5">
                         <Play className="w-3 h-3" /> 
                         {track.totalListens}
                      </div>
                      <div className="flex items-center gap-1.5">
                         <Clock className="w-3 h-3" />
                         {Math.floor(track.totalListenTime / 60)}m
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-6 pt-8 border-t border-white/5">
              {[
                  { step: '01', title: 'Select', desc: 'Choose a track from the curated library.' },
                  { step: '02', title: 'Listen', desc: 'Stream audio. Earn 100 MIST per second.' },
                  { step: '03', title: 'Earn', desc: 'Rewards settle instantly to your wallet.' }
              ].map((item) => (
                  <div key={item.step} className="flex gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors">
                      <span className="text-3xl font-black text-slate-800">{item.step}</span>
                      <div>
                          <h4 className="font-bold text-white">{item.title}</h4>
                          <p className="text-sm text-slate-400">{item.desc}</p>
                      </div>
                  </div>
              ))}
          </div>

        </div>

        {/* --- COMPACT PLAYER OVERLAY --- */}
        {currentSession && playingTrack && (
          <div className="fixed bottom-0 left-0 w-full z-50 p-4 flex justify-center animate-in slide-in-from-bottom duration-500">
             <div className="w-full max-w-5xl bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row items-center p-3 gap-4">
               
                {/* 1. Track Info */}
                <div className="flex items-center gap-3 w-full md:w-auto flex-1 min-w-0">
                    <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800 shadow-md group">
                        <img src={playingTrack.image} alt="Art" className="w-full h-full object-cover" />
                        {isPlaying && (
                             <div className="absolute inset-0 bg-black/20 flex items-center justify-center gap-0.5">
                                 <div className="w-0.5 h-3 bg-white animate-[bounce_1s_infinite]"></div>
                                 <div className="w-0.5 h-4 bg-white animate-[bounce_1.2s_infinite]"></div>
                                 <div className="w-0.5 h-2 bg-white animate-[bounce_0.8s_infinite]"></div>
                             </div>
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-white truncate">{playingTrack.title}</h3>
                        <p className="text-xs text-slate-400 truncate">{playingTrack.artist}</p>
                    </div>
                </div>

                {/* 2. Controls & Stats */}
                <div className="flex flex-col items-center justify-center gap-2 w-full md:w-auto">
                    <div className="flex items-center gap-4">
                        <button onClick={toggleLoop} className={`p-1.5 rounded-full transition-colors ${isLooping ? 'text-purple-400 bg-purple-500/10' : 'text-slate-500 hover:text-white'}`}>
                            <Repeat className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={togglePlayPause}
                            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
                        >
                            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                        </button>
                        <button 
                            onClick={updateListening}
                            disabled={loading || !isPlaying}
                            className="p-1.5 rounded-full text-slate-500 hover:text-white transition-colors disabled:opacity-30"
                            title="Sync Time"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 bg-black/20 px-3 py-1 rounded-full">
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {formatTime(listeningTime)}
                        </span>
                        <span className="w-px h-3 bg-white/10"></span>
                        <span className="flex items-center gap-1 text-emerald-400">
                            <Zap className="w-3 h-3" /> +{pendingRewards.toFixed(6)} SUI
                        </span>
                    </div>
                </div>

                {/* 3. Actions & Volume */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-1">
                    
                    {/* VOLUME CONTROL (Aligned) */}
                    <div className="hidden sm:flex items-center gap-2 px-2">
                        <button onClick={toggleMute} className="text-slate-400 hover:text-white transition-colors">
                            {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : volume < 0.5 ? <Volume1 className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-24 h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-110 transition-all"
                        />
                    </div>

                    <button 
                        onClick={claimAndStop}
                        disabled={loading || pendingRewards === 0 || isPlaying}
                        className="flex-1 md:flex-none px-4 py-2.5 rounded-lg font-bold text-xs bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:opacity-50 disabled:grayscale transition-all shadow-lg active:scale-[0.98] whitespace-nowrap"
                    >
                        {isPlaying ? 'Pause to Claim' : 'Claim & Stop'}
                    </button>
                    
                    <button 
                        onClick={() => { if(!isPlaying) setPlayingTrack(null); else setError("Pause music to close"); }}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-500 hover:text-red-400"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
             </div>
          </div>
        )}

      </div>
    </>
  );
}