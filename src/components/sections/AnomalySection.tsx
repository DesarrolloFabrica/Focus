import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { FocusAnomaly } from '../../types/focus';
import { ChapterEyebrow } from '../briefing/ChapterEyebrow';

interface AnomalySectionProps {
  anomaly: FocusAnomaly;
  onUnderstand: () => void;
}

export const AnomalySection: React.FC<AnomalySectionProps> = ({ anomaly, onUnderstand }) => {
  const reduce = !!useReducedMotion();

  return (
    <section id="section-chapter-anomaly" className="briefing-chapter briefing-chapter--anomaly">
      <div className="briefing-chapter__inner">
        <ChapterEyebrow number="04 / 05" label="Fuera de lo habitual" tone="violet" />

        <motion.div
          className="anomaly-heading"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.55 }}
          transition={{ duration: 0.65 }}
        >
          <p className="briefing-kicker">{anomaly.title}</p>
          <h2 className="briefing-title">{anomaly.headline}</h2>
          <p className="briefing-lede">{anomaly.description}</p>
        </motion.div>

        <motion.figure
          className="anomaly-trajectory"
          initial={reduce ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.7 }}
        >
          <figcaption>
            <span><i className="is-expected" /> Trayectoria esperada</span>
            <span><i className="is-actual" /> Trayectoria real</span>
          </figcaption>
          <svg viewBox="0 0 860 350" role="img" aria-label="La trayectoria real se separa de la esperada y aumenta 24 por ciento en 48 horas">
            <defs>
              <linearGradient id="anomaly-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c084fc" stopOpacity=".28" />
                <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
              </linearGradient>
              <filter id="anomaly-glow"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>
            <g className="anomaly-trajectory__grid">
              <line x1="48" y1="60" x2="812" y2="60" />
              <line x1="48" y1="148" x2="812" y2="148" />
              <line x1="48" y1="236" x2="812" y2="236" />
              <line x1="48" y1="306" x2="812" y2="306" />
            </g>
            <motion.path
              d="M48 112 C180 128 260 152 366 178 C500 210 618 246 812 276"
              className="anomaly-trajectory__expected"
              initial={reduce ? false : { pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.25 }}
            />
            <motion.path
              d="M48 112 C180 128 260 152 366 178 C478 205 526 178 588 142 C668 94 732 68 812 48 L812 306 L366 306 Z"
              fill="url(#anomaly-area)"
              initial={reduce ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.65 }}
            />
            <motion.path
              d="M48 112 C180 128 260 152 366 178 C478 205 526 178 588 142 C668 94 732 68 812 48"
              className="anomaly-trajectory__actual"
              filter="url(#anomaly-glow)"
              initial={reduce ? false : { pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.65, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.g
              className="anomaly-trajectory__marker"
              initial={reduce ? false : { opacity: 0, scale: 0.65 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1.05, duration: 0.5 }}
            >
              <circle cx="480" cy="202" r="8" />
              <circle cx="480" cy="202" r="19" className="pulse-ring" />
              <path d="M480 180 L480 128 L590 128" />
              <text x="600" y="125">ANOMALÍA DETECTADA</text>
            </motion.g>
            <g className="anomaly-trajectory__delta">
              <text x="804" y="31" textAnchor="end">+24%</text>
              <text x="804" y="69" textAnchor="end">EN 48 HORAS</text>
            </g>
            <g className="anomaly-trajectory__axis">
              <text x="48" y="334">INICIO DEL PERIODO</text>
              <text x="812" y="334" textAnchor="end">AHORA</text>
            </g>
          </svg>
        </motion.figure>

        <motion.div
          className="anomaly-message"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.65 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <p>No es crítico. <strong>Es inusual.</strong> Y esa diferencia importa.</p>
          <span>{anomaly.insight}</span>
          <button id="btn-understand-anomaly" className="briefing-action briefing-action--violet" onClick={onUnderstand}>
            Entender qué pasó <ArrowRight aria-hidden="true" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};
