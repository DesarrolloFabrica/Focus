import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, HelpCircle, MessageSquare, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { FocusBriefing } from '../../types/focus';
import { FocusCore } from '../core/FocusCore';

interface InvestigationViewProps {
  briefing: FocusBriefing;
  onBackToBriefing: () => void;
  onOpenWhy: () => void;
  onOpenAsk: () => void;
  onOpenActionModal: () => void;
}

export const InvestigationView: React.FC<InvestigationViewProps> = ({
  briefing,
  onBackToBriefing,
  onOpenWhy,
  onOpenAsk,
  onOpenActionModal,
}) => {
  const priority = briefing.mainPriority;
  const [selectedPoint, setSelectedPoint] = useState<'pointB' | 'others'>('pointB');

  return (
    <div
      id="focus-investigation-view"
      className="relative min-h-screen w-full bg-[#030712] text-white pt-24 pb-20 px-6 sm:px-12 max-w-6xl mx-auto overflow-hidden select-none"
    >
      {/* Ambient Scaled Focus Core Backlight (Living Depth) */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.12] blur-3xl pointer-events-none scale-150 z-0">
        <FocusCore size="hero" state="attention" />
      </div>

      {/* Top Breadcrumb Navigation */}
      <motion.div
        className="relative z-10 flex items-center justify-between mb-10 pb-4 border-b border-white/[0.06]"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <button
          id="btn-back-to-briefing"
          onClick={onBackToBriefing}
          className="group flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 rounded-lg py-1 px-2 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Volver al briefing</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenWhy}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs text-slate-300 hover:text-white bg-slate-900/80 border border-slate-800 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
            <span>¿Por qué está en Focus?</span>
          </button>

          <button
            onClick={onOpenAsk}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20 transition-colors"
          >
            <span>✦ Preguntar a Focus</span>
          </button>
        </div>
      </motion.div>

      {/* Narrative Header */}
      <motion.div
        className="relative z-10 space-y-4 mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold tracking-wider uppercase text-rose-400">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>DEEP FOCUS · DESGLOSE DE CAUSA RAÍZ</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white font-['Outfit',sans-serif]">
          Entendamos qué está ocurriendo.
        </h1>

        <p className="text-slate-300 text-lg sm:text-xl font-light leading-relaxed max-w-3xl">
          {priority.startedTimeAgo} y continúa acumulándose. Actualmente el tiempo promedio se sitúa en{' '}
          <strong className="text-white font-medium">{priority.currentMetric}</strong> (+{priority.deltaPercentage}% sobre el habitual de {priority.usualMetric}).
        </p>
      </motion.div>

      {/* Editorial Concentration Highlight (75% SVG Arc + Metric Breakdown) */}
      <motion.div
        className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-6 mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Left: Huge 75% Circular Visual */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl bg-slate-900/40 border border-blue-500/20 shadow-xl">
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle track */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="8"
                fill="none"
              />
              {/* Active 75% Arc */}
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                stroke="url(#gradient-75)"
                strokeWidth="9"
                strokeDasharray="251.2"
                strokeDashoffset="62.8" /* 25% remaining = 75% filled */
                strokeLinecap="round"
                fill="none"
                initial={{ strokeDashoffset: 251.2 }}
                animate={{ strokeDashoffset: 62.8 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id="gradient-75" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="50%" stopColor="#06B6D4" />
                  <stop offset="100%" stopColor="#F43F5E" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner Counter */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl sm:text-5xl font-bold font-mono text-white">75%</span>
              <span className="text-[11px] font-mono tracking-wider uppercase text-blue-300">
                Punto B
              </span>
            </div>
          </div>

          <div className="text-center mt-4">
            <span className="text-sm text-slate-300 font-light">
              Concentración en Área de Firmas y Validación
            </span>
          </div>
        </div>

        {/* Right: Narrative Findings and Point Selectors */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-bold text-white font-['Outfit',sans-serif]">
              El problema no está distribuido por igual.
            </h3>
            <p className="text-slate-300 text-base sm:text-lg font-light leading-relaxed">
              El análisis revela que <strong className="text-blue-400 font-medium">9 de los 12 elementos retrasados</strong> están esperando en la misma etapa del proceso.
            </p>
          </div>

          {/* Interactive Point Breakdown */}
          <div className="space-y-3">
            <div
              onClick={() => setSelectedPoint('pointB')}
              className={`p-4 rounded-2xl transition-all cursor-pointer border ${
                selectedPoint === 'pointB'
                  ? 'bg-blue-950/40 border-blue-500/60 shadow-lg shadow-blue-500/10'
                  : 'bg-slate-900/40 border-white/[0.04] hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-semibold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  Punto de Validación B (Área de firmas y doble chequeo)
                </span>
                <span className="font-mono font-bold text-blue-400">75% del retraso</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-[75%] h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-rose-400 rounded-full" />
              </div>
            </div>

            <div
              onClick={() => setSelectedPoint('others')}
              className={`p-4 rounded-2xl transition-all cursor-pointer border ${
                selectedPoint === 'others'
                  ? 'bg-slate-800/40 border-slate-600 shadow-md'
                  : 'bg-slate-900/40 border-white/[0.04] hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-500" />
                  Resto de etapas combinadas (Puntos A, C, D)
                </span>
                <span className="font-mono font-medium text-slate-400">25% restante</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-[25%] h-full bg-slate-500 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Focus Recommendation & Next Action */}
      <motion.div
        className="relative z-10 p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-emerald-400 uppercase">
            <Sparkles className="w-4 h-4" />
            <span>FOCUS RECOMIENDA</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white font-['Outfit',sans-serif]">
            Revisar primero los 2 elementos de mayor impacto en el Punto B.
          </h3>
          <p className="text-slate-300 text-sm sm:text-base font-light">
            Al desbloquear estos dos casos específicos, se restaurará el 80% de la fluidez operativa sin requerir auditorías adicionales.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button
            id="btn-review-key-cases"
            onClick={onOpenActionModal}
            className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <span>Ver elementos prioritarios</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>

          <button
            id="btn-ask-from-investigation"
            onClick={onOpenAsk}
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all duration-200"
          >
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span>Preguntar sobre esto</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
