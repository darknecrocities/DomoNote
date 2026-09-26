import React, { useState } from 'react';
import { ExternalLink, Sparkles, Star, ArrowUpCircle } from 'lucide-react';
import { GithubIcon } from '../components/ui/github-icon';
import { PandaMascot } from '../components/ui/panda-mascot';
import { TiltCard } from '../components/ui/tilt-card';
import { useGitHubStars } from '../services/github/stars';
import logoImg from '../assets/official_domonote.png';
import { checkForUpdates, type UpdateInfo } from '../services/updates/update-checker';

const APP_VERSION = '1.0.0';

export const AboutView: React.FC = () => {
  const { starCount } = useGitHubStars();
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckUpdates = async () => {
    setIsChecking(true);
    try {
      const info = await checkForUpdates(APP_VERSION, true);
      setUpdateInfo(info);
    } finally {
      setIsChecking(false);
    }
  };
  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-black text-slate-900 dark:text-white p-8 overflow-y-auto max-w-5xl mx-auto w-full select-none font-sans transition-colors duration-500">
      {/* Brand Header */}
      <div className="border-b border-slate-200 dark:border-zinc-850 pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img src={logoImg} alt="DomoNote" className="w-12 h-12 rounded-xl object-contain shadow-sm" />
          <div>
            <h1 className="text-2xl font-bold text-slate-950 dark:text-white tracking-tight">About DomoNote</h1>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
              Your Personal AI Secretary for meetings, notes, and documents.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com/darknecrocities/DomoNote"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-slate-900 dark:text-white bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 px-3 py-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors font-medium shadow-xs group"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>GitHub</span>
            <span className="flex items-center gap-1 font-mono text-[11px] text-amber-500">
              <Star className="w-3 h-3 fill-amber-500" />
              <span>{starCount !== null ? starCount.toLocaleString() : 'Star'}</span>
            </span>
            <ExternalLink className="w-3 h-3 text-slate-500 dark:text-zinc-500" />
          </a>
        </div>
      </div>

      <div className="space-y-10 text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">


        {/* Mascot Showcase Section */}
        <section className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-8 shadow-xs dark:shadow-xl transition-colors duration-500">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300 font-medium">
              <Sparkles className="w-3 h-3 text-slate-500 dark:text-zinc-400" />
              <span>Focus Companion</span>
            </div>
            <h3 className="text-lg font-bold text-slate-950 dark:text-white tracking-tight">
              Meet DomoNote's Panda Companion
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              Designed in a clean, minimal black-and-white style. The panda sits quietly taking notes in
              your Domo Notes workspace, reacting as you type and keeping track of your session without distractions.
            </p>
            <div className="text-xs text-slate-500 dark:text-zinc-500">
              Your distraction-free companion. Open Domo Notes with Cmd/Ctrl + Shift + N.
            </div>
          </div>

          <div className="shrink-0 flex items-center justify-center">
            <PandaMascot size="lg" />
          </div>
        </section>

        {/* Concept & Purpose */}
        <section className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-2xl p-6 space-y-4 shadow-xs dark:shadow-none transition-colors duration-500">
          <h3 className="text-sm font-bold text-slate-950 dark:text-white tracking-tight uppercase tracking-wider">
            What is DomoNote?
          </h3>
          <p className="leading-relaxed text-slate-800 dark:text-zinc-300">
            DomoNote is an open-source, local-first workspace designed to capture, organize, and synthesize
            what happens across your meetings, documents, and notes.
          </p>
          <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
            Instead of storing your information on third-party cloud servers, DomoNote operates
            entirely inside your browser and local machine. It combines a distraction-free markdown notes editor,
            an automated meeting secretary, a multi-format document reader (PDF, DOCX, PPTX, TXT), and a step-by-step
            guide generator.
          </p>
        </section>

        {/* Domo Open Source Ecosystem */}
        <section className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-2xl p-6 space-y-4 shadow-xs dark:shadow-none transition-colors duration-500">
          <h3 className="text-sm font-bold text-slate-950 dark:text-white tracking-tight uppercase tracking-wider">
            Domo Open Source Ecosystem
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TiltCard maxTilt={5} scale={1.02} className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800">
              <div className="font-bold text-slate-950 dark:text-zinc-100 text-sm">DomoNote</div>
              <p className="text-slate-600 dark:text-zinc-400 text-xs mt-1 leading-relaxed">
                Local-first AI note-taking, meetings, documents, and operational memory.
              </p>
            </TiltCard>
            <TiltCard maxTilt={5} scale={1.02} className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800">
              <div className="font-bold text-slate-950 dark:text-zinc-100 text-sm">DomoDomo</div>
              <p className="text-slate-600 dark:text-zinc-400 text-xs mt-1 leading-relaxed">
                General local-first developer toolbox and utilities.
              </p>
            </TiltCard>
            <TiltCard maxTilt={5} scale={1.02} className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800">
              <div className="font-bold text-slate-950 dark:text-zinc-100 text-sm">DomoSkills</div>
              <p className="text-slate-600 dark:text-zinc-400 text-xs mt-1 leading-relaxed">
                Autonomous agent skills, capabilities, and system cheatsheets.
              </p>
            </TiltCard>
            <TiltCard maxTilt={5} scale={1.02} className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800">
              <div className="font-bold text-slate-950 dark:text-zinc-100 text-sm">Codepyne</div>
              <p className="text-slate-600 dark:text-zinc-400 text-xs mt-1 leading-relaxed">
                AI engineering education and hands-on learning resources.
              </p>
            </TiltCard>
          </div>
        </section>

        {/* Version & Updates */}
        <section className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-2xl p-6 space-y-3 shadow-xs dark:shadow-none transition-colors duration-500">
          <h3 className="text-sm font-bold text-slate-950 dark:text-white tracking-tight uppercase tracking-wider">
            Version & Updates
          </h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs text-slate-500 dark:text-zinc-500 font-semibold uppercase tracking-wider">Installed Version</div>
              <div className="text-2xl font-bold font-mono text-slate-950 dark:text-white">v{APP_VERSION}</div>
              {updateInfo && (
                <div className={`text-xs font-medium mt-1 ${updateInfo.updateAvailable ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {updateInfo.updateAvailable
                    ? `${updateInfo.latestVersion} is available on GitHub`
                    : 'You are up to date'}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCheckUpdates}
                disabled={isChecking}
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 px-3 py-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 shadow-xs"
              >
                <ArrowUpCircle className="w-3.5 h-3.5" />
                {isChecking ? 'Checking…' : 'Check for Updates'}
              </button>
              {updateInfo && updateInfo.updateAvailable && (
                <a
                  href={updateInfo.releaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Release
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Technology Foundation */}
        <section className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-2xl p-6 space-y-3 shadow-xs dark:shadow-none transition-colors duration-500">
          <h3 className="text-sm font-bold text-slate-950 dark:text-white tracking-tight uppercase tracking-wider">
            Technology Foundation
          </h3>
          <ul className="space-y-2 text-slate-600 dark:text-zinc-400 text-xs">
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
