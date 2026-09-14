import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useWorkspace } from '../context/workspace-context';
import { useSound } from '../context/sound-context';
import { useLanguage } from '../context/language-context';
import { useTheme } from '../context/theme-context';
import { LanguageSwitcher } from '../components/ui/language-switcher';
import { ThemeToggle } from '../components/ui/theme-toggle';
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
  Star,
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
import { SectionConstellation } from '../components/landing/section-constellation';
import { InteractiveFeatureDemo } from '../components/landing/interactive-feature-demo';
import pandaImg from '../assets/panda-mascot.png';
import logoImg from '../assets/domodomo.png';

const TYPEWRITER_PHRASES: Record<string, string[]> = {
  en: [
    'Transcribed & summarized offline.',
    'Captured & annotated on device.',
    'Organized into clear notes.',
    'Powered by your local AI.',
    'Private, offline, and secure.',
  ],
  zh: [
    '离线实时转写与智能总结。',
    '设备端自动捕获与步骤标注。',
    '系统化整理为持久笔记。',
    '由您的本地 AI 深度驱动。',
    '绝对私密、离线且安全。',
  ],
  ja: [
    'オフラインで書き起こし・要約。',
    '端末上で自動画面キャプチャ＆注釈。',
    '整理されたクリアなノートに集約。',
    'ローカル AI による高速推論。',
    '完全プライベート・オフライン・安全。',
  ],
  fr: [
    'Transcrit et résumé hors ligne.',
    'Capturé et annoté sur votre appareil.',
    'Organisé en notes limpides.',
    'Propulsé par votre IA locale.',
    'Privé, hors ligne et sécurisé.',
  ],
};

const MASCOT_MESSAGES: Record<string, string[]> = {
  en: [
    'All notes, recordings, and documents stay 100% private on your machine.',
    'Local AI runs directly on your computer hardware via Ollama.',
    'Upload PDF, Word (DOCX), PowerPoint (PPTX), or TXT for instant AI summaries!',
    'Private and local-first by design — runs entirely on your device.',
    'Click me again for more tips!',
  ],
  zh: [
    '所有笔记、录音和文档 100% 私密保存在您的计算机中。',
    '本地 AI 通过 Ollama 直接在您的计算机硬件上运行。',
    '支持上传 PDF、Word、PPT 或 TXT，即时生成本地 AI 摘要！',
    '原生本地优先设计——完全在您的设备上运行。',
    '再次点击我获取更多技巧！',
  ],
  ja: [
    'すべてのノート、録音、ドキュメントは 100% お使いの端末内に保持されます。',
    'ローカル AI は Ollama を介して PC ハードウェア上で直接実行されます。',
    'PDF、Word、PPT、テキストをアップロードして即時 AI 要約！',
    'プライベート＆ローカルファースト設計 — 端末内で完結。',
    'もう一度クリックすると次のヒントを表示します！',
  ],
  fr: [
    'Toutes vos notes, enregistrements et documents restent 100% privés sur votre machine.',
    'L\'IA locale s\'exécute directement sur votre matériel via Ollama.',
    'Importez des fichiers PDF, Word, PowerPoint ou TXT pour des synthèses instantanées !',
    'Privé et local-first par conception — s\'exécute entièrement sur votre appareil.',
    'Cliquez à nouveau pour d\'autres conseils !',
  ],
};

