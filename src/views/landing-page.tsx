import React, { useState, useRef } from 'react';
import { useWorkspace } from '../context/workspace-context';
import { useSound } from '../context/sound-context';
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
  Play,
  RotateCcw,
  Sparkles,
  Download,
} from 'lucide-react';
import { GithubIcon } from '../components/ui/github-icon';
import { NoiseTexture } from '../components/ui/noise-texture';
import { HeroLiveWorkspace } from '../components/landing/hero-live-workspace';
import { StickyStorySection } from '../components/landing/sticky-story-section';
import { BeforeAfterSlider } from '../components/ui/before-after-slider';
import { HorizontalCarousel } from '../components/ui/horizontal-carousel';
import { FeatureMap } from '../components/landing/feature-map';
import { CodeBlock } from '../components/ui/code-block';
import { LoopingTypewriter } from '../components/landing/looping-typewriter';
import { ScrollReveal } from '../components/ui/scroll-reveal';
import { NodeNetworkBackground } from '../components/landing/node-network-background';
import { SectionConstellation } from '../components/landing/section-constellation';
import pandaImg from '../assets/panda-mascot.png';
import logoImg from '../assets/domodomo.png';

const CAROUSEL_PANELS = [
  {
    id: 'meetings',
    tag: 'MEETINGS',
    title: 'Voice Recording & Instant Notes',
    description:
      'Record meetings directly in your browser. Get clear transcripts, highlighted decisions, and structured action items automatically.',
    meta: 'Audio Recording',
    previewContent: (
      <div className="space-y-2 text-zinc-300">
        <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800 pb-1.5">
          <span>Weekly Team Sync</span>
          <span className="text-emerald-400">Transcribing</span>
        </div>
        <div className="text-xs text-zinc-400">03:12 speaker: "All documents will be stored locally on device."</div>
        <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800 text-xs text-zinc-200">
          <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Key Decision</span>
          Local-first architecture chosen with zero cloud dependencies.
        </div>
      </div>
    ),
  },
  {
    id: 'documents',
    tag: 'DOCUMENTS',
    title: 'Document Reader & Analysis',
    description:
      'Upload PDFs, Word docs, presentations, and text files. Ask questions across your documents, highlight passages, and extract summaries.',
    meta: 'Universal Files',
    previewContent: (
      <div className="space-y-2 text-zinc-300">
        <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800 pb-1.5">
          <span>Architecture Spec • Page 4</span>
          <span>Stored Locally</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-white text-black font-bold text-xs flex items-center justify-center shrink-0">
            01
          </span>
          <span className="text-xs text-zinc-200">Run database migrations before starting the application</span>
        </div>
        <div className="text-xs text-zinc-500">Summary note saved directly to your workspace</div>
      </div>
    ),
  },
  {
    id: 'operations',
    tag: 'GUIDES',
    title: 'Screen Recording & Step Manuals',
    description:
      'Record your screen during complex workflows. DomoNote extracts screenshots, captures steps, and builds a standard operating manual.',
    meta: 'Step Manuals',
    previewContent: (
      <div className="space-y-2 text-zinc-300">
        <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-850 pb-1.5">
          <span>Standard Operating Procedure</span>
          <span>Export: PDF & Markdown</span>
        </div>
        <div className="text-xs text-zinc-300 font-medium">Step 1: Check server health and memory</div>
        <div className="text-xs text-zinc-300 font-medium">Step 2: Deploy update with 10% canary traffic</div>
        <div className="text-xs text-zinc-500">3 screenshots captured • 2 action steps</div>
      </div>
    ),
  },
  {
    id: 'ai',
    tag: 'LOCAL AI',
    title: 'Private AI Assistant',
    description:
      'Run AI models completely on your computer with Ollama. Ask questions across your notes, meetings, and documents without sending data to third parties.',
    meta: '100% Offline',
    previewContent: (
      <div className="space-y-2 text-zinc-300">
        <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-850 pb-1.5">
          <span>Local Assistant</span>
          <span className="text-emerald-400">Ready</span>
        </div>
        <div className="text-xs text-zinc-400">Attached: [SprintPlan.pdf] [TeamSync]</div>
        <p className="text-xs text-zinc-200 leading-relaxed">
          "Based on your sprint plan and meeting notes, the project release is scheduled for Friday at 18:00 UTC."
        </p>
      </div>
    ),
  },
  {
    id: 'annotation',
    tag: 'AUTO-ANNOTATE',
    title: 'Dynamic Step-by-Step Auto-Annotation',
    description:
      'Detects UI elements, sentences, and workflows in real time. Automatically outlines actionable coordinates, captures screenshots, and drafts illustrated guides.',
    meta: 'Vision Framing',
    previewContent: (
      <div className="space-y-2 text-zinc-300">
        <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800 pb-1.5">
          <span>Coordinate Detection</span>
          <span className="text-emerald-400 font-mono text-[11px]">Exact Box: [x:142, y:388]</span>
        </div>
        <div className="p-2.5 rounded bg-zinc-950 border border-emerald-850/80 text-xs text-zinc-200">
          <span className="text-[10px] text-emerald-400 block uppercase font-semibold">Step 01 • Target Framed</span>
          Exact boundary calculated with border line only and zero inner obscuration.
        </div>
        <div className="text-[11px] text-zinc-500 font-mono">Auto-compiled into illustrated step manual</div>
      </div>
    ),
  },
  {
    id: 'vault',
    tag: 'STORAGE',
    title: 'Local IndexedDB Knowledge Vault',
    description:
      'All your notes, audio transcripts, and imported books stay strictly inside your browser database. Instant zero-latency search with zero external data transmission.',
    meta: 'Zero Cloud',
    previewContent: (
      <div className="space-y-2 text-zinc-300">
        <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800 pb-1.5">
          <span>Client Database Status</span>
          <span className="text-emerald-400 font-mono text-[11px]">Encrypted IndexedDB</span>
        </div>
        <div className="flex items-center justify-between text-xs text-zinc-300 bg-zinc-950 p-2.5 rounded border border-zinc-800">
          <span>Local Documents & Audio Recordings</span>
          <span className="font-mono text-emerald-400 font-bold">100% On-Device</span>
        </div>
        <div className="text-[11px] text-zinc-500 font-mono">Zero trackers • Zero cookies • No remote telemetry</div>
      </div>
    ),
  },
  {
    id: 'zen',
    tag: 'WRITING',
    title: 'Distraction-Free Zen Note Sanctuary',
    description:
      'Immersive dark note editor crafted for clarity and focus. Full Markdown support, version rollbacks, velocity tracking, and ambient acoustic focus soundscapes.',
    meta: 'Zen Editor',
    previewContent: (
      <div className="space-y-2 text-zinc-300">
        <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-850 pb-1.5">
          <span>Architecture Notes.md</span>
          <span className="text-zinc-500 font-mono text-[11px]">1,420 words • Auto-saved</span>
        </div>
        <p className="text-xs text-zinc-200 font-sans italic">
          "The best notes are the ones written without interruption, stored where you own them forever."
        </p>
        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
          <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800">#focus</span>
          <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800">#localfirst</span>
        </div>
      </div>
    ),
  },
  {
    id: 'export',
    tag: 'EXPORT',
    title: 'Universal One-Click Multi-Format Export',
    description:
      'Seamlessly export meeting minutes, step-by-step manuals, and executive summaries to publication-ready PDF, standard GitHub Markdown, or structured JSON.',
    meta: 'PDF & Markdown',
    previewContent: (
      <div className="space-y-2 text-zinc-300">
        <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-850 pb-1.5">
          <span>Compiled Deliverables</span>
          <span className="text-emerald-400 font-mono text-[11px]">Ready for Download</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
          <div className="p-2 rounded bg-zinc-950 border border-zinc-800 text-zinc-200">.PDF</div>
          <div className="p-2 rounded bg-zinc-950 border border-emerald-800/80 text-emerald-400 font-bold">.MD</div>
          <div className="p-2 rounded bg-zinc-950 border border-zinc-800 text-zinc-200">.JSON</div>
        </div>
        <div className="text-[11px] text-zinc-500 font-mono">Self-contained archives with embedded diagrams</div>
      </div>
    ),
  },
];

