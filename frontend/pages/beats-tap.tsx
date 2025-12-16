import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import { Music, Play, Pause, Clock, Coins, Award, TrendingUp, Zap, RefreshCw, AlertCircle, Repeat } from 'lucide-react';
import { useCurrentAccount, useSuiClient, useSignAndExecuteTransactionBlock } from '@mysten/dapp-kit';
import { TransactionBlock } from '@mysten/sui.js/transactions';

const PACKAGE_ID = '0x989abceb5afcc1ee7f460b41e79f03ee4d3406191ee964da95db51a20fa95f27';
const MARKETPLACE_ID = '0xc92b9ba2f210fadaa565de58660757916c48fd44521998296c4157d0764b5cac';
const CLOCK_ID = '0x6';

export default function BeatsTap() {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutate: signAndExecuteTransactionBlock } = useSignAndExecuteTransactionBlock();
  
  const [listedMusic, setListedMusic] = useState<any[]>([]);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [playingTrack, setPlayingTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [listeningTime, setListeningTime] = useState(0);
  const [pendingRewards, setPendingRewards] = useState(0);
  const [marketplaceStats, setMarketplaceStats] = useState({ totalMusic: 0, totalListens: 0, totalRewards: 0, poolBalance: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);
  const BLOCKED_NFTS = new Set([
  '0x1de1522f65eb06dab7e9a8497700067e24cc5c8fd4d178765b895f4e8c44dba5']);

  // Fetch listed music NFTs
  const fetchListedMusic = async () => {
    if (!client) return;
    
    try {
      // Get marketplace stats
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

      // Fetch actual music NFTs from the marketplace
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

  // Check if user has active session
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

  // Timer for listening rewards
  useEffect(() => {
    if (isPlaying && currentSession) {
      const interval = setInterval(() => {
        setListeningTime(prev => prev + 1);
        setPendingRewards(prev => prev + 0.0000001);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, currentSession]);

  // Handle audio events
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

  // Update loop attribute when isLooping changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isLooping;
    }
  }, [isLooping]);

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
            console.log('Setting audio source:', track.audioUrl);
            audioRef.current.src = track.audioUrl;
            audioRef.current.load();
            
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  console.log('Audio playing successfully');
                  setIsPlaying(true);
                })
                .catch(err => {
                  console.error('Audio play error:', err);
                  setError('Failed to play audio. Click the play button to start.');
                  setIsPlaying(false);
                });
            }
          } else {
            console.warn('No audio URL or audio ref available');
          }
          
          fetchListedMusic();
        },
        onError: (error: any) => {
          setError(error.message || 'Failed to start listening');
        },
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
        onError: (error: any) => {
          setError(error.message || 'Failed to update listening');
        },
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
        onError: (error: any) => {
          setError(error.message || 'Failed to claim and stop');
        },
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
          .then(() => {
            setIsPlaying(true);
          })
          .catch(err => {
            console.error('Audio play error:', err);
            setError('Failed to play audio. The audio file may be invalid or blocked.');
          });
      }
    }
  }
};

const toggleLoop = () => {
  setIsLooping(!isLooping);
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

return (
  <>
    <Head>
      <title>Beats Tap - Listen to Earn | Beats</title>
      <meta name="description" content="Earn SUI by listening to amazing music" />
    </Head>

    <div className="min-h-screen text-white space-y-8" style={{
      background: 'linear-gradient(135deg, rgba(10, 14, 39, 0.95) 0%, rgba(20, 24, 41, 0.95) 100%)',
      padding: '2rem'
    }}>
      <audio ref={audioRef} crossOrigin="anonymous" />

      {/* Alerts */}
      {/* Error Modal */}
      {error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.7)' }}>
          <div className="bg-slate-900 border border-red-500/50 rounded-lg p-6 max-w-md w-full shadow-2xl animate-scale-in">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(239, 68, 68, 0.2)' }}>
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">Error</h3>
                <p className="text-slate-300 text-sm">{error}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setError('')}
                className="px-6 py-2 rounded-lg font-semibold transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.7)' }}>
          <div className="bg-slate-900 border border-green-500/50 rounded-lg p-6 max-w-md w-full shadow-2xl animate-scale-in">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.2)' }}>
                <Zap className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">Success!</h3>
                <p className="text-slate-300 text-sm">{success}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSuccess('')}
                className="px-6 py-2 rounded-lg font-semibold transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-black" style={{
          background: 'linear-gradient(135deg, #a855f7 0%, #06b6d4 50%, #f97316 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 0 30px rgba(168, 85, 247, 0.5)'
        }}>
          Listen to Earn
        </h1>
        <p className="text-lg text-slate-300">
          Beats Music is a Blockchain music where Holders can use their NFTs to earn SUI Token.
        </p>
      </div>

      {/* Stats Grid - Full Width */}
