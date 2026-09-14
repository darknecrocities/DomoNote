import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTheme } from '../../context/theme-context';
import { useSound } from '../../context/sound-context';

export const PhysicsRopeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const { playThock, playPop } = useSound();

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Direct DOM refs for 120 FPS animation with 0 React re-renders
  const pathShadowRef = useRef<SVGPathElement>(null);
  const pathCoreRef = useRef<SVGPathElement>(null);
  const pathAccentRef = useRef<SVGPathElement>(null);
  const handleGroupRef = useRef<SVGGElement>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Physics constants
  const NUM_POINTS = 9;
  const L_REST = 54;
  const L_EXTENDED_CLICK = 95;
  const L_MAX_DRAG = 130;
  const ANCHOR_X = 50;
  const ANCHOR_Y = 10;

  // Simulation state refs
  const phaseRef = useRef<'idle' | 'pulling' | 'recoiling' | 'dragging'>('idle');
  const isDraggingRef = useRef(false);
  const dragTargetRef = useRef({ x: ANCHOR_X, y: ANCHOR_Y + L_REST });
  const themeFiredRef = useRef(false);

  // Click timing — the fix for "click not firing theme":
  // Track when pointerDown happened; if pointerUp is within 200ms, treat as a tap.
  const pointerDownTimeRef = useRef(0);

  const clickStartRef = useRef(0);
  const clickStartLenRef = useRef(ANCHOR_Y + L_REST);

  const pointsRef = useRef(
    Array.from({ length: NUM_POINTS }, (_, i) => ({
      x: ANCHOR_X,
      y: ANCHOR_Y + (i / (NUM_POINTS - 1)) * L_REST,
      vx: 0,
      vy: 0,
      waveX: 0,
      waveVx: 0,
    }))
  );

  // Fire theme switch immediately with origin coords for circular transition
  const fireThemeSwitch = useCallback(() => {
    if (themeFiredRef.current) return;
    themeFiredRef.current = true;

    try {
      playPop();
    } catch { /* audio optional */ }

    const rect = containerRef.current?.getBoundingClientRect();
    const origin = rect
      ? { x: rect.left + rect.width / 2, y: rect.bottom }
      : { x: window.innerWidth - 60, y: 60 };

    toggleTheme(origin);
  }, [toggleTheme, playPop]);

  // Physics simulation – direct DOM updates for lag-free 120 FPS
  useEffect(() => {
    let animId: number;
    const K_SPRING_Y = 0.26;
    const DAMPING_Y = 0.82;
    const K_PENDULUM_X = 0.09;
    const DAMPING_X = 0.93;

    const simulate = () => {
      const now = performance.now();
      const points = pointsRef.current;
      const lastIdx = NUM_POINTS - 1;
      const handle = points[lastIdx];

      points[0].x = ANCHOR_X;
      points[0].y = ANCHOR_Y;
      points[0].vx = 0;
      points[0].vy = 0;

      if (phaseRef.current === 'dragging') {
        const target = dragTargetRef.current;
        handle.vx = (target.x - handle.x) * 0.55;
        handle.vy = (target.y - handle.y) * 0.55;
        handle.x += handle.vx;
        handle.y += handle.vy;

        // Fire theme if dragged down far enough (drag-and-release gesture)
        const pullDist = handle.y - (ANCHOR_Y + L_REST);
        if (pullDist > 32 && !themeFiredRef.current) {
          fireThemeSwitch();
        }
      } else if (phaseRef.current === 'pulling') {
        // Animated visual snap-pull after an instant tap
        const PULL_DURATION = 90;
        const elapsed = now - clickStartRef.current;
        const progress = Math.min(1, elapsed / PULL_DURATION);
        const ease = 1 - Math.pow(1 - progress, 2);

        handle.y = clickStartLenRef.current + (L_EXTENDED_CLICK - clickStartLenRef.current) * ease;
        handle.x = ANCHOR_X + Math.sin(progress * Math.PI) * 4;

        if (progress >= 1) {
          phaseRef.current = 'recoiling';
          handle.vy = -20;
          handle.vx = (Math.random() > 0.5 ? 1 : -1) * 7.5;
          for (let i = 1; i < lastIdx; i++) {
            const wave = Math.sin((i / NUM_POINTS) * Math.PI * 2) * 7;
            points[i].waveVx = (i % 2 === 0 ? 1 : -1) * wave;
          }
        }
      } else {
        // Recoil & Idle spring physics
        const dispY = handle.y - (ANCHOR_Y + L_REST);
        const springForceY = -K_SPRING_Y * dispY;
        handle.vy = (handle.vy + springForceY) * DAMPING_Y;
        handle.y += handle.vy;

        const dispX = handle.x - ANCHOR_X;
        const springForceX = -K_PENDULUM_X * dispX;
        handle.vx = (handle.vx + springForceX) * DAMPING_X;
        handle.x += handle.vx;

        if (
          Math.abs(dispY) < 0.2 && Math.abs(handle.vy) < 0.15 &&
          Math.abs(dispX) < 0.2 && Math.abs(handle.vx) < 0.15
        ) {
          handle.y = ANCHOR_Y + L_REST;
          handle.x = ANCHOR_X;
          handle.vy = 0;
          handle.vx = 0;
          phaseRef.current = 'idle';
        }
      }

      // Intermediate rope points with transverse waves
      for (let i = 1; i < lastIdx; i++) {
        const f = i / lastIdx;
        const pt = points[i];
        pt.waveVx = (pt.waveVx - pt.waveX * 0.3) * 0.85;
        pt.waveX += pt.waveVx;
        pt.x = ANCHOR_X + (handle.x - ANCHOR_X) * f + pt.waveX;
        pt.y = ANCHOR_Y + (handle.y - ANCHOR_Y) * f;
      }

      // Build Bezier SVG path
      let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
      for (let i = 1; i < lastIdx; i++) {
        const xc = ((points[i].x + points[i + 1].x) / 2).toFixed(1);
        const yc = ((points[i].y + points[i + 1].y) / 2).toFixed(1);
        d += ` Q ${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)} ${xc} ${yc}`;
      }
      d += ` L ${handle.x.toFixed(1)} ${handle.y.toFixed(1)}`;

      // Handle angle
      const prev = points[lastIdx - 1];
      const deg = (Math.atan2(handle.y - prev.y, handle.x - prev.x) * 180) / Math.PI - 90;
      const angle = Math.max(-32, Math.min(32, deg));

      // Direct DOM writes – no React re-render needed
      pathShadowRef.current?.setAttribute('d', d);
      pathCoreRef.current?.setAttribute('d', d);
      pathAccentRef.current?.setAttribute('d', d);
      handleGroupRef.current?.setAttribute(
        'transform',
        `translate(${handle.x.toFixed(1)}, ${handle.y.toFixed(1)}) rotate(${angle.toFixed(1)})`
      );

      animId = requestAnimationFrame(simulate);
    };

    animId = requestAnimationFrame(simulate);
    return () => cancelAnimationFrame(animId);
  }, [fireThemeSwitch]);

  // --- Pointer Handlers ---

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

    try { playThock(1.2); } catch { /* optional */ }

    pointerDownTimeRef.current = performance.now();
    isDraggingRef.current = true;
    themeFiredRef.current = false;
    setIsDragging(true);
    phaseRef.current = 'dragging';

    updatePointerTarget(e);
  };

  const updatePointerTarget = (e: React.PointerEvent) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = (e.clientX - rect.left) * (100 / rect.width);
    const svgY = (e.clientY - rect.top) * (190 / rect.height);
    dragTargetRef.current = {
      x: Math.max(20, Math.min(80, svgX)),
      y: Math.max(ANCHOR_Y + L_REST - 6, Math.min(ANCHOR_Y + L_MAX_DRAG, svgY)),
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    updatePointerTarget(e);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    try { (e.target as HTMLElement).releasePointerCapture?.(e.pointerId); } catch { /* ignore */ }

    const elapsed = performance.now() - pointerDownTimeRef.current;
    const handle = pointsRef.current[NUM_POINTS - 1];

    // KEY FIX: If pointer was held < 200ms, always treat as a tap/click.
    // This avoids the false "dragged too far" reading from a single RAF tick.
    if (elapsed < 200) {
      // Fire theme switch immediately on tap
      fireThemeSwitch();

      // Visual snap-pull animation (purely cosmetic after theme fires)
      phaseRef.current = 'pulling';
      clickStartRef.current = performance.now();
      clickStartLenRef.current = handle.y - ANCHOR_Y;
    } else {
      // Long press / drag release
      if (!themeFiredRef.current) {
        // Didn't drag far enough — just snap back
      }
      phaseRef.current = 'recoiling';
      handle.vy = -19;
      handle.vx = (handle.x - ANCHOR_X) * -0.4;
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (phaseRef.current === 'idle') {
      const handle = pointsRef.current[NUM_POINTS - 1];
      handle.vx += (Math.random() > 0.5 ? 1 : -1) * 3;
      phaseRef.current = 'recoiling';
    }
  };

  const isDark = theme === 'dark';

  return (
    <div
      ref={containerRef}
      className={`relative select-none touch-none ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      title={`Pull cord: Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      aria-label="Physics pull-cord lampshade switch under appbar"
    >
      <div className="relative w-[76px] h-[190px] pointer-events-auto">
        <svg
          ref={svgRef}
          className="w-full h-full overflow-visible"
          viewBox="0 0 100 190"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <defs>
            <linearGradient id="ropeFixtureMetal" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor={isDark ? '#27272a' : '#94a3b8'} />
              <stop offset="35%"  stopColor={isDark ? '#52525b' : '#e2e8f0'} />
              <stop offset="65%"  stopColor={isDark ? '#71717a' : '#f1f5f9'} />
              <stop offset="100%" stopColor={isDark ? '#27272a' : '#94a3b8'} />
            </linearGradient>
            <linearGradient id="ropeBellMetal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor={isDark ? '#f4f4f5' : '#1e293b'} />
              <stop offset="50%"  stopColor={isDark ? '#d4d4d8' : '#0f172a'} />
              <stop offset="100%" stopColor={isDark ? '#a1a1aa' : '#020617'} />
            </linearGradient>
          </defs>

          {/* ONE-PIECE MOUNTING FIXTURE – flush against the appbar bottom */}
          <g>
            {/* Top flush plate (y=0, flush with the appbar border-bottom) */}
            <path
              d="M 30 0 L 70 0 C 70 3 67 4 64 4 L 36 4 C 33 4 30 3 30 0 Z"
              fill="url(#ropeFixtureMetal)"
            />
            {/* Screw rivets */}
            <circle cx="37" cy="2" r="1" fill={isDark ? '#18181b' : '#64748b'} />
            <circle cx="63" cy="2" r="1" fill={isDark ? '#18181b' : '#64748b'} />
            {/* Tapered collar */}
            <path
              d="M 43 4 L 57 4 L 54 9 L 46 9 Z"
              fill={isDark ? '#3f3f46' : '#cbd5e1'}
              stroke={isDark ? '#27272a' : '#94a3b8'}
              strokeWidth="0.5"
            />
            {/* Eyelet grommet */}
            <circle cx="50" cy="10" r="3" fill={isDark ? '#27272a' : '#94a3b8'} />
            <circle cx="50" cy="10" r="1.6" fill={isDark ? '#09090b' : '#334155'} />
          </g>

          {/* Rope shadow */}
          <path
            ref={pathShadowRef}
            stroke={isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.12)'}
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            transform="translate(1,2)"
          />

          {/* Rope core */}
          <path
            ref={pathCoreRef}
            stroke={isDark ? '#71717a' : '#64748b'}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Rope braided accent */}
          <path
            ref={pathAccentRef}
            stroke={isDark ? '#f4f4f5' : '#1e293b'}
            strokeWidth="0.9"
            strokeDasharray="2.5 3.5"
            strokeLinecap="round"
            fill="none"
            opacity={isDark ? 0.7 : 0.35}
          />

          {/* Bell handle group – moved by physics via direct DOM */}
          <g
            ref={handleGroupRef}
            transform={`translate(${ANCHOR_X}, ${ANCHOR_Y + L_REST}) rotate(0)`}
            style={{
              filter: isHovered || isDragging
                ? 'drop-shadow(0 6px 14px rgba(0,0,0,0.35))'
                : 'drop-shadow(0 3px 6px rgba(0,0,0,0.2))',
              transition: 'filter 0.15s ease',
            }}
          >
            {/* Ring collar */}
            <rect x="-3" y="-1" width="6" height="3" rx="1"
              fill={isDark ? '#a1a1aa' : '#475569'} />

            {/* Bell body */}
            <path
              d="M -6.5 2 L 6.5 2 L 8 16 C 8 21.5 -8 21.5 -8 16 Z"
              fill="url(#ropeBellMetal)"
              stroke={isDark ? '#52525b' : '#334155'}
              strokeWidth="1.2"
            />
            {/* Center groove */}
            <rect x="-2" y="5" width="4" height="7" rx="1"
              fill={isDark ? '#18181b' : '#ffffff'} opacity="0.85" />
            <circle cx="0" cy="18" r="1.8" fill={isDark ? '#27272a' : '#cbd5e1'} />

            {/* DARK / LIGHT badge */}
            <g transform="translate(0, 30)">
              <rect
                x="-24" y="-9" width="48" height="18" rx="9"
                fill={isDark ? '#18181b' : '#f8fafc'}
                stroke={isDark ? '#3f3f46' : '#cbd5e1'}
                strokeWidth="1.2"
              />
              <text
                x="0" y="3.5"
                textAnchor="middle"
                fill={isDark ? '#f4f4f5' : '#0f172a'}
                fontSize="7.5"
                fontWeight="800"
                fontFamily="system-ui, -apple-system, sans-serif"
                letterSpacing="0.12em"
                style={{ userSelect: 'none', pointerEvents: 'none' }}
              >
                {isDark ? 'LIGHT' : 'DARK'}
              </text>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
};
