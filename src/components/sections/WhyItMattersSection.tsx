import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'motion/react';
import { Sparkles, Activity, TrendingDown, Clock, Target } from 'lucide-react';
import { FocusSignal } from '../../types/focus';
import { OrganicFramingShapes } from '../effects/OrganicFramingShapes';
import { useIntroScrollRoot } from './ArrivalSection';

interface WhyItMattersSectionProps {
  signals: FocusSignal[];
  conclusion: string;
  onContinue?: () => void;
}

type WhyStep = 'intro' | 'e1' | 'e2' | 'e3' | 'e4' | 'convergence' | 'conclusion';

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_OUT_SOFT: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Scroll only picks the active beat — never drives mid-fade opacities. */
function stepFromProgress(p: number): WhyStep {
  if (p < 0.14) return 'intro';
  if (p < 0.28) return 'e1';
  if (p < 0.42) return 'e2';
  if (p < 0.56) return 'e3';
  if (p < 0.68) return 'e4';
  if (p < 0.84) return 'convergence';
  return 'conclusion';
}

const STEP_LABEL: Record<WhyStep, string> = {
  intro: 'Por qué',
  e1: 'Impacto',
  e2: 'Deterioro',
  e3: 'Persistencia',
  e4: 'Contexto',
  convergence: 'Convergencia',
  conclusion: 'Cierre',
};

