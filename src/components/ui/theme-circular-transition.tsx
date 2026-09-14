import React from 'react';
import { useTheme } from '../../context/theme-context';

export const ThemeCircularTransition: React.FC = () => {
  const { isTransitioning, transitionTheme, transitionOrigin } = useTheme();

  if (!isTransitioning || !transitionTheme) return null;

  const originX = transitionOrigin?.x ?? (typeof window !== 'undefined' ? window.innerWidth - 60 : 100);
  const originY = transitionOrigin?.y ?? 24;

  const isDark = transitionTheme === 'dark';

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9990] overflow-hidden"
      aria-hidden="true"
    >
      {/* Primary Liquid Wave Layer */}
      <div
        className="absolute inset-0 transition-all duration-750 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-[clip-path]"
        style={{
          backgroundColor: isDark ? '#050505' : '#f8fafc',
          clipPath: isTransitioning
            ? `circle(175% at ${originX}px ${originY}px)`
            : `circle(0% at ${originX}px ${originY}px)`,
          transition: 'clip-path 0.75s cubic-bezier(0.25, 1, 0.5, 1)',
        }}
      >
        {/* Secondary Inner Ripple Wave for Liquid Depth */}
        <div
          className="absolute inset-0 opacity-40 transition-all duration-850 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-[clip-path]"
          style={{
            backgroundColor: isDark ? '#18181b' : '#ffffff',
            clipPath: isTransitioning
              ? `circle(180% at ${originX}px ${originY}px)`
              : `circle(0% at ${originX}px ${originY}px)`,
            transition: 'clip-path 0.85s cubic-bezier(0.25, 1, 0.5, 1)',
          }}
        />

        {/* Luminous Wavefront Glow Rim */}
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            background: isDark
              ? `radial-gradient(circle at ${originX}px ${originY}px, transparent 40%, rgba(255, 255, 255, 0.08) 70%, transparent 100%)`
              : `radial-gradient(circle at ${originX}px ${originY}px, transparent 40%, rgba(99, 102, 241, 0.12) 70%, transparent 100%)`,
          }}
        />
      </div>
    </div>
  );
};
