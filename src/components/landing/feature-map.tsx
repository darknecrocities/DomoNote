import React, { useState } from 'react';
import { Mic, FileUp, FileText, Video, Bot } from 'lucide-react';

export const FeatureMap: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'meetings' | 'documents' | 'notes' | 'operations' | 'ai'>('meetings');

  const tabs: Array<{ id: 'meetings' | 'documents' | 'notes' | 'operations' | 'ai'; label: string; icon: any }> = [
    { id: 'meetings', label: 'Meetings', icon: Mic },
    { id: 'documents', label: 'Documents', icon: FileUp },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'operations', label: 'Screen Recorder', icon: Video },
    { id: 'ai', label: 'Local AI', icon: Bot },
  ];

  return (
    <section className="py-20 border-t border-zinc-850 text-left select-none">
      <div className="mb-10">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Workspace Features
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
          Everything you need in one place.
        </h2>
      </div>

      {/* Horizontal Interactive Selector */}
      <div className="flex items-center gap-2 border-b border-zinc-850 pb-3 mb-8 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-zinc-800 text-white font-bold border border-zinc-700 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Visual Content Display */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-2xl min-h-[380px] flex flex-col justify-between">
        {activeTab === 'meetings' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <span className="text-xs font-semibold text-white">Meeting Notes & Voice Capture</span>
              <span className="text-xs text-emerald-400">Ready to Record</span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-2xl">
              Record microphone and meeting audio directly in your browser. Spoken words appear in real time with clickable timestamps and extracted takeaways.
            </p>
            <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-900/60 text-xs space-y-2 text-zinc-300">
              <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                <span>Timeline Bookmark</span>
                <span>00:14:05</span>
              </div>
              <div>03:41 Architecture — Team agreed on IndexedDB local storage</div>
              <div>08:20 Deployment — Migration scheduled for Friday evening</div>
              <div>14:05 Decision — Canary rollout verified</div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <span className="text-xs font-semibold text-white">Document Reader & Analysis</span>
              <span className="text-xs text-zinc-400">PDF, DOCX, PPTX, TXT</span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-2xl">
              Read PDFs and documents on a clean reading desk. Highlight sections to trigger instant explanations, summaries, or turn dense sections into step guides.
            </p>
            <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-900/60 text-xs space-y-2 text-zinc-300">
              <div className="flex items-center gap-2 text-white">
                <span className="w-5 h-5 rounded-full bg-white text-black font-bold text-xs flex items-center justify-center">
                  01
                </span>
                <span className="font-semibold">Step 1: Open administrative configuration panel</span>
              </div>
              <div className="text-xs text-zinc-400 pl-7">
                Source: Page 3 • Excerpt verified against original document text
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <span className="text-xs font-semibold text-white">Notes & Version History</span>
              <span className="text-xs text-zinc-400">Autosaved</span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-2xl">
              Clean markdown editor with live preview, tag taxonomies, debounced autosave, and full version history comparisons.
            </p>
            <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-900/60 text-xs space-y-2 text-zinc-300">
              <div className="text-white font-semibold"># Project Specification</div>
              <p className="text-zinc-400 text-xs">
                - Automatic checkpoints saved every 60 seconds of editing.
              </p>
              <p className="text-zinc-400 text-xs">
                - One-click Markdown and PDF export.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'operations' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <span className="text-xs font-semibold text-white">Screen Recorder & Step Manuals</span>
              <span className="text-xs text-zinc-400">Screen Capture</span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-2xl">
              Record your screen during complex computer tasks. DomoNote extracts screenshots, captures steps, and builds standard operating manuals.
            </p>
            <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-900/60 text-xs space-y-2 text-zinc-300">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span className="font-semibold text-zinc-300">Server Deployment Guide</span>
                <span>Complete</span>
              </div>
              <div className="text-white font-medium">Step 1: Verify Kubernetes node health</div>
              <div className="text-white font-medium">Step 2: Deploy canary pod manifest with 10% weight</div>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <span className="text-xs font-semibold text-white">Local AI Assistant</span>
              <span className="text-xs text-emerald-400">Runs 100% Offline</span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-2xl">
              Ask questions grounded in your notes, meetings, and documents. Runs directly on your machine via Ollama without sending data to outside servers.
            </p>
            <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-900/60 text-xs space-y-2 text-zinc-300">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span>Attached Context:</span>
                <span className="bg-zinc-800 text-white px-2 py-0.5 rounded border border-zinc-700">
                  [Architecture.pdf]
                </span>
                <span className="bg-zinc-800 text-white px-2 py-0.5 rounded border border-zinc-700">
                  [Product Sync]
                </span>
              </div>
              <p className="text-zinc-300 pt-1">
                "Based on the attached Architecture specification and Meeting notes, deployment is scheduled for Friday at 18:00 UTC."
              </p>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-zinc-850 flex items-center justify-between text-xs text-zinc-500">
          <span>Local browser storage</span>
          <span>No cloud tracking</span>
        </div>
      </div>
    </section>
  );
};
