import React, { useState } from 'react';
import { useWorkspace } from '../context/workspace-context';
import { useSound } from '../context/sound-context';
import { SEOPageItem, SEO_PAGES, SEO_GROUPS } from '../data/seo-catalog';
import { Button } from '../components/ui/button';
import {
  Mic,
  FileText,
  Shield,
  Download,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Cpu,
  Lock,
  Layers,
  Sparkles,
  ExternalLink,
  Laptop
} from 'lucide-react';
import logoImg from '../assets/official_domonote.png';
import pandaImg from '../assets/panda-mascot.png';
import { recordAppDownload } from '../services/stats';

interface SEOContentViewProps {
  page: SEOPageItem;
}

export const SEOContentView: React.FC<SEOContentViewProps> = ({ page }) => {
  const { setActiveView } = useWorkspace();
  const { playPop, playThock } = useSound();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    playPop();
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  // Find 4 related pages in the same category or across other categories
  const relatedPages = SEO_PAGES.filter((p) => p.slug !== page.slug && (p.category === page.category || p.category === 'features')).slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-zinc-100 flex flex-col selection:bg-zinc-800 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-black/80 border-b border-slate-200 dark:border-zinc-850 px-6 py-3.5 transition-colors">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div
            onClick={() => {
              playPop();
              setActiveView('landing');
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <img src={logoImg} alt="DomoNote Logo" className="w-8 h-8 rounded-lg object-contain shadow-xs group-hover:scale-105 transition-transform" />
            <div>
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">DomoNote</span>
              <span className="hidden sm:inline-block ml-2 text-xs text-slate-500 dark:text-zinc-400 font-mono">/ {page.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                playPop();
                setActiveView('landing');
              }}
              className="text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 transition-colors"
            >
              Home
            </button>
            <Button
              variant="primary"
              size="sm"
              className="text-xs bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-zinc-200 font-medium shadow-xs"
              onClick={() => {
                playThock();
                recordAppDownload(`seo-topbar-${page.slug}`);
                setActiveView('download');
              }}
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download Free
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 md:py-16">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-slate-500 dark:text-zinc-500 flex items-center gap-1.5 font-mono">
          <button
            onClick={() => {
              playPop();
              setActiveView('landing');
            }}
            className="hover:text-slate-800 dark:hover:text-zinc-300 transition-colors"
          >
            Home
          </button>
          <span>/</span>
          <span className="capitalize">{page.category}</span>
          <span>/</span>
          <span className="text-slate-900 dark:text-zinc-200 font-medium truncate max-w-xs">{page.name}</span>
        </nav>

        {/* Hero Section */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Shield className="w-3.5 h-3.5" />
            <span>{page.badge}</span>
            <span>• 100% Local</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            {page.name}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400 leading-relaxed">
            {page.summary}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="lg"
              className="bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-zinc-200 font-semibold shadow-md"
              onClick={() => {
                playThock();
                recordAppDownload(`seo-hero-${page.slug}`);
                setActiveView('download');
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Download DomoNote
              <ArrowRight className="w-4 h-4 ml-1.5 opacity-70" />
            </Button>

            <button
              onClick={() => {
                playPop();
                setActiveView('landing');
              }}
              className="px-4 py-2.5 rounded-lg text-sm font-medium border border-slate-300 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"
            >
              Explore Web Demo
            </button>
          </div>
        </div>

        {/* Technical Highlights Grid */}
        <section className="mt-14 pt-10 border-t border-slate-200 dark:border-zinc-850">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono text-xs">
              Key Architecture & Capabilities
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {page.highlights.map((h, i) => (
              <div
                key={i}
                className="p-5 rounded-xl border border-slate-200 dark:border-zinc-850 bg-white dark:bg-zinc-950/60 shadow-xs hover:border-slate-300 dark:hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-slate-800 dark:text-zinc-200 font-mono text-xs font-semibold">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">{h.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-normal">{h.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Steps Walkthrough (if available) */}
        {page.steps && page.steps.length > 0 && (
          <section className="mt-14 pt-10 border-t border-slate-200 dark:border-zinc-850">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider font-mono text-xs">
              How It Operates On Your Device
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {page.steps.map((s, idx) => (
                <div key={idx} className="p-5 rounded-xl border border-slate-200 dark:border-zinc-850 bg-white dark:bg-zinc-950/40">
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">{s.step}</span>
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white mt-1 mb-1.5">{s.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Mascot / Offline Guarantee Banner */}
        <section className="mt-14 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-gradient-to-r from-slate-100 via-slate-50 to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-black flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img src={pandaImg} alt="Domo Mascot" className="w-16 h-16 object-contain shrink-0" />
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Strict Hardware Privacy Guarantee</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-lg mt-0.5">
                DomoNote contains zero analytics pixels, zero cloud tracking, and zero hidden network pings. All processing runs through Ollama and browser IndexedDB.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              playThock();
              setActiveView('privacy');
            }}
            className="shrink-0 text-xs border-slate-300 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-800"
          >
            Read Privacy Architecture
          </Button>
        </section>

        {/* Frequently Asked Questions (FAQ) with Accordion */}
        {page.faqs && page.faqs.length > 0 && (
          <section className="mt-14 pt-10 border-t border-slate-200 dark:border-zinc-850">
            <div className="flex items-center gap-2 mb-6">
              <HelpCircle className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono text-xs">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-3">
              {page.faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="border border-slate-200 dark:border-zinc-850 rounded-xl overflow-hidden bg-white dark:bg-zinc-950/40 transition-colors"
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full text-left p-4 sm:p-4.5 flex items-center justify-between gap-4 font-medium text-sm text-slate-900 dark:text-zinc-100 hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors"
                    >
                      <span>{faq.question}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-400 dark:text-zinc-500 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 dark:text-zinc-500 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4.5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed border-t border-slate-100 dark:border-zinc-900">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Related Pages Cross-Linking Grid */}
        {relatedPages.length > 0 && (
          <section className="mt-16 pt-10 border-t border-slate-200 dark:border-zinc-850">
            <h2 className="text-xs uppercase font-mono font-bold tracking-wider text-slate-500 dark:text-zinc-500 mb-4">
              Related Capabilities & Solutions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {relatedPages.map((rel) => (
                <a
                  key={rel.slug}
                  href={rel.path}
                  onClick={(e) => {
                    e.preventDefault();
                    playPop();
                    window.history.pushState({ view: rel.path }, '', rel.path);
                    window.dispatchEvent(new PopStateEvent('popstate', { state: { view: rel.path } }));
                  }}
                  className="p-3.5 rounded-lg border border-slate-200 dark:border-zinc-850 bg-white dark:bg-zinc-950/30 hover:border-slate-400 dark:hover:border-zinc-700 transition-all block group"
                >
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 uppercase">{rel.category}</span>
                  <h4 className="font-semibold text-xs text-slate-900 dark:text-white mt-0.5 line-clamp-1 group-hover:text-emerald-500 transition-colors">
                    {rel.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-snug">
                    {rel.description}
                  </p>
                </a>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Directory Footer */}
      <footer className="border-t border-slate-200 dark:border-zinc-850 py-12 px-6 bg-slate-100 dark:bg-black text-slate-500 dark:text-zinc-500 text-xs">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {SEO_GROUPS.map((g) => (
              <div key={g.id} className="space-y-2">
                <h5 className="font-bold text-xs font-mono text-slate-900 dark:text-zinc-200 uppercase tracking-wider">{g.label}</h5>
                <ul className="space-y-1.5">
                  {g.items.slice(0, 6).map((item) => (
                    <li key={item.slug}>
                      <a
                        href={item.path}
                        onClick={(e) => {
                          e.preventDefault();
                          playPop();
                          window.history.pushState({ view: item.path }, '', item.path);
                          window.dispatchEvent(new PopStateEvent('popstate', { state: { view: item.path } }));
                        }}
                        className="hover:text-slate-900 dark:hover:text-white transition-colors truncate block max-w-[200px]"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={logoImg} alt="DomoNote" className="w-5 h-5 rounded-sm object-contain" />
              <span className="font-bold text-slate-900 dark:text-white">DomoNote</span>
              <span>— Privacy-First Personal AI Secretary</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <button onClick={() => setActiveView('landing')} className="hover:text-slate-900 dark:hover:text-white">Home</button>
              <button onClick={() => setActiveView('download')} className="hover:text-slate-900 dark:hover:text-white">Downloads</button>
              <button onClick={() => setActiveView('privacy')} className="hover:text-slate-900 dark:hover:text-white">Privacy Guarantee</button>
              <a href="https://github.com/darknecrocities/DomoNote" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-white">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
