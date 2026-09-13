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
} from 'lucide-react';
import { GithubIcon } from '../ui/github-icon';
import { useWorkspace, type ViewType } from '../../context/workspace-context';
import { useAI } from '../../context/ai-context';
import logoImg from '../../assets/domodomo.png';

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView } = useWorkspace();
  const { isConnected, isChecking, selectedModel, checkConnection, startOllamaService } = useAI();

  // Collapsible state persisted to localStorage
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('domonote_sidebar_collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('domonote_sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);

  const navItems: Array<{ id: ViewType; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'zen', label: 'Zen Notes', icon: Feather },
    { id: 'meetings', label: 'Meetings', icon: Mic },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'documents', label: 'Documents', icon: FileUp },
    { id: 'manuals', label: 'Manuals', icon: Video },
    { id: 'studio', label: 'Studio', icon: Video },
    { id: 'ai-workspace', label: 'AI Workspace', icon: Bot },
    { id: 'templates', label: 'Templates', icon: BookOpen },
  ];

  const secondaryItems: Array<{ id: ViewType; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'about', label: 'About & Demo', icon: Info },
    { id: 'changelog', label: 'Changelog', icon: GitCommit },
    { id: 'privacy', label: 'Privacy', icon: Shield },
  ];

  return (
    <aside
      className={`${
        isCollapsed ? 'w-16' : 'w-64'
      } bg-[#0A0A0A] border-r border-zinc-850 flex flex-col h-screen select-none shrink-0 transition-all duration-200 z-30`}
    >
      {/* Brand Header */}
      <div className="p-3 border-b border-zinc-850 flex items-center justify-between">
        <div
          onClick={() => setActiveView('landing')}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity min-w-0"
          title="DomoNote Landing Page"
        >
          <img src={logoImg} alt="DomoNote" className="w-7 h-7 rounded object-contain shrink-0" />
          {!isCollapsed && (
            <div className="truncate">
              <div className="font-bold text-xs text-white tracking-tight leading-none truncate">
                DomoNote
              </div>
              <div className="text-[10px] font-mono text-zinc-500 mt-1 tracking-tight truncate">
                LOCAL AI
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-none">
        {!isCollapsed && (
          <div className="px-2 pb-1.5 text-[9px] font-mono tracking-widest text-zinc-500 uppercase">
            Workspace
          </div>
        )}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center px-2' : 'px-2.5'
              } py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-zinc-800 text-white font-semibold shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span className="ml-2.5 truncate">{item.label}</span>}
            </button>
          );
        })}

        <div className="pt-4" />
        {!isCollapsed && (
          <div className="px-2 pb-1.5 text-[9px] font-mono tracking-widest text-zinc-500 uppercase">
            System
          </div>
        )}
        {secondaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center px-2' : 'px-2.5'
              } py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-zinc-800 text-white font-semibold shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span className="ml-2.5 truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Local AI Status Hardware Card */}
      <div className="p-2 border-t border-zinc-850 bg-[#070707]">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-400 ring-2 ring-emerald-400/20' : 'bg-red-500 animate-pulse'
              }`}
              title={isConnected ? `Ollama Active (${selectedModel || 'Ready'})` : 'Ollama Offline'}
            />
            <button
              onClick={() => checkConnection()}
              className="p-1 text-zinc-500 hover:text-zinc-300"
              title="Refresh connection"
            >
              <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
            </button>
          </div>
        ) : (
          <div className="p-2.5 rounded-lg bg-zinc-900/90 border border-zinc-800">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    isConnected ? 'bg-emerald-400 ring-2 ring-emerald-400/20' : 'bg-red-500 animate-pulse'
                  }`}
                />
                <span className="text-[11px] font-semibold text-zinc-200 truncate">
                  {isConnected ? 'Local AI Active' : 'AI Offline'}
                </span>
              </div>
              <button
                onClick={() => checkConnection()}
                title="Refresh connection"
                className="p-1 rounded text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors shrink-0"
              >
                <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="text-[10px] font-mono text-zinc-400 truncate mb-2">
              {isConnected ? selectedModel || 'No model picked' : 'Ollama not detected'}
            </div>

            {!isConnected && (
              <button
                onClick={() => startOllamaService()}
                className="w-full flex items-center justify-center gap-1.5 py-1 px-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-medium transition-colors"
              >
                <Power className="w-3 h-3" />
                <span>Start Service</span>
              </button>
            )}
          </div>
        )}

        {/* Footer Meta */}
        {!isCollapsed && (
          <div className="flex items-center justify-between mt-2.5 px-1 text-[10px] font-mono text-zinc-500">
            <span>DOMONOTE V0.1</span>
            <a
              href="https://github.com/darknecrocities/DomoNote"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-zinc-300 transition-colors"
            >
              <GithubIcon className="w-3 h-3" />
              <span>SRC</span>
            </a>
          </div>
        )}
      </div>
    </aside>
  );
};
