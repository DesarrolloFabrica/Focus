import React, { useEffect, useMemo, useRef } from 'react';
import { FocusCoreState } from '../../types/focus';

interface FocusCoreCanvasProps {
  state: FocusCoreState;
  interactive?: boolean;
  className?: string;
}

interface TrackSeed {
  radius: number;
  flatten: number;
  rotation: number;
  wavePrimary: number;
  waveSecondary: number;
  waveAmount: number;
  phase: number;
  speed: number;
  opacity: number;
  width: number;
  colorIndex: number;
}

interface ParticleSeed {
  track: number;
  angle: number;
  speed: number;
  size: number;
  opacity: number;
  phase: number;
  colorIndex: number;
}

interface FieldPoint {
  x: number;
  y: number;
  proximity: number;
}

interface RenderedParticle extends FieldPoint {
  opacity: number;
  color: string;
}

interface PointerState {
  x: number;
  y: number;
  energy: number;
}

/** Tuned for smooth 60fps on landing — dense enough to read as a living core. */
const PARTICLE_COUNT = 96;
const TRACK_COUNT = 12;
const TRACK_SEGMENTS = 72;
const LUMINOUS_ARCS = 8;
const CROSS_WEAVE_LINKS = 14;
const ENERGY_PULSES = 3;
const TAU = Math.PI * 2;

const palettes: Record<FocusCoreState, string[]> = {
  observing: ['#1678ff', '#269cff', '#3cddff', '#65bfff', '#6f6cff', '#a951ff'],
  attention: ['#1578ff', '#258fff', '#2eb8ff', '#3ce2ff', '#6d8fff', '#7866ff', '#b54fff', '#ef6fc0'],
  explaining: ['#147fff', '#269fff', '#35e7ff', '#69c7ff', '#7467ff', '#ad51ff'],
  change: ['#0b91ff', '#1cbcff', '#32e8ee', '#62dcff', '#6c7cff', '#a84eff'],
  anomaly: ['#167cff', '#4a79ff', '#7762ff', '#a54dff', '#d553f2', '#f06ba8'],
  stable: ['#168eff', '#21bfff', '#31e0d0', '#53e8b5', '#668eff', '#8d65ff'],
  complete: ['#0fcf98', '#27e6ad', '#38e4cf', '#62e4b2', '#22c7a4', '#8df5cf'],
  critical: ['#167aff', '#407cff', '#7864ff', '#d952df', '#f05d92', '#ff765f'],
  analysis: ['#147dff', '#239eff', '#34dfff', '#69b9ff', '#7566ff', '#b04fff'],
  default: ['#1678ff', '#269cff', '#3cddff', '#65bfff', '#6f6cff', '#a951ff'],
};

const createSeededRandom = (initialSeed: number) => {
  let seed = initialSeed >>> 0;
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
};

const createField = () => {
  const random = createSeededRandom(86173);
  const tracks: TrackSeed[] = Array.from({ length: TRACK_COUNT }, (_, index) => ({
    // Outer tracks extend farther so the field reads as gravitational, not an icon.
    radius: 0.22 + random() * 0.34 + (index % 4 === 0 ? 0.06 : 0),
    flatten: 0.58 + random() * 0.28,
    rotation: -0.76 + random() * 1.52,
    wavePrimary: 2 + Math.floor(random() * 4),
    waveSecondary: 6 + Math.floor(random() * 5),
    waveAmount: 0.024 + random() * 0.058,
    phase: random() * TAU,
    speed: (index % 2 === 0 ? 1 : -1) * (0.06 + random() * 0.08),
    opacity: 0.26 + random() * 0.3,
    width: 0.5 + random() * 0.85,
    colorIndex: Math.floor(random() * 8),
  }));

  const particles: ParticleSeed[] = Array.from({ length: PARTICLE_COUNT }, () => ({
    track: Math.floor(random() * TRACK_COUNT),
    angle: random() * TAU,
    speed: (random() > 0.18 ? 1 : -1) * (0.025 + random() * 0.055),
    size: 0.55 + random() * 1.35,
    opacity: 0.45 + random() * 0.52,
    phase: random() * TAU,
    colorIndex: Math.floor(random() * 8),
  }));

  return { tracks, particles };
};

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const getTrackPoint = (
  track: TrackSeed,
  trackIndex: number,
  angle: number,
  time: number,
  width: number,
  height: number,
  reducedMotion: boolean,
) => {
  const cx = width / 2;
  const cy = height / 2;
  const size = Math.min(width, height);
  const motionAmount = reducedMotion ? 0.18 : 1;
  const baseRadius = size * track.radius;
  const localTime = time * track.speed;
  const deformation =
    Math.sin(angle * track.wavePrimary + localTime + track.phase) * track.waveAmount +
    Math.cos(angle * track.waveSecondary - localTime * 0.72 + track.phase * 0.5) * track.waveAmount * 0.42;
  const radius = baseRadius * (1 + deformation * motionAmount);
  const rotation =
    track.rotation +
    Math.sin(time * 0.055 + track.phase) * 0.095 * motionAmount +
    Math.sin(trackIndex * 0.9) * 0.025;
  const rawX = Math.cos(angle) * radius;
  const rawY = Math.sin(angle) * radius * track.flatten;
  const verticalWave =
    Math.sin(angle * 3 + time * (0.1 + trackIndex * 0.002) + track.phase) *
    baseRadius *
    0.085 *
    motionAmount;

  return {
    x: cx + rawX * Math.cos(rotation) - (rawY + verticalWave) * Math.sin(rotation),
    y: cy + rawX * Math.sin(rotation) + (rawY + verticalWave) * Math.cos(rotation),
  };
};

