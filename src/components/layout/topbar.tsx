import React from 'react';
import { Search, Plus, Mic, FileUp } from 'lucide-react';
import { useWorkspace } from '../../context/workspace-context';
import { Button } from '../ui/button';
import { ModeSwitcher } from './mode-switcher';
import { SoundToggle } from '../ui/sound-toggle';

export const Topbar: React.FC = () => {
  const { activeView, setActiveView, setIsCommandPaletteOpen } = useWorkspace();

  const getTitle = () => {
    switch (activeView) {
      case 'dashboard':
        return 'Overview';
      case 'notes':
        return 'Notes';
      case 'zen':
        return 'Zen Focus Sanctuary';
      case 'meetings':
        return 'Meeting Secretary';
      case 'schedule':
        return 'Automated Schedule';
      case 'documents':
        return 'Document Intelligence';
      case 'manuals':
        return 'Operation Manuals';
      case 'studio':
        return 'Screen Recording Studio';
      case 'ai-workspace':
        return 'AI Workspace';
      case 'templates':
        return 'Templates';
      case 'settings':
        return 'Settings';
      case 'about':
        return 'About DomoNote';
      case 'changelog':
        return 'Changelog & System Diagnostics';
      case 'privacy':
        return 'Privacy & Local-First Boundaries';
      default:
        return 'DomoNote';
    }
  };

  return (
    <header className="h-14 border-b border-zinc-850 px-6 flex items-center justify-between bg-zinc-950/70 backdrop-blur-md shrink-0 gap-4">
      {/* View Title */}
      <div className="flex items-center gap-3 shrink-0">
        <h1 className="text-sm font-semibold text-white tracking-tight">{getTitle()}</h1>
      </div>

      {/* Center: Mode Switcher */}
      <div className="hidden md:flex items-center justify-center flex-1 max-w-md">
        <ModeSwitcher />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Tactile Sound FX Toggle */}
        <SoundToggle />

        {/* Search / Command Palette Trigger */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors text-xs"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Search...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 bg-zinc-950 border border-zinc-850 rounded">
            Cmd+K
          </kbd>
        </button>

        {/* Quick Contextual Actions */}
        {activeView === 'notes' && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('domonote:new-note'));
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Note</span>
          </Button>
        )}

        {activeView === 'meetings' && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('domonote:start-meeting'));
            }}
          >
            <Mic className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Session</span>
          </Button>
        )}

        {activeView === 'documents' && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('domonote:upload-pdf'));
            }}
          >
            <FileUp className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upload PDF</span>
          </Button>
        )}
      </div>
    </header>
  );
};
