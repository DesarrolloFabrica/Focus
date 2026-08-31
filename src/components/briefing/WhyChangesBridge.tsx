import React, { useCallback, useRef } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import { useBriefingSectionMetrics, usePerfConfig } from '../../perf';
import { OrganicFramingShapes } from '../effects/OrganicFramingShapes';
import { useIntroScrollRoot } from '../sections/ArrivalSection';

interface WhyChangesBridgeProps {
  conclusion: string;
}

export const WhyChangesBridge: React.FC<WhyChangesBridgeProps> = ({ conclusion }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRootRef = useIntroScrollRoot();
  const reduceMotion = !!useReducedMotion();
  const perf = usePerfConfig();
  const scrollRoot = scrollRootRef?.current ?? null;

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
    sectionRef,
    'why-bridge',
    scrollRoot,
    useCallback(
      (metrics) => {
        rawProgress.set(metrics.progress);
      },
      [rawProgress],
    ),
  );

  const eyebrowOpacity = useTransform(storyProgress, [0.04, 0.10, 0.88, 0.96], [0, 1, 1, 0]);

  // Beat 1: Por eso aparece primero (0.00 - 0.50)
  const conclusionOpacity = useTransform(storyProgress, [0.04, 0.12, 0.44, 0.50], [0, 1, 1, 0]);
  const conclusionY = useTransform(storyProgress, [0.04, 0.12, 0.50], [20, 0, -16]);

  // Beat 2: Pero saber qué importa no es suficiente (0.48 - 1.00)
  const handoffOpacity = useTransform(storyProgress, [0.48, 0.54, 0.90, 0.98], [0, 1, 1, 0]);
  const handoffY = useTransform(storyProgress, [0.48, 0.54, 0.98], [20, 0, -16]);

  const areShapesActive = useTransform(storyProgress, (p: number) => p >= 0.02 && p <= 0.98);

  return (
    <section
      ref={sectionRef}
      id="transition-to-changes"
      className="relative h-[320vh] min-h-[320vh] w-full bg-transparent contain-paint select-none"
      data-chapter="transition"
      aria-label="Transición de Por qué a Cambios"
    >
      <div className="sticky top-0 w-full h-[100svh] overflow-hidden">
        <OrganicFramingShapes
          active={true}
          animated={!reduceMotion && perf.tier === 'high'}
          variant="why-bridge"
        />

        {/* Eyebrow badge */}
        <motion.div
          className="absolute top-[clamp(72px,12vh,96px)] left-1/2 -translate-x-1/2 z-20 iv-noise-filter-transition__eyebrow"
          style={{ opacity: reduceMotion ? 1 : eyebrowOpacity }}
          aria-hidden="true"
        >
          <span className="iv-noise-filter-transition__eyebrow-step">02 → 03</span>
          <span className="iv-noise-filter-transition__eyebrow-sep">/</span>
          <span className="iv-noise-filter-transition__eyebrow-label">DE POR QUÉ A CAMBIOS</span>
        </motion.div>

        <div className="why-content-stack absolute inset-0 z-10">
          {/* Beat 1 */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none"
            style={{
              opacity: reduceMotion ? 1 : conclusionOpacity,
              y: reduceMotion ? 0 : conclusionY,
              display: useTransform(storyProgress, (p: number) => (p <= 0.52 ? 'flex' : 'none')),
            }}
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-5 leading-[1.1] max-w-4xl">
              Por eso aparece primero.
            </h2>
            <p className="text-base sm:text-xl text-slate-300 font-light max-w-2xl mx-auto leading-relaxed">
              {conclusion || 'FOCUS combina estos factores para decidir qué merece tu atención primero.'}
            </p>
          </motion.div>

          {/* Beat 2 */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none"
            style={{
              opacity: reduceMotion ? 1 : handoffOpacity,
              y: reduceMotion ? 0 : handoffY,
              display: useTransform(storyProgress, (p: number) => (p >= 0.46 ? 'flex' : 'none')),
            }}
            aria-label="Pero saber qué importa no es suficiente. También necesitas saber qué cambió."
          >
            <p className="text-2xl md:text-3xl lg:text-4xl font-light tracking-wide mb-4 text-slate-400 max-w-4xl">
              Pero saber qué importa no es suficiente.
            </p>
            <strong className="block text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-cyan-300 via-white to-violet-300 max-w-5xl">
              También necesitas saber qué cambió.
            </strong>
            <div
              className="mt-16 h-[2px] w-full max-w-[220px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"
              aria-hidden="true"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
