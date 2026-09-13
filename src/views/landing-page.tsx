import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../context/workspace-context';
import { Button } from '../components/ui/button';
import {
  Mic,
  FileText,
  FileUp,
  Video,
  Bot,
  Shield,
  ArrowRight,
  Cpu,
  CheckCircle,
  Database,
  Lock,
  Terminal,
  Layers,
  Sparkles,
  Workflow,
  Download,
  Play,
  RotateCcw,
} from 'lucide-react';
import { GithubIcon } from '../components/ui/github-icon';
import { NoiseTexture } from '../components/ui/noise-texture';
import { TechnicalGrid } from '../components/ui/technical-grid';
import { HeroLiveWorkspace } from '../components/landing/hero-live-workspace';
import { StickyStorySection } from '../components/landing/sticky-story-section';
import { BeforeAfterSlider } from '../components/ui/before-after-slider';
import { HorizontalCarousel } from '../components/ui/horizontal-carousel';
import { FeatureMap } from '../components/landing/feature-map';
import { CodeBlock } from '../components/ui/code-block';
import { PandaMascot } from '../components/ui/panda-mascot';
import logoImg from '../assets/domodomo.png';

const CAROUSEL_PANELS = [
  {
    id: 'meetings',
    tag: 'MODULE 01 // AUDIO INTELLIGENCE',
    title: 'Meeting Secretary & Acoustic Stream',
    description:
      'Direct browser MediaRecorder capture with real-time speech transcription, clickable milestone timestamps, and automated extraction of team decisions and deliverables.',
    meta: 'LATENCY: REALTIME',
    previewContent: (
      <div className="space-y-2 text-zinc-300">
        <div className="flex items-center justify-between text-[10px] text-zinc-500 border-b border-zinc-800 pb-1.5">
          <span>SPEECH STREAM // MEETING REVISION #12</span>
          <span className="text-emerald-400">ACTIVE CAPTURE</span>
        </div>
        <div className="text-[11px] text-zinc-400">03:12 speaker: "We commit to local IndexedDB and 0 cloud telemetry."</div>
        <div className="p-2 rounded bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-200">
          <span className="text-[9px] text-zinc-500 block uppercase">Extracted Decision</span>
          Local-first architecture approved without external cloud databases.
        </div>
      </div>
    ),
  },
  {
    id: 'documents',
    tag: 'MODULE 02 // PDF INTELLIGENCE',
    title: 'Document Canvas & Coordinate Anchors',
    description:
      'High-fidelity PDF rendering with text selection AI actions, coordinate-anchored rectangle and step callouts, and conversational RAG grounded against page chunks.',
    meta: 'PDF.JS ENGINE',
    previewContent: (
      <div className="space-y-2 text-zinc-300">
        <div className="flex items-center justify-between text-[10px] text-zinc-500 border-b border-zinc-800 pb-1.5">
          <span>COORDINATE ANNOTATION // PAGE 04</span>
          <span>INDEXEDDB BLOB</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-white text-black font-bold text-[10px] flex items-center justify-center shrink-0">
            01
          </span>
          <span className="text-[11px] text-zinc-200">Warning: Run migrations before updating container image</span>
        </div>
        <div className="text-[10px] text-zinc-500 font-mono">X: 140px • Y: 320px • W: 280px • H: 45px</div>
      </div>
    ),
  },
  {
    id: 'operations',
    tag: 'MODULE 03 // PROCEDURAL RECORDER',
    title: 'Operation Flight Recorder & SOP Builder',
    description:
      'Capture screen states during complex computer tasks. DomoNote extracts sequential frame snapshots, logs actions, and generates a publishing-grade standard operating manual.',
    meta: 'SOP GENERATION',
    previewContent: (
      <div className="space-y-2 text-zinc-300">
        <div className="flex items-center justify-between text-[10px] text-zinc-500 border-b border-zinc-800 pb-1.5">
          <span>STANDARD OPERATING PROCEDURE</span>
          <span>EXPORT: PDF & MD</span>
        </div>
        <div className="text-[11px] text-zinc-300 font-medium">Step 01: Verify Kubernetes cluster health and node memory</div>
        <div className="text-[11px] text-zinc-300 font-medium">Step 02: Deploy canary pod manifest with 10% traffic weight</div>
        <div className="text-[10px] text-zinc-500 font-mono">3 SCREENSHOTS CAPTURED • 2 VERIFIED ACTIONS</div>
      </div>
    ),
  },
  {
    id: 'ai',
    tag: 'MODULE 04 // LOCAL AI ENGINE',
    title: 'Grounded Synthesis via Ollama',
    description:
      'Air-gapped language model inference running exclusively on your processor. Connect notes, meeting transcripts, and PDFs as context chips with zero data leakage.',
    meta: 'PORT 11434 // NATIVE',
    previewContent: (
      <div className="space-y-2 text-zinc-300">
        <div className="flex items-center justify-between text-[10px] text-zinc-500 border-b border-zinc-800 pb-1.5">
          <span>LOCAL INFERENCE STREAM</span>
          <span className="text-emerald-400">LLAMA3.2 READY</span>
        </div>
        <div className="text-[10px] font-mono text-zinc-400">CONTEXT CHIPS: [SprintPlan.pdf] [EngineeringSync]</div>
        <p className="text-[11px] text-zinc-200 leading-relaxed">
          "Based on the attached documentation and sprint transcript, the release cut is confirmed for Friday at 18:00 UTC."
        </p>
      </div>
    ),
  },
];

