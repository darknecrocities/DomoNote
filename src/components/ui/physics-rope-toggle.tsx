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
  const L_REST = 54; // Resting cord length
  const L_EXTENDED_CLICK = 98; // Instant click stretch
  const L_MAX_DRAG = 130; // Max stretch limit
  const ANCHOR_X = 50;
  const ANCHOR_Y = 10; // Eyelet center inside the one-piece fixture

  // Simulation physics state
  const phaseRef = useRef<'idle' | 'pulling' | 'recoiling' | 'dragging'>('idle');
  const isDraggingRef = useRef(false);
  const dragTargetRef = useRef({ x: ANCHOR_X, y: ANCHOR_Y + L_REST });
  const themeFiredInDragRef = useRef(false);

  // Immediate click snap timing
  const clickStartRef = useRef(0);
  const clickStartLenRef = useRef(L_REST);

  // Rope points: [0] = anchor, [8] = handle bob
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

  // Trigger the theme change INSTANTLY with exact coordinates for circular transition
  const fireThemeSwitch = useCallback(() => {
    try {
      playPop();
    } catch {
      // audio optional
    }

    const rect = containerRef.current?.getBoundingClientRect();
    const origin = rect
      ? { x: rect.left + rect.width / 2, y: rect.bottom }
      : { x: window.innerWidth - 60, y: 60 };

    toggleTheme(origin);
  }, [toggleTheme, playPop]);

  // Main continuous physics simulation loop (direct DOM manipulation for lag-free 120 FPS)
  useEffect(() => {
    let animId: number;

    const K_SPRING_Y = 0.26; // High responsiveness
    const DAMPING_Y = 0.82;
    const K_PENDULUM_X = 0.09;
    const DAMPING_X = 0.93;

    const simulate = () => {
      const now = performance.now();
      const points = pointsRef.current;
      const lastIdx = NUM_POINTS - 1;
      const handle = points[lastIdx];

      // 1. TOP ANCHOR: Fixed inside one-piece fixture
      points[0].x = ANCHOR_X;
      points[0].y = ANCHOR_Y;
      points[0].vx = 0;
      points[0].vy = 0;

      // 2. Physics calculation
      if (phaseRef.current === 'dragging') {
        const target = dragTargetRef.current;
        const dx = target.x - handle.x;
        const dy = target.y - handle.y;

        handle.vx = dx * 0.55;
        handle.vy = dy * 0.55;
        handle.x += handle.vx;
        handle.y += handle.vy;

        // Instant trigger the moment threshold is reached
        const pullDistance = handle.y - (ANCHOR_Y + L_REST);
        if (pullDistance > 28 && !themeFiredInDragRef.current) {
          themeFiredInDragRef.current = true;
          fireThemeSwitch();
        }
      } else if (phaseRef.current === 'pulling') {
        // Snappy click snap (instant response, 90ms swift downward pull then recoil)
        const PULL_DURATION = 90;
        const elapsed = now - clickStartRef.current;
        const progress = Math.min(1, elapsed / PULL_DURATION);
        const ease = 1 - Math.pow(1 - progress, 2);

        handle.y = clickStartLenRef.current + (L_EXTENDED_CLICK - clickStartLenRef.current) * ease;
        handle.x = ANCHOR_X + Math.sin(progress * Math.PI) * 4;

        if (progress >= 1) {
          phaseRef.current = 'recoiling';
          handle.vy = -20;
          handle.vx = (Math.random() > 0.5 ? 1 : -1) * 7.5; // realistic lateral whip momentum

          for (let i = 1; i < lastIdx; i++) {
            const wave = Math.sin((i / NUM_POINTS) * Math.PI * 2) * 7;
            points[i].waveVx = (i % 2 === 0 ? 1 : -1) * wave;
          }
        }
      } else {
        // Recoil & Idle: 2D Spring + Pendulum Physics
        const dispY = handle.y - (ANCHOR_Y + L_REST);
        const springForceY = -K_SPRING_Y * dispY;
        handle.vy = (handle.vy + springForceY) * DAMPING_Y;
        handle.y += handle.vy;

        const dispX = handle.x - ANCHOR_X;
        const springForceX = -K_PENDULUM_X * dispX;
        handle.vx = (handle.vx + springForceX) * DAMPING_X;
        handle.x += handle.vx;

        if (
          Math.abs(dispY) < 0.18 &&
          Math.abs(handle.vy) < 0.15 &&
          Math.abs(dispX) < 0.18 &&
          Math.abs(handle.vx) < 0.15
        ) {
          handle.y = ANCHOR_Y + L_REST;
          handle.x = ANCHOR_X;
          handle.vy = 0;
          handle.vx = 0;
          phaseRef.current = 'idle';
        }
      }

      // 3. Update intermediate points with transverse waves
      for (let i = 1; i < lastIdx; i++) {
        const fraction = i / lastIdx;
        const baseX = ANCHOR_X + (handle.x - ANCHOR_X) * fraction;
        const baseY = ANCHOR_Y + (handle.y - ANCHOR_Y) * fraction;

        const pt = points[i];
        pt.waveVx = (pt.waveVx - pt.waveX * 0.3) * 0.85;
        pt.waveX += pt.waveVx;

        pt.x = baseX + pt.waveX;
        pt.y = baseY;
      }

      // 4. Construct smooth Bezier SVG curve
      let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
      for (let i = 1; i < lastIdx; i++) {
        const xc = ((points[i].x + points[i + 1].x) / 2).toFixed(1);
        const yc = ((points[i].y + points[i + 1].y) / 2).toFixed(1);
        d += ` Q ${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)} ${xc} ${yc}`;
      }
      d += ` L ${handle.x.toFixed(1)} ${handle.y.toFixed(1)}`;

      // 5. Dynamic handle angle
      const prevNode = points[lastIdx - 1];
      const rad = Math.atan2(handle.y - prevNode.y, handle.x - prevNode.x);
      const deg = (rad * 180) / Math.PI - 90;
      const clampedAngle = Math.max(-32, Math.min(32, deg));

      // 6. Direct DOM update: 0 React re-renders for buttery 120 FPS
      if (pathShadowRef.current) pathShadowRef.current.setAttribute('d', d);
      if (pathCoreRef.current) pathCoreRef.current.setAttribute('d', d);
      if (pathAccentRef.current) pathAccentRef.current.setAttribute('d', d);
      if (handleGroupRef.current) {
        handleGroupRef.current.setAttribute(
          'transform',
          `translate(${handle.x.toFixed(1)}, ${handle.y.toFixed(1)}) rotate(${clampedAngle.toFixed(1)})`
        );
      }

      animId = requestAnimationFrame(simulate);
    };

    animId = requestAnimationFrame(simulate);
    return () => cancelAnimationFrame(animId);
  }, [fireThemeSwitch]);

  // Pointer Drag Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

    try {
      playThock(1.2);
    } catch {
      // audio optional
    }

    isDraggingRef.current = true;
    setIsDragging(true);
    phaseRef.current = 'dragging';
    themeFiredInDragRef.current = false;

    updatePointerTarget(e);
  };

  const updatePointerTarget = (e: React.PointerEvent) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = 100 / rect.width;
    const scaleY = 190 / rect.height;

    const svgX = (e.clientX - rect.left) * scaleX;
    const svgY = (e.clientY - rect.top) * scaleY;

    const clampedX = Math.max(20, Math.min(80, svgX));
    const clampedY = Math.max(ANCHOR_Y + L_REST - 6, Math.min(ANCHOR_Y + L_MAX_DRAG, svgY));

    dragTargetRef.current = { x: clampedX, y: clampedY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    updatePointerTarget(e);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }

    const handle = pointsRef.current[NUM_POINTS - 1];
    const pullDistance = handle.y - (ANCHOR_Y + L_REST);

    if (pullDistance < 14 && !themeFiredInDragRef.current) {
      // Instant click: Fire theme transition immediately without any delay!
      fireThemeSwitch();

      // Trigger crisp snap recoil animation
      phaseRef.current = 'pulling';
      clickStartRef.current = performance.now();
      clickStartLenRef.current = handle.y - ANCHOR_Y;
    } else {
      phaseRef.current = 'recoiling';
      handle.vy = -19;
      handle.vx = (handle.x - ANCHOR_X) * -0.4;
    }
  };

  // Hover sway nudge
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
      {/* 
        ONE-PIECE INTEGRATED FIXTURE & ROPE:
        The ceiling/appbar mounting bracket, collar, eyelet, braided cord, 
        and bell handle are all unified inside a single pixel-perfect SVG 
        starting at y=0 flush with the appbar bottom border!
      */}
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
          {/* DEFINITIONS FOR REALISTIC METALLIC LIGHTING */}
          <defs>
            <linearGradient id="fixtureMetallic" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={isDark ? '#27272a' : '#94a3b8'} />
              <stop offset="35%" stopColor={isDark ? '#52525b' : '#cbd5e1'} />
              <stop offset="65%" stopColor={isDark ? '#71717a' : '#e2e8f0'} />
              <stop offset="100%" stopColor={isDark ? '#27272a' : '#94a3b8'} />
            </linearGradient>
            <linearGradient id="bellMetallic" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isDark ? '#ffffff' : '#1e293b'} />
              <stop offset="50%" stopColor={isDark ? '#e4e4e7' : '#0f172a'} />
              <stop offset="100%" stopColor={isDark ? '#a1a1aa' : '#020617'} />
            </linearGradient>
          </defs>

          {/* 
            ONE-PIECE CEILING / APPBAR MOUNT FIXTURE
            Flush against appbar bottom border (starts at y=0)
          */}
          <g className="one-piece-lamp-base">
            {/* Top flush mounting plate sitting seamlessly on navbar line */}
            <path
              d="M 32 0 L 68 0 C 68 2.5 66 3.5 64 3.5 L 36 3.5 C 34 3.5 32 2.5 32 0 Z"
              fill="url(#fixtureMetallic)"
            />
            {/* Fastener screw rivets on mounting plate */}
            <circle cx="36" cy="1.8" r="0.9" fill={isDark ? '#18181b' : '#64748b'} />
            <circle cx="64" cy="1.8" r="0.9" fill={isDark ? '#18181b' : '#64748b'} />

            {/* Seamless tapered socket collar (continuous with top plate) */}
            <path
              d="M 42 3.5 L 58 3.5 L 54 8 L 46 8 Z"
              fill={isDark ? '#3f3f46' : '#cbd5e1'}
              stroke={isDark ? '#27272a' : '#94a3b8'}
              strokeWidth="0.6"
            />

            {/* Solid eyelet grommet from which cord emerges at (50, 10) */}
            <circle
              cx="50"
              cy="10"
              r="3.2"
              fill={isDark ? '#27272a' : '#94a3b8'}
            />
            <circle
              cx="50"
              cy="10"
              r="1.8"
              fill={isDark ? '#09090b' : '#334155'}
            />
          </g>

          {/* Flexible Hanging Braided Cord (Shadow Layer) */}
          <path
            ref={pathShadowRef}
            stroke={isDark ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.14)'}
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            transform="translate(1, 2)"
          />

          {/* Flexible Rope Core */}
          <path
            ref={pathCoreRef}
            stroke={isDark ? '#71717a' : '#64748b'}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Braided Cord Spiral Texture Accent */}
          <path
            ref={pathAccentRef}
            stroke={isDark ? '#f4f4f5' : '#0f172a'}
            strokeWidth="1"
            strokeDasharray="2.5 3.5"
            strokeLinecap="round"
            fill="none"
            opacity={isDark ? 0.75 : 0.45}
          />

          {/* Dynamic Brass Bell Pull Handle + Mode Indicator Badge */}
          <g
            ref={handleGroupRef}
            transform="translate(50, 64) rotate(0)"
            className="transition-filter duration-150"
            style={{ filter: isHovered || isDragging ? 'drop-shadow(0 6px 14px rgba(0,0,0,0.35))' : 'drop-shadow(0 3px 6px rgba(0,0,0,0.2))' }}
          >
            {/* Metallic Top Ring Collar */}
            <rect
              x="-3"
              y="-1"
              width="6"
              height="3"
              rx="1"
              fill={isDark ? '#a1a1aa' : '#475569'}
            />

            {/* Brass / Chrome Bell Weight */}
            <path
              d="M -6.5 2 L 6.5 2 L 8 16 C 8 21.5 -8 21.5 -8 16 Z"
              fill="url(#bellMetallic)"
              stroke={isDark ? '#52525b' : '#334155'}
              strokeWidth="1.2"
            />

            {/* Decorative Inset Grooves */}
            <rect
              x="-2"
              y="5"
              width="4"
              height="7"
              rx="1"
              fill={isDark ? '#18181b' : '#ffffff'}
              opacity="0.85"
            />
            <circle cx="0" cy="18" r="1.8" fill={isDark ? '#27272a' : '#cbd5e1'} />

            {/* Attached Mode Indicator Badge (Swings dynamically with the bell handle) */}
            <g transform="translate(0, 31)">
              {/* Badge Background Capsule */}
              <rect
                x="-22"
                y="-9"
                width="44"
                height="18"
                rx="9"
                fill={isDark ? '#18181b' : '#ffffff'}
                stroke={isDark ? '#3f3f46' : '#cbd5e1'}
                strokeWidth="1.2"
                className="shadow-sm"
              />

              {/* Badge Text */}
              <text
                x="0"
                y="3.5"
                textAnchor="middle"
                fill={isDark ? '#f4f4f5' : '#0f172a'}
                fontSize="7.5"
                fontWeight="800"
                fontFamily="system-ui, -apple-system, sans-serif"
                letterSpacing="0.12em"
                className="select-none pointer-events-none"
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
