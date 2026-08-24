import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Activity, TrendingUp, AlertCircle, ShieldCheck } from 'lucide-react';
import { FocusBriefing, FocusCoreState } from '../../types/focus';
import { FocusCore } from '../core/FocusCore';

interface ArrivalSectionProps {
  briefing: FocusBriefing;
  onStartBriefing: () => void;
  onSelectDimension?: (dimensionKey: 'priorities' | 'changes' | 'anomalies' | 'stable') => void;
  isStartingTransition?: boolean;
}

export const ArrivalSection: React.FC<ArrivalSectionProps> = ({
  briefing,
  onStartBriefing,
  onSelectDimension,
  isStartingTransition = false,
}) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const isStableScenario = briefing.scenario === 'stable';

  const getCoreState = (): FocusCoreState => {
    if (hoveredNode === 'priorities') return 'attention';
    if (hoveredNode === 'changes') return 'change';
    if (hoveredNode === 'anomalies') return 'anomaly';
    if (hoveredNode === 'stable') return 'stable';
    if (isStableScenario) return 'stable';
    return 'observing';
  };

  return (
    <section
      id="focus-arrival-view"
      className="relative min-h-[92vh] w-full flex flex-col items-center justify-between pt-24 pb-12 px-6 sm:px-12 max-w-7xl mx-auto z-10 select-none"
    >
      {/* Top Narrative Greeting */}
      <motion.div
        className="text-center max-w-3xl mx-auto space-y-4"
        initial={{ opacity: 0, y: 15 }}
        animate={{
          opacity: isStartingTransition ? 0.2 : 1,
          scale: isStartingTransition ? 0.96 : 1,
          y: 0,
        }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="inline-flex items-center gap-2 text-xs font-mono font-medium tracking-widest text-blue-400 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
          <span>{briefing.greeting} · {briefing.userName}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white font-['Outfit',sans-serif] leading-[1.15]">
          {isStableScenario ? (
            <>
              Revisé tu operación completa.{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">
                Todo está bajo control.
              </span>
            </>
          ) : (
            <>
              Revisé tu operación completa.{' '}
              <br className="hidden sm:inline" />
              Esto es lo que <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">importa</span> hoy.
            </>
          )}
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto font-light leading-relaxed">
          {briefing.summarySentence}
        </p>
      </motion.div>

      {/* Central Living Constellation: Focus Core + 4 Floating Signal Nodes */}
      <div className="relative w-full max-w-5xl my-4 sm:my-6 flex items-center justify-center min-h-[380px] sm:min-h-[460px]">
        {/* Fine SVG Signal Lines connecting floating nodes to Core center */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none hidden lg:block"
          viewBox="0 0 1000 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Signal Line 1: Top-Left -> Priorities */}
          <motion.path
            d="M 320 140 L 410 200 L 440 225"
            stroke={hoveredNode === 'priorities' ? '#F43F5E' : 'rgba(255, 255, 255, 0.12)'}
            strokeWidth={hoveredNode === 'priorities' ? '1.8' : '1'}
            strokeDasharray={hoveredNode === 'priorities' ? 'none' : '3 6'}
            initial={{ pathLength: 0 }}
            animate={{
              pathLength: isStartingTransition ? 0 : 1,
              opacity: isStartingTransition ? 0 : 1,
            }}
            transition={{ duration: 0.8, delay: 0.1 }}
          />
          <circle cx="440" cy="225" r="2.5" fill={hoveredNode === 'priorities' ? '#F43F5E' : '#60A5FA'} className="opacity-80" />

          {/* Signal Line 2: Bottom-Left -> Changes */}
          <motion.path
            d="M 320 360 L 410 300 L 440 275"
            stroke={hoveredNode === 'changes' ? '#06B6D4' : 'rgba(255, 255, 255, 0.12)'}
            strokeWidth={hoveredNode === 'changes' ? '1.8' : '1'}
            strokeDasharray={hoveredNode === 'changes' ? 'none' : '3 6'}
            initial={{ pathLength: 0 }}
            animate={{
              pathLength: isStartingTransition ? 0 : 1,
              opacity: isStartingTransition ? 0 : 1,
            }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          <circle cx="440" cy="275" r="2.5" fill={hoveredNode === 'changes' ? '#06B6D4' : '#38BDF8'} className="opacity-80" />

          {/* Signal Line 3: Top-Right -> Anomalies */}
          <motion.path
            d="M 680 140 L 590 200 L 560 225"
            stroke={hoveredNode === 'anomalies' ? '#A855F7' : 'rgba(255, 255, 255, 0.12)'}
            strokeWidth={hoveredNode === 'anomalies' ? '1.8' : '1'}
            strokeDasharray={hoveredNode === 'anomalies' ? 'none' : '3 6'}
            initial={{ pathLength: 0 }}
            animate={{
              pathLength: isStartingTransition ? 0 : 1,
              opacity: isStartingTransition ? 0 : 1,
            }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
          <circle cx="560" cy="225" r="2.5" fill={hoveredNode === 'anomalies' ? '#A855F7' : '#C084FC'} className="opacity-80" />

          {/* Signal Line 4: Bottom-Right -> Stable */}
          <motion.path
            d="M 680 360 L 590 300 L 560 275"
            stroke={hoveredNode === 'stable' ? '#10B981' : 'rgba(255, 255, 255, 0.12)'}
            strokeWidth={hoveredNode === 'stable' ? '1.8' : '1'}
            strokeDasharray={hoveredNode === 'stable' ? 'none' : '3 6'}
            initial={{ pathLength: 0 }}
            animate={{
              pathLength: isStartingTransition ? 0 : 1,
              opacity: isStartingTransition ? 0 : 1,
            }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />
          <circle cx="560" cy="275" r="2.5" fill={hoveredNode === 'stable' ? '#10B981' : '#34D399'} className="opacity-80" />
        </svg>

        {/* Center Focus Core */}
        <motion.div
          className="z-10 cursor-pointer"
          onClick={onStartBriefing}
          animate={{
            scale: isStartingTransition ? 1.05 : 1,
          }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          <FocusCore size="hero" state={getCoreState()} />
        </motion.div>

        {/* 4 Floating Signal Nodes (No heavy card boxes, pure floating editorial annotations) */}
        
        {/* Node 1: Top-Left (Priorities) */}
        <motion.div
          id="node-priorities"
          initial={{ opacity: 0, x: -20 }}
          animate={{
            opacity: isStartingTransition ? 0 : 1,
            x: isStartingTransition ? -40 : 0,
          }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onMouseEnter={() => setHoveredNode('priorities')}
          onMouseLeave={() => setHoveredNode(null)}
          onClick={() => onSelectDimension && onSelectDimension('priorities')}
          className="lg:absolute lg:left-8 lg:top-14 flex items-center gap-3 p-2 group cursor-pointer transition-all"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#F43F5E] group-hover:scale-125 transition-transform" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-rose-400">
                PRIORIDADES
              </span>
              <span className="text-xs text-rose-300 font-mono">
                {briefing.dimensions.prioritiesCount}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-light group-hover:text-slate-200 transition-colors">
              {briefing.dimensions.prioritiesSummary}
            </p>
          </div>
        </motion.div>

        {/* Node 2: Bottom-Left (Changes) */}
        <motion.div
          id="node-changes"
          initial={{ opacity: 0, x: -20 }}
          animate={{
            opacity: isStartingTransition ? 0 : 1,
            x: isStartingTransition ? -40 : 0,
          }}
          transition={{ duration: 0.5, delay: 0.3 }}
          onMouseEnter={() => setHoveredNode('changes')}
          onMouseLeave={() => setHoveredNode(null)}
          onClick={() => onSelectDimension && onSelectDimension('changes')}
          className="lg:absolute lg:left-8 lg:bottom-14 flex items-center gap-3 p-2 group cursor-pointer transition-all"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06B6D4] group-hover:scale-125 transition-transform" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-cyan-400">
                QUÉ CAMBIÓ
              </span>
              <span className="text-xs text-cyan-300 font-mono">
                {briefing.dimensions.changesCount}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-light group-hover:text-slate-200 transition-colors">
              {briefing.dimensions.changesSummary}
            </p>
          </div>
        </motion.div>

        {/* Node 3: Top-Right (Anomalies) */}
        <motion.div
          id="node-anomalies"
          initial={{ opacity: 0, x: 20 }}
          animate={{
            opacity: isStartingTransition ? 0 : 1,
            x: isStartingTransition ? 40 : 0,
          }}
          transition={{ duration: 0.5, delay: 0.4 }}
          onMouseEnter={() => setHoveredNode('anomalies')}
          onMouseLeave={() => setHoveredNode(null)}
          onClick={() => onSelectDimension && onSelectDimension('anomalies')}
          className="lg:absolute lg:right-8 lg:top-14 flex items-center gap-3 p-2 group cursor-pointer transition-all text-left lg:text-right"
        >
          <div className="order-2 lg:order-1">
            <div className="flex items-center gap-2 lg:justify-end">
              <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-purple-400">
                FUERA DE LO HABITUAL
              </span>
              <span className="text-xs text-purple-300 font-mono">
                {briefing.dimensions.anomaliesCount}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-light group-hover:text-slate-200 transition-colors">
              {briefing.dimensions.anomaliesSummary}
            </p>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_8px_#A855F7] group-hover:scale-125 transition-transform order-1 lg:order-2" />
        </motion.div>

        {/* Node 4: Bottom-Right (Stable) */}
        <motion.div
          id="node-stable"
          initial={{ opacity: 0, x: 20 }}
          animate={{
            opacity: isStartingTransition ? 0 : 1,
            x: isStartingTransition ? 40 : 0,
          }}
          transition={{ duration: 0.5, delay: 0.5 }}
          onMouseEnter={() => setHoveredNode('stable')}
          onMouseLeave={() => setHoveredNode(null)}
          onClick={() => onSelectDimension && onSelectDimension('stable')}
          className="lg:absolute lg:right-8 lg:bottom-14 flex items-center gap-3 p-2 group cursor-pointer transition-all text-left lg:text-right"
        >
          <div className="order-2 lg:order-1">
            <div className="flex items-center gap-2 lg:justify-end">
              <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-emerald-400">
                TODO LO DEMÁS
              </span>
              <span className="text-xs text-emerald-300 font-mono">
                {briefing.dimensions.stableCount}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-light group-hover:text-slate-200 transition-colors">
              {briefing.dimensions.stableSummary}
            </p>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981] group-hover:scale-125 transition-transform order-1 lg:order-2" />
        </motion.div>
      </div>

      {/* Primary CTA button + Reading time metadata */}
      <motion.div
        className="flex flex-col items-center gap-4 text-center z-10"
        initial={{ opacity: 0, y: 15 }}
        animate={{
          opacity: isStartingTransition ? 0 : 1,
          y: isStartingTransition ? 20 : 0,
        }}
        transition={{ duration: 0.4 }}
      >
        <button
          id="btn-start-briefing"
          onClick={onStartBriefing}
          className="group inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          <span>{isStableScenario ? 'Verificar estado' : 'Comenzar briefing'}</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </button>

        <span className="text-xs text-slate-500 font-light">
          {briefing.estimatedReadTime} de lectura
        </span>
      </motion.div>
    </section>
  );
};
