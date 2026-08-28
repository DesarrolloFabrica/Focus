import React from 'react';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import {
  Sparkles,
  ChevronDown,
  Clock3,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Zap,
  Activity,
  Cpu,
  ShieldAlert,
  Radio,
  Crosshair,
  Compass,
  Layers,
} from 'lucide-react';
import { FocusChange, FocusChangeEvent } from '../../types/focus';
import { OrganicFramingShapes } from '../effects/OrganicFramingShapes';

interface WhatChangedSectionProps {
  changes: FocusChange;
  onContinue?: () => void;
}

interface StatusConfig {
  label: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  cardBorder: string;
  glowColor: string;
  nodeBg: string;
  nodeBorder: string;
  nodeIconColor: string;
  accentGradient: string;
  Icon: typeof AlertTriangle;
  defaultOrigin: string;
}

function getStatusConfig(status: FocusChangeEvent['status']): StatusConfig {
  switch (status) {
    case 'escalation':
      return {
        label: 'PRIORIDAD ELEVADA',
        badgeBg: 'bg-purple-500/20',
        badgeBorder: 'border-purple-400/40',
        badgeText: 'text-purple-300',
        cardBorder: 'hover:border-purple-400/60 border-purple-500/30 shadow-[0_0_30px_rgba(192,132,252,0.15)]',
        glowColor: 'rgba(192, 132, 252, 0.35)',
        nodeBg: 'bg-[#1b0a2e]',
        nodeBorder: 'border-purple-400/60 shadow-[0_0_22px_rgba(192,132,252,0.5)]',
        nodeIconColor: 'text-purple-300',
        accentGradient: 'from-purple-500 via-fuchsia-400 to-transparent',
        Icon: Zap,
        defaultOrigin: 'FOCUS Engine // Priorización',
      };
    case 'threshold':
      return {
        label: 'LÍMITE SUPERADO',
        badgeBg: 'bg-rose-500/20',
        badgeBorder: 'border-rose-400/40',
        badgeText: 'text-rose-300',
        cardBorder: 'hover:border-rose-400/60 border-rose-500/30 shadow-[0_0_30px_rgba(244,63,94,0.15)]',
        glowColor: 'rgba(244, 63, 94, 0.35)',
        nodeBg: 'bg-[#250815]',
        nodeBorder: 'border-rose-400/60 shadow-[0_0_22px_rgba(244,63,94,0.5)]',
        nodeIconColor: 'text-rose-300',
        accentGradient: 'from-rose-500 via-amber-400 to-transparent',
        Icon: ShieldAlert,
        defaultOrigin: 'Monitor de Umbrales // Latencia',
      };
    case 'resolved':
      return {
        label: 'NORMALIZADO',
        badgeBg: 'bg-emerald-500/20',
        badgeBorder: 'border-emerald-400/40',
        badgeText: 'text-emerald-300',
        cardBorder: 'hover:border-emerald-400/60 border-emerald-500/30 shadow-[0_0_30px_rgba(52,211,153,0.12)]',
        glowColor: 'rgba(52, 211, 153, 0.25)',
        nodeBg: 'bg-[#06241a]',
        nodeBorder: 'border-emerald-400/60 shadow-[0_0_22px_rgba(52,211,153,0.5)]',
        nodeIconColor: 'text-emerald-300',
        accentGradient: 'from-emerald-400 via-teal-300 to-transparent',
        Icon: CheckCircle2,
        defaultOrigin: 'Sensor Unidad Este // Flujo',
      };
    case 'new':
    default:
      return {
        label: 'NUEVO PATRÓN',
        badgeBg: 'bg-cyan-500/20',
        badgeBorder: 'border-cyan-400/40',
        badgeText: 'text-cyan-300',
        cardBorder: 'hover:border-cyan-400/60 border-cyan-500/30 shadow-[0_0_30px_rgba(56,189,248,0.15)]',
        glowColor: 'rgba(56, 189, 248, 0.35)',
        nodeBg: 'bg-[#071b30]',
        nodeBorder: 'border-cyan-400/60 shadow-[0_0_22px_rgba(56,189,248,0.5)]',
        nodeIconColor: 'text-cyan-300',
        accentGradient: 'from-cyan-400 via-blue-400 to-transparent',
        Icon: TrendingUp,
        defaultOrigin: 'Punto de Validación B // Sensor',
      };
  }
}

