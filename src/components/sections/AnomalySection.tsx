import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Activity, Image as ImageIcon, ChevronDown } from 'lucide-react';
import { FocusAnomaly } from '../../types/focus';

interface AnomalySectionProps {
  anomaly: FocusAnomaly;
  onContinue?: () => void;
}

const pathFromValues = (values: number[], minimum: number, maximum: number) => {
  if (!values.length) return '';
  const width = 680;
  const left = 40;
  const top = 40;
  const height = 210;
  const range = Math.max(1, maximum - minimum);
  const points = values.map((value, index) => ({
    x: left + (width * index) / Math.max(1, values.length - 1),
    y: top + ((value - minimum) / range) * height,
  }));
  return points.reduce((path, point, index) => `${path}${index ? ' L' : 'M'} ${point.x} ${point.y}`, '');
};

export const AnomalySection: React.FC<AnomalySectionProps> = ({ anomaly }) => {
  const reduce = !!useReducedMotion();
  const hasAnomaly = anomaly.isUnusual;
  const allValues = [...anomaly.expectedPath, ...anomaly.actualPath];
  const minimum = Math.min(...allValues);
  const maximum = Math.max(...allValues);
  const expectedPath = pathFromValues(anomaly.expectedPath, minimum, maximum);
  const actualPath = pathFromValues(anomaly.actualPath, minimum, maximum);
  const breakpointIndex = Math.max(
    1,
    anomaly.actualPath.findIndex((value, index) => Math.abs(value - (anomaly.expectedPath[index] ?? value)) > 3),
  );
  const breakpointX = 40 + (680 * breakpointIndex) / Math.max(1, anomaly.actualPath.length - 1);
  const breakpointValue = anomaly.actualPath[breakpointIndex] ?? minimum;
  const breakpointY = 40 + ((breakpointValue - minimum) / Math.max(1, maximum - minimum)) * 210;

  return (
    <section id="section-chapter-anomaly" className="relative min-h-screen flex items-center justify-center py-28 overflow-hidden" data-chapter="anomaly">
      {/* Intense Anomaly Background Radial Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {hasAnomaly ? (
          <motion.div 
            animate={reduce ? false : { opacity: [0.08, 0.22, 0.08], scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-rose-600/25 rounded-full blur-[200px] z-10"
          />
        ) : (
          <motion.div 
            animate={reduce ? false : { opacity: [0.06, 0.16, 0.06], scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/15 rounded-full blur-[200px] z-10"
          />
        )}
      </div>

      <div className="relative z-20 max-w-6xl w-full mx-auto px-6">
        <motion.header
          className="mb-16 text-center max-w-3xl mx-auto"
          initial={reduce ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className={`inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border backdrop-blur-md mb-8 ${hasAnomaly ? 'border-rose-500/30' : 'border-white/10'}`}>
            <span className={`${hasAnomaly ? 'text-rose-400' : 'text-blue-400'} font-mono text-sm tracking-wider`}>04 / 07</span>
            <div className={`w-1.5 h-1.5 rounded-full ${hasAnomaly ? 'bg-rose-500 animate-pulse' : 'bg-blue-400'}`} />
            <strong className="text-white text-sm tracking-widest uppercase font-medium">Anomalía</strong>
          </div>
          <p className="text-sm font-mono tracking-[0.2em] text-slate-400 mb-6 uppercase">Focus / Fuera de lo habitual</p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-white">
            {hasAnomaly ? 'Esto no suele ocurrir.' : anomaly.headline}
          </h2>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-20">
          
          {/* Chart Glass Panel */}
          <motion.div 
            className="lg:col-span-8 relative overflow-hidden rounded-[2rem] bg-[#050A15]/80 border backdrop-blur-2xl p-6 lg:p-10 shadow-2xl"
            style={{ borderColor: hasAnomaly ? 'rgba(225, 29, 72, 0.2)' : 'rgba(255, 255, 255, 0.05)' }}
            initial={reduce ? false : { opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            {hasAnomaly && (
               <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/20 rounded-full blur-[80px] pointer-events-none" />
            )}

            {/* SVG Chart */}
            <figure className="relative z-10 w-full">
              <svg
                viewBox="0 0 760 300"
                className="w-full h-auto drop-shadow-lg"
                role="img"
                aria-label={hasAnomaly
                  ? `La trayectoria observada diverge del patrón esperado: ${anomaly.breakpointLabel}`
                  : 'La trayectoria observada se mantiene alineada con el patrón esperado'}
              >
                <defs>
                  <linearGradient id="expectedGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="rgba(148, 163, 184, 0.1)" />
                    <stop offset="100%" stopColor="rgba(148, 163, 184, 0.4)" />
                  </linearGradient>
                  <linearGradient id="actualGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={hasAnomaly ? "rgba(225, 29, 72, 0.5)" : "rgba(59, 130, 246, 0.5)"} />
                    <stop offset="100%" stopColor={hasAnomaly ? "rgba(225, 29, 72, 1)" : "rgba(59, 130, 246, 1)"} />
                  </linearGradient>
                </defs>
                
                <motion.ellipse
                  cx="380" cy="150" rx="210" ry="88"
                  fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4"
                  initial={reduce ? false : { opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: 0.1 }}
                />
                <motion.ellipse
                  cx="380" cy="150" rx="280" ry="118"
                  fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"
                  initial={reduce ? false : { opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.22 }}
                />

                <motion.path
                  d={expectedPath}
                  fill="none" stroke="url(#expectedGrad)" strokeWidth="3" strokeDasharray="8 8" strokeLinecap="round" strokeLinejoin="round"
                  initial={reduce ? false : { pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: reduce ? 0.01 : 1.15 }}
                />
                
                <motion.path
                  d={actualPath}
                  fill="none" stroke="url(#actualGrad)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                  initial={reduce ? false : { pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: reduce ? 0.01 : 1.3, delay: reduce ? 0 : 0.15 }}
                />

                {hasAnomaly && (
                  <g>
                    <motion.circle 
                      cx={breakpointX} cy={breakpointY} r="6" fill="#E11D48" 
                      initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 1.2 }}
                    />
                    <motion.circle 
                      cx={breakpointX} cy={breakpointY} r="16" fill="none" stroke="#E11D48" strokeWidth="2"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }} transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.text 
                      x={Math.min(560, breakpointX + 24)} y={Math.max(36, breakpointY - 18)} 
                      fill="#FDA4AF" fontSize="12" fontFamily="monospace" letterSpacing="0.1em"
                      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 1.4 }}
                    >
                      ANOMALÍA DETECTADA
                    </motion.text>
                  </g>
                )}
              </svg>
            </figure>
          </motion.div>

          {/* Context Panel */}
          <motion.aside
            className="lg:col-span-4 flex flex-col justify-center"
            initial={reduce ? false : { opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.65, delay: 0.2 }}
          >
            <div className={`p-8 rounded-[2rem] bg-white/[0.02] border backdrop-blur-md mb-8 ${hasAnomaly ? 'border-rose-500/20 shadow-[0_0_30px_rgba(225,29,72,0.1)]' : 'border-white/10'}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${hasAnomaly ? 'bg-rose-500/20 text-rose-400' : 'bg-blue-500/20 text-blue-400'}`}>
                   <Activity className="w-5 h-5" />
                </div>
                <small className="text-slate-400 uppercase tracking-widest text-xs font-semibold">{anomaly.title}</small>
              </div>
              <p className="text-slate-300 text-sm mb-4">No necesariamente es crítico.</p>
              <strong className="text-xl text-white font-medium block mb-6 leading-tight">
                Es relevante porque se comporta diferente de lo normal.
              </strong>
              
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 mb-6">
                <b className={`block text-2xl font-semibold mb-2 ${hasAnomaly ? 'text-rose-400' : 'text-blue-400'}`}>{anomaly.value}</b>
                <span className="text-slate-400 text-sm">{anomaly.context}</span>
              </div>

              {/* Placeholder for Data visualization or small graphic */}
              <div className="h-20 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center gap-2 border-dashed">
                <ImageIcon className="w-5 h-5 text-slate-600" />
                <span className="text-[10px] text-slate-500 font-mono uppercase">Mini Gráfico</span>
              </div>
            </div>

            <motion.div 
              className="flex items-center justify-center gap-2 text-slate-500 text-xs font-mono tracking-widest uppercase py-2"
              initial={reduce ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <span>Desliza para ver lo estable</span>
              <motion.div 
                animate={reduce ? false : { y: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <ChevronDown className="w-4 h-4 text-rose-400/70" />
              </motion.div>
            </motion.div>
          </motion.aside>

        </div>
      </div>
    </section>
  );
};
