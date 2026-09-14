import React, { useEffect, useRef, useState, useCallback } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  threshold?: number;
  /** If true, section also fades out as it scrolls away (default: true) */
  fadeOut?: boolean;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  delayMs = 0,
  direction = 'up',
  threshold = 0.12,
  fadeOut = true,
}) => {
  const [state, setState] = useState<'hidden' | 'visible' | 'exiting'>('hidden');
  const domRef = useRef<HTMLDivElement>(null);

  const updateState = useCallback(() => {
    const el = domRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;

    // Fully above viewport (scrolled past)
    if (rect.bottom < 0) {
      if (fadeOut) setState('hidden');
      return;
    }
    // Fully below viewport
    if (rect.top > vh) {
      setState('hidden');
      return;
    }

    // Exiting: top is being scrolled past the upper portion of the viewport
    if (fadeOut && rect.top < -rect.height * 0.15) {
      setState('exiting');
      return;
    }

    // Entering: element is sufficiently visible
    const visiblePx = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
    const visibleRatio = visiblePx / rect.height;
    if (visibleRatio >= threshold) {
      setState('visible');
    }
  }, [fadeOut, threshold]);

  useEffect(() => {
    const el = domRef.current;
    if (!el) return;

    // IntersectionObserver for entry
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState('visible');
        }
      },
      { threshold, rootMargin: '0px 0px -30px 0px' }
    );
    observer.observe(el);

    // Scroll listener for exit fade-out
    const onScroll = () => {
      if (!fadeOut) return;
      updateState();
    };

    const scrollParent = document.documentElement;
    scrollParent.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      observer.unobserve(el);
      scrollParent.removeEventListener('scroll', onScroll);
      window.removeEventListener('scroll', onScroll);
    };
  }, [threshold, fadeOut, updateState]);

  const directionClasses: Record<string, string> = {
    up: 'translate-y-10',
    down: '-translate-y-10',
    left: 'translate-x-8',
    right: '-translate-x-8',
    none: 'scale-95',
  };

  const hiddenClasses = `opacity-0 ${directionClasses[direction]}`;
  const exitingClasses = 'opacity-0 -translate-y-6 scale-[0.97]';
  const visibleClasses = 'opacity-100 translate-x-0 translate-y-0 scale-100';

  return (
    <div
      ref={domRef}
      style={{ transitionDelay: state === 'visible' ? `${delayMs}ms` : '0ms' }}
      className={`transition-all duration-700 ease-out will-change-transform ${
        state === 'visible'
          ? visibleClasses
          : state === 'exiting'
          ? exitingClasses
          : hiddenClasses
      } ${className}`}
    >
      {children}
    </div>
  );
};
