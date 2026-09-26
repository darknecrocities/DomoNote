import React, { useEffect, useState, useRef } from 'react';
import { subscribeToStats, recordSiteVisit, recordAppDownload, SiteStats, BASELINE_VISITORS, BASELINE_DOWNLOADS } from '../../services/firebase/stats';
import { useWorkspace } from '../../context/workspace-context';

// Smooth cubic ease-out function for clean count animation
const easeOutQuart = (x: number): number => {
  return 1 - Math.pow(1 - x, 4);
};

interface CounterProps {
  end: number;
  duration?: number;
  startAnimation: boolean;
}

const AnimatedCounter: React.FC<CounterProps> = ({ end, duration = 1600, startAnimation }) => {
  const [count, setCount] = useState(0);
  const prevEndRef = useRef(0);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (!startAnimation) {
      setCount(0);
      hasAnimatedRef.current = false;
      return;
    }

    const startVal = hasAnimatedRef.current ? prevEndRef.current : 0;
    const endVal = end;
    prevEndRef.current = end;
    const diff = endVal - startVal;

    // Smooth quick animation for subsequent live increments (+1 or +2)
    const animDuration = hasAnimatedRef.current ? 400 : duration;
    hasAnimatedRef.current = true;

    if (diff === 0) {
      setCount(endVal);
      return;
    }

    let startTime: number | null = null;
    let animId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / animDuration, 1);
      const easedProgress = easeOutQuart(progress);
      setCount(Math.floor(startVal + diff * easedProgress));

      if (progress < 1) {
        animId = requestAnimationFrame(animate);
      } else {
        setCount(endVal);
      }
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [end, duration, startAnimation]);

  return <span className="tabular-nums">{count.toLocaleString()}</span>;
};

export const StatsBelt: React.FC = () => {
  const { setActiveView } = useWorkspace();
  const [stats, setStats] = useState<SiteStats>({
    visitors: BASELINE_VISITORS,
    downloads: BASELINE_DOWNLOADS,
    isLive: false,
  });
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);


  // Subscribe to live statistics
  useEffect(() => {
    const unsubscribe = subscribeToStats((newStats) => {
      setStats(newStats);
    });
    return () => unsubscribe();
  }, []);

  // IntersectionObserver for scroll-triggered count-up animation
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full py-8 my-2 transition-all duration-700 ease-out select-none"
      style={{
        opacity: isVisible ? 1 : 0.2,
        transform: isVisible ? 'translateY(0)' : 'translateY(12px)',
      }}
    >
      <div className="max-w-4xl mx-auto flex items-center justify-center gap-10 sm:gap-20 md:gap-28 text-center px-4">
        {/* Visitors Metric */}
        <div className="flex flex-col items-center">
          <div className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono flex items-baseline">
            <AnimatedCounter end={stats.visitors} startAnimation={isVisible} />
            <span className="text-slate-400 dark:text-zinc-600 font-sans ml-1 text-2xl sm:text-3xl lg:text-4xl font-normal">+</span>
          </div>
          <div className="mt-1.5 sm:mt-2 text-xs sm:text-sm font-medium tracking-wide uppercase text-slate-500 dark:text-zinc-400">
            Website Visitors
          </div>
        </div>

        {/* Elegant thin divider */}
        <div className="h-10 sm:h-14 w-px bg-slate-200 dark:bg-zinc-800" />

        {/* Downloads Metric */}
        <div
          onClick={() => {
            recordAppDownload('stats-belt');
            setActiveView('download');
          }}
          className="flex flex-col items-center cursor-pointer group"
          title="Click to download DomoNote"
        >
          <div className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono flex items-baseline group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            <AnimatedCounter end={stats.downloads} startAnimation={isVisible} />
            <span className="text-slate-400 dark:text-zinc-600 font-sans ml-1 text-2xl sm:text-3xl lg:text-4xl font-normal group-hover:text-emerald-500 transition-colors">+</span>
          </div>
          <div className="mt-1.5 sm:mt-2 text-xs sm:text-sm font-medium tracking-wide uppercase text-slate-500 dark:text-zinc-400 group-hover:text-slate-800 dark:group-hover:text-zinc-200 transition-colors">
            App Downloads
          </div>
        </div>
      </div>
    </div>
  );
};
