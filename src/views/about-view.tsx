import React, { useState } from 'react';
import { Shield, Cpu, Database, ExternalLink, Play, RotateCcw, Sparkles, Video, CheckCircle } from 'lucide-react';
import { GithubIcon } from '../components/ui/github-icon';
import { PandaMascot } from '../components/ui/panda-mascot';
import logoImg from '../assets/domodomo.png';
import demoWalkthrough from '../assets/domonote-demo.webp';

export const AboutView: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [key, setKey] = useState(0);

  const handleRestart = () => {
    setKey((prev) => prev + 1);
    setIsPlaying(true);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-black p-8 overflow-y-auto max-w-5xl mx-auto w-full select-none font-sans">
      {/* Brand Header */}
      <div className="border-b border-zinc-850 pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img src={logoImg} alt="DomoNote" className="w-12 h-12 rounded-xl object-contain" />
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">About DomoNote</h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Local-First AI Knowledge Workspace • Version 0.2.0 • Canonical Architecture
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com/darknecrocities/DomoNote"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-white bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>GitHub Repository</span>
            <ExternalLink className="w-3 h-3 text-zinc-500" />
          </a>
        </div>
      </div>

      <div className="space-y-10 text-xs text-zinc-300 leading-relaxed">
        {/* Real Embedded Screen Recording Product Demo */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-zinc-850 flex items-center justify-between bg-zinc-900/40">
            <div className="flex items-center gap-2 text-white font-mono text-xs">
              <Video className="w-4 h-4 text-zinc-400" />
              <span className="font-semibold">DEMONSTRATION // LIVE PRODUCT WALKTHROUGH</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRestart}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-mono transition-colors"
                title="Replay product demo"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Replay Demo</span>
              </button>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                REAL REC
              </span>
            </div>
          </div>

          <div className="relative bg-black flex items-center justify-center p-2">
            <img
              key={key}
              src={demoWalkthrough}
              alt="DomoNote Live Product Demo Walkthrough"
              className="w-full max-h-[520px] object-contain rounded-lg shadow-inner"
            />
          </div>

          <div className="p-4 border-t border-zinc-850 bg-zinc-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-zinc-400 font-mono text-[11px]">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-zinc-400" />
              <span>Full product capture: Landing, Notes, Meetings, Documents, Zen Mode & Panda</span>
            </div>
            <div className="text-zinc-500 text-[10px]">
              ENGINE: BROWSER MEDIA RECORDER • ZERO TELEMETRY
            </div>
          </div>
        </section>

        {/* Mascot Showcase Section */}
        <section className="bg-zinc-950 border border-zinc-850 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400 uppercase">
              <Sparkles className="w-3 h-3 text-zinc-400" />
              <span>Focus Companion</span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Meet DomoNote's Panda Mascot
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Designed in a minimalist, high-craft editorial black-and-white style. The panda sits
              quietly taking notes in your Zen focus workspace, scribbling when you type and tracking
              your word count without getting in your way.
            </p>
            <div className="font-mono text-[11px] text-zinc-500">
              CLICK THE PANDA TO CYCLE FOCUS TIPS • LAUNCH ZEN MODE VIA CMD/CTRL + SHIFT + N
            </div>
          </div>

          <div className="shrink-0 flex items-center justify-center">
            <PandaMascot size="lg" message="I keep your notes private and safe locally." />
          </div>
        </section>

        {/* Concept & Manifesto */}
        <section className="bg-zinc-950 border border-zinc-850 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white tracking-tight uppercase tracking-wider">
            What is DomoNote?
          </h3>
          <p className="leading-relaxed">
            DomoNote is an open-source, local-first workspace designed to capture, understand, and
            synthesize what happens across meetings, documents, computer operations, and notes.
          </p>
          <p className="text-zinc-400 leading-relaxed">
            Instead of dispersing information across closed SaaS products, DomoNote operates
            entirely inside your browser and local machine. It combines the functions of a modern
            markdown notes app, an automated meeting secretary, an interactive PDF document reader, and
            a step-by-step standard operating procedure (SOP) generator.
          </p>
        </section>

        {/* Domo Open Source Ecosystem */}
        <section className="bg-zinc-950 border border-zinc-850 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white tracking-tight uppercase tracking-wider">
            Domo Open Source Ecosystem
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <div className="font-semibold text-zinc-100 text-sm">DomoNote</div>
              <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                Local-first AI note-taking, meetings, documents, and operational memory.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <div className="font-semibold text-zinc-100 text-sm">DomoDomo</div>
              <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                General local-first developer toolbox and utilities.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <div className="font-semibold text-zinc-100 text-sm">DomoSkills</div>
              <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                Autonomous agent skills, capabilities, and system cheatsheets.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <div className="font-semibold text-zinc-100 text-sm">Codepyne</div>
              <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                AI engineering education and hands-on learning resources.
              </p>
            </div>
          </div>
        </section>

        {/* Technology Foundation */}
        <section className="bg-zinc-950 border border-zinc-850 rounded-2xl p-6 space-y-3">
          <h3 className="text-sm font-semibold text-white tracking-tight uppercase tracking-wider">
            Technology Foundation
          </h3>
          <ul className="space-y-2 text-zinc-400 font-mono text-xs">
            <li>• Frontend: React 18, TypeScript 5, Vite 6, Tailwind CSS</li>
            <li>• Audio Engine: Web Audio API mechanical switch & thock synthesizer</li>
            <li>• Local Storage: IndexedDB via Dexie 4</li>
            <li>• Local Intelligence: Ollama REST API (streaming generate & chat)</li>
            <li>• PDF Engine: PDF.js (pdfjs-dist) with coordinate annotations</li>
            <li>• Audio Processing: Web Audio API & MediaRecorder</li>
            <li>• Screen Recording: Standard Navigator MediaDevices DisplayMedia</li>
            <li>• Architecture: Fully deployable to Vercel as a client-side SPA</li>
          </ul>
        </section>
      </div>
    </div>
  );
};