const MASCOT_MESSAGES = [
  'All notes, recordings, and documents stay 100% private on your machine.',
  'Local AI runs directly on your computer hardware via Ollama.',
  'Upload PDF, Word (DOCX), PowerPoint (PPTX), or TXT for instant AI summaries!',
  'Air-gapped and local-first by design — zero telemetry.',
  'Click me again for more tips!',
];

export const LandingPage: React.FC = () => {
  const { setActiveView, isCloudHost, setIsCloudModalOpen } = useWorkspace();
  const { playPop, playThock } = useSound();
  const mascotRef = React.useRef<HTMLDivElement>(null);
  const [mascotMsgIdx, setMascotMsgIdx] = useState(0);
  const [showMascotBubble, setShowMascotBubble] = useState(false);

  const handleOpenWorkspace = () => {
    if (isCloudHost) {
      setIsCloudModalOpen(true);
    } else {
      setActiveView('dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col font-sans selection:bg-zinc-800 selection:text-white relative overflow-x-hidden">
      {/* Subtle Noise Texture Overlay */}
      <NoiseTexture opacity={0.035} />

      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-[#050505]/85 backdrop-blur-md border-b border-zinc-850 px-6 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="DomoNote" className="w-7 h-7 rounded object-contain" />
            <span className="font-bold text-sm tracking-tight text-white">DomoNote</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-850 text-xs text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>100% Private & Offline</span>
            </div>

            <button
              onClick={() => setActiveView('download')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-300 hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <a
              href="https://github.com/darknecrocities/DomoNote"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">GitHub</span>
            </a>

            <Button variant="primary" size="sm" onClick={handleOpenWorkspace}>
              <span>{isCloudHost ? 'Download App' : 'Open Workspace'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Hero Body */}
      <main className="flex-1 max-w-7xl mx-auto px-6 pt-10 pb-24 relative z-10 w-full">
        {/* 2-Column Hero Section with Interactive 3D Node Network Background */}
        <div className="relative w-full overflow-hidden rounded-3xl">
          <SectionConstellation variant="neural-clusters" mascotExclusionRef={mascotRef} opacity={0.88} className="z-0" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center pt-6 pb-20 border-b border-zinc-850/60 mb-20 relative z-10">
            {/* Left Column: Text Content & Actions */}
            <div className="lg:col-span-6 flex flex-col items-start text-left space-y-6">
              {/* Top Benefit Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-300 select-none shadow-sm backdrop-blur-sm">
                <Shield className="w-3.5 h-3.5 text-zinc-400" />
                <span className="font-semibold text-white">100% Private</span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-400">Air-Gapped Local AI</span>
              </div>

              {/* Hero Headline with Looping Typewriter */}
              <div className="space-y-3">
                <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black tracking-tight text-white leading-[1.05]">
                  Notes, meetings, and documents.
                </h1>
                <div className="text-2xl sm:text-4xl font-bold text-zinc-400 tracking-tight min-h-[1.4em] flex items-center">
                  <LoopingTypewriter
                    phrases={[
                      'Captured and annotated automatically.',
                      'Transcribed and summarized offline.',
                      'Turned into step-by-step documentation.',
                      'Powered by your local Ollama models.',
                      'Zero cloud servers or telemetry.',
                    ]}
                    className="text-zinc-300"
                  />
                </div>
              </div>

              {/* Benefit-Focused Subtitle */}
              <p className="text-base sm:text-lg text-zinc-400 max-w-xl leading-relaxed font-normal">
                Capture meeting audio, read and query documents, record screens with dynamic auto-annotation,
                and organize notes without cloud servers. Everything stays private on your machine with local Ollama intelligence.
              </p>

              {/* Primary Hero Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button variant="primary" size="lg" onClick={handleOpenWorkspace}>
                  <span>{isCloudHost ? 'Download Desktop App' : 'Open Workspace'}</span>
                  {isCloudHost ? <Download className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="border-zinc-800 hover:border-white/40 text-white"
                  onClick={() => setActiveView('download')}
                >
                  <Download className="w-4 h-4 text-zinc-300" />
                  <span>Download (Mac / Win / Linux)</span>
                </Button>

                <Button variant="outline" size="lg" onClick={() => setActiveView('studio')}>
                  <Video className="w-4 h-4 text-zinc-300" />
                  <span>Screen Studio</span>
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
                  <span>Watch Demo</span>
                </Button>

                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => {
                    const el = document.getElementById('setup-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <Terminal className="w-4 h-4" />
                  <span>Quick Setup</span>
                </Button>
              </div>

              {/* Spec / Security Credentials Strip */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-zinc-400 border-t border-zinc-850/80 w-full">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Client-Side IndexedDB</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Dynamic Auto-Annotation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Zero Cloud Latency</span>
                </div>
              </div>
            </div>

            {/* Right Column: Prominent Large Standalone Mascot */}
            <div className="lg:col-span-6 flex items-center justify-center relative select-none">
              {/* Subtle Ambient Backlight Glow */}
              <div className="absolute w-80 h-80 sm:w-[540px] sm:h-[540px] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12)_0,transparent_70%)] pointer-events-none blur-3xl" />

              {/* Standalone Large Mascot with floating animation, hover interaction, NO overlay cards */}
              <div
                ref={mascotRef}
                className="relative z-10 cursor-pointer transition-transform duration-300 hover:scale-105 group flex flex-col items-center"
                onClick={() => {
                  playPop();
                  setMascotMsgIdx((prev: number) => (prev + 1) % MASCOT_MESSAGES.length);
                  setShowMascotBubble(true);
                }}
                onMouseEnter={() => {
                  playThock(1.2);
                  setShowMascotBubble(true);
                }}
                onMouseLeave={() => {
                  setShowMascotBubble(false);
                }}
                title="Click to interact with DomoNote Mascot"
              >
                {/* Interactive Speech Reaction Chip - Floats above mascot, never blocks the face */}
                <div
                  className={`absolute -top-12 px-3.5 py-1.5 rounded-full bg-zinc-950/95 border border-zinc-700 text-[11px] font-mono text-zinc-200 shadow-2xl backdrop-blur-md transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap pointer-events-none ${
                    showMascotBubble ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>{MASCOT_MESSAGES[mascotMsgIdx]}</span>
                </div>

                <img
                  src="/domoreading.gif"
                  alt="DomoNote Mascot Reading"
                  className="w-[340px] sm:w-[480px] md:w-[560px] lg:w-[620px] xl:w-[680px] max-w-full h-auto object-contain rounded-3xl filter drop-shadow-[0_25px_60px_rgba(255,255,255,0.15)] animate-float"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Product Demo Video Showcase with Quantum Lattice Constellation */}
        <ScrollReveal direction="up" delayMs={50}>
          <div id="demo-video-section" className="w-full py-10 text-left mb-28 scroll-mt-20 relative overflow-hidden rounded-3xl px-2 sm:px-4">
            <SectionConstellation variant="quantum-lattice" opacity={0.55} />
            <div className="relative z-10">
              <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Product Demo
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
                    See DomoNote in action
                  </h2>
                  <p className="text-sm text-zinc-400 mt-2 max-w-2xl leading-relaxed">
                    Watch how real audio transcription, document analysis (PDF, DOCX, PPTX, TXT), screen guides,
                    and local AI synthesis work seamlessly on your computer.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const img = document.getElementById('demo-video-img') as HTMLImageElement;
                      if (img) img.src = `/domonote-demo.webp?t=${Date.now()}`;
                    }}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Replay</span>
                  </Button>
                </div>
              </div>

              {/* Clean Demo Player Frame */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">
                <div className="p-3.5 border-b border-zinc-850 bg-zinc-900/60 flex items-center justify-between text-xs text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                    <span className="ml-2 font-medium text-zinc-300">DomoNote Product Walkthrough</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Interactive Demo</span>
                  </div>
                </div>

                <div className="relative bg-black flex items-center justify-center p-2 min-h-[400px]">
                  <img
                    id="demo-video-img"
                    src="/domonote-demo.webp"
                    alt="DomoNote Product Walkthrough"
                    className="w-full max-h-[640px] object-contain rounded-lg shadow-inner"
                  />
                </div>

                <div className="p-4 border-t border-zinc-850 bg-zinc-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-zinc-400 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Real features running locally: audio capture, document reader, IndexedDB storage, and local AI.</span>
                  </div>
                  <Button variant="primary" size="sm" onClick={() => setActiveView('dashboard')}>
                    <span>Open Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Live Interactive Workspace Preview with Synaptic Flow Constellation */}
        <ScrollReveal direction="up" delayMs={60}>
          <div className="w-full mb-28 relative overflow-hidden rounded-3xl px-2 sm:px-4">
            <SectionConstellation variant="synaptic-flow" opacity={0.5} />
            <div className="relative z-10">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-2 px-1">
                <span className="font-semibold text-zinc-300">Document Reader & AI Assistant</span>
                <span className="text-zinc-500">Interactive Preview</span>
              </div>
              <HeroLiveWorkspace />
            </div>
          </div>
        </ScrollReveal>

        {/* Storytelling Section with Harmonic Wave Constellation */}
        <ScrollReveal direction="up" delayMs={60}>
          <div className="w-full mb-28 relative overflow-hidden rounded-3xl px-2 sm:px-4">
            <SectionConstellation variant="harmonic-wave" opacity={0.55} />
            <div className="relative z-10">
              <StickyStorySection />
            </div>
          </div>
        </ScrollReveal>

        {/* Before / After Comparison with Audio Nodes Constellation */}
        <ScrollReveal direction="up" delayMs={60}>
          <div className="w-full py-16 border-t border-zinc-850 text-left mb-28 relative overflow-hidden rounded-3xl px-2 sm:px-4">
            <SectionConstellation variant="audio-nodes" opacity={0.6} />
            <div className="relative z-10">
              <div className="mb-8">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Automatic Summaries
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
                  From messy conversation to clear action items.
                </h2>
                <p className="text-sm text-zinc-400 mt-2 max-w-xl leading-relaxed">
                  Drag the slider to see how raw speech transcripts become structured executive decisions
                  and deliverables.
                </p>
              </div>
              <BeforeAfterSlider />
            </div>
          </div>
        </ScrollReveal>

        {/* Horizontal Feature Carousel with Stellar Vortex Constellation */}
        <ScrollReveal direction="up" delayMs={60}>
          <div className="w-full py-16 border-t border-zinc-850 text-left mb-28 relative overflow-hidden rounded-3xl px-2 sm:px-4">
            <SectionConstellation variant="stellar-vortex" opacity={0.65} />
            <div className="relative z-10">
              <div className="mb-8">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Features
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
                  Built for real everyday work.
                </h2>
                <p className="text-sm text-zinc-400 mt-2 max-w-xl leading-relaxed">
                  Everything runs natively inside your browser sandbox with zero external server dependencies.
                </p>
              </div>
              <HorizontalCarousel panels={CAROUSEL_PANELS} />
            </div>
          </div>
        </ScrollReveal>

        {/* Unified Feature Explorer Map */}
        <ScrollReveal direction="up" delayMs={60}>
          <div className="w-full mb-28">
            <FeatureMap />
          </div>
        </ScrollReveal>

        {/* Local Setup Section with Crystalline Polyhedra Constellation */}
        <ScrollReveal direction="up" delayMs={60}>
          <div id="setup-section" className="w-full py-16 border-t border-zinc-850 text-left mb-28 scroll-mt-20 relative overflow-hidden rounded-3xl px-2 sm:px-4">
            <SectionConstellation variant="crystalline-polyhedra" opacity={0.55} />
            <div className="relative z-10">
              <div className="mb-8">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Quick Setup
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
                  One command to initialize everything.
                </h2>
                <p className="text-sm text-zinc-400 mt-2 max-w-2xl leading-relaxed">
                  DomoNote includes an automated launcher that checks your local Ollama setup, enables
                  browser permissions, pulls recommended models, and opens your workspace.
                </p>
              </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-4">
                <CodeBlock
                  title="ONE-CLICK INITIALIZATION"
                  code={`# Clone the repository
git clone https://github.com/darknecrocities/DomoNote.git
cd DomoNote

# Run automated launcher
./start.sh`}
                />

                <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-950 text-xs text-zinc-400 space-y-2">
                  <div className="text-zinc-200 font-semibold mb-1">What the launcher automates:</div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Checks if Ollama is installed (prompts installation if missing)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Configures cross-origin settings for local browser communication</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Pulls lightweight models automatically if none exist</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Starts the development server and launches your workspace in browser</span>
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
                    qwen2.5, phi3, and llava.
                  </p>
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                      llama3.2
                    </span>
                    <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                      gemma
                    </span>
                    <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                      qwen2.5
                    </span>
                    <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                      mistral
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
        </div>
      </ScrollReveal>

        {/* Why DomoNote / Foundations */}
        <ScrollReveal direction="up" delayMs={60}>
          <div className="w-full py-16 border-t border-zinc-850 text-left mb-20">
            <div className="mb-10 text-center">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Why DomoNote
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                Built for privacy, speed, and ownership
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-6 rounded-xl border border-zinc-850 bg-zinc-950 space-y-2">
                <span className="text-xs font-bold text-zinc-400 uppercase">Private by Default</span>
                <h3 className="text-sm font-bold text-white">Your Data Stays With You</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Everything is stored directly in your browser using IndexedDB. No remote servers ever read or store your content.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-zinc-850 bg-zinc-950 space-y-2">
                <span className="text-xs font-bold text-zinc-400 uppercase">Zero Tracking</span>
                <h3 className="text-sm font-bold text-white">No Ads or Telemetry</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  No tracking scripts, cookies, or analytics. Your notes, meetings, and thoughts remain completely confidential.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-zinc-850 bg-zinc-950 space-y-2">
                <span className="text-xs font-bold text-zinc-400 uppercase">Universal Formats</span>
                <h3 className="text-sm font-bold text-white">Export Anytime</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Export your notes, meeting minutes, and manuals to clean Markdown and PDF files with one click.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-zinc-850 bg-zinc-950 space-y-2">
                <span className="text-xs font-bold text-zinc-400 uppercase">Open Source</span>
                <h3 className="text-sm font-bold text-white">Free and Auditable</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Free to use under the MIT license. You can inspect the source code, run it anywhere, or contribute improvements.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Final Launch Callout Card */}
        <ScrollReveal direction="up" delayMs={60}>
          <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-8 sm:p-12 text-left flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-2xl">
            <div className="max-w-xl">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
                Start taking notes with private local AI.
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                No account creation required. No credit card. Your workspace lives entirely inside your
                browser and local storage.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button variant="primary" size="lg" onClick={handleOpenWorkspace}>
                <span>{isCloudHost ? 'Download Desktop App' : 'Open DomoNote'}</span>
                {isCloudHost ? <Download className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-zinc-800 text-zinc-200 hover:border-white/40 hover:text-white"
                onClick={() => setActiveView('download')}
              >
                <Download className="w-4 h-4 text-zinc-300" />
                <span>Download App</span>
              </Button>
            </div>
          </div>
        </ScrollReveal>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-850 py-12 px-6 bg-[#030303] text-zinc-500 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <img src={logoImg} alt="DomoNote" className="w-6 h-6 rounded object-contain" />
              <span className="font-bold text-sm text-white tracking-tight">DomoNote</span>
              <span className="text-xs text-zinc-500">• Local-First AI Workspace</span>
            </div>
            <p className="text-zinc-500 text-xs max-w-sm">
              Built with React, TypeScript, IndexedDB, and local Ollama intelligence.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-zinc-400">
            <button
              onClick={() => setActiveView('download')}
              className="text-white font-semibold hover:text-zinc-200 transition-colors"
            >
              Download
            </button>
            <button
              onClick={handleOpenWorkspace}
              className="hover:text-white transition-colors"
            >
              Workspace
            </button>
            <button
              onClick={() => setActiveView('privacy')}
              className="hover:text-white transition-colors"
            >
              Privacy
            </button>
            <button
              onClick={() => setActiveView('about')}
              className="hover:text-white transition-colors"
            >
              About
            </button>
            <button
              onClick={() => setActiveView('settings')}
              className="hover:text-white transition-colors"
            >
              Settings
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

        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-600">
          <span>MIT License • Open Source • 100% Private</span>
          <span className="mt-2 sm:mt-0">Zero Cloud Telemetry</span>
        </div>
      </footer>
    </div>
  );
};
