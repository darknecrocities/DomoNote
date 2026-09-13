import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { GitCommit, Shield, Database, Cpu, CheckCircle, Terminal, Layers } from 'lucide-react';

const RELEASES = [
  {
    version: 'v0.2.0',
    date: '2026-09-13',
    title: 'Interactive Audio ("Thock"), Workspace Modes & Panda Mascot',
    highlights: [
      'Web Audio API mechanical switch audio synthesis with custom low-frequency thock, click, pop, and chime.',
      'Workspace Modes: Zen Note-Taking Sanctuary, Automated Schedule & Calendar, Full Screen Studio Recorder.',
      'Animated monochrome Panda mascot companion taking notes in Zen mode.',
      'Embedded screen recording walkthrough demo player in About section.',
      'Collapsible desktop sidebar (256px <-> 64px) with persistent hardware status pill.',
      'Screen capture flight recorder with keyframe step extraction.',
    ],
  },
  {
    version: 'v0.1.0',
    date: '2026-09-13',
    title: 'Initial Production Release — DomoNote Core Architecture',
    highlights: [
      'Local-first client-side architecture using Dexie IndexedDB.',
      'Meeting Secretary with real browser MediaRecorder speech recognition and clickable timeline milestones.',
      'Document Intelligence powered by PDF.js with coordinate-anchored annotations and Turn into Steps.',
      'Direct REST integration with local Ollama models on port 11434 with zero cloud telemetry.',
      'Automated single-click Ollama setup script (setup-ollama.sh and start.sh).',
      'Client-side PDF and Markdown export engines.',
    ],
  },
];

export const ChangelogView: React.FC = () => {
  const [stats, setStats] = useState({
    notes: 0,
    meetings: 0,
    documents: 0,
    manuals: 0,
  });

  useEffect(() => {
    async function loadStats() {
      const [n, m, d, man] = await Promise.all([
        db.notes.count(),
        db.meetings.count(),
        db.documents.count(),
        db.manuals.count(),
      ]);
      setStats({ notes: n, meetings: m, documents: d, manuals: man });
    }
    loadStats();
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full bg-black p-8 overflow-y-auto max-w-5xl mx-auto w-full select-none font-sans">
      <div className="border-b border-zinc-850 pb-5 mb-8">
        <div className="flex items-center gap-2 text-white">
          <GitCommit className="w-5 h-5 text-zinc-400" />
          <h1 className="text-2xl font-bold tracking-tight">Changelog & System Diagnostics</h1>
        </div>
        <p className="text-xs text-zinc-400 mt-1">
          Complete chronological ledger of architectural changes and client-side database diagnostics.
        </p>
      </div>

      {/* Local Storage Telemetry Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-950">
          <span className="text-[10px] font-mono text-zinc-500 uppercase">Notes Stored</span>
          <div className="text-2xl font-black text-white mt-1">{stats.notes}</div>
          <span className="text-[10px] font-mono text-zinc-600">Dexie db.notes</span>
        </div>
        <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-950">
          <span className="text-[10px] font-mono text-zinc-500 uppercase">Meetings Captured</span>
          <div className="text-2xl font-black text-white mt-1">{stats.meetings}</div>
          <span className="text-[10px] font-mono text-zinc-600">Dexie db.meetings</span>
        </div>
        <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-950">
          <span className="text-[10px] font-mono text-zinc-500 uppercase">PDF Documents</span>
          <div className="text-2xl font-black text-white mt-1">{stats.documents}</div>
          <span className="text-[10px] font-mono text-zinc-600">Dexie db.documents</span>
        </div>
        <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-950">
          <span className="text-[10px] font-mono text-zinc-500 uppercase">SOP Manuals</span>
          <div className="text-2xl font-black text-white mt-1">{stats.manuals}</div>
          <span className="text-[10px] font-mono text-zinc-600">Dexie db.manuals</span>
        </div>
      </div>

      {/* Release Ledger */}
      <div className="space-y-8">
        {RELEASES.map((rel) => (
          <div
            key={rel.version}
            className="p-6 rounded-2xl border border-zinc-850 bg-zinc-950 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono font-bold text-white">
                  {rel.version}
                </span>
                <span className="text-sm font-semibold text-zinc-200">{rel.title}</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">{rel.date}</span>
            </div>

            <div className="space-y-2">
              {rel.highlights.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                  <CheckCircle className="w-3.5 h-3.5 text-zinc-500 mt-0.5 shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
