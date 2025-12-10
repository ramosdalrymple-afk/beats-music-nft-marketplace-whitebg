import { useState } from 'react';
import { Play, Pause, Volume2, SkipBack, SkipForward, Zap, Award } from 'lucide-react';

interface ListenToEarnPlayerProps {
  beatTitle: string;
  artist: string;
  characterName: string;
}

export default function ListenToEarnPlayer({
  beatTitle,
  artist,
  characterName,
}: ListenToEarnPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180); // 3 minutes
  const [earningsAccumulated, setEarningsAccumulated] = useState(0);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      // Simulate earnings accumulation
      const interval = setInterval(() => {
        setEarningsAccumulated((prev) => prev + 0.001);
      }, 100);
      return () => clearInterval(interval);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(parseFloat(e.target.value));
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent = (currentTime / duration) * 100;

  return (
    <div className="w-full h-screen flex flex-col bg-gradient-dark text-white overflow-hidden md:h-auto md:rounded-lg md:border md:border-brand-purple/30 md:glass-dark md:p-6 md:max-w-lg md:mx-auto">
      {/* Character Display */}
      <div className="relative flex-1 flex items-center justify-center bg-gradient-to-b from-brand-purple/20 via-dark-base to-dark-secondary md:rounded-lg overflow-hidden md:h-64 md:mb-6">
        {/* Glow Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-brand-purple/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-brand-orange/20 rounded-full blur-3xl" />
        </div>

        {/* Character Placeholder */}
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-40 h-40 md:w-32 md:h-32 rounded-full bg-gradient-brand/20 border-2 border-brand-purple flex items-center justify-center">
            <div className="w-36 h-36 md:w-28 md:h-28 rounded-full bg-dark-card border border-brand-cyan/30 flex items-center justify-center">
              <span className="text-6xl md:text-5xl">🎤</span>
            </div>
          </div>
          <h3 className="text-2xl md:text-xl font-black neon-text-glow text-center">{characterName}</h3>
          <div className="flex items-center gap-2 bg-brand-purple/20 border border-brand-purple/50 rounded-full px-4 py-2">
            <Zap className="w-4 h-4 text-brand-orange animate-pulse" />
            <span className="font-bold text-brand-orange">+{earningsAccumulated.toFixed(3)} SUI</span>
          </div>
        </div>
      </div>

      {/* Player Content */}
      <div className="flex-1 flex flex-col justify-between p-6 md:p-0 md:flex-initial">
        {/* Song Info */}
        <div className="space-y-2 md:mb-6">
          <h2 className="text-3xl md:text-2xl font-black neon-text-glow line-clamp-2">
            {beatTitle}
          </h2>
          <p className="text-lg md:text-base text-slate-400">{artist}</p>
        </div>

        {/* Earning Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6 md:mb-4">
          <div className="glass-dark rounded-lg p-3 border border-brand-cyan/30 text-center">
            <p className="text-xs text-slate-500">Session Earned</p>
            <p className="text-lg font-black text-brand-cyan">{earningsAccumulated.toFixed(3)}</p>
          </div>
          <div className="glass-dark rounded-lg p-3 border border-brand-orange/30 text-center">
            <p className="text-xs text-slate-500">Daily Goal</p>
            <p className="text-lg font-black text-brand-orange">5/50 SUI</p>
          </div>
          <div className="glass-dark rounded-lg p-3 border border-brand-purple/30 text-center">
            <p className="text-xs text-slate-500">Multiplier</p>
            <p className="text-lg font-black text-brand-purple">1.5x</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 mb-6 md:mb-4">
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={handleProgressChange}
            className="w-full h-2 bg-dark-secondary rounded-full appearance-none cursor-pointer accent-brand-purple"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          {/* Visual Progress Indicator */}
          <div className="w-full h-1 bg-dark-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-purple-orange transition-all duration-100"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mb-6 md:mb-4">
          <button className="p-2 hover:text-brand-cyan transition">
            <SkipBack className="w-6 h-6" />
          </button>

          <button
            onClick={togglePlay}
            className="p-5 rounded-full bg-gradient-brand hover:shadow-lg hover:shadow-brand-purple/50 transition glow-brand"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-white fill-white" />
            ) : (
              <Play className="w-8 h-8 text-white fill-white ml-1" />
            )}
          </button>

          <button className="p-2 hover:text-brand-cyan transition">
            <SkipForward className="w-6 h-6" />
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3 mb-6 md:mb-0">
          <Volume2 className="w-5 h-5 text-slate-500" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            defaultValue="0.7"
            className="flex-1 h-1 bg-dark-secondary rounded-full appearance-none cursor-pointer accent-brand-cyan"
          />
        </div>

        {/* Info Section */}
        <div className="mt-6 pt-6 border-t border-brand-purple/20 md:mt-4 md:pt-4">
          <div className="flex items-start gap-3">
            <Award className="w-5 h-5 text-brand-orange flex-shrink-0 mt-1" />
            <div className="text-sm space-y-1">
              <p className="font-semibold text-brand-cyan">Boost Active</p>
              <p className="text-slate-400">
                Earn 50% more SUI while listening to this Soul Collection beat
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