<div className="grid md:grid-cols-2 gap-6">
  
  {/* Marketplace Stats */}
  <div
    className="rounded-lg p-4 border space-y-3"
    style={{
      background: 'rgba(15, 23, 42, 0.6)',
      borderColor: 'rgba(168, 85, 247, 0.3)',
      backdropFilter: 'blur(10px)',
    }}
  >
    <h3 className="text-base font-semibold flex items-center gap-1.5">
      <Award className="w-4 h-4" style={{ color: '#f97316' }} />
      Marketplace Stats
    </h3>

    {/* Horizontal Stats */}
    <div className="grid grid-cols-3 gap-4">
      <div>
        <p className="text-[10px] text-slate-500 uppercase font-semibold">
          Total Music
        </p>
        <p className="text-2xl font-extrabold" style={{ color: '#06b6d4' }}>
          {marketplaceStats.totalMusic - 1}
        </p>
      </div>

      <div>
        <p className="text-[10px] text-slate-500 uppercase font-semibold">
          Total Listens
        </p>
        <p className="text-2xl font-extrabold" style={{ color: '#a855f7' }}>
          {marketplaceStats.totalListens}
        </p>
      </div>

      <div>
        <p className="text-[10px] text-slate-500 uppercase font-semibold">
          Distributed
        </p>
        <p className="text-xl font-extrabold" style={{ color: '#10b981' }}>
          {marketplaceStats.totalRewards.toFixed(4)}
        </p>
        <p className="text-[10px] text-slate-500">SUI</p>
      </div>
    </div>
  </div>

  {/* Reward Pool */}
  <div
    className="rounded-lg p-4 border space-y-3"
    style={{
      background: 'rgba(15, 23, 42, 0.6)',
      borderColor: 'rgba(249, 115, 22, 0.3)',
      backdropFilter: 'blur(10px)',
    }}
  >
    <h3 className="text-base font-semibold flex items-center gap-1.5">
      <Zap className="w-4 h-4" style={{ color: '#f97316' }} />
      Reward Pool
    </h3>

    {/* Horizontal Pool Info */}
    <div
      className="flex items-center justify-between divide-x"
      style={{ borderColor: 'rgba(249, 115, 22, 0.2)' }}
    >
      <div className="px-3">
        <p className="text-[10px] uppercase text-slate-500 font-semibold">
          Available
        </p>
        <p className="text-2xl font-extrabold" style={{ color: '#f97316' }}>
          {marketplaceStats.poolBalance.toFixed(4)}
        </p>
        <p className="text-[10px] text-slate-500">SUI</p>
      </div>

      <div className="px-3">
        <p className="text-[10px] uppercase text-slate-500 font-semibold">
          Earn Rate
        </p>
        <p className="text-sm font-bold" style={{ color: '#f97316' }}>
          0.0000001
        </p>
        <p className="text-[10px] text-slate-500">SUI / sec</p>
      </div>

      <div className="px-3">
        <p className="text-[10px] uppercase text-slate-500 font-semibold">
          Rate (MIST)
        </p>
        <p className="text-sm font-bold text-slate-300">
          100 / sec
        </p>
      </div>
    </div>
  </div>
