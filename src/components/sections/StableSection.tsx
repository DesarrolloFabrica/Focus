import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { CheckCircle2, ShieldCheck, Image as ImageIcon, ChevronDown } from 'lucide-react';
import { FocusEntity } from '../../types/focus';

interface StableSectionProps {
  entities: FocusEntity[];
  onContinue?: () => void;
}

export const StableSection: React.FC<StableSectionProps> = ({ entities }) => {
  const reduce = !!useReducedMotion();

  return (
    <section id="section-chapter-stability" className="relative min-h-screen py-28 overflow-hidden flex flex-col justify-center" data-chapter="stability">
      {/* Calm, structured background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={reduce ? false : { opacity: [0.06, 0.14, 0.06] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-0 w-[800px] h-[600px] bg-cyan-600/15 rounded-full blur-[160px]"
        />
        <motion.div 
          animate={reduce ? false : { opacity: [0.04, 0.12, 0.04] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[160px]"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <motion.header
          className="mb-20 text-center max-w-3xl mx-auto"
          initial={reduce ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
            <span className="text-emerald-400 font-mono text-sm tracking-wider">05 / 07</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <strong className="text-white text-sm tracking-widest uppercase font-medium">Cobertura</strong>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-white">
            Lo que puedes dejar tranquilo.
          </h2>
          <p className="text-lg md:text-xl text-slate-400 font-light max-w-2xl mx-auto">
            FOCUS también revisó el resto del panorama. Todo esto está bajo control.
          </p>
        </motion.header>

        {/* Masonry-like Grid for Stable Entities */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {entities.map((entity, index) => (
            <motion.article
              key={entity.id}
              className="group relative rounded-[2rem] bg-white/[0.02] border border-white/5 backdrop-blur-md p-6 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300 overflow-hidden flex flex-col"
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              {/* Subtle hover glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-cyan-500/0 group-hover:from-emerald-500/5 group-hover:to-cyan-500/5 transition-all duration-500 pointer-events-none" />
              
              <div className="flex items-start gap-4 mb-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <strong className="text-lg text-white font-medium block">{entity.label}</strong>
                  <span className="text-emerald-400 text-sm font-medium">{entity.state}</span>
                </div>
              </div>

              {entity.description && (
                <p className="text-slate-400 text-sm leading-relaxed mb-4 relative z-10 flex-grow">{entity.description}</p>
              )}

              {entity.metric && (
                <div className="mt-auto pt-4 border-t border-white/5 relative z-10 flex items-center justify-between">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-mono">Métrica</span>
                  <span className="text-white font-mono">{entity.metric}</span>
                </div>
              )}

              {/* Placeholder Logo/Icon for Entity */}
              <div className="absolute right-4 top-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <ImageIcon className="w-16 h-16" />
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div
          className="relative max-w-4xl mx-auto rounded-[2rem] p-[1px] overflow-hidden mb-14"
          initial={reduce ? false : { opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Animated gradient border */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 opacity-30 blur-[2px]" />
          
          <div className="relative bg-[#030712]/90 backdrop-blur-xl rounded-[2rem] p-8 md:p-12 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="inline-flex w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <small className="text-emerald-400 font-mono tracking-widest uppercase mb-2 block">{entities.length} elementos revisados</small>
              <strong className="text-2xl text-white font-medium block">FOCUS también decide qué no mostrarte.</strong>
              <p className="text-slate-400 mt-2">Ninguno de estos puntos requiere tu intervención hoy.</p>
            </div>
          </div>
        </motion.div>

        {/* Continuous Scroll Guide */}
        <motion.div 
          className="flex flex-col items-center justify-center text-slate-500 text-xs font-mono tracking-widest uppercase gap-2"
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <span>Desliza para ver la síntesis</span>
          <motion.div 
            animate={reduce ? false : { y: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-4 h-4 text-emerald-400/70" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
