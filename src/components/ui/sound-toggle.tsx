import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useSound } from '../../context/sound-context';

export const SoundToggle: React.FC = () => {
  const { isMuted, toggleMute } = useSound();

  return (
    <button
      onClick={toggleMute}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-all border ${
        isMuted
          ? 'bg-zinc-900/60 border-zinc-850 text-zinc-500 hover:text-zinc-300'
          : 'bg-zinc-900 border-zinc-750 text-zinc-200 hover:text-white shadow-sm'
      }`}
      title={isMuted ? 'Unmute tactile sound effects (Cmd/Ctrl + M)' : 'Mute tactile sound effects (Cmd/Ctrl + M)'}
      aria-label="Toggle Sound Effects"
    >
      {isMuted ? (
        <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
      ) : (
        <div className="flex items-center gap-1">
          <Volume2 className="w-3.5 h-3.5 text-zinc-300" />
          <div className="flex items-center gap-0.5 h-2.5">
            <span className="w-0.5 h-2 bg-zinc-300 rounded-full animate-pulse" />
            <span className="w-0.5 h-1.5 bg-zinc-400 rounded-full" />
            <span className="w-0.5 h-2.5 bg-zinc-200 rounded-full" />
          </div>
        </div>
      )}
      <span className="text-[10px] hidden md:inline">
        {isMuted ? 'MUTED' : 'THOCK'}
      </span>
    </button>
  );
};
