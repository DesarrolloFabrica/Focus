import React, { useEffect, useMemo, useRef } from 'react';
import { FocusCoreState } from '../../types/focus';

interface FocusCoreCanvasProps {
  state: FocusCoreState;
  interactive?: boolean;
  className?: string;
}

interface TrackDef {
  isPrimary: boolean;
  radius: number;
  flatten: number;
  rotation: number;
  speed: number;
  opacity: number;
  width: number;
  colorIndex: number;
  dashed?: boolean;
}

interface ParticleSeed {
  track: number;
  startAngle: number;
  speed: number;
  size: number;
  colorIndex: number;
  lifeOffset: number;
  lifeDuration: number;
}

interface PointerState {
  x: number;
  y: number;
  energy: number;
}

const TAU = Math.PI * 2;

const palettes: Record<FocusCoreState, string[]> = {
  observing: ['#1d4ed8', '#2563eb', '#38bdf8', '#60a5fa', '#818cf8', '#a78bfa'],
  attention: ['#2563eb', '#38bdf8', '#60a5fa', '#f43f5e', '#fb7185', '#818cf8'],
  explaining: ['#1d4ed8', '#2563eb', '#38bdf8', '#00DFD8', '#818cf8', '#c084fc'],
  change: ['#0284c7', '#06b6d4', '#38bdf8', '#67e8f9', '#818cf8', '#a855f7'],
  anomaly: ['#2563eb', '#6366f1', '#a855f7', '#c084fc', '#f43f5e', '#fb7185'],
  stable: ['#0284c7', '#06b6d4', '#10b981', '#34d399', '#60a5fa', '#818cf8'],
  complete: ['#059669', '#10b981', '#34d399', '#38bdf8', '#60a5fa', '#a78bfa'],
  critical: ['#2563eb', '#6366f1', '#e11d48', '#f43f5e', '#fb7185', '#fda4af'],
  analysis: ['#1d4ed8', '#2563eb', '#38bdf8', '#60a5fa', '#818cf8', '#a855f7'],
  default: ['#1d4ed8', '#2563eb', '#38bdf8', '#60a5fa', '#818cf8', '#a78bfa'],
};

