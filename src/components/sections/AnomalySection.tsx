import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Activity, Info } from 'lucide-react';
import { FocusAnomaly } from '../../types/focus';
import { FocusCore } from '../core/FocusCore';

interface AnomalySectionProps {
  anomaly: FocusAnomaly;
  onUnderstand: () => void;
}

export const AnomalySection: React.FC<AnomalySectionProps> = ({ anomaly, onUnderstand }) => {
  return (
    <section
      id="section-chapter-anomaly"
      className="relative min-h-screen w-full flex items-center px-6 sm:px-12 max-w-7xl mx-auto py-20 z-10 select-none"
    >
      {/* 55% Content (Left) / 45% Visual (Core Right in Anomaly State) */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Column (Content, approx 58%) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Chapter Eyebrow */}
          <motion.div
            className="flex items-center gap-3 text-xs font-mono tracking-widest text-purple-400 font-semibold"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span>04 / 05</span>
            <span className="w-1 h-1 rounded-full bg-purple-400" />
            <span className="uppercase tracking-widest">FUERA DE LO HABITUAL</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h2
            className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white font-['Outfit',sans-serif] leading-[1.12]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {anomaly.headline}
          </motion.h2>

          {/* Narrative Body text */}
          <motion.p
            className="text-slate-300 text-lg sm:text-xl font-light leading-relaxed max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {anomaly.description}
          </motion.p>

          {/* Trajectory Divergence Visualization directly on Canvas (No heavy box) */}
          <motion.div
            className="py-4 space-y-3 max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">TRAYECTORIA ESPERADA (DESCENDENTE)</span>
              <span className="text-purple-300 font-semibold">TRAYECTORIA REAL (ASCENDENTE)</span>
            </div>

            {/* Custom Diverging Trajectory Graphic */}
            <div className="relative w-full h-32 flex items-center justify-center">
              <svg viewBox="0 0 450 120" className="w-full h-full fill-none" preserveAspectRatio="none">
                {/* Expected trajectory curve (descending dashed line) */}
                <path
                  d="M 10 30 Q 140 40 220 60 T 440 100"
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="1.8"
                  strokeDasharray="4 4"
                />
                <circle cx="440" cy="100" r="3.5" fill="#10B981" />

                {/* Actual divergent rising trajectory curve */}
                <motion.path
                  d="M 10 30 Q 140 40 220 60 T 440 15"
                  stroke="#C084FC"
                  strokeWidth="2.5"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
                <circle cx="440" cy="15" r="4.5" fill="#D8B4FE" className="animate-pulse shadow-[0_0_10px_#A855F7]" />

                {/* Divergence Point Marker */}
                <circle cx="220" cy="60" r="5" fill="#A855F7" />
                <circle cx="220" cy="60" r="10" stroke="#A855F7" strokeWidth="1" className="animate-ping opacity-75" />
              </svg>

              {/* Annotation badge at divergence */}
              <div className="absolute top-1/2 left-[48%] -translate-y-1/2 text-[11px] font-mono text-purple-200 bg-[#0A0518]/90 border border-purple-500/30 px-2.5 py-1 rounded-full backdrop-blur-md">
                Punto de divergencia anómala
              </div>
            </div>
          </motion.div>

          {/* The Conceptual Principle: "No es crítico. Es inusual. Y esa diferencia importa." */}
          <motion.div
            className="space-y-1.5 pt-2"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-purple-200 font-['Outfit',sans-serif]">
              No es crítico. Es inusual.
            </div>
            <p className="text-sm sm:text-base text-slate-400 font-light">
              Y esa diferencia importa: actuar sobre una anomalía a tiempo previene que se convierta en una emergencia.
            </p>
          </motion.div>

          {/* Action CTA */}
          <motion.div
            className="flex items-center gap-4 pt-2"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <button
              id="btn-understand-anomaly"
              onClick={onUnderstand}
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            >
              <span>Entender qué pasó</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </motion.div>
        </div>

        {/* Right Column: Focus Core in Anomaly State (Violet with organic slight distortion) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative min-h-[360px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <FocusCore size="large" state="anomaly" anomalyActive={true} />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