export const LandingPage: React.FC = () => {
  const { setActiveView, isCloudHost, setIsCloudModalOpen } = useWorkspace();
  const { playPop, playThock } = useSound();
  const { t, language } = useLanguage();
  const { theme } = useTheme();

  const mascotRef = React.useRef<HTMLDivElement>(null);
  const [mascotMsgIdx, setMascotMsgIdx] = useState(0);
  const [showMascotBubble, setShowMascotBubble] = useState(false);
  const [demoMode, setDemoMode] = useState<'interactive' | 'video'>('interactive');
  const [starCount, setStarCount] = useState<number | null>(() => {
    try {
      const cached = sessionStorage.getItem('github_stars_domonote');
      return cached !== null ? parseInt(cached, 10) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    let isMounted = true;
    const fetchStars = async () => {
      try {
        const cached = sessionStorage.getItem('github_stars_domonote');
        if (cached !== null) {
          setStarCount(parseInt(cached, 10));
          return;
        }
        const res = await fetch('https://api.github.com/repos/darknecrocities/DomoNote');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && typeof data.stargazers_count === 'number') {
            setStarCount(data.stargazers_count);
            sessionStorage.setItem('github_stars_domonote', data.stargazers_count.toString());
          }
        }
      } catch (err) {
        console.warn('Failed to fetch github stars', err);
      }
    };
    fetchStars();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenWorkspace = () => {
    if (isCloudHost) {
      setIsCloudModalOpen(true);
    } else {
      setActiveView('dashboard');
    }
  };

  const activeMascotList = MASCOT_MESSAGES[language] || MASCOT_MESSAGES.en;
  const activeTypewriterList = TYPEWRITER_PHRASES[language] || TYPEWRITER_PHRASES.en;

  const carouselPanels = useMemo(
    () => [
      {
        id: 'meetings',
        tag: 'MEETINGS',
        title: t('landing.features.panelMeetingsTitle', 'Voice Recording & Instant Notes'),
        description: t(
          'landing.features.panelMeetingsDesc',
          'Record meetings directly in your browser. Get clear transcripts, highlighted decisions, and structured action items automatically.'
        ),
        meta: 'Audio Recording',
        previewContent: (
          <div className="space-y-2 text-slate-700 dark:text-zinc-300">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800 pb-1.5">
              <span>Weekly Team Sync</span>
              <span className="text-slate-800 dark:text-zinc-300 font-medium">Transcribing</span>
            </div>
            <div className="text-xs text-slate-600 dark:text-zinc-400 font-mono">03:12 speaker: "All documents will be stored locally on device."</div>
            <div className="p-2.5 rounded bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-200">
              <span className="text-[10px] text-slate-500 dark:text-zinc-500 block uppercase font-semibold">Key Decision</span>
              Local-first architecture chosen with zero cloud dependencies.
            </div>
          </div>
        ),
      },
      {
        id: 'documents',
        tag: 'DOCUMENTS',
        title: t('landing.features.panelDocumentsTitle', 'Document Reader & Analysis'),
        description: t(
          'landing.features.panelDocumentsDesc',
          'Upload PDFs, Word docs, presentations, and text files. Ask questions across your documents, highlight passages, and extract summaries.'
        ),
        meta: 'Universal Files',
        previewContent: (
          <div className="space-y-2 text-slate-700 dark:text-zinc-300">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800 pb-1.5">
              <span>Architecture Spec • Page 4</span>
              <span>Stored Locally</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-xs flex items-center justify-center shrink-0">
                01
              </span>
              <span className="text-xs text-slate-800 dark:text-zinc-200">Run database migrations before starting the application</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-zinc-500">Summary note saved directly to your workspace</div>
          </div>
        ),
      },
      {
        id: 'operations',
        tag: 'GUIDES',
        title: t('landing.features.panelOperationsTitle', 'Screen Recording & Step Manuals'),
        description: t(
          'landing.features.panelOperationsDesc',
          'Record your screen during complex workflows. DomoNote extracts screenshots, captures steps, and builds a standard operating manual.'
        ),
        meta: 'Step Manuals',
        previewContent: (
          <div className="space-y-2 text-slate-700 dark:text-zinc-300">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-850 pb-1.5">
              <span>Standard Operating Procedure</span>
              <span>Export: PDF & Markdown</span>
            </div>
            <div className="text-xs text-slate-800 dark:text-zinc-300 font-medium">Step 1: Check server health and memory</div>
            <div className="text-xs text-slate-800 dark:text-zinc-300 font-medium">Step 2: Deploy update with 10% canary traffic</div>
            <div className="text-xs text-slate-500 dark:text-zinc-500">3 screenshots captured • 2 action steps</div>
          </div>
        ),
      },
      {
        id: 'ai',
        tag: 'LOCAL AI',
        title: t('landing.features.panelAiTitle', 'Private AI Assistant'),
        description: t(
          'landing.features.panelAiDesc',
          'Run AI models completely on your computer with Ollama. Ask questions across your notes, meetings, and documents without sending data to third parties.'
        ),
        meta: '100% Offline',
        previewContent: (
          <div className="space-y-2 text-slate-700 dark:text-zinc-300">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-850 pb-1.5">
              <span>Local Assistant</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Ready</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-zinc-400">Attached: [SprintPlan.pdf] [TeamSync]</div>
            <p className="text-xs text-slate-800 dark:text-zinc-200 leading-relaxed">
              "Based on your sprint plan and meeting notes, the project release is scheduled for Friday at 18:00 UTC."
            </p>
          </div>
        ),
      },
      {
        id: 'annotation',
        tag: 'AUTO-ANNOTATE',
        title: t('landing.features.panelAnnotationTitle', 'Dynamic Step-by-Step Auto-Annotation'),
        description: t(
          'landing.features.panelAnnotationDesc',
          'Detects UI elements, sentences, and workflows in real time. Automatically outlines actionable coordinates, captures screenshots, and drafts illustrated guides.'
        ),
        meta: 'Vision Framing',
        previewContent: (
          <div className="space-y-2 text-slate-700 dark:text-zinc-300">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800 pb-1.5">
              <span>Coordinate Detection</span>
              <span className="text-slate-800 dark:text-zinc-300 font-mono text-[11px]">Exact Box: [x:142, y:388]</span>
            </div>
            <div className="p-2.5 rounded bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-750 text-xs text-slate-800 dark:text-zinc-200">
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block uppercase font-semibold">Step 01 • Target Framed</span>
              Exact boundary calculated with border line only and zero inner obscuration.
            </div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-500 font-mono">Auto-compiled into illustrated step manual</div>
          </div>
        ),
      },
      {
        id: 'vault',
        tag: 'STORAGE',
        title: t('landing.features.panelVaultTitle', 'Local IndexedDB Knowledge Vault'),
        description: t(
          'landing.features.panelVaultDesc',
          'All your notes, audio transcripts, and imported books stay strictly inside your browser database. Instant zero-latency search with zero external data transmission.'
        ),
        meta: 'Zero Cloud',
        previewContent: (
          <div className="space-y-2 text-slate-700 dark:text-zinc-300">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800 pb-1.5">
              <span>Client Database Status</span>
              <span className="text-slate-800 dark:text-zinc-300 font-mono text-[11px]">Encrypted IndexedDB</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-950 p-2.5 rounded border border-slate-200 dark:border-zinc-800">
              <span>Local Documents & Audio Recordings</span>
              <span className="font-mono text-slate-900 dark:text-white font-bold">100% On-Device</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-500 font-mono">Zero trackers • Zero cookies • Stays on your machine</div>
          </div>
        ),
      },
      {
        id: 'zen',
        tag: 'WRITING',
        title: t('landing.features.panelZenTitle', 'Distraction-Free Zen Note Sanctuary'),
        description: t(
          'landing.features.panelZenDesc',
          'Immersive dark note editor crafted for clarity and focus. Full Markdown support, version rollbacks, velocity tracking, and ambient acoustic focus soundscapes.'
        ),
        meta: 'Zen Editor',
        previewContent: (
          <div className="space-y-2 text-slate-700 dark:text-zinc-300">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-850 pb-1.5">
              <span>Architecture Notes.md</span>
              <span className="text-slate-500 dark:text-zinc-500 font-mono text-[11px]">1,420 words • Auto-saved</span>
            </div>
            <p className="text-xs text-slate-800 dark:text-zinc-200 font-sans italic">
              "The best notes are the ones written without interruption, stored where you own them forever."
            </p>
          </div>
        ),
      },
    ],
    [t]
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-slate-200 dark:selection:bg-zinc-800 selection:text-slate-900 dark:selection:text-white relative overflow-x-clip transition-colors duration-200">
      {/* Subtle Noise Texture Overlay */}
      <NoiseTexture opacity={0.035} />

      {/* Top Navigation - Sticky Appbar */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#050505]/90 backdrop-blur-md border-b border-slate-200 dark:border-zinc-850 px-6 py-3 transition-all shadow-sm dark:shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="DomoNote" className="w-7 h-7 rounded object-contain" />
            <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">DomoNote</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setActiveView('download')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('common.download', 'Download')}</span>
            </button>

            {/* GitHub Star Count Button */}
            <a
              href="https://github.com/darknecrocities/DomoNote"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-900/90 hover:bg-slate-200 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm group"
              title="Star DomoNote on GitHub"
            >
              <GithubIcon className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
              <span className="font-medium hidden sm:inline">{t('landing.hero.star', 'Star')}</span>
              <span className="h-3 w-[1px] bg-slate-200 dark:bg-zinc-800 hidden sm:inline" />
              <span className="flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-zinc-400 group-hover:text-amber-500 transition-colors">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>{starCount !== null ? starCount.toLocaleString() : 'Star'}</span>
              </span>
            </a>

            {/* Language Switcher Dropdown */}
            <LanguageSwitcher />

            {/* Theme Toggle Button */}
            <ThemeToggle />

            <Button variant="primary" size="sm" onClick={handleOpenWorkspace}>
              <span>{isCloudHost ? t('landing.hero.downloadApp', 'Download App') : t('landing.hero.openWorkspace', 'Open Workspace')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Hero Body */}
      <main className="flex-1 max-w-7xl mx-auto px-6 pt-10 pb-24 relative z-10 w-full">
        {/* 2-Column Hero Section with Interactive 3D Node Network Background */}
        <div className="relative w-full overflow-hidden rounded-3xl">
          <SectionConstellation variant="neural-clusters" mascotExclusionRef={mascotRef} opacity={theme === 'dark' ? 0.88 : 0.4} className="z-0" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center pt-6 pb-20 border-b border-slate-200 dark:border-zinc-850/60 mb-20 relative z-10">
            {/* Left Column: Text Content & Actions */}
            <div className="lg:col-span-6 flex flex-col items-start text-left space-y-6">
              {/* Top Benefit Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300 select-none shadow-sm backdrop-blur-sm">
                <Shield className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                <span className="font-semibold text-slate-900 dark:text-white">{t('landing.hero.benefitPrivate', 'Private & On-Device')}</span>
                <span className="text-slate-400 dark:text-zinc-600">•</span>
                <span className="text-slate-600 dark:text-zinc-400">{t('landing.hero.benefitOffline', 'Runs on Your Computer')}</span>
              </div>

              {/* Hero Headline with Looping Typewriter */}
              <div className="space-y-3">
                <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.05]">
                  {t('landing.hero.headlinePrefix', 'Notes, meetings, and documents.')}
                </h1>
                <div className="text-xl sm:text-3xl lg:text-4xl font-bold text-slate-600 dark:text-zinc-400 tracking-tight h-[2.5rem] sm:h-[3rem] flex items-center overflow-hidden">
                  <LoopingTypewriter
                    key={language}
                    phrases={activeTypewriterList}
                    className="text-slate-800 dark:text-zinc-300 sm:whitespace-nowrap"
                  />
                </div>
              </div>

              {/* Benefit-Focused Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400 max-w-xl leading-relaxed font-normal">
                {t('landing.hero.subheadline', 'Capture meeting audio, read and query documents, record screens with dynamic auto-annotation, and organize notes without cloud servers. Everything stays private on your machine with local Ollama intelligence.')}
              </p>

              {/* Primary Hero Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button variant="primary" size="lg" onClick={handleOpenWorkspace}>
                  <span>{isCloudHost ? t('landing.hero.downloadApp', 'Download Desktop App') : t('landing.hero.openWorkspace', 'Open Workspace')}</span>
                  {isCloudHost ? <Download className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="border-slate-300 dark:border-zinc-800 hover:border-slate-400 dark:hover:border-white/40 text-slate-800 dark:text-white bg-white dark:bg-transparent"
                  onClick={() => setActiveView('download')}
                >
                  <Download className="w-4 h-4 text-slate-500 dark:text-zinc-300" />
                  <span>{t('landing.hero.downloadAll', 'Download (Mac / Win / Linux)')}</span>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="border-slate-300 dark:border-zinc-800 text-slate-800 dark:text-white bg-white dark:bg-transparent"
                  onClick={() => setActiveView('studio')}
                >
                  <Video className="w-4 h-4 text-slate-500 dark:text-zinc-300" />
                  <span>{t('landing.hero.screenStudio', 'Screen Studio')}</span>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="border-slate-300 dark:border-zinc-800 text-slate-800 dark:text-white bg-white dark:bg-transparent"
                  onClick={() => {
                    const el = document.getElementById('demo-video-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <Play className="w-4 h-4 fill-current text-slate-700 dark:text-zinc-300" />
                  <span>{t('landing.demo.watchDemo', 'Watch Demo')}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="lg"
                  className="text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white"
                  onClick={() => {
                    const el = document.getElementById('setup-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <Terminal className="w-4 h-4" />
                  <span>{t('landing.hero.quickSetup', 'Quick Setup')}</span>
                </Button>
              </div>

              {/* Spec / Security Credentials Strip */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-600 dark:text-zinc-400 border-t border-slate-200 dark:border-zinc-850/80 w-full">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                  <span>{t('landing.hero.clientDb', 'Client-Side IndexedDB')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                  <span>{t('landing.hero.autoAnnotation', 'Dynamic Auto-Annotation')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                  <span>{t('landing.hero.zeroCloudLatency', 'Zero Cloud Latency')}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Prominent Large Standalone Mascot */}
            <div className="lg:col-span-6 flex items-center justify-center relative select-none">
              {/* Subtle Ambient Backlight Glow */}
              <div className="absolute w-80 h-80 sm:w-[540px] sm:h-[540px] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.06)_0,transparent_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12)_0,transparent_70%)] pointer-events-none blur-3xl" />

              {/* Standalone Large Mascot with floating animation, hover interaction */}
              <div
                ref={mascotRef}
                className="relative z-10 cursor-pointer transition-transform duration-300 hover:scale-105 group flex flex-col items-center p-4 sm:p-8 rounded-3xl bg-[#09090b] dark:bg-transparent border border-slate-200/90 dark:border-transparent shadow-xl dark:shadow-none"
                onClick={() => {
                  playPop();
                  setMascotMsgIdx((prev: number) => (prev + 1) % activeMascotList.length);
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
                {/* Interactive Speech Reaction Chip */}
                <div
                  className={`absolute -top-12 px-3.5 py-1.5 rounded-full bg-zinc-950/95 border border-zinc-700 text-[11px] font-mono text-zinc-200 shadow-2xl backdrop-blur-md transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap pointer-events-none ${
                    showMascotBubble ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>{activeMascotList[mascotMsgIdx % activeMascotList.length]}</span>
                </div>

                <img
                  src="/domoreading.gif"
                  alt="DomoNote Mascot Reading"
                  className="w-[340px] sm:w-[480px] md:w-[560px] lg:w-[620px] xl:w-[680px] max-w-full h-auto object-contain rounded-2xl filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_25px_60px_rgba(255,255,255,0.15)] animate-float"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Product Demo Video Showcase with Quantum Lattice Constellation */}
        <ScrollReveal direction="up" delayMs={50}>
          <div id="demo-video-section" className="w-full py-10 text-left mb-28 scroll-mt-20 relative overflow-hidden rounded-3xl px-2 sm:px-4">
            <SectionConstellation variant="quantum-lattice" opacity={theme === 'dark' ? 0.55 : 0.25} />
            <div className="relative z-10">
              <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                    {t('landing.demo.badge', 'Interactive Live Demo')}
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                    {t('landing.demo.title', 'See DomoNote in action')}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-zinc-400 mt-2 max-w-2xl leading-relaxed">
                    {t('landing.demo.description', 'Explore real-time call speech recording, local AI summarizing with Ollama, dynamic border-only document annotation, and structured meeting notes—all running locally on your device.')}
                  </p>
                </div>

                {/* View Switcher: Interactive Studio vs Full Walkthrough */}
                <div className="flex items-center gap-2 shrink-0 bg-slate-100 dark:bg-zinc-900/80 p-1 rounded-xl border border-slate-200 dark:border-zinc-800">
                  <button
                    onClick={() => setDemoMode('interactive')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      demoMode === 'interactive'
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-md'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {t('landing.demo.interactiveStudio', 'Interactive Studio')}
                  </button>
                  <button
                    onClick={() => setDemoMode('video')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      demoMode === 'video'
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-md'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {t('landing.demo.walkthroughVideo', 'Walkthrough Video')}
                  </button>
                </div>
              </div>

              {/* Interactive Demo Studio or Video Frame */}
              {demoMode === 'interactive' ? (
                <InteractiveFeatureDemo onOpenWorkspace={handleOpenWorkspace} />
              ) : (
                <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-xl dark:shadow-2xl animate-fade-in">
                  <div className="p-3.5 border-b border-slate-200 dark:border-zinc-850 bg-slate-50 dark:bg-zinc-900/60 flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-zinc-600" />
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-zinc-600" />
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-zinc-600" />
                      <span className="ml-2 font-medium text-slate-800 dark:text-zinc-300">DomoNote Product Walkthrough</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7 px-2"
                        onClick={() => {
                          const img = document.getElementById('demo-video-img') as HTMLImageElement;
                          if (img) img.src = `/domonote-demo.webp?t=${Date.now()}`;
                        }}
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        <span>{t('landing.demo.replay', 'Replay')}</span>
                      </Button>
                    </div>
                  </div>

                  <div className="relative bg-slate-950 flex items-center justify-center p-2 min-h-[400px]">
                    <img
                      id="demo-video-img"
                      src="/domonote-demo.webp"
                      alt="DomoNote Product Walkthrough"
                      className="w-full max-h-[640px] object-contain rounded-lg shadow-inner"
                    />
                  </div>

                  <div className="p-4 border-t border-slate-200 dark:border-zinc-850 bg-slate-50 dark:bg-zinc-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-600 dark:text-zinc-400 text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                      <span>Recorded on desktop running local WebAudio, PDF reader, and Ollama.</span>
                    </div>
                    <Button variant="primary" size="sm" onClick={handleOpenWorkspace}>
                      <span>{t('landing.hero.openWorkspace', 'Open Workspace')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* Live Interactive Workspace Preview with Synaptic Flow Constellation */}
        <ScrollReveal direction="up" delayMs={60}>
          <div className="w-full mb-28 relative overflow-hidden rounded-3xl px-2 sm:px-4">
            <SectionConstellation variant="synaptic-flow" opacity={theme === 'dark' ? 0.5 : 0.25} />
            <div className="relative z-10">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400 mb-2 px-1">
                <span className="font-semibold text-slate-800 dark:text-zinc-300">Document Reader & AI Assistant</span>
                <span className="text-slate-500 dark:text-zinc-500">Interactive Preview</span>
              </div>
              <HeroLiveWorkspace />
            </div>
          </div>
        </ScrollReveal>

        {/* Storytelling Section with Harmonic Wave Constellation */}
        <ScrollReveal direction="up" delayMs={60}>
          <div className="w-full mb-28 relative overflow-hidden rounded-3xl px-2 sm:px-4">
            <SectionConstellation variant="harmonic-wave" opacity={theme === 'dark' ? 0.55 : 0.25} />
            <div className="relative z-10">
              <StickyStorySection />
            </div>
          </div>
        </ScrollReveal>

        {/* Before / After Comparison with Audio Nodes Constellation */}
        <ScrollReveal direction="up" delayMs={60}>
          <div className="w-full py-16 border-t border-slate-200 dark:border-zinc-850 text-left mb-28 relative overflow-hidden rounded-3xl px-2 sm:px-4">
            <SectionConstellation variant="audio-nodes" opacity={theme === 'dark' ? 0.6 : 0.25} />
            <div className="relative z-10">
              <div className="mb-8">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  {t('landing.summaries.badge', 'Automatic Summaries')}
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                  {t('landing.summaries.title', 'From messy conversation to clear action items.')}
                </h2>
                <p className="text-sm text-slate-600 dark:text-zinc-400 mt-2 max-w-xl leading-relaxed">
                  {t('landing.summaries.description', 'Drag the slider to see how raw speech transcripts become structured executive decisions and deliverables.')}
                </p>
              </div>
              <BeforeAfterSlider />
            </div>
          </div>
        </ScrollReveal>

        {/* Horizontal Feature Carousel with Stellar Vortex Constellation */}
        <ScrollReveal direction="up" delayMs={60}>
          <div className="w-full py-16 border-t border-slate-200 dark:border-zinc-850 text-left mb-28 relative overflow-hidden rounded-3xl px-2 sm:px-4">
            <SectionConstellation variant="stellar-vortex" opacity={theme === 'dark' ? 0.65 : 0.25} />
            <div className="relative z-10">
              <div className="mb-8">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  {t('landing.features.badge', 'Features')}
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                  {t('landing.features.title', 'Built for real everyday work.')}
                </h2>
                <p className="text-sm text-slate-600 dark:text-zinc-400 mt-2 max-w-xl leading-relaxed">
                  {t('landing.features.description', 'Everything runs natively inside your browser sandbox with zero external server dependencies.')}
                </p>
              </div>
              <HorizontalCarousel panels={carouselPanels} />
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
          <div id="setup-section" className="w-full py-16 border-t border-slate-200 dark:border-zinc-850 text-left mb-28 scroll-mt-20 relative overflow-hidden rounded-3xl px-2 sm:px-4">
            <SectionConstellation variant="crystalline-polyhedra" opacity={theme === 'dark' ? 0.55 : 0.25} />
            <div className="relative z-10">
              <div className="mb-8">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  {t('landing.setup.badge', 'Quick Setup')}
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                  {t('landing.setup.title', 'One command to initialize everything.')}
                </h2>
                <p className="text-sm text-slate-600 dark:text-zinc-400 mt-2 max-w-2xl leading-relaxed">
                  {t('landing.setup.description', 'DomoNote includes an automated launcher that checks your local Ollama setup, enables browser permissions, pulls recommended models, and opens your workspace.')}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 space-y-4">
                  <CodeBlock
                    title={t('landing.setup.oneClickInit', 'ONE-CLICK INITIALIZATION')}
                    code={`# Clone the repository
git clone https://github.com/darknecrocities/DomoNote.git
cd DomoNote

# Run automated launcher
./start.sh`}
                  />

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 text-xs text-slate-600 dark:text-zinc-400 space-y-2 shadow-sm">
                    <div className="text-slate-900 dark:text-zinc-200 font-semibold mb-1">
                      {t('landing.setup.whatLauncherAutomates', 'What the launcher automates:')}
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                      <span>{t('landing.setup.checkOllama', 'Checks if Ollama is installed (prompts installation if missing)')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                      <span>{t('landing.setup.configCors', 'Configures cross-origin settings for local browser communication')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                      <span>{t('landing.setup.pullModels', 'Pulls lightweight models automatically if none exist')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                      <span>{t('landing.setup.startServer', 'Starts the development server and launches your workspace in browser')}</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-4">
                  <div className="p-6 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm mb-2">
                      <Cpu className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                      <span>{t('landing.setup.supportedModels', 'Supported Local Models')}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed mb-4">
                      {t('landing.setup.supportedModelsDesc', 'Compatible with any model running on Ollama, including llama3.2, gemma, mistral, qwen2.5, phi3, and llava.')}
                    </p>
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300">
                        llama3.2
                      </span>
                      <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300">
                        gemma
                      </span>
                      <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300">
                        qwen2.5
                      </span>
                      <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300">
                        mistral
                      </span>
                    </div>
                  </div>

                  <div className="p-6 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm mb-2">
                      <Shield className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                      <span>{t('landing.setup.privacyBoundaries', 'Privacy Boundaries')}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                      {t('landing.setup.privacyBoundariesDesc', 'Your notes and recordings never leave your device. AI requests travel exclusively between your web browser and http://localhost:11434.')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Why DomoNote / Foundations */}
        <ScrollReveal direction="up" delayMs={60}>
          <div className="w-full py-16 border-t border-slate-200 dark:border-zinc-850 text-left mb-20">
            <div className="mb-10 text-center">
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                {t('landing.why.badge', 'Why DomoNote')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                {t('landing.why.title', 'Built for privacy, speed, and ownership')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-6 rounded-xl border border-slate-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 space-y-2 shadow-sm">
                <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">
                  {t('landing.why.card1Tag', 'Private by Default')}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('landing.why.card1Title', 'Your Data Stays With You')}
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  {t('landing.why.card1Desc', 'Everything is stored directly in your browser using IndexedDB. No remote servers ever read or store your content.')}
                </p>
              </div>

              <div className="p-6 rounded-xl border border-slate-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 space-y-2 shadow-sm">
                <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">
                  {t('landing.why.card2Tag', 'Zero Tracking')}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('landing.why.card2Title', 'No Ads or Tracking')}
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  {t('landing.why.card2Desc', 'No tracking scripts, cookies, or analytics. Your notes, meetings, and thoughts remain completely confidential.')}
                </p>
              </div>

              <div className="p-6 rounded-xl border border-slate-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 space-y-2 shadow-sm">
                <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">
                  {t('landing.why.card3Tag', 'Universal Formats')}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('landing.why.card3Title', 'Export Anytime')}
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  {t('landing.why.card3Desc', 'Export your notes, meeting minutes, and manuals to clean Markdown and PDF files with one click.')}
                </p>
              </div>

              <div className="p-6 rounded-xl border border-slate-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 space-y-2 shadow-sm">
                <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">
                  {t('landing.why.card4Tag', 'Open Source')}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('landing.why.card4Title', 'Free and Auditable')}
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  {t('landing.why.card4Desc', 'Free to use under the MIT license. You can inspect the source code, run it anywhere, or contribute improvements.')}
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Final Launch Callout Card */}
        <ScrollReveal direction="up" delayMs={60}>
          <div className="w-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-8 sm:p-12 text-left flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-xl dark:shadow-2xl">
            <div className="max-w-xl">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                {t('landing.cta.title', 'Start taking notes with private local AI.')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                {t('landing.cta.description', 'No account creation required. No credit card. Your workspace lives entirely inside your browser and local storage.')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button variant="primary" size="lg" onClick={handleOpenWorkspace}>
                <span>{isCloudHost ? t('landing.hero.downloadApp', 'Download Desktop App') : t('landing.cta.openApp', 'Open DomoNote')}</span>
                {isCloudHost ? <Download className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-slate-300 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 hover:border-slate-400 dark:hover:border-white/40 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-transparent"
                onClick={() => setActiveView('download')}
              >
                <Download className="w-4 h-4 text-slate-500 dark:text-zinc-300" />
                <span>{t('landing.cta.downloadApp', 'Download App')}</span>
              </Button>
            </div>
          </div>
        </ScrollReveal>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-zinc-850 py-12 px-6 bg-slate-100 dark:bg-[#030303] text-slate-500 dark:text-zinc-500 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <img src={logoImg} alt="DomoNote" className="w-6 h-6 rounded object-contain" />
              <span className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">DomoNote</span>
              <span className="text-xs text-slate-500 dark:text-zinc-500">• {t('app.tagline', 'Local-First AI Knowledge Workspace')}</span>
            </div>
            <p className="text-slate-500 dark:text-zinc-500 text-xs max-w-sm">
              Built with React, TypeScript, IndexedDB, and local Ollama intelligence.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 dark:text-zinc-400">
            <button
              onClick={() => setActiveView('download')}
              className="text-slate-900 dark:text-white font-semibold hover:text-slate-700 dark:hover:text-zinc-200 transition-colors"
            >
              {t('common.download', 'Download')}
            </button>
            <button
              onClick={handleOpenWorkspace}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {t('nav.localWorkspace', 'Workspace')}
            </button>
            <button
              onClick={() => setActiveView('privacy')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {t('nav.privacy', 'Privacy')}
            </button>
            <button
              onClick={() => setActiveView('about')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {t('nav.about', 'About')}
            </button>
            <button
              onClick={() => setActiveView('settings')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {t('nav.settings', 'Settings')}
            </button>
            <a
              href="https://github.com/darknecrocities/DomoNote"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-slate-200 dark:border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-zinc-600">
          <span>{t('landing.footer.licenseNotice', 'MIT License • Open Source • Runs on Your Device')}</span>
          <span className="mt-2 sm:mt-0">{t('landing.footer.privateByDefault', 'Private by Default')}</span>
        </div>
      </footer>
    </div>
  );
};
