import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { soundFX } from '../services/audio/sound-fx';

interface SoundContextType {
  isMuted: boolean;
  volume: number;
  toggleMute: () => void;
  setVolume: (vol: number) => void;
  playThock: (pitchMultiplier?: number) => void;
  playClick: () => void;
  playPop: () => void;
  playChime: () => void;
  playSwitch: (on: boolean) => void;
}

const SoundContext = createContext<SoundContextType | null>(null);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState<boolean>(soundFX.getIsMuted());
  const [volume, setVolumeState] = useState<number>(soundFX.getVolume());

  const toggleMute = useCallback(() => {
    const next = soundFX.toggleMute();
    setIsMuted(next);
  }, []);

  const setVolume = useCallback((val: number) => {
    soundFX.setVolume(val);
    setVolumeState(val);
  }, []);

  const playThock = useCallback((pitchMultiplier: number = 1.0) => {
    soundFX.thock(pitchMultiplier);
  }, []);

  const playClick = useCallback(() => {
    soundFX.click();
  }, []);

  const playPop = useCallback(() => {
    soundFX.pop();
  }, []);

  const playChime = useCallback(() => {
    soundFX.chime();
  }, []);

  const playSwitch = useCallback((on: boolean) => {
    soundFX.switch(on);
  }, []);

  // Global hover listener to give cards, buttons, tabs, and interactive elements tactile "thock" feedback
  useEffect(() => {
    let lastThockTime = 0;

    const handlePointerOver = (e: MouseEvent) => {
      if (soundFX.getIsMuted()) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Check if hovering an interactive element or card
      const interactiveEl = target.closest(
        'button, a, [role="button"], input, select, textarea, .spotlight-card, .interactive-card, .thock-hover'
      );

      if (interactiveEl) {
        const now = performance.now();
        // Throttle to prevent acoustic overwhelm (min 40ms interval)
        if (now - lastThockTime > 40) {
          lastThockTime = now;
          soundFX.thock();
        }
      }
    };

    const handlePointerDown = (e: MouseEvent) => {
      if (soundFX.getIsMuted()) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const clickableEl = target.closest('button, a, [role="button"]');
      if (clickableEl) {
        soundFX.click();
      }
    };

    // Keyboard shortcut Cmd/Ctrl + M to toggle sound
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        toggleMute();
      }
    };

    document.addEventListener('mouseover', handlePointerOver, { passive: true });
    document.addEventListener('mousedown', handlePointerDown, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mouseover', handlePointerOver);
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggleMute]);

  return (
    <SoundContext.Provider
      value={{
        isMuted,
        volume,
        toggleMute,
        setVolume,
        playThock,
        playClick,
        playPop,
        playChime,
        playSwitch,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const ctx = useContext(SoundContext);
  if (!ctx) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return ctx;
};
