import React from 'react';
import { Search, Plus, Mic, FileUp, Menu } from 'lucide-react';
import { useWorkspace } from '../../context/workspace-context';
import { Button } from '../ui/button';
import { ModeSwitcher } from './mode-switcher';
import { SoundToggle } from '../ui/sound-toggle';

export const Topbar: React.FC = () => {
  const { activeView, setIsCommandPaletteOpen, setIsMobileSidebarOpen } = useWorkspace();

  const getTitle = () => {
    switch (activeView) {
      case 'dashboard':
        return 'Overview';
      case 'notes':
        return 'Notes';
      case 'zen':
        return 'Zen Notes';
      case 'meetings':
        return 'Meetings';
      case 'schedule':
        return 'Schedule';
      case 'documents':
        return 'Documents';
      case 'manuals':
        return 'Manuals';
      case 'studio':
        return 'Screen Recorder';
      case 'ai-workspace':
        return 'AI Workspace';
      case 'templates':
        return 'Templates';
      case 'settings':
        return 'Settings';
      case 'about':
        return 'About DomoNote';
      case 'changelog':
        return 'Changelog';
      case 'privacy':
        return 'Privacy Architecture';
      default:
        return 'DomoNote';
    }
  };

  return (
    <header className="h-14 border-b border-zinc-850 px-4 sm:px-6 flex items-center justify-between bg-zinc-950/70 backdrop-blur-md shrink-0 gap-2 sm:gap-4 z-20">
      {/* Left: Mobile Menu Trigger + View Title */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          title="Open navigation menu"
          aria-label="Open navigation menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <h1 className="text-sm font-semibold text-white tracking-tight truncate max-w-[120px] sm:max-w-none">
          {getTitle()}
        </h1>
      </div>

      {/* Center: Mode Switcher Dropdown */}
      <div className="flex items-center justify-center">
        <ModeSwitcher />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Tactile Sound FX Toggle */}
        <SoundToggle />

        {/* Search / Command Palette Trigger */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors text-xs"
          title="Search workspace (Cmd+K)"
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden xl:inline text-zinc-400">Search...</span>
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
            <span className="hidden sm:inline">Upload</span>
          </Button>
        )}
      </div>
    </header>
  );
};
