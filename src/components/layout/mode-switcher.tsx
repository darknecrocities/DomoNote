import React, { useEffect } from 'react';
import { useWorkspace, type ViewType } from '../../context/workspace-context';
import { useSound } from '../../context/sound-context';
import { Sparkles, Feather, Calendar, Video, LayoutDashboard } from 'lucide-react';

interface ModeOption {
  id: ViewType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  hotkey: string;
}

export const ModeSwitcher: React.FC = () => {
  const { activeView, setActiveView } = useWorkspace();
  const { playSwitch, playThock } = useSound();

  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? 'Cmd' : 'Ctrl';

  const modes: ModeOption[] = [
    { id: 'dashboard', label: 'Workspace', icon: LayoutDashboard, hotkey: `${modKey}+Shift+W` },
    { id: 'zen', label: 'Zen Notes', icon: Feather, hotkey: `${modKey}+Shift+N` },
    { id: 'schedule', label: 'Schedule', icon: Calendar, hotkey: `${modKey}+Shift+S` },
    { id: 'studio', label: 'Screen Studio', icon: Video, hotkey: `${modKey}+Shift+R` },
  ];

  // Cross-platform keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (!isMod || !e.shiftKey) return;

      const key = e.key.toUpperCase();
      if (key === 'N') {
        e.preventDefault();
        playSwitch(true);
        setActiveView('zen');
      } else if (key === 'S') {
        e.preventDefault();
        playSwitch(true);
        setActiveView('schedule');
      } else if (key === 'R') {
        e.preventDefault();
        playSwitch(true);
        setActiveView('studio');
      } else if (key === 'W') {
        e.preventDefault();
        playSwitch(false);
        setActiveView('dashboard');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveView, playSwitch]);

  const handleSelect = (modeId: ViewType) => {
    playSwitch(modeId !== 'dashboard');
    setActiveView(modeId);
  };

  return (
    <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-850 p-1 rounded-lg select-none">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = activeView === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => handleSelect(mode.id)}
            onMouseEnter={() => playThock()}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-all ${
              isActive
                ? 'bg-zinc-800 text-white font-bold border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
            }`}
            title={`Switch to ${mode.label} (${mode.hotkey})`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden lg:inline">{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
};
