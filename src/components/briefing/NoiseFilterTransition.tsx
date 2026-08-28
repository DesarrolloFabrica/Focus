import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'motion/react';
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

type NoisePhase = 'phase1' | 'phase2' | 'handoff';

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_OUT_SOFT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const PHASE_ONE_HEADLINE = ['NO TODO MERECE', 'TU ATENCIÓN.'];

/** Scroll only picks the active beat — never drives mid-fade opacities. */
function phaseFromProgress(p: number): NoisePhase {
  if (p < 0.50) return 'phase1';
  if (p < 0.88) return 'phase2';
  return 'handoff';
}

export const NoiseFilterTransition: React.FC<NoiseFilterTransitionProps> = ({
  id = 'transition-panorama-to-priority',
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const scrollRootRef = useIntroScrollRoot();
  const reduceMotion = !!useReducedMotion();
  const [phase, setPhase] = useState<NoisePhase>('phase1');
  const [isSectionActive, setIsSectionActive] = useState(false);
  const [isSectionSettled, setIsSectionSettled] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const root = scrollRootRef?.current ?? (document.getElementById('iv-intro-scroll') as HTMLElement | null);
    if (!container) return undefined;

    let frameId = 0;
    let lastPhase: NoisePhase | null = null;
    let lastActive = false;
    let lastSettled = false;

    const handleScroll = () => {
      cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        const containerRect = container.getBoundingClientRect();
        const rootTop = root ? root.getBoundingClientRect().top : 0;
        const rootHeight = root ? root.clientHeight : window.innerHeight;
        const rootBottom = rootTop + rootHeight;
        const totalDistance = containerRect.height - rootHeight;

        container.style.setProperty('--iv-transition-viewport-height', `${rootHeight}px`);

        // The scene is settled only while its sticky viewport is fully framed.
        // This gives the side shapes a clear enter/exit boundary in both directions.
        const edgeTolerance = 2;
        const isSettled =
          containerRect.top <= rootTop + edgeTolerance &&
          containerRect.bottom >= rootBottom - edgeTolerance;

        if (isSettled !== lastSettled) {
          lastSettled = isSettled;
          setIsSectionSettled(isSettled);
        }

        // Activate as soon as the transition reaches the scrollport.
        const isInScrollport =
          containerRect.bottom > rootTop &&
          containerRect.top < rootBottom;

        if (isInScrollport !== lastActive) {
          lastActive = isInScrollport;
          setIsSectionActive(isInScrollport);
        }

        if (!isInScrollport) {
          return;
        }

        if (totalDistance <= 0) {
          if (lastPhase !== 'phase1') {
            lastPhase = 'phase1';
            setPhase('phase1');
          }
          return;
        }

        const currentOffset = rootTop - containerRect.top;
        const p = Math.max(0, Math.min(1, currentOffset / totalDistance));
        const next = phaseFromProgress(p);

        if (next !== lastPhase) {
          lastPhase = next;
          setPhase(next);
        }
      });
    };

    const target = root ?? window;
    target.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();

    return () => {
      target.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      cancelAnimationFrame(frameId);
    };
  }, [scrollRootRef]);

  const showPhase1 = isSectionSettled && phase === 'phase1';
  const showPhase2 = isSectionSettled && (phase === 'phase2' || phase === 'handoff');
  const isShapesActive = isSectionSettled;
  const showNoise = isSectionSettled && phase === 'phase1';
  const showTelemetry = isSectionSettled && (phase === 'phase1' || phase === 'phase2');
  const colorShift = phase === 'phase2' || phase === 'handoff' ? 1 : 0;
  const handoffDim = phase === 'handoff';

  const phaseOneReveal: Variants = useMemo(
    () => ({
      hidden: {},
      visible: {},
      exit: reduceMotion
        ? { opacity: 0, transition: { duration: 0.01 } }
        : { opacity: 0, y: -28, transition: { duration: 0.4, ease: EASE_OUT_SOFT } },
    }),
    [reduceMotion],
  );

  const headlineReveal: Variants = useMemo(
    () => ({
      hidden: {},
      visible: {
        transition: {
          delayChildren: reduceMotion ? 0 : 0.04,
          staggerChildren: reduceMotion ? 0 : 0.025,
        },
      },
    }),
    [reduceMotion],
  );

  const letterReveal: Variants = useMemo(
    () => ({
      hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 24, filter: 'blur(7px)' },
      visible: reduceMotion
        ? { opacity: 1 }
        : {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: { duration: 0.52, ease: EASE_OUT_EXPO },
          },
    }),
    [reduceMotion],
  );

  const subFade: Variants = useMemo(
    () => ({
      hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: reduceMotion ? 0.01 : 0.5, ease: EASE_OUT_EXPO, delay: reduceMotion ? 0 : 0.1 },
      },
      exit: reduceMotion
        ? { opacity: 0, transition: { duration: 0.01 } }
        : { opacity: 0, y: -8, transition: { duration: 0.3, ease: EASE_OUT_SOFT } },
    }),
    [reduceMotion],
  );

  const heroReveal: Variants = useMemo(
    () => ({
      hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 28, scale: 0.95 },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: reduceMotion ? 0.01 : 0.6, ease: EASE_OUT_EXPO },
      },
      handoff: reduceMotion
        ? { opacity: 0.35 }
        : { opacity: 0.35, y: -12, transition: { duration: 0.45, ease: EASE_OUT_SOFT } },
      exit: reduceMotion
        ? { opacity: 0, transition: { duration: 0.01 } }
        : { opacity: 0, y: -28, transition: { duration: 0.4, ease: EASE_OUT_SOFT } },
    }),
    [reduceMotion],
  );

  return (
    <section
      ref={containerRef}
      id={id}
      className={`iv-noise-filter-transition${isSectionActive ? ' is-active' : ''}`}
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
            }, 255, ${0.18 + colorShift * 0.09}), transparent 74%)`,
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

        {/* Secondary Noise Particles — visible only during Phase 1 */}
        <AnimatePresence>
          {showNoise && !reduceMotion && (
            <motion.div
              key="noise-field"
              className="iv-noise-filter-transition__noise-field"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0, transition: { duration: 0.35, ease: EASE_OUT_SOFT } }}
              aria-hidden="true"
            >
              {NOISE_PARTICLES.map((pt) => (
                <span
                  key={pt.id}
                  className="iv-noise-filter-transition__noise-dot"
                  style={{
                    left: `${pt.startX}%`,
                    top: `${pt.startY}%`,
                    width: `${pt.size}px`,
                    height: `${pt.size}px`,
                    backgroundColor: `hsla(${pt.hue}, 80%, 75%, ${pt.baseAlpha})`,
                    boxShadow: `0 0 ${pt.size * 3.5}px hsla(${pt.hue}, 90%, 70%, ${pt.baseAlpha * 0.85})`,
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Micro-Indicator: PANORAMA -> PRIORIDAD */}
        <motion.div
          className="iv-noise-filter-transition__eyebrow"
          initial={false}
          animate={{ opacity: isSectionSettled ? (handoffDim ? 0.4 : 1) : 0 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.4, ease: EASE_OUT_SOFT }}
          aria-hidden="true"
        >
          <span className="iv-noise-filter-transition__eyebrow-step">00 → 01</span>
          <span className="iv-noise-filter-transition__eyebrow-sep">/</span>
          <span className="iv-noise-filter-transition__eyebrow-label">FILTRADO DE SEÑAL</span>
        </motion.div>

        {/* Telemetry Status Strip */}
        <AnimatePresence>
          {showTelemetry && (
            <motion.div
              key="telemetry"
              className="iv-noise-filter-transition__status-bar"
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 0.95, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, transition: { duration: 0.35, ease: EASE_OUT_SOFT } }}
              transition={{ duration: reduceMotion ? 0.01 : 0.45, ease: EASE_OUT_EXPO }}
              aria-hidden="true"
            >
          <div className="iv-noise-filter-transition__status-pill">
            <span className="is-active"><b>04</b> VARIABLES EVALUADAS</span>
            <i>→</i>
            <span className="is-filtered"><b>03</b> ESTABLES</span>
            <i>→</i>
            <span className="is-priority"><b>01</b> PRIORIDAD AISLADA</span>
          </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Editorial Text Layer — discrete beats, never mid-scrub */}
        <div className="iv-noise-filter-transition__content">
          <AnimatePresence mode="sync">
            {showPhase1 && (
              <motion.div
                key="noise-phase1"
                className="iv-noise-filter-transition__act iv-noise-filter-transition__act--1"
                variants={phaseOneReveal}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <motion.h2
                  className="iv-noise-filter-transition__headline"
                  variants={headlineReveal}
                  aria-label="No todo merece tu atención."
                >
                  {PHASE_ONE_HEADLINE.map((line, lineIndex) => (
                    <span
                      key={line}
                      className="iv-noise-filter-transition__headline-line"
                      aria-hidden="true"
                    >
                      {Array.from(line).map((character, characterIndex) => (
                        <motion.span
                          key={`${lineIndex}-${characterIndex}`}
                          className="iv-noise-filter-transition__headline-letter"
                          variants={letterReveal}
                        >
                          {character === ' ' ? '\u00a0' : character}
                        </motion.span>
                      ))}
                    </span>
                  ))}
                </motion.h2>
                <motion.p className="iv-noise-filter-transition__sub" variants={subFade}>
                  FOCUS procesó tu operación y descartó el ruido para aislar lo que realmente impacta tus resultados.
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="sync">
            {showPhase2 && (
              <motion.div
                key="noise-phase2"
                className="iv-noise-filter-transition__act iv-noise-filter-transition__act--2"
                variants={heroReveal}
                initial="hidden"
                animate={handoffDim ? 'handoff' : 'visible'}
                exit="exit"
              >
                <motion.div className="iv-noise-filter-transition__hero-eyebrow" variants={subFade}>
                  <span>01</span>
                  <i />
                  <strong>ASUNTO PRIORITARIO AISLADO</strong>
                </motion.div>

                <motion.h2 className="iv-noise-filter-transition__headline is-highlight" variants={heroReveal}>
                  ESTO SÍ.
                </motion.h2>

                <motion.p
                  className="iv-noise-filter-transition__sub is-lead"
                  variants={subFade}
                >
                  Empecemos por el indicador que requiere tu atención y toma de decisiones primero.
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
