import React, { useState, useEffect } from 'react';
import {
  Home,
  FileText,
  Mic,
  FileUp,
  Video,
  Bot,
  BookOpen,
  Settings,
  Shield,
  Info,
  Power,
  RefreshCw,
  PanelLeftClose,
  PanelLeftOpen,
  Feather,
  Calendar,
  GitCommit,
  X,
  Download,
} from 'lucide-react';
import { GithubIcon } from '../ui/github-icon';
import { useWorkspace, type ViewType } from '../../context/workspace-context';
import { useLanguage } from '../../context/language-context';
import { useAI } from '../../context/ai-context';
import logoImg from '../../assets/official_domonote.png';

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, isMobileSidebarOpen, setIsMobileSidebarOpen } = useWorkspace();
  const { t } = useLanguage();
  const { isConnected, isChecking, selectedModel, checkConnection, startOllamaService } = useAI();

  // Collapsible state persisted to localStorage for desktop
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('domonote_sidebar_collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('domonote_sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);

  const navItems: Array<{ id: ViewType; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'dashboard', label: t('nav.home'), icon: Home },
    { id: 'notes', label: t('nav.notes'), icon: FileText },
    { id: 'zen', label: t('nav.zen'), icon: Feather },
    { id: 'meetings', label: t('nav.meetings'), icon: Mic },
    { id: 'schedule', label: t('nav.schedule'), icon: Calendar },
    { id: 'documents', label: t('nav.documents'), icon: FileUp },
    { id: 'manuals', label: t('nav.manuals'), icon: Video },
    { id: 'studio', label: t('nav.studio'), icon: Video },
    { id: 'ai-workspace', label: t('nav.aiWorkspace'), icon: Bot },
    { id: 'templates', label: t('nav.templates'), icon: BookOpen },
  ];

  const secondaryItems: Array<{ id: ViewType; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'download', label: t('nav.download'), icon: Download },
    { id: 'settings', label: t('nav.settings'), icon: Settings },
    { id: 'about', label: t('nav.about'), icon: Info },
    { id: 'changelog', label: t('nav.changelog'), icon: GitCommit },
    { id: 'privacy', label: t('nav.privacy'), icon: Shield },
  ];

  const handleNavClick = (viewId: ViewType) => {
    setActiveView(viewId);
    setIsMobileSidebarOpen(false);
  };

  const renderNavContent = (collapsed: boolean) => (
    <>
      {/* Navigation List */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-none">
        {!collapsed && (
          <div className="px-2 pb-1.5 text-[9px] font-mono tracking-widest text-slate-900/80 dark:text-zinc-400 uppercase font-bold">
            Workspace
          </div>
        )}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center ${
                collapsed ? 'justify-center px-2' : 'px-2.5'
              } py-2 rounded-lg text-xs transition-all ${
                isActive
                  ? 'bg-slate-200/90 dark:bg-zinc-850 text-black dark:text-white font-bold shadow-sm border border-slate-300 dark:border-zinc-700'
                  : 'text-slate-900 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900 font-medium'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="ml-2.5 truncate">{item.label}</span>}
            </button>
          );
        })}

        <div className="pt-4" />
        {!collapsed && (
          <div className="px-2 pb-1.5 text-[9px] font-mono tracking-widest text-slate-900/80 dark:text-zinc-400 uppercase font-bold">
            System
          </div>
        )}
        {secondaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center ${
                collapsed ? 'justify-center px-2' : 'px-2.5'
              } py-2 rounded-lg text-xs transition-all ${
                isActive
                  ? 'bg-slate-200/90 dark:bg-zinc-850 text-black dark:text-white font-bold shadow-sm border border-slate-300 dark:border-zinc-700'
                  : 'text-slate-900 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900 font-medium'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="ml-2.5 truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Local AI Status Hardware Card */}
      <div className="p-2.5 border-t border-slate-200 dark:border-zinc-850 bg-slate-50/80 dark:bg-[#070707] transition-colors">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-red-500 animate-pulse'
              }`}
              title={isConnected ? `Ollama Active (${selectedModel || 'Ready'})` : 'Ollama Offline'}
            />
            <button
              onClick={() => checkConnection()}
              className="p-1 text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300"
              title="Refresh connection"
            >
              <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
            </button>
          </div>
        ) : (
          <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-850 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    isConnected ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-red-500 animate-pulse'
                  }`}
                />
                <span className="text-xs font-bold text-slate-950 dark:text-zinc-200 truncate">
                  {isConnected ? 'Local AI Active' : 'AI Offline'}
                </span>
              </div>
              <button
                onClick={() => checkConnection()}
                title="Refresh connection"
                className="p-1 rounded text-slate-500 dark:text-zinc-500 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
              >
                <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="text-[10px] font-mono text-slate-700 dark:text-zinc-400 font-semibold truncate mb-2">
              {isConnected ? selectedModel || 'No model picked' : 'Ollama not detected'}
            </div>

            {!isConnected && (
              <button
                onClick={() => startOllamaService()}
                className="w-full flex items-center justify-center gap-1.5 py-1 px-2 rounded bg-slate-900 hover:bg-black dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-[10px] font-semibold transition-colors shadow-sm"
              >
                <Power className="w-3 h-3 text-emerald-400" />
                <span>Start Service</span>
              </button>
            )}
          </div>
        )}

        {/* Footer Meta */}
        {!collapsed && (
          <div className="flex items-center justify-between mt-2.5 px-1 text-[10px] font-mono text-slate-600 dark:text-zinc-500 font-semibold">
            <span>{t('nav.localWorkspace')}</span>
            <a
              href="https://github.com/darknecrocities/DomoNote"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-black dark:hover:text-zinc-300 transition-colors"
            >
              <GithubIcon className="w-3 h-3" />
              <span>GitHub</span>
            </a>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside
        className={`hidden md:flex flex-col h-screen select-none shrink-0 transition-all duration-200 z-30 ${
          isCollapsed ? 'w-16' : 'w-64'
        } bg-white dark:bg-[#0A0A0A] border-r border-slate-200 dark:border-zinc-850`}
      >
        {/* Brand Header */}
        <div className="p-3 border-b border-slate-200 dark:border-zinc-850 flex items-center justify-between">
          <div
            onClick={() => setActiveView('landing')}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity min-w-0"
            title="DomoNote Landing Page"
          >
            <img src={logoImg} alt="DomoNote" className="w-7 h-7 rounded-lg object-contain shrink-0 shadow-xs" />
            {!isCollapsed && (
              <div className="truncate">
                <div className="font-bold text-xs text-slate-950 dark:text-white tracking-tight leading-none truncate">
                  DomoNote
                </div>
                <div className="text-[10px] font-mono text-slate-700 dark:text-zinc-500 font-semibold mt-1 tracking-tight truncate">
                  {t('nav.localAi')}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded text-slate-500 dark:text-zinc-500 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {renderNavContent(isCollapsed)}
      </aside>

      {/* Mobile Drawer Overlay & Sidebar (visible on mobile when open) */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex select-none">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
          />

          {/* Drawer Body */}
          <div className="relative w-72 max-w-[80vw] bg-white dark:bg-[#0A0A0A] border-r border-slate-200 dark:border-zinc-850 flex flex-col h-full z-10 shadow-2xl animate-fade-in">
            <div className="p-3.5 border-b border-slate-200 dark:border-zinc-850 flex items-center justify-between">
              <div
                onClick={() => {
                  setActiveView('landing');
                  setIsMobileSidebarOpen(false);
                }}
                className="flex items-center gap-2.5 cursor-pointer"
              >
                <img src={logoImg} alt="DomoNote" className="w-7 h-7 rounded-lg object-contain shrink-0 shadow-xs" />
                <div>
                  <div className="font-bold text-xs text-slate-950 dark:text-white tracking-tight">DomoNote</div>
                  <div className="text-[10px] font-mono text-slate-700 dark:text-zinc-500 font-semibold">{t('nav.localAi')}</div>
                </div>
              </div>

              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"
                title="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {renderNavContent(false)}
          </div>
        </div>
      )}
    </>
  );
};

