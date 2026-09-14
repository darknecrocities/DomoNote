import React from 'react';

interface HeroCloudBackgroundProps {
  isLight: boolean;
}

export const HeroCloudBackground: React.FC<HeroCloudBackgroundProps> = ({ isLight }) => {
  return (
    <div
      className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none z-0 transition-opacity duration-700 ease-in-out ${
        isLight ? 'opacity-100' : 'opacity-0'
      }`}
      aria-hidden="true"
    >
      {/* 
        SOLID GRAY ATMOSPHERIC BASE — gives that "overcast sky" gray feel.
        Layered: bottom=mist-white, top=cool-slate-gray, center=soft cloud blue
      */}
      <div className="absolute inset-0"
        style={{
          background: 'linear-gradient(170deg, #d1d9e6 0%, #dfe6f0 25%, #e8edf5 55%, #edf1f8 80%, #f2f5fa 100%)',
        }}
      />

      {/* Subtle warm sun glow upper-right to break pure gray monotony */}
      <div
        className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full opacity-50 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(220,230,245,0.9) 0%, rgba(200,215,235,0.4) 60%, transparent 100%)' }}
      />

      {/* 
        LAYER 1: DISTANT HIGH-ALTITUDE HAZY MISTS — very slow, top portion
      */}
      <div className="absolute inset-x-0 top-0 h-full w-[200%] flex" style={{ animation: 'cloudDriftSlow 55s linear infinite' }}>
        {/* Tile 1 */}
        <div className="w-1/2 h-full relative shrink-0">
          <svg className="w-full h-full" viewBox="0 0 1200 600" fill="none" preserveAspectRatio="none">
            <defs>
              <linearGradient id="cgHaze1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.88" />
                <stop offset="45%"  stopColor="#d8e4f2" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#c8d8ee" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M 0 90 Q 130 30 280 70 Q 420 20 590 65 Q 740 30 900 75 Q 1050 35 1200 80 L 1200 320 L 0 320 Z"
              fill="url(#cgHaze1)"
            />
            <path
              d="M -20 200 Q 180 140 370 185 Q 550 145 730 195 Q 900 155 1080 200 Q 1200 175 1260 215 L 1260 420 L -20 420 Z"
              fill="url(#cgHaze1)"
              opacity="0.65"
            />
          </svg>
        </div>
        {/* Tile 2 (seamless loop) */}
        <div className="w-1/2 h-full relative shrink-0">
          <svg className="w-full h-full" viewBox="0 0 1200 600" fill="none" preserveAspectRatio="none">
            <path
              d="M 0 90 Q 130 30 280 70 Q 420 20 590 65 Q 740 30 900 75 Q 1050 35 1200 80 L 1200 320 L 0 320 Z"
              fill="url(#cgHaze1)"
            />
            <path
              d="M -20 200 Q 180 140 370 185 Q 550 145 730 195 Q 900 155 1080 200 Q 1200 175 1260 215 L 1260 420 L -20 420 Z"
              fill="url(#cgHaze1)"
              opacity="0.65"
            />
          </svg>
        </div>
      </div>

      {/* 
        LAYER 2: FLUFFY CUMULUS CLOUDS — medium speed, main hero area
        More opaque so they're clearly visible against the gray base
      */}
      <div className="absolute inset-x-0 top-8 h-full w-[200%] flex" style={{ animation: 'cloudDriftMedium 35s linear infinite' }}>
        {/* Tile 1 */}
        <div className="w-1/2 h-full relative shrink-0">
          <svg className="w-full h-full" viewBox="0 0 1200 500" fill="none" preserveAspectRatio="none">
            <defs>
              <linearGradient id="cgFluff2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%"   stopColor="#ffffff" stopOpacity="1" />
                <stop offset="40%"  stopColor="#f0f5ff" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#dde8f5" stopOpacity="0" />
              </linearGradient>
              <filter id="cgBlur2" x="-15%" y="-15%" width="130%" height="130%">
                <feGaussianBlur stdDeviation="5" />
              </filter>
            </defs>
            <g filter="url(#cgBlur2)">
              {/* Cluster A — left */}
              <circle cx="155"  cy="170" r="52"  fill="url(#cgFluff2)" />
              <circle cx="205"  cy="148" r="68"  fill="url(#cgFluff2)" />
              <circle cx="268"  cy="168" r="58"  fill="url(#cgFluff2)" />
              <ellipse cx="210" cy="195" rx="112" ry="38" fill="url(#cgFluff2)" />

              {/* Cluster B — center */}
              <circle cx="555"  cy="140" r="48"  fill="url(#cgFluff2)" />
              <circle cx="608"  cy="118" r="64"  fill="url(#cgFluff2)" />
              <circle cx="668"  cy="140" r="54"  fill="url(#cgFluff2)" />
              <ellipse cx="610" cy="165" rx="105" ry="36" fill="url(#cgFluff2)" />

              {/* Cluster C — right */}
              <circle cx="935"  cy="178" r="58"  fill="url(#cgFluff2)" />
              <circle cx="998"  cy="152" r="74"  fill="url(#cgFluff2)" />
              <circle cx="1062" cy="178" r="60"  fill="url(#cgFluff2)" />
              <ellipse cx="998" cy="205" rx="118" ry="40" fill="url(#cgFluff2)" />
            </g>
          </svg>
        </div>
        {/* Tile 2 (seamless) */}
        <div className="w-1/2 h-full relative shrink-0">
          <svg className="w-full h-full" viewBox="0 0 1200 500" fill="none" preserveAspectRatio="none">
            <g filter="url(#cgBlur2)">
              <circle cx="155"  cy="170" r="52"  fill="url(#cgFluff2)" />
              <circle cx="205"  cy="148" r="68"  fill="url(#cgFluff2)" />
              <circle cx="268"  cy="168" r="58"  fill="url(#cgFluff2)" />
              <ellipse cx="210" cy="195" rx="112" ry="38" fill="url(#cgFluff2)" />
              <circle cx="555"  cy="140" r="48"  fill="url(#cgFluff2)" />
              <circle cx="608"  cy="118" r="64"  fill="url(#cgFluff2)" />
              <circle cx="668"  cy="140" r="54"  fill="url(#cgFluff2)" />
              <ellipse cx="610" cy="165" rx="105" ry="36" fill="url(#cgFluff2)" />
              <circle cx="935"  cy="178" r="58"  fill="url(#cgFluff2)" />
              <circle cx="998"  cy="152" r="74"  fill="url(#cgFluff2)" />
              <circle cx="1062" cy="178" r="60"  fill="url(#cgFluff2)" />
              <ellipse cx="998" cy="205" rx="118" ry="40" fill="url(#cgFluff2)" />
            </g>
          </svg>
        </div>
      </div>

      {/* 
        LAYER 3: FOREGROUND WISPY STREAKS — fastest, lower portion
      */}
      <div className="absolute inset-x-0 bottom-0 h-52 w-[200%] flex opacity-80" style={{ animation: 'cloudDriftFast 20s linear infinite' }}>
        {/* Tile 1 */}
        <div className="w-1/2 h-full relative shrink-0">
          <svg className="w-full h-full" viewBox="0 0 1200 210" fill="none" preserveAspectRatio="none">
            <defs>
              <linearGradient id="cgWisp3" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#ffffff" stopOpacity="0" />
                <stop offset="20%"  stopColor="#ffffff" stopOpacity="0.85" />
                <stop offset="80%"  stopColor="#deeaf8" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M 40 55 Q 210 32 410 62 Q 590 88 760 50 Q 930 28 1080 62 Q 1180 80 1260 55"
              stroke="url(#cgWisp3)" strokeWidth="30" strokeLinecap="round"
            />
            <path
              d="M 100 125 Q 300 95 530 130 Q 740 158 960 115 Q 1090 92 1250 125"
              stroke="url(#cgWisp3)" strokeWidth="38" strokeLinecap="round"
              opacity="0.75"
            />
          </svg>
        </div>
        {/* Tile 2 (seamless) */}
        <div className="w-1/2 h-full relative shrink-0">
          <svg className="w-full h-full" viewBox="0 0 1200 210" fill="none" preserveAspectRatio="none">
            <path
              d="M 40 55 Q 210 32 410 62 Q 590 88 760 50 Q 930 28 1080 62 Q 1180 80 1260 55"
              stroke="url(#cgWisp3)" strokeWidth="30" strokeLinecap="round"
            />
            <path
              d="M 100 125 Q 300 95 530 130 Q 740 158 960 115 Q 1090 92 1250 125"
              stroke="url(#cgWisp3)" strokeWidth="38" strokeLinecap="round"
              opacity="0.75"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
