import React, { useState } from 'react';

interface ScreenshotStackProps {
  steps: Array<{
    stepNumber: number;
    title: string;
    description: string;
    screenshotUrl?: string;
  }>;
}

export const ScreenshotStack: React.FC<ScreenshotStackProps> = ({ steps }) => {
  const [isHovered, setIsHovered] = useState(false);

  const displaySteps = steps.slice(0, 3);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full h-80 flex items-center justify-center cursor-pointer select-none"
    >
      {displaySteps.map((step, idx) => {
        // Compute subtle transformations
        let transform = '';
        let zIndex = 10 - idx;
        let opacity = 1 - idx * 0.15;

        if (isHovered) {
          // Gently separate sideways & upwards
          const offsetX = (idx - 1) * 140;
          const offsetY = idx === 1 ? -15 : 10;
          const rotate = (idx - 1) * 3;
          transform = `translate(${offsetX}px, ${offsetY}px) rotate(${rotate}deg) scale(1.02)`;
        } else {
          // Stacked slightly offset and rotated
          const rotate = (idx - 1) * -3;
          const offsetY = idx * 12;
          const offsetX = (idx - 1) * 8;
          transform = `translate(${offsetX}px, ${offsetY}px) rotate(${rotate}deg)`;
        }

        return (
          <div
            key={idx}
            style={{
              transform,
              zIndex,
              opacity,
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            className="absolute w-72 sm:w-80 h-52 rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl p-4 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-[10px] font-mono text-white bg-zinc-800 px-1.5 py-0.5 rounded">
                STEP 0{step.stepNumber}
              </span>
              <span className="text-[10px] font-mono text-zinc-500">STATE CAPTURE</span>
            </div>

            <div className="flex-1 flex flex-col justify-center py-2">
              <div className="text-xs font-semibold text-zinc-100 mb-1">{step.title}</div>
              <div className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed font-mono">
                {step.description}
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[9px] font-mono text-zinc-500">
              <span>BOUNDS: [1280x720]</span>
              <span>CONFIDENCE: 98%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
