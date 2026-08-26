import React from 'react';
import { motion } from 'motion/react';

interface ChapterEyebrowProps {
  number: string;
  label: string;
  tone: 'coral' | 'blue' | 'cyan' | 'violet' | 'emerald';
}

const toneClasses: Record<ChapterEyebrowProps['tone'], string> = {
  coral: 'text-rose-400',
  blue: 'text-blue-400',
  cyan: 'text-cyan-400',
  violet: 'text-violet-400',
  emerald: 'text-emerald-400',
};

export const ChapterEyebrow: React.FC<ChapterEyebrowProps> = ({ number, label, tone }) => (
  <motion.div
    className={`briefing-eyebrow ${toneClasses[tone]}`}
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.6 }}
    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
  >
    <span>{number}</span>
    <span className="briefing-eyebrow__pulse" />
    <span>{label}</span>
  </motion.div>
);
