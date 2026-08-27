import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { OrganicFramingShapes } from '../effects/OrganicFramingShapes';

type NarrativeTransitionVariant = 'converge' | 'timeline' | 'calm' | 'synthesis' | 'anomaly-bridge';

interface NarrativeTransitionProps {
  id: string;
  eyebrow?: string;
  firstLine: string;
  secondLine: string;
  variant: NarrativeTransitionVariant;
}

export const NarrativeTransition: React.FC<NarrativeTransitionProps> = ({
  id,
  eyebrow,
  firstLine,
  secondLine,
  variant,
}) => {
  const reduce = !!useReducedMotion();
  const isWhyBridge = variant === 'timeline';

  let gradientClass = 'from-white via-white/80 to-white/40';
  let glowColor = 'bg-blue-500/15';
  let eyebrowClass = 'text-slate-400';
  let firstLineClass = 'text-slate-400';

  if (variant === 'timeline') {
    gradientClass = 'from-cyan-300 via-white to-violet-300';
    glowColor = 'bg-cyan-500/12';
    eyebrowClass = 'text-cyan-400/80';
    firstLineClass = 'text-slate-400';
  } else if (variant === 'anomaly-bridge') {
    gradientClass = 'from-rose-300 via-white to-rose-100';
    glowColor = 'bg-rose-500/15';
  } else if (variant === 'calm') {
    gradientClass = 'from-emerald-300 via-white to-emerald-100';
    glowColor = 'bg-emerald-500/15';
  } else if (variant === 'synthesis') {
    gradientClass = 'from-blue-300 via-purple-300 to-white';
    glowColor = 'bg-indigo-500/15';
  }

  return (
    <section
      id={id}
      className="relative py-36 md:py-48 flex flex-col items-center justify-center overflow-hidden min-h-[70vh]"
      aria-label={`${firstLine} ${secondLine}`}
    >
      {isWhyBridge && (
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <OrganicFramingShapes active variant="why-bridge" />
        </div>
      )}

      {/* Subtle Glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        {isWhyBridge ? (
          <>
            <motion.div
              animate={reduce ? false : { opacity: [0.08, 0.18, 0.08], scale: [1, 1.12, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute w-[55vw] h-[28vw] rounded-[100%] blur-[140px] bg-cyan-500/10 -translate-x-[12%]"
            />
            <motion.div
              animate={reduce ? false : { opacity: [0.06, 0.14, 0.06], scale: [1, 1.1, 1] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute w-[50vw] h-[26vw] rounded-[100%] blur-[140px] bg-violet-500/10 translate-x-[12%]"
            />
          </>
        ) : (
          <motion.div
            animate={reduce ? false : { opacity: [0.1, 0.25, 0.1], scale: [1, 1.15, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className={`w-[60vw] h-[30vw] rounded-[100%] blur-[140px] ${glowColor}`}
          />
        )}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {eyebrow && (
          <motion.span
            className={`block mb-6 text-sm font-mono tracking-[0.3em] uppercase ${eyebrowClass}`}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: 0.5 }}
          >
            {eyebrow}
          </motion.span>
        )}

        <motion.p
          className={`text-2xl md:text-3xl lg:text-4xl font-light tracking-wide mb-4 ${firstLineClass}`}
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.7 }}
        >
          {firstLine}
        </motion.p>

        <motion.strong
          className={`block text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br ${gradientClass}`}
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {secondLine}
        </motion.strong>

        {/* Visual Embellishment based on variant */}
        <div className="mt-16 flex justify-center items-center h-12" aria-hidden="true">
          {variant === 'timeline' && (
            <motion.div
              className="w-full max-w-[220px] h-[2px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent relative"
              initial={reduce ? false : { scaleX: 0, opacity: 0 }}
              whileInView={{ scaleX: 1, opacity: 0.6 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: 'easeInOut', delay: 0.4 }}
            >
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-[1px] bg-gradient-to-r from-cyan-400/40 via-violet-400/60 to-cyan-400/40" />
            </motion.div>
          )}
          {variant === 'anomaly-bridge' && (
            <motion.div
              className="flex gap-4"
              initial={reduce ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-rose-500"
                  animate={reduce ? false : { scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </motion.div>
          )}
          {variant === 'calm' && (
            <motion.div
              className="w-24 h-[1px] bg-emerald-500/30 relative"
              initial={reduce ? false : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-emerald-500/50 backdrop-blur-sm" />
            </motion.div>
          )}
          {variant === 'synthesis' && (
            <div className="flex gap-3 items-center">
              <motion.div className="w-1 h-1 rounded-full bg-blue-400" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }} />
              <motion.div className="w-1 h-1 rounded-full bg-purple-400" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }} />
              <motion.div className="w-1 h-1 rounded-full bg-emerald-400" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.6 }} />
              <motion.div className="w-12 h-[1px] bg-gradient-to-r from-white/20 to-transparent ml-2" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: 0.7 }} style={{ transformOrigin: 'left' }} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
