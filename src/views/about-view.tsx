import React, { useState } from 'react';
import { ExternalLink, RotateCcw, Sparkles, Video, CheckCircle } from 'lucide-react';
import { GithubIcon } from '../components/ui/github-icon';
import { PandaMascot } from '../components/ui/panda-mascot';
import logoImg from '../assets/domodomo.png';
import demoWalkthrough from '../assets/domonote-demo.webp';

export const AboutView: React.FC = () => {
  const [key, setKey] = useState(0);

  const handleRestart = () => {
    setKey((prev) => prev + 1);
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
              Local-first notes, meetings, and documents.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com/darknecrocities/DomoNote"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-white bg-zinc-900 border border-zinc-850 px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>GitHub Repository</span>
            <ExternalLink className="w-3 h-3 text-zinc-500" />
          </a>
        </div>
      </div>

      <div className="space-y-10 text-xs text-zinc-300 leading-relaxed">
        {/* Product Demo Video Section */}
        <section className="rounded-2xl border border-zinc-850 bg-zinc-950 overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-zinc-850 flex items-center justify-between bg-zinc-900/40">
            <div className="flex items-center gap-2 text-white text-xs">
              <Video className="w-4 h-4 text-zinc-400" />
              <span className="font-semibold">Product Walkthrough</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRestart}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition-colors"
                title="Replay product demo"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Replay</span>
              </button>
            </div>
          </div>

          <div className="relative bg-black flex items-center justify-center p-2">
            <img
              key={key}
              src={demoWalkthrough}
              alt="DomoNote Product Walkthrough"
              className="w-full max-h-[520px] object-contain rounded-lg shadow-inner"
            />
          </div>

          <div className="p-4 border-t border-zinc-850 bg-zinc-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-zinc-400 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full product walkthrough: Notes, Meetings, Documents, Zen Mode & Mascot</span>
            </div>
            <div className="text-zinc-500 text-xs">
              Runs entirely on your device with no data sent outside.
            </div>
          </div>
        </section>

        {/* Mascot Showcase Section */}
        <section className="bg-zinc-950 border border-zinc-850 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
              <Sparkles className="w-3 h-3 text-zinc-400" />
              <span>Focus Companion</span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Meet DomoNote's Panda Companion
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Designed in a clean, minimal black-and-white style. The panda sits quietly taking notes in
              your Zen focus workspace, reacting as you type and keeping track of your session without distractions.
            </p>
            <div className="text-xs text-zinc-500">
              Click the panda to cycle focus tips. Open Zen mode with Cmd/Ctrl + Shift + N.
            </div>
          </div>

          <div className="shrink-0 flex items-center justify-center">
            <PandaMascot size="lg" message="I keep your notes private and safe locally." />
          </div>
        </section>

        {/* Concept & Purpose */}
        <section className="bg-zinc-950 border border-zinc-850 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white tracking-tight uppercase tracking-wider">
            What is DomoNote?
          </h3>
          <p className="leading-relaxed">
            DomoNote is an open-source, local-first workspace designed to capture, organize, and synthesize
            what happens across your meetings, documents, and notes.
          </p>
          <p className="text-zinc-400 leading-relaxed">
            Instead of storing your information on third-party cloud servers, DomoNote operates
            entirely inside your browser and local machine. It combines a distraction-free markdown notes editor,
            an automated meeting secretary, a multi-format document reader (PDF, DOCX, PPTX, TXT), and a step-by-step
            guide generator.
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
          <ul className="space-y-2 text-zinc-400 text-xs">
            <li>• Frontend: React 18, TypeScript 5, Vite 6, Tailwind CSS</li>
            <li>• Audio: Web Audio API sound synthesizer</li>
            <li>• Local Storage: IndexedDB via Dexie</li>
            <li>• Local Intelligence: Ollama REST API (streaming generate and chat)</li>
            <li>• Document Ingestion: PDF.js, Mammoth (.docx), JSZip (.pptx)</li>
            <li>• Audio Processing: Web Audio API and MediaRecorder</li>
            <li>• Screen Recording: Standard Navigator MediaDevices DisplayMedia</li>
            <li>• Deployment: Static client-side Single Page Application</li>
          </ul>
        </section>
      </div>
    </div>
  );
};
