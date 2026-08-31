import React, { useCallback, useRef } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import { useBriefingSectionMetrics, usePerfConfig } from '../../perf';
import { useIntroScrollRoot } from '../sections/ArrivalSection';

interface NoiseFilterTransitionProps {
  id?: string;
}

interface NoiseParticle {
  id: number;
  startX: number;
  startY: number;
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

const PHASE_ONE_HEADLINE = ['NO TODO MERECE', 'TU ATENCIÓN.'];

export const NoiseFilterTransition: React.FC<NoiseFilterTransitionProps> = ({
  id = 'transition-panorama-to-priority',
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const scrollRootRef = useIntroScrollRoot();
  const reduceMotion = !!useReducedMotion();
  const perf = usePerfConfig();
  const useFullDetailMotion = !reduceMotion && perf.tier === 'high';

  const rawProgress = useMotionValue(0);
  const animatedStoryProgress = useSpring(rawProgress, {
    stiffness: 240,
    damping: 28,
    mass: 0.5,
    restDelta: 0.0005,
    restSpeed: 0.002,
  });
  const storyProgress = reduceMotion ? rawProgress : animatedStoryProgress;

  useBriefingSectionMetrics(
    containerRef,
    'noise-filter',
    scrollRootRef?.current ?? null,
    useCallback(
      (metrics) => {
        rawProgress.set(metrics.progress);
      },
      [rawProgress],
    ),
  );

  const eyebrowOpacity = useTransform(storyProgress, [0.04, 0.10, 0.88, 0.96], [0, 1, 1, 0]);
  const statusOpacity = useTransform(storyProgress, [0.06, 0.12, 0.88, 0.95], [0, 0.95, 0.95, 0]);
  const statusY = useTransform(storyProgress, [0.06, 0.12, 0.95], [10, 0, -10]);

  // Phase 1: No todo merece tu atención (0.00 - 0.50)
  const phase1Opacity = useTransform(storyProgress, [0.04, 0.12, 0.44, 0.50], [0, 1, 1, 0]);
  const phase1Y = useTransform(storyProgress, [0.04, 0.12, 0.50], [20, 0, -16]);
  const noiseFieldOpacity = useTransform(storyProgress, [0.04, 0.12, 0.40, 0.48], [0, 0.8, 0.8, 0]);

  // Phase 2: Esto sí (0.48 - 1.00)
  const phase2Opacity = useTransform(storyProgress, [0.48, 0.54, 0.90, 0.98], [0, 1, 1, 0]);
  const phase2Y = useTransform(storyProgress, [0.48, 0.54, 0.98], [20, 0, -16]);

  const colorShift = useTransform(storyProgress, [0.46, 0.60], [0, 1]);

  return (
    <section
      ref={containerRef}
      id={id}
      className="iv-noise-filter-transition is-active select-none"
      data-chapter="transition"
      aria-label="Transición narrativa: De Panorama a Prioridad"
    >
      <div className="iv-noise-filter-transition__sticky">
        {/* Layer 1: Ambient Background Radial Glows */}
        <motion.div
          className="iv-noise-filter-transition__ambient"
          style={{
            background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(56, 189, 248, 0.18), transparent 74%)',
          }}
          aria-hidden="true"
        />

        {/* Layer 2: Subtle Depth Noise Texture */}
        <div className="iv-noise-filter-transition__grain" aria-hidden="true" />

        {/* Layer 3: Interactive Organic 3D Framing Shapes */}
        <div className="iv-noise-filter-transition__organic-layer" aria-hidden="true">
          <div className="iv-organic-shape iv-organic-shape--left is-active">
            <svg
              className="iv-organic-shape__svg"
              viewBox="0 0 800 900"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="iv-left-back-wave-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#040e24" stopOpacity="0.55" />
                  <stop offset="40%" stopColor="#081b3e" stopOpacity="0.30" />
                  <stop offset="75%" stopColor="#102e62" stopOpacity="0.10" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                </linearGradient>

                <linearGradient id="iv-left-organic-grad" x1="0%" y1="0%" x2="85%" y2="85%">
                  <stop offset="0%" stopColor="#06132d" stopOpacity="0.75" />
                  <stop offset="28%" stopColor="#0a2046" stopOpacity="0.50" />
                  <stop offset="58%" stopColor="#123366" stopOpacity="0.28" />
                  <stop offset="82%" stopColor="#1e40af" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                </linearGradient>

                <radialGradient id="iv-left-specular" cx="42%" cy="32%" r="58%">
                  <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.28" />
                  <stop offset="35%" stopColor="#1d4ed8" stopOpacity="0.12" />
                  <stop offset="70%" stopColor="#0f172a" stopOpacity="0.03" />
                  <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </radialGradient>

                <linearGradient id="iv-left-crease-shadow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#01040a" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="#020816" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </linearGradient>

                <linearGradient id="iv-left-ray-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
                  <stop offset="16%" stopColor="#38bdf8" stopOpacity="0.06" />
                  <stop offset="36%" stopColor="#65d9ff" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
                  <stop offset="64%" stopColor="#93c5fd" stopOpacity="0.6" />
                  <stop offset="84%" stopColor="#818cf8" stopOpacity="0.06" />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                </linearGradient>

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

              <path
                d="M 0,0 L 740,0 C 660,110 560,260 460,440 C 340,640 180,780 0,840 Z"
                fill="url(#iv-left-back-wave-grad)"
                className="iv-organic-shape__back-wave"
              />

              <path
                d="M 0,0 L 580,0 C 520,50 440,140 360,260 C 260,400 140,500 0,540 Z"
                fill="url(#iv-left-organic-grad)"
                className="iv-organic-shape__body"
              />

              <path
                d="M 0,0 L 580,0 C 520,50 440,140 360,260 C 260,400 140,500 0,540 Z"
                fill="url(#iv-left-specular)"
              />
              <path
                d="M 0,0 L 480,0 C 400,80 320,180 240,300 C 160,420 80,480 0,510 Z"
                fill="url(#iv-left-crease-shadow)"
                opacity="0.5"
              />

              <path
                d="M 0,540 C 140,500 260,400 360,260 C 440,140 520,50 580,0"
                fill="none"
                stroke="rgba(101, 217, 255, 0.08)"
                strokeWidth="0.8"
              />

              <path
                d="M 0,540 C 140,500 260,400 360,260 C 440,140 520,50 580,0"
                fill="none"
                stroke="url(#iv-left-ray-gradient)"
                strokeWidth="12"
                filter="url(#iv-left-ray-bloom)"
                opacity="0.65"
              />

              <path
                d="M 0,540 C 140,500 260,400 360,260 C 440,140 520,50 580,0"
                fill="none"
                stroke="url(#iv-left-ray-gradient)"
                strokeWidth="4.5"
                filter="url(#iv-left-ray-bloom)"
                opacity="0.88"
              />

              <path
                d="M 0,540 C 140,500 260,400 360,260 C 440,140 520,50 580,0"
                fill="none"
                stroke="url(#iv-left-ray-gradient)"
                strokeWidth="1.8"
                opacity="0.95"
              />
            </svg>
          </div>

          <div className="iv-organic-shape iv-organic-shape--right is-active">
            <svg
              className="iv-organic-shape__svg"
              viewBox="0 0 800 900"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="iv-right-back-wave-grad" x1="100%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#0c0724" stopOpacity="0.55" />
                  <stop offset="40%" stopColor="#170c44" stopOpacity="0.30" />
                  <stop offset="75%" stopColor="#251268" stopOpacity="0.10" />
                  <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
                </linearGradient>

                <linearGradient id="iv-right-organic-grad" x1="100%" y1="100%" x2="15%" y2="15%">
                  <stop offset="0%" stopColor="#0e072b" stopOpacity="0.75" />
                  <stop offset="28%" stopColor="#161044" stopOpacity="0.50" />
                  <stop offset="58%" stopColor="#261a64" stopOpacity="0.28" />
                  <stop offset="82%" stopColor="#3730a3" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                </linearGradient>

                <radialGradient id="iv-right-specular" cx="58%" cy="68%" r="58%">
                  <stop offset="0%" stopColor="#c084fc" stopOpacity="0.28" />
                  <stop offset="35%" stopColor="#7c3aed" stopOpacity="0.12" />
                  <stop offset="70%" stopColor="#0f172a" stopOpacity="0.03" />
                  <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </radialGradient>

                <linearGradient id="iv-right-crease-shadow" x1="100%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#01040a" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="#040214" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </linearGradient>

                <linearGradient id="iv-right-ray-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#c084fc" stopOpacity="0" />
                  <stop offset="16%" stopColor="#c084fc" stopOpacity="0.06" />
                  <stop offset="36%" stopColor="#c4b5fd" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
                  <stop offset="64%" stopColor="#818cf8" stopOpacity="0.6" />
                  <stop offset="84%" stopColor="#38bdf8" stopOpacity="0.06" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                </linearGradient>

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

              <path
                d="M 800,900 L 80,900 C 180,810 320,680 440,500 C 560,300 700,180 800,120 Z"
                fill="url(#iv-right-back-wave-grad)"
                className="iv-organic-shape__back-wave"
              />

              <path
                d="M 800,900 L 220,900 C 280,840 360,740 440,600 C 540,440 660,380 800,360 Z"
                fill="url(#iv-right-organic-grad)"
                className="iv-organic-shape__body"
              />

              <path
                d="M 800,900 L 220,900 C 280,840 360,740 440,600 C 540,440 660,380 800,360 Z"
                fill="url(#iv-right-specular)"
              />
              <path
                d="M 800,900 L 320,900 C 400,820 480,720 560,600 C 640,480 720,420 800,390 Z"
                fill="url(#iv-right-crease-shadow)"
                opacity="0.5"
              />

              <path
                d="M 220,900 C 280,840 360,740 440,600 C 540,440 660,380 800,360"
                fill="none"
                stroke="rgba(196, 181, 253, 0.08)"
                strokeWidth="0.8"
              />

              <path
                d="M 220,900 C 280,840 360,740 440,600 C 540,440 660,380 800,360"
                fill="none"
                stroke="url(#iv-right-ray-gradient)"
                strokeWidth="12"
                filter="url(#iv-right-ray-bloom)"
                opacity="0.65"
              />

              <path
                d="M 220,900 C 280,840 360,740 440,600 C 540,440 660,380 800,360"
                fill="none"
                stroke="url(#iv-right-ray-gradient)"
                strokeWidth="4.5"
                filter="url(#iv-right-ray-bloom)"
                opacity="0.88"
              />

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

        {/* Secondary Noise Particles */}
        {!reduceMotion && (
          <motion.div
            className="iv-noise-filter-transition__noise-field"
            style={{ opacity: reduceMotion ? 0 : noiseFieldOpacity }}
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

        {/* Top Micro-Indicator: PANORAMA -> PRIORIDAD */}
        <motion.div
          className="iv-noise-filter-transition__eyebrow"
          style={{ opacity: reduceMotion ? 1 : eyebrowOpacity }}
          aria-hidden="true"
        >
          <span className="iv-noise-filter-transition__eyebrow-step">00 → 01</span>
          <span className="iv-noise-filter-transition__eyebrow-sep">/</span>
          <span className="iv-noise-filter-transition__eyebrow-label">FILTRADO DE SEÑAL</span>
        </motion.div>

        {/* Telemetry Status Strip */}
        <motion.div
          className="iv-noise-filter-transition__status-bar"
          style={{
            opacity: reduceMotion ? 0.95 : statusOpacity,
            y: reduceMotion ? 0 : statusY,
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
        </motion.div>

        {/* Editorial Text Layer */}
        <div className="iv-noise-filter-transition__content why-content-stack relative">
          {/* Phase 1 */}
          <motion.div
            className="iv-noise-filter-transition__act iv-noise-filter-transition__act--1 absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            style={{
              opacity: reduceMotion ? 1 : phase1Opacity,
              y: reduceMotion ? 0 : phase1Y,
              display: useTransform(storyProgress, (p: number) => (p <= 0.52 ? 'flex' : 'none')),
            }}
          >
            <h2
              className="iv-noise-filter-transition__headline"
              aria-label="No todo merece tu atención."
            >
              {PHASE_ONE_HEADLINE.map((line) => (
                <span key={line} className="iv-noise-filter-transition__headline-line" aria-hidden="true">
                  {line}
                </span>
              ))}
            </h2>
            <p className="iv-noise-filter-transition__sub">
              FOCUS procesó tu operación y descartó el ruido para aislar lo que realmente impacta tus resultados.
            </p>
          </motion.div>

          {/* Phase 2 */}
          <motion.div
            className="iv-noise-filter-transition__act iv-noise-filter-transition__act--2 absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            style={{
              opacity: reduceMotion ? 1 : phase2Opacity,
              y: reduceMotion ? 0 : phase2Y,
              display: useTransform(storyProgress, (p: number) => (p >= 0.46 ? 'flex' : 'none')),
            }}
          >
            <div className="iv-noise-filter-transition__hero-eyebrow">
              <span>01</span>
              <i />
              <strong>ASUNTO PRIORITARIO AISLADO</strong>
            </div>

            <h2 className="iv-noise-filter-transition__headline is-highlight">ESTO SÍ.</h2>

            <p className="iv-noise-filter-transition__sub is-lead">
              Empecemos por el indicador que requiere tu atención y toma de decisiones primero.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
