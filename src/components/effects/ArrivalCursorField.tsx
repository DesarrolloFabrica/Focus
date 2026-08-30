import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import { getPerfConfig, getPerfTier, startManagedLoop, subscribePerf, type PerfConfig } from '../../perf';

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
}

interface ArrivalCursorFieldProps {
  targetRef: React.RefObject<HTMLElement | null>;
  className?: string;
}

const MAX_SPARKS = 36;
const TAU = Math.PI * 2;

export const ArrivalCursorField: React.FC<ArrivalCursorFieldProps> = ({ targetRef, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion || getPerfTier() === 'lite') return undefined;

    const canvas = canvasRef.current;
    const target = targetRef.current;
    if (!canvas || !target) return undefined;

    const context = canvas.getContext('2d');
    if (!context) return undefined;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let perf: PerfConfig = getPerfConfig();
    let maxSparks = Math.max(10, Math.round(MAX_SPARKS * perf.particleScale));

    // Rectangulo cacheado: leerlo en cada pointermove forzaba un reflow
    // sincrono por cada movimiento del raton.
    let bounds = target.getBoundingClientRect();

    const pointer = { x: 0, y: 0, tx: 0, ty: 0, active: false, energy: 0 };
    const sparks: Spark[] = [];
    let lastActivity = performance.now();
    const idleMs = perf.tier === 'balanced' ? 2500 : 3000;
    const spawnChance = perf.tier === 'balanced' ? 0.32 : 0.55;
    const burstChance = perf.tier === 'balanced' ? 0.06 : 0.12;

    const resize = () => {
      bounds = target.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      dpr = Math.min(window.devicePixelRatio || 1, perf.maxDpr);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const unsubscribePerf = subscribePerf((next) => {
      perf = next;
      maxSparks = Math.max(10, Math.round(MAX_SPARKS * perf.particleScale));
      if (sparks.length > maxSparks) sparks.splice(0, sparks.length - maxSparks);
      resize();
    });

    const spawnSpark = (x: number, y: number, burst = false) => {
      if (sparks.length >= maxSparks) sparks.shift();
      const angle = Math.random() * TAU;
      const speed = burst ? 0.35 + Math.random() * 0.55 : 0.12 + Math.random() * 0.28;
      sparks.push({
        x: x + (Math.random() - 0.5) * 12,
        y: y + (Math.random() - 0.5) * 12,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: burst ? 28 + Math.random() * 22 : 40 + Math.random() * 36,
        size: burst ? 1.1 + Math.random() * 1.4 : 0.6 + Math.random() * 1.1,
        hue: 190 + Math.random() * 70,
      });
    };

    const onMove = (event: PointerEvent) => {
      lastActivity = performance.now();
      pointer.tx = event.clientX - bounds.left;
      pointer.ty = event.clientY - bounds.top;
      pointer.active = true;
      if (Math.random() < spawnChance) spawnSpark(pointer.tx, pointer.ty);
      if (Math.random() < burstChance) spawnSpark(pointer.tx, pointer.ty, true);
    };

    const onLeave = () => {
      pointer.active = false;
    };

    // El rect solo cambia con scroll o resize. Se marca sucio y se relee una
    // sola vez por frame, dentro del rAF, en lugar de en cada pointermove.
    let boundsDirty = false;
    const markBoundsDirty = () => {
      boundsDirty = true;
    };

    const tick = (_time: number, delta: number) => {
      if (performance.now() - lastActivity > idleMs && !pointer.active) return;

      if (boundsDirty) {
        boundsDirty = false;
        bounds = target.getBoundingClientRect();
      }

      if (pointer.active) lastActivity = performance.now();

      const dt = Math.min(32, delta);

      pointer.x += (pointer.tx - pointer.x) * 0.14;
      pointer.y += (pointer.ty - pointer.y) * 0.14;
      pointer.energy += ((pointer.active ? 1 : 0) - pointer.energy) * (pointer.active ? 0.08 : 0.035);

      context.clearRect(0, 0, width, height);

      if (pointer.energy > 0.01) {
        const glow = context.createRadialGradient(
          pointer.x,
          pointer.y,
          0,
          pointer.x,
          pointer.y,
          120 + pointer.energy * 80,
        );
        glow.addColorStop(0, `rgba(120, 220, 255, ${0.14 * pointer.energy})`);
        glow.addColorStop(0.35, `rgba(80, 140, 255, ${0.07 * pointer.energy})`);
        glow.addColorStop(0.7, `rgba(120, 80, 255, ${0.025 * pointer.energy})`);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        context.fillStyle = glow;
        // Solo se pinta el area util del halo, no todo el lienzo.
        const radius = 200 + pointer.energy * 80;
        context.fillRect(pointer.x - radius, pointer.y - radius, radius * 2, radius * 2);

        const coreGlow = context.createRadialGradient(
          pointer.x,
          pointer.y,
          0,
          pointer.x,
          pointer.y,
          18 + pointer.energy * 10,
        );
        coreGlow.addColorStop(0, `rgba(220, 245, 255, ${0.35 * pointer.energy})`);
        coreGlow.addColorStop(0.45, `rgba(100, 200, 255, ${0.12 * pointer.energy})`);
        coreGlow.addColorStop(1, 'rgba(0,0,0,0)');
        context.fillStyle = coreGlow;
        context.beginPath();
        context.arc(pointer.x, pointer.y, 22, 0, TAU);
        context.fill();
      }

      for (let i = sparks.length - 1; i >= 0; i -= 1) {
        const spark = sparks[i];
        spark.life += dt * 0.06;
        if (spark.life >= spark.maxLife) {
          sparks.splice(i, 1);
          continue;
        }

        const fade = 1 - spark.life / spark.maxLife;
        const pull = pointer.energy * 0.018;
        spark.vx += (pointer.x - spark.x) * pull;
        spark.vy += (pointer.y - spark.y) * pull;
        spark.vx *= 0.96;
        spark.vy *= 0.96;
        spark.x += spark.vx * dt * 0.06;
        spark.y += spark.vy * dt * 0.06;

        const alpha = fade * fade * (0.35 + pointer.energy * 0.55);
        context.beginPath();
        context.fillStyle = `hsla(${spark.hue}, 92%, 72%, ${alpha})`;
        if (perf.canvasGlow) {
          context.shadowColor = `hsla(${spark.hue}, 100%, 70%, ${alpha * 0.8})`;
          context.shadowBlur = spark.size > 1.2 ? 8 : 4;
        }
        context.arc(spark.x, spark.y, spark.size * (0.7 + fade * 0.5), 0, TAU);
        context.fill();
        context.shadowBlur = 0;
      }

      if (pointer.active && pointer.energy > 0.2 && Math.random() < 0.08) {
        spawnSpark(pointer.x, pointer.y);
      }
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(target);
    target.addEventListener('pointermove', onMove, { passive: true });
    target.addEventListener('pointerleave', onLeave);
    window.addEventListener('scroll', markBoundsDirty, { passive: true, capture: true });
    window.addEventListener('resize', markBoundsDirty);

    const stopLoop = startManagedLoop({ element: target, onFrame: tick });

    return () => {
      stopLoop();
      unsubscribePerf();
      observer.disconnect();
      target.removeEventListener('pointermove', onMove);
      target.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('scroll', markBoundsDirty, { capture: true } as EventListenerOptions);
      window.removeEventListener('resize', markBoundsDirty);
    };
  }, [reduceMotion, targetRef]);

  if (reduceMotion || getPerfTier() === 'lite') return null;

  return (
    <canvas ref={canvasRef} className={`focus-arrival-cursor-field pointer-events-none absolute inset-0 z-[1] ${className}`} aria-hidden="true" />
  );
};
