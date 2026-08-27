import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { useIntroScrollRoot } from '../sections/ArrivalSection';

interface NoiseFilterTransitionProps {
  id?: string;
}

interface NoiseParticle {
  id: number;
  startX: number; // initial %
  startY: number; // initial %
  size: number;
  hue: number;
  baseAlpha: number;
  convergeAngle: number;
  convergeDist: number;
}

const NOISE_PARTICLES: NoiseParticle[] = [
  { id: 1, startX: 16, startY: 26, size: 2.4, hue: 205, baseAlpha: 0.55, convergeAngle: 0.55, convergeDist: 14 },
  { id: 2, startX: 22, startY: 68, size: 2.0, hue: 198, baseAlpha: 0.45, convergeAngle: -0.4, convergeDist: 12 },
  { id: 3, startX: 30, startY: 18, size: 2.6, hue: 215, baseAlpha: 0.6, convergeAngle: 0.9, convergeDist: 10 },
  { id: 4, startX: 12, startY: 78, size: 1.8, hue: 200, baseAlpha: 0.4, convergeAngle: -0.6, convergeDist: 16 },
  { id: 5, startX: 78, startY: 22, size: 2.5, hue: 210, baseAlpha: 0.58, convergeAngle: 2.5, convergeDist: 12 },
  { id: 6, startX: 86, startY: 42, size: 2.1, hue: 195, baseAlpha: 0.48, convergeAngle: 3.1, convergeDist: 15 },
  { id: 7, startX: 74, startY: 76, size: 2.8, hue: 220, baseAlpha: 0.62, convergeAngle: 3.7, convergeDist: 11 },
  { id: 8, startX: 88, startY: 82, size: 1.9, hue: 205, baseAlpha: 0.42, convergeAngle: 3.9, convergeDist: 16 },
  { id: 9, startX: 18, startY: 48, size: 2.2, hue: 208, baseAlpha: 0.5, convergeAngle: 0.1, convergeDist: 13 },
  { id: 10, startX: 82, startY: 62, size: 2.3, hue: 212, baseAlpha: 0.52, convergeAngle: 3.4, convergeDist: 14 },
  { id: 11, startX: 34, startY: 82, size: 2.0, hue: 196, baseAlpha: 0.46, convergeAngle: -1.1, convergeDist: 12 },
  { id: 12, startX: 68, startY: 16, size: 2.4, hue: 218, baseAlpha: 0.56, convergeAngle: 2.1, convergeDist: 10 },
];

