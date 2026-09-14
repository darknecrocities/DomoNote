import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTheme } from '../../context/theme-context';
import { useSound } from '../../context/sound-context';
import { Moon, Sun } from 'lucide-react';

export const PhysicsRopeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { playThock, playPop } = useSound();

  const containerRef = useRef<HTMLDivElement>(null);
  const [svgPath, setSvgPath] = useState('');
  const [handleTransform, setHandleTransform] = useState({ x: 50, y: 55, angle: 0 });

  // Physics constants
  const NUM_POINTS = 9;
  const L_REST = 48; // Normal resting rope length
  const L_EXTENDED = 112; // Stretched length when pulled down
  const ANCHOR_X = 50;
  const ANCHOR_Y = 6; // Firmly fixed to the ceiling mount eyelet

  // Animation & Physics Refs
  const phaseRef = useRef<'idle' | 'pulling' | 'recoiling'>('idle');
  const pullStartTimeRef = useRef(0);
  const startLenRef = useRef(L_REST);
  const lengthRef = useRef(L_REST);
  const lengthVelRef = useRef(0);
  const themeFiredRef = useRef(false);

  // Rope segment points (anchored at points[0])
  const pointsRef = useRef(
    Array.from({ length: NUM_POINTS }, (_, i) => ({
      x: ANCHOR_X,
      y: ANCHOR_Y + (i / (NUM_POINTS - 1)) * L_REST,
      vx: 0,
      lateralOffset: 0,
    }))
  );

  // Main simulation loop
  useEffect(() => {
    let animId: number;
    const K_SPRING = 0.18; // Elastic restorative force
    const DAMPING = 0.82; // Recoil damping factor

    const simulate = () => {
      const now = performance.now();
      const points = pointsRef.current;

      // 1. BASE OF ROPE: Strictly fixed and anchored to top mount
      points[0].x = ANCHOR_X;
      points[0].y = ANCHOR_Y;

      // 2. State Machine for the Pull & Recoil Motion
      if (phaseRef.current === 'pulling') {
        const PULL_DURATION = 140; // ms to reach peak stretch
        const elapsed = now - pullStartTimeRef.current;
        const progress = Math.min(1, elapsed / PULL_DURATION);

        // Smooth cubic ease-out downward pull (simulating hand pull action)
        const ease = 1 - Math.pow(1 - progress, 2.8);
        lengthRef.current = startLenRef.current + (L_EXTENDED - startLenRef.current) * ease;

        // Keep rope taut during pull
        for (let i = 1; i < NUM_POINTS; i++) {
          points[i].vx = 0;
          points[i].lateralOffset *= 0.85;
        }

        // Trigger theme change right at peak downward stretch
        if (progress >= 1) {
          if (!themeFiredRef.current) {
            themeFiredRef.current = true;
            try {
              playPop();
            } catch {
              // sound optional
            }

            // Calculate origin point for circular wave transition
            const rect = containerRef.current?.getBoundingClientRect();
            const origin = rect
              ? { x: rect.left + rect.width / 2, y: rect.top + lengthRef.current + 20 }
              : { x: window.innerWidth - 60, y: 30 };

            toggleTheme(origin);
          }

          // Release pull! Initiate spring snap-back recoil
          phaseRef.current = 'recoiling';
          lengthVelRef.current = -19; // High upward snap velocity

          // Impart natural whip impulse along intermediate rope segments
          for (let i = 1; i < NUM_POINTS - 1; i++) {
            const wave = Math.sin((i / NUM_POINTS) * Math.PI) * 6.5;
            points[i].vx = (i % 2 === 0 ? 1 : -1) * wave;
          }
        }
      } else if (phaseRef.current === 'recoiling') {
        // Elastic spring physics: F = -k * displacement - damping * v
        const displacement = lengthRef.current - L_REST;
        const springForce = -K_SPRING * displacement;
        lengthVelRef.current = (lengthVelRef.current + springForce) * DAMPING;
        lengthRef.current += lengthVelRef.current;

        // Settle when oscillations become negligible
        if (Math.abs(displacement) < 0.25 && Math.abs(lengthVelRef.current) < 0.2) {
          lengthRef.current = L_REST;
          lengthVelRef.current = 0;
          phaseRef.current = 'idle';
        }
      }

      // 3. Update intermediate points along the rope length
      const currentLen = lengthRef.current;
      for (let i = 1; i < NUM_POINTS; i++) {
        const fraction = i / (NUM_POINTS - 1);
        points[i].y = ANCHOR_Y + fraction * currentLen;

        if (phaseRef.current === 'recoiling') {
          // Spring wave ripple along the rope as it snaps back
          const springBack = (0 - points[i].lateralOffset) * 0.22;
          points[i].vx = (points[i].vx + springBack) * 0.85;
          points[i].lateralOffset += points[i].vx;
        } else {
          // Straight vertical line when idle
          points[i].lateralOffset *= 0.8;
          points[i].vx = 0;
        }

        points[i].x = ANCHOR_X + points[i].lateralOffset;
      }

      // 4. Construct smooth Bezier SVG path
      let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
      for (let i = 1; i < NUM_POINTS - 1; i++) {
        const xc = ((points[i].x + points[i + 1].x) / 2).toFixed(1);
        const yc = ((points[i].y + points[i + 1].y) / 2).toFixed(1);
        d += ` Q ${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)} ${xc} ${yc}`;
      }
      const last = points[NUM_POINTS - 1];
      d += ` L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
      setSvgPath(d);

      // 5. Compute handle position and dynamic angle
      const prev = points[NUM_POINTS - 2];
      const angle = (Math.atan2(last.y - prev.y, last.x - prev.x) * 180) / Math.PI - 90;

      setHandleTransform({
        x: last.x,
        y: last.y,
        angle: Math.max(-25, Math.min(25, angle)),
      });

      animId = requestAnimationFrame(simulate);
    };

    animId = requestAnimationFrame(simulate);
    return () => cancelAnimationFrame(animId);
  }, [toggleTheme, playPop]);

  // Click / Drag handler: Triggers the pull-down stretch & spring recoil motion
  const handleTriggerPull = useCallback(
    (e: React.MouseEvent) => {
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }
      // Prevent interrupting an active downward pull
      if (phaseRef.current === 'pulling') return;

      try {
        playThock(1.1);
      } catch {
        // sound optional
      }

      phaseRef.current = 'pulling';
      pullStartTimeRef.current = performance.now();
      startLenRef.current = lengthRef.current;
      themeFiredRef.current = false;
    },
    [playThock]
  );

  const isDark = theme === 'dark';

  return (
    <div
      ref={containerRef}
      onClick={handleTriggerPull}
      className="fixed top-0 right-3 sm:right-6 w-[70px] h-[160px] z-[60] cursor-pointer select-none touch-none flex flex-col items-center group transition-transform"
      title={`Pull cord switch: Toggle ${isDark ? 'Light' : 'Dark'} Mode (Spring Physics)`}
      aria-label="Lampshade rope switch with spring recoil physics"
    >
      <svg className="w-full h-full overflow-visible pointer-events-auto" viewBox="0 0 100 180">
        {/* Rigid Ceiling Mount Fixture */}
        <g className="physics-rope-ceiling-mount">
          <rect
            x="36"
            y="0"
            width="28"
            height="4"
            rx="1"
            fill={isDark ? '#27272a' : '#cbd5e1'}
            className="transition-colors duration-200"
          />
          <rect
            x="43"
            y="3.5"
            width="14"
            height="3.5"
            rx="1"
            fill={isDark ? '#18181b' : '#94a3b8'}
            className="transition-colors duration-200"
          />
          <circle
            cx="50"
            cy="6.5"
            r="2.5"
            fill={isDark ? '#3f3f46' : '#64748b'}
            className="transition-colors duration-200"
          />
        </g>

        {/* Flexible Hanging Rope (Core) */}
        <path
          d={svgPath}
          stroke={isDark ? '#52525b' : '#94a3b8'}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="transition-colors duration-200"
        />

        {/* Braided Cord Texture Accent */}
        <path
          d={svgPath}
          stroke={isDark ? '#ffffff' : '#0f172a'}
          strokeWidth="0.8"
          strokeDasharray="2 3"
          strokeLinecap="round"
          fill="none"
          opacity="0.65"
        />

        {/* Pull Handle Bell Bead & Tag (Moves dynamically with rope) */}
        <g
          transform={`translate(${handleTransform.x}, ${handleTransform.y}) rotate(${handleTransform.angle})`}
          className="cursor-pointer transition-all duration-150 filter group-hover:drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)] dark:group-hover:drop-shadow-[0_4px_12px_rgba(255,255,255,0.2)]"
        >
          {/* Metallic Top Collar Ring */}
          <rect
            x="-2.5"
            y="-1"
            width="5"
            height="2.5"
            rx="1"
            fill={isDark ? '#71717a' : '#64748b'}
          />

          {/* Brass / Silver Bell Pull Weight */}
          <path
            d="M -5.5 1.5 L 5.5 1.5 L 7 14 C 7 18 -7 18 -7 14 Z"
            fill={isDark ? '#ffffff' : '#0f172a'}
            stroke={isDark ? '#3f3f46' : '#cbd5e1'}
            strokeWidth="1.2"
            className="transition-colors duration-200"
          />
          {/* Center decorative notch */}
          <rect
            x="-1.5"
            y="5"
            width="3"
            height="6"
            rx="0.8"
            fill={isDark ? '#18181b' : '#ffffff'}
            opacity="0.8"
          />
          <circle cx="0" cy="15.5" r="1.8" fill={isDark ? '#27272a' : '#cbd5e1'} />

          {/* Attached Mode Indicator Tag Badge */}
          <g transform="translate(0, 26)">
            <rect
              x="-20"
              y="-7.5"
              width="40"
              height="15"
              rx="7.5"
              fill={isDark ? '#18181b' : '#ffffff'}
              stroke={isDark ? '#3f3f46' : '#cbd5e1'}
              strokeWidth="1.2"
              className="shadow-md transition-colors duration-200"
            />
            <text
              x="0"
              y="3"
              textAnchor="middle"
              fill={isDark ? '#f4f4f5' : '#0f172a'}
              fontSize="7"
              fontWeight="800"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="0.12em"
              className="select-none pointer-events-none transition-colors duration-200"
            >
              {isDark ? 'LIGHT' : 'DARK'}
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
};
