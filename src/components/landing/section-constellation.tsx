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
  z?: number;
  vx: number;
  vy: number;
  vz?: number;
  radius: number;
  baseAlpha: number;
  phase: number;
  color: string;
  clusterId?: number;
}

export const SectionConstellation: React.FC<SectionConstellationProps> = ({
  variant,
  className = '',
  opacity = 0.85,
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
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const particles: Particle[] = [];
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    // Helper palette generator
    const getPalette = () => {
      switch (variant) {
        case 'neural-clusters':
          return ['255, 255, 255', '228, 228, 231', '52, 211, 153', '161, 161, 170'];
        case 'quantum-lattice':
          return ['56, 189, 248', '147, 197, 253', '255, 255, 255', '96, 165, 250'];
        case 'synaptic-flow':
          return ['52, 211, 153', '110, 231, 183', '255, 255, 255', '16, 185, 129'];
        case 'harmonic-wave':
          return ['168, 85, 247', '192, 132, 252', '255, 255, 255', '216, 180, 254'];
        case 'audio-nodes':
          return ['16, 185, 129', '52, 211, 153', '255, 255, 255', '110, 231, 183'];
        case 'stellar-vortex':
          return ['251, 191, 36', '253, 230, 138', '255, 255, 255', '245, 158, 11'];
        case 'crystalline-polyhedra':
        default:
          return ['228, 228, 231', '255, 255, 255', '161, 161, 170', '52, 211, 153'];
      }
    };

    const palette = getPalette();

    // Initialize particles based on variant
    const initParticles = () => {
      particles.length = 0;
      const count = isMobile ? 26 : 54;

      if (variant === 'neural-clusters') {
        const clusterCenters = [
          { x: width * 0.25, y: height * 0.35 },
          { x: width * 0.75, y: height * 0.4 },
          { x: width * 0.5, y: height * 0.75 },
        ];
        for (let i = 0; i < count; i++) {
          const cIdx = i % clusterCenters.length;
          const center = clusterCenters[cIdx];
          const dist = Math.random() * (width * 0.22);
          const angle = Math.random() * Math.PI * 2;
          particles.push({
            x: center.x + Math.cos(angle) * dist,
            y: center.y + Math.sin(angle) * dist,
            z: (Math.random() - 0.5) * 200,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            radius: Math.random() * 2 + 1,
            baseAlpha: Math.random() * 0.5 + 0.3,
            phase: Math.random() * Math.PI * 2,
            color: palette[i % palette.length],
            clusterId: cIdx,
          });
        }
      } else if (variant === 'quantum-lattice') {
        const cols = isMobile ? 6 : 10;
        const rows = isMobile ? 4 : 6;
        const xStep = width / (cols + 1);
        const yStep = height / (rows + 1);
        for (let r = 1; r <= rows; r++) {
          for (let c = 1; c <= cols; c++) {
            particles.push({
              x: c * xStep + (Math.random() - 0.5) * 20,
              y: r * yStep + (Math.random() - 0.5) * 20,
              vx: (Math.random() - 0.5) * 0.25,
              vy: (Math.random() - 0.5) * 0.25,
              radius: Math.random() * 1.8 + 1.2,
              baseAlpha: Math.random() * 0.4 + 0.3,
              phase: Math.random() * Math.PI * 2,
              color: palette[Math.floor(Math.random() * palette.length)],
            });
          }
        }
      } else if (variant === 'harmonic-wave' || variant === 'audio-nodes') {
        for (let i = 0; i < count; i++) {
          particles.push({
            x: (i / count) * width + (Math.random() - 0.5) * 30,
            y: height * 0.5 + (Math.random() - 0.5) * (height * 0.4),
            vx: 0.3 + Math.random() * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            radius: Math.random() * 2.2 + 1,
            baseAlpha: Math.random() * 0.5 + 0.35,
            phase: (i / count) * Math.PI * 4,
            color: palette[i % palette.length],
          });
        }
      } else if (variant === 'stellar-vortex') {
        const cx = width * 0.5;
        const cy = height * 0.5;
        for (let i = 0; i < count; i++) {
          const arm = i % 3;
          const dist = Math.pow(Math.random(), 0.7) * (width * 0.45);
          const angle = arm * ((Math.PI * 2) / 3) + dist * 0.005 + Math.random() * 0.4;
          particles.push({
            x: cx + Math.cos(angle) * dist,
            y: cy + Math.sin(angle) * dist,
            vx: 0,
            vy: 0,
            radius: Math.random() * 1.8 + 0.8,
            baseAlpha: Math.random() * 0.5 + 0.3,
            phase: angle,
            color: palette[Math.floor(Math.random() * palette.length)],
          });
        }
      } else {
        // crystalline-polyhedra or synaptic-flow
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            radius: Math.random() * 2 + 1,
            baseAlpha: Math.random() * 0.5 + 0.3,
            phase: Math.random() * Math.PI * 2,
            color: palette[i % palette.length],
          });
        }
      }
    };

    initParticles();

    // Check mascot exclusion zone
    const getMascotExclusion = () => {
      if (!mascotExclusionRef?.current) return null;
      const mascotRect = mascotExclusionRef.current.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      const cx = mascotRect.left - canvasRect.left + mascotRect.width / 2;
      const cy = mascotRect.top - canvasRect.top + mascotRect.height / 2;
      const radius = Math.max(mascotRect.width, mascotRect.height) * 0.55;
      return { cx, cy, radius };
    };

    let isVisible = true;
    const handleVis = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVis);

    let time = 0;

    const render = () => {
      if (!isVisible) {
        animIdRef.current = requestAnimationFrame(render);
        return;
      }

      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      const mascotEx = getMascotExclusion();
      const connectionDist = isMobile ? 85 : 120;

      // Update and draw particles according to constellation rules
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
          // Undulate in harmonic sine waves
          const waveHeight = height * 0.28;
          p.y =
            height * 0.5 +
            Math.sin(p.x * 0.008 + time * 1.2 + p.phase) * waveHeight +
            Math.cos(p.x * 0.014 - time * 0.8) * (waveHeight * 0.4);
        }
      } else {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) { p.x = 0; p.vx *= -1; }
          if (p.x > width) { p.x = width; p.vx *= -1; }
          if (p.y < 0) { p.y = 0; p.vy *= -1; }
          if (p.y > height) { p.y = height; p.vy *= -1; }
        }
      }

      // Draw constellation lines
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDist) {
            const factor = 1 - dist / connectionDist;
            let lineAlpha = factor * 0.3 * Math.min(p1.baseAlpha, p2.baseAlpha);

            // Mascot face protection
            if (mascotEx) {
              const midX = (p1.x + p2.x) / 2;
              const midY = (p1.y + p2.y) / 2;
              const dToMascot = Math.sqrt(
                Math.pow(midX - mascotEx.cx, 2) + Math.pow(midY - mascotEx.cy, 2)
              );
              if (dToMascot < mascotEx.radius * 0.8) {
                lineAlpha *= 0.05;
              }
            }

            if (lineAlpha > 0.01) {
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(${p1.color}, ${lineAlpha})`;
              ctx.lineWidth = Math.max(0.4, factor * 1.1);
              ctx.stroke();
            }
          }
        }
      }

      // Draw particle nodes
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        let alpha = p.baseAlpha * (0.8 + Math.sin(time * 2 + p.phase) * 0.2);

        if (mascotEx) {
          const dToMascot = Math.sqrt(
            Math.pow(p.x - mascotEx.cx, 2) + Math.pow(p.y - mascotEx.cy, 2)
          );
          if (dToMascot < mascotEx.radius) {
            alpha *= 0.05;
          }
        }

        // Ambient glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${alpha * 0.15})`;
        ctx.fill();

        // Node core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${alpha})`;
        ctx.fill();
      }

      animIdRef.current = requestAnimationFrame(render);
    };

    animIdRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animIdRef.current);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVis);
    };
  }, [variant, mascotExclusionRef]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{
        opacity,
        maskImage:
          'radial-gradient(circle at center, black 60%, transparent 100%)',
        WebkitMaskImage:
          'radial-gradient(circle at center, black 60%, transparent 100%)',
      }}
    />
  );
};
