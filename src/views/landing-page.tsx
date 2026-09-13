import React from 'react';
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
  Play,
  RotateCcw,
} from 'lucide-react';
import { GithubIcon } from '../components/ui/github-icon';
import { NoiseTexture } from '../components/ui/noise-texture';
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
];

export const LandingPage: React.FC = () => {
  const { setActiveView } = useWorkspace();

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
              <span>Open Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Hero Body */}
      <main className="flex-1 max-w-6xl mx-auto px-6 pt-16 pb-24 text-center flex flex-col items-center relative z-10">
        {/* Top Benefit Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-300 mb-8 select-none shadow-sm">
          <Shield className="w-3.5 h-3.5 text-zinc-400" />
          <span>Private by Design</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-400">Runs 100% on your device</span>
        </div>

        {/* Hero Headline */}
        <div className="mb-6 space-y-2">
          <h1 className="text-4xl sm:text-7xl font-black tracking-tight text-white leading-[1.05]">
            Notes, meetings, and documents.
            <span className="block text-zinc-400">Powered by local AI.</span>
          </h1>
        </div>

        {/* Benefit-Focused Subtitle */}
        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Capture meeting audio, read and query documents, and organize notes without cloud servers.
          Everything stays private on your machine with local Ollama intelligence.
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
            <span>Watch Demo</span>
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
            <span>Quick Setup</span>
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

        {/* Animated Panda Mascot Focus Companion */}
        <div className="mb-20 flex flex-col items-center animate-fade-in">
          <PandaMascot
            size="md"
            badge="FOCUS COMPANION"
            message="Hi! Everything you write stays 100% private on your machine."
          />
        </div>

        {/* Product Demo Video Showcase */}
        <div id="demo-video-section" className="w-full py-12 border-t border-zinc-850 text-left mb-28 scroll-mt-20">
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

        {/* Live Interactive Workspace Preview */}
        <div className="w-full mb-28">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2 px-1">
            <span className="font-semibold text-zinc-300">Document Reader & AI Assistant</span>
            <span className="text-zinc-500">Interactive Preview</span>
          </div>
          <HeroLiveWorkspace />
        </div>

        {/* Storytelling Section: From Conversation to Useful Notes */}
        <div className="w-full mb-28">
          <StickyStorySection />
        </div>

        {/* Before / After Comparison */}
        <div className="w-full py-16 border-t border-zinc-850 text-left mb-28">
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

        {/* Horizontal Feature Carousel */}
        <div className="w-full py-16 border-t border-zinc-850 text-left mb-28">
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

        {/* Unified Feature Explorer Map */}
        <div className="w-full mb-28">
          <FeatureMap />
        </div>

        {/* Local Setup Section */}
        <div id="setup-section" className="w-full py-16 border-t border-zinc-850 text-left mb-28 scroll-mt-20">
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

        {/* Why DomoNote / Foundations */}
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

        {/* Final Launch Callout Card */}
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

          <div className="flex items-center gap-3 shrink-0">
            <Button variant="primary" size="lg" onClick={() => setActiveView('dashboard')}>
              <span>Open DomoNote</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
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
              onClick={() => setActiveView('dashboard')}
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
