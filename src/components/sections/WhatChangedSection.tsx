import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Check, CircleAlert, Sparkles, User as UserIcon, ChevronDown } from 'lucide-react';
import { FocusChange } from '../../types/focus';

interface WhatChangedSectionProps {
  changes: FocusChange;
  onContinue?: () => void;
}

export const WhatChangedSection: React.FC<WhatChangedSectionProps> = ({ changes }) => {
  const reduce = !!useReducedMotion();

  return (
    <section id="section-chapter-changes" className="relative min-h-screen py-28 overflow-hidden" data-chapter="changes">
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={reduce ? false : { opacity: [0.08, 0.16, 0.08], scale: [1, 1.15, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 right-0 w-[500px] h-[700px] bg-purple-600 rounded-full blur-[160px]"
        />
        <motion.div 
          animate={reduce ? false : { opacity: [0.04, 0.12, 0.04], y: [-30, 30, -30] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 left-1/4 w-[600px] h-[400px] bg-emerald-500 rounded-full blur-[150px]"
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <motion.header
          className="mb-24 text-center max-w-3xl mx-auto"
          initial={reduce ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
            <span className="text-purple-400 font-mono text-sm tracking-wider">03 / 07</span>
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <strong className="text-white text-sm tracking-widest uppercase font-medium">Cambios</strong>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-white">
            Desde tu última visita.
          </h2>
          <p className="text-lg md:text-xl text-slate-400 font-light max-w-2xl mx-auto">
            FOCUS analizó la evolución del contexto. Esto es lo que se transformó.
          </p>
        </motion.header>

        {/* State Comparison Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-12 items-center mb-32 relative">
          
          <motion.article 
            className="relative overflow-hidden rounded-[2rem] bg-white/[0.03] border border-white/10 backdrop-blur-xl p-8 lg:p-10"
            initial={reduce ? false : { opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-500 to-transparent opacity-30" />
            <small className="text-slate-400 uppercase tracking-widest text-xs font-semibold block mb-4">{changes.previousState.label}</small>
            <strong className="text-2xl md:text-3xl text-white font-medium block mb-4">{changes.previousState.value ?? 'Antes'}</strong>
            <p className="text-slate-400 leading-relaxed">{changes.previousState.description}</p>
          </motion.article>

          <div className="flex justify-center items-center py-4 lg:py-0">
            <div className="w-[1px] h-12 lg:w-16 lg:h-[1px] bg-gradient-to-b lg:bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <div className="w-3 h-3 rounded-full bg-white/30 shrink-0 mx-[-6px] lg:mx-0 lg:my-[-6px]" />
            <div className="w-[1px] h-12 lg:w-16 lg:h-[1px] bg-gradient-to-b lg:bg-gradient-to-r from-white/30 via-transparent to-transparent" />
          </div>

          <motion.article 
            className="relative overflow-hidden rounded-[2rem] bg-[#0F172A]/80 border border-purple-500/30 backdrop-blur-xl p-8 lg:p-10 shadow-[0_0_40px_rgba(168,85,247,0.1)]"
            initial={reduce ? false : { opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-[50px] pointer-events-none" />
            <small className="text-purple-400 uppercase tracking-widest text-xs font-semibold block mb-4">{changes.currentState.label}</small>
            <strong className="text-2xl md:text-3xl text-white font-medium block mb-4">{changes.currentState.value ?? 'Ahora'}</strong>
            <p className="text-slate-300 leading-relaxed relative z-10">{changes.currentState.description}</p>
          </motion.article>

        </div>

        {/* Vertical Timeline */}
        <div className="relative mb-24 pl-4 md:pl-0">
          <motion.div 
            className="absolute left-8 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-purple-500/40 to-transparent md:-translate-x-1/2"
            initial={reduce ? false : { scaleY: 0, opacity: 0 }}
            whileInView={{ scaleY: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            style={{ transformOrigin: 'top' }}
          />

          <div className="space-y-16">
            {changes.changes.map((change, index) => {
              const isEven = index % 2 === 0;
              const isHighImportance = change.importance === 'high';
              
              return (
                <motion.article
                  key={change.id}
                  className={`relative flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-12 ${isEven ? 'md:flex-row-reverse' : ''}`}
                  initial={reduce ? false : { opacity: 0, y: 30 }}
                  whileInView={{ opacity: isHighImportance ? 1 : 0.6, y: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                >
                  {/* Content Card */}
                  <div className={`w-full md:w-[calc(50%-3rem)] ${isEven ? 'md:text-right' : 'md:text-left'} ml-16 md:ml-0`}>
                    <div className={`group relative p-6 rounded-[1.5rem] bg-[#050A15]/60 border backdrop-blur-md transition-all duration-300 hover:bg-[#050A15]/90 ${isHighImportance ? 'border-purple-500/30 hover:border-purple-500/50' : 'border-white/5 hover:border-white/10'}`}>
                      <span className="text-slate-400 font-mono text-xs tracking-wider uppercase mb-3 block">{change.timeLabel}</span>
                      <strong className="text-xl md:text-2xl text-white font-medium mb-3 block">{change.title}</strong>
                      <p className="text-slate-400 text-sm leading-relaxed mb-6">{change.description}</p>
                      
                      {/* Avatar Placeholder */}
                      <div className={`flex items-center gap-3 ${isEven ? 'md:justify-end' : 'md:justify-start'}`}>
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/5 overflow-hidden">
                           <UserIcon className="w-4 h-4 text-slate-400" />
                        </div>
                        <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">Avatar</span>
                      </div>
                    </div>
                  </div>

                  {/* Node */}
                  <div className="absolute left-8 md:left-1/2 top-6 md:top-1/2 w-10 h-10 -translate-x-1/2 md:-translate-y-1/2 flex items-center justify-center">
                    <div className={`w-full h-full rounded-full border border-white/20 flex items-center justify-center backdrop-blur-xl shadow-[0_0_15px_rgba(0,0,0,0.5)] ${isHighImportance ? 'bg-purple-900/80 shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'bg-[#0F172A]'}`}>
                      {change.status === 'resolved' ? (
                        <Check className={`w-4 h-4 ${isHighImportance ? 'text-purple-300' : 'text-slate-300'}`} />
                      ) : (
                        <CircleAlert className={`w-4 h-4 ${isHighImportance ? 'text-purple-300' : 'text-slate-300'}`} />
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>

        {/* Continuous Scroll Guide & Stats */}
        <motion.div
          className="flex flex-col items-center text-center"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-sm mb-6 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>{changes.newItemsCount} observados, <strong className="text-white">{changes.relevantChangesCount} relevantes</strong></span>
          </div>

          <motion.div 
            className="flex flex-col items-center justify-center text-slate-500 text-xs font-mono tracking-widest uppercase gap-2"
            initial={reduce ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span>Sigue explorando</span>
            <motion.div 
              animate={reduce ? false : { y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChevronDown className="w-4 h-4 text-purple-400/70" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
