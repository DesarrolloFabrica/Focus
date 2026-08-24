import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FocusPriority } from '../../types/focus';
import { FocusCore } from '../core/FocusCore';

interface WhyItMattersSectionProps {
  priority: FocusPriority;
}

export const WhyItMattersSection: React.FC<WhyItMattersSectionProps> = ({ priority }) => {
  const [hoveredReason, setHoveredReason] = useState<number | null>(null);

  return (
    <section
      id="section-chapter-why-it-matters"
      className="relative min-h-screen w-full flex flex-col justify-center px-6 sm:px-12 max-w-7xl mx-auto py-20 z-10 select-none"
    >
      {/* Chapter Eyebrow */}
      <motion.div
        className="flex items-center gap-3 text-xs font-mono tracking-widest text-blue-400 font-semibold mb-4"
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <span>02 / 05</span>
        <span className="w-1 h-1 rounded-full bg-blue-400" />
        <span className="uppercase tracking-widest">EXPLICABILIDAD CONTEXTUAL</span>
      </motion.div>

      {/* Main Headline */}
      <motion.h2
        className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white font-['Outfit',sans-serif] leading-[1.12] mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        Hay cuatro razones.
      </motion.h2>

      {/* Explicability Constellation Canvas with Core at Center */}
      <div className="relative w-full min-h-[460px] flex items-center justify-center my-6">
        {/* SVG Connecting Signal Lines from 4 nodes to Core */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
          viewBox="0 0 900 460"
          fill="none"
        >
          {/* Line 1: Top-Left (Impacto) */}
          <motion.path
            d="M 240 90 L 380 180 L 450 230"
            stroke={hoveredReason === 0 ? '#60A5FA' : 'rgba(59, 130, 246, 0.25)'}
            strokeWidth={hoveredReason === 0 ? '2' : '1'}
            strokeDasharray={hoveredReason === 0 ? 'none' : '3 6'}
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          <circle cx="450" cy="230" r="2.5" fill="#60A5FA" />

          {/* Line 2: Bottom-Left (Deterioro) */}
          <motion.path
            d="M 240 370 L 380 280 L 450 230"
            stroke={hoveredReason === 1 ? '#F43F5E' : 'rgba(244, 63, 94, 0.25)'}
            strokeWidth={hoveredReason === 1 ? '2' : '1'}
            strokeDasharray={hoveredReason === 1 ? 'none' : '3 6'}
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />

          {/* Line 3: Top-Right (Persistencia) */}
          <motion.path
            d="M 660 90 L 520 180 L 450 230"
            stroke={hoveredReason === 2 ? '#A855F7' : 'rgba(168, 85, 247, 0.25)'}
            strokeWidth={hoveredReason === 2 ? '2' : '1'}
            strokeDasharray={hoveredReason === 2 ? 'none' : '3 6'}
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />

          {/* Line 4: Bottom-Right (Relevancia) */}
          <motion.path
            d="M 660 370 L 520 280 L 450 230"
            stroke={hoveredReason === 3 ? '#06B6D4' : 'rgba(6, 182, 212, 0.25)'}
            strokeWidth={hoveredReason === 3 ? '2' : '1'}
            strokeDasharray={hoveredReason === 3 ? 'none' : '3 6'}
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
          />
        </svg>

        {/* Central Core in Explaining State */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="z-10"
        >
          <FocusCore size="medium" state="explaining" />
        </motion.div>

        {/* 4 Floating Reason Annotations (Directly on canvas) */}

        {/* Reason 01: Top-Left (IMPACTO) */}
        <motion.div
          onMouseEnter={() => setHoveredReason(0)}
          onMouseLeave={() => setHoveredReason(null)}
          className="md:absolute md:left-8 md:top-8 max-w-[260px] p-2 space-y-1 cursor-default group"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-blue-400">01</span>
            <span className="text-[11px] font-mono tracking-widest uppercase text-slate-400 group-hover:text-blue-400 transition-colors">
              IMPACTO
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white">
            12 elementos
          </div>
          <p className="text-xs text-slate-400 font-light leading-snug">
            {priority.reasons[0]?.detail || 'Afecta directamente el tiempo de entrega prometido a clientes clave.'}
          </p>
        </motion.div>

        {/* Reason 02: Bottom-Left (DETERIORO) */}
        <motion.div
          onMouseEnter={() => setHoveredReason(1)}
          onMouseLeave={() => setHoveredReason(null)}
          className="md:absolute md:left-8 md:bottom-8 max-w-[260px] p-2 space-y-1 cursor-default group"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-rose-400">02</span>
            <span className="text-[11px] font-mono tracking-widest uppercase text-slate-400 group-hover:text-rose-400 transition-colors">
              DETERIORO
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-rose-400">
            +{priority.deltaPercentage}%
          </div>
          <p className="text-xs text-slate-400 font-light leading-snug">
            {priority.reasons[1]?.detail || 'El tiempo de ciclo se duplicó respecto a la media de las últimas 4 semanas.'}
          </p>
        </motion.div>

        {/* Reason 03: Top-Right (PERSISTENCIA) */}
        <motion.div
          onMouseEnter={() => setHoveredReason(2)}
          onMouseLeave={() => setHoveredReason(null)}
          className="md:absolute md:right-8 md:top-8 max-w-[260px] p-2 space-y-1 cursor-default group text-left md:text-right"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center gap-2 md:justify-end">
            <span className="text-[11px] font-mono tracking-widest uppercase text-slate-400 group-hover:text-purple-400 transition-colors">
              PERSISTENCIA
            </span>
            <span className="text-xs font-mono font-bold text-purple-400">03</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-purple-300">
            6 días
          </div>
          <p className="text-xs text-slate-400 font-light leading-snug">
            {priority.reasons[2]?.detail || 'No es un pico aislado de un día; la acumulación no se ha drenado.'}
          </p>
        </motion.div>

        {/* Reason 04: Bottom-Right (RELEVANCIA) */}
        <motion.div
          onMouseEnter={() => setHoveredReason(3)}
          onMouseLeave={() => setHoveredReason(null)}
          className="md:absolute md:right-8 md:bottom-8 max-w-[260px] p-2 space-y-1 cursor-default group text-left md:text-right"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex items-center gap-2 md:justify-end">
            <span className="text-[11px] font-mono tracking-widest uppercase text-slate-400 group-hover:text-cyan-400 transition-colors">
              RELEVANCIA
            </span>
            <span className="text-xs font-mono font-bold text-cyan-400">04</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-300">
            Directa
          </div>
          <p className="text-xs text-slate-400 font-light leading-snug">
            {priority.reasons[3]?.detail || 'Bajo tu alcance de firma y toma de decisión en la estructura actual.'}
          </p>
        </motion.div>
      </div>

      {/* Narrative Synthesis */}
      <motion.div
        className="mt-12 text-center text-slate-400 text-base sm:text-lg font-light italic max-w-xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        "Por estas razones aparece primero en tu briefing."
      </motion.div>
    </section>
  );
};
