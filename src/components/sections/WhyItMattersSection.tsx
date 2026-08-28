import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'motion/react';
import {
  Sparkles,
  Activity,
  TrendingDown,
  Clock,
  Target,
  CheckCircle2,
} from 'lucide-react';
import { FocusSignal } from '../../types/focus';
import { useIntroScrollRoot } from './ArrivalSection';

interface WhyItMattersSectionProps {
  signals: FocusSignal[];
}

type WhyStep = 'intro' | 'e1' | 'e2' | 'e3' | 'e4' | 'convergence';

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_OUT_SOFT: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Animated Canvas Particle Orbit surrounding the central "F" Core
 */
const CoreParticleField: React.FC<{ activeStep: WhyStep; reduceMotion: boolean }> = ({ reduceMotion }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const width = (canvas.width = 360);
    const height = (canvas.height = 360);
    const cx = width / 2;
    const cy = height / 2;

    const particles = Array.from({ length: 18 }).map((_, i) => ({
      orbitRadiusX: 54 + (i % 5) * 20,
      orbitRadiusY: 42 + (i % 5) * 15,
      tilt: ((i * 37) % 360) * (Math.PI / 180),
      angle: (i / 18) * Math.PI * 2,
      speed: (0.008 + (i % 4) * 0.005) * (i % 2 === 0 ? 1 : -1) * (reduceMotion ? 0.2 : 1),
      size: 1.2 + (i % 3) * 0.8,
      color:
        i % 4 === 0
          ? '#38bdf8'
          : i % 4 === 1
          ? '#c084fc'
          : i % 4 === 2
          ? '#818cf8'
          : '#34d399',
      pulseOffset: i * 0.4,
    }));

    let t = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      t += 0.02;

      particles.forEach((p) => {
        p.angle += p.speed;
        const cosTilt = Math.cos(p.tilt);
        const sinTilt = Math.sin(p.tilt);

        const xRaw = Math.cos(p.angle) * p.orbitRadiusX;
        const yRaw = Math.sin(p.angle) * p.orbitRadiusY;

        const x = cx + xRaw * cosTilt - yRaw * sinTilt;
        const y = cy + xRaw * sinTilt + yRaw * cosTilt;

        const opacity = 0.35 + 0.55 * Math.sin(t + p.pulseOffset);

        ctx.beginPath();
        ctx.arc(x, y, p.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = opacity * 0.25;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = opacity * 0.9;
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [reduceMotion]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" width={360} height={360} />;
};

/** Scroll only picks the active beat — never drives mid-fade opacities. */
function stepFromProgress(p: number): WhyStep {
  if (p < 0.16) return 'intro';
  if (p < 0.32) return 'e1';
  if (p < 0.48) return 'e2';
  if (p < 0.64) return 'e3';
  if (p < 0.8) return 'e4';
  return 'convergence';
}

const STEP_LABEL: Record<WhyStep, string> = {
  intro: 'Por qué',
  e1: 'Impacto',
  e2: 'Deterioro',
  e3: 'Persistencia',
  e4: 'Contexto',
  convergence: 'Convergencia',
};

export const WhyItMattersSection: React.FC<WhyItMattersSectionProps> = ({ signals }) => {
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

        container.style.setProperty('--iv-why-viewport-height', `${rootHeight}px`);

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

  const showStage = step !== 'intro';
  const showIntro = step === 'intro';
  const showHeader = true;

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
    step === 'convergence'
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
    step === 'e4' || step === 'convergence'
      ? 4
      : step === 'e3'
        ? 3
        : step === 'e2'
          ? 2
          : step === 'e1'
            ? 1
            : 0;

  const coreBrightness = 0.45 + confirmedCount * 0.15 + (convActive ? 0.3 : 0);

  // Dynamic atmospheric colors according to the active step
  const activeColorGradient = useMemo(() => {
    switch (step) {
      case 'e1':
        return 'from-cyan-500/20 via-blue-600/10 to-transparent';
      case 'e2':
        return 'from-purple-500/20 via-fuchsia-600/10 to-transparent';
      case 'e3':
        return 'from-blue-500/20 via-indigo-600/10 to-transparent';
      case 'e4':
        return 'from-emerald-500/20 via-teal-600/10 to-transparent';
      case 'convergence':
        return 'from-cyan-400/20 via-purple-500/15 to-emerald-400/10';
      default:
        return 'from-blue-600/15 via-cyan-500/10 to-purple-600/10';
    }
  }, [step]);

  const fadeUp: Variants = useMemo(
    () => ({
      hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: reduceMotion ? 0.01 : 0.5, ease: EASE_OUT_EXPO },
      },
      exit: reduceMotion
        ? { opacity: 0, transition: { duration: 0.01 } }
        : { opacity: 0, y: -14, transition: { duration: 0.3, ease: EASE_OUT_SOFT } },
    }),
    [reduceMotion],
  );

  const layerFade: Variants = useMemo(
    () => ({
      hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.985, y: 10 },
      visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { duration: reduceMotion ? 0.01 : 0.55, ease: EASE_OUT_EXPO },
      },
      exit: reduceMotion
        ? { opacity: 0, transition: { duration: 0.01 } }
        : { opacity: 0, scale: 0.985, y: -10, transition: { duration: 0.35, ease: EASE_OUT_SOFT } },
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
      className="relative h-[620vh] min-h-[620vh] w-full bg-transparent select-none -mt-6 sm:-mt-8 contain-paint"
      data-chapter="why"
      aria-label="Capítulo Por Qué: Cuatro evidencias hacia una conclusión"
    >
      {/* Laser pulses and subtle border-beam animations */}
      <style>{`
        @keyframes laser-pulse-flow {
          0% { stroke-dashoffset: 280; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes border-beam-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes gyro-cw {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes gyro-ccw {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        .anim-conduit-pulse {
          stroke-dasharray: 30 160;
          animation: laser-pulse-flow 2.2s linear infinite;
        }
        .anim-gyro-cw {
          transform-origin: 300px 260px;
          animation: gyro-cw 48s linear infinite;
        }
        .anim-gyro-ccw {
          transform-origin: 300px 260px;
          animation: gyro-ccw 64s linear infinite;
        }
        .border-beam-badge {
          position: relative;
          overflow: hidden;
        }
        .border-beam-badge::before {
          content: '';
          position: absolute;
          inset: -150%;
          background: conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 280deg, #38bdf8 320deg, #c084fc 360deg);
          animation: border-beam-spin 4.5s linear infinite;
          pointer-events: none;
        }
      `}</style>

      <div
        className="sticky top-0 left-0 w-full overflow-hidden flex flex-col justify-between p-4 sm:p-7 lg:p-9 z-10"
        style={{ height: 'var(--iv-why-viewport-height, 100svh)' }}
      >
        {/* Deep Atmosphere Glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute inset-0 opacity-[0.035] bg-[radial-gradient(#65d9ff_1px,transparent_1px)] [background-size:36px_36px]" />
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px] pointer-events-none transition-all duration-1000 bg-gradient-to-tr ${activeColorGradient}`}
            style={{
              width: '680px',
              height: '680px',
              opacity: 0.55 + confirmedCount * 0.1,
            }}
          />
          {/* Subtle Ambient Cosmic Grid & Curves */}
          <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1440 900">
            <path d="M-80,720 C280,680 580,820 1080,700 C1280,650 1480,760 1600,780" fill="none" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1" strokeDasharray="4 8" />
            <path d="M-80,750 C300,710 620,850 1100,730 C1300,680 1500,790 1600,810" fill="none" stroke="rgba(192, 132, 252, 0.35)" strokeWidth="1" />
            <path d="M-80,780 C320,740 660,880 1120,760 C1320,710 1520,820 1600,840" fill="none" stroke="rgba(96, 165, 250, 0.25)" strokeWidth="0.8" />
          </svg>
        </div>

        {/* TOP COMPONENTS WITH SUBTLE ROTATING BORDER BEAM ANIMATION */}
        <motion.header
          className="relative z-30 flex items-center justify-between w-full max-w-7xl mx-auto"
          initial={false}
          animate={{ opacity: showHeader ? 1 : 0 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.4, ease: EASE_OUT_SOFT }}
          style={{ pointerEvents: showHeader ? undefined : 'none' }}
        >
          {/* Left Step Badge with Animated Glowing Border */}
          <div className="border-beam-badge p-[1px] rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
            <div className="relative z-10 inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#040914]/95 backdrop-blur-xl border border-white/10">
              <span className="text-cyan-400 font-mono text-xs font-bold tracking-widest">
                {activeStepNum > 0 ? `0${activeStepNum} / 04` : '03 / 04'}
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8] animate-pulse" />
              <strong className="text-white text-xs tracking-widest uppercase font-mono font-semibold">
                {STEP_LABEL[step]}
              </strong>
            </div>
          </div>

          {/* Right Evidence Counter with Animated Glowing Border */}
          <AnimatePresence>
            {showHeader && (
              <motion.div
                key="evidence-count-badge"
                className="border-beam-badge p-[1px] rounded-full shadow-[0_4px_24px_rgba(56,189,248,0.25)]"
                initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.25 } }}
                transition={{ duration: 0.4, ease: EASE_OUT_SOFT }}
              >
                <div className="relative z-10 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#050e1f]/95 backdrop-blur-xl border border-cyan-500/40 shadow-[0_0_15px_rgba(56,189,248,0.25)]">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span className="text-slate-300 font-mono text-xs uppercase tracking-wider font-medium">EVIDENCIAS:</span>
                  <span className="text-cyan-300 font-mono text-xs font-bold">{confirmedCount > 0 ? confirmedCount : 3} / 4</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>

        {/* INTRO BEAT (CLEAN & MINIMALIST BEFORE FIRST EVIDENCE) */}
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

        {/* MAIN STAGE: LEFT DETAIL CARD + RIGHT CONNECTED REACTOR NETWORK */}
        <AnimatePresence mode="sync">
          {showStage && (
            <motion.div
              key="why-stage"
              className="relative z-20 w-full max-w-7xl mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto"
              variants={layerFade}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* LEFT COLUMN: DETAIL CARD WITH SPECULAR SHINE, GLOWS AND COLORFUL GRADIENT TEXT */}
              <div className="lg:col-span-5 relative flex flex-col justify-center min-h-[400px] sm:min-h-[440px]">
                <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-b from-[#071328]/90 via-[#040c1a]/92 to-[#02060e]/95 border border-white/10 backdrop-blur-2xl p-8 sm:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.15)]">
                  
                  {/* Top-Left Ambient Specular Glow Flare */}
                  <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-gradient-to-br from-cyan-400/25 via-blue-600/15 to-transparent blur-3xl pointer-events-none" />

                  {/* Luminous Top Accent Border */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${
                      step === 'e1'
                        ? 'from-cyan-400/80 via-blue-400 to-transparent'
                        : step === 'e2'
                        ? 'from-purple-400/80 via-pink-400 to-transparent'
                        : step === 'e3'
                        ? 'from-cyan-400/90 via-purple-400/90 to-transparent'
                        : step === 'e4'
                        ? 'from-emerald-400/80 via-teal-400 to-transparent'
                        : 'from-cyan-400 via-purple-400 to-emerald-400'
                    }`}
                  />

                  <AnimatePresence mode="wait">
                    {/* EVIDENCIA 1: IMPACTO */}
                    {beatKey === 'e1' && (
                      <motion.div
                        key="beat-e1"
                        className="flex flex-col"
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <span className="text-cyan-400 font-mono text-xs font-bold tracking-[0.2em] uppercase mb-4 block">
                          IMPACTO DIRECTO
                        </span>

                        <div className="flex flex-col mb-4">
                          <span className="text-5xl sm:text-6xl md:text-7xl font-bold font-mono text-white tracking-tight leading-none mb-2 drop-shadow-[0_0_30px_rgba(56,189,248,0.4)]">
                            {impactSignal.value}
                          </span>
                          <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent leading-tight">
                            de afectación directa
                          </span>
                        </div>

                        {/* Cyan Accent Line */}
                        <div className="w-10 h-[2px] bg-cyan-400 rounded-full mb-5 shadow-[0_0_8px_#38bdf8]" />

                        <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed mb-6">
                          {impactSignal.description}
                        </p>

                        {/* Metric Indicator Widget */}
                        <div className="p-4 rounded-xl bg-[#030914]/90 border border-cyan-500/20 backdrop-blur-md">
                          <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2">
                            <span>OPERACIÓN BASE</span>
                            <span className="text-cyan-300 font-bold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
                              ALTO IMPACTO
                            </span>
                            <span>RIESGO MÁXIMO</span>
                          </div>
                          <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 rounded-full shadow-[0_0_12px_rgba(56,189,248,0.7)]"
                              initial={reduceMotion ? { width: '85%' } : { width: '20%' }}
                              animate={{ width: '85%' }}
                              transition={{ duration: reduceMotion ? 0.01 : 0.85, ease: EASE_OUT_SOFT }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* EVIDENCIA 2: DETERIORO */}
                    {beatKey === 'e2' && (
                      <motion.div
                        key="beat-e2"
                        className="flex flex-col"
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <span className="text-purple-400 font-mono text-xs font-bold tracking-[0.2em] uppercase mb-4 block">
                          DETERIORO PROGRESIVO
                        </span>

                        <div className="flex flex-col mb-4">
                          <span className="text-5xl sm:text-6xl md:text-7xl font-bold font-mono text-white tracking-tight leading-none mb-2 drop-shadow-[0_0_30px_rgba(192,132,252,0.4)]">
                            {deteriorationSignal.value}
                          </span>
                          <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 via-fuchsia-300 to-pink-400 bg-clip-text text-transparent leading-tight">
                            de desviación crítica
                          </span>
                        </div>

                        {/* Purple Accent Line */}
                        <div className="w-10 h-[2px] bg-purple-400 rounded-full mb-5 shadow-[0_0_8px_#c084fc]" />

                        <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed mb-6">
                          {deteriorationSignal.description}
                        </p>

                        {/* Metric Indicator Widget */}
                        <div className="p-4 rounded-xl bg-[#080414]/90 border border-purple-500/20 backdrop-blur-md">
                          <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2">
                            <span>VELOCIDAD NORMAL</span>
                            <span className="text-purple-300 font-bold px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30">
                              +24% ACELERACIÓN
                            </span>
                            <span>CRÍTICO</span>
                          </div>
                          <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-purple-400 via-fuchsia-500 to-rose-500 rounded-full shadow-[0_0_12px_rgba(192,132,252,0.7)]"
                              initial={reduceMotion ? { width: '78%' } : { width: '20%' }}
                              animate={{ width: '78%' }}
                              transition={{ duration: reduceMotion ? 0.01 : 0.85, ease: EASE_OUT_SOFT }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* EVIDENCIA 3: PERSISTENCIA (EXACTLY MATCHING IMAGE 2) */}
                    {beatKey === 'e3' && (
                      <motion.div
                        key="beat-e3"
                        className="flex flex-col"
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <span className="text-cyan-400 font-mono text-xs font-bold tracking-[0.2em] uppercase mb-4 block">
                          PERSISTENCIA TEMPORAL
                        </span>

                        <div className="flex flex-col mb-3">
                          <span className="text-5xl sm:text-6xl md:text-7xl font-bold font-sans text-white tracking-tight leading-none mb-2 drop-shadow-[0_0_30px_rgba(255,255,255,0.25)]">
                            6 días
                          </span>
                          <span className="text-2xl sm:text-3xl md:text-[2rem] font-bold bg-gradient-to-r from-[#00f2fe] via-[#38bdf8] to-[#c084fc] bg-clip-text text-transparent leading-tight">
                            de retraso sostenido
                          </span>
                        </div>

                        {/* Cyan Accent Line */}
                        <div className="w-10 h-[2px] bg-cyan-400 rounded-full mb-5 shadow-[0_0_8px_#38bdf8]" />

                        <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed mb-6">
                          No fue un pico: el retraso continúa de forma sistemática y consistente.
                        </p>

                        {/* Clean 6-day Timeline (exact match) */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-[#040b17]/90 border border-white/10 backdrop-blur-md shadow-inner">
                          <div className="flex justify-between items-center text-[10px] sm:text-xs font-mono uppercase tracking-widest text-slate-400 mb-2.5">
                            <span className="font-semibold">DÍA 1</span>
                            <span className="text-cyan-300 font-bold px-2.5 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-400/30 text-[10px] tracking-wider shadow-[0_0_10px_rgba(56,189,248,0.25)]">
                              CONTINÚA
                            </span>
                            <span className="font-semibold">DÍA 6</span>
                          </div>
                          <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#00f2fe] via-[#38bdf8] to-[#c084fc] rounded-full shadow-[0_0_14px_rgba(56,189,248,0.8)]"
                              initial={reduceMotion ? { width: '100%' } : { width: '15%' }}
                              animate={{ width: '100%' }}
                              transition={{ duration: reduceMotion ? 0.01 : 0.9, ease: EASE_OUT_SOFT, delay: reduceMotion ? 0 : 0.1 }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* EVIDENCIA 4: CONTEXTO */}
                    {beatKey === 'e4' && (
                      <motion.div
                        key="beat-e4"
                        className="flex flex-col"
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <span className="text-emerald-400 font-mono text-xs font-bold tracking-[0.2em] uppercase mb-4 block">
                          CONTEXTO OPERATIVO
                        </span>

                        <div className="flex flex-col mb-4">
                          <span className="text-5xl sm:text-6xl md:text-7xl font-bold font-mono text-white tracking-tight leading-none mb-2 drop-shadow-[0_0_30px_rgba(52,211,153,0.4)]">
                            {contextSignal.value}
                          </span>
                          <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent leading-tight">
                            en cadena de valor
                          </span>
                        </div>

                        {/* Emerald Accent Line */}
                        <div className="w-10 h-[2px] bg-emerald-400 rounded-full mb-5 shadow-[0_0_8px_#34d399]" />

                        <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed mb-6">
                          {contextSignal.description}
                        </p>

                        {/* Metric Indicator Widget */}
                        <div className="p-4 rounded-xl bg-[#03140e]/90 border border-emerald-500/20 backdrop-blur-md">
                          <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2">
                            <span>CONFIANZA ESTADÍSTICA</span>
                            <span className="text-emerald-300 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                              92% CERTEZA
                            </span>
                            <span>VALIDADO</span>
                          </div>
                          <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 rounded-full shadow-[0_0_12px_rgba(52,211,153,0.7)]"
                              initial={reduceMotion ? { width: '92%' } : { width: '20%' }}
                              animate={{ width: '92%' }}
                              transition={{ duration: reduceMotion ? 0.01 : 0.85, ease: EASE_OUT_SOFT }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* CONVERGENCIA */}
                    {beatKey === 'convergence' && (
                      <motion.div
                        key="beat-convergence"
                        className="flex flex-col"
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <span className="text-cyan-400 font-mono text-xs font-bold uppercase tracking-[0.2em] block mb-3">
                          04 / 04 EVIDENCIAS CONFIRMADAS
                        </span>
                        <h3 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight mb-2">
                          Por separado son señales.
                        </h3>
                        <h3 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight mb-4">
                          Juntas cambian la{' '}
                          <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent font-bold">
                            prioridad.
                          </span>
                        </h3>
                        <p className="text-base text-slate-300 font-light leading-relaxed mb-5">
                          La coincidencia simultánea de las cuatro dimensiones consolida el retraso como un patrón estructural crítico.
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300 pt-3 border-t border-white/10">
                          <div className="flex items-center gap-1.5 text-cyan-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span>Impacto directo</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-purple-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span>Deterioro continuo</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-blue-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span>Persistencia sostenida</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Contexto clave</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* RIGHT COLUMN: HOLOGRAPHIC FOCUS REACTOR CORE WITH ORBITAL PARTICLES AND CURVED CONDUITS */}
              <motion.div
                className="lg:col-span-7 relative flex items-center justify-center w-full min-h-[460px] sm:min-h-[500px] aspect-[4/3] max-w-[620px] mx-auto"
                initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: reduceMotion ? 0.01 : 0.55, ease: EASE_OUT_EXPO, delay: reduceMotion ? 0 : 0.05 }}
              >
                {/* SVG NETWORK CANVAS WITH CURVED CONDUITS & GLOWING NODES */}
                <svg viewBox="0 0 600 520" className="w-full h-full block overflow-visible pointer-events-none" aria-hidden="true">
                  <defs>
                    <filter id="focus-glow" x="-40%" y="-40%" width="180%" height="180%">
                      <feGaussianBlur stdDeviation="5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>

                    <linearGradient id="bus-cyan-curve" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="1" />
                      <stop offset="100%" stopColor="#0284c7" stopOpacity="0.8" />
                    </linearGradient>

                    <linearGradient id="bus-purple-curve" x1="100%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#c084fc" stopOpacity="1" />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.8" />
                    </linearGradient>

                    <linearGradient id="bus-blue-curve" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="1" />
                      <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.8" />
                    </linearGradient>

                    <linearGradient id="bus-teal-curve" x1="100%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#2dd4bf" stopOpacity="1" />
                      <stop offset="100%" stopColor="#059669" stopOpacity="0.8" />
                    </linearGradient>

                    {/* Gradient for the central "F" halo ring */}
                    <linearGradient id="f-halo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00f2fe" />
                      <stop offset="50%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#c084fc" />
                    </linearGradient>

                    {/* Gradient for the Focus "F" mark */}
                    <linearGradient id="focus-f-fill" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="40%" stopColor="#e0f2fe" />
                      <stop offset="75%" stopColor="#7dd3fc" />
                      <stop offset="100%" stopColor="#c084fc" />
                    </linearGradient>
                  </defs>

                  {/* Concentric Guide Rings */}
                  <circle cx="300" cy="260" r="220" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" strokeDasharray="3 9" />
                  <g className="anim-gyro-cw">
                    <circle cx="300" cy="260" r="175" fill="none" stroke="rgba(56, 189, 248, 0.12)" strokeWidth="1.2" strokeDasharray="6 20 2 20" />
                  </g>
                  <g className="anim-gyro-ccw">
                    <circle cx="300" cy="260" r="130" fill="none" stroke="rgba(192, 132, 252, 0.14)" strokeWidth="1.2" strokeDasharray="10 14" />
                  </g>

                  {/* 1. CURVED CONDUIT: TOP-LEFT (IMPACTO -> CYAN) */}
                  <g opacity={t1Active ? 1 : 0.28} style={{ transition: 'opacity 0.45s ease' }}>
                    {/* Background soft glow tube */}
                    <path
                      d="M 215,115 C 275,115 225,200 258,225"
                      fill="none"
                      stroke="url(#bus-cyan-curve)"
                      strokeWidth="2.5"
                      filter="url(#focus-glow)"
                    />
                    <path
                      d="M 215,115 C 275,115 225,200 258,225"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="1"
                      strokeDasharray="4 6"
                      opacity="0.65"
                    />
                    {t1Active && (
                      <path
                        d="M 215,115 C 275,115 225,200 258,225"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="anim-conduit-pulse"
                        filter="url(#focus-glow)"
                      />
                    )}
                    {/* Glowing Node Endpoints */}
                    <circle cx="215" cy="115" r="4.5" fill="#38bdf8" filter="url(#focus-glow)" />
                    <circle cx="215" cy="115" r="2.5" fill="#ffffff" />
                    <circle cx="258" cy="225" r="4.5" fill="#38bdf8" filter="url(#focus-glow)" />
                    <circle cx="258" cy="225" r="2.5" fill="#ffffff" />
                  </g>

                  {/* 2. CURVED CONDUIT: TOP-RIGHT (DETERIORO -> PURPLE) */}
                  <g opacity={t2Active ? 1 : 0.28} style={{ transition: 'opacity 0.45s ease' }}>
                    <path
                      d="M 385,115 C 325,115 375,200 342,225"
                      fill="none"
                      stroke="url(#bus-purple-curve)"
                      strokeWidth="2.5"
                      filter="url(#focus-glow)"
                    />
                    <path
                      d="M 385,115 C 325,115 375,200 342,225"
                      fill="none"
                      stroke="#c084fc"
                      strokeWidth="1"
                      strokeDasharray="4 6"
                      opacity="0.65"
                    />
                    {t2Active && (
                      <path
                        d="M 385,115 C 325,115 375,200 342,225"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="anim-conduit-pulse"
                        filter="url(#focus-glow)"
                      />
                    )}
                    <circle cx="385" cy="115" r="4.5" fill="#c084fc" filter="url(#focus-glow)" />
                    <circle cx="385" cy="115" r="2.5" fill="#ffffff" />
                    <circle cx="342" cy="225" r="4.5" fill="#c084fc" filter="url(#focus-glow)" />
                    <circle cx="342" cy="225" r="2.5" fill="#ffffff" />
                  </g>

                  {/* 3. CURVED CONDUIT: BOTTOM-LEFT (PERSISTENCIA -> CYAN/BLUE) */}
                  <g opacity={t3Active ? 1 : 0.28} style={{ transition: 'opacity 0.45s ease' }}>
                    <path
                      d="M 215,405 C 275,405 225,320 258,295"
                      fill="none"
                      stroke="url(#bus-blue-curve)"
                      strokeWidth="2.5"
                      filter="url(#focus-glow)"
                    />
                    <path
                      d="M 215,405 C 275,405 225,320 258,295"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="1"
                      strokeDasharray="4 6"
                      opacity="0.65"
                    />
                    {t3Active && (
                      <path
                        d="M 215,405 C 275,405 225,320 258,295"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="anim-conduit-pulse"
                        filter="url(#focus-glow)"
                      />
                    )}
                    <circle cx="215" cy="405" r="4.5" fill="#38bdf8" filter="url(#focus-glow)" />
                    <circle cx="215" cy="405" r="2.5" fill="#ffffff" />
                    <circle cx="258" cy="295" r="4.5" fill="#38bdf8" filter="url(#focus-glow)" />
                    <circle cx="258" cy="295" r="2.5" fill="#ffffff" />
                  </g>

                  {/* 4. CURVED CONDUIT: BOTTOM-RIGHT (CONTEXTO -> TEAL/EMERALD) */}
                  <g opacity={t4Active ? 1 : 0.28} style={{ transition: 'opacity 0.45s ease' }}>
                    <path
                      d="M 385,405 C 325,405 375,320 342,295"
                      fill="none"
                      stroke="url(#bus-teal-curve)"
                      strokeWidth="2.5"
                      filter="url(#focus-glow)"
                    />
                    <path
                      d="M 385,405 C 325,405 375,320 342,295"
                      fill="none"
                      stroke="#2dd4bf"
                      strokeWidth="1"
                      strokeDasharray="4 6"
                      opacity="0.65"
                    />
                    {t4Active && (
                      <path
                        d="M 385,405 C 325,405 375,320 342,295"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="anim-conduit-pulse"
                        filter="url(#focus-glow)"
                      />
                    )}
                    <circle cx="385" cy="405" r="4.5" fill="#2dd4bf" filter="url(#focus-glow)" />
                    <circle cx="385" cy="405" r="2.5" fill="#ffffff" />
                    <circle cx="342" cy="295" r="4.5" fill="#2dd4bf" filter="url(#focus-glow)" />
                    <circle cx="342" cy="295" r="2.5" fill="#ffffff" />
                  </g>

                  {/* CENTRAL "F" REACTOR CORE */}
                  <g className="origin-center">
                    {/* Outer radiant ambient aura */}
                    <circle cx="300" cy="260" r={84} fill="rgba(56, 189, 248, 0.08)" filter="url(#focus-glow)" />
                    <circle cx="300" cy="260" r={72} fill="none" stroke="rgba(192, 132, 252, 0.4)" strokeWidth="1.5" strokeDasharray="5 12" />
                    
                    {/* Glowing Halo Ring */}
                    <circle
                      cx="300"
                      cy="260"
                      r={60}
                      fill="rgba(3, 9, 22, 0.96)"
                      stroke="url(#f-halo-gradient)"
                      strokeWidth="3.5"
                      filter="url(#focus-glow)"
                    />
                    <circle cx="300" cy="260" r={50} fill="none" stroke="rgba(255, 255, 255, 0.18)" strokeWidth="1" strokeDasharray="3 3" />
                    <circle cx="300" cy="260" r={42} fill="#051026" />
                  </g>
                </svg>

                {/* LIVING PARTICLE FIELD EMBEDDED AROUND THE F */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] pointer-events-none z-10 flex items-center justify-center">
                  <CoreParticleField activeStep={step} reduceMotion={reduceMotion} />
                </div>

                {/* THE SPECIAL FOCUS GEOMETRIC "F" MARK */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none flex items-center justify-center">
                  <motion.div
                    className="relative flex items-center justify-center"
                    animate={
                      reduceMotion
                        ? { scale: 1 }
                        : {
                            scale: [1, 1.04, 1],
                          }
                    }
                    transition={{
                      duration: 4.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <svg className="w-10 h-10 sm:w-11 sm:h-11 drop-shadow-[0_0_12px_rgba(56,189,248,0.9)] drop-shadow-[0_0_24px_rgba(192,132,252,0.6)]" viewBox="0 0 64 64" fill="none">
                      <defs>
                        <linearGradient id="f-letter-gradient" x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#ffffff" />
                          <stop offset="35%" stopColor="#e0f2fe" />
                          <stop offset="70%" stopColor="#7dd3fc" />
                          <stop offset="100%" stopColor="#c084fc" />
                        </linearGradient>
                      </defs>
                      <path
                        fill="url(#f-letter-gradient)"
                        d="M16 12h34v9H26v8h20v9H26v14H16V12z"
                      />
                    </svg>
                  </motion.div>
                </div>

                {/* THE 4 DIMENSION GLASS NODES */}

                {/* 1. NODE: IMPACTO (TOP-LEFT) */}
                <button
                  type="button"
                  onClick={() => setStep('e1')}
                  className={`absolute top-[4%] left-0 sm:left-[2%] z-20 w-[190px] p-3.5 rounded-2xl border text-left cursor-pointer transition-all duration-500 backdrop-blur-xl ${
                    e1Active
                      ? 'bg-[#081730]/95 border-cyan-400 shadow-[0_0_35px_rgba(56,189,248,0.5)] scale-105 opacity-100 ring-1 ring-cyan-400/60'
                      : t1Active
                      ? 'bg-[#061226]/85 border-cyan-500/40 opacity-80 hover:opacity-100 hover:scale-[1.02]'
                      : 'bg-[#050d1a]/50 border-white/5 opacity-35 hover:opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                          e1Active ? 'bg-cyan-400 text-black shadow-[0_0_10px_#38bdf8]' : 'bg-cyan-500/20 text-cyan-300'
                        }`}
                      >
                        <Activity className="w-3.5 h-3.5" />
                      </div>
                      <strong className="text-white text-xs font-bold uppercase tracking-wider font-mono">Impacto</strong>
                    </div>
                    {t1Active && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#38bdf8] animate-pulse" />}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug mb-2 font-normal">Afecta directamente los resultados clave.</p>
                  <div className="flex items-center justify-between pt-1.5 border-t border-white/10 text-[10px] font-mono">
                    <span className="text-slate-400">Nivel:</span>
                    <span className="text-cyan-300 font-bold">Alto</span>
                  </div>
                </button>

                {/* 2. NODE: DETERIORO (TOP-RIGHT) */}
                <button
                  type="button"
                  onClick={() => setStep('e2')}
                  className={`absolute top-[4%] right-0 sm:right-[2%] z-20 w-[190px] p-3.5 rounded-2xl border text-left cursor-pointer transition-all duration-500 backdrop-blur-xl ${
                    e2Active
                      ? 'bg-[#1a0c30]/95 border-purple-400 shadow-[0_0_35px_rgba(192,132,252,0.5)] scale-105 opacity-100 ring-1 ring-purple-400/60'
                      : t2Active
                      ? 'bg-[#120822]/85 border-purple-500/40 opacity-80 hover:opacity-100 hover:scale-[1.02]'
                      : 'bg-[#0a0514]/50 border-white/5 opacity-35 hover:opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                          e2Active ? 'bg-purple-400 text-black shadow-[0_0_10px_#c084fc]' : 'bg-purple-500/20 text-purple-300'
                        }`}
                      >
                        <TrendingDown className="w-3.5 h-3.5" />
                      </div>
                      <strong className="text-white text-xs font-bold uppercase tracking-wider font-mono">Deterioro</strong>
                    </div>
                    {t2Active && <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_#c084fc] animate-pulse" />}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug mb-2 font-normal">La tendencia muestra empeoramiento continuo.</p>
                  <div className="flex items-center justify-between pt-1.5 border-t border-white/10 text-[10px] font-mono">
                    <span className="text-slate-400">Velocidad:</span>
                    <span className="text-purple-300 font-bold">+24%</span>
                  </div>
                </button>

                {/* 3. NODE: PERSISTENCIA (BOTTOM-LEFT) */}
                <button
                  type="button"
                  onClick={() => setStep('e3')}
                  className={`absolute bottom-[4%] left-0 sm:left-[2%] z-20 w-[190px] p-3.5 rounded-2xl border text-left cursor-pointer transition-all duration-500 backdrop-blur-xl ${
                    e3Active
                      ? 'bg-[#081836]/95 border-blue-400 shadow-[0_0_35px_rgba(96,165,250,0.5)] scale-105 opacity-100 ring-1 ring-blue-400/60'
                      : t3Active
                      ? 'bg-[#061228]/85 border-blue-500/40 opacity-80 hover:opacity-100 hover:scale-[1.02]'
                      : 'bg-[#040c1c]/50 border-white/5 opacity-35 hover:opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                          e3Active ? 'bg-blue-400 text-black shadow-[0_0_10px_#60a5fa]' : 'bg-blue-500/20 text-blue-300'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                      <strong className="text-white text-xs font-bold uppercase tracking-wider font-mono">Persistencia</strong>
                    </div>
                    {t3Active && <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_#60a5fa] animate-pulse" />}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug mb-2 font-normal">Se mantiene estable en el tiempo.</p>
                  <div className="flex items-center justify-between pt-1.5 border-t border-white/10 text-[10px] font-mono">
                    <span className="text-slate-400">Duración:</span>
                    <span className="text-blue-300 font-bold">6 días</span>
                  </div>
                </button>

                {/* 4. NODE: CONTEXTO (BOTTOM-RIGHT) */}
                <button
                  type="button"
                  onClick={() => setStep('e4')}
                  className={`absolute bottom-[4%] right-0 sm:right-[2%] z-20 w-[190px] p-3.5 rounded-2xl border text-left cursor-pointer transition-all duration-500 backdrop-blur-xl ${
                    e4Active
                      ? 'bg-[#06241c]/95 border-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.5)] scale-105 opacity-100 ring-1 ring-emerald-400/60'
                      : t4Active
                      ? 'bg-[#041a14]/85 border-emerald-500/40 opacity-80 hover:opacity-100 hover:scale-[1.02]'
                      : 'bg-[#030f0c]/50 border-white/5 opacity-35 hover:opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                          e4Active ? 'bg-emerald-400 text-black shadow-[0_0_10px_#34d399]' : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        <Target className="w-3.5 h-3.5" />
                      </div>
                      <strong className="text-white text-xs font-bold uppercase tracking-wider font-mono">Contexto</strong>
                    </div>
                    {t4Active && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" />}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug mb-2 font-normal">Condiciones externas refuerzan el patrón.</p>
                  <div className="flex items-center justify-between pt-1.5 border-t border-white/10 text-[10px] font-mono">
                    <span className="text-slate-400">Confianza:</span>
                    <span className="text-emerald-300 font-bold">92%</span>
                  </div>
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BOTTOM SYNTHESIS BANNER (WITHOUT HISTORY BUTTON, WITH COLORFUL HIGHLIGHT TEXT) */}
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
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#061020]/90 border border-cyan-500/30 backdrop-blur-xl flex items-center gap-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-normal m-0 font-normal">
                  Las cuatro dimensiones convergen en un mismo punto:{' '}
                  <span className="font-semibold bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 bg-clip-text text-transparent">
                    el retraso no es un evento aislado, es un patrón estructural.
                  </span>
                </p>
              </div>
            </motion.footer>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
