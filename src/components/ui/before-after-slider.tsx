import React, { useState, useRef, useCallback } from 'react';
import { GripVertical } from 'lucide-react';

export const BeforeAfterSlider: React.FC = () => {
  const [sliderPos, setSliderPos] = useState(50); // percentage 0 - 100
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSliderPos(pct);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseDown = () => {
    isDragging.current = true;
    const onMouseMove = (e: MouseEvent) => {
      if (isDragging.current) handleMove(e.clientX);
    };
    const onMouseUp = () => {
      isDragging.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div className="w-full select-none">
      <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
        <span>Raw Meeting Audio</span>
        <span>Organized Summary & Tasks</span>
      </div>

      <div
        ref={containerRef}
        onTouchMove={handleTouchMove}
        className="relative w-full h-[380px] rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl cursor-ew-resize"
      >
        {/* Right Pane: Structured Knowledge (Background) */}
        <div className="absolute inset-0 p-6 flex flex-col justify-between bg-zinc-950 text-zinc-100">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-semibold text-xs tracking-tight text-white">
                  Meeting Minutes & Decisions
                </span>
              </div>
              <span className="text-xs text-zinc-500">Local Summary</span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-zinc-800 space-y-1.5">
                <div className="font-semibold text-zinc-200">Decisions Made</div>
                <div className="text-zinc-400 leading-relaxed">
                  Deployment moved to Friday 18:00 UTC. Zero downtime requirement approved.
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-zinc-800 space-y-2">
                <div className="font-semibold text-zinc-200">Action Items</div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-zinc-300">
                    <span>[ ] Prepare canary rollout manifests</span>
                    <span className="text-zinc-500">@Arron</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-300">
                    <span>[ ] Verify database schema migrations</span>
                    <span className="text-zinc-500">@DevOps</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-zinc-500 pt-3 border-t border-zinc-900 flex justify-between">
            <span>Saved to your workspace</span>
            <span>2 action items</span>
          </div>
        </div>

        {/* Left Pane: Raw Audio Transcript (Clipped by sliderPos) */}
        <div
          className="absolute inset-y-0 left-0 overflow-hidden bg-zinc-900/95 border-r border-zinc-600 text-zinc-400"
          style={{ width: `${sliderPos}%` }}
        >
          <div className="w-[800px] h-full p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                <span className="font-semibold text-xs tracking-tight text-zinc-300">
                  Raw Audio Transcript
                </span>
                <span className="text-xs text-zinc-500">Spoken Words</span>
              </div>

              <div className="text-xs text-zinc-400 space-y-2.5 leading-relaxed">
                <p>00:02 speaker: hey so about the deployment we were talking earlier...</p>
                <p>00:14 speaker: yeah i think friday might be better because of the load testing</p>
                <p>00:31 speaker: who's preparing the yaml files again? arron did you do that?</p>
                <p>00:48 speaker: yeah i can write the manifests tonight and ping devops on slack</p>
                <p>01:05 speaker: okay cool make sure we don't drop traffic during db migration</p>
              </div>
            </div>

            <div className="text-xs text-zinc-500 pt-3 border-t border-zinc-800/80">
              Unedited audio recording
            </div>
          </div>
        </div>

        {/* Draggable Divider Handle */}
        <div
          onMouseDown={handleMouseDown}
          className="absolute inset-y-0 -ml-3 w-6 flex items-center justify-center cursor-ew-resize z-20"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center shadow-xl border border-zinc-300 transition-transform active:scale-95">
            <GripVertical className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
