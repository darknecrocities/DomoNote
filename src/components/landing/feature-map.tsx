import React, { useState } from 'react';
import { Mic, FileUp, FileText, Video, Bot } from 'lucide-react';

export const FeatureMap: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'meetings' | 'documents' | 'notes' | 'operations' | 'ai'>('meetings');

  const tabs: Array<{ id: 'meetings' | 'documents' | 'notes' | 'operations' | 'ai'; label: string; icon: any }> = [
    { id: 'meetings', label: 'MEETINGS', icon: Mic },
    { id: 'documents', label: 'DOCUMENTS', icon: FileUp },
    { id: 'notes', label: 'NOTES', icon: FileText },
    { id: 'operations', label: 'OPERATIONS', icon: Video },
    { id: 'ai', label: 'LOCAL AI', icon: Bot },
  ];

  return (
    <section className="py-20 border-t border-zinc-850 text-left select-none">
      <div className="mb-10">
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
          UNIFIED WORKSPACE
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
          One workspace. Different kinds of work.
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
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-zinc-800 text-white font-bold border border-zinc-750 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Visual Content Display with smooth transition */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-2xl min-h-[380px] flex flex-col justify-between">
        {activeTab === 'meetings' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <span className="font-mono text-xs text-white">MEETING SECRETARY // LIVE CAPTURE</span>
              <span className="font-mono text-[10px] text-emerald-400">AUDIO ACTIVE</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
              Microphone and Google Meet tab audio captured with permission. Verbal transcripts stream
              in real time with clickable timeline milestones.
            </p>
            <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-900/60 font-mono text-xs space-y-2 text-zinc-300">
              <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1">
                <span>TIMELINE JUMP</span>
                <span>00:14:05</span>
              </div>
              <div>03:41 Architecture — Team agreed on IndexedDB local storage</div>
              <div>08:20 Deployment — Migration scheduled for Friday evening</div>
              <div>14:05 Decision — Canary rollout manifest verified</div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <span className="font-mono text-xs text-white">DOCUMENT INTELLIGENCE // PDF.JS</span>
              <span className="font-mono text-[10px] text-zinc-400">COORDINATE ANCHORED</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
              Read PDFs on a crisp digital reading desk. Highlight sections to trigger contextual AI
              explanations, place coordinate-anchored badges, and turn dense documents into steps.
            </p>
            <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-900/60 font-mono text-xs space-y-2 text-zinc-300">
              <div className="flex items-center gap-2 text-white">
                <span className="w-5 h-5 rounded-full bg-white text-black font-bold text-[10px] flex items-center justify-center">
                  01
                </span>
                <span>STEP 01: Open administrative configuration panel</span>
              </div>
              <div className="text-[11px] text-zinc-400 pl-7">
                Source: Page 03 • Excerpt verified against original document text
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <span className="font-mono text-xs text-white">NOTES // AUTOSAVE & REVISIONS</span>
              <span className="font-mono text-[10px] text-zinc-400">VERSIONED</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
              Clean markdown editor with split preview, tag taxonomies, debounced autosave, and full
              version history comparisons.
            </p>
            <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-900/60 font-mono text-xs space-y-2 text-zinc-300">
              <div className="text-white font-semibold"># Engineering Specification</div>
              <p className="text-zinc-400 text-xs">
                - Autosave checkpoints stored every 60 seconds of active editing.
              </p>
              <p className="text-zinc-400 text-xs">
                - Full Markdown and printable PDF exports generated client-side.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'operations' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <span className="font-mono text-xs text-white">OPERATION FLIGHT RECORDER</span>
              <span className="font-mono text-[10px] text-zinc-400">FRAME SNAPSHOTS</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
              Record screen states during complex computer tasks. DomoNote extracts screenshots, logs
              actions, and generates a publishing-grade standard operating manual (SOP).
            </p>
            <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-900/60 font-mono text-xs space-y-2 text-zinc-300">
              <div className="flex items-center justify-between text-zinc-400 text-[10px]">
                <span>MANUAL // SERVER DEPLOYMENT SOP</span>
                <span>VERSION 1.0</span>
              </div>
              <div className="text-white font-medium">Step 01: Verify Kubernetes node health</div>
              <div className="text-white font-medium">Step 02: Deploy canary pod manifest with 10% weight</div>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <span className="font-mono text-xs text-white">LOCAL AI // OLLAMA INTEGRATION</span>
              <span className="font-mono text-[10px] text-emerald-400">AIR-GAPPED BY DEFAULT</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
              Ground your queries by attaching notes, meetings, and documents as context chips.
              Models execute locally on your hardware with streaming completions and zero external telemetry.
            </p>
            <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-900/60 font-mono text-xs space-y-2 text-zinc-300">
              <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                <span>ATTACHED CONTEXT:</span>
                <span className="bg-zinc-800 text-white px-2 py-0.5 rounded border border-zinc-700">
                  [Architecture.pdf]
                </span>
                <span className="bg-zinc-800 text-white px-2 py-0.5 rounded border border-zinc-700">
                  [Product Sync]
                </span>
              </div>
              <p className="text-zinc-300 pt-1">
                "Based on the attached Architecture specification and Meeting transcript, the deployment is approved for Friday at 18:00 UTC."
              </p>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-zinc-850/80 flex items-center justify-between text-[10px] font-mono text-zinc-500">
          <span>SELECT ANY TAB TO INSPECT WORKSPACE BEHAVIOR</span>
          <span>100% CLIENT-SIDE VERIFIED</span>
        </div>
      </div>
    </section>
  );
};
