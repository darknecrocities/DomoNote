import React from 'react';
import { Shield, Cpu, Database, ExternalLink } from 'lucide-react';
import { GithubIcon } from '../components/ui/github-icon';
import logoImg from '../assets/domodomo.png';

export const AboutView: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col h-full bg-black p-8 overflow-y-auto max-w-4xl mx-auto w-full select-none">
      <div className="border-b border-zinc-850 pb-5 mb-8 flex items-center gap-4">
        <img src={logoImg} alt="DomoNote" className="w-12 h-12 rounded-xl object-contain" />
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">DomoNote</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Local-First AI Knowledge Workspace • Version 0.1.0
          </p>
        </div>
      </div>

      <div className="space-y-8 text-xs text-zinc-300 leading-relaxed">
        {/* Concept */}
        <section className="bg-zinc-950 border border-zinc-850 rounded-xl p-6 space-y-3">
          <h3 className="text-sm font-semibold text-white tracking-tight uppercase tracking-wider">
            What is DomoNote?
          </h3>
          <p>
            DomoNote is an open-source, local-first workspace designed to capture, understand, and
            synthesize what happens across meetings, documents, computer operations, and notes.
          </p>
          <p className="text-zinc-400">
            Instead of dispersing information across closed SaaS products, DomoNote operates
            entirely inside your browser and local machine. It combines the functions of a modern
            markdown notes app, an automated meeting secretary, an interactive PDF document reader, and
            a step-by-step standard operating procedure (SOP) generator.
          </p>
        </section>

        {/* Domo Ecosystem */}
        <section className="bg-zinc-950 border border-zinc-850 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white tracking-tight uppercase tracking-wider">
            Domo Open Source Ecosystem
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
              <div className="font-semibold text-zinc-100">DomoNote</div>
              <p className="text-zinc-400 text-[11px] mt-1">
                Local-first AI note-taking, meetings, documents, and operational memory.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
              <div className="font-semibold text-zinc-100">DomoDomo</div>
              <p className="text-zinc-400 text-[11px] mt-1">
                General local-first developer toolbox and utilities.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
              <div className="font-semibold text-zinc-100">DomoSkills</div>
              <p className="text-zinc-400 text-[11px] mt-1">
                Autonomous agent skills, capabilities, and system cheatsheets.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
              <div className="font-semibold text-zinc-100">Codepyne</div>
              <p className="text-zinc-400 text-[11px] mt-1">
                AI engineering education and hands-on learning resources.
              </p>
            </div>
          </div>
        </section>

        {/* Technology */}
        <section className="bg-zinc-950 border border-zinc-850 rounded-xl p-6 space-y-3">
          <h3 className="text-sm font-semibold text-white tracking-tight uppercase tracking-wider">
            Technology Foundation
          </h3>
          <ul className="space-y-1.5 text-zinc-400 font-mono text-[11px]">
            <li>• Frontend: React 18, TypeScript, Vite 6, Tailwind CSS</li>
            <li>• Local Storage: IndexedDB via Dexie 4</li>
            <li>• Local Intelligence: Ollama REST API (streaming generate & chat)</li>
            <li>• PDF Engine: PDF.js (pdfjs-dist)</li>
            <li>• Audio Processing: Web Audio API & MediaRecorder</li>
            <li>• Architecture: Fully deployable to Vercel as a client-side SPA</li>
          </ul>
        </section>

        {/* Open Source */}
        <section className="bg-zinc-950 border border-zinc-850 rounded-xl p-6 space-y-3">
          <h3 className="text-sm font-semibold text-white tracking-tight uppercase tracking-wider">
            Open Source & License
          </h3>
          <p className="text-zinc-400">
            DomoNote is released under the MIT License. Contributions, feedback, and bug reports
            are welcome on GitHub.
          </p>
          <div>
            <a
              href="https://github.com/darknecrocities/DomoNote"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-md hover:bg-zinc-800 transition-colors"
            >
              <GithubIcon className="w-4 h-4" />
              <span>darknecrocities/DomoNote</span>
              <ExternalLink className="w-3 h-3 text-zinc-500" />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};
