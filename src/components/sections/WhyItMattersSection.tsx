import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import {
  Sparkles,
  Activity,
  TrendingDown,
  Clock,
  Target,
  CheckCircle2,
} from 'lucide-react';
import { FocusSignal } from '../../types/focus';
import {
  getPerfConfig,
  startManagedLoop,
  useBriefingSectionMetrics,
  usePerfConfig,
  type WhyStep,
} from '../../perf';
import { useIntroScrollRoot } from './ArrivalSection';

interface WhyItMattersSectionProps {
  signals: FocusSignal[];
}

/**
 * Animated Canvas Particle Orbit surrounding the central "F" Core
 */
const CoreParticleField: React.FC<{ reduceMotion: boolean }> = ({ reduceMotion }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const perf = getPerfConfig();
    const width = (canvas.width = 360);
    const height = (canvas.height = 360);
    const cx = width / 2;
    const cy = height / 2;
    const count = Math.max(8, Math.round(18 * perf.particleScale));

    const particles = Array.from({ length: count }).map((_, i) => ({
      orbitRadiusX: 54 + (i % 5) * 20,
      orbitRadiusY: 42 + (i % 5) * 15,
      tilt: ((i * 37) % 360) * (Math.PI / 180),
      angle: (i / count) * Math.PI * 2,
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
    const render = (_time: number, delta: number) => {
      ctx.clearRect(0, 0, width, height);
      t += 0.02 * (delta / 16.667);

      particles.forEach((p) => {
        p.angle += p.speed * (delta / 16.667);
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
    };

    return startManagedLoop({ element: canvas, onFrame: render });
  }, [reduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      width={360}
      height={360}
    />
  );
};

export const WhyItMattersSection: React.FC<WhyItMattersSectionProps> = ({ signals }) => {
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
    'why',
    scrollRootRef?.current ?? null,
    useCallback(
      (metrics) => {
        rawProgress.set(metrics.progress);
      },
      [rawProgress],
    ),
  );

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

  // ACT 1: Apertura Editorial (0.00 - 0.22)
  const introOpacity = useTransform(storyProgress, [0, 0.16, 0.22], [1, 1, 0]);
  const introY = useTransform(storyProgress, [0, 0.16, 0.22], [0, 0, -18]);
  const introScale = useTransform(storyProgress, [0, 0.16, 0.22], [1, 1, 0.96]);

  // ACT 2: Stage Container (0.20 - 1.00)
  const stageOpacity = useTransform(storyProgress, [0.18, 0.23, 1], [0, 1, 1]);
  const stageY = useTransform(storyProgress, [0.18, 0.23], [24, 0]);
  const stageScale = useTransform(storyProgress, [0.18, 0.23, 1], [0.97, 1, 1]);

  // Left Detail Card Crossfades (0 blur, pure opacity and offset)
  const e1Opacity = useTransform(storyProgress, [0.18, 0.23, 0.33, 0.37], [0, 1, 1, 0]);
  const e1Y = useTransform(storyProgress, [0.18, 0.23, 0.37], [16, 0, -12]);

  const e2Opacity = useTransform(storyProgress, [0.33, 0.37, 0.47, 0.51], [0, 1, 1, 0]);
  const e2Y = useTransform(storyProgress, [0.33, 0.37, 0.51], [16, 0, -12]);

  const e3Opacity = useTransform(storyProgress, [0.47, 0.51, 0.61, 0.65], [0, 1, 1, 0]);
  const e3Y = useTransform(storyProgress, [0.47, 0.51, 0.65], [16, 0, -12]);

  const e4Opacity = useTransform(storyProgress, [0.61, 0.65, 0.75, 0.79], [0, 1, 1, 0]);
  const e4Y = useTransform(storyProgress, [0.61, 0.65, 0.79], [16, 0, -12]);

  const convOpacity = useTransform(storyProgress, [0.75, 0.79, 1], [0, 1, 1]);
  const convY = useTransform(storyProgress, [0.75, 0.79], [16, 0]);

  // Conduit opacities for the SVG network
  const t1Opacity = useTransform(storyProgress, [0.18, 0.24], [0.25, 1]);
  const t2Opacity = useTransform(storyProgress, [0.33, 0.38], [0.25, 1]);
  const t3Opacity = useTransform(storyProgress, [0.47, 0.52], [0.25, 1]);
  const t4Opacity = useTransform(storyProgress, [0.61, 0.66], [0.25, 1]);

  // Bottom synthesis banner
  const footerOpacity = useTransform(storyProgress, [0.75, 0.81, 1], [0, 1, 1]);
  const footerY = useTransform(storyProgress, [0.75, 0.81], [16, 0]);

  // Node Active states (for interactive navigation)
  const node1Active = useTransform(storyProgress, (p: number) => p >= 0.18 && p < 0.35);
  const node2Active = useTransform(storyProgress, (p: number) => p >= 0.35 && p < 0.49);
  const node3Active = useTransform(storyProgress, (p: number) => p >= 0.49 && p < 0.63);
  const node4Active = useTransform(storyProgress, (p: number) => p >= 0.63 && p < 0.77);
  const convActive = useTransform(storyProgress, (p: number) => p >= 0.77);

  // Dynamic header state bindings
  const [headerState, setHeaderState] = useState({
    stepLabel: 'POR QUÉ',
    stepChapter: '02 / 07',
    evidences: '0 / 4',
  });

  useEffect(() => {
    return storyProgress.on('change', (p) => {
      let stepLabel = 'POR QUÉ';
      let evidences = '0 / 4';

      if (p >= 0.77) {
        stepLabel = 'CONVERGENCIA';
        evidences = '4 / 4';
      } else if (p >= 0.63) {
        stepLabel = 'CONTEXTO';
        evidences = '4 / 4';
      } else if (p >= 0.49) {
        stepLabel = 'PERSISTENCIA';
        evidences = '3 / 4';
      } else if (p >= 0.35) {
        stepLabel = 'DETERIORO';
        evidences = '2 / 4';
      } else if (p >= 0.18) {
        stepLabel = 'IMPACTO';
        evidences = '1 / 4';
      }

      setHeaderState({ stepLabel, stepChapter: '02 / 07', evidences });
    });
  }, [storyProgress]);

  // Node navigation click handler
  const navigateToStep = useCallback(
    (targetProgress: number) => {
      const container = containerRef.current;
      const root = scrollRootRef?.current ?? (document.getElementById('iv-intro-scroll') as HTMLElement | null);
      if (!container || !root) return;

      const scrollable = Math.max(1, container.offsetHeight - root.clientHeight);
      const targetTop = container.offsetTop + scrollable * targetProgress;
      root.scrollTo({
        top: Math.max(0, targetTop),
        behavior: reduceMotion ? 'auto' : 'smooth',
      });
    },
    [reduceMotion, scrollRootRef],
  );

  return (
    <section
      ref={containerRef}
      id="section-chapter-why"
      className="relative h-[620vh] min-h-[620vh] w-full bg-transparent select-none contain-paint"
      data-chapter="why"
      aria-label="02 / 07 · Por Qué: cuatro evidencias hacia una conclusión"
    >
      <div className="sticky top-0 left-0 w-full h-[100svh] overflow-hidden flex flex-col p-4 sm:p-7 lg:px-9 lg:pt-8 lg:pb-6 z-10">
        {/* Ambient Atmosphere */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute inset-0 opacity-[0.035] bg-[radial-gradient(#65d9ff_1px,transparent_1px)] [background-size:36px_36px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[140px] pointer-events-none bg-gradient-to-tr from-cyan-500/15 via-purple-500/12 to-emerald-400/10 opacity-70" />
        </div>

        {/* Top Header Navigation Bar */}
        <header className="relative z-30 flex items-center justify-between w-full max-w-7xl mx-auto">
          <div className="p-[1px] rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
            <div className="relative z-10 inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#040914]/95 backdrop-blur-xl border border-white/10">
              <span className="text-cyan-400 font-mono text-xs font-bold tracking-widest">
                {headerState.stepChapter}
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8] animate-pulse" />
              <strong className="text-white text-xs tracking-widest uppercase font-mono font-semibold">
                {headerState.stepLabel}
              </strong>
            </div>
          </div>

          <div className="p-[1px] rounded-full shadow-[0_4px_24px_rgba(56,189,248,0.25)]">
            <div className="relative z-10 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#050e1f]/95 backdrop-blur-xl border border-cyan-500/40 shadow-[0_0_15px_rgba(56,189,248,0.25)]">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="text-slate-300 font-mono text-xs uppercase tracking-wider font-medium">EVIDENCIAS:</span>
              <span className="text-cyan-300 font-mono text-xs font-bold">{headerState.evidences}</span>
            </div>
          </div>
        </header>

        {/* Core Stage Container */}
        <div className="relative flex-1 w-full min-h-0 z-20 flex items-center justify-center">
          {/* ACT 1: Apertura Editorial (0.00 - 0.22) */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none"
            style={{
              opacity: reduceMotion ? 1 : introOpacity,
              y: reduceMotion ? 0 : introY,
              scale: reduceMotion ? 1 : introScale,
              display: useTransform(storyProgress, (p: number) => (p <= 0.24 ? 'flex' : 'none')),
            }}
          >
            <div className="mb-6 relative z-10">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#0c1424]/85 border border-cyan-500/30 backdrop-blur-xl shadow-[0_0_25px_rgba(56,189,248,0.15)]">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-sm md:text-base text-cyan-200 font-normal tracking-wide">
                  Ya sabes qué mirar.
                </span>
              </div>
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
              <h2 className="text-5xl sm:text-7xl md:text-[5rem] font-bold tracking-tight text-white mb-6 leading-[1.04] bg-gradient-to-b from-white via-slate-100 to-blue-200 bg-clip-text text-transparent">
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
            </div>
          </motion.div>

          {/* ACT 2: Escenario y Evidencias (0.20 - 1.00) */}
          <motion.div
            className="w-full max-w-7xl mx-auto px-0 sm:px-2 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
            style={{
              opacity: reduceMotion ? 1 : stageOpacity,
              y: reduceMotion ? 0 : stageY,
              scale: reduceMotion ? 1 : stageScale,
              display: useTransform(storyProgress, (p: number) => (p >= 0.16 ? 'grid' : 'none')),
              pointerEvents: useTransform(storyProgress, (p: number) => (p >= 0.18 ? 'auto' : 'none')),
            }}
          >
            {/* Left Column: Detail Card */}
            <div className="lg:col-span-5 relative flex flex-col justify-center min-h-[360px] sm:min-h-[400px]">
              <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-b from-[#071328]/90 via-[#040c1a]/92 to-[#02060e]/95 border border-white/10 backdrop-blur-2xl p-8 sm:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.7)]">
                <div className="relative min-h-[380px] sm:min-h-[400px]">
                  {/* Evidencia 1: Impacto */}
                  <motion.div
                    className="absolute inset-0 flex flex-col justify-center"
                    style={{
                      opacity: reduceMotion ? 1 : e1Opacity,
                      y: reduceMotion ? 0 : e1Y,
                      display: useTransform(storyProgress, (p: number) =>
                        p >= 0.16 && p <= 0.38 ? 'flex' : 'none',
                      ),
                    }}
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
                    <div className="w-10 h-[2px] bg-cyan-400 rounded-full mb-5 shadow-[0_0_8px_#38bdf8]" />
                    <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed mb-6">
                      {impactSignal.description}
                    </p>
                    <div className="p-4 rounded-xl bg-[#030914]/90 border border-cyan-500/20 backdrop-blur-md">
                      <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2">
                        <span>OPERACIÓN BASE</span>
                        <span className="text-cyan-300 font-bold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
                          ALTO IMPACTO
                        </span>
                        <span>RIESGO MÁXIMO</span>
                      </div>
                      <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-[85%] bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 rounded-full shadow-[0_0_12px_rgba(56,189,248,0.7)]" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Evidencia 2: Deterioro */}
                  <motion.div
                    className="absolute inset-0 flex flex-col justify-center"
                    style={{
                      opacity: reduceMotion ? 1 : e2Opacity,
                      y: reduceMotion ? 0 : e2Y,
                      display: useTransform(storyProgress, (p: number) =>
                        p >= 0.32 && p <= 0.52 ? 'flex' : 'none',
                      ),
                    }}
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
                    <div className="w-10 h-[2px] bg-purple-400 rounded-full mb-5 shadow-[0_0_8px_#c084fc]" />
                    <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed mb-6">
                      {deteriorationSignal.description}
                    </p>
                    <div className="p-4 rounded-xl bg-[#080414]/90 border border-purple-500/20 backdrop-blur-md">
                      <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2">
                        <span>VELOCIDAD NORMAL</span>
                        <span className="text-purple-300 font-bold px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30">
                          +24% ACELERACIÓN
                        </span>
                        <span>CRÍTICO</span>
                      </div>
                      <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-[78%] bg-gradient-to-r from-purple-400 via-fuchsia-500 to-rose-500 rounded-full shadow-[0_0_12px_rgba(192,132,252,0.7)]" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Evidencia 3: Persistencia */}
                  <motion.div
                    className="absolute inset-0 flex flex-col justify-center"
                    style={{
                      opacity: reduceMotion ? 1 : e3Opacity,
                      y: reduceMotion ? 0 : e3Y,
                      display: useTransform(storyProgress, (p: number) =>
                        p >= 0.46 && p <= 0.66 ? 'flex' : 'none',
                      ),
                    }}
                  >
                    <span className="text-cyan-400 font-mono text-xs font-bold tracking-[0.2em] uppercase mb-4 block">
                      PERSISTENCIA TEMPORAL
                    </span>
                    <div className="flex flex-col mb-3">
                      <span className="text-5xl sm:text-6xl md:text-7xl font-bold font-sans text-white tracking-tight leading-none mb-2">
                        {persistenceSignal.value}
                      </span>
                      <span className="text-2xl sm:text-3xl md:text-[2rem] font-bold bg-gradient-to-r from-[#00f2fe] via-[#38bdf8] to-[#c084fc] bg-clip-text text-transparent leading-tight">
                        de retraso sostenido
                      </span>
                    </div>
                    <div className="w-10 h-[2px] bg-cyan-400 rounded-full mb-5 shadow-[0_0_8px_#38bdf8]" />
                    <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed mb-6">
                      {persistenceSignal.description}
                    </p>
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#040b17]/90 border border-white/10 backdrop-blur-md">
                      <div className="flex justify-between items-center text-[10px] sm:text-xs font-mono uppercase tracking-widest text-slate-400 mb-2.5">
                        <span className="font-semibold">DÍA 1</span>
                        <span className="text-cyan-300 font-bold px-2.5 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-400/30 text-[10px] tracking-wider">
                          CONTINÚA
                        </span>
                        <span className="font-semibold">DÍA 6</span>
                      </div>
                      <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-[100%] bg-gradient-to-r from-[#00f2fe] via-[#38bdf8] to-[#c084fc] rounded-full shadow-[0_0_14px_rgba(56,189,248,0.8)]" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Evidencia 4: Contexto */}
                  <motion.div
                    className="absolute inset-0 flex flex-col justify-center"
                    style={{
                      opacity: reduceMotion ? 1 : e4Opacity,
                      y: reduceMotion ? 0 : e4Y,
                      display: useTransform(storyProgress, (p: number) =>
                        p >= 0.60 && p <= 0.80 ? 'flex' : 'none',
                      ),
                    }}
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
                    <div className="w-10 h-[2px] bg-emerald-400 rounded-full mb-5 shadow-[0_0_8px_#34d399]" />
                    <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed mb-6">
                      {contextSignal.description}
                    </p>
                    <div className="p-4 rounded-xl bg-[#03140e]/90 border border-emerald-500/20 backdrop-blur-md">
                      <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2">
                        <span>CONFIANZA ESTADÍSTICA</span>
                        <span className="text-emerald-300 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                          92% CERTEZA
                        </span>
                        <span>VALIDADO</span>
                      </div>
                      <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-[92%] bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 rounded-full shadow-[0_0_12px_rgba(52,211,153,0.7)]" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Convergencia Final */}
                  <motion.div
                    className="absolute inset-0 flex flex-col justify-center"
                    style={{
                      opacity: reduceMotion ? 1 : convOpacity,
                      y: reduceMotion ? 0 : convY,
                      display: useTransform(storyProgress, (p: number) => (p >= 0.74 ? 'flex' : 'none')),
                    }}
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
                </div>
              </div>
            </div>

            {/* Right Column: Holographic Reactor Core */}
            <div className="lg:col-span-7 relative flex items-center justify-center w-full min-h-[380px] sm:min-h-[420px] lg:min-h-[460px] aspect-[4/3] max-w-[620px] mx-auto pb-2">
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

                  <linearGradient id="f-halo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00f2fe" />
                    <stop offset="50%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#c084fc" />
                  </linearGradient>
                </defs>

                <circle cx="300" cy="260" r="220" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" strokeDasharray="3 9" />
                <circle cx="300" cy="260" r="175" fill="none" stroke="rgba(56, 189, 248, 0.12)" strokeWidth="1.2" strokeDasharray="6 20 2 20" />
                <circle cx="300" cy="260" r="130" fill="none" stroke="rgba(192, 132, 252, 0.14)" strokeWidth="1.2" strokeDasharray="10 14" />

                {/* 1. Conduit Impacto */}
                <motion.g style={{ opacity: reduceMotion ? 1 : t1Opacity }}>
                  <path d="M 215,115 C 275,115 225,200 258,225" fill="none" stroke="url(#bus-cyan-curve)" strokeWidth="2.5" filter="url(#focus-glow)" />
                  <path d="M 215,115 C 275,115 225,200 258,225" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 6" opacity="0.65" />
                  <circle cx="215" cy="115" r="4.5" fill="#38bdf8" filter="url(#focus-glow)" />
                  <circle cx="215" cy="115" r="2.5" fill="#ffffff" />
                  <circle cx="258" cy="225" r="4.5" fill="#38bdf8" filter="url(#focus-glow)" />
                  <circle cx="258" cy="225" r="2.5" fill="#ffffff" />
                </motion.g>

                {/* 2. Conduit Deterioro */}
                <motion.g style={{ opacity: reduceMotion ? 1 : t2Opacity }}>
                  <path d="M 385,115 C 325,115 375,200 342,225" fill="none" stroke="url(#bus-purple-curve)" strokeWidth="2.5" filter="url(#focus-glow)" />
                  <path d="M 385,115 C 325,115 375,200 342,225" fill="none" stroke="#c084fc" strokeWidth="1" strokeDasharray="4 6" opacity="0.65" />
                  <circle cx="385" cy="115" r="4.5" fill="#c084fc" filter="url(#focus-glow)" />
                  <circle cx="385" cy="115" r="2.5" fill="#ffffff" />
                  <circle cx="342" cy="225" r="4.5" fill="#c084fc" filter="url(#focus-glow)" />
                  <circle cx="342" cy="225" r="2.5" fill="#ffffff" />
                </motion.g>

                {/* 3. Conduit Persistencia */}
                <motion.g style={{ opacity: reduceMotion ? 1 : t3Opacity }}>
                  <path d="M 215,405 C 275,405 225,320 258,295" fill="none" stroke="url(#bus-blue-curve)" strokeWidth="2.5" filter="url(#focus-glow)" />
                  <path d="M 215,405 C 275,405 225,320 258,295" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 6" opacity="0.65" />
                  <circle cx="215" cy="405" r="4.5" fill="#38bdf8" filter="url(#focus-glow)" />
                  <circle cx="215" cy="405" r="2.5" fill="#ffffff" />
                  <circle cx="258" cy="295" r="4.5" fill="#38bdf8" filter="url(#focus-glow)" />
                  <circle cx="258" cy="295" r="2.5" fill="#ffffff" />
                </motion.g>

                {/* 4. Conduit Contexto */}
                <motion.g style={{ opacity: reduceMotion ? 1 : t4Opacity }}>
                  <path d="M 385,405 C 325,405 375,320 342,295" fill="none" stroke="url(#bus-teal-curve)" strokeWidth="2.5" filter="url(#focus-glow)" />
                  <path d="M 385,405 C 325,405 375,320 342,295" fill="none" stroke="#2dd4bf" strokeWidth="1" strokeDasharray="4 6" opacity="0.65" />
                  <circle cx="385" cy="405" r="4.5" fill="#2dd4bf" filter="url(#focus-glow)" />
                  <circle cx="385" cy="405" r="2.5" fill="#ffffff" />
                  <circle cx="342" cy="295" r="4.5" fill="#2dd4bf" filter="url(#focus-glow)" />
                  <circle cx="342" cy="295" r="2.5" fill="#ffffff" />
                </motion.g>

                {/* Central "F" Core */}
                <g className="origin-center">
                  <circle cx="300" cy="260" r={84} fill="rgba(56, 189, 248, 0.08)" filter="url(#focus-glow)" />
                  <circle cx="300" cy="260" r={72} fill="none" stroke="rgba(192, 132, 252, 0.4)" strokeWidth="1.5" strokeDasharray="5 12" />
                  <circle cx="300" cy="260" r={60} fill="rgba(3, 9, 22, 0.96)" stroke="url(#f-halo-gradient)" strokeWidth="3.5" filter="url(#focus-glow)" />
                  <circle cx="300" cy="260" r={50} fill="none" stroke="rgba(255, 255, 255, 0.18)" strokeWidth="1" strokeDasharray="3 3" />
                  <circle cx="300" cy="260" r={42} fill="#051026" />
                </g>
              </svg>

              {/* Particle Field */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] pointer-events-none z-10 flex items-center justify-center">
                {useFullDetailMotion && <CoreParticleField reduceMotion={reduceMotion} />}
              </div>

              {/* Central "F" Icon */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none flex items-center justify-center">
                <svg className="w-10 h-10 sm:w-11 sm:h-11 drop-shadow-[0_0_12px_rgba(56,189,248,0.9)] drop-shadow-[0_0_24px_rgba(192,132,252,0.6)]" viewBox="0 0 64 64" fill="none">
                  <defs>
                    <linearGradient id="f-letter-gradient" x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="35%" stopColor="#e0f2fe" />
                      <stop offset="70%" stopColor="#7dd3fc" />
                      <stop offset="100%" stopColor="#c084fc" />
                    </linearGradient>
                  </defs>
                  <path fill="url(#f-letter-gradient)" d="M16 12h34v9H26v8h20v9H26v14H16V12z" />
                </svg>
              </div>

              {/* 4 Interactive Dimension Corner Nodes */}
              <NodeButton
                active={node1Active}
                onClick={() => navigateToStep(0.26)}
                title="Impacto"
                sub="Afecta directamente los resultados clave."
                metricLabel="Nivel:"
                metricValue="Alto"
                positionClass="top-[4%] left-0 sm:left-[2%]"
                colorTheme="cyan"
                Icon={Activity}
              />

              <NodeButton
                active={node2Active}
                onClick={() => navigateToStep(0.42)}
                title="Deterioro"
                sub="La tendencia muestra empeoramiento continuo."
                metricLabel="Velocidad:"
                metricValue="+24%"
                positionClass="top-[4%] right-0 sm:right-[2%]"
                colorTheme="purple"
                Icon={TrendingDown}
              />

              <NodeButton
                active={node3Active}
                onClick={() => navigateToStep(0.56)}
                title="Persistencia"
                sub="Se mantiene estable en el tiempo."
                metricLabel="Duración:"
                metricValue="6 días"
                positionClass="bottom-[10%] left-0 sm:left-[2%]"
                colorTheme="blue"
                Icon={Clock}
              />

              <NodeButton
                active={node4Active}
                onClick={() => navigateToStep(0.70)}
                title="Contexto"
                sub="Condiciones externas refuerzan el patrón."
                metricLabel="Confianza:"
                metricValue="92%"
                positionClass="bottom-[10%] right-0 sm:right-[2%]"
                colorTheme="emerald"
                Icon={Target}
              />
            </div>
          </motion.div>
        </div>

        {/* Bottom Synthesis Banner (0.75 - 1.00) — Absolutely positioned to eliminate any layout shift or jumps */}
        <motion.footer
          className="absolute bottom-4 sm:bottom-6 lg:bottom-7 left-0 right-0 z-30 px-4 sm:px-7 lg:px-9"
          style={{
            opacity: reduceMotion ? 1 : footerOpacity,
            y: reduceMotion ? 0 : footerY,
            pointerEvents: useTransform(storyProgress, (p: number) => (p >= 0.74 ? 'auto' : 'none')),
          }}
          aria-hidden={useTransform(storyProgress, (p: number) => p < 0.74)}
        >
          <div className="w-full max-w-7xl mx-auto p-3.5 sm:p-4 rounded-2xl bg-[#061020]/95 border border-cyan-500/30 backdrop-blur-xl flex items-center gap-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.7)]">
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
      </div>
    </section>
  );
};

interface NodeButtonProps {
  active: ReturnType<typeof useTransform<number, boolean>>;
  onClick: () => void;
  title: string;
  sub: string;
  metricLabel: string;
  metricValue: string;
  positionClass: string;
  colorTheme: 'cyan' | 'purple' | 'blue' | 'emerald';
  Icon: React.ComponentType<{ className?: string }>;
}

const NodeButton: React.FC<NodeButtonProps> = ({
  active,
  onClick,
  title,
  sub,
  metricLabel,
  metricValue,
  positionClass,
  colorTheme,
  Icon,
}) => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    return active.on('change', (v) => setIsActive(v));
  }, [active]);

  const themeClasses = {
    cyan: {
      active: 'bg-[#081730]/95 border-cyan-400 shadow-[0_0_35px_rgba(56,189,248,0.5)] scale-105 opacity-100 ring-1 ring-cyan-400/60',
      idle: 'bg-[#061226]/85 border-cyan-500/40 opacity-75 hover:opacity-100',
      iconActive: 'bg-cyan-400 text-black shadow-[0_0_10px_#38bdf8]',
      iconIdle: 'bg-cyan-500/20 text-cyan-300',
      badge: 'text-cyan-300 font-bold',
      pulse: 'bg-cyan-400 shadow-[0_0_6px_#38bdf8]',
    },
    purple: {
      active: 'bg-[#1a0c30]/95 border-purple-400 shadow-[0_0_35px_rgba(192,132,252,0.5)] scale-105 opacity-100 ring-1 ring-purple-400/60',
      idle: 'bg-[#120822]/85 border-purple-500/40 opacity-75 hover:opacity-100',
      iconActive: 'bg-purple-400 text-black shadow-[0_0_10px_#c084fc]',
      iconIdle: 'bg-purple-500/20 text-purple-300',
      badge: 'text-purple-300 font-bold',
      pulse: 'bg-purple-400 shadow-[0_0_6px_#c084fc]',
    },
    blue: {
      active: 'bg-[#081836]/95 border-blue-400 shadow-[0_0_35px_rgba(96,165,250,0.5)] scale-105 opacity-100 ring-1 ring-blue-400/60',
      idle: 'bg-[#061228]/85 border-blue-500/40 opacity-75 hover:opacity-100',
      iconActive: 'bg-blue-400 text-black shadow-[0_0_10px_#60a5fa]',
      iconIdle: 'bg-blue-500/20 text-blue-300',
      badge: 'text-blue-300 font-bold',
      pulse: 'bg-blue-400 shadow-[0_0_6px_#60a5fa]',
    },
    emerald: {
      active: 'bg-[#06241c]/95 border-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.5)] scale-105 opacity-100 ring-1 ring-emerald-400/60',
      idle: 'bg-[#041a14]/85 border-emerald-500/40 opacity-75 hover:opacity-100',
      iconActive: 'bg-emerald-400 text-black shadow-[0_0_10px_#34d399]',
      iconIdle: 'bg-emerald-500/20 text-emerald-300',
      badge: 'text-emerald-300 font-bold',
      pulse: 'bg-emerald-400 shadow-[0_0_6px_#34d399]',
    },
  }[colorTheme];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute ${positionClass} z-20 w-[190px] p-3.5 rounded-2xl border text-left cursor-pointer transition-all duration-400 backdrop-blur-xl ${
        isActive ? themeClasses.active : themeClasses.idle
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isActive ? themeClasses.iconActive : themeClasses.iconIdle}`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          <strong className="text-white text-xs font-bold uppercase tracking-wider font-mono">{title}</strong>
        </div>
        {isActive && <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${themeClasses.pulse}`} />}
      </div>
      <p className="text-[11px] text-slate-300 leading-snug mb-2 font-normal">{sub}</p>
      <div className="flex items-center justify-between pt-1.5 border-t border-white/10 text-[10px] font-mono">
        <span className="text-slate-400">{metricLabel}</span>
        <span className={themeClasses.badge}>{metricValue}</span>
      </div>
    </button>
  );
};
