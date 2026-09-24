import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TiltCard } from './tilt-card';

interface CarouselPanel {
  id: string;
  tag: string;
  title: string;
  description: string;
  meta: string;
  previewContent: React.ReactNode;
}

interface HorizontalCarouselProps {
  panels: CarouselPanel[];
  autoPlayIntervalMs?: number;
}

export const HorizontalCarousel: React.FC<HorizontalCarouselProps> = ({
  panels,
  autoPlayIntervalMs = 4000,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % panels.length);
  }, [panels.length]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + panels.length) % panels.length);
  }, [panels.length]);

  // Continuous auto-looping (pauses gently on hover so user can read)
  useEffect(() => {
    if (panels.length <= 1 || isHovered) return;
    const timer = setInterval(nextSlide, autoPlayIntervalMs);
    return () => clearInterval(timer);
  }, [panels.length, autoPlayIntervalMs, isHovered, nextSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="w-full relative select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Header & Minimalist Progress Track */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-slate-600 dark:text-zinc-300">
            0{activeIndex + 1} / 0{panels.length}
          </span>
          <div className="w-28 sm:w-40 h-1 bg-slate-200 dark:bg-zinc-850 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-slate-900 dark:bg-white transition-all duration-300"
              style={{ width: `${((activeIndex + 1) / panels.length) * 100}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
            Feature Showcase
          </span>
        </div>

        {/* Step Selector Buttons & Arrows */}
        <div className="flex items-center gap-1.5">
          <div className="hidden md:flex items-center gap-1 mr-2">
            {panels.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => setActiveIndex(idx)}
                className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors ${
                  idx === activeIndex
                    ? 'bg-slate-200 dark:bg-zinc-800 text-slate-900 dark:text-white border border-slate-300 dark:border-zinc-700 font-semibold'
                    : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'
                }`}
              >
                0{idx + 1}
              </button>
            ))}
          </div>

          <button
            onClick={prevSlide}
            className="p-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-zinc-700 transition-colors shadow-sm"
            aria-label="Previous feature"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextSlide}
            className="p-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-zinc-700 transition-colors shadow-sm"
            aria-label="Next feature"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Clean Full-Width Carousel Stage with Silky Hardware-Accelerated Sliding */}
      <div className="w-full overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {panels.map((panel) => (
            <TiltCard
              key={panel.id}
              maxTilt={4}
              scale={1.01}
              className="w-full shrink-0 p-4 sm:p-8 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/95 shadow-lg dark:shadow-2xl flex flex-col justify-between min-h-[440px]"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-850 pb-3 mb-6">
                  <span className="text-xs font-mono tracking-widest text-slate-500 dark:text-zinc-400 uppercase">
                    {panel.tag}
                  </span>
                  <span className="text-[11px] font-mono text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-900 px-2.5 py-1 rounded border border-slate-200 dark:border-zinc-800">
                    {panel.meta}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">
                  {panel.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed max-w-2xl mb-6">
                  {panel.description}
                </p>
              </div>

              {/* In-Panel Preview Content */}
              <div className="w-full rounded-xl border border-slate-200 dark:border-zinc-850 bg-slate-50 dark:bg-zinc-900/50 p-3 sm:p-4 font-mono text-xs overflow-hidden">
                {panel.previewContent}
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </div>
  );
};