export const WhyItMattersSection: React.FC<WhyItMattersSectionProps> = ({ signals, conclusion }) => {
  const containerRef = useRef<HTMLElement>(null);
  const scrollRootRef = useIntroScrollRoot();
  const reduceMotion = !!useReducedMotion();
  const [step, setStep] = useState<WhyStep>('intro');

  const impactSignal = signals.find((s) => s.semanticType === 'impact') ?? signals[0] ?? {
    value: '12',
    label: 'Impacto',
    description: 'Afecta directamente los resultados clave de la operación.',
  };
  const deteriorationSignal = signals.find((s) => s.semanticType === 'deterioration') ?? signals[1] ?? {
    value: '+38%',
    label: 'Deterioro',
    description: 'La tendencia muestra un empeoramiento continuo frente a su referencia habitual.',
  };
  const persistenceSignal = signals.find((s) => s.semanticType === 'persistence') ?? signals[2] ?? {
    value: '6 días',
    label: 'Persistencia',
    description: 'No fue un pico: el retraso continúa de forma sistemática y consistente.',
  };
  const contextSignal = signals.find((s) => s.semanticType === 'context') ?? signals[3] ?? {
    value: 'Relación directa',
    label: 'Contexto',
    description: 'Condiciones externas y compromisos clave refuerzan el patrón.',
  };

  useEffect(() => {
    const container = containerRef.current;
    const root = scrollRootRef?.current ?? (document.getElementById('iv-intro-scroll') as HTMLElement | null);
    if (!container) return undefined;

    let frameId = 0;
    let lastStep: WhyStep | null = null;

    const handleScroll = () => {
      cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        const containerRect = container.getBoundingClientRect();
        const rootTop = root ? root.getBoundingClientRect().top : 0;
        const rootHeight = root ? root.clientHeight : window.innerHeight;
        const totalDistance = containerRect.height - rootHeight;

        if (totalDistance <= 0) {
          if (lastStep !== 'intro') {
            lastStep = 'intro';
            setStep('intro');
          }
          return;
        }

        const currentOffset = rootTop - containerRect.top;
        const p = Math.max(0, Math.min(1, currentOffset / totalDistance));
        const next = stepFromProgress(p);

        if (next !== lastStep) {
          lastStep = next;
          setStep(next);
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

  const showStage = step !== 'intro' && step !== 'conclusion';
  const showIntro = step === 'intro';
  const showConclusion = step === 'conclusion';
  const showHeader = step !== 'conclusion';

  const e1Active = step === 'e1';
  const e2Active = step === 'e2';
  const e3Active = step === 'e3';
  const e4Active = step === 'e4';
  const convActive = step === 'convergence';

  const t1Active = step === 'e1' || step === 'e2' || step === 'e3' || step === 'e4' || step === 'convergence';
  const t2Active = step === 'e2' || step === 'e3' || step === 'e4' || step === 'convergence';
  const t3Active = step === 'e3' || step === 'e4' || step === 'convergence';
  const t4Active = step === 'e4' || step === 'convergence';

  const confirmedCount =
    step === 'convergence' || step === 'conclusion'
      ? 4
      : step === 'e4'
        ? 4
        : step === 'e3'
          ? 3
          : step === 'e2'
            ? 2
            : step === 'e1'
              ? 1
              : 0;

  const activeStepNum =
    step === 'e4' || step === 'convergence' || step === 'conclusion'
      ? 4
      : step === 'e3'
        ? 3
        : step === 'e2'
          ? 2
          : step === 'e1'
            ? 1
            : 0;

  const coreBrightness = 0.4 + confirmedCount * 0.15 + (convActive ? 0.25 : 0) + (showConclusion ? 0.1 : 0);

  const fadeUp: Variants = useMemo(
    () => ({
      hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 22 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: reduceMotion ? 0.01 : 0.55, ease: EASE_OUT_EXPO },
      },
      exit: reduceMotion
        ? { opacity: 0, transition: { duration: 0.01 } }
        : { opacity: 0, y: -14, transition: { duration: 0.35, ease: EASE_OUT_SOFT } },
    }),
    [reduceMotion],
  );

  const layerFade: Variants = useMemo(
    () => ({
      hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.985, y: 12 },
      visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { duration: reduceMotion ? 0.01 : 0.55, ease: EASE_OUT_EXPO },
      },
      exit: reduceMotion
        ? { opacity: 0, transition: { duration: 0.01 } }
        : { opacity: 0, scale: 0.98, y: -10, transition: { duration: 0.4, ease: EASE_OUT_SOFT } },
    }),
    [reduceMotion],
  );

  const conclusionStagger: Variants = useMemo(
    () => ({
      hidden: {},
      visible: {
        transition: {
          staggerChildren: reduceMotion ? 0 : 0.12,
          delayChildren: reduceMotion ? 0 : 0.08,
        },
      },
      exit: {
        transition: { staggerChildren: reduceMotion ? 0 : 0.04, staggerDirection: -1 },
      },
    }),
    [reduceMotion],
  );

  const conclusionItem: Variants = useMemo(
    () => ({
      hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 18 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: reduceMotion ? 0.01 : 0.55, ease: EASE_OUT_EXPO },
      },
      exit: reduceMotion
        ? { opacity: 0, transition: { duration: 0.01 } }
        : { opacity: 0, y: -10, transition: { duration: 0.3, ease: EASE_OUT_SOFT } },
    }),
    [reduceMotion],
  );

  const beatKey =
    step === 'e1'
      ? 'e1'
      : step === 'e2'
        ? 'e2'
        : step === 'e3'
          ? 'e3'
          : step === 'e4'
            ? 'e4'
            : step === 'convergence'
              ? 'convergence'
              : null;

  return (
    <section
      ref={containerRef}
      id="section-chapter-why"
      className="relative h-[720vh] min-h-[720vh] w-full bg-transparent select-none -mt-6 sm:-mt-8 contain-paint"
      data-chapter="why"
      aria-label="Capítulo Por Qué: Cuatro evidencias hacia una conclusión"
    >
      <div className="sticky top-0 left-0 w-full h-[100vh] h-[100svh] overflow-hidden flex flex-col justify-between p-5 sm:p-8 lg:p-10 z-10">
        {/* Atmosphere */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute inset-0 opacity-[0.035] bg-[radial-gradient(#65d9ff_1px,transparent_1px)] [background-size:32px_32px]" />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] pointer-events-none transition-[background] duration-700"
            style={{
              width: '460px',
              height: '460px',
              background: `radial-gradient(circle, rgba(56, 189, 248, ${0.18 * coreBrightness}) 0%, rgba(139, 92, 246, ${0.14 * coreBrightness}) 45%, transparent 70%)`,
            }}
          />
          <svg className="absolute inset-0 w-full h-full opacity-15" preserveAspectRatio="none" viewBox="0 0 1440 900">
            <path d="M-100,750 C300,700 600,850 1100,720 C1300,660 1500,780 1600,800" fill="none" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1" strokeDasharray="4 8" />
            <path d="M-100,780 C320,730 640,880 1120,750 C1320,690 1520,810 1600,830" fill="none" stroke="rgba(192, 132, 252, 0.3)" strokeWidth="1" />
            <path d="M-100,810 C340,760 680,910 1140,780 C1340,720 1540,840 1600,860" fill="none" stroke="rgba(96, 165, 250, 0.25)" strokeWidth="0.8" />
          </svg>
        </div>

        {/* Header */}
        <motion.header
          className="relative z-20 flex items-center justify-between w-full max-w-7xl mx-auto"
          initial={false}
          animate={{ opacity: showHeader ? 1 : 0 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.4, ease: EASE_OUT_SOFT }}
          style={{ pointerEvents: showHeader ? undefined : 'none' }}
        >
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#07101e]/90 border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.4)] backdrop-blur-md">
            <span className="text-cyan-400 font-mono text-xs font-semibold tracking-wider">
              {activeStepNum > 0 ? `0${activeStepNum} / 04` : '02 / 07'}
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <strong className="text-white text-xs tracking-widest uppercase font-medium">
              {STEP_LABEL[step]}
            </strong>
          </div>

          <AnimatePresence>
            {confirmedCount > 0 && showHeader && (
              <motion.div
                key="evidence-count"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#081224]/85 border border-cyan-500/25 shadow-[0_0_15px_rgba(6,182,212,0.15)] backdrop-blur-md"
                initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.25 } }}
                transition={{ duration: 0.4, ease: EASE_OUT_SOFT }}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-400 font-mono text-xs uppercase tracking-wider">Evidencias:</span>
                <span className="text-cyan-300 font-mono text-xs font-bold">{confirmedCount} / 4</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>

        {/* INTRO — full enter/exit, never mid-scrub */}
        <AnimatePresence mode="sync">
          {showIntro && (
            <motion.div
              key="why-intro"
              className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-20 pointer-events-none"
              variants={layerFade}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[340px] bg-gradient-to-r from-blue-600/25 via-cyan-500/20 to-purple-600/20 blur-[100px] pointer-events-none" />

              <motion.div className="mb-8 relative z-10" variants={fadeUp}>
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#0c1424]/85 border border-cyan-500/30 backdrop-blur-xl shadow-[0_0_25px_rgba(56,189,248,0.15)]">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-sm md:text-base text-cyan-200 font-normal tracking-wide">
                    Ya sabes qué mirar.
                  </span>
                </div>
              </motion.div>

              <motion.div className="max-w-4xl mx-auto relative z-10" variants={fadeUp}>
                <div className="flex items-center justify-center gap-3 mb-6 opacity-60">
                  <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-cyan-400" />
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-cyan-400" />
                </div>

                <h2 className="text-5xl sm:text-7xl md:text-[5rem] font-bold tracking-tight text-white mb-6 leading-[1.04] bg-gradient-to-b from-white via-slate-100 to-blue-200 bg-clip-text text-transparent filter drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
                  No fue una sola señal.
                </h2>

                <p className="text-lg sm:text-2xl text-slate-300 font-light max-w-2xl mx-auto leading-relaxed mb-6">
                  FOCUS encontró{' '}
                  <span className="text-white font-medium underline decoration-cyan-400/60 decoration-2 underline-offset-4">
                    cuatro razones
                  </span>{' '}
                  que, juntas, <span className="text-cyan-300 font-medium">cambian la lectura</span>.
                </p>

                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-slate-300 text-xs font-mono tracking-widest uppercase backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>4 Evidencias en Convergencia</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* EVIDENCE MATRIX */}
        <AnimatePresence mode="sync">
          {showStage && (
            <motion.div
              key="why-stage"
              className="relative z-10 w-full max-w-7xl mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto"
              variants={layerFade}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Left narrative beat */}
              <div className="lg:col-span-5 relative flex flex-col justify-center min-h-[380px]">
                <AnimatePresence mode="wait">
                  {beatKey === 'e1' && (
                    <motion.div
                      key="beat-e1"
                      className="flex flex-col justify-center absolute inset-0"
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-cyan-400 font-mono text-xs font-bold tracking-widest uppercase">01 / 04</span>
                        <span className="text-slate-500 font-mono text-xs">/</span>
                        <strong className="text-cyan-300 font-mono text-xs tracking-wider uppercase">IMPACTO DIRECTO</strong>
                      </div>
                      <div className="flex flex-col mb-4">
                        <span className="text-6xl sm:text-7xl font-bold font-mono text-white tracking-tight leading-none mb-1">
                          {impactSignal.value}
                        </span>
                        <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                          de afectación directa
                        </span>
                      </div>
                      <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed max-w-md mb-6">
                        {impactSignal.description}
                      </p>
                    </motion.div>
                  )}

                  {beatKey === 'e2' && (
                    <motion.div
                      key="beat-e2"
                      className="flex flex-col justify-center absolute inset-0"
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-purple-400 font-mono text-xs font-bold tracking-widest uppercase">02 / 04</span>
                        <span className="text-slate-500 font-mono text-xs">/</span>
                        <strong className="text-purple-300 font-mono text-xs tracking-wider uppercase">DETERIORO PROGRESIVO</strong>
                      </div>
                      <div className="flex flex-col mb-4">
                        <span className="text-6xl sm:text-7xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-purple-300 to-indigo-300 tracking-tight leading-none mb-1">
                          {deteriorationSignal.value}
                        </span>
                        <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                          de desviación crítica
                        </span>
                      </div>
                      <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed max-w-md mb-6">
                        {deteriorationSignal.description}
                      </p>
                    </motion.div>
                  )}

                  {beatKey === 'e3' && (
                    <motion.div
                      key="beat-e3"
                      className="flex flex-col justify-center absolute inset-0"
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-blue-400 font-mono text-xs font-bold tracking-widest uppercase">03 / 04</span>
                        <span className="text-slate-500 font-mono text-xs">/</span>
                        <strong className="text-blue-300 font-mono text-xs tracking-wider uppercase">PERSISTENCIA TEMPORAL</strong>
                      </div>
                      <div className="flex flex-col mb-4">
                        <span className="text-6xl sm:text-7xl font-bold font-mono text-white tracking-tight leading-none mb-1">
                          {persistenceSignal.value}
                        </span>
                        <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                          de retraso sostenido
                        </span>
                      </div>
                      <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed max-w-md mb-6">
                        {persistenceSignal.description}
                      </p>
                      <div className="p-4 rounded-2xl bg-[#081224]/80 border border-white/10 max-w-md mb-6 backdrop-blur-md">
                        <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2">
                          <span>DÍA 1</span>
                          <span className="text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                            CONTINÚA
                          </span>
                          <span>DÍA 6</span>
                        </div>
                        <div className="relative h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(56,189,248,0.6)]"
                            initial={reduceMotion ? { width: '100%' } : { width: '15%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: reduceMotion ? 0.01 : 0.9, ease: EASE_OUT_SOFT, delay: reduceMotion ? 0 : 0.15 }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {beatKey === 'e4' && (
                    <motion.div
                      key="beat-e4"
                      className="flex flex-col justify-center absolute inset-0"
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-emerald-400 font-mono text-xs font-bold tracking-widest uppercase">04 / 04</span>
                        <span className="text-slate-500 font-mono text-xs">/</span>
                        <strong className="text-emerald-300 font-mono text-xs tracking-wider uppercase">CONTEXTO OPERATIVO</strong>
                      </div>
                      <div className="flex flex-col mb-4">
                        <span className="text-5xl sm:text-6xl font-bold font-mono text-white tracking-tight leading-tight mb-1">
                          {contextSignal.value}
                        </span>
                        <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                          en cadena de valor
                        </span>
                      </div>
                      <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed max-w-md mb-6">
                        {contextSignal.description}
                      </p>
                    </motion.div>
                  )}

                  {beatKey === 'convergence' && (
                    <motion.div
                      key="beat-convergence"
                      className="flex flex-col justify-center absolute inset-0"
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <span className="text-cyan-400 font-mono text-xs font-bold uppercase tracking-widest block mb-3">
                        04 / 04 EVIDENCIAS CONFIRMADAS
                      </span>
                      <h3 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight mb-3">
                        Por separado son señales.
                      </h3>
                      <h3 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
                        Juntas cambian la{' '}
                        <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                          prioridad.
                        </span>
                      </h3>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right cybernetic matrix */}
              <motion.div
                className="lg:col-span-7 relative flex items-center justify-center w-full min-h-[460px] aspect-square max-w-[580px] mx-auto"
                initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: reduceMotion ? 0.01 : 0.55, ease: EASE_OUT_EXPO, delay: reduceMotion ? 0 : 0.05 }}
              >
                <svg viewBox="0 0 600 600" className="w-full h-full block overflow-visible pointer-events-none" aria-hidden="true">
                  <defs>
                    <filter id="cyber-glow" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="3.5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <linearGradient id="bus-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="1" />
                      <stop offset="100%" stopColor="#0284c7" stopOpacity="0.4" />
                    </linearGradient>
                    <linearGradient id="bus-purple" x1="100%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#c084fc" stopOpacity="1" />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.4" />
                    </linearGradient>
                    <linearGradient id="bus-blue" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#60a5fa" stopOpacity="1" />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity="0.4" />
                    </linearGradient>
                    <linearGradient id="bus-emerald" x1="100%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#34d399" stopOpacity="1" />
                      <stop offset="100%" stopColor="#059669" stopOpacity="0.4" />
                    </linearGradient>
                  </defs>

                  <circle cx="300" cy="300" r="230" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" strokeDasharray="3 9" />
                  <circle cx="300" cy="300" r="180" fill="none" stroke="rgba(56, 189, 248, 0.08)" strokeWidth="1" />
                  <circle cx="300" cy="300" r="130" fill="none" stroke="rgba(192, 132, 252, 0.12)" strokeWidth="1.5" strokeDasharray="8 12" />

                  <g opacity={t1Active ? 1 : 0.2} style={{ transition: 'opacity 0.45s ease' }}>
                    <path d="M 130,130 L 190,190 L 220,190 L 250,250" fill="none" stroke="url(#bus-cyan)" strokeWidth="2.5" filter="url(#cyber-glow)" />
                    <path d="M 145,130 L 195,180 L 225,180 L 255,240" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 6" opacity="0.6" />
                    <line x1="205" y1="185" x2="205" y2="175" stroke="#38bdf8" strokeWidth="1.5" />
                    <circle cx="205" cy="172" r="2" fill="#38bdf8" />
                  </g>
                  <g opacity={t2Active ? 1 : 0.2} style={{ transition: 'opacity 0.45s ease' }}>
                    <path d="M 470,130 L 410,190 L 380,190 L 350,250" fill="none" stroke="url(#bus-purple)" strokeWidth="2.5" filter="url(#cyber-glow)" />
                    <path d="M 455,130 L 405,180 L 375,180 L 345,240" fill="none" stroke="#c084fc" strokeWidth="1" strokeDasharray="4 6" opacity="0.6" />
                    <line x1="395" y1="185" x2="395" y2="175" stroke="#c084fc" strokeWidth="1.5" />
                    <circle cx="395" cy="172" r="2" fill="#c084fc" />
                  </g>
                  <g opacity={t3Active ? 1 : 0.2} style={{ transition: 'opacity 0.45s ease' }}>
                    <path d="M 130,470 L 190,410 L 220,410 L 250,350" fill="none" stroke="url(#bus-blue)" strokeWidth="2.5" filter="url(#cyber-glow)" />
                    <path d="M 145,470 L 195,420 L 225,420 L 255,360" fill="none" stroke="#60a5fa" strokeWidth="1" strokeDasharray="4 6" opacity="0.6" />
                    <line x1="205" y1="415" x2="205" y2="425" stroke="#60a5fa" strokeWidth="1.5" />
                    <circle cx="205" cy="428" r="2" fill="#60a5fa" />
                  </g>
                  <g opacity={t4Active ? 1 : 0.2} style={{ transition: 'opacity 0.45s ease' }}>
                    <path d="M 470,470 L 410,410 L 380,410 L 350,350" fill="none" stroke="url(#bus-emerald)" strokeWidth="2.5" filter="url(#cyber-glow)" />
                    <path d="M 455,470 L 405,420 L 375,420 L 345,360" fill="none" stroke="#34d399" strokeWidth="1" strokeDasharray="4 6" opacity="0.6" />
                    <line x1="395" y1="415" x2="395" y2="425" stroke="#34d399" strokeWidth="1.5" />
                    <circle cx="395" cy="428" r="2" fill="#34d399" />
                  </g>

                  <g className="origin-center">
                    <circle cx="300" cy="300" r={85} fill="rgba(56, 189, 248, 0.08)" filter="url(#cyber-glow)" />
                    <circle cx="300" cy="300" r={72} fill="none" stroke="rgba(192, 132, 252, 0.4)" strokeWidth="1.5" strokeDasharray="6 14" />
                    <circle cx="300" cy="300" r={64} fill="rgba(6, 14, 28, 0.95)" stroke="#38bdf8" strokeWidth="2.5" filter="url(#cyber-glow)" />
                    <circle cx="300" cy="300" r={54} fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" strokeDasharray="4 4" />
                    <circle cx="300" cy="300" r={46} fill="#0c1a36" />
                    <text
                      x="300"
                      y="312"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontFamily="'Outfit', sans-serif"
                      fontSize="36"
                      fontWeight="800"
                      letterSpacing="0.05em"
                      filter="url(#cyber-glow)"
                    >
                      F
                    </text>
                  </g>
                </svg>

                {/* Node cards — discrete active/confirmed/dormant via CSS transition */}
                <div
                  className={`absolute top-[6%] left-0 sm:left-[2%] z-20 w-[190px] p-3 rounded-2xl border transition-all duration-500 ${
                    e1Active
                      ? 'bg-[#08152c]/95 border-cyan-400 shadow-[0_0_25px_rgba(56,189,248,0.4)] scale-105 opacity-100'
                      : t1Active
                        ? 'bg-[#081224]/80 border-cyan-500/30 opacity-70'
                        : 'bg-[#060d1a]/50 border-white/5 opacity-30'
                  } backdrop-blur-xl`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${e1Active ? 'bg-cyan-500 text-black' : 'bg-cyan-500/20 text-cyan-300'}`}>
                      <Activity className="w-3.5 h-3.5" />
                    </div>
                    <strong className="text-white text-xs font-bold uppercase tracking-wider font-mono">Impacto</strong>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug mb-2">Afecta directamente los resultados clave.</p>
                  <div className="flex items-center justify-between pt-1.5 border-t border-white/10 text-[10px] font-mono">
                    <span className="text-slate-400">Nivel:</span>
                    <span className="text-cyan-300 font-bold">Alto</span>
                  </div>
                </div>

                <div
                  className={`absolute top-[6%] right-0 sm:right-[2%] z-20 w-[190px] p-3 rounded-2xl border transition-all duration-500 ${
                    e2Active
                      ? 'bg-[#180d2c]/95 border-purple-400 shadow-[0_0_25px_rgba(192,132,252,0.4)] scale-105 opacity-100'
                      : t2Active
                        ? 'bg-[#120a22]/80 border-purple-500/30 opacity-70'
                        : 'bg-[#0a0614]/50 border-white/5 opacity-30'
                  } backdrop-blur-xl`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${e2Active ? 'bg-purple-500 text-black' : 'bg-purple-500/20 text-purple-300'}`}>
                      <TrendingDown className="w-3.5 h-3.5" />
                    </div>
                    <strong className="text-white text-xs font-bold uppercase tracking-wider font-mono">Deterioro</strong>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug mb-2">La tendencia muestra empeoramiento continuo.</p>
                  <div className="flex items-center justify-between pt-1.5 border-t border-white/10 text-[10px] font-mono">
                    <span className="text-slate-400">Velocidad:</span>
                    <span className="text-purple-300 font-bold">+24%</span>
                  </div>
                </div>

                <div
                  className={`absolute bottom-[6%] left-0 sm:left-[2%] z-20 w-[190px] p-3 rounded-2xl border transition-all duration-500 ${
                    e3Active
                      ? 'bg-[#08152c]/95 border-blue-400 shadow-[0_0_25px_rgba(96,165,250,0.4)] scale-105 opacity-100'
                      : t3Active
                        ? 'bg-[#081224]/80 border-blue-500/30 opacity-70'
                        : 'bg-[#060d1a]/50 border-white/5 opacity-30'
                  } backdrop-blur-xl`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${e3Active ? 'bg-blue-500 text-black' : 'bg-blue-500/20 text-blue-300'}`}>
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <strong className="text-white text-xs font-bold uppercase tracking-wider font-mono">Persistencia</strong>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug mb-2">Se mantiene estable en el tiempo.</p>
                  <div className="flex items-center justify-between pt-1.5 border-t border-white/10 text-[10px] font-mono">
                    <span className="text-slate-400">Duración:</span>
                    <span className="text-blue-300 font-bold">6 días</span>
                  </div>
                </div>

                <div
                  className={`absolute bottom-[6%] right-0 sm:right-[2%] z-20 w-[190px] p-3 rounded-2xl border transition-all duration-500 ${
                    e4Active
                      ? 'bg-[#08221c]/95 border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.4)] scale-105 opacity-100'
                      : t4Active
                        ? 'bg-[#081a16]/80 border-emerald-500/30 opacity-70'
                        : 'bg-[#040e0c]/50 border-white/5 opacity-30'
                  } backdrop-blur-xl`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${e4Active ? 'bg-emerald-500 text-black' : 'bg-emerald-500/20 text-emerald-300'}`}>
                      <Target className="w-3.5 h-3.5" />
                    </div>
                    <strong className="text-white text-xs font-bold uppercase tracking-wider font-mono">Contexto</strong>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug mb-2">Condiciones externas refuerzan el patrón.</p>
                  <div className="flex items-center justify-between pt-1.5 border-t border-white/10 text-[10px] font-mono">
                    <span className="text-slate-400">Confianza:</span>
                    <span className="text-emerald-300 font-bold">92%</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CONCLUSION — staggered Motion enter + organic framing shapes (bridge to Cambios) */}
        <AnimatePresence mode="sync">
          {showConclusion && (
            <motion.div
              key="why-conclusion"
              className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-30 pointer-events-none"
              variants={conclusionStagger}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Organic 3D framing — cyan/violet bridge palette (FOCUS line) */}
              <motion.div
                className="absolute inset-0 z-0"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: reduceMotion ? 0.01 : 0.9, ease: EASE_OUT_SOFT }}
                aria-hidden="true"
              >
                <OrganicFramingShapes active variant="why-bridge" />
              </motion.div>

              {/* Chapter bridge eyebrow */}
              <motion.div
                variants={conclusionItem}
                className="absolute top-[clamp(72px,12vh,96px)] left-1/2 -translate-x-1/2 z-10 iv-noise-filter-transition__eyebrow"
                aria-hidden="true"
              >
                <span className="iv-noise-filter-transition__eyebrow-step">03 → 04</span>
                <span className="iv-noise-filter-transition__eyebrow-sep">/</span>
                <span className="iv-noise-filter-transition__eyebrow-label">DE POR QUÉ A CAMBIOS</span>
              </motion.div>

              <motion.h2
                variants={conclusionItem}
                className="relative z-10 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-5 leading-[1.1] max-w-4xl"
              >
                Por eso aparece primero.
              </motion.h2>

              <motion.p
                variants={conclusionItem}
                className="relative z-10 text-base sm:text-xl text-slate-400 font-light max-w-2xl mx-auto leading-relaxed mb-8"
              >
                {conclusion ||
                  'FOCUS combina estos factores para decidir qué merece tu atención primero.'}
              </motion.p>

              <motion.div
                variants={conclusionItem}
                className="relative z-10 h-px w-48 bg-gradient-to-r from-transparent via-cyan-400/65 to-transparent mx-auto mb-10"
              />

              <motion.div variants={conclusionItem} className="relative z-10 max-w-xl mx-auto">
                <small className="text-cyan-400/85 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.22em] block mb-3 font-semibold">
                  Pero para entenderlo, hay que volver al momento en que cambió.
                </small>
                <span className="text-xl sm:text-2xl md:text-3xl font-semibold bg-gradient-to-r from-cyan-200 via-white to-violet-200 bg-clip-text text-transparent tracking-tight block">
                  Veamos qué cambió.
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer banner */}
        <AnimatePresence>
          {showStage && (
            <motion.footer
              key="why-footer"
              className="relative z-20 w-full max-w-7xl mx-auto mt-auto pt-2"
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8, transition: { duration: 0.3 } }}
              transition={{ duration: reduceMotion ? 0.01 : 0.45, ease: EASE_OUT_SOFT, delay: reduceMotion ? 0 : 0.1 }}
            >
              <div className="p-3 sm:p-4 rounded-2xl bg-[#081224]/85 border border-cyan-500/20 backdrop-blur-xl flex items-center gap-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-normal m-0">
                  Las cuatro dimensiones convergen en un mismo punto:{' '}
                  <span className="text-cyan-300 font-medium">
                    el retraso no es un evento aislado, es un patrón estructural
                  </span>
                  .
                </p>
              </div>
            </motion.footer>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
