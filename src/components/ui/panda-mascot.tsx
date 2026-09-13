import React, { useState, useEffect } from 'react';
import pandaImg from '../../assets/panda-mascot.png';
import { useSound } from '../../context/sound-context';
import { Sparkles, Edit3 } from 'lucide-react';

interface PandaMascotProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  isWriting?: boolean;
  message?: string;
  className?: string;
  showSpeechBubble?: boolean;
  enableInteraction?: boolean;
  badge?: string;
}

const PANDA_TIPS = [
  'Taking notes locally keeps your thoughts completely private.',
  'Local AI runs directly on your computer hardware via Ollama.',
  'Upload PDF, Word (DOCX), PowerPoint (PPTX), or TXT files for instant AI summaries!',
  'Press Cmd/Ctrl + Shift + N for Zen distraction-free writing.',
  'Everything you see is persisted strictly in client-side IndexedDB.',
  'Capture what happens, understand it, and keep it.',
];

export const PandaMascot: React.FC<PandaMascotProps> = ({
  size = 'md',
  isWriting = false,
  message,
  className = '',
  showSpeechBubble = true,
  enableInteraction = true,
  badge,
}) => {
  const { playPop, playThock } = useSound();
  const [tipIndex, setTipIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [scribbleActive, setScribbleActive] = useState(true);
  const [displayedText, setDisplayedText] = useState('');

  const targetMessage = message || PANDA_TIPS[tipIndex];

  // Typewriter effect for speech bubble
  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const timer = setInterval(() => {
      if (i < targetMessage.length) {
        setDisplayedText(targetMessage.substring(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 25);
    return () => clearInterval(timer);
  }, [targetMessage]);

  // Periodic writing cycle
  useEffect(() => {
    if (isWriting) {
      setScribbleActive(true);
      return;
    }
    const interval = setInterval(() => {
      setScribbleActive((prev) => !prev);
    }, 2800);
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
    hero: 'w-60 h-60 sm:w-72 sm:h-72',
  };

  return (
    <div
      className={`relative inline-flex flex-col items-center select-none ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Dynamic Speech Bubble */}
      {showSpeechBubble && (
        <div
          className={`mb-3 px-3.5 py-2 rounded-2xl bg-zinc-950/95 border border-zinc-750 text-xs font-mono text-zinc-200 shadow-2xl transition-all duration-300 max-w-xs text-center cursor-pointer backdrop-blur-md ${
            isHovered || isWriting ? 'scale-105 border-zinc-500 text-white shadow-zinc-900/80' : 'opacity-95'
          }`}
        >
          <div className="flex items-center justify-center gap-1 text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
            <Sparkles className="w-2.5 h-2.5 text-zinc-400" />
            <span>{badge || 'Panda Assistant'}</span>
          </div>
          <p className="leading-snug min-h-[2.4em]">
            {displayedText}
            <span className="inline-block w-1.5 h-3 bg-zinc-400 ml-0.5 animate-pulse" />
          </p>
          <div className="w-2.5 h-2.5 bg-zinc-950 border-r border-b border-zinc-750 transform rotate-45 mx-auto -mb-3 mt-1.5" />
        </div>
      )}

      {/* Mascot Image with GIF-like Motion & Live Scribble Overlay */}
      <div
        className={`relative ${sizeClasses[size]} transition-all duration-300 ${
          isHovered ? 'scale-105' : ''
        } ${enableInteraction ? 'cursor-pointer' : ''}`}
      >
        <img
          src={pandaImg}
          alt="DomoNote Panda Mascot"
          className="w-full h-full object-contain rounded-3xl filter drop-shadow-[0_12px_24px_rgba(255,255,255,0.06)] animate-[float_4s_ease-in-out_infinite]"
          style={{ mixBlendMode: 'screen' }}
        />

        {/* Animated Pencil & Notepad Scribble Effect (GIF-like) */}
        {(scribbleActive || isWriting) && (
          <div className="absolute bottom-5 right-6 pointer-events-none flex items-center gap-1 bg-zinc-950/80 border border-zinc-800 px-2 py-0.5 rounded-full shadow-lg animate-fade-in">
            <Edit3 className="w-3 h-3 text-white animate-bounce" />
            <span className="text-[9px] font-mono text-zinc-300 tracking-wider">
              taking notes...
            </span>
          </div>
        )}

        {/* Floating Ink Dots / Sparkles */}
        {isHovered && (
          <div className="absolute -top-1 -right-1 pointer-events-none">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
            </span>
          </div>
        )}
      </div>

      {enableInteraction && (
        <span className="text-[9px] font-mono text-zinc-600 mt-1.5 opacity-60 hover:opacity-100 transition-opacity">
          Click panda to rotate focus tips
        </span>
      )}
    </div>
  );
};
