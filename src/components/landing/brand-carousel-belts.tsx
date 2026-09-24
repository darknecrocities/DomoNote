import React from 'react';

// Belt 1: Video Platforms (Only brand logo + name, NO other text)
const VIDEO_PLATFORMS = [
  {
    id: 'gmeet',
    name: 'Google Meet',
    fontStyle: 'font-sans font-medium text-slate-900 dark:text-zinc-100 tracking-tight',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 87.5 72" className="w-6 h-6 shrink-0">
        <path fill="#00832d" d="M49.5 36l8.53 9.75 11.47 7.33 2-17.02-2-16.64-11.69 6.44z"/>
        <path fill="#0066da" d="M0 51.5V66c0 3.315 2.685 6 6 6h14.5l3-10.96-3-9.54-9.95-3z"/>
        <path fill="#e94235" d="M20.5 0L0 20.5l10.55 3 9.95-3 2.95-9.41z"/>
        <path fill="#2684fc" d="M20.5 20.5H0v31h20.5z"/>
        <path fill="#00ac47" d="M82.6 8.68L69.5 19.42v33.66l13.16 10.79c1.97 1.54 4.85.135 4.85-2.37V11c0-2.535-2.945-3.925-4.91-2.32zM49.5 36v15.5h-29V72h43c3.315 0 6-2.685 6-6V53.08z"/>
        <path fill="#ffba00" d="M63.5 0h-43v20.5h29V36l20-16.57V6c0-3.315-2.685-6-6-6z"/>
      </svg>
    ),
  },
  {
    id: 'zoom',
    name: 'Zoom',
    fontStyle: 'font-sans font-bold text-[#2D8CFF] tracking-tight',
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 shrink-0" fill="none">
        <path d="M4 7C4 5.34315 5.34315 4 7 4H14C15.6569 4 17 5.34315 17 7V17C17 18.6569 15.6569 20 14 20H7C5.34315 20 4 18.6569 4 17V7Z" fill="#2D8CFF" />
        <path d="M18.5 8.75L22 6.5V17.5L18.5 15.25V8.75Z" fill="#2D8CFF" />
      </svg>
    ),
  },
  {
    id: 'discord',
    name: 'Discord',
    fontStyle: 'font-sans font-black text-[#5865F2] tracking-tighter',
    icon: (
      <svg viewBox="0 0 127.14 96.36" className="w-6 h-6 shrink-0" fill="#5865F2">
        <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.91,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.91,96.12,53,91.08,65.69,84.69,65.69Z" />
      </svg>
    ),
  },
  {
    id: 'msteams',
    name: 'Microsoft Teams',
    fontStyle: 'font-sans font-semibold text-[#7B83EB] tracking-tight',
    icon: (
      <svg viewBox="0 0 48 48" className="w-6 h-6 shrink-0" fill="none">
        <path d="M30 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" fill="#7B83EB" />
        <path d="M37 14h-8a3 3 0 0 0-3 3v6.5a13.5 13.5 0 0 0 14-6.5v-1a2 2 0 0 0-3-2z" fill="#7B83EB" />
        <path d="M21 16a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11z" fill="#5059C9" />
        <path d="M30 20.5v11.75a2.75 2.75 0 0 1-2.75 2.75h-12.5A2.75 2.75 0 0 1 12 32.25V20.5A4.5 4.5 0 0 1 16.5 16h9a4.5 4.5 0 0 1 4.5 4.5z" fill="#5059C9" />
        <rect x="5" y="19" width="18" height="18" rx="4" fill="#464EB8" />
        <path d="M12 25h4v9h-2v-7h-2v-2z" fill="#FFFFFF" />
      </svg>
    ),
  },
  {
    id: 'slack',
    name: 'Slack',
    fontStyle: 'font-sans font-black text-slate-900 dark:text-zinc-100 tracking-tight',
    icon: (
      <svg viewBox="0 0 127 127" className="w-6 h-6 shrink-0">
        <path d="M27.2 80c0 7.3-5.9 13.2-13.2 13.2C6.7 93.2.8 87.3.8 80c0-7.3 5.9-13.2 13.2-13.2h13.2V80zm6.6 0c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2v33c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V80z" fill="#E01E5A"/>
        <path d="M47 27c-7.3 0-13.2-5.9-13.2-13.2C33.8 6.5 39.7.6 47 .6c7.3 0 13.2 5.9 13.2 13.2V27H47zm0 6.7c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H13.9C6.6 60.1.7 54.2.7 46.9c0-7.3 5.9-13.2 13.2-13.2H47z" fill="#36C5F0"/>
        <path d="M99.9 46.9c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H99.9V46.9zm-6.6 0c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V13.8C66.9 6.5 72.8.6 80.1.6c7.3 0 13.2 5.9 13.2 13.2v33.1z" fill="#2EB67D"/>
        <path d="M80.1 99.8c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V99.8h13.2zm0-6.6c-7.3 0-13.2-5.9-13.2-13.2 0-7.3 5.9-13.2 13.2-13.2h33.1c7.3 0 13.2 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H80.1z" fill="#ECB22E"/>
      </svg>
    ),
  },
  {
    id: 'webex',
    name: 'Cisco Webex',
    fontStyle: 'font-sans font-semibold text-[#00D26A] tracking-tight',
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 shrink-0" fill="none">
        <path d="M6 15.5C6 17.43 7.57 19 9.5 19C11.43 19 13 17.43 13 15.5C13 13.57 11.43 12 9.5 12C7.57 12 6 13.57 6 15.5Z" fill="#00D26A" />
        <path d="M11 8.5C11 10.43 12.57 12 14.5 12C16.43 12 18 10.43 18 8.5C18 6.57 16.43 5 14.5 5C12.57 5 11 6.57 11 8.5Z" fill="#00B4D8" />
        <path d="M2.5 11C2.5 12.38 3.62 13.5 5 13.5C6.38 13.5 7.5 12.38 7.5 11C7.5 9.62 6.38 8.5 5 8.5C3.62 8.5 2.5 9.62 2.5 11Z" fill="#0077B6" />
        <path d="M16.5 15.5C16.5 16.88 17.62 18 19 18C20.38 18 21.5 16.88 21.5 15.5C21.5 14.12 20.38 13 19 13C17.62 13 16.5 14.12 16.5 15.5Z" fill="#10B981" />
      </svg>
    ),
  },
  {
    id: 'loom',
    name: 'Loom',
    fontStyle: 'font-sans font-black text-[#625DF5] tracking-tight',
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 shrink-0" fill="#625DF5">
        <path d="M12 0L14.7 8.3L23.1 5.6L17.5 12L23.1 18.4L14.7 15.7L12 24L9.3 15.7L0.9 18.4L6.5 12L0.9 5.6L9.3 8.3L12 0Z" />
      </svg>
    ),
  },
  {
    id: 'facetime',
    name: 'FaceTime',
    fontStyle: 'font-sans font-semibold text-[#34C759] tracking-tight',
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 shrink-0" fill="none">
        <rect x="2" y="5" width="14" height="14" rx="3.5" fill="#34C759" />
        <path d="M17 9.25L21.2 6.5C21.6 6.25 22 6.5 22 7V17C22 17.5 21.6 17.75 21.2 17.5L17 14.75V9.25Z" fill="#34C759" />
      </svg>
    ),
  },
];

