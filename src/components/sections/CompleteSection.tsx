import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, MessageSquare, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import { FocusBriefing } from '../../types/focus';
import { FocusCore } from '../core/FocusCore';

interface CompleteSectionProps {
  briefing: FocusBriefing;
  onGoToPriority: () => void;
  onOpenAsk: () => void;
  onRestart: () => void;
}

export const CompleteSection: React.FC<CompleteSectionProps> = ({
  briefing,
  onGoToPriority,
  onOpenAsk,
  onRestart,
}) => {
  return (
    <section
      id="section-chapter-complete"
      className="relative min-h-[90vh] w-full flex flex-col items-center justify-center px-6 sm:px-12 max-w-5xl mx-auto py-20 z-10 select-none text-center space-y-8"
    >
      {/* Complete Badge */}
      <motion.div
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-semibold tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-500/30"
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>BRIEFING COMPLETADO</span>
      </motion.div>

      {/* Focus Core in Complete Equilibrium State */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="my-2"
      >
        <FocusCore size="hero" state="complete" />
      </motion.div>

      {/* Main Headline */}
      <div className="space-y-3 max-w-2xl mx-auto">
        <motion.h2
          className="text-4xl sm:text-6xl font-bold tracking-tight text-white font-['Outfit',sans-serif]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Ya estás al día.
        </motion.h2>

        <motion.p
          className="text-slate-300 text-lg sm:text-xl font-light leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          De todo lo observado en tu operación, solo{' '}
          <span className="text-white font-medium">3 asuntos</span> necesitaron tu atención.
        </motion.p>

        <motion.div
          className="text-xs font-mono text-slate-500 pt-1"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          Tiempo de sesión: <span className="text-slate-400 font-semibold">{briefing.completionTime}</span>
        </motion.div>
      </div>

      {/* Action CTAs */}
      <motion.div
        className="flex flex-wrap items-center justify-center gap-4 pt-6"
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <button
          id="btn-complete-to-priority"
          onClick={onGoToPriority}
          className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          <span>Profundizar en la prioridad</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
        </button>

        <button
          id="btn-complete-to-ask"
          onClick={onOpenAsk}
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-medium text-slate-200 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          <MessageSquare className="w-4 h-4 text-blue-400" />
          <span>Preguntar a Focus</span>
        </button>

        <button
          id="btn-complete-restart"
          onClick={onRestart}
          className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full text-sm font-medium text-slate-400 hover:text-slate-200 bg-transparent hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Volver al inicio</span>
        </button>
      </motion.div>
    </section>
  );
};
