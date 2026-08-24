import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, HelpCircle, AlertCircle, Clock } from 'lucide-react';
import { FocusPriority } from '../../types/focus';
import { FocusCore } from '../core/FocusCore';

interface PrioritySectionProps {
  priority: FocusPriority;
  onInvestigate: () => void;
  onOpenWhy: () => void;
}

export const PrioritySection: React.FC<PrioritySectionProps> = ({
  priority,
  onInvestigate,
  onOpenWhy,
}) => {
  const [hoveredMetric, setHoveredMetric] = useState<'affected' | 'delta' | 'duration' | null>(null);

  return (
    <section
      id="section-chapter-priority"
      className="relative min-h-screen w-full flex items-center px-6 sm:px-12 max-w-7xl mx-auto py-20 z-10 select-none"
    >
      {/* 55% Content / 45% Visual Stage Grid */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Column (Content, approx 58%) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Chapter Eyebrow */}
          <motion.div
            className="flex items-center gap-3 text-xs font-mono tracking-widest text-rose-400 font-semibold"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span>01 / 05</span>
            <span className="w-1 h-1 rounded-full bg-rose-400" />
            <span className="uppercase tracking-widest">PRIMERO, ESTO</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h2
            className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white font-['Outfit',sans-serif] leading-[1.12]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {priority.headline}
          </motion.h2>

          {/* Narrative Body text */}
          <motion.p
            className="text-slate-300 text-lg sm:text-xl font-light leading-relaxed max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {priority.description}
          </motion.p>

          {/* Big Typography Metrics Floating on Canvas (No heavy box) */}
          <motion.div
            className="flex flex-wrap items-baseline gap-8 sm:gap-12 pt-2 pb-2"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <div
              onMouseEnter={() => setHoveredMetric('affected')}
              onMouseLeave={() => setHoveredMetric(null)}
              className="cursor-default group"
            >
              <div className="text-3xl sm:text-4xl font-bold font-mono text-white group-hover:text-rose-400 transition-colors">
                {priority.affectedCount}
              </div>
              <div className="text-xs font-mono tracking-wider uppercase text-slate-400 mt-0.5">
                {priority.affectedUnit} AFECTADOS
              </div>
            </div>

            <div
              onMouseEnter={() => setHoveredMetric('delta')}
              onMouseLeave={() => setHoveredMetric(null)}
              className="cursor-default group"
            >
              <div className="text-3xl sm:text-4xl font-bold font-mono text-rose-400 group-hover:scale-105 transition-transform inline-flex items-center gap-1">
                +{priority.deltaPercentage}%
              </div>
              <div className="text-xs font-mono tracking-wider uppercase text-slate-400 mt-0.5">
                DETERIORO DE CICLO
              </div>
            </div>

            <div
              onMouseEnter={() => setHoveredMetric('duration')}
              onMouseLeave={() => setHoveredMetric(null)}
              className="cursor-default group"
            >
              <div className="text-3xl sm:text-4xl font-bold font-mono text-slate-300 group-hover:text-blue-400 transition-colors">
                {priority.startedTimeAgo.split(' ')[1] || '6'} días
              </div>
              <div className="text-xs font-mono tracking-wider uppercase text-slate-400 mt-0.5">
                PERSISTENCIA
              </div>
            </div>
          </motion.div>

          {/* Floating Comparison Bar Graphic (No card container) */}
          <motion.div
            className="space-y-6 pt-4 max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Habitual Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono tracking-wider uppercase text-slate-400">
                <span>HABITUAL</span>
                <span className="text-slate-300 font-bold">{priority.usualMetric}</span>
              </div>
              <div className="w-full h-2 bg-slate-800/80 rounded-full overflow-hidden">
                <div className="w-[36%] h-full bg-slate-500/60 rounded-full" />
              </div>
            </div>

            {/* Current Deteriorated Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono tracking-wider uppercase text-rose-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  AHORA
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-white font-mono">{priority.currentMetric}</span>
                  <span className="text-xs font-bold text-rose-300">+{priority.deltaPercentage}%</span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-slate-800/90 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-rose-600 via-pink-500 to-rose-400 rounded-full shadow-[0_0_12px_rgba(244,63,94,0.7)]"
                  initial={{ width: '36%' }}
                  whileInView={{ width: '92%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.35 }}
                />
              </div>
            </div>
          </motion.div>

          {/* Action CTAs */}
          <motion.div
            className="flex flex-wrap items-center gap-4 pt-4"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <button
              id="btn-investigate-priority"
              onClick={onInvestigate}
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-xl shadow-rose-600/30 hover:shadow-rose-600/50 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              <span>Investigar</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>

            <button
              id="btn-why-priority"
              onClick={onOpenWhy}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full text-sm font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <HelpCircle className="w-4 h-4 text-blue-400" />
              <span>¿Por qué está en Focus?</span>
            </button>
          </motion.div>
        </div>

        {/* Right Column: Living Focus Core in Attention State (approx 42%) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative min-h-[360px]">
          {/* Signal Lines to Core */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none hidden lg:block"
            viewBox="0 0 400 400"
            fill="none"
          >
            {/* Fine Signal Line connecting left text metrics to Core */}
            <motion.path
              d="M 20 160 L 140 200"
              stroke={hoveredMetric ? '#F43F5E' : 'rgba(244, 63, 94, 0.25)'}
              strokeWidth={hoveredMetric ? '1.8' : '1'}
              strokeDasharray={hoveredMetric ? 'none' : '4 4'}
              transition={{ duration: 0.3 }}
            />
            <motion.path
              d="M 20 240 L 140 200"
              stroke={hoveredMetric === 'delta' ? '#F43F5E' : 'rgba(244, 63, 94, 0.2)'}
              strokeWidth={hoveredMetric === 'delta' ? '2' : '1'}
              strokeDasharray={hoveredMetric === 'delta' ? 'none' : '4 4'}
              transition={{ duration: 0.3 }}
            />
          </svg>

          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <FocusCore size="large" state="attention" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
