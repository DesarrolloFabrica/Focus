import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, Sparkles, Clock, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';
import { FocusChange } from '../../types/focus';
import { FocusCore } from '../core/FocusCore';

interface WhatChangedSectionProps {
  changes: FocusChange;
}

export const WhatChangedSection: React.FC<WhatChangedSectionProps> = ({ changes }) => {
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);

  const getEventIcon = (category: string) => {
    switch (category) {
      case 'resolved':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'escalation':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />;
      case 'threshold':
        return <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  return (
    <section
      id="section-chapter-what-changed"
      className="relative min-h-screen w-full flex items-center px-6 sm:px-12 max-w-7xl mx-auto py-20 z-10 select-none"
    >
      {/* 45% Visual (Core Left) / 55% Content (Narrative Right) */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
        {/* Left Column: Focus Core in Change State */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center order-2 lg:order-1 relative min-h-[340px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <FocusCore size="large" state="change" />
          </motion.div>
        </div>

        {/* Right Column: Transformation Narrative */}
        <div className="lg:col-span-7 space-y-8 order-1 lg:order-2">
          {/* Chapter Eyebrow */}
          <motion.div
            className="flex items-center gap-3 text-xs font-mono tracking-widest text-cyan-400 font-semibold"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span>03 / 05</span>
            <span className="w-1 h-1 rounded-full bg-cyan-400" />
            <span className="uppercase tracking-widest">DESDE TU ÚLTIMA VISITA</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h2
            className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white font-['Outfit',sans-serif] leading-[1.12]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            No todo está igual que cuando te fuiste.
          </motion.h2>

          {/* Continuous Transformation Line: ANTES -> AHORA */}
          <motion.div
            className="py-4 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-slate-400 font-semibold tracking-wider">ANTES · ESTABLE</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-rose-400 font-semibold tracking-wider">AHORA · REQUIERE ATENCIÓN</span>
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              </div>
            </div>

            {/* Glowing Transition Vector */}
            <div className="relative w-full h-[2px] bg-gradient-to-r from-emerald-500 via-cyan-400 to-rose-500">
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_10px_#FFFFFF]"
                animate={{
                  left: ['5%', '95%', '5%'],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </div>
          </motion.div>

          {/* Floating Editorial Narrative Metrics (Directly on canvas) */}
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-2 pb-2"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div>
              <div className="text-3xl font-bold font-mono text-white">
                +{changes.newItemsCount}
              </div>
              <div className="text-xs text-slate-400 font-light mt-0.5">
                aparecieron
              </div>
            </div>

            <div>
              <div className="text-3xl font-bold font-mono text-emerald-400">
                −{changes.resolvedItemsCount}
              </div>
              <div className="text-xs text-slate-400 font-light mt-0.5">
                resueltos
              </div>
            </div>

            <div>
              <div className="text-3xl font-bold font-mono text-rose-400">
                {changes.pendingItemsCount}
              </div>
              <div className="text-xs text-slate-400 font-light mt-0.5">
                requieren atención
              </div>
            </div>

            <div>
              <div className="text-3xl font-bold font-mono text-cyan-300">
                {changes.relevantChangesCount}
              </div>
              <div className="text-xs text-slate-400 font-light mt-0.5">
                relevantes para FOCUS
              </div>
            </div>
          </motion.div>

          {/* Toggle Interactive Timeline */}
          <motion.div
            className="pt-2"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <button
              id="btn-toggle-changes-timeline"
              onClick={() => setIsTimelineExpanded(!isTimelineExpanded)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 transition-all duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
            >
              <span>{isTimelineExpanded ? 'Ocultar línea temporal' : 'Ver los cambios ocurridos'}</span>
              {isTimelineExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {/* Expanded Staggered Event Stream */}
            <AnimatePresence>
              {isTimelineExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-3 pt-4 border-l border-white/[0.08] pl-4 mt-4"
                >
                  {changes.events.map((event, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.08 }}
                      className="flex items-baseline gap-3 text-xs"
                    >
                      <span className="font-mono text-slate-500 font-semibold shrink-0">
                        {event.time}
                      </span>
                      <div className="flex items-center gap-1.5 text-slate-300 font-light">
                        {getEventIcon(event.category)}
                        <span>{event.title}</span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
