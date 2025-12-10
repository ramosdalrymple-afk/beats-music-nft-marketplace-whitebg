import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, SkipBack, SkipForward } from 'lucide-react';

interface AudioPlayerProps {
  title: string;
  artist: string;
  audioUrl?: string;
  compact?: boolean;
}

export default function AudioPlayer({
  title,
  artist,
  audioUrl,
  compact = false,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (compact) {
    return (
      <div className="flex items-center justify-center gap-2">
        <audio ref={audioRef} src={audioUrl} />
        <button
          onClick={togglePlay}
          className="p-2 rounded-full bg-brand-purple/20 hover:bg-brand-purple/40 transition border border-brand-purple/50"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-brand-purple" />
          ) : (
            <Play className="w-4 h-4 text-brand-purple fill-brand-purple" />
          )}
        </button>
        <div className="w-20 h-1 bg-dark-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-purple-orange transition-all"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
        </div>
        <span className="text-xs text-slate-500">{formatTime(currentTime)}</span>
      </div>
    );
  }

  return (
    <div className="glass-dark rounded-lg p-4 space-y-4">
      <audio ref={audioRef} src={audioUrl} />

      {/* Info */}
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="text-sm text-slate-400">{artist}</p>
      </div>

      {/* Visualizer */}
      <div className="flex items-center justify-center gap-1 h-16 bg-dark-secondary rounded p-2">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="bar w-1 bg-gradient-brand rounded-full"
          />
        ))}
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleProgressChange}
          className="w-full h-1 bg-dark-secondary rounded-full appearance-none cursor-pointer accent-brand-purple"
        />
        <div className="flex justify-between text-xs text-slate-500">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button className="p-2 hover:text-brand-cyan transition">
          <SkipBack className="w-5 h-5" />
        </button>

        <button
          onClick={togglePlay}
          className="p-3 rounded-full bg-gradient-purple-orange hover:shadow-lg transition glow-purple"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 text-white fill-white" />
          ) : (
            <Play className="w-6 h-6 text-white fill-white" />
          )}
        </button>

        <button className="p-2 hover:text-brand-cyan transition">
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2">
        <Volume2 className="w-4 h-4 text-slate-500" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
          className="flex-1 h-1 bg-dark-secondary rounded-full appearance-none cursor-pointer accent-brand-cyan"
        />
        <span className="text-xs text-slate-500 w-6">{Math.round(volume * 100)}%</span>
      </div>
    </div>
  );
}
