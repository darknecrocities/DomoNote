import React from 'react';

interface HeroCloudBackgroundProps {
  isLight: boolean;
}

export const HeroCloudBackground: React.FC<HeroCloudBackgroundProps> = ({ isLight }) => {
  return (
    <div
      className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden transition-opacity duration-1000 ease-in-out z-0 select-none ${
        isLight ? 'opacity-100' : 'opacity-0'
      }`}
      aria-hidden="true"
    >
      {/* Soft Ethereal Daylight Sky Atmosphere Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-100/60 via-sky-50/30 to-transparent" />

      {/* Gentle Sun Radiant Glow Accent in Upper Right */}
      <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-gradient-to-br from-amber-100/60 via-sky-100/40 to-transparent blur-3xl opacity-70" />

      {/* 
        LAYER 1: DISTANT HIGH-ALTITUDE CLOUD MISTS (Right to Left - Slow)
        Two identical 100% width tiles inside a 200% container translate from 0 to -50%
      */}
      <div className="absolute inset-x-0 top-0 h-full w-[200%] flex animate-cloud-slow">
        {/* Tile 1 */}
        <div className="w-1/2 h-full relative shrink-0">
          <svg className="w-full h-full" viewBox="0 0 1200 600" fill="none" preserveAspectRatio="none">
            <defs>
              <linearGradient id="cloudGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                <stop offset="60%" stopColor="#e0f2fe" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#bae6fd" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Distant soft billowy shapes */}
            <path
              d="M 50 140 Q 120 70 240 100 Q 320 60 440 90 Q 560 50 680 110 Q 760 80 880 120 Q 980 90 1080 130 Q 1160 110 1220 150 L 1220 380 L 0 380 L 0 140 Z"
              fill="url(#cloudGrad1)"
            />
            <path
              d="M -40 220 Q 140 160 300 210 Q 480 170 660 220 Q 820 180 980 230 Q 1120 190 1250 240 L 1250 450 L -40 450 Z"
              fill="url(#cloudGrad1)"
              opacity="0.6"
            />
          </svg>
        </div>

        {/* Tile 2 (Identical for seamless infinite right-to-left loop) */}
        <div className="w-1/2 h-full relative shrink-0">
          <svg className="w-full h-full" viewBox="0 0 1200 600" fill="none" preserveAspectRatio="none">
            <path
              d="M 50 140 Q 120 70 240 100 Q 320 60 440 90 Q 560 50 680 110 Q 760 80 880 120 Q 980 90 1080 130 Q 1160 110 1220 150 L 1220 380 L 0 380 L 0 140 Z"
              fill="url(#cloudGrad1)"
            />
            <path
              d="M -40 220 Q 140 160 300 210 Q 480 170 660 220 Q 820 180 980 230 Q 1120 190 1250 240 L 1250 450 L -40 450 Z"
              fill="url(#cloudGrad1)"
              opacity="0.6"
            />
          </svg>
        </div>
      </div>

      {/* 
        LAYER 2: MID-GROUND FLUFFY CUMULUS CLOUDS (Right to Left - Medium)
      */}
      <div className="absolute inset-x-0 top-12 h-full w-[200%] flex animate-cloud-medium">
        {/* Tile 1 */}
        <div className="w-1/2 h-full relative shrink-0">
          <svg className="w-full h-full" viewBox="0 0 1200 500" fill="none" preserveAspectRatio="none">
            <defs>
              <linearGradient id="cloudGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#f0f9ff" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.05" />
              </linearGradient>
              <filter id="cloudSoft" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="3" />
              </filter>
            </defs>
            {/* Fluffy cumulus clusters */}
            <g filter="url(#cloudSoft)">
              {/* Cluster A */}
              <circle cx="160" cy="180" r="55" fill="url(#cloudGrad2)" />
              <circle cx="210" cy="160" r="70" fill="url(#cloudGrad2)" />
              <circle cx="270" cy="180" r="60" fill="url(#cloudGrad2)" />
              <ellipse cx="215" cy="205" rx="110" ry="40" fill="url(#cloudGrad2)" />

              {/* Cluster B */}
              <circle cx="560" cy="150" r="50" fill="url(#cloudGrad2)" />
              <circle cx="610" cy="130" r="65" fill="url(#cloudGrad2)" />
              <circle cx="670" cy="150" r="55" fill="url(#cloudGrad2)" />
              <ellipse cx="615" cy="175" rx="100" ry="35" fill="url(#cloudGrad2)" />

              {/* Cluster C */}
              <circle cx="940" cy="190" r="60" fill="url(#cloudGrad2)" />
              <circle cx="1000" cy="165" r="75" fill="url(#cloudGrad2)" />
              <circle cx="1060" cy="190" r="60" fill="url(#cloudGrad2)" />
              <ellipse cx="1000" cy="215" rx="115" ry="42" fill="url(#cloudGrad2)" />
            </g>
          </svg>
        </div>

        {/* Tile 2 (Seamless loop partner) */}
        <div className="w-1/2 h-full relative shrink-0">
          <svg className="w-full h-full" viewBox="0 0 1200 500" fill="none" preserveAspectRatio="none">
            <g filter="url(#cloudSoft)">
              {/* Cluster A */}
              <circle cx="160" cy="180" r="55" fill="url(#cloudGrad2)" />
              <circle cx="210" cy="160" r="70" fill="url(#cloudGrad2)" />
              <circle cx="270" cy="180" r="60" fill="url(#cloudGrad2)" />
              <ellipse cx="215" cy="205" rx="110" ry="40" fill="url(#cloudGrad2)" />

              {/* Cluster B */}
              <circle cx="560" cy="150" r="50" fill="url(#cloudGrad2)" />
              <circle cx="610" cy="130" r="65" fill="url(#cloudGrad2)" />
              <circle cx="670" cy="150" r="55" fill="url(#cloudGrad2)" />
              <ellipse cx="615" cy="175" rx="100" ry="35" fill="url(#cloudGrad2)" />

              {/* Cluster C */}
              <circle cx="940" cy="190" r="60" fill="url(#cloudGrad2)" />
              <circle cx="1000" cy="165" r="75" fill="url(#cloudGrad2)" />
              <circle cx="1060" cy="190" r="60" fill="url(#cloudGrad2)" />
              <ellipse cx="1000" cy="215" rx="115" ry="42" fill="url(#cloudGrad2)" />
            </g>
          </svg>
        </div>
      </div>

      {/* 
        LAYER 3: FOREGROUND ETHEREAL CLOUD WISPS (Right to Left - Fast)
      */}
      <div className="absolute inset-x-0 bottom-6 h-48 w-[200%] flex animate-cloud-fast opacity-75">
        {/* Tile 1 */}
        <div className="w-1/2 h-full relative shrink-0">
          <svg className="w-full h-full" viewBox="0 0 1200 200" fill="none" preserveAspectRatio="none">
            <defs>
              <linearGradient id="cloudWisp" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="25%" stopColor="#ffffff" stopOpacity="0.75" />
                <stop offset="75%" stopColor="#e0f2fe" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Streamlined wind streaks */}
            <path
              d="M 50 60 Q 200 40 380 70 Q 520 90 680 60 Q 820 40 960 70 Q 1100 90 1200 60"
              stroke="url(#cloudWisp)"
              strokeWidth="28"
              strokeLinecap="round"
              filter="blur(8px)"
            />
            <path
              d="M 120 120 Q 320 90 540 130 Q 740 150 950 110 Q 1080 90 1250 120"
              stroke="url(#cloudWisp)"
              strokeWidth="36"
              strokeLinecap="round"
              filter="blur(12px)"
            />
          </svg>
        </div>

        {/* Tile 2 (Seamless loop partner) */}
        <div className="w-1/2 h-full relative shrink-0">
          <svg className="w-full h-full" viewBox="0 0 1200 200" fill="none" preserveAspectRatio="none">
            <path
              d="M 50 60 Q 200 40 380 70 Q 520 90 680 60 Q 820 40 960 70 Q 1100 90 1200 60"
              stroke="url(#cloudWisp)"
              strokeWidth="28"
              strokeLinecap="round"
              filter="blur(8px)"
            />
            <path
              d="M 120 120 Q 320 90 540 130 Q 740 150 950 110 Q 1080 90 1250 120"
              stroke="url(#cloudWisp)"
              strokeWidth="36"
              strokeLinecap="round"
              filter="blur(12px)"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
