import React from 'react';
import { Search, Plus, Mic, FileUp, Menu } from 'lucide-react';
import { useWorkspace } from '../../context/workspace-context';
import { useLanguage } from '../../context/language-context';
import { Button } from '../ui/button';
import { ModeSwitcher } from './mode-switcher';
import { SoundToggle } from '../ui/sound-toggle';
import { PhysicsRopeToggle } from '../ui/physics-rope-toggle';
import { LanguageSwitcher } from '../ui/language-switcher';

export const Topbar: React.FC = () => {
  const { activeView, setIsCommandPaletteOpen, setIsMobileSidebarOpen } = useWorkspace();
  const { t } = useLanguage();

  const getTitle = () => {
    switch (activeView) {
      case 'dashboard':
        return t('nav.overview');
      case 'notes':
        return t('nav.notes');
      case 'zen':
        return t('nav.zen');
      case 'meetings':
        return t('nav.meetings');
      case 'schedule':
        return t('nav.schedule');
      case 'documents':
        return t('nav.documents');
      case 'manuals':
        return t('nav.manuals');
      case 'studio':
        return t('nav.studio');
      case 'ai-workspace':
        return t('nav.aiWorkspace');
      case 'templates':
        return t('nav.templates');
      case 'settings':
        return t('nav.settings');
      case 'about':
        return t('nav.about');
      case 'changelog':
        return t('nav.changelog');
      case 'privacy':
        return t('nav.privacy');
      default:
        return 'DomoNote';
    }
  };

  return (
    <header className="h-14 border-b border-slate-200 dark:border-zinc-850 px-3 sm:px-6 flex items-center justify-between bg-white/85 dark:bg-zinc-950/70 backdrop-blur-md shrink-0 gap-2 sm:gap-4 z-20 transition-colors duration-200 relative">
      {/* Left: Mobile Menu Trigger + View Title */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="md:hidden p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"
          title="Open navigation menu"
          aria-label="Open navigation menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <h1 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight truncate max-w-[120px] sm:max-w-none">
          {getTitle()}
        </h1>
      </div>

      {/* Center: Mode Switcher Dropdown */}
      <div className="flex items-center justify-center">
        <ModeSwitcher />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Tactile Sound FX Toggle */}
        <SoundToggle />

        {/* Search / Command Palette Trigger */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-2 sm:px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors text-xs"
          title={`${t('common.search')} (Cmd+K)`}
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden xl:inline text-slate-500 dark:text-zinc-400">{t('common.search')}</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-500 dark:text-zinc-500 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded">
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

      {/* Physics Rope Hanging Directly Under the Appbar */}
      <div className="absolute right-24 sm:right-36 top-full -mt-0.5 z-50 pointer-events-auto">
        <PhysicsRopeToggle />
      </div>
    </header>
  );
};
