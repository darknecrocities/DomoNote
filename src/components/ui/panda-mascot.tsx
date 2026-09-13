import React, { useState, useEffect } from 'react';
import pandaImg from '../../assets/panda-mascot.png';
import { useSound } from '../../context/sound-context';

interface PandaMascotProps {
  size?: 'sm' | 'md' | 'lg';
  isWriting?: boolean;
  message?: string;
  className?: string;
  showSpeechBubble?: boolean;
  enableInteraction?: boolean;
}

const PANDA_TIPS = [
  'Taking notes locally keeps your thoughts completely private.',
  'Local AI runs directly on your computer hardware via Ollama.',
  'Press Cmd/Ctrl + Shift + N for Zen distraction-free writing.',
  'Your data is saved automatically in IndexedDB.',
  'Capture what happens, understand it, and keep it.',
];

export const PandaMascot: React.FC<PandaMascotProps> = ({
  size = 'md',
  isWriting = false,
  message,
  className = '',
  showSpeechBubble = true,
  enableInteraction = true,
}) => {
  const { playPop, playThock } = useSound();
  const [tipIndex, setTipIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [scribbleActive, setScribbleActive] = useState(false);

  // Animate scribbling periodically or when isWriting is true
  useEffect(() => {
    if (isWriting) {
      setScribbleActive(true);
      return;
    }
    const interval = setInterval(() => {
      setScribbleActive(true);
      setTimeout(() => setScribbleActive(false), 1400);
    }, 4500);
    return () => clearInterval(interval);
  }, [isWriting]);

  const handleClick = () => {
    if (!enableInteraction) return;
    playPop();
    setTipIndex((prev) => (prev + 1) % PANDA_TIPS.length);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    playThock(1.2);
  };

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-28 h-28',
    lg: 'w-44 h-44',
  };

  const currentMessage = message || PANDA_TIPS[tipIndex];

  return (
    <div
      className={`relative inline-flex flex-col items-center select-none ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Speech Bubble / Thought Pill */}
      {showSpeechBubble && (
        <div
          className={`mb-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-750 text-[11px] font-mono text-zinc-300 shadow-xl transition-all duration-300 max-w-xs text-center cursor-pointer ${
            isHovered || isWriting ? 'scale-105 border-zinc-600 text-white' : 'opacity-90'
          }`}
        >
          <span>{currentMessage}</span>
          <div className="w-2 h-2 bg-zinc-900 border-r border-b border-zinc-750 transform rotate-45 mx-auto -mb-2 mt-1" />
        </div>
      )}

      {/* Mascot Image with breathing & writing animation */}
      <div
        className={`relative ${sizeClasses[size]} transition-transform duration-300 ${
          isHovered ? 'scale-105' : ''
        } ${enableInteraction ? 'cursor-pointer' : ''}`}
      >
        <img
          src={pandaImg}
          alt="DomoNote Panda Mascot"
          className="w-full h-full object-contain rounded-2xl filter drop-shadow-[0_10px_20px_rgba(255,255,255,0.05)] animate-[float_4s_ease-in-out_infinite]"
          style={{ mixBlendMode: 'screen' }}
        />

        {/* Dynamic Writing Pencil Scribble Indicator */}
        {(scribbleActive || isWriting) && (
          <div className="absolute bottom-3 right-5 pointer-events-none flex items-center gap-0.5">
            <span className="w-1 h-1 bg-white rounded-full animate-ping" />
            <span className="text-[9px] font-mono text-zinc-400 opacity-80 animate-pulse">
              scribble...
            </span>
          </div>
        )}
      </div>

      {enableInteraction && (
        <span className="text-[9px] font-mono text-zinc-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          Click panda for notes tip
        </span>
      )}
    </div>
  );
};
