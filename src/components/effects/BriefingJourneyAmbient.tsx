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

const PARTICLE_COUNT = 52;
const LINK_DISTANCE = 92;
const TAU = Math.PI * 2;
const HUES = [195, 205, 215, 228];

const createParticle = (width: number, height: number): Particle => {
  const angle = Math.random() * TAU;
  const speed = 0.04 + Math.random() * 0.12;

  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    size: 0.8 + Math.random() * 1.6,
    hue: HUES[Math.floor(Math.random() * HUES.length)] ?? 205,
    alpha: 0.18 + Math.random() * 0.18,
    twinklePhase: Math.random() * TAU,
    twinkleSpeed: 0.45 + Math.random() * 0.8,
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

    const context = canvas.getContext('2d');
    if (!context) return undefined;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let frameId = 0;
    let lastTime = 0;
    const particles: Particle[] = [];

    const resize = () => {
      const nextWidth = root.clientWidth;
      const journey = root.parentElement;
      const nextHeight = Math.max(root.offsetHeight, journey?.scrollHeight ?? 0, journey?.clientHeight ?? 0);

      if (!nextWidth || !nextHeight) return;

      const scaleX = nextWidth / Math.max(width, 1);
      const scaleY = nextHeight / Math.max(height, 1);

      width = nextWidth;
      height = nextHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

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

    const drawLinks = (time: number) => {
      for (let i = 0; i < particles.length; i += 1) {
        const a = particles[i];
        let links = 0;

        for (let j = i + 1; j < particles.length; j += 1) {
          if (links >= 2) break;

          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.hypot(dx, dy);
          if (distance > LINK_DISTANCE) continue;

          const fade = 1 - distance / LINK_DISTANCE;
          const pulse = 0.6 + Math.sin(time * 0.0008 + i + j) * 0.08;
          context.beginPath();
          context.strokeStyle = `rgba(120, 190, 255, ${fade * 0.042 * pulse})`;
          context.lineWidth = 0.55;
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
          links += 1;
        }
      }
    };

    const tick = (time: number) => {
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
      }

      drawLinks(time);

      for (const particle of particles) {
        const twinkle = 0.82 + Math.sin(particle.twinklePhase) * 0.14;
        const alpha = particle.alpha * twinkle;
        const radius = particle.size * (0.92 + twinkle * 0.08);

        if (radius > 1.65) {
          context.beginPath();
          context.fillStyle = `hsla(${particle.hue}, 82%, 72%, ${alpha * 0.09})`;
          context.shadowColor = `hsla(${particle.hue}, 90%, 70%, ${alpha * 0.28})`;
          context.shadowBlur = 5;
          context.arc(particle.x, particle.y, radius * 1.5, 0, TAU);
          context.fill();
        }

        context.beginPath();
        context.fillStyle = `hsla(${particle.hue}, 86%, 78%, ${alpha * 0.58})`;
        context.shadowBlur = radius > 1.5 ? 4 : 2;
        context.shadowColor = `hsla(${particle.hue}, 90%, 72%, ${alpha * 0.3})`;
        context.arc(particle.x, particle.y, radius, 0, TAU);
        context.fill();
        context.shadowBlur = 0;
      }

      frameId = window.requestAnimationFrame(tick);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(root);
    if (root.parentElement) observer.observe(root.parentElement);
    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [reduceMotion]);

  return (
    <div ref={rootRef} className="iv-journey__ambient" aria-hidden="true">
      {!reduceMotion && <canvas ref={canvasRef} className="iv-journey__ambient-canvas" />}
      <div className="iv-journey__ambient-glows">
        <i className="iv-journey__glow is-a" />
        <i className="iv-journey__glow is-b" />
        <i className="iv-journey__glow is-c" />
        <i className="iv-journey__glow is-d" />
      </div>
      <svg className="iv-journey__ambient-orbits" viewBox="0 0 1200 2400" preserveAspectRatio="xMidYMid slice">
        <ellipse className="is-a" cx="600" cy="720" rx="420" ry="140" />
        <ellipse className="is-b" cx="600" cy="1280" rx="360" ry="120" transform="rotate(-12 600 1280)" />
        <ellipse className="is-c" cx="600" cy="1860" rx="480" ry="160" transform="rotate(8 600 1860)" />
      </svg>
    </div>
  );
};
