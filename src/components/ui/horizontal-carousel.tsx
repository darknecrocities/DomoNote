import React, { useRef, useState, useEffect } from 'react';
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
}

export const HorizontalCarousel: React.FC<HorizontalCarouselProps> = ({ panels }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    const clamped = Math.max(0, Math.min(panels.length - 1, index));
    const panelWidth = scrollRef.current.offsetWidth * 0.82;
    scrollRef.current.scrollTo({
      left: clamped * panelWidth,
      behavior: 'smooth',
    });
    setActiveIndex(clamped);
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const panelWidth = scrollRef.current.offsetWidth * 0.82;
    const idx = Math.round(scrollRef.current.scrollLeft / panelWidth);
    setActiveIndex(Math.max(0, Math.min(panels.length - 1, idx)));
  };

  return (
    <div className="w-full relative select-none">
      {/* Top Header & Progress */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-zinc-400">
            0{activeIndex + 1} / 0{panels.length}
          </span>
          <div className="w-24 h-0.5 bg-zinc-850 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${((activeIndex + 1) / panels.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scrollToIndex(activeIndex - 1)}
            disabled={activeIndex === 0}
            className="p-2 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-300 hover:text-white hover:border-zinc-700 disabled:opacity-20 transition-colors"
            aria-label="Previous panel"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollToIndex(activeIndex + 1)}
            disabled={activeIndex === panels.length - 1}
            className="p-2 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-300 hover:text-white hover:border-zinc-700 disabled:opacity-20 transition-colors"
            aria-label="Next panel"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Track with Partial Next-Card Reveal */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {panels.map((panel, idx) => {
          const isActive = idx === activeIndex;
          return (
            <div
              key={panel.id}
              className={`snap-start shrink-0 w-[84%] sm:w-[78%] rounded-2xl border transition-all duration-300 p-6 sm:p-8 flex flex-col justify-between min-h-[440px] ${
                isActive
                  ? 'bg-zinc-950 border-zinc-700 shadow-2xl'
                  : 'bg-zinc-950/60 border-zinc-850 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between border-b border-zinc-850 pb-3 mb-6">
                  <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
                    {panel.tag}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">{panel.meta}</span>
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
  );
};
