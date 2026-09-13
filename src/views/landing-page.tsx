import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../context/workspace-context';
import { Button } from '../components/ui/button';
import { SpotlightCard } from '../components/ui/spotlight';
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
} from 'lucide-react';
import { GithubIcon } from '../components/ui/github-icon';
import logoImg from '../assets/domodomo.png';

const TYPING_PHRASES = [
  'Summarize this meeting...',
  'Explain this document...',
  'Turn this into steps...',
  'Extract actionable items...',
  'Generate an operation manual...',
];

export const LandingPage: React.FC = () => {
  const { setActiveView } = useWorkspace();

  const [phraseIdx, setPhraseIdx] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = TYPING_PHRASES[phraseIdx];
    let timeout: any;

    if (!isDeleting && displayedText === current) {
      timeout = setTimeout(() => setIsDeleting(true), 1800);
    } else if (isDeleting && displayedText === '') {
      setIsDeleting(false);
      setPhraseIdx((prev) => (prev + 1) % TYPING_PHRASES.length);
    } else {
      const speed = isDeleting ? 30 : 60;
      timeout = setTimeout(() => {
        setDisplayedText((prev) =>
          isDeleting ? current.substring(0, prev.length - 1) : current.substring(0, prev.length + 1)
        );
      }, speed);
    }

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, phraseIdx]);

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-zinc-800 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-zinc-850 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="DomoNote" className="w-8 h-8 rounded object-contain" />
          <span className="font-bold text-sm tracking-tight text-white">DomoNote</span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/darknecrocities/DomoNote"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>
          <Button variant="primary" size="sm" onClick={() => setActiveView('dashboard')}>
            <span>Open DomoNote</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-6 pt-20 pb-16 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 mb-8 select-none">
          <Shield className="w-3.5 h-3.5 text-zinc-400" />
          <span>Local-first AI workspace. Zero cloud telemetry.</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Capture it. Understand it. Keep it.
        </h1>

        <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          A local-first workspace for meetings, documents, notes, and the computer operations that
          happen between them. Powered by your local Ollama models.
        </p>

        {/* Interactive Typing Hero Card */}
        <div className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-xl p-4 shadow-2xl mb-10 flex items-center justify-between text-left font-mono text-xs text-zinc-300">
          <div className="flex items-center gap-2 truncate">
            <span className="text-zinc-500">{'>'}</span>
            <span className="text-white">{displayedText}</span>
            <span className="w-1.5 h-4 bg-zinc-400 inline-block animate-pulse" />
          </div>
          <span className="text-[10px] text-zinc-500 shrink-0 uppercase tracking-wider pl-2">
            Local Ollama
          </span>
        </div>

        {/* Primary Hero Actions */}
        <div className="flex items-center gap-3 mb-24">
          <Button variant="primary" size="lg" onClick={() => setActiveView('dashboard')}>
            <span>Open Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              window.open('https://github.com/darknecrocities/DomoNote', '_blank');
            }}
          >
            <GithubIcon className="w-4 h-4" />
            <span>View Source</span>
          </Button>
        </div>

        {/* How It Works Flow (Pipeline) */}
        <div className="w-full py-12 border-t border-zinc-850 mb-20 text-left">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Architecture & Flow
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
              How DomoNote Operates
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-5 space-y-2">
              <span className="text-xs font-mono font-bold text-zinc-400">01 / CAPTURE</span>
              <h3 className="text-sm font-semibold text-zinc-100">Meetings & Screens</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Browser audio, live speech, uploaded PDFs, and screen states captured explicitly.
              </p>
            </div>

            <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-5 space-y-2">
              <span className="text-xs font-mono font-bold text-zinc-400">02 / UNDERSTAND</span>
              <h3 className="text-sm font-semibold text-zinc-100">Local AI Intelligence</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Local Ollama models process transcripts, PDFs, and screenshots with zero data leakage.
              </p>
            </div>

            <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-5 space-y-2">
              <span className="text-xs font-mono font-bold text-zinc-400">03 / ORGANIZE</span>
              <h3 className="text-sm font-semibold text-zinc-100">IndexedDB Storage</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Structured notes, timelines, coordinate annotations, and revisions persisted locally.
              </p>
            </div>

            <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-5 space-y-2">
              <span className="text-xs font-mono font-bold text-zinc-400">04 / CREATE</span>
              <h3 className="text-sm font-semibold text-zinc-100">Manuals & Syntheses</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Finished SOP manuals, executive summaries, and action checklists exportable to PDF.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Grid with Spotlight & Tilt */}
        <div className="w-full text-left mb-24">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Core Capabilities
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
              Engineered for Serious Work
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SpotlightCard enableTilt>
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 mb-4">
                <Mic className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-100 mb-2">Meeting Secretary</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Real microphone and Google Meet tab audio recording with live speech recognition,
                milestone timeline jumps, and factual decision extraction.
              </p>
              <span className="text-[11px] font-medium text-zinc-300">Live waveform & timeline</span>
            </SpotlightCard>

            <SpotlightCard enableTilt>
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 mb-4">
                <FileUp className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-100 mb-2">Document Intelligence</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Native PDF.js canvas viewer, coordinate-anchored annotations, text selection AI
                actions, and procedural "Turn into Steps" conversion.
              </p>
              <span className="text-[11px] font-medium text-zinc-300">In-browser PDF reader</span>
            </SpotlightCard>

            <SpotlightCard enableTilt>
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 mb-4">
                <Video className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-100 mb-2">Operation Manuals</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Capture screen states during computer operations, generate instructional steps,
                reorder sequences, and export finished manuals to PDF and Markdown.
              </p>
              <span className="text-[11px] font-medium text-zinc-300">SOP manual builder</span>
            </SpotlightCard>
          </div>
        </div>

        {/* Local AI & Privacy Callout */}
        <div className="w-full bg-zinc-950 border border-zinc-850 rounded-2xl p-8 sm:p-12 text-left flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-20">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 uppercase tracking-wider mb-3">
              <Cpu className="w-3 h-3" />
              <span>Ollama Native</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
              Privacy First. Zero Cloud Telemetry.
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your notes, transcripts, and documents remain 100% in your local IndexedDB storage.
              AI requests connect directly to your local Ollama port without passing through any
              intermediary servers.
            </p>
          </div>

          <Button variant="primary" size="md" onClick={() => setActiveView('dashboard')}>
            <span>Launch DomoNote</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-850 py-8 px-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-300">DomoNote</span>
            <span>•</span>
            <span>Local-first AI Workspace</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <button onClick={() => setActiveView('privacy')} className="hover:text-white">
              Privacy
            </button>
            <button onClick={() => setActiveView('about')} className="hover:text-white">
              About
            </button>
            <a
              href="https://github.com/darknecrocities/DomoNote"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