/** Soft-blend two palette arrays so hover color shifts without restarting the loop. */
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
  const field = useMemo(createField, []);

  // Keep the animation loop alive — only swap the target palette on hover.
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
      // Cap DPR to keep large hero canvases affordable on retina displays.
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
      pointer.x += (targetX - pointer.x) * 0.075;
      pointer.y += (targetY - pointer.y) * 0.075;
      const targetEnergy = interactive && target.active && !reducedMotion ? 1 : 0;
      pointer.energy += (targetEnergy - pointer.energy) * (targetEnergy > pointer.energy ? 0.085 : 0.045);
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
      paletteBlendRef.current = Math.min(1, blend + 0.06);
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

    const applyPointerField = (point: { x: number; y: number }): FieldPoint => {
      if (pointer.energy < 0.002) return { ...point, proximity: 0 };

      const dx = point.x - pointer.x;
      const dy = point.y - pointer.y;
      const distance = Math.hypot(dx, dy);
      const fieldRadius = Math.min(width, height) * 0.28;
      if (distance >= fieldRadius || distance === 0) return { ...point, proximity: 0 };

      const proximity = (1 - distance / fieldRadius) ** 2 * pointer.energy;
      const force = proximity * 11;
      return {
        x: point.x + (dx / distance) * force - (dy / distance) * force * 0.42,
        y: point.y + (dy / distance) * force + (dx / distance) * force * 0.42,
        proximity,
      };
    };

    const getInteractiveTrackPoint = (trackIndex: number, angle: number, time: number) => {
      const point = getTrackPoint(
        field.tracks[trackIndex],
        trackIndex,
        angle,
        time,
        width,
        height,
        reducedMotion,
      );
      return applyPointerField(point);
    };

    const createFieldGradient = (palette: string[], colorIndex: number) => {
      const gradient = context.createLinearGradient(width * 0.17, height * 0.26, width * 0.83, height * 0.76);
      gradient.addColorStop(0, palette[colorIndex % palette.length]);
      gradient.addColorStop(0.5, palette[(colorIndex + 2) % palette.length]);
      gradient.addColorStop(1, palette[(colorIndex + 4) % palette.length]);
      return gradient;
    };

    const drawTrack = (trackIndex: number, time: number, palette: string[], reveal: number) => {
      const track = field.tracks[trackIndex];
      const gradient = createFieldGradient(palette, track.colorIndex);

      context.beginPath();
      for (let segment = 0; segment <= TRACK_SEGMENTS; segment += 1) {
        const angle = (segment / TRACK_SEGMENTS) * TAU;
        const point = getInteractiveTrackPoint(trackIndex, angle, time);
        if (segment === 0) context.moveTo(point.x, point.y);
        else context.lineTo(point.x, point.y);
      }
      context.closePath();
      context.strokeStyle = gradient;
      context.globalAlpha = track.opacity * reveal * (1 + pointer.energy * 0.18);
      context.lineWidth = track.width;
      context.shadowBlur = 0;
      context.stroke();
    };

    const drawLuminousArc = (
      trackIndex: number,
      time: number,
      palette: string[],
      arcIndex: number,
      reveal: number,
    ) => {
      const track = field.tracks[trackIndex];
      const direction = arcIndex % 2 === 0 ? 1 : -1;
      const head = (time * (0.1 + arcIndex * 0.008) * direction + track.phase + arcIndex * 0.73) % TAU;
      const arcLength = 0.55 + (arcIndex % 3) * 0.18;
      const steps = 24;
      const color = palette[(track.colorIndex + arcIndex) % palette.length];

      context.beginPath();
      for (let step = 0; step < steps; step += 1) {
        const progress = step / (steps - 1);
        const point = getInteractiveTrackPoint(trackIndex, head - arcLength * progress, time);
        if (step === 0) context.moveTo(point.x, point.y);
        else context.lineTo(point.x, point.y);
      }
      context.strokeStyle = color;
      context.globalAlpha = (0.35 + (arcIndex % 3) * 0.1) * reveal;
      context.lineWidth = 1.6;
      // One soft glow per arc instead of per-segment shadowBlur.
      context.shadowColor = color;
      context.shadowBlur = arcIndex % 3 === 0 ? 6 : 0;
      context.stroke();
      context.shadowBlur = 0;
    };

    const drawCrossWeave = (time: number, palette: string[], reveal: number) => {
      for (let link = 0; link < CROSS_WEAVE_LINKS; link += 1) {
        const firstTrack = (link * 5) % TRACK_COUNT;
        const secondTrack = (firstTrack + 2 + (link % 3)) % TRACK_COUNT;
        const angle = (link / CROSS_WEAVE_LINKS) * TAU + Math.sin(time * 0.045 + link) * 0.09;
        const first = getInteractiveTrackPoint(firstTrack, angle, time);
        const second = getInteractiveTrackPoint(secondTrack, angle + 0.035 * (link % 3), time);
        context.beginPath();
        context.moveTo(first.x, first.y);
        context.lineTo(second.x, second.y);
        context.strokeStyle = palette[(link + 2) % palette.length];
        context.globalAlpha = (0.04 + first.proximity * 0.12) * reveal;
        context.lineWidth = 0.45;
        context.stroke();
      }
    };

    const drawPointerConnections = (points: RenderedParticle[], palette: string[]) => {
      if (pointer.energy < 0.04) return;
      const nearest = points
        .map((point) => ({ point, distance: Math.hypot(point.x - pointer.x, point.y - pointer.y) }))
        .filter(({ distance }) => distance < Math.min(width, height) * 0.22)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 5);

      nearest.forEach(({ point, distance }, index) => {
        const intensity = clamp(1 - distance / (Math.min(width, height) * 0.22)) * pointer.energy;
        context.beginPath();
        context.moveTo(pointer.x, pointer.y);
        context.lineTo(point.x, point.y);
        context.strokeStyle = palette[(index + 1) % palette.length];
        context.globalAlpha = intensity * 0.14;
        context.lineWidth = 0.5;
        context.stroke();
      });
    };

    const drawEnergyPulse = (pulseIndex: number, time: number, palette: string[], reveal: number) => {
      const trackIndex = (pulseIndex * 4 + 1) % TRACK_COUNT;
      const direction = pulseIndex % 2 === 0 ? 1 : -1;
      const head = (time * (0.17 + pulseIndex * 0.014) * direction + pulseIndex * 1.37) % TAU;
      const color = palette[(pulseIndex + 1) % palette.length];
      const tailSteps = 10;

      for (let step = tailSteps; step >= 0; step -= 1) {
        const progress = step / tailSteps;
        const point = getInteractiveTrackPoint(trackIndex, head - direction * progress * 0.3, time);
        const radius = 0.7 + (1 - progress) * 1.5;
        context.beginPath();
        context.arc(point.x, point.y, radius, 0, TAU);
        context.fillStyle = step === 0 ? '#ffffff' : color;
        context.globalAlpha = (1 - progress) ** 1.9 * 0.8 * reveal;
        context.shadowColor = color;
        context.shadowBlur = step === 0 ? 8 : 0;
        context.fill();
      }
      context.shadowBlur = 0;
    };

    const render = (timestamp: number) => {
      if (!isVisible) return;

      const minFrameGap = reducedMotion ? 50 : 16;
      if (timestamp - previousFrame < minFrameGap) {
        animationFrameRef.current = requestAnimationFrame(render);
        return;
      }
      previousFrame = timestamp;
      updatePointerPhysics();

      const elapsed = (timestamp - startTime) / 1000;
      const time = reducedMotion ? elapsed * 0.12 : elapsed;
      const palette = resolvePalette();
      // Assembly: field converges from dispersed → settled (~550ms), not a flat fade.
      const assemble = reducedMotion ? 1 : clamp(elapsed / 0.55);
      const assembleEase = 1 - (1 - assemble) ** 2.4;
      const fieldScale = reducedMotion ? 1 : 0.74 + 0.26 * assembleEase;
      const intro = clamp(elapsed / 0.85);
      const easedIntro = 1 - (1 - intro) ** 3;
      const breath = reducedMotion ? 1 : 1 + Math.sin(time * 0.62) * 0.011;
      const cx = width / 2;
      const cy = height / 2;
      const pointerX = width ? (pointer.x - cx) / (width / 2) : 0;
      const pointerY = height ? (pointer.y - cy) / (height / 2) : 0;

      context.clearRect(0, 0, width, height);
      context.save();
      context.translate(cx, cy);
      context.scale(breath * fieldScale, breath * fieldScale);
      context.translate(-cx, -cy);

      const aura = context.createRadialGradient(cx, cy, 0, cx, cy, Math.min(width, height) * 0.52);
      aura.addColorStop(0, 'rgba(30, 100, 255, 0.055)');
      aura.addColorStop(0.28, 'rgba(28, 90, 220, 0.09)');
      aura.addColorStop(0.55, 'rgba(90, 40, 190, 0.04)');
      aura.addColorStop(1, 'rgba(1, 5, 15, 0)');
      context.fillStyle = aura;
      context.globalAlpha = easedIntro;
      context.fillRect(0, 0, width, height);

      if (pointer.energy > 0.02) {
        const pointerGlow = context.createRadialGradient(
          pointer.x,
          pointer.y,
          0,
          pointer.x,
          pointer.y,
          Math.min(width, height) * 0.14,
        );
        pointerGlow.addColorStop(0, `rgba(62, 196, 255, ${0.06 * pointer.energy})`);
        pointerGlow.addColorStop(0.5, `rgba(92, 92, 255, ${0.03 * pointer.energy})`);
        pointerGlow.addColorStop(1, 'rgba(0,0,0,0)');
        context.fillStyle = pointerGlow;
        context.fillRect(0, 0, width, height);
      }

      context.translate(pointerX * 4 * pointer.energy, pointerY * 3 * pointer.energy);
      context.globalCompositeOperation = 'lighter';

      field.tracks.forEach((_, trackIndex) => {
        const reveal = clamp((elapsed - 0.12 - trackIndex * 0.02) / 0.85);
        drawTrack(trackIndex, time, palette, reveal);
      });
      drawCrossWeave(time, palette, easedIntro);

      for (let arcIndex = 0; arcIndex < LUMINOUS_ARCS; arcIndex += 1) {
        const trackIndex = (arcIndex * 3 + 1) % TRACK_COUNT;
        drawLuminousArc(trackIndex, time, palette, arcIndex, easedIntro);
      }

      const points: RenderedParticle[] = field.particles.map((particle, index) => {
        const circulation = reducedMotion ? 0 : time * particle.speed;
        // Dispersed → assembled: outer particles converge inward during intro.
        const assemblyOffset = (1 - assembleEase) * (0.85 + (index % 5) * 0.05) * (index % 2 === 0 ? 1 : -0.6);
        const angle = particle.angle + circulation + assemblyOffset;
        const point = getInteractiveTrackPoint(particle.track, angle, time + particle.phase * 0.12);
        const twinkle = reducedMotion ? 0.84 : 0.82 + Math.sin(time * 1.15 + particle.phase) * 0.14;
        return {
          ...point,
          opacity: particle.opacity * twinkle * easedIntro,
          color: palette[particle.colorIndex % palette.length],
        };
      });

      for (let index = 0; index < points.length; index += 1) {
        const point = points[index];
        // Sparse particle links — every 4th particle only.
        if (index % 4 === 0) {
          const nextPoint = points[(index + TRACK_COUNT) % points.length];
          const distance = Math.hypot(point.x - nextPoint.x, point.y - nextPoint.y);
          if (distance < Math.min(width, height) * 0.1) {
            context.beginPath();
            context.moveTo(point.x, point.y);
            context.lineTo(nextPoint.x, nextPoint.y);
            context.strokeStyle = point.color;
            context.globalAlpha = (0.05 + Math.max(point.proximity, nextPoint.proximity) * 0.15) * easedIntro;
            context.lineWidth = 0.4;
            context.stroke();
          }
        }

        const particle = field.particles[index];
        context.beginPath();
        context.arc(point.x, point.y, particle.size * (1 + point.proximity * 0.6), 0, TAU);
        context.fillStyle = point.color;
        context.globalAlpha = point.opacity * (1 + point.proximity * 0.4);
        // Glow only on the brightest particles.
        context.shadowColor = point.color;
        context.shadowBlur = particle.size > 1.4 ? 5 : 0;
        context.fill();
      }
      context.shadowBlur = 0;

      drawPointerConnections(points, palette);
      if (!reducedMotion) {
        for (let pulseIndex = 0; pulseIndex < ENERGY_PULSES; pulseIndex += 1) {
          drawEnergyPulse(pulseIndex, time, palette, easedIntro);
        }
      }

      context.globalCompositeOperation = 'source-over';
      context.restore();
      context.globalAlpha = 1;
      context.shadowBlur = 0;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (!isVisible && animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      } else if (isVisible && animationFrameRef.current === null) {
        startTime = performance.now() - 1050;
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
      aria-label="Núcleo FOCUS en análisis, compuesto por partículas y filamentos de energía"
    />
  );
};
