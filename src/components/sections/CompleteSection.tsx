import React, { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { ArrowRight, Check, Eye, Minus, Target, Image as ImageIcon } from 'lucide-react';
import { FocusBriefing } from '../../types/focus';
import { FocusCore } from '../core/FocusCore';

interface CompleteSectionProps {
  briefing: FocusBriefing;
  onInvestigate: () => void;
  onFinish: () => void;
  onReset: () => void;
}

const actionIcons = { act: Target, watch: Eye, stable: Minus };
const actionLabels = { act: 'Haz ahora', watch: 'Observa', stable: 'Sin acción' };

export const CompleteSection: React.FC<CompleteSectionProps> = ({ briefing, onInvestigate, onFinish, onReset }) => {
  const coreRef = useRef<HTMLDivElement>(null);
  const reduce = !!useReducedMotion();
  const coreIsVisible = useInView(coreRef, { once: true, amount: 0.25 });
  const actions = briefing.summaryActions.slice(0, 3);

  return (
    <section id="section-chapter-complete" className="relative min-h-screen py-28 overflow-hidden flex flex-col items-center justify-center" data-chapter="summary">
      {/* Majestic Aurora Background */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <motion.div 
          animate={reduce ? false : { scale: [1, 1.2, 1], rotate: [0, 180, 360], opacity: [0.12, 0.24, 0.12] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute w-[100vw] h-[100vw] max-w-[1200px] max-h-[1200px] rounded-full blur-[180px] bg-gradient-to-tr from-blue-600/35 via-purple-600/35 to-emerald-500/35"
        />
        <div className="absolute inset-0 bg-[#030712]/30 backdrop-blur-[50px]" />
      </div>

      <div className="relative z-10 max-w-6xl w-full mx-auto px-6 flex flex-col items-center">
        
        <motion.header
          className="text-center mb-16 relative"
          initial={reduce ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl shadow-[0_0_30px_rgba(255,255,255,0.1)] mb-8">
            <Check className="w-4 h-4 text-emerald-400" />
            <strong className="text-white text-sm font-medium tracking-wide">Briefing completado</strong>
          </div>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/50 pb-2">
            Ya tienes el panorama.
          </h2>
          <p className="text-xl text-slate-300 font-light max-w-2xl mx-auto">
            FOCUS redujo toda la actividad observada a lo que realmente necesitabas conocer hoy.
          </p>
        </motion.header>

        {/* Core Visualization Container */}
        <motion.div
          ref={coreRef}
          className="relative w-full max-w-[600px] aspect-square flex items-center justify-center mb-16"
          initial={reduce ? false : { opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          aria-label="Núcleo FOCUS en estado de síntesis"
        >
          {/* Decorative glowing rings */}
          <div className="absolute inset-10 border border-white/5 rounded-full" />
          <div className="absolute inset-20 border border-white/10 rounded-full" />
          
          <div className="relative z-10">
            {coreIsVisible && <FocusCore size="large" state="complete" variant="particle" markStyle="letter" />}
          </div>
        </motion.div>

        {/* Action Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-20" role="list" aria-label="Conclusiones del briefing">
          {actions.map((action, index) => {
            const Icon = actionIcons[action.level];
            const isAct = action.level === 'act';
            const isWatch = action.level === 'watch';
            
            let colorClasses = 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 text-slate-400';
            if (isAct) colorClasses = 'border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 shadow-[0_0_30px_rgba(225,29,72,0.1)]';
            if (isWatch) colorClasses = 'border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400';

            return (
              <motion.article
                key={action.id}
                role="listitem"
                className={`group relative overflow-hidden rounded-[2rem] border backdrop-blur-xl p-8 transition-all duration-300 ${colorClasses} flex flex-col h-full`}
                initial={reduce ? false : { opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isAct ? 'bg-rose-500/20 text-rose-400' : isWatch ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-white'}`}>
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <small className={`uppercase tracking-widest text-xs font-bold ${isAct ? 'text-rose-400' : isWatch ? 'text-amber-400' : 'text-slate-400'}`}>{actionLabels[action.level]}</small>
                </div>
                
                <strong className="text-xl text-white font-medium block mb-4">{action.title}</strong>
                <p className="text-slate-300 text-sm leading-relaxed mb-6 flex-grow">{action.description}</p>
                
                {/* Image Placeholder */}
                <div className={`h-24 rounded-xl border flex flex-col items-center justify-center gap-2 mt-auto opacity-50 group-hover:opacity-100 transition-opacity ${isAct ? 'bg-rose-500/5 border-rose-500/20' : isWatch ? 'bg-amber-500/5 border-amber-500/20' : 'bg-white/5 border-white/10'}`}>
                   <ImageIcon className="w-5 h-5" />
                   <span className="text-[10px] font-mono uppercase tracking-wider">Imagen contexto</span>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* CTA Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row items-center gap-6"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <button 
            id="btn-summary-investigate" 
            type="button" 
            className="group relative overflow-hidden rounded-full bg-white text-[#030712] px-10 py-5 font-bold text-lg flex items-center gap-4 transition-transform hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.3)] w-full sm:w-auto justify-center" 
            onClick={onInvestigate}
          >
            <span className="relative z-10">Investigar prioridad</span>
            <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </button>
          
          <button 
            id="btn-summary-finish" 
            type="button" 
            className="rounded-full bg-white/5 border border-white/10 text-white px-10 py-5 font-semibold text-lg transition-colors hover:bg-white/10 hover:border-white/20 w-full sm:w-auto" 
            onClick={onFinish}
          >
            Finalizar briefing
          </button>

          <button 
            type="button" 
            className="text-slate-500 hover:text-white transition-colors underline underline-offset-4 text-sm mt-4 sm:mt-0 sm:ml-4" 
            onClick={onReset}
          >
            Volver al panorama
          </button>
        </motion.div>
        
      </div>
    </section>
  );
};