export const LandingPage: React.FC = () => {
  const { setActiveView } = useWorkspace();

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col font-sans selection:bg-zinc-800 selection:text-white relative overflow-x-hidden">
      {/* Noise Texture Overlay */}
      <NoiseTexture opacity={0.035} />

      {/* Top Technical Navigation */}
      <header className="sticky top-0 z-40 bg-[#050505]/85 backdrop-blur-md border-b border-zinc-850 px-6 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="DomoNote" className="w-7 h-7 rounded object-contain" />
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white">DomoNote</span>
              <span className="hidden sm:inline-block text-[10px] font-mono text-zinc-500 border-l border-zinc-800 pl-2">
                SYS_VER: 0.1.0
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>AIR-GAPPED BY DEFAULT</span>
            </div>

            <a
              href="https://github.com/darknecrocities/DomoNote"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">GitHub</span>
            </a>

            <Button variant="primary" size="sm" onClick={() => setActiveView('dashboard')}>
              <span>Open DomoNote</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-6xl mx-auto px-6 pt-16 pb-24 text-center flex flex-col items-center relative z-10">
        <TechnicalGrid />

        {/* Top Technical Hardware Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-[11px] font-mono text-zinc-300 mb-8 select-none shadow-sm">
          <Cpu className="w-3.5 h-3.5 text-zinc-400" />
          <span>LOCAL AI ENGINE</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-400">ZERO CLOUD TELEMETRY</span>
        </div>

        {/* Hero Headline with Kinetic Line Reveal */}
        <div className="mb-6 space-y-1">
          <h1 className="text-4xl sm:text-7xl font-black tracking-tighter text-white leading-[1.04]">
            <span className="block animate-[lineReveal_0.6s_ease-out]">CAPTURE IT.</span>
            <span className="block animate-[lineReveal_0.8s_ease-out]">UNDERSTAND IT.</span>
            <span className="block animate-[lineReveal_1.0s_ease-out]">KEEP IT.</span>
          </h1>
        </div>

        {/* Editorial Subtitle */}
        <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          A local-first workspace for meetings, documents, notes, and the computer operations that
          happen between them. Powered by your local Ollama models. Persisted strictly on your
          machine.
        </p>

        {/* Primary Hero Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          <Button variant="primary" size="lg" onClick={() => setActiveView('dashboard')}>
            <span>Open Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              const el = document.getElementById('demo-video-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Watch Product Demo</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              const el = document.getElementById('setup-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <Terminal className="w-4 h-4" />
            <span>Single-Click Setup</span>
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={() => {
              window.open('https://github.com/darknecrocities/DomoNote', '_blank');
            }}
          >
            <GithubIcon className="w-4 h-4" />
            <span>Source Code</span>
          </Button>
        </div>

        {/* Animated Panda Mascot Focus Companion on Landing */}
        <div className="mb-20 flex flex-col items-center animate-fade-in">
          <PandaMascot
            size="md"
            badge="LOCAL FOCUS COMPANION"
            message="Hi! I'm your local-first companion. Everything you write stays 100% private on your machine."
          />
        </div>

        {/* Dedicated Live Product Demo Video Showcase Section */}
        <div id="demo-video-section" className="w-full py-12 border-t border-zinc-850 text-left mb-28 scroll-mt-20">
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                SYSTEM DEMONSTRATION // LIVE WORKSPACE CAPTURE
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
                Watch DomoNote in Action
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-2xl leading-relaxed">
                A full screen-recorded demonstration showing real audio meeting capture, PDF & document
                intelligence (DOCX, PPTX, TXT), screen operation manuals, Zen mode with the Panda mascot,
                and local Ollama synthesis.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-850 text-[10px] font-mono text-emerald-400">
                REAL BROWSER CAPTURE
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const img = document.getElementById('demo-video-img') as HTMLImageElement;
                  if (img) img.src = `/domonote-demo.webp?t=${Date.now()}`;
                }}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay Demo</span>
              </Button>
            </div>
          </div>

          {/* Demo Player Frame */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">
            <div className="p-3.5 border-b border-zinc-850 bg-zinc-900/60 flex items-center justify-between font-mono text-[11px] text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                <span className="ml-2 text-zinc-300">DOMONOTE_LIVE_DEMO.WEBP</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-zinc-500">1470x835 DISPLAY STREAM</span>
                <span className="text-emerald-400">● 100% LOCAL</span>
              </div>
            </div>

            <div className="relative bg-black flex items-center justify-center p-2 min-h-[400px]">
              <img
                id="demo-video-img"
                src="/domonote-demo.webp"
                alt="DomoNote Live Product Demo Walkthrough"
                className="w-full max-h-[640px] object-contain rounded-lg shadow-inner"
              />
            </div>

            <div className="p-4 border-t border-zinc-850 bg-zinc-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-zinc-400 font-mono text-[11px]">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-zinc-400" />
                <span>Verified real interactions across Web Audio, PDF.js, Dexie IndexedDB, and Ollama.</span>
              </div>
              <Button variant="primary" size="sm" onClick={() => setActiveView('dashboard')}>
                <span>Launch DomoNote</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Live Miniature Interactive Hero Workspace */}
        <div className="w-full mb-28">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 mb-2 px-1">
            <span>LIVE INTERACTIVE PREVIEW // DOCUMENT TO NOTE PIPELINE</span>
            <span>AUTONOMOUS CYCLING</span>
          </div>
          <HeroLiveWorkspace />
        </div>

        {/* Storytelling Section: From Conversation to Something Useful */}
        <div className="w-full mb-28">
          <StickyStorySection />
        </div>

        {/* Draggable Synthesis Comparison (Before / After) */}
        <div className="w-full py-16 border-t border-zinc-850 text-left mb-28">
          <div className="mb-8">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              SYNTHESIS ENGINE // TRANSFORMATION
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
              See the transformation.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-xl leading-relaxed">
              Drag the divider below to inspect the transformation from messy, unparsed acoustic
              speech transcripts into verified executive action items and decisions.
            </p>
          </div>
          <BeforeAfterSlider />
        </div>

        {/* Horizontal Editorial Carousel */}
        <div className="w-full py-16 border-t border-zinc-850 text-left mb-28">
          <div className="mb-8">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              CAPABILITY OVERVIEW // CORE MODULES
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
              Engineered for high-friction workflows.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-xl leading-relaxed">
              Scroll through the dedicated systems built into DomoNote. Each operates natively inside
              the browser sandbox with zero external server dependencies.
            </p>
          </div>
          <HorizontalCarousel panels={CAROUSEL_PANELS} />
        </div>

        {/* Unified Feature Explorer Map */}
        <div className="w-full mb-28">
          <FeatureMap />
        </div>

        {/* Automated Local Setup & Terminal Launcher */}
        <div id="setup-section" className="w-full py-16 border-t border-zinc-850 text-left mb-28 scroll-mt-20">
          <div className="mb-8">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              AUTOMATION // ZERO-CONFIG LOCAL AI
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
              One command to initialize everything.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-2xl leading-relaxed">
              DomoNote includes an automated launcher that verifies your local Ollama installation,
              configures cross-origin permissions, pulls recommended lightweight models, and starts
              the background workspace daemon.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-4">
              <CodeBlock
                title="ONE-CLICK INITIALIZATION"
                code={`# Clone the repository
git clone https://github.com/darknecrocities/DomoNote.git
cd DomoNote

# Automated single-click setup & launcher
./start.sh`}
              />

              <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-950 font-mono text-xs text-zinc-400 space-y-1.5">
                <div className="text-zinc-200 font-semibold mb-1">What the launcher automates:</div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>Checks if Ollama is installed (prompts brew/curl if missing)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>Sets OLLAMA_ORIGINS="*" for seamless in-browser communication</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>Pulls llama3.2 lightweight model automatically if no model exists</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>Launches Vite development server and opens workspace in browser</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-950">
                <div className="flex items-center gap-2 text-white font-bold text-sm mb-2">
                  <Cpu className="w-4 h-4 text-zinc-400" />
                  <span>Supported Local Models</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  Compatible with any model running on Ollama, including llama3.2, gemma, mistral,
                  qwen2.5, phi3, and llava vision models.
                </p>
                <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                    llama3.2
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                    gemma4
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                    qwen2.5-coder
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                    llava-phi3
                  </span>
                </div>
              </div>

              <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-950">
                <div className="flex items-center gap-2 text-white font-bold text-sm mb-2">
                  <Shield className="w-4 h-4 text-zinc-400" />
                  <span>Privacy Boundaries</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Your notes and recordings never leave your device. AI requests travel exclusively
                  between your web browser and <code className="text-zinc-200">http://localhost:11434</code>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Architectural Principles */}
        <div className="w-full py-16 border-t border-zinc-850 text-left mb-20">
          <div className="mb-10 text-center">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              FOUNDATIONS
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Architectural Commitments
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl border border-zinc-850 bg-zinc-950 space-y-2">
              <span className="font-mono text-xs font-bold text-zinc-500">01 / LOCAL FIRST</span>
              <h3 className="text-sm font-bold text-white">Zero Cloud Lock-in</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                IndexedDB stores all records directly on your drive. If our website disappeared
                tomorrow, your knowledge base remains intact and fully exportable.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-zinc-850 bg-zinc-950 space-y-2">
              <span className="font-mono text-xs font-bold text-zinc-500">02 / AIR GAPPED</span>
              <h3 className="text-sm font-bold text-white">Zero Cloud Telemetry</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                No tracking pixels, no behavioral cookies, no cloud LLM API forwarders. You control
                the model, the weights, and the compute.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-zinc-850 bg-zinc-950 space-y-2">
              <span className="font-mono text-xs font-bold text-zinc-500">03 / MECHANICAL</span>
              <h3 className="text-sm font-bold text-white">Deterministic Data</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Clear schema versioning, strict blob retention, and transparent markdown exports.
                No proprietary walled-garden formats.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-zinc-850 bg-zinc-950 space-y-2">
              <span className="font-mono text-xs font-bold text-zinc-500">04 / OPEN SOURCE</span>
              <h3 className="text-sm font-bold text-white">Community Auditable</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Entire codebase is open-source under the MIT license. Inspect, fork, extend, or run
                it in private corporate intranets.
              </p>
            </div>
          </div>
        </div>

        {/* Final Launch Callout Card */}
        <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-8 sm:p-12 text-left flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-2xl">
          <div className="max-w-xl">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2">
              PRODUCTION READY // V0.1.0
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
              Start taking notes with local intelligence.
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              No account creation required. No credit card. Your workspace lives entirely inside your
              browser and local storage.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button variant="primary" size="lg" onClick={() => setActiveView('dashboard')}>
              <span>Launch DomoNote</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>

      {/* Editorial Technical Footer */}
      <footer className="border-t border-zinc-850 py-12 px-6 bg-[#030303] text-zinc-500 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <img src={logoImg} alt="DomoNote" className="w-6 h-6 rounded object-contain" />
              <span className="font-bold text-sm text-white tracking-tight">DomoNote</span>
              <span className="text-[10px] font-mono text-zinc-600">/ LOCAL-FIRST AI WORKSPACE</span>
            </div>
            <p className="text-zinc-500 text-xs max-w-sm">
              Engineered with React, TypeScript, Vite, Dexie IndexedDB, and Ollama.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-zinc-400">
            <button
              onClick={() => setActiveView('dashboard')}
              className="hover:text-white transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveView('privacy')}
              className="hover:text-white transition-colors"
            >
              Privacy Architecture
            </button>
            <button
              onClick={() => setActiveView('about')}
              className="hover:text-white transition-colors"
            >
              About & SOT
            </button>
            <button
              onClick={() => setActiveView('settings')}
              className="hover:text-white transition-colors"
            >
              Ollama Settings
            </button>
            <a
              href="https://github.com/darknecrocities/DomoNote"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-600">
          <span>MIT LICENSE • OPEN SOURCE • NO EMOJIS • NO CLOUD TELEMETRY</span>
          <span className="font-mono mt-2 sm:mt-0">SHA: LOCAL_VERIFIED</span>
        </div>
      </footer>
    </div>
  );
};
