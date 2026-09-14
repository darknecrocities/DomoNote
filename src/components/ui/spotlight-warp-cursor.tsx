import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../context/theme-context';

export const SpotlightWarpCursor: React.FC = () => {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // References for smooth physics
  const spotlightRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);

  const mousePos = useRef({ x: -100, y: -100 });
  const prevMousePos = useRef({ x: -100, y: -100 });
  const spotlightPos = useRef({ x: -100, y: -100 });
  const haloPos = useRef({ x: -100, y: -100 });
  const isHoveringRef = useRef(false);
  const isClickingRef = useRef(false);

  useEffect(() => {
    // Detect touch device
    if (window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window) {
      setIsTouchDevice(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseDown = () => {
      isClickingRef.current = true;
      setIsClicking(true);
    };

    const handleMouseUp = () => {
      isClickingRef.current = false;
      setIsClicking(false);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    // Detect interactive elements under cursor
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest(
        'button, a, input, textarea, select, [role="button"], .cursor-pointer, [data-interactive="true"], summary'
      );

      if (interactive) {
        isHoveringRef.current = true;
        setIsHovering(true);
      } else {
        isHoveringRef.current = false;
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseover', handleMouseOver, { passive: true });
    document.body.addEventListener('mouseleave', handleMouseLeave);
    document.body.addEventListener('mouseenter', handleMouseEnter);

    // 60FPS physics animation loop
    let animId: number;
    let currentScale = 1;
    let currentStretch = 1;
    let currentAngle = 0;

    const render = () => {
      const targetX = mousePos.current.x;
      const targetY = mousePos.current.y;

      // Calculate velocity for dynamic warp stretch
      const vx = targetX - prevMousePos.current.x;
      const vy = targetY - prevMousePos.current.y;
      prevMousePos.current = { x: targetX, y: targetY };
      const speed = Math.sqrt(vx * vx + vy * vy);

      // Smooth lag for spotlight (softer, fluid motion)
      spotlightPos.current.x += (targetX - spotlightPos.current.x) * 0.12;
      spotlightPos.current.y += (targetY - spotlightPos.current.y) * 0.12;

      // Snappier lag for halo ring
      haloPos.current.x += (targetX - haloPos.current.x) * 0.28;
      haloPos.current.y += (targetY - haloPos.current.y) * 0.28;

      // Calculate stretch & warp
      const targetStretch = isHoveringRef.current
        ? 1 + Math.min(speed * 0.015, 0.45)
        : 1 + Math.min(speed * 0.008, 0.25);
      currentStretch += (targetStretch - currentStretch) * 0.2;

      // Calculate warp scale based on hover/clicking
      let targetScale = 1;
      if (isClickingRef.current) {
        targetScale = isHoveringRef.current ? 1.6 : 0.8;
      } else if (isHoveringRef.current) {
        targetScale = 2.2;
      }
      currentScale += (targetScale - currentScale) * 0.18;

      if (speed > 1.5) {
        const targetAngle = (Math.atan2(vy, vx) * 180) / Math.PI;
        currentAngle += (targetAngle - currentAngle) * 0.2;
      }

      // Update Spotlight position
      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate3d(${spotlightPos.current.x}px, ${spotlightPos.current.y}px, 0)`;
      }

      // Update Halo Warp Ring
      if (haloRef.current) {
        haloRef.current.style.transform = `translate3d(${haloPos.current.x}px, ${haloPos.current.y}px, 0) rotate(${currentAngle}deg) scale(${currentScale * currentStretch}, ${currentScale / currentStretch})`;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseOver);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible]);

  if (isTouchDevice) return null;

  const isDark = theme === 'dark';

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-[9999] overflow-hidden transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      aria-hidden="true"
    >
      {/* 1. Large Fluid Spotlight Layer */}
      <div
        ref={spotlightRef}
        className={`absolute -top-[250px] -left-[250px] w-[500px] h-[500px] rounded-full will-change-transform transition-opacity duration-300 pointer-events-none ${
          isHovering
            ? isDark
              ? 'opacity-90 scale-110'
              : 'opacity-70 scale-110'
            : isDark
            ? 'opacity-50 scale-100'
            : 'opacity-35 scale-100'
        }`}
        style={{
          background: isDark
            ? isHovering
              ? 'radial-gradient(circle, rgba(255, 255, 255, 0.13) 0%, rgba(200, 220, 255, 0.05) 35%, transparent 70%)'
              : 'radial-gradient(circle, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.02) 40%, transparent 70%)'
            : isHovering
            ? 'radial-gradient(circle, rgba(0, 0, 0, 0.06) 0%, rgba(0, 0, 0, 0.02) 45%, transparent 70%)'
            : 'radial-gradient(circle, rgba(0, 0, 0, 0.03) 0%, rgba(0, 0, 0, 0.01) 45%, transparent 70%)',
          filter: 'blur(24px)',
          transition: 'opacity 0.25s ease, transform 0.05s linear',
        }}
      />

      {/* 2. Fluid Blended Cursor Follower (Borderless Difference Blend) */}
      <div
        ref={haloRef}
        className="absolute -top-4 -left-4 w-8 h-8 rounded-full will-change-transform pointer-events-none transition-opacity duration-200"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.5) 42%, transparent 75%)',
          mixBlendMode: 'difference',
          filter: 'blur(2px)',
          opacity: isHovering ? 0.85 : 0.45,
        }}
      />
    </div>
  );
};

