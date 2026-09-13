import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  autoPlayIntervalMs = 3800,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToIndex = useCallback(
    (index: number) => {
      if (!scrollRef.current) return;
      const target = (index + panels.length) % panels.length;
      const panelWidth = scrollRef.current.offsetWidth * 0.82;
      scrollRef.current.scrollTo({
        left: target * panelWidth,
        behavior: 'smooth',
      });
      setActiveIndex(target);
    },
    [panels.length]
  );

  // Non-stop continuous auto-looping without any pause button or pause interruption
  useEffect(() => {
    if (panels.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % panels.length;
        if (scrollRef.current) {
          const panelWidth = scrollRef.current.offsetWidth * 0.82;
          scrollRef.current.scrollTo({
            left: next * panelWidth,
            behavior: 'smooth',
          });
        }
        return next;
      });
    }, autoPlayIntervalMs);

    return () => clearInterval(timer);
  }, [panels.length, autoPlayIntervalMs]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const panelWidth = scrollRef.current.offsetWidth * 0.82;
    const idx = Math.round(scrollRef.current.scrollLeft / panelWidth);
    const clamped = Math.max(0, Math.min(panels.length - 1, idx));
    if (clamped !== activeIndex) {
      setActiveIndex(clamped);
    }
  };

  return (
    <div className="w-full relative select-none">
      {/* Top Header & Continuous Progress Track */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-zinc-400">
            0{activeIndex + 1} / 0{panels.length}
          </span>
          <div className="w-28 sm:w-40 h-1 bg-zinc-850 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-emerald-400 transition-all duration-300"
              style={{ width: `${((activeIndex + 1) / panels.length) * 100}%` }}
            />
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400/90 ml-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">Continuous Stream</span>
          </div>
        </div>

        {/* Manual Step Navigation */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scrollToIndex((activeIndex - 1 + panels.length) % panels.length)}
            className="p-2 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors shadow-sm"
            aria-label="Previous feature"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollToIndex((activeIndex + 1) % panels.length)}
            className="p-2 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors shadow-sm"
            aria-label="Next feature"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Track Wrapper with Left & Right Blurred Gradient Edges */}
      <div className="relative w-full">
        {/* Left Blurred Edge Overlay */}
        <div
          className="absolute left-0 top-0 bottom-4 w-8 sm:w-16 md:w-24 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent pointer-events-none z-20 backdrop-blur-[2px]"
          aria-hidden="true"
        />

        {/* Right Blurred Edge Overlay */}
        <div
          className="absolute right-0 top-0 bottom-4 w-8 sm:w-16 md:w-24 bg-gradient-to-l from-[#050505] via-[#050505]/80 to-transparent pointer-events-none z-20 backdrop-blur-[2px]"
          aria-hidden="true"
        />

        {/* Scrollable Track with Non-Stop Smooth Looping */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none px-4 sm:px-8"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            maskImage:
              'linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)',
          }}
        >
          {panels.map((panel, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div
                key={panel.id}
                onClick={() => scrollToIndex(idx)}
                className={`snap-start shrink-0 w-[86%] sm:w-[76%] lg:w-[68%] rounded-2xl border transition-all duration-300 p-6 sm:p-8 flex flex-col justify-between min-h-[440px] cursor-pointer ${
                  isActive
                    ? 'bg-zinc-950/95 border-zinc-700 shadow-2xl scale-[1.01] ring-1 ring-white/10'
                    : 'bg-zinc-950/60 border-zinc-850 opacity-60 hover:opacity-85 hover:border-zinc-750'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between border-b border-zinc-850 pb-3 mb-6">
                    <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase">
                      {panel.tag}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                      {panel.meta}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-3">
                    {panel.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed max-w-xl mb-6">
                    {panel.description}
                  </p>
                </div>

                {/* In-Panel Preview Content */}
                <div className="w-full rounded-xl border border-zinc-850 bg-zinc-900/50 p-4 font-mono text-xs overflow-hidden">
                  {panel.previewContent}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