const buildFieldStructure = () => {
  // 3 Primary Orbits (clean, sweeping, distinct chromatic identity)
  // 3 Secondary Orbits (delicate, faint geometric guide rings)
  const tracks: TrackDef[] = [
    // Primary 1: Horizontal-tilted electric blue / cyan orbit
    {
      isPrimary: true,
      radius: 0.36,
      flatten: 0.68,
      rotation: -0.22,
      speed: 0.05,
      opacity: 0.46,
      width: 1.15,
      colorIndex: 1,
    },
    // Primary 2: Counter-tilted cyan / violet orbit
    {
      isPrimary: true,
      radius: 0.42,
      flatten: 0.62,
      rotation: 0.38,
      speed: -0.042,
      opacity: 0.42,
      width: 1.0,
      colorIndex: 2,
    },
    // Primary 3: Outer framing harmonic orbit
    {
      isPrimary: true,
      radius: 0.48,
      flatten: 0.74,
      rotation: -0.52,
      speed: 0.034,
      opacity: 0.35,
      width: 0.95,
      colorIndex: 4,
    },
    // Secondary 1: Inner faint guide ring
    {
      isPrimary: false,
      radius: 0.28,
      flatten: 0.82,
      rotation: 0.12,
      speed: -0.028,
      opacity: 0.14,
      width: 0.65,
      colorIndex: 0,
      dashed: true,
    },
    // Secondary 2: Intermediate delicate ring
    {
      isPrimary: false,
      radius: 0.45,
      flatten: 0.54,
      rotation: -0.15,
      speed: 0.022,
      opacity: 0.12,
      width: 0.6,
      colorIndex: 3,
      dashed: true,
    },
    // Secondary 3: Outer faint resonance ring
    {
      isPrimary: false,
      radius: 0.52,
      flatten: 0.78,
      rotation: 0.65,
      speed: -0.018,
      opacity: 0.09,
      width: 0.55,
      colorIndex: 5,
      dashed: true,
    },
  ];

  // Exactly 7 living data particles (between 5 and 8 simultaneously visible)
  const particles: ParticleSeed[] = [
    { track: 0, startAngle: 0.2, speed: 0.082, size: 1.9, colorIndex: 2, lifeOffset: 0.0, lifeDuration: 8.5 },
    { track: 0, startAngle: 3.4, speed: 0.075, size: 1.5, colorIndex: 1, lifeOffset: 3.2, lifeDuration: 9.0 },
    { track: 1, startAngle: 1.8, speed: -0.068, size: 1.8, colorIndex: 3, lifeOffset: 1.5, lifeDuration: 7.8 },
    { track: 1, startAngle: 4.9, speed: -0.062, size: 1.4, colorIndex: 4, lifeOffset: 5.0, lifeDuration: 8.2 },
    { track: 2, startAngle: 0.9, speed: 0.054, size: 2.0, colorIndex: 2, lifeOffset: 2.1, lifeDuration: 10.0 },
    { track: 2, startAngle: 4.1, speed: 0.048, size: 1.6, colorIndex: 0, lifeOffset: 6.8, lifeDuration: 9.5 },
    { track: 3, startAngle: 2.6, speed: -0.045, size: 1.5, colorIndex: 1, lifeOffset: 4.4, lifeDuration: 7.2 },
  ];

  return { tracks, particles };
};

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const blendPalettes = (from: string[], to: string[], t: number): string[] => {
  if (t <= 0) return from;
  if (t >= 1) return to;
  const length = Math.max(from.length, to.length);
  const result: string[] = [];
  for (let i = 0; i < length; i += 1) {
    const a = from[i % from.length];
    const b = to[i % to.length];
    const ar = parseInt(a.slice(1, 3), 16);
    const ag = parseInt(a.slice(3, 5), 16);
    const ab = parseInt(a.slice(5, 7), 16);
    const br = parseInt(b.slice(1, 3), 16);
    const bg = parseInt(b.slice(3, 5), 16);
    const bb = parseInt(b.slice(5, 7), 16);
    const r = Math.round(ar + (br - ar) * t);
    const g = Math.round(ag + (bg - ag) * t);
    const bl = Math.round(ab + (bb - ab) * t);
    result.push(`#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`);
  }
  return result;
};

