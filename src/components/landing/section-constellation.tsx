import React, { useEffect, useRef } from 'react';

export type ConstellationVariant =
  | 'neural-clusters'
  | 'quantum-lattice'
  | 'synaptic-flow'
  | 'harmonic-wave'
  | 'audio-nodes'
  | 'stellar-vortex'
  | 'crystalline-polyhedra';

interface SectionConstellationProps {
  variant: ConstellationVariant;
  className?: string;
  opacity?: number;
  mascotExclusionRef?: React.RefObject<HTMLElement | null>;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  phase: number;
  color: string;
  glowColor: string;
  clusterId?: number;
}

interface SignalPulse {
  fromIdx: number;
  toIdx: number;
  progress: number; // 0 to 1
  speed: number;
}

export const SectionConstellation: React.FC<SectionConstellationProps> = ({
  variant,
  className = '',
  opacity = 1.0,
  mascotExclusionRef,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animIdRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    // Cap DPR at 1 for ambient canvas particles: visually identical but 4x lower memory and GPU fill rate
    const dpr = 1;

    let cachedMascotEx: { cx: number; cy: number; radius: number; radiusSq: number } | null = null;
    const updateMascotExclusion = () => {
      if (!mascotExclusionRef?.current || !canvas) {
        cachedMascotEx = null;
        return;
      }
      const mascotRect = mascotExclusionRef.current.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      const cx = mascotRect.left - canvasRect.left + mascotRect.width / 2;
      const cy = mascotRect.top - canvasRect.top + mascotRect.height / 2;
      const radius = Math.max(mascotRect.width, mascotRect.height) * 0.55;
      cachedMascotEx = { cx, cy, radius, radiusSq: radius * radius };
    };

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      updateMascotExclusion();
    };

    resize();
    window.addEventListener('resize', resize);

    const particles: Particle[] = [];
    const pulses: SignalPulse[] = [];
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    // Pure brilliant white palette across all variants with tailored topologies
    const getThemeConfig = () => {
      const whiteColors = ['255, 255, 255', '248, 250, 252', '241, 245, 249', '255, 255, 255'];
      switch (variant) {
        case 'neural-clusters':
          return {
            colors: whiteColors,
            lineDist: isMobile ? 120 : 160,
            count: isMobile ? 36 : 68,
          };
        case 'quantum-lattice':
          return {
            colors: whiteColors,
            lineDist: isMobile ? 110 : 145,
            count: isMobile ? 38 : 70,
          };
        case 'synaptic-flow':
          return {
            colors: whiteColors,
            lineDist: isMobile ? 115 : 155,
            count: isMobile ? 36 : 64,
          };
        case 'harmonic-wave':
          return {
            colors: whiteColors,
            lineDist: isMobile ? 125 : 165,
            count: isMobile ? 40 : 72,
          };
        case 'audio-nodes':
          return {
            colors: whiteColors,
            lineDist: isMobile ? 120 : 160,
            count: isMobile ? 38 : 68,
          };
        case 'stellar-vortex':
          return {
            colors: whiteColors,
            lineDist: isMobile ? 115 : 155,
            count: isMobile ? 40 : 70,
          };
        case 'crystalline-polyhedra':
        default:
          return {
            colors: whiteColors,
            lineDist: isMobile ? 120 : 160,
            count: isMobile ? 36 : 65,
          };
      }
    };

    const theme = getThemeConfig();

    // Initialize particles with delicate star nodes
    const init = () => {
      particles.length = 0;
      pulses.length = 0;

      if (variant === 'neural-clusters') {
        const clusterCenters = [
          { x: width * 0.22, y: height * 0.3 },
          { x: width * 0.8, y: height * 0.35 },
          { x: width * 0.5, y: height * 0.72 },
        ];
        for (let i = 0; i < theme.count; i++) {
          const cIdx = i % clusterCenters.length;
          const center = clusterCenters[cIdx];
          const dist = Math.random() * (width * 0.28);
          const angle = Math.random() * Math.PI * 2;
          const col = theme.colors[i % theme.colors.length];
          particles.push({
            x: center.x + Math.cos(angle) * dist,
            y: center.y + Math.sin(angle) * dist,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            radius: Math.random() * 1.3 + 1.2,
            baseAlpha: Math.random() * 0.35 + 0.65,
            phase: Math.random() * Math.PI * 2,
            color: col,
            glowColor: 'rgba(255, 255, 255, 0.75)',
            clusterId: cIdx,
          });
        }
      } else if (variant === 'quantum-lattice') {
        const cols = isMobile ? 7 : 12;
        const rows = isMobile ? 5 : 7;
        const xStep = width / (cols + 1);
        const yStep = height / (rows + 1);
        for (let r = 1; r <= rows; r++) {
          for (let c = 1; c <= cols; c++) {
            const col = theme.colors[Math.floor(Math.random() * theme.colors.length)];
            particles.push({
              x: c * xStep + (Math.random() - 0.5) * 22,
              y: r * yStep + (Math.random() - 0.5) * 22,
              vx: (Math.random() - 0.5) * 0.25,
              vy: (Math.random() - 0.5) * 0.25,
              radius: Math.random() * 1.2 + 1.2,
              baseAlpha: Math.random() * 0.3 + 0.7,
              phase: Math.random() * Math.PI * 2,
              color: col,
              glowColor: 'rgba(255, 255, 255, 0.75)',
            });
          }
        }
      } else if (variant === 'harmonic-wave' || variant === 'audio-nodes') {
        for (let i = 0; i < theme.count; i++) {
          const col = theme.colors[i % theme.colors.length];
          particles.push({
            x: (i / theme.count) * width + (Math.random() - 0.5) * 40,
            y: height * 0.5 + (Math.random() - 0.5) * (height * 0.45),
            vx: 0.35 + Math.random() * 0.25,
            vy: (Math.random() - 0.5) * 0.3,
            radius: Math.random() * 1.3 + 1.2,
            baseAlpha: Math.random() * 0.35 + 0.65,
            phase: (i / theme.count) * Math.PI * 4,
            color: col,
            glowColor: 'rgba(255, 255, 255, 0.75)',
          });
        }
      } else if (variant === 'stellar-vortex') {
        const cx = width * 0.5;
        const cy = height * 0.5;
        for (let i = 0; i < theme.count; i++) {
          const arm = i % 3;
          const dist = Math.pow(Math.random(), 0.75) * (width * 0.5);
          const angle = arm * ((Math.PI * 2) / 3) + dist * 0.006 + Math.random() * 0.5;
          const col = theme.colors[Math.floor(Math.random() * theme.colors.length)];
          particles.push({
            x: cx + Math.cos(angle) * dist,
            y: cy + Math.sin(angle) * dist,
            vx: 0,
            vy: 0,
            radius: Math.random() * 1.3 + 1.1,
            baseAlpha: Math.random() * 0.3 + 0.7,
            phase: angle,
            color: col,
            glowColor: 'rgba(255, 255, 255, 0.75)',
          });
        }
      } else {
        for (let i = 0; i < theme.count; i++) {
          const col = theme.colors[i % theme.colors.length];
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.45,
            vy: (Math.random() - 0.5) * 0.45,
            radius: Math.random() * 1.3 + 1.2,
            baseAlpha: Math.random() * 0.35 + 0.65,
            phase: Math.random() * Math.PI * 2,
            color: col,
            glowColor: 'rgba(255, 255, 255, 0.75)',
          });
        }
      }
    };

    init();

    let isVisible = !document.hidden;
    let isIntersecting = false;
    let isRunning = false;

    const startLoop = () => {
      if (isRunning || !isVisible || !isIntersecting || opacity <= 0) return;
      isRunning = true;
      animIdRef.current = requestAnimationFrame(render);
    };

    const stopLoop = () => {
      isRunning = false;
      if (animIdRef.current) {
        cancelAnimationFrame(animIdRef.current);
        animIdRef.current = 0;
      }
    };

    const handleVis = () => {
      isVisible = !document.hidden;
      if (isVisible && isIntersecting && opacity > 0) {
        startLoop();
      } else {
        stopLoop();
      }
    };
    document.addEventListener('visibilitychange', handleVis);

    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting;
        if (isIntersecting && isVisible && opacity > 0) {
          startLoop();
        } else {
          stopLoop();
        }
      },
      { rootMargin: '60px 0px 60px 0px' }
    );
    observer.observe(canvas);

    let time = 0;
    let lastTimestamp = 0;

    const render = (timestamp: number) => {
      if (!isRunning) return;

      // Throttle to 60fps on 120Hz promotion screens to save GPU cycles & avoid stutter
      if (timestamp - lastTimestamp < 15) {
        animIdRef.current = requestAnimationFrame(render);
        return;
      }
      lastTimestamp = timestamp;

      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      const mascotEx = cachedMascotEx;
      const connectionDist = theme.lineDist;
      const connDistSq = connectionDist * connectionDist;

      // Update positions
      if (variant === 'stellar-vortex') {
        const cx = width * 0.5;
        const cy = height * 0.5;
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.phase += 0.003;
          const dx = p.x - cx;
          const dy = p.y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          p.x = cx + Math.cos(p.phase) * dist;
          p.y = cy + Math.sin(p.phase) * dist;
        }
      } else if (variant === 'harmonic-wave' || variant === 'audio-nodes') {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.vx;
          if (p.x > width + 40) p.x = -40;
          const waveHeight = height * 0.32;
          p.y =
            height * 0.5 +
            Math.sin(p.x * 0.007 + time * 1.3 + p.phase) * waveHeight +
            Math.cos(p.x * 0.012 - time * 0.85) * (waveHeight * 0.45);
        }
      } else {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 10) { p.x = 10; p.vx *= -1; }
          if (p.x > width - 10) { p.x = width - 10; p.vx *= -1; }
          if (p.y < 10) { p.y = 10; p.vy *= -1; }
          if (p.y > height - 10) { p.y = height - 10; p.vy *= -1; }
        }
      }

      // Collect connected pairs for lines and pulses
      const activePairs: Array<{ p1: Particle; p2: Particle; idx1: number; idx2: number; factor: number }> = [];
      let linesDrawn = 0;
      const MAX_LINES = 48;

      for (let i = 0; i < particles.length && linesDrawn < MAX_LINES; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length && linesDrawn < MAX_LINES; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          if (Math.abs(dx) >= connectionDist) continue;
          const dy = p1.y - p2.y;
          if (Math.abs(dy) >= connectionDist) continue;
          const distSq = dx * dx + dy * dy;

          if (distSq < connDistSq) {
            const dist = Math.sqrt(distSq);
            const factor = 1 - dist / connectionDist;
            let lineAlpha = factor * 0.42;

            // Protect mascot face without calling getBoundingClientRect
            if (mascotEx) {
              const midX = (p1.x + p2.x) / 2;
              const midY = (p1.y + p2.y) / 2;
              const dMascotSq = Math.pow(midX - mascotEx.cx, 2) + Math.pow(midY - mascotEx.cy, 2);
              if (dMascotSq < mascotEx.radiusSq * 0.5625) {
                lineAlpha *= 0.05;
              }
            }

            if (lineAlpha > 0.04) {
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha})`;
              ctx.lineWidth = Math.max(0.7, factor * 1.4);
              ctx.stroke();

              linesDrawn++;
              activePairs.push({ p1, p2, idx1: i, idx2: j, factor });
            }
          }
        }
      }

      // Occasional traveling bright white photon pulses
      if (Math.random() < 0.06 && activePairs.length > 0 && pulses.length < 8) {
        const pair = activePairs[Math.floor(Math.random() * activePairs.length)];
        pulses.push({
          fromIdx: pair.idx1,
          toIdx: pair.idx2,
          progress: 0,
          speed: 0.018 + Math.random() * 0.02,
        });
      }

      // Draw white signal pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pulse = pulses[i];
        pulse.progress += pulse.speed;
        if (pulse.progress >= 1) {
          pulses.splice(i, 1);
          continue;
        }

        const pA = particles[pulse.fromIdx];
        const pB = particles[pulse.toIdx];
        if (!pA || !pB) {
          pulses.splice(i, 1);
          continue;
        }

        const px = pA.x + (pB.x - pA.x) * pulse.progress;
        const py = pA.y + (pB.y - pA.y) * pulse.progress;

        // Outer soft glow
        ctx.beginPath();
        ctx.arc(px, py, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.fill();

        // Inner bright point
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }

      // Draw all white constellation stars & nodes
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const pulseFactor = 0.88 + Math.sin(time * 2.2 + p.phase) * 0.12;
        let alpha = p.baseAlpha * pulseFactor;

        if (mascotEx) {
          const dMascotSq = Math.pow(p.x - mascotEx.cx, 2) + Math.pow(p.y - mascotEx.cy, 2);
          if (dMascotSq < mascotEx.radiusSq) {
            alpha *= 0.05;
          }
        }

        const curRadius = p.radius * pulseFactor;

        // 1. Soft Pure White Outer Halo
        ctx.beginPath();
        ctx.arc(p.x, p.y, curRadius * 2.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.22})`;
        ctx.fill();

        // 2. Pure White Star Core (Bright, Sharp, Crisp)
        ctx.beginPath();
        ctx.arc(p.x, p.y, curRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, alpha * 1.2)})`;
        ctx.fill();
      }

      if (isRunning) {
        animIdRef.current = requestAnimationFrame(render);
      }
    };

    return () => {
      stopLoop();
      observer.disconnect();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVis);
    };
  }, [variant, mascotExclusionRef, opacity]);

  if (opacity <= 0) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none will-change-transform ${className}`}
      style={{
        opacity,
        zIndex: 0,
      }}
    />
  );
};