export const NoiseFilterTransition: React.FC<NoiseFilterTransitionProps> = ({
  id = 'transition-panorama-to-priority',
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const scrollRootRef = useIntroScrollRoot();
  const reduceMotion = !!useReducedMotion();
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const root = scrollRootRef?.current ?? (document.getElementById('iv-intro-scroll') as HTMLElement | null);
    if (!container || !root) return undefined;

    let frameId = 0;
    let lastProgress = -1;

    const handleScroll = () => {
      cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        const containerRect = container.getBoundingClientRect();
        const rootRect = root.getBoundingClientRect();

        const scrollStart = rootRect.top;
        const totalDistance = containerRect.height - rootRect.height;

        if (totalDistance <= 0) {
          if (lastProgress !== 0) {
            lastProgress = 0;
            setScrollProgress(0);
          }
          return;
        }

        const currentOffset = scrollStart - containerRect.top;
        const rawProgress = currentOffset / totalDistance;
        const clamped = Math.max(0, Math.min(1, rawProgress));
        if (Math.abs(clamped - lastProgress) < 0.004) return;
        lastProgress = clamped;
        setScrollProgress(clamped);
      });
    };

    root.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      root.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(frameId);
    };
  }, [scrollRootRef]);

  const p = scrollProgress;

  // -------------------------------------------------------------
  // Clean, Progressive & Staggered Narrative Transition Math
  // -------------------------------------------------------------

  // Phase 1: "NO TODO MERECE TU ATENCIÓN."
  // Hold 0.00 -> 0.28, then float up / fade 0.28 -> 0.40 (handoff overlaps Phase 2).
  const p1Progress = Math.max(0, Math.min(1, (p - 0.28) / 0.12));
  const p1Opacity = reduceMotion
    ? (p < 0.40 ? 1 : 0)
    : p < 0.28
      ? 1
      : Math.max(0, 1 - p1Progress);

  const p1TranslateY = reduceMotion
    ? 0
    : -p1Progress * 28;

  // Subtitle 1:
  const sub1Progress = Math.max(0, Math.min(1, (p - 0.24) / 0.12));
  const sub1Opacity = reduceMotion
    ? (p < 0.36 ? 1 : 0)
    : p < 0.24
      ? 1
      : Math.max(0, 1 - sub1Progress);

  // Secondary Noise particles: active during Phase 1
  const noiseVisibility = reduceMotion
    ? 0
    : p < 0.28
      ? 0.8
      : Math.max(0, 0.8 * (1 - (p - 0.28) / 0.12));

  const convergenceProgress = Math.max(0, Math.min(1, (p - 0.18) / 0.20));

  // Telemetry status pill at the bottom:
  const telemetryOpacity = reduceMotion
    ? (p >= 0.22 && p < 0.72 ? 0.95 : 0)
    : p < 0.22
      ? 0
      : p < 0.32
        ? (p - 0.22) / 0.10
        : p < 0.62
          ? 1
          : Math.max(0, 1 - (p - 0.62) / 0.10);

  // Phase 2: HERO REVELATION "ESTO SÍ."
  // Enter overlaps Phase 1 exit (0.36 -> 0.50), hold until the sticky almost releases,
  // then only soft-fade (never to empty) so Priority always inherits a filled frame.
  const p2Enter = Math.max(0, Math.min(1, (p - 0.36) / 0.14));
  const p2Exit = p > 0.94 ? Math.max(0.35, 1 - (p - 0.94) / 0.12) : 1;
  const p2Opacity = reduceMotion
    ? (p >= 0.36 ? 1 : 0)
    : p2Enter * p2Exit;

  const p2Scale = reduceMotion
    ? 1
    : 0.95 + p2Enter * 0.05;

  const p2TranslateY = reduceMotion
    ? 0
    : (1 - p2Enter) * 28 - (p > 0.94 ? ((p - 0.94) / 0.12) * 12 : 0);

  // Subtitle 2:
  const sub2Enter = Math.max(0, Math.min(1, (p - 0.40) / 0.14));
  const sub2Exit = p > 0.94 ? Math.max(0.35, 1 - (p - 0.94) / 0.12) : 1;
  const sub2Opacity = reduceMotion
    ? (p >= 0.40 ? 1 : 0)
    : sub2Enter * sub2Exit;

  // Eyebrow stays with Phase 2 until the pin fully releases
  const eyebrowExit = p > 0.94 ? Math.max(0.4, 1 - (p - 0.94) / 0.12) : 1;
  const eyebrowOpacity = reduceMotion ? 1 : eyebrowExit;

  // Color Shift
  const colorShift = Math.max(0, Math.min(1, (p - 0.34) / 0.50));
  const rVal = Math.round(101 + colorShift * 66);
  const gVal = Math.round(217 - colorShift * 78);
  const bVal = 255;

  const signalIntensity = 0.75 + (p >= 0.34 ? Math.min(0.4, (p - 0.34) * 1.5) : 0);
  const signalHaloSize = 160 + (p >= 0.36 ? Math.min(130, (p - 0.36) * 280) : 0);

  // -------------------------------------------------------------
  // Organic 3D Shapes & In-View Entrance Animation (Reference Design)
  // -------------------------------------------------------------
  // Frame the scene for the full sticky duration so the viewport never goes dark/empty.
  const isShapesActive = !reduceMotion && p >= 0.04 && p < 0.98;

  // Background curvature lines opacity
  const curveOpacity = Math.max(0, 0.08 * (1 - p * 0.7));

  return (
    <section
      ref={containerRef}
      id={id}
      className="iv-noise-filter-transition"
      aria-label="Transición narrativa: De Panorama a Prioridad"
    >
      <div className="iv-noise-filter-transition__sticky">
        {/* Layer 1: Ambient Background Radial Glows */}
        <div
          className="iv-noise-filter-transition__ambient"
          style={{
            background: `radial-gradient(ellipse 70% 60% at 50% 50%, rgba(${
              Math.round(30 + colorShift * 60)
            }, ${
              Math.round(90 - colorShift * 20)
            }, 255, ${0.14 + colorShift * 0.09}), transparent 74%)`,
          }}
          aria-hidden="true"
        />

        {/* Layer 2: Subtle Depth Noise Texture */}
        <div className="iv-noise-filter-transition__grain" aria-hidden="true" />

        {/* Layer 3: Interactive Organic 3D Framing Shapes with Multi-Layer 3D Depth & Translucent Feathering */}
        <div className="iv-noise-filter-transition__organic-layer" aria-hidden="true">
          {/* Left Organic Fluid Form (Top-Left Diagonal Entry) */}
          <div
            className={`iv-organic-shape iv-organic-shape--left ${isShapesActive ? 'is-active' : ''}`}
          >
            <svg
              className="iv-organic-shape__svg"
              viewBox="0 0 800 900"
              preserveAspectRatio="none"
            >
              <defs>
                {/* Secondary Deep Back Wave Gradient (Soft Atmospheric Volume) */}
                <linearGradient id="iv-left-back-wave-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#040e24" stopOpacity="0.55" />
                  <stop offset="40%" stopColor="#081b3e" stopOpacity="0.30" />
                  <stop offset="75%" stopColor="#102e62" stopOpacity="0.10" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                </linearGradient>

                {/* Primary Front 3D Silk Surface Gradient (Feathering to 100% Transparent) */}
                <linearGradient id="iv-left-organic-grad" x1="0%" y1="0%" x2="85%" y2="85%">
                  <stop offset="0%" stopColor="#06132d" stopOpacity="0.75" />
                  <stop offset="28%" stopColor="#0a2046" stopOpacity="0.50" />
                  <stop offset="58%" stopColor="#123366" stopOpacity="0.28" />
                  <stop offset="82%" stopColor="#1e40af" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                </linearGradient>

                {/* Volumetric Internal Ambient Light (Directional Specular Crest) */}
                <radialGradient id="iv-left-specular" cx="42%" cy="32%" r="58%">
                  <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.28" />
                  <stop offset="35%" stopColor="#1d4ed8" stopOpacity="0.12" />
                  <stop offset="70%" stopColor="#0f172a" stopOpacity="0.03" />
                  <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </radialGradient>

                {/* Inner Ridge Shadow / Ambient Occlusion */}
                <linearGradient id="iv-left-crease-shadow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#01040a" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="#020816" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </linearGradient>

                {/* Luminous Feathered Light Ray Gradient (Smooth 0% opacity fade at both tips) */}
                <linearGradient id="iv-left-ray-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
                  <stop offset="16%" stopColor="#38bdf8" stopOpacity="0.06" />
                  <stop offset="36%" stopColor="#65d9ff" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
                  <stop offset="64%" stopColor="#93c5fd" stopOpacity="0.6" />
                  <stop offset="84%" stopColor="#818cf8" stopOpacity="0.06" />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                  <animateTransform
                    attributeName="gradientTransform"
                    type="translate"
                    values="-0.9,0.9; 0.9,-0.9; -0.9,0.9"
                    keyTimes="0; 0.5; 1"
                    dur="5.5s"
                    repeatCount="indefinite"
                  />
                </linearGradient>

                {/* Atmospheric Neon Ray Bloom Filter */}
                <filter id="iv-left-ray-bloom" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="8" result="blur1" />
                  <feGaussianBlur stdDeviation="2.5" result="blur2" />
                  <feMerge>
                    <feMergeNode in="blur1" />
                    <feMergeNode in="blur2" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Layer 1: Secondary Back Wave Fold (Provides 3D relief & depth) */}
              <path
                d="M 0,0 L 740,0 C 660,110 560,260 460,440 C 340,640 180,780 0,840 Z"
                fill="url(#iv-left-back-wave-grad)"
                className="iv-organic-shape__back-wave"
              />

              {/* Layer 2: Primary Front 3D Silk Surface with Translucent Falloff */}
              <path
                d="M 0,0 L 580,0 C 520,50 440,140 360,260 C 260,400 140,500 0,540 Z"
                fill="url(#iv-left-organic-grad)"
                className="iv-organic-shape__body"
              />

              {/* Layer 3: Crease Shadow & Specular Shading */}
              <path
                d="M 0,0 L 580,0 C 520,50 440,140 360,260 C 260,400 140,500 0,540 Z"
                fill="url(#iv-left-specular)"
              />
              <path
                d="M 0,0 L 480,0 C 400,80 320,180 240,300 C 160,420 80,480 0,510 Z"
                fill="url(#iv-left-crease-shadow)"
                opacity="0.5"
              />

              {/* Layer 4: Base Subtle Contour Line (Whisper of structural edge) */}
              <path
                d="M 0,540 C 140,500 260,400 360,260 C 440,140 520,50 580,0"
                fill="none"
                stroke="rgba(101, 217, 255, 0.08)"
                strokeWidth="0.8"
              />

              {/* Layer 5: Soft Atmospheric Glowing Haze (Feathered Ray) */}
              <path
                d="M 0,540 C 140,500 260,400 360,260 C 440,140 520,50 580,0"
                fill="none"
                stroke="url(#iv-left-ray-gradient)"
                strokeWidth="12"
                filter="url(#iv-left-ray-bloom)"
                opacity="0.65"
              />

              {/* Layer 6: Mid Radiant Light Beam Body */}
              <path
                d="M 0,540 C 140,500 260,400 360,260 C 440,140 520,50 580,0"
                fill="none"
                stroke="url(#iv-left-ray-gradient)"
                strokeWidth="4.5"
                filter="url(#iv-left-ray-bloom)"
                opacity="0.88"
              />

              {/* Layer 7: Crisp Specular Core Filament */}
              <path
                d="M 0,540 C 140,500 260,400 360,260 C 440,140 520,50 580,0"
                fill="none"
                stroke="url(#iv-left-ray-gradient)"
                strokeWidth="1.8"
                opacity="0.95"
              />
            </svg>
          </div>

          {/* Right Organic Fluid Form (Bottom-Right Diagonal Entry) */}
          <div
            className={`iv-organic-shape iv-organic-shape--right ${isShapesActive ? 'is-active' : ''}`}
          >
            <svg
              className="iv-organic-shape__svg"
              viewBox="0 0 800 900"
              preserveAspectRatio="none"
            >
              <defs>
                {/* Secondary Deep Back Wave Gradient (Soft Atmospheric Volume) */}
                <linearGradient id="iv-right-back-wave-grad" x1="100%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#0a0724" stopOpacity="0.55" />
                  <stop offset="40%" stopColor="#140e38" stopOpacity="0.30" />
                  <stop offset="75%" stopColor="#221558" stopOpacity="0.10" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                </linearGradient>

                {/* Primary Front 3D Silk Surface Gradient (Feathering to 100% Transparent) */}
                <linearGradient id="iv-right-organic-grad" x1="100%" y1="100%" x2="15%" y2="15%">
                  <stop offset="0%" stopColor="#0d092d" stopOpacity="0.75" />
                  <stop offset="28%" stopColor="#161044" stopOpacity="0.50" />
                  <stop offset="58%" stopColor="#261a64" stopOpacity="0.28" />
                  <stop offset="82%" stopColor="#3730a3" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                </linearGradient>

                {/* Volumetric Internal Ambient Light (Directional Specular Crest) */}
                <radialGradient id="iv-right-specular" cx="58%" cy="68%" r="58%">
                  <stop offset="0%" stopColor="#c084fc" stopOpacity="0.28" />
                  <stop offset="35%" stopColor="#7c3aed" stopOpacity="0.12" />
                  <stop offset="70%" stopColor="#0f172a" stopOpacity="0.03" />
                  <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </radialGradient>

                {/* Inner Ridge Shadow / Ambient Occlusion */}
                <linearGradient id="iv-right-crease-shadow" x1="100%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#01040a" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="#040214" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </linearGradient>

                {/* Luminous Feathered Light Ray Gradient (Smooth 0% opacity fade at both tips) */}
                <linearGradient id="iv-right-ray-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#c084fc" stopOpacity="0" />
                  <stop offset="16%" stopColor="#c084fc" stopOpacity="0.06" />
                  <stop offset="36%" stopColor="#c4b5fd" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
                  <stop offset="64%" stopColor="#818cf8" stopOpacity="0.6" />
                  <stop offset="84%" stopColor="#38bdf8" stopOpacity="0.06" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                  <animateTransform
                    attributeName="gradientTransform"
                    type="translate"
                    values="0.9,-0.9; -0.9,0.9; 0.9,-0.9"
                    keyTimes="0; 0.5; 1"
                    dur="5.5s"
                    repeatCount="indefinite"
                  />
                </linearGradient>

                {/* Atmospheric Neon Ray Bloom Filter */}
                <filter id="iv-right-ray-bloom" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="8" result="blur1" />
                  <feGaussianBlur stdDeviation="2.5" result="blur2" />
                  <feMerge>
                    <feMergeNode in="blur1" />
                    <feMergeNode in="blur2" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Layer 1: Secondary Back Wave Fold (Provides 3D relief & depth) */}
              <path
                d="M 800,900 L 80,900 C 180,810 320,680 440,500 C 560,300 700,180 800,120 Z"
                fill="url(#iv-right-back-wave-grad)"
                className="iv-organic-shape__back-wave"
              />

              {/* Layer 2: Primary Front 3D Silk Surface with Translucent Falloff */}
              <path
                d="M 800,900 L 220,900 C 280,840 360,740 440,600 C 540,440 660,380 800,360 Z"
                fill="url(#iv-right-organic-grad)"
                className="iv-organic-shape__body"
              />

              {/* Layer 3: Crease Shadow & Specular Shading */}
              <path
                d="M 800,900 L 220,900 C 280,840 360,740 440,600 C 540,440 660,380 800,360 Z"
                fill="url(#iv-right-specular)"
              />
              <path
                d="M 800,900 L 320,900 C 400,820 480,720 560,600 C 640,480 720,420 800,390 Z"
                fill="url(#iv-right-crease-shadow)"
                opacity="0.5"
              />

              {/* Layer 4: Base Subtle Contour Line (Whisper of structural edge) */}
              <path
                d="M 220,900 C 280,840 360,740 440,600 C 540,440 660,380 800,360"
                fill="none"
                stroke="rgba(196, 181, 253, 0.08)"
                strokeWidth="0.8"
              />

              {/* Layer 5: Soft Atmospheric Glowing Haze (Feathered Ray) */}
              <path
                d="M 220,900 C 280,840 360,740 440,600 C 540,440 660,380 800,360"
                fill="none"
                stroke="url(#iv-right-ray-gradient)"
                strokeWidth="12"
                filter="url(#iv-right-ray-bloom)"
                opacity="0.65"
              />

              {/* Layer 6: Mid Radiant Light Beam Body */}
              <path
                d="M 220,900 C 280,840 360,740 440,600 C 540,440 660,380 800,360"
                fill="none"
                stroke="url(#iv-right-ray-gradient)"
                strokeWidth="4.5"
                filter="url(#iv-right-ray-bloom)"
                opacity="0.88"
              />

              {/* Layer 7: Crisp Specular Core Filament */}
              <path
                d="M 220,900 C 280,840 360,740 440,600 C 540,440 660,380 800,360"
                fill="none"
                stroke="url(#iv-right-ray-gradient)"
                strokeWidth="1.8"
                opacity="0.95"
              />
            </svg>
          </div>
        </div>

        {/* Secondary Noise Particles with convergence towards center */}
        {!reduceMotion && noiseVisibility > 0.01 && (
          <div
            className="iv-noise-filter-transition__noise-field"
            style={{ opacity: noiseVisibility }}
            aria-hidden="true"
          >
            {NOISE_PARTICLES.map((pt) => {
              const currentX = pt.startX + Math.cos(pt.convergeAngle) * pt.convergeDist * convergenceProgress;
              const currentY = pt.startY + Math.sin(pt.convergeAngle) * pt.convergeDist * convergenceProgress;
              const currentAlpha = pt.baseAlpha * (1 - convergenceProgress * 0.7);

              return (
                <span
                  key={pt.id}
                  className="iv-noise-filter-transition__noise-dot"
                  style={{
                    left: `${currentX}%`,
                    top: `${currentY}%`,
                    width: `${pt.size}px`,
                    height: `${pt.size}px`,
                    backgroundColor: `hsla(${pt.hue}, 80%, 75%, ${currentAlpha})`,
                    boxShadow: `0 0 ${pt.size * 3.5}px hsla(${pt.hue}, 90%, 70%, ${currentAlpha * 0.85})`,
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Top Micro-Indicator: PANORAMA -> PRIORIDAD */}
        <div
          className="iv-noise-filter-transition__eyebrow"
          style={{ opacity: eyebrowOpacity }}
          aria-hidden="true"
        >
          <span className="iv-noise-filter-transition__eyebrow-step">00 → 01</span>
          <span className="iv-noise-filter-transition__eyebrow-sep">/</span>
          <span className="iv-noise-filter-transition__eyebrow-label">FILTRADO DE SEÑAL</span>
        </div>

        {/* Telemetry Status Strip - Positioned safely below content without ever overlapping text */}
        <div
          className="iv-noise-filter-transition__status-bar"
          style={{
            opacity: telemetryOpacity,
            transform: `translate3d(-50%, ${(1 - telemetryOpacity) * 8}px, 0)`,
          }}
          aria-hidden="true"
        >
          <div className="iv-noise-filter-transition__status-pill">
            <span className="is-active"><b>04</b> VARIABLES EVALUADAS</span>
            <i>→</i>
            <span className="is-filtered"><b>03</b> ESTABLES</span>
            <i>→</i>
            <span className="is-priority"><b>01</b> PRIORIDAD AISLADA</span>
          </div>
        </div>

        {/* Editorial Text Layer (Framed by the Organic Silhouettes) */}
        <div className="iv-noise-filter-transition__content">
          {/* Phase 1: NO TODO MERECE TU ATENCIÓN */}
          <div
            className="iv-noise-filter-transition__act iv-noise-filter-transition__act--1"
            style={{
              opacity: p1Opacity,
              transform: `translate3d(0, ${p1TranslateY}px, 0)`,
              pointerEvents: p1Opacity > 0.5 ? 'auto' : 'none',
            }}
          >
            <h2 className="iv-noise-filter-transition__headline">
              NO TODO MERECE<br />
              TU ATENCIÓN.
            </h2>
            <p
              className="iv-noise-filter-transition__sub"
              style={{
                opacity: sub1Opacity,
                transform: `translate3d(0, ${(1 - sub1Opacity) * 8}px, 0)`,
              }}
            >
              FOCUS procesó tu operación y descartó el ruido para aislar lo que realmente impacta tus resultados.
            </p>
          </div>

          {/* Phase 2: ESTO SÍ (HERO REVELATION) */}
          <div
            className="iv-noise-filter-transition__act iv-noise-filter-transition__act--2"
            style={{
              opacity: p2Opacity,
              transform: `translate3d(0, ${p2TranslateY}px, 0) scale(${p2Scale})`,
              pointerEvents: p2Opacity > 0.5 ? 'auto' : 'none',
            }}
          >
            <div className="iv-noise-filter-transition__hero-eyebrow">
              <span>01</span>
              <i />
              <strong>ASUNTO PRIORITARIO AISLADO</strong>
            </div>

            <h2 className="iv-noise-filter-transition__headline is-highlight">
              ESTO SÍ.
            </h2>

            <p
              className="iv-noise-filter-transition__sub is-lead"
              style={{
                opacity: sub2Opacity,
                transform: `translate3d(0, ${(1 - sub2Opacity) * 8}px, 0)`,
              }}
            >
              Empecemos por el indicador que requiere tu atención y toma de decisiones primero.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
