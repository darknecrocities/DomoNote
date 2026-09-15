import React, { useRef, useCallback, useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxTilt?: number;
  perspective?: number;
  scale?: number;
  glare?: boolean;
  disabled?: boolean;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className,
  maxTilt = 6,
  perspective = 1000,
  scale = 1.015,
  glare = true,
  disabled = false,
  style,
  onMouseMove,
  onMouseEnter,
  onMouseLeave,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      onMouseMove?.(e);
      if (disabled) return;
      if (!cardRef.current) return;
      if (
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        return;
      }

      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        if (!cardRef.current) return;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -maxTilt;
        const rotateY = ((x - centerX) / centerX) * maxTilt;

        cardRef.current.style.transform = `perspective(${perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`;
        cardRef.current.style.transition = 'transform 0.08s ease-out';

        if (glare && glareRef.current) {
          glareRef.current.style.opacity = '1';
          glareRef.current.style.background = `radial-gradient(${rect.width * 0.85}px circle at ${x}px ${y}px, rgba(255, 255, 255, 0.09), transparent 70%)`;
        }
      });
    },
    [disabled, maxTilt, perspective, scale, glare, onMouseMove]
  );

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      onMouseEnter?.(e);
      if (cardRef.current) {
        cardRef.current.style.transition = 'transform 0.12s ease-out';
      }
    },
    [onMouseEnter]
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      onMouseLeave?.(e);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (cardRef.current) {
        cardRef.current.style.transition = 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)';
        cardRef.current.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      }
      if (glareRef.current) {
        glareRef.current.style.opacity = '0';
      }
    },
    [perspective, onMouseLeave]
  );

  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        ...style,
      }}
      className={twMerge(
        clsx(
          'relative overflow-hidden transition-shadow duration-200',
          className
        )
      )}
      {...props}
    >
      {glare && (
        <div
          ref={glareRef}
          className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 z-20"
          aria-hidden="true"
        />
      )}
      <div className="relative z-10 h-auto min-h-full w-full">{children}</div>
    </div>
  );
};
