import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  hue: number;
  alpha: number;
  twinklePhase: number;
  twinkleSpeed: number;
}

/** Lightweight ambient — viewport-sized, few particles, no shadowBlur */
const PARTICLE_COUNT = 18;
const TAU = Math.PI * 2;
const HUES = [195, 205, 215, 228];

const createParticle = (width: number, height: number): Particle => {
  const angle = Math.random() * TAU;
  const speed = 0.03 + Math.random() * 0.08;

  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    size: 0.7 + Math.random() * 1.2,
    hue: HUES[Math.floor(Math.random() * HUES.length)] ?? 205,
    alpha: 0.14 + Math.random() * 0.14,
    twinklePhase: Math.random() * TAU,
    twinkleSpeed: 0.35 + Math.random() * 0.55,
  };
};

export const BriefingJourneyAmbient: React.FC = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = !!useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return undefined;

    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return undefined;

    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return undefined;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let frameId = 0;
    let lastTime = 0;
    let running = true;
    const particles: Particle[] = [];

    const resize = () => {
      // Viewport only — never size to full journey scrollHeight
      const nextWidth = root.clientWidth || window.innerWidth;
      const nextHeight = root.clientHeight || window.innerHeight;
      if (!nextWidth || !nextHeight) return;

      const scaleX = nextWidth / Math.max(width, 1);
      const scaleY = nextHeight / Math.max(height, 1);

      width = nextWidth;
      height = nextHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (!particles.length) {
        for (let index = 0; index < PARTICLE_COUNT; index += 1) {
          particles.push(createParticle(width, height));
        }
        return;
      }

      for (const particle of particles) {
        particle.x *= scaleX;
        particle.y *= scaleY;
      }
    };

    const tick = (time: number) => {
      if (!running) return;

      // Skip frames when tab is hidden
      if (document.hidden) {
        frameId = window.requestAnimationFrame(tick);
        return;
      }

      const dt = Math.min(32, time - lastTime || 16);
      lastTime = time;

      context.clearRect(0, 0, width, height);

      for (const particle of particles) {
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.twinklePhase += particle.twinkleSpeed * dt * 0.002;

        if (particle.x < -12) particle.x = width + 12;
        if (particle.x > width + 12) particle.x = -12;
        if (particle.y < -12) particle.y = height + 12;
        if (particle.y > height + 12) particle.y = -12;

        const twinkle = 0.85 + Math.sin(particle.twinklePhase) * 0.12;
        const alpha = particle.alpha * twinkle;
        const radius = particle.size * (0.92 + twinkle * 0.06);

        context.beginPath();
        context.fillStyle = `hsla(${particle.hue}, 86%, 78%, ${alpha * 0.55})`;
        context.arc(particle.x, particle.y, radius, 0, TAU);
        context.fill();
      }

      frameId = window.requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      if (document.hidden) {
        window.cancelAnimationFrame(frameId);
        running = false;
      } else {
        running = true;
        lastTime = performance.now();
        frameId = window.requestAnimationFrame(tick);
      }
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(root);
    document.addEventListener('visibilitychange', onVisibility);
    frameId = window.requestAnimationFrame(tick);

    return () => {
      running = false;
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reduceMotion]);

  return (
    <div ref={rootRef} className="iv-journey__ambient" aria-hidden="true">
      {!reduceMotion && <canvas ref={canvasRef} className="iv-journey__ambient-canvas" />}
      {/* Two soft static glows only — no animated scale blur orbs */}
      <div className="iv-journey__ambient-glows">
        <i className="iv-journey__glow is-a" />
        <i className="iv-journey__glow is-c" />
      </div>
    </div>
  );
};
