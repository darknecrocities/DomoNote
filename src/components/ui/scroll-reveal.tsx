import React, { useEffect, useRef, useState } from 'react';

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

  useEffect(() => {
    const el = domRef.current;
    if (!el) return;

    // Use IntersectionObserver natively for 0-CPU, 0-scroll-listener performance
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting) {
          setState('visible');
        } else if (fadeOut) {
          if (entry.boundingClientRect.top < 0) {
            setState('exiting');
          } else {
            setState('hidden');
          }
        }
      },
      {
        threshold: [0, threshold],
        rootMargin: '20px 0px -40px 0px',
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [threshold, fadeOut]);

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