</div>


      
      {/* Music Player Modal */}
      {currentSession && playingTrack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.8)' }}>
          <div className="bg-slate-900 rounded-lg border max-w-2xl w-full shadow-2xl animate-scale-in" style={{
            borderColor: 'rgba(168, 85, 247, 0.5)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Now Playing</h3>
                <button
                  onClick={() => {
                    if (isPlaying) {
                      setError('Please pause the music before minimizing');
                    }
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                  title="Pause music to close"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <img src={playingTrack.image} alt={playingTrack.title} className="w-32 h-32 rounded-lg object-cover shadow-lg" />
                <div className="flex-1">
                  <h4 className="text-2xl font-bold">{playingTrack.title}</h4>
                  <p className="text-slate-400">{playingTrack.artist}</p>
                  <p className="text-sm mt-2" style={{ color: '#a855f7' }}>Earning 0.0000001 SUI per second</p>
                </div>
              </div>

              <div className="flex justify-center gap-4 mb-6">
                <button
                  onClick={togglePlayPause}
                  className="p-4 rounded-full transition-all hover:scale-110"
                  style={{ background: 'linear-gradient(135deg, #a855f7, #06b6d4)' }}
                >
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                </button>
                <button
                  onClick={toggleLoop}
                  className={`p-4 rounded-full transition-all hover:scale-110 ${isLooping ? 'ring-2 ring-white' : ''}`}
                  style={{ 
                    background: isLooping 
                      ? 'linear-gradient(135deg, #f97316, #ef4444)' 
                      : 'linear-gradient(135deg, #64748b, #475569)' 
                  }}
                  title={isLooping ? "Loop ON - Music will repeat" : "Loop OFF - Music plays once"}
                >
                  <Repeat className="w-8 h-8" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-black/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Listening Time</span>
                  </div>
                  <div className="text-2xl font-bold">{formatTime(listeningTime)}</div>
                </div>  
                <div className="bg-black/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Coins className="w-4 h-4" />
                    <span className="text-sm">Pending Rewards</span>
                  </div>
                  <div className="text-2xl font-bold" style={{ color: '#f97316' }}>{pendingRewards.toFixed(8)} SUI</div>
                  <div className="text-xs text-slate-500 mt-1">{(pendingRewards * 1_000_000_000).toFixed(0)} MIST</div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={updateListening}
                  disabled={loading || !isPlaying}
                  className="w-full py-3 px-4 rounded-lg font-semibold disabled:opacity-50 transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #06b6d4, #a855f7)' }}
                >
                  Update Time
                </button>
                <button
                  onClick={claimAndStop}
                  disabled={loading || pendingRewards === 0 || isPlaying}
                  className="w-full py-3 px-4 rounded-lg font-semibold disabled:opacity-50 transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #10b981, #f97316)' }}
                >
                  {isPlaying ? 'Pause to Claim' : 'Claim & Stop'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-6">

        {/* Main Content */}
        {/* Available Music */}
        <div className="rounded-lg p-6 border" style={{
          background: 'rgba(15, 23, 42, 0.6)',
          borderColor: 'rgba(148, 163, 184, 0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Available Music</h3>
            <button
              onClick={fetchListedMusic}
              disabled={loading}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
          
          {!account ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#f97316' }} />
              <p className="text-slate-400">Connect your wallet to start listening</p>
            </div>
          ) : listedMusic.length === 0 ? (
            <div className="text-center py-12">
              <Music className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No music listed yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listedMusic.map((track) => (
                <div key={track.id} className="rounded-lg p-4 hover:bg-white/5 transition-all border border-white/10 group hover:border-purple-500/50">
                  <img 
                    src={track.image} 
                    alt={track.title} 
                    className="w-full h-40 object-cover rounded-lg mb-3 group-hover:scale-105 transition-transform"
                    onError={(e: any) => {
                      e.target.src = 'https://via.placeholder.com/300?text=No+Image';
                    }}
                  />
                  <h4 className="font-bold mb-1">{track.title}</h4>
                  <p className="text-sm text-slate-400 mb-1">{track.artist}</p>
                  {track.description && (
                    <p className="text-xs text-slate-500 mb-2 line-clamp-2">{track.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                    <span>🎧 {track.totalListens} plays</span>
                    <span>⏱️ {Math.floor(track.totalListenTime / 60)}m</span>
                  </div>
                  <button
                    onClick={() => startListening(track.id)}
                    disabled={loading || currentSession !== null}
                    className="w-full py-2 px-4 rounded-lg font-semibold disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #a855f7, #06b6d4)' }}
                  >
                    <Play className="w-4 h-4" />
                    {currentSession ? 'Already Listening' : 'Start Listening'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* How It Works */}
        <div className="rounded-lg p-6 border space-y-4" style={{
          background: 'rgba(15, 23, 42, 0.6)',
          borderColor: 'rgba(6, 182, 212, 0.3)',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5" style={{ color: '#06b6d4' }} />
            How It Works
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0" style={{ background: '#a855f7' }}>1</div>
              <div>
                <p className="font-semibold">Start Listening</p>
                <p className="text-slate-400 text-xs">Click any track to begin</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0" style={{ background: '#06b6d4' }}>2</div>
              <div>
                <p className="font-semibold">Earn Rewards</p>
                <p className="text-slate-400 text-xs">100 MIST per second</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0" style={{ background: '#f97316' }}>3</div>
              <div>
                <p className="font-semibold">Claim Anytime</p>
                <p className="text-slate-400 text-xs">Get your SUI rewards</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
);
}