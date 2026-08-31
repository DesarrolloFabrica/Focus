import React from 'react';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import { ChevronDown, TrendingUp, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import focusPriorityBeacon from '../../assets/focus-priority-beacon.webp';
import { FocusPriority } from '../../types/focus';
import { usePerfConfig } from '../../perf';

interface PrioritySectionProps {
  priority: FocusPriority;
  onContinue?: () => void;
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_OUT_SOFT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const PrioritySection: React.FC<PrioritySectionProps> = ({ priority }) => {
  const reduceMotion = !!useReducedMotion();
  const perf = usePerfConfig();
  const useFullDetailMotion = !reduceMotion && perf.tier === 'high';

  const viewport = {
    once: true,
    amount: 0.05 as const,
    margin: '100px 0px 0px 0px' as const,
  };

  const sectionVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.09,
        delayChildren: reduceMotion ? 0 : 0.06,
      },
    },
  };

  const fadeUp: Variants = {
    hidden: reduceMotion
      ? { opacity: 1 }
      : { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: EASE_OUT_EXPO },
    },
  };

  const fadeLeft: Variants = {
    hidden: reduceMotion
      ? { opacity: 1 }
      : { opacity: 0, x: -24 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.65, ease: EASE_OUT_SOFT },
    },
  };

  const fadeRight: Variants = {
    hidden: reduceMotion
      ? { opacity: 1 }
      : { opacity: 0, x: 28 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: EASE_OUT_SOFT },
    },
  };

  const scaleIn: Variants = {
    hidden: reduceMotion
      ? { opacity: 1 }
      : { opacity: 0, scale: 0.94, y: 28 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.85, ease: EASE_OUT_EXPO },
    },
  };

  const cardVariants: Variants = {
    hidden: reduceMotion
      ? { opacity: 1 }
      : { opacity: 0, y: 32, scale: 0.98 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.75,
        delay: reduceMotion ? 0 : 0.1 + i * 0.1,
        ease: EASE_OUT_EXPO,
      },
    }),
  };

  const metricChipVariants: Variants = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16, scale: 0.92 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.55,
        delay: reduceMotion ? 0 : 0.55 + i * 0.08,
        ease: EASE_OUT_SOFT,
      },
    }),
  };

  return (
    <section
      id="section-chapter-priority"
      className="iv-priority-section relative pb-4 sm:pb-6 overflow-hidden flex flex-col"
      data-chapter="priority"
    >
      {/* Soft static ambient — opacity pulse only on high tier */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none" aria-hidden="true">
        {useFullDetailMotion ? (
          <motion.div
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: EASE_OUT_SOFT }}
            className="absolute inset-0"
          >
            <motion.div
              animate={{ opacity: [0.14, 0.22, 0.14] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              className="iv-priority-section__ambient-orb is-animated absolute top-1/3 left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px]"
            />
            <motion.div
              animate={{ opacity: [0.08, 0.16, 0.08] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
              className="iv-priority-section__ambient-orb is-animated absolute bottom-10 right-[-5%] w-[420px] h-[420px] bg-indigo-600/15 rounded-full blur-[100px]"
            />
          </motion.div>
        ) : (
          <>
            <div className="iv-priority-section__ambient-orb absolute top-1/3 left-[-10%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.18)_0%,rgba(37,99,235,0.06)_42%,transparent_72%)]" />
            <div className="iv-priority-section__ambient-orb absolute bottom-10 right-[-5%] w-[420px] h-[420px] rounded-full bg-[radial-gradient(circle,rgba(79,70,229,0.12)_0%,rgba(79,70,229,0.04)_42%,transparent_72%)]" />
          </>
        )}
      </div>

      <motion.div
        className="relative z-10 max-w-[1400px] w-full mx-auto px-6 lg:px-12"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-5 flex flex-col items-start">

            {/* Chapter Step Pill */}
            <motion.div
              variants={fadeLeft}
              className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#0c1424]/90 border border-white/10 mb-8 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
            >
              <span className="text-cyan-400 font-mono text-xs font-semibold tracking-wider">01 / 07</span>
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <strong className="text-white text-xs tracking-widest uppercase font-medium">Prioridad principal</strong>
            </motion.div>

            {/* Main Headline */}
            <motion.h2
              id="priority-heading"
              tabIndex={-1}
              variants={fadeUp}
              className="text-4xl md:text-5xl lg:text-[3.25rem] font-bold tracking-tight text-white leading-[1.12] mb-10 bg-gradient-to-br from-white via-slate-100 to-blue-200 bg-clip-text text-transparent"
            >
              {priority.headline}
            </motion.h2>

            {/* 3D Beacon — feathered into ambient, no hard rectangular crop */}
            <motion.figure
              variants={scaleIn}
              className="relative w-full max-w-[480px] mx-auto lg:mx-0 mt-2 flex items-center justify-center"
            >
              {/* Soft volumetric backlight (sits behind crystal) */}
              <motion.div
                variants={fadeUp}
                className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 w-[85%] h-[75%] rounded-full bg-gradient-to-t from-blue-600/35 via-cyan-500/20 to-purple-600/15 blur-[70px] pointer-events-none"
              />

              <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-[1] opacity-35"
                viewBox="0 0 420 360"
                aria-hidden="true"
              >
                <ellipse cx="210" cy="230" rx="170" ry="58" fill="none" stroke="rgba(101, 217, 255, 0.4)" strokeWidth="1" strokeDasharray="5 9" />
                <ellipse cx="210" cy="230" rx="188" ry="74" fill="none" stroke="rgba(147, 197, 253, 0.22)" strokeWidth="0.8" transform="rotate(-12 210 230)" />
                <circle cx="105" cy="190" r="2.5" fill="#38bdf8" />
                <circle cx="325" cy="250" r="2" fill="#c084fc" />
              </svg>

              {/* Image plate: soft elliptical feather — no square crop */}
              <div
                className="relative z-[2] w-full max-h-[400px] aspect-[1.15/1] flex items-center justify-center"
                style={{
                  WebkitMaskImage:
                    'radial-gradient(ellipse 55% 52% at 50% 45%, #000 0%, #000 28%, rgba(0,0,0,0.65) 48%, rgba(0,0,0,0.2) 64%, transparent 78%)',
                  maskImage:
                    'radial-gradient(ellipse 55% 52% at 50% 45%, #000 0%, #000 28%, rgba(0,0,0,0.65) 48%, rgba(0,0,0,0.2) 64%, transparent 78%)',
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskSize: '100% 100%',
                  maskSize: '100% 100%',
                }}
              >
                <motion.img
                  src={focusPriorityBeacon}
                  alt="FOCUS Priority Beacon"
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-contain object-center scale-[1.1] filter saturate-[1.28] contrast-[1.08] brightness-[1.05] mix-blend-screen pointer-events-none select-none"
                  animate={useFullDetailMotion ? { y: [-4, 4, -4] } : false}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>

              {/* Telemetry badge — sits above feather layers */}
              <motion.div
                variants={fadeUp}
                className="absolute bottom-3 right-3 z-20 flex items-center gap-3 px-3.5 py-2 rounded-xl bg-[#060b18]/95 border border-cyan-500/30 shadow-[0_12px_32px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.15)]"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full bg-cyan-400${useFullDetailMotion ? ' animate-ping' : ''}`} />
                  <div className="flex flex-col">
                    <span className="text-[9px] text-cyan-300 font-mono tracking-widest uppercase font-semibold">Señal Activa</span>
                    <strong className="text-white text-sm font-bold font-mono leading-tight">{priority.currentMetric}</strong>
                  </div>
                </div>

                <div className={`px-2 py-0.5 rounded-md font-mono text-xs font-bold flex items-center gap-1 ${
                  priority.deltaPercentage > 0
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  <TrendingUp className="w-3 h-3" />
                  <span>{priority.deltaPercentage > 0 ? '+' : ''}{priority.deltaPercentage}%</span>
                </div>
              </motion.div>
            </motion.figure>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-7 flex flex-col">

            {/* Editorial Kicker */}
            <motion.div
              variants={fadeRight}
              className="mb-8 pl-4 border-l-2 border-cyan-500/50"
            >
              <h3 className="text-2xl md:text-3xl font-semibold text-white tracking-tight leading-snug">
                {priority.description}
              </h3>
            </motion.div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">

              <motion.article
                custom={0}
                variants={cardVariants}
                className="group relative overflow-hidden rounded-[1.75rem] p-6 lg:p-7 border border-white/10 bg-[#0a1220]/95 shadow-[0_16px_36px_-8px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.12)] border-b-2 border-b-cyan-500/80 transition-all duration-300 hover:border-b-cyan-400 hover:shadow-[0_20px_42px_-8px_rgba(6,182,212,0.35)] hover:-translate-y-1"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-cyan-500/20 transition-all" />

                <div className="flex items-center justify-between mb-5 relative z-10">
                  <span className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 font-mono text-cyan-300 text-xs font-bold flex items-center justify-center">
                    01
                  </span>
                  <div className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10">
                    <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">En curso</span>
                  </div>
                </div>

                <h4 className="text-white text-base font-semibold uppercase tracking-wider mb-3">
                  Situación Actual
                </h4>

                <p className="text-slate-300 text-sm leading-relaxed relative z-10">
                  El indicador opera en <b className="text-cyan-300 font-semibold">{priority.currentMetric}</b>, lejos del ritmo que esta operación suele sostener.
                </p>
              </motion.article>

              <motion.article
                custom={1}
                variants={cardVariants}
                className="group relative overflow-hidden rounded-[1.75rem] p-6 lg:p-7 border border-white/10 bg-[#0a1220]/95 shadow-[0_16px_36px_-8px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.12)] border-b-2 border-b-blue-500/80 transition-all duration-300 hover:border-b-blue-400 hover:shadow-[0_20px_42px_-8px_rgba(59,130,246,0.35)] hover:-translate-y-1"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-blue-500/20 transition-all" />

                <div className="flex items-center justify-between mb-5 relative z-10">
                  <span className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 font-mono text-blue-300 text-xs font-bold flex items-center justify-center">
                    02
                  </span>
                  <div className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10">
                    <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Línea Base</span>
                  </div>
                </div>

                <h4 className="text-white text-base font-semibold uppercase tracking-wider mb-3">
                  Referencia Habitual
                </h4>

                <p className="text-slate-300 text-sm leading-relaxed relative z-10">
                  El comportamiento esperado se mantiene cerca de <b className="text-blue-300 font-semibold">{priority.usualMetric}</b>. Ese contraste define la prioridad.
                </p>
              </motion.article>

            </div>

            {/* Deep-Dive Card */}
            <motion.article
              custom={2}
              variants={cardVariants}
              className="group relative overflow-hidden rounded-[2rem] p-7 lg:p-9 border border-white/10 bg-[#080e1a]/96 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.14)] border-b-2 border-b-purple-500/80 transition-all duration-300 hover:border-b-purple-400 hover:shadow-[0_24px_54px_-10px_rgba(168,85,247,0.3)]"
            >
              <div className="absolute top-0 right-1/4 w-72 h-40 bg-purple-500/10 rounded-full blur-[60px] pointer-events-none group-hover:bg-purple-500/20 transition-all" />

              <div className="flex items-center gap-3 mb-5 relative z-10">
                <div className="px-3.5 py-1 rounded-full bg-purple-500/15 border border-purple-400/30 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span className="text-purple-300 font-mono text-[11px] uppercase tracking-widest font-bold">
                    Lectura de FOCUS
                  </span>
                </div>
              </div>

              <p className="text-slate-200 text-base md:text-[1.05rem] leading-relaxed mb-7 relative z-10 font-normal">
                FOCUS elevó este asunto porque concentra <b className="text-white font-semibold underline decoration-cyan-400/40 decoration-2 underline-offset-4">{priority.affectedCount} {priority.affectedUnit}</b>, con un deterioro de <b className="text-rose-300 font-semibold">{priority.deltaPercentage > 0 ? '+' : ''}{priority.deltaPercentage}%</b> frente a lo habitual. {priority.startedTimeAgo}{' '}
                {priority.explanation.summaryText}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-5 border-t border-white/10 relative z-10">
                {[
                  {
                    label: 'Impacto',
                    value: priority.explanation.impact,
                    icon: AlertCircle,
                    color: 'text-rose-300',
                  },
                  {
                    label: 'Persistencia',
                    value: priority.explanation.persistence,
                    icon: Clock,
                    color: 'text-cyan-300',
                  },
                  {
                    label: 'Relevancia',
                    value: priority.explanation.relevance,
                    icon: CheckCircle2,
                    color: 'text-purple-300',
                  },
                ].map((metric, i) => {
                  const Icon = metric.icon;
                  return (
                    <motion.div
                      key={metric.label}
                      custom={i}
                      variants={metricChipVariants}
                      className="px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col justify-center"
                    >
                      <small className="text-slate-400 text-xs font-mono uppercase tracking-wider mb-1">{metric.label}</small>
                      <strong className={`${metric.color} text-sm font-semibold flex items-center gap-1.5`}>
                        <Icon className="w-3.5 h-3.5" />
                        {metric.value}
                      </strong>
                    </motion.div>
                  );
                })}
              </div>
            </motion.article>

          </div>
        </div>

        {/* Scroll Cue */}
        <motion.div
          variants={fadeUp}
          className="mt-5 sm:mt-6 flex flex-col items-center justify-center text-slate-500 text-xs font-mono tracking-widest uppercase gap-2"
        >
          <span>Desliza para entender por qué</span>
          <motion.div
            animate={reduceMotion ? false : { y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-4 h-4 text-cyan-400/70" />
          </motion.div>
        </motion.div>

      </motion.div>
    </section>
  );
};
