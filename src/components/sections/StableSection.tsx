import React from 'react';
import { motion } from 'motion/react';
import { Check, ShieldCheck } from 'lucide-react';
import { FocusStableSummary } from '../../types/focus';
import { FocusCore } from '../core/FocusCore';

interface StableSectionProps {
  stable: FocusStableSummary;
}

export const StableSection: React.FC<StableSectionProps> = ({ stable }) => {
  return (
    <div className="w-full">
      {/* Chapter 05: Stability Constellation */}
      <section
        id="section-chapter-stability"
        className="relative min-h-[90vh] w-full flex flex-col justify-center items-center px-6 sm:px-12 max-w-7xl mx-auto py-16 z-10 select-none text-center"
      >
        {/* Chapter Eyebrow */}
        <motion.div
          className="flex items-center justify-center gap-3 text-xs font-mono tracking-widest text-emerald-400 font-semibold mb-4"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span>05 / 05</span>
          <span className="w-1 h-1 rounded-full bg-emerald-400" />
          <span className="uppercase tracking-widest">ESTABILIDAD OPERATIVA</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h2
          className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white font-['Outfit',sans-serif] leading-[1.15] max-w-3xl mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Todo lo demás sigue su curso.
        </motion.h2>

        {/* Central Serene Constellation with Emerald Core */}
        <div className="relative w-full max-w-4xl min-h-[380px] flex items-center justify-center my-4">
          {/* Subtle connecting constellation SVG lines */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
            viewBox="0 0 800 380"
            fill="none"
          >
            <motion.line
              x1="220"
              y1="110"
              x2="350"
              y2="190"
              stroke="rgba(16, 185, 129, 0.2)"
              strokeWidth="1"
              strokeDasharray="3 6"
            />
            <motion.line
              x1="220"
              y1="270"
              x2="350"
              y2="190"
              stroke="rgba(16, 185, 129, 0.2)"
              strokeWidth="1"
              strokeDasharray="3 6"
            />
            <motion.line
              x1="580"
              y1="110"
              x2="450"
              y2="190"
              stroke="rgba(16, 185, 129, 0.2)"
              strokeWidth="1"
              strokeDasharray="3 6"
            />
            <motion.line
              x1="580"
              y1="270"
              x2="450"
              y2="190"
              stroke="rgba(16, 185, 129, 0.2)"
              strokeWidth="1"
              strokeDasharray="3 6"
            />
          </svg>

          {/* Central Serene Core */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="z-10"
          >
            <FocusCore size="medium" state="stable" />
          </motion.div>

          {/* 4 Floating Stability Signals (No heavy box) */}

          {/* Signal 1: Top-Left */}
          <motion.div
            className="md:absolute md:left-4 md:top-14 flex items-center gap-3 p-2 cursor-default group"
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="w-5 h-5 rounded-full bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Check className="w-3 h-3" />
            </div>
            <span className="text-sm font-mono text-slate-300 group-hover:text-white transition-colors">
              {stable.monitoredProcessesCount} procesos normales
            </span>
          </motion.div>

          {/* Signal 2: Bottom-Left */}
          <motion.div
            className="md:absolute md:left-4 md:bottom-14 flex items-center gap-3 p-2 cursor-default group"
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="w-5 h-5 rounded-full bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Check className="w-3 h-3" />
            </div>
            <span className="text-sm font-mono text-slate-300 group-hover:text-white transition-colors">
              Sin bloqueos críticos
            </span>
          </motion.div>

          {/* Signal 3: Top-Right */}
          <motion.div
            className="md:absolute md:right-4 md:top-14 flex items-center gap-3 p-2 cursor-default group text-left md:text-right"
            initial={{ opacity: 0, x: 15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <span className="text-sm font-mono text-slate-300 group-hover:text-white transition-colors order-2 md:order-1">
              Tiempos dentro de rango
            </span>
            <div className="w-5 h-5 rounded-full bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 order-1 md:order-2">
              <Check className="w-3 h-3" />
            </div>
          </motion.div>

          {/* Signal 4: Bottom-Right */}
          <motion.div
            className="md:absolute md:right-4 md:bottom-14 flex items-center gap-3 p-2 cursor-default group text-left md:text-right"
            initial={{ opacity: 0, x: 15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <span className="text-sm font-mono text-slate-300 group-hover:text-white transition-colors order-2 md:order-1">
              Sin otras anomalías
            </span>
            <div className="w-5 h-5 rounded-full bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 order-1 md:order-2">
              <Check className="w-3 h-3" />
            </div>
          </motion.div>
        </div>

        {/* Editorial Philosophical Note */}
        <motion.p
          className="text-slate-400 text-base sm:text-lg font-light italic max-w-2xl mx-auto mt-10 leading-relaxed"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          "{stable.editorialNote}"
        </motion.p>
      </section>

      {/* Moment of Silence (Visual Breathing Room) */}
      <div className="w-full min-h-[35vh] flex items-center justify-center pointer-events-none select-none">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.6 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
          className="text-[11px] font-mono tracking-[0.3em] uppercase text-slate-600 font-light"
        >
          ··· RESPIRA Y REFLEXIONA ···
        </motion.div>
      </div>
    </div>
  );
};