export const WhatChangedSection: React.FC<WhatChangedSectionProps> = ({ changes, onContinue }) => {
  const reduceMotion = !!useReducedMotion();

  // Dramatic tilted / angled swing entrance animations that re-trigger on two-way scroll
  const dramaticSlideLeft: Variants = {
    hidden: reduceMotion
      ? { opacity: 1 }
      : {
          opacity: 0,
          x: -160,
          y: 45,
          rotateZ: -9,
          rotateY: 15,
          scale: 0.86,
        },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      rotateZ: 0,
      rotateY: 0,
      scale: 1,
      transition: {
        type: 'spring',
        damping: 18,
        stiffness: 90,
        mass: 0.85,
      },
    },
  };

  const dramaticSlideRight: Variants = {
    hidden: reduceMotion
      ? { opacity: 1 }
      : {
          opacity: 0,
          x: 160,
          y: 45,
          rotateZ: 9,
          rotateY: -15,
          scale: 0.86,
        },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      rotateZ: 0,
      rotateY: 0,
      scale: 1,
      transition: {
        type: 'spring',
        damping: 18,
        stiffness: 90,
        mass: 0.85,
      },
    },
  };

  const dramaticFadeUp: Variants = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 35, scale: 0.94 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 100,
      },
    },
  };

  return (
    <section
      id="section-chapter-changes"
      className="relative min-h-screen py-24 sm:py-32 overflow-hidden select-none"
      data-chapter="changes"
      aria-label="Capítulo Cambios: Desde tu última visita"
      style={{ perspective: '1200px' }}
    >
      {/* RICH MULTI-LAYERED CYBERNETIC BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Layer 1: Organic Framing Ambient Waveforms */}
        <OrganicFramingShapes variant="why-bridge" className="opacity-60 scale-105" />

        {/* Layer 2: Technical Grid Matrix with Coordinate Crosshairs */}
        <div className="absolute inset-0 opacity-[0.045] bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:40px_40px]" />
        
        {/* Layer 3: Laser Scanline moving down gently */}
        <motion.div
          className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-400/25 to-transparent shadow-[0_0_15px_rgba(168,85,247,0.4)]"
          animate={reduceMotion ? false : { top: ['0%', '100%'] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
        />

        {/* Layer 4: Orbital Cybernetic Radar Rings in Background */}
        <div className="absolute -top-12 -right-12 w-[650px] h-[650px] pointer-events-none opacity-20">
          <motion.div
            className="w-full h-full rounded-full border border-purple-500/30 border-dashed"
            animate={reduceMotion ? false : { rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-16 rounded-full border border-cyan-400/20"
            animate={reduceMotion ? false : { rotate: -360 }}
            transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
          />
          <div className="absolute inset-32 rounded-full border border-purple-300/15" />
        </div>

        <div className="absolute -bottom-20 -left-20 w-[550px] h-[550px] pointer-events-none opacity-15">
          <motion.div
            className="w-full h-full rounded-full border border-cyan-400/30 border-dashed"
            animate={reduceMotion ? false : { rotate: -360 }}
            transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
          />
          <div className="absolute inset-20 rounded-full border border-purple-400/20" />
        </div>

        {/* Layer 5: Dynamic Volumetric Nebula Glows */}
        <motion.div
          animate={reduceMotion ? false : { opacity: [0.15, 0.28, 0.15], scale: [1, 1.15, 1], x: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 -right-10 w-[600px] h-[600px] bg-purple-600/25 rounded-full blur-[140px]"
        />
        <motion.div
          animate={reduceMotion ? false : { opacity: [0.12, 0.24, 0.12], scale: [1.1, 0.95, 1.1], y: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-1/3 -left-10 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[140px]"
        />

        {/* Layer 6: Ambient Technical HUD Markers & Watermarks */}
        <div className="absolute top-28 left-10 font-mono text-[10px] text-purple-400/30 tracking-widest hidden xl:block">
          <div>CHRONO_REF // 04.07</div>
          <div className="text-slate-500/30">STREAM_DELTA: ACTIVE</div>
        </div>
        <div className="absolute top-28 right-10 font-mono text-[10px] text-cyan-400/30 tracking-widest text-right hidden xl:block">
          <div>NODE_SYNC: 99.4%</div>
          <div className="text-slate-500/30">OBSERVATORY_CORE</div>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8">
        
        {/* Chapter Header with Re-triggering Animation */}
        <motion.header
          className="mb-20 sm:mb-24 text-center max-w-3xl mx-auto"
          variants={dramaticFadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
        >
          {/* Chapter Step Pill */}
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#060e1d]/90 border border-purple-500/25 shadow-[0_4px_24px_rgba(168,85,247,0.2)] backdrop-blur-xl mb-6">
            <span className="text-purple-400 font-mono text-xs font-semibold tracking-wider">04 / 07</span>
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_10px_#c084fc] animate-pulse" />
            <strong className="text-white text-xs tracking-widest uppercase font-medium">Cambios</strong>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-5 leading-[1.08] bg-gradient-to-b from-white via-slate-100 to-purple-200 bg-clip-text text-transparent drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
            Desde tu última visita.
          </h2>

          <p className="text-base sm:text-lg lg:text-xl text-slate-300 font-light max-w-2xl mx-auto leading-relaxed">
            FOCUS analizó la evolución del contexto operacional. Esto es lo que se transformó de forma acumulativa.
          </p>
        </motion.header>

        {/* State Comparison Panel (Antes vs Ahora with Dramatic Swing Entrance & Two-Way Scroll) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-8 items-center mb-28 sm:mb-36 relative">
          
          {/* BEFORE CARD (Dramatic Left Tilted Slide-In) */}
          <motion.article
            className="group relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0a1426]/90 via-[#060d1b]/90 to-[#03070f]/90 border border-white/12 backdrop-blur-2xl p-7 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-white/30 hover:shadow-[0_25px_60px_rgba(0,0,0,0.7)]"
            variants={dramaticSlideLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.25 }}
          >
            {/* Top Specular Rim */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-slate-300/40 to-transparent" />

            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-slate-300 shadow-inner">
                  <Clock3 className="w-4 h-4" />
                </div>
                <span className="text-slate-300 font-mono text-xs uppercase tracking-widest font-medium">
                  {changes.previousState.label || 'Última visita'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-white/[0.05] px-2.5 py-1 rounded-full border border-white/10">
                LÍNEA BASE
              </span>
            </div>

            <div className="mb-4">
              <span className="text-4xl sm:text-5xl font-extrabold font-mono text-slate-100 tracking-tight leading-none block mb-1">
                {changes.previousState.value ?? '2.1 días'}
              </span>
              <span className="text-xs font-mono text-slate-400 tracking-wider">Operación en rango habitual</span>
            </div>

            <p className="text-slate-300 text-sm sm:text-base font-light leading-relaxed m-0">
              {changes.previousState.description}
            </p>
          </motion.article>

          {/* CENTRAL DIFFERENTIAL CONNECTOR WITH PULSING DIVERGENCE PILL */}
          <div className="flex flex-col lg:flex-row items-center justify-center py-2 lg:py-0">
            <div className="hidden lg:block w-8 h-[2px] bg-gradient-to-r from-slate-600/40 via-purple-500/50 to-purple-500" />
            <motion.div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#120822] border border-purple-500/50 shadow-[0_0_24px_rgba(168,85,247,0.45)] backdrop-blur-xl z-20 text-xs font-mono font-bold text-purple-300 my-2 lg:my-0"
              initial={reduceMotion ? false : { scale: 0.7, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ type: 'spring', damping: 15, stiffness: 120 }}
            >
              <TrendingUp className="w-3.5 h-3.5 text-purple-400 animate-bounce" />
              <span>DIVERGENCIA</span>
            </motion.div>
            <div className="hidden lg:block w-8 h-[2px] bg-gradient-to-r from-purple-500 via-purple-500/50 to-purple-500/20" />
          </div>

          {/* CURRENT CARD (Dramatic Right Tilted Slide-In) */}
          <motion.article
            className="group relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1a0c2e]/95 via-[#0e071c]/95 to-[#06030c]/95 border border-purple-500/40 backdrop-blur-2xl p-7 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_35px_rgba(168,85,247,0.2)] transition-all duration-300 hover:border-purple-400/70 hover:shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_45px_rgba(168,85,247,0.3)]"
            variants={dramaticSlideRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.25 }}
          >
            {/* Top Specular Rim */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent" />
            <div className="absolute -top-24 -right-24 w-56 h-56 bg-purple-500/30 rounded-full blur-[65px] pointer-events-none" />

            <div className="flex items-center justify-between gap-3 mb-4 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/25 border border-purple-400/50 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(192,132,252,0.4)]">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <span className="text-purple-300 font-mono text-xs uppercase tracking-widest font-semibold">
                  {changes.currentState.label || 'Ahora'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-rose-300 bg-rose-950/70 px-2.5 py-1 rounded-full border border-rose-500/50 flex items-center gap-1.5 shadow-[0_0_12px_rgba(244,63,94,0.3)]">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                DESVIACIÓN CRÍTICA
              </span>
            </div>

            <div className="mb-4 relative z-10">
              <span className="text-4xl sm:text-5xl font-extrabold font-mono tracking-tight leading-none block mb-1 bg-gradient-to-r from-rose-400 via-purple-300 to-indigo-200 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(192,132,252,0.5)]">
                {changes.currentState.value ?? '5.8 días'}
              </span>
              <span className="text-xs font-mono text-purple-300/90 tracking-wider">Aceleración de latencia confirmada</span>
            </div>

            <p className="text-slate-200 text-sm sm:text-base font-light leading-relaxed m-0 relative z-10">
              {changes.currentState.description}
            </p>
          </motion.article>

        </div>

        {/* Chronological Vertical Timeline with Noticeable Angled Entrances on Two-Way Scroll */}
        <div className="relative mb-28 sm:mb-36">
          
          {/* Central Cybernetic Spine with Flowing Laser Pulse */}
          <div
            className="absolute left-6 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-purple-500/70 via-cyan-400/50 to-transparent md:-translate-x-1/2"
            aria-hidden="true"
          >
            {/* Traveling laser pulse down the spine */}
            <motion.div
              className="w-full h-24 bg-gradient-to-b from-transparent via-cyan-300 to-transparent shadow-[0_0_12px_#67e8f9]"
              animate={reduceMotion ? false : { top: ['0%', '100%'] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            />
          </div>

          <div className="space-y-14 sm:space-y-20">
            {changes.changes.map((change, index) => {
              const isEven = index % 2 === 0;
              const config = getStatusConfig(change.status);
              const NodeIcon = config.Icon;

              // Alternating dramatic angled swing: even cards from left with negative tilt, odd cards from right with positive tilt
              const cardVariant = isEven ? dramaticSlideLeft : dramaticSlideRight;

              return (
                <div
                  key={change.id}
                  className={`relative flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-14 ${
                    isEven ? '' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Event Content Card (Visibly tilted & swings smoothly into alignment on scroll up/down) */}
                  <motion.div
                    className="w-full md:w-[calc(50%-3.5rem)] ml-14 md:ml-0"
                    variants={cardVariant}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: false, amount: 0.25 }}
                  >
                    <div
                      className={`group relative p-6 sm:p-8 rounded-[1.85rem] bg-gradient-to-br from-[#0a1426]/95 via-[#060c18]/95 to-[#03060d]/95 border ${config.cardBorder} backdrop-blur-2xl shadow-[0_20px_45px_rgba(0,0,0,0.6)] transition-all duration-300 hover:translate-y-[-5px] hover:shadow-[0_25px_55px_rgba(0,0,0,0.8)]`}
                    >
                      {/* Top Specular Rim with Semantic Gradient */}
                      <div className={`absolute top-0 left-6 right-6 h-[1.5px] bg-gradient-to-r ${config.accentGradient}`} />

                      {/* Header Row: Timestamp + Category Badge */}
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-slate-200 font-mono text-xs font-semibold tracking-wider">
                          <Clock3 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{change.timeLabel}</span>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg ${config.badgeBg} border ${config.badgeBorder} ${config.badgeText} text-[10px] font-mono font-semibold tracking-wider uppercase shadow-sm`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                          {config.label}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2.5 leading-snug group-hover:text-white transition-colors">
                        {change.title}
                      </h3>

                      {/* Description */}
                      <p className="text-slate-300 text-sm sm:text-base font-light leading-relaxed mb-6">
                        {change.description}
                      </p>

                      {/* Bottom Entity / Origin Footer Chip */}
                      <div className="flex items-center justify-between pt-3.5 border-t border-white/10 text-xs font-mono">
                        <div className="flex items-center gap-2 text-slate-400">
                          <div className="w-6 h-6 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center text-cyan-400">
                            <Cpu className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-slate-300 font-medium">{config.defaultOrigin}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest hidden sm:inline">
                          AUDITADO
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Central Spine Node (Scales in and pulses when scrolled to) */}
                  <motion.div
                    className="absolute left-6 md:left-1/2 top-6 md:top-1/2 w-12 h-12 -translate-x-1/2 md:-translate-y-1/2 flex items-center justify-center z-20"
                    initial={reduceMotion ? false : { scale: 0, opacity: 0, rotate: -45 }}
                    whileInView={{ scale: 1, opacity: 1, rotate: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 120 }}
                  >
                    <div
                      className={`w-full h-full rounded-2xl ${config.nodeBg} border ${config.nodeBorder} flex items-center justify-center backdrop-blur-xl shadow-lg transition-transform hover:scale-115`}
                    >
                      <NodeIcon className={`w-5 h-5 ${config.nodeIconColor}`} />
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary Footer & Continuous Scroll Guide with Re-triggering Animation */}
        <motion.div
          className="flex flex-col items-center text-center"
          variants={dramaticFadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.4 }}
        >
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#081224]/90 border border-purple-500/35 text-slate-200 text-sm mb-6 backdrop-blur-xl shadow-[0_0_30px_rgba(168,85,247,0.2)]">
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            <span>
              {changes.newItemsCount} eventos observados,{' '}
              <strong className="text-purple-300 font-semibold">{changes.relevantChangesCount} cambios relevantes</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={onContinue}
            className="group flex flex-col items-center justify-center text-slate-400 hover:text-white text-xs font-mono tracking-widest uppercase gap-2 transition-colors cursor-pointer"
            aria-label="Continuar a Anomalías"
          >
            <span>Sigue explorando</span>
            <motion.div
              animate={reduceMotion ? false : { y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronDown className="w-4 h-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
            </motion.div>
          </button>
        </motion.div>

      </div>
    </section>
  );
};
