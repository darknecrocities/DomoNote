import React from 'react';
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
} from 'lucide-react';
import { GithubIcon } from '../ui/github-icon';
import { useWorkspace, type ViewType } from '../../context/workspace-context';
import { useAI } from '../../context/ai-context';
import logoImg from '../../assets/domodomo.png';

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView } = useWorkspace();
  const { isConnected, isChecking, selectedModel, checkConnection, startOllamaService } = useAI();

  const navItems: Array<{ id: ViewType; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'meetings', label: 'Meetings', icon: Mic },
    { id: 'documents', label: 'Documents', icon: FileUp },
    { id: 'manuals', label: 'Manuals', icon: Video },
    { id: 'ai-workspace', label: 'AI Workspace', icon: Bot },
    { id: 'templates', label: 'Templates', icon: BookOpen },
  ];

  const secondaryItems: Array<{ id: ViewType; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'about', label: 'About', icon: Info },
    { id: 'privacy', label: 'Privacy', icon: Shield },
  ];

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-850 flex flex-col h-screen select-none shrink-0">
      {/* Brand Header */}
      <div
        onClick={() => setActiveView('landing')}
        className="px-5 py-4 border-b border-zinc-850 flex items-center gap-3 cursor-pointer hover:bg-zinc-900/40 transition-colors"
      >
        <img src={logoImg} alt="DomoNote" className="w-7 h-7 rounded object-contain" />
        <div>
          <div className="font-semibold text-sm text-white tracking-tight leading-none">DomoNote</div>
          <div className="text-[11px] text-zinc-400 mt-0.5 tracking-tight">Local AI Workspace</div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-medium tracking-wider text-zinc-400 uppercase">
          Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-zinc-900 text-white border border-zinc-800 shadow-sm'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-900/60'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0 text-zinc-400" />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="px-3 pt-4 pb-2 text-[10px] font-medium tracking-wider text-zinc-400 uppercase">
          System
        </div>
        {secondaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-zinc-900 text-white border border-zinc-800 shadow-sm'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-900/60'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0 text-zinc-400" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Local AI Status Card */}
      <div className="p-3 border-t border-zinc-850 bg-zinc-950/60">
        <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-850">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-400' : 'bg-red-500 animate-pulse'
                }`}
              />
              <span className="text-[11px] font-semibold text-zinc-200">
                {isConnected ? 'Local AI Active' : 'AI Disconnected'}
              </span>
            </div>
            <button
              onClick={() => checkConnection()}
              title="Refresh connection"
              className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="text-[10px] text-zinc-400 truncate mb-2">
            {isConnected ? selectedModel || 'Select model' : 'Ollama not detected'}
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

        {/* Footer Meta */}
        <div className="flex items-center justify-between mt-3 px-1 text-[11px] text-zinc-400">
          <span>DomoNote v0.1.0</span>
          <a
            href="https://github.com/darknecrocities/DomoNote"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-zinc-300 transition-colors"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </aside>
  );
};
