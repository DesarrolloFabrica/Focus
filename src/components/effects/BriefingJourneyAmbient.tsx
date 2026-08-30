import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import { getPerfConfig, startManagedLoop, subscribePerf, type PerfConfig } from '../../perf';

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
    let perf: PerfConfig = getPerfConfig();
    let particleCount = Math.max(6, Math.round(PARTICLE_COUNT * perf.particleScale));
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
      dpr = Math.min(window.devicePixelRatio || 1, perf.maxDpr);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Reescala solo las particulas que ya existian; las nuevas nacen ya
      // dentro del nuevo tamano.
      const previousCount = particles.length;
      while (particles.length > particleCount) particles.pop();

      for (let index = 0; index < Math.min(previousCount, particles.length); index += 1) {
        particles[index].x *= scaleX;
        particles[index].y *= scaleY;
      }

      while (particles.length < particleCount) {
        particles.push(createParticle(width, height));
      }
    };

    const unsubscribePerf = subscribePerf((next) => {
      perf = next;
      particleCount = Math.max(6, Math.round(PARTICLE_COUNT * perf.particleScale));
      resize();
    });

    const tick = (_time: number, delta: number) => {
      const dt = Math.min(32, delta);

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
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(root);

    // Pausa automatica fuera de pantalla / con la pestana oculta.
    const stopLoop = startManagedLoop({ element: root, onFrame: tick });

    return () => {
      stopLoop();
      unsubscribePerf();
      observer.disconnect();
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
