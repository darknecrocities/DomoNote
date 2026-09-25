import React, { useEffect, useRef } from 'react';

interface StarfieldBackgroundProps {
  isDark: boolean;
  className?: string;
  speedMultiplier?: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  twinkleSpeed: number;
  phase: number;
  color: string;
  hasSparkle?: boolean;
  depth: number; // 1 (far), 2 (mid), 3 (near)
}

interface Meteor {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  alpha: number;
  decay: number;
  thickness: number;
}

export const StarfieldBackground: React.FC<StarfieldBackgroundProps> = ({
  isDark,
  className = '',
  speedMultiplier = 1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameIdRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    // If not dark mode, skip running 60fps canvas completely
    if (!isDark) {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = 0;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      if (!canvas) return;
      width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.parentElement?.clientHeight || window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / (rect.width || 1) - 0.5;
      const y = (e.clientY - rect.top) / (rect.height || 1) - 0.5;
      mouseRef.current.targetX = x * 25;
      mouseRef.current.targetY = y * 25;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Generate stars with crisp monochrome white & silver tones
    const starColors = [
      'rgba(255, 255, 255,',
      'rgba(245, 245, 245,',
      'rgba(235, 235, 235,',
      'rgba(255, 255, 255,',
      'rgba(225, 225, 225,',
    ];

    const starCount = Math.min(160, Math.floor((width * height) / 5000));
    const stars: Star[] = [];

    for (let i = 0; i < starCount; i++) {
      const depth = Math.random() < 0.65 ? 1 : Math.random() < 0.88 ? 2 : 3;
      const size = depth === 1 ? Math.random() * 0.9 + 0.5 : depth === 2 ? Math.random() * 1.3 + 0.9 : Math.random() * 1.8 + 1.4;
      const color = starColors[Math.floor(Math.random() * starColors.length)];

      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size,
        baseAlpha: depth === 1 ? 0.35 + Math.random() * 0.35 : 0.6 + Math.random() * 0.4,
        twinkleSpeed: (0.015 + Math.random() * 0.035) * speedMultiplier,
        phase: Math.random() * Math.PI * 2,
        color,
        hasSparkle: depth === 3 && Math.random() > 0.4,
        depth,
      });
    }

    // Meteors / Shooting stars
    const meteors: Meteor[] = [];
    let lastMeteorTime = Date.now();

    const spawnMeteor = () => {
      const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.35; // ~45 deg downward slope
      const speed = (7 + Math.random() * 6) * speedMultiplier;
      meteors.push({
        x: Math.random() * (width * 1.1) - (width * 0.1),
        y: Math.random() * (height * 0.5),
        length: 70 + Math.random() * 70,
        speed,
        angle,
        alpha: 0.9,
        decay: 0.012 + Math.random() * 0.01,
        thickness: 1.2 + Math.random() * 1.2,
      });
    };

    let isRunning = true;

    const render = () => {
      if (!isRunning || !ctx || !canvas) return;

      // Smooth mouse parallax
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Draw Stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.phase += star.twinkleSpeed;
        const currentAlpha = Math.max(0.15, Math.min(1.0, star.baseAlpha + Math.sin(star.phase) * 0.35));

        // Parallax offset based on star depth
        const offsetX = mouseRef.current.x * (star.depth * 0.4);
        const offsetY = mouseRef.current.y * (star.depth * 0.4);
        const posX = star.x + offsetX;
        const posY = star.y + offsetY;

        // Draw star core
        ctx.beginPath();
        ctx.arc(posX, posY, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `${star.color} ${currentAlpha})`;
        ctx.fill();

        // 4-Point cross sparkle for larger stars
        if (star.hasSparkle && currentAlpha > 0.6) {
          const sparkleSize = star.size * 3.5 * currentAlpha;
          ctx.strokeStyle = `rgba(255, 255, 255, ${currentAlpha * 0.45})`;
          ctx.lineWidth = 0.75;

          ctx.beginPath();
          ctx.moveTo(posX - sparkleSize, posY);
          ctx.lineTo(posX + sparkleSize, posY);
          ctx.moveTo(posX, posY - sparkleSize);
          ctx.lineTo(posX, posY + sparkleSize);
          ctx.stroke();

          // Soft center aura
          const aura = ctx.createRadialGradient(posX, posY, 0, posX, posY, star.size * 2.8);
          aura.addColorStop(0, `rgba(255, 255, 255, ${currentAlpha * 0.3})`);
          aura.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = aura;
          ctx.beginPath();
          ctx.arc(posX, posY, star.size * 2.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Spawn Meteors periodically (every 5-9 seconds in dark mode)
      const now = Date.now();
      if (now - lastMeteorTime > 5000 && Math.random() < 0.035) {
        spawnMeteor();
        lastMeteorTime = now;
      }

      // Draw and update meteors
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += Math.cos(m.angle) * m.speed;
        m.y += Math.sin(m.angle) * m.speed;
        m.alpha -= m.decay;

        if (m.alpha <= 0 || m.x > width + 100 || m.y > height + 100) {
          meteors.splice(i, 1);
          continue;
        }

        const tailX = m.x - Math.cos(m.angle) * m.length;
        const tailY = m.y - Math.sin(m.angle) * m.length;

        const meteorGrad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        meteorGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        meteorGrad.addColorStop(0.7, `rgba(210, 230, 255, ${m.alpha * 0.6})`);
        meteorGrad.addColorStop(1, `rgba(255, 255, 255, ${m.alpha})`);

        ctx.strokeStyle = meteorGrad;
        ctx.lineWidth = m.thickness;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();

        // Meteor Head Spark
        ctx.fillStyle = `rgba(255, 255, 255, ${m.alpha})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.thickness * 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      if (isRunning) {
        animFrameIdRef.current = requestAnimationFrame(render);
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        isRunning = false;
        if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      } else {
        if (!isRunning) {
          isRunning = true;
          animFrameIdRef.current = requestAnimationFrame(render);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isDark, speedMultiplier]);

  if (!isDark) {
    return null;
  }

  return (
    <div
      className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none transition-opacity duration-700 ease-in-out opacity-100 ${className}`}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
};