// Belt 2: Supporting File Formats (Only legitimate icon + name, NO other text)
const SUPPORTED_FILES = [
  {
    id: 'pdf',
    name: 'PDF',
    fontStyle: 'font-mono font-bold text-red-400 tracking-wider',
    icon: (
      <svg viewBox="0 0 32 32" className="w-6 h-6 shrink-0" fill="none">
        <path d="M8 4C6.89543 4 6 4.89543 6 6V26C6 27.1046 6.89543 28 8 28H24C25.1046 28 26 27.1046 26 26V11L19 4H8Z" fill="#EF4444" fillOpacity="0.16" stroke="#EF4444" strokeWidth="2" strokeLinejoin="round" />
        <path d="M18 4V11H25" stroke="#EF4444" strokeWidth="2" strokeLinejoin="round" />
        <path d="M11 22V16H13.5C14.3 16 15 16.7 15 17.5C15 18.3 14.3 19 13.5 19H11M17 22V16H19.5C21 16 22 17.3 22 19C22 20.7 21 22 19.5 22H17M11 19H13.5" stroke="#EF4444" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'docx',
    name: 'DOCX',
    fontStyle: 'font-mono font-bold text-blue-400 tracking-wider',
    icon: (
      <svg viewBox="0 0 32 32" className="w-6 h-6 shrink-0" fill="none">
        <path d="M8 4C6.89543 4 6 4.89543 6 6V26C6 27.1046 6.89543 28 8 28H24C25.1046 28 26 27.1046 26 26V11L19 4H8Z" fill="#3B82F6" fillOpacity="0.16" stroke="#3B82F6" strokeWidth="2" strokeLinejoin="round" />
        <path d="M18 4V11H25" stroke="#3B82F6" strokeWidth="2" strokeLinejoin="round" />
        <path d="M10 16L12 22L14.5 17L17 22L19 16" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'txt',
    name: 'TXT',
    fontStyle: 'font-mono font-bold text-slate-700 dark:text-slate-300 tracking-wider',
    icon: (
      <svg viewBox="0 0 32 32" className="w-6 h-6 shrink-0" fill="none">
        <path d="M8 4C6.89543 4 6 4.89543 6 6V26C6 27.1046 6.89543 28 8 28H24C25.1046 28 26 27.1046 26 26V11L19 4H8Z" fill="#94A3B8" fillOpacity="0.16" stroke="#94A3B8" strokeWidth="2" strokeLinejoin="round" />
        <path d="M18 4V11H25" stroke="#94A3B8" strokeWidth="2" strokeLinejoin="round" />
        <path d="M10 16H22M10 19H22M10 22H17" stroke="#94A3B8" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'md',
    name: 'MARKDOWN',
    fontStyle: 'font-mono font-bold text-indigo-400 tracking-wider',
    icon: (
      <svg viewBox="0 0 32 32" className="w-6 h-6 shrink-0" fill="none">
        <path d="M8 4C6.89543 4 6 4.89543 6 6V26C6 27.1046 6.89543 28 8 28H24C25.1046 28 26 27.1046 26 26V11L19 4H8Z" fill="#818CF8" fillOpacity="0.16" stroke="#818CF8" strokeWidth="2" strokeLinejoin="round" />
        <path d="M18 4V11H25" stroke="#818CF8" strokeWidth="2" strokeLinejoin="round" />
        <path d="M9 20V16L11 18L13 16V20M17 18.5H20.5M19 16.5V20.5M17.5 19L19 20.5L20.5 19" stroke="#818CF8" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'xlsx',
    name: 'XLSX',
    fontStyle: 'font-mono font-bold text-emerald-400 tracking-wider',
    icon: (
      <svg viewBox="0 0 32 32" className="w-6 h-6 shrink-0" fill="none">
        <path d="M8 4C6.89543 4 6 4.89543 6 6V26C6 27.1046 6.89543 28 8 28H24C25.1046 28 26 27.1046 26 26V11L19 4H8Z" fill="#10B981" fillOpacity="0.16" stroke="#10B981" strokeWidth="2" strokeLinejoin="round" />
        <path d="M18 4V11H25" stroke="#10B981" strokeWidth="2" strokeLinejoin="round" />
        <path d="M11 16L19 22M19 16L11 22" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'mp3',
    name: 'MP3',
    fontStyle: 'font-mono font-bold text-purple-400 tracking-wider',
    icon: (
      <svg viewBox="0 0 32 32" className="w-6 h-6 shrink-0" fill="none">
        <path d="M8 4C6.89543 4 6 4.89543 6 6V26C6 27.1046 6.89543 28 8 28H24C25.1046 28 26 27.1046 26 26V11L19 4H8Z" fill="#A855F7" fillOpacity="0.16" stroke="#A855F7" strokeWidth="2" strokeLinejoin="round" />
        <path d="M18 4V11H25" stroke="#A855F7" strokeWidth="2" strokeLinejoin="round" />
        <path d="M10 19V17M12.5 22V14M15 23V13M17.5 21V15M20 19V17" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'wav',
    name: 'WAV',
    fontStyle: 'font-mono font-bold text-amber-400 tracking-wider',
    icon: (
      <svg viewBox="0 0 32 32" className="w-6 h-6 shrink-0" fill="none">
        <path d="M8 4C6.89543 4 6 4.89543 6 6V26C6 27.1046 6.89543 28 8 28H24C25.1046 28 26 27.1046 26 26V11L19 4H8Z" fill="#F59E0B" fillOpacity="0.16" stroke="#F59E0B" strokeWidth="2" strokeLinejoin="round" />
        <path d="M18 4V11H25" stroke="#F59E0B" strokeWidth="2" strokeLinejoin="round" />
        <path d="M10 19C11.5 15 13 23 15 16C17 22 18.5 14 20 19" stroke="#F59E0B" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'mp4',
    name: 'MP4',
    fontStyle: 'font-mono font-bold text-pink-400 tracking-wider',
    icon: (
      <svg viewBox="0 0 32 32" className="w-6 h-6 shrink-0" fill="none">
        <path d="M8 4C6.89543 4 6 4.89543 6 6V26C6 27.1046 6.89543 28 8 28H24C25.1046 28 26 27.1046 26 26V11L19 4H8Z" fill="#EC4899" fillOpacity="0.16" stroke="#EC4899" strokeWidth="2" strokeLinejoin="round" />
        <path d="M18 4V11H25" stroke="#EC4899" strokeWidth="2" strokeLinejoin="round" />
        <path d="M12.5 15.5V20.5L17.5 18L12.5 15.5Z" fill="#EC4899" stroke="#EC4899" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'csv',
    name: 'CSV',
    fontStyle: 'font-mono font-bold text-teal-400 tracking-wider',
    icon: (
      <svg viewBox="0 0 32 32" className="w-6 h-6 shrink-0" fill="none">
        <path d="M8 4C6.89543 4 6 4.89543 6 6V26C6 27.1046 6.89543 28 8 28H24C25.1046 28 26 27.1046 26 26V11L19 4H8Z" fill="#14B8A6" fillOpacity="0.16" stroke="#14B8A6" strokeWidth="2" strokeLinejoin="round" />
        <path d="M18 4V11H25" stroke="#14B8A6" strokeWidth="2" strokeLinejoin="round" />
        <path d="M10 16H20M10 19H20M14 14V22" stroke="#14B8A6" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'pptx',
    name: 'PPTX',
    fontStyle: 'font-mono font-bold text-orange-400 tracking-wider',
    icon: (
      <svg viewBox="0 0 32 32" className="w-6 h-6 shrink-0" fill="none">
        <path d="M8 4C6.89543 4 6 4.89543 6 6V26C6 27.1046 6.89543 28 8 28H24C25.1046 28 26 27.1046 26 26V11L19 4H8Z" fill="#FB923C" fillOpacity="0.16" stroke="#FB923C" strokeWidth="2" strokeLinejoin="round" />
        <path d="M18 4V11H25" stroke="#FB923C" strokeWidth="2" strokeLinejoin="round" />
        <path d="M11 22V16H15C16.1 16 17 16.9 17 18C17 19.1 16.1 20 15 20H11" stroke="#FB923C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'json',
    name: 'JSON',
    fontStyle: 'font-mono font-bold text-cyan-400 tracking-wider',
    icon: (
      <svg viewBox="0 0 32 32" className="w-6 h-6 shrink-0" fill="none">
        <path d="M8 4C6.89543 4 6 4.89543 6 6V26C6 27.1046 6.89543 28 8 28H24C25.1046 28 26 27.1046 26 26V11L19 4H8Z" fill="#06B6D4" fillOpacity="0.16" stroke="#06B6D4" strokeWidth="2" strokeLinejoin="round" />
        <path d="M18 4V11H25" stroke="#06B6D4" strokeWidth="2" strokeLinejoin="round" />
        <path d="M11.5 17C11.5 17 10.5 17.5 10.5 18.5C10.5 19.5 11.5 20 11.5 20M18.5 17C18.5 17 19.5 17.5 19.5 18.5C19.5 19.5 18.5 20 18.5 20" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
];

export const BrandCarouselBelts: React.FC = () => {
  // Duplicate array into 2 identical halves so translate3d(-50%, 0, 0) loops 100% seamlessly without any jump
  const videoTrack = [...VIDEO_PLATFORMS, ...VIDEO_PLATFORMS];
  const filesTrack = [...SUPPORTED_FILES, ...SUPPORTED_FILES];

  return (
    <div className="w-full py-6 my-2 relative overflow-hidden flex flex-col gap-3.5 select-none">
      {/* Left and Right edge gradient fade overlays for seamless luxury aesthetic */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 sm:w-44 z-20 bg-gradient-to-r from-[var(--bg-page)] to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 sm:w-44 z-20 bg-gradient-to-l from-[var(--bg-page)] to-transparent" />

      {/* BELT 1: Video Platforms (Non-stop looping to the Left) */}
      <div className="flex w-full overflow-hidden">
        <div className="flex flex-nowrap w-max items-center gap-4 shrink-0 animate-marquee-left py-1">
          {videoTrack.map((item, idx) => (
            <div
              key={`video-${item.id}-${idx}`}
              className="flex items-center gap-3 px-5 py-2.5 rounded-full border border-slate-200/90 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/70 backdrop-blur-md transition-all duration-300 hover:border-slate-400 dark:hover:border-zinc-700 shadow-sm shrink-0"
            >
              <div className="shrink-0 flex items-center justify-center">
                {item.icon}
              </div>
              <span className={`text-xs sm:text-sm whitespace-nowrap ${item.fontStyle}`}>
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* BELT 2: Supporting Files (Non-stop looping in OPPOSITE direction to the Right) */}
      <div className="flex w-full overflow-hidden">
        <div className="flex flex-nowrap w-max items-center gap-4 shrink-0 animate-marquee-right py-1">
          {filesTrack.map((item, idx) => (
            <div
              key={`file-${item.id}-${idx}`}
              className="flex items-center gap-3 px-5 py-2.5 rounded-full border border-slate-200/90 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/70 backdrop-blur-md transition-all duration-300 hover:border-slate-400 dark:hover:border-zinc-700 shadow-sm shrink-0"
            >
              <div className="shrink-0 flex items-center justify-center">
                {item.icon}
              </div>
              <span className={`text-xs sm:text-sm whitespace-nowrap ${item.fontStyle}`}>
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