export const FocusCoreCanvas: React.FC<FocusCoreCanvasProps> = ({
  state,
  interactive = true,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerTargetRef = useRef({ x: 0, y: 0, active: false });
  const animationFrameRef = useRef<number | null>(null);
  const stateRef = useRef(state);
  const targetStateRef = useRef(state);
  const paletteBlendRef = useRef(1);
  const field = useMemo(buildFieldStructure, []);

  useEffect(() => {
    if (targetStateRef.current === state) return;
    targetStateRef.current = state;
    paletteBlendRef.current = 0;
  }, [state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer: PointerState = { x: 0, y: 0, energy: 0 };
    let reducedMotion = mediaQuery.matches;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let startTime = performance.now();
    let previousFrame = 0;
    let isVisible = !document.hidden;
    let currentPalette = [...(palettes[stateRef.current] || palettes.default)];
    let fromPalette = currentPalette;

    const resize = () => {
      width = Math.max(1, canvas.clientWidth);
      height = Math.max(1, canvas.clientHeight);
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (pointer.x === 0 && pointer.y === 0) {
        pointer.x = width / 2;
        pointer.y = height / 2;
      }
    };

    const updatePointerPhysics = () => {
      const target = pointerTargetRef.current;
      const targetX = target.active ? target.x : width / 2;
      const targetY = target.active ? target.y : height / 2;
      pointer.x += (targetX - pointer.x) * 0.06;
      pointer.y += (targetY - pointer.y) * 0.06;
      const targetEnergy = interactive && target.active && !reducedMotion ? 1 : 0;
      pointer.energy += (targetEnergy - pointer.energy) * 0.06;
    };

    const resolvePalette = () => {
      const blend = paletteBlendRef.current;
      if (blend >= 1) {
        currentPalette = palettes[targetStateRef.current] || palettes.default;
        stateRef.current = targetStateRef.current;
        return currentPalette;
      }
      if (blend === 0) {
        fromPalette = currentPalette;
      }
      paletteBlendRef.current = Math.min(1, blend + 0.05);
      currentPalette = blendPalettes(
        fromPalette,
        palettes[targetStateRef.current] || palettes.default,
        paletteBlendRef.current,
      );
      if (paletteBlendRef.current >= 1) {
        stateRef.current = targetStateRef.current;
      }
      return currentPalette;
    };

    const getPointOnTrack = (track: TrackDef, angle: number, time: number) => {
      const cx = width / 2;
      const cy = height / 2;
      const size = Math.min(width, height);
      const motionFactor = reducedMotion ? 0.15 : 1;
      const baseRadius = size * track.radius;
      const rotation = track.rotation + Math.sin(time * 0.04) * 0.04 * motionFactor;

      const rawX = Math.cos(angle) * baseRadius;
      const rawY = Math.sin(angle) * baseRadius * track.flatten;

      return {
        x: cx + rawX * Math.cos(rotation) - rawY * Math.sin(rotation),
        y: cy + rawX * Math.sin(rotation) + rawY * Math.cos(rotation),
      };
    };

    const drawTrack = (track: TrackDef, time: number, palette: string[], reveal: number) => {
      const cx = width / 2;
      const cy = height / 2;
      const size = Math.min(width, height);
      const baseRadius = size * track.radius;
      const rotation = track.rotation + Math.sin(time * 0.04) * 0.04 * (reducedMotion ? 0.15 : 1);

      context.save();
      context.translate(cx, cy);
      context.rotate(rotation);

      context.beginPath();
      context.ellipse(0, 0, baseRadius, baseRadius * track.flatten, 0, 0, TAU);

      if (track.dashed) {
        context.setLineDash([3, 10]);
      } else {
        context.setLineDash([]);
      }

      const grad = context.createLinearGradient(-baseRadius, -baseRadius * track.flatten, baseRadius, baseRadius * track.flatten);
      const colorA = palette[track.colorIndex % palette.length];
      const colorB = palette[(track.colorIndex + 2) % palette.length];
      grad.addColorStop(0, colorA);
      grad.addColorStop(0.5, colorB);
      grad.addColorStop(1, colorA);

      context.strokeStyle = grad;
      context.globalAlpha = track.opacity * reveal;
      context.lineWidth = track.width;
      context.stroke();
      context.restore();
    };

    const drawLuminousPulse = (track: TrackDef, time: number, palette: string[], reveal: number, pulseOffset: number) => {
      const pulseSpeed = track.speed * 1.8;
      const headAngle = (time * pulseSpeed + pulseOffset) % TAU;
      const tailLength = 0.45;
      const steps = 14;
      const color = palette[(track.colorIndex + 1) % palette.length];

      context.beginPath();
      for (let i = 0; i < steps; i += 1) {
        const t = i / (steps - 1);
        const pt = getPointOnTrack(track, headAngle - t * tailLength, time);
        if (i === 0) context.moveTo(pt.x, pt.y);
        else context.lineTo(pt.x, pt.y);
      }

      context.strokeStyle = color;
      context.globalAlpha = 0.48 * reveal;
      context.lineWidth = track.width * 1.5;
      context.shadowColor = color;
      context.shadowBlur = 6;
      context.stroke();
      context.shadowBlur = 0;
    };

    const render = (timestamp: number) => {
      if (!isVisible) return;

      const minFrameGap = reducedMotion ? 40 : 16;
      if (timestamp - previousFrame < minFrameGap) {
        animationFrameRef.current = requestAnimationFrame(render);
        return;
      }
      previousFrame = timestamp;
      updatePointerPhysics();

      const elapsed = (timestamp - startTime) / 1000;
      const time = reducedMotion ? elapsed * 0.15 : elapsed;
      const palette = resolvePalette();

      const intro = clamp(elapsed / 0.7);
      const easedIntro = 1 - (1 - intro) ** 2.5;

      const cx = width / 2;
      const cy = height / 2;
      // Parallax mouse displacement capped at 2.5px
      const pointerOffsetX = (pointer.x - cx) * 0.012 * pointer.energy;
      const pointerOffsetY = (pointer.y - cy) * 0.012 * pointer.energy;

      context.clearRect(0, 0, width, height);
      context.save();

      // Subtle breathing on canvas
      const breath = reducedMotion ? 1 : 1 + Math.sin(time * 0.95) * 0.008;
      context.translate(cx + pointerOffsetX, cy + pointerOffsetY);
      context.scale(breath, breath);
      context.translate(-cx, -cy);

      // Deep atmospheric core back-glow
      const aura = context.createRadialGradient(cx, cy, 0, cx, cy, Math.min(width, height) * 0.48);
      aura.addColorStop(0, 'rgba(37, 99, 235, 0.07)');
      aura.addColorStop(0.35, 'rgba(56, 189, 248, 0.035)');
      aura.addColorStop(0.7, 'rgba(129, 140, 248, 0.015)');
      aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
      context.fillStyle = aura;
      context.globalAlpha = easedIntro;
      context.fillRect(0, 0, width, height);

      context.globalCompositeOperation = 'lighter';

      // 1. Draw all tracks (primary + secondary)
      field.tracks.forEach((track, idx) => {
        const reveal = clamp((elapsed - 0.1 - idx * 0.04) / 0.6);
        drawTrack(track, time, palette, reveal);
      });

      // 2. Draw 2 soft luminous energy pulses on primary tracks
      if (!reducedMotion) {
        drawLuminousPulse(field.tracks[0], time, palette, easedIntro, 0.5);
        drawLuminousPulse(field.tracks[1], time, palette, easedIntro, 3.2);
      }

      // 3. Draw exactly 7 data particles with gentle fade-in / fade-out lifecycle
      field.particles.forEach((p) => {
        const track = field.tracks[p.track];
        const currentAngle = p.startAngle + (reducedMotion ? 0 : time * p.speed);
        const pt = getPointOnTrack(track, currentAngle, time);

        // Smooth breathing lifecycle (fade-in -> hold -> fade-out)
        const cycleProgress = ((elapsed + p.lifeOffset) % p.lifeDuration) / p.lifeDuration;
        // Bell curve envelope for opacity
        const lifeOpacity = Math.sin(cycleProgress * Math.PI);
        const particleOpacity = clamp(lifeOpacity * 0.85 * easedIntro);

        if (particleOpacity > 0.02) {
          const color = palette[p.colorIndex % palette.length];

          // Soft particle trail
          if (!reducedMotion && particleOpacity > 0.3) {
            const trailSteps = 4;
            for (let s = 1; s <= trailSteps; s += 1) {
              const trailAngle = currentAngle - (p.speed > 0 ? 1 : -1) * (s * 0.04);
              const trailPt = getPointOnTrack(track, trailAngle, time);
              const trailAlpha = particleOpacity * (1 - s / (trailSteps + 1)) * 0.35;

              context.beginPath();
              context.arc(trailPt.x, trailPt.y, p.size * (1 - s * 0.18), 0, TAU);
              context.fillStyle = color;
              context.globalAlpha = trailAlpha;
              context.fill();
            }
          }

          // Main particle head
          context.beginPath();
          context.arc(pt.x, pt.y, p.size, 0, TAU);
          context.fillStyle = color;
          context.globalAlpha = particleOpacity;
          context.shadowColor = color;
          context.shadowBlur = 5;
          context.fill();
          context.shadowBlur = 0;
        }
      });

      context.globalCompositeOperation = 'source-over';
      context.restore();
      context.globalAlpha = 1;

      animationFrameRef.current = requestAnimationFrame(render);
    };

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (!isVisible && animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      } else if (isVisible && animationFrameRef.current === null) {
        startTime = performance.now() - 1000;
        animationFrameRef.current = requestAnimationFrame(render);
      }
    };

    const handleMotionPreference = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    mediaQuery.addEventListener('change', handleMotionPreference);
    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      mediaQuery.removeEventListener('change', handleMotionPreference);
    };
  }, [field, interactive]);

  const updatePointer = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerTargetRef.current = {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
      active: true,
    };
  };

  return (
    <canvas
      ref={canvasRef}
      className={`h-full w-full touch-pan-y ${className}`}
      onPointerEnter={updatePointer}
      onPointerMove={updatePointer}
      onPointerLeave={() => {
        pointerTargetRef.current.active = false;
      }}
      role="img"
      aria-label="Núcleo FOCUS en análisis, sintetizando señales en tiempo real"
    />
  );
};
