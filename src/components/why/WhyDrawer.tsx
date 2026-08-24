import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, AlertCircle, TrendingUp, Clock, Target, CheckCircle2 } from 'lucide-react';
import { FocusExplanation } from '../../types/focus';

interface WhyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  explanation: FocusExplanation;
  priorityTitle?: string;
}

export const WhyDrawer: React.FC<WhyDrawerProps> = ({
  isOpen,
  onClose,
  explanation,
  priorityTitle = 'Proceso de Validación y Cierre',
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 transition-opacity"
          />

          {/* Right Sliding Drawer */}
          <motion.aside
            id="focus-why-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-[#040816] border-l border-white/[0.08] shadow-2xl z-50 overflow-y-auto p-6 sm:p-8 flex flex-col justify-between select-none"
          >
            <div className="space-y-8">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-blue-400 uppercase">
                  <Sparkles className="w-4 h-4" />
                  <span>TRANSPARENCIA ALGORÍTMICA FOCUS</span>
                </div>
                <button
                  id="btn-close-why-drawer"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-['Outfit',sans-serif]">
                  Por qué te mostramos esto.
                </h2>
                <p className="text-xs text-slate-400">
                  Criterios de evaluación para: <span className="text-slate-200 font-medium">{priorityTitle}</span>
                </p>
              </div>

              {/* 4 Factor Comparison Visuals */}
              <div className="space-y-4">
                {/* 01 Impacto */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-rose-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                      <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                        01 · IMPACTO
                      </span>
                    </div>
                    <span className="text-xs font-bold font-mono text-rose-400 uppercase">
                      {explanation.impact}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 font-light">
                    {explanation.impactDescription}
                  </p>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="w-[85%] h-full bg-rose-500 rounded-full" />
                  </div>
                </div>

                {/* 02 Deterioro */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-cyan-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                        02 · DETERIORO
                      </span>
                    </div>
                    <span className="text-xs font-bold font-mono text-cyan-400 uppercase">
                      {explanation.deterioration}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 font-light">
                    Desviación acelerada (+38%) frente a la media histórica del proceso.
                  </p>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="w-[78%] h-full bg-cyan-400 rounded-full" />
                  </div>
                </div>

                {/* 03 Persistencia */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-purple-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                        03 · PERSISTENCIA
                      </span>
                    </div>
                    <span className="text-xs font-bold font-mono text-purple-400 uppercase">
                      {explanation.persistence}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 font-light">
                    No es una fluctuación momentánea; la tendencia persiste durante 6 días continuos.
                  </p>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="w-[92%] h-full bg-purple-400 rounded-full" />
                  </div>
                </div>

                {/* 04 Relevancia */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-blue-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                        04 · RELEVANCIA
                      </span>
                    </div>
                    <span className="text-xs font-bold font-mono text-blue-400 uppercase">
                      {explanation.relevance}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 font-light">
                    Coincide de forma directa con tu rol y responsabilidades de firma.
                  </p>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="w-[95%] h-full bg-blue-500 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Algorithm Note Footer */}
            <div className="pt-6 border-t border-white/[0.06] space-y-3">
              <div className="text-[11px] font-mono text-slate-500 leading-relaxed">
                ✦ {explanation.algorithmNote}
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-all"
              >
                Cerrar explicación
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
