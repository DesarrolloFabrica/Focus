import React, { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Activity,
  ArrowRight,
  CircleHelp,
  Clock3,
  FileText,
  ShieldCheck,
  Target,
  TrendingUp,
  Truck,
  Users,
  Workflow,
} from 'lucide-react';
import { FocusPriority, FocusPriorityVisualization } from '../../types/focus';
import { ChapterEyebrow } from '../briefing/ChapterEyebrow';
import { FocusCore } from '../core/FocusCore';

interface PrioritySectionProps {
  priority: FocusPriority;
  onInvestigate: () => void;
  onOpenWhy: () => void;
}

interface ChartPoint {
  x: number;
  y: number;
  label: string;
  value: number;
  displayValue: string;
}

const chart = { width: 790, height: 250, left: 38, right: 748, top: 42, bottom: 205 };
const areaIcons = [Workflow, Truck, FileText, Users, ShieldCheck];
const reasonIcons = [Target, TrendingUp, Clock3, Activity];

const parseMetric = (metric: string) => {
  const parsed = Number.parseFloat(metric.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
};

const fallbackVisualization = (priority: FocusPriority): FocusPriorityVisualization => {
  const usual = parseMetric(priority.usualMetric);
  const current = parseMetric(priority.currentMetric);
  const distance = current - usual;

  return {
    metricLabel: 'Indicador principal',
    currentStateLabel: 'Situación actual',
    inflectionLabel: 'Inicio del cambio',
    trendDirection: distance > 0 ? 'up' : distance < 0 ? 'down' : 'stable',
    trendLabel: distance > 0 ? 'En aumento' : distance < 0 ? 'En descenso' : 'Sin cambios',
    trendSummary: priority.startedTimeAgo,
    trendPoints: [0, 0.06, 0.2, 0.42, 0.68, 1].map((progress, index) => {
      const value = usual + distance * progress;
      return {
        label: index === 5 ? 'Hoy' : `−${5 - index} d`,
        value,
        displayValue: index === 5 ? priority.currentMetric : value.toFixed(1),
      };
    }),
    inflectionIndex: 2,
    affectedAreas: priority.keyCases.slice(0, 5).map((item) => ({
      id: item.id,
      label: item.name,
      currentMetric: item.delayTime,
      usualMetric: item.owner,
      deltaPercentage: item.impactScore,
    })),
  };
};

const smoothPath = (points: ChartPoint[]) => {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[index - 1] ?? points[index];
    const current = points[index];
    const next = points[index + 1];
    const afterNext = points[index + 2] ?? next;
    const controlOneX = current.x + (next.x - previous.x) / 6;
    const controlOneY = current.y + (next.y - previous.y) / 6;
    const controlTwoX = next.x - (afterNext.x - current.x) / 6;
    const controlTwoY = next.y - (afterNext.y - current.y) / 6;
    path += ` C ${controlOneX} ${controlOneY}, ${controlTwoX} ${controlTwoY}, ${next.x} ${next.y}`;
  }
  return path;
};

export const PrioritySection: React.FC<PrioritySectionProps> = ({ priority, onInvestigate, onOpenWhy }) => {
  const reduce = !!useReducedMotion();
  const visualization = priority.visualization ?? fallbackVisualization(priority);
  const [activePoint, setActivePoint] = useState(visualization.trendPoints.length - 1);
  const [activeArea, setActiveArea] = useState<number | null>(0);

  useEffect(() => {
    setActivePoint(Math.max(0, visualization.trendPoints.length - 1));
    setActiveArea(visualization.affectedAreas.length > 0 ? 0 : null);
  }, [priority.id, visualization.affectedAreas.length, visualization.trendPoints.length]);

  const points = useMemo<ChartPoint[]>(() => {
    const values = visualization.trendPoints.map((point) => point.value);
    const minimum = Math.min(...values);
    const maximum = Math.max(...values);
    const range = Math.max(maximum - minimum, 1);
    const paddedMinimum = minimum - range * 0.16;
    const paddedMaximum = maximum + range * 0.13;

    return visualization.trendPoints.map((point, index) => ({
      x:
        visualization.trendPoints.length === 1
          ? (chart.left + chart.right) / 2
          : chart.left + ((chart.right - chart.left) * index) / (visualization.trendPoints.length - 1),
      y:
        chart.bottom -
        ((point.value - paddedMinimum) / Math.max(paddedMaximum - paddedMinimum, 1)) * (chart.bottom - chart.top),
      label: point.label,
      value: point.value,
      displayValue: point.displayValue ?? String(point.value),
    }));
  }, [visualization.trendPoints]);

  const linePath = useMemo(() => smoothPath(points), [points]);
  const areaPath = points.length > 0 ? `${linePath} L ${points.at(-1)?.x} ${chart.bottom} L ${points[0].x} ${chart.bottom} Z` : '';
  const safeActivePoint = Math.min(Math.max(activePoint, 0), Math.max(points.length - 1, 0));
  const inspectedPoint = points[safeActivePoint];
  const inflectionIndex = Math.min(Math.max(visualization.inflectionIndex, 0), Math.max(points.length - 1, 0));
  const inflectionPoint = points[inflectionIndex];
  const usualValue = parseMetric(priority.usualMetric);
  const graphValues = visualization.trendPoints.map((point) => point.value);
  const graphMin = Math.min(...graphValues);
  const graphMax = Math.max(...graphValues);
  const graphRange = Math.max(graphMax - graphMin, 1);
  const baselineY = chart.bottom - ((usualValue - (graphMin - graphRange * 0.16)) / (graphRange * 1.29)) * (chart.bottom - chart.top);

  const handleGraphPointer = (event: React.PointerEvent<SVGSVGElement>) => {
    if (points.length < 2) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
    setActivePoint(Math.round(ratio * (points.length - 1)));
  };

  return (
    <section id="section-chapter-priority" className="briefing-chapter briefing-chapter--priority">
      <div className="briefing-chapter__inner priority-immersive">
        <ChapterEyebrow number="01 / 05" label="Prioridad" tone="coral" />

        <div className="priority-hero-grid">
          <motion.header
            className="priority-copy"
            initial={reduce ? false : { opacity: 0, x: -26 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.55 }}
            transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="briefing-kicker">{priority.title}</p>
            <h2 id="priority-heading" tabIndex={-1} className="briefing-title">{priority.headline}</h2>
            <p className="briefing-lede">{priority.description}</p>
          </motion.header>

          <motion.div
            className="priority-trajectory"
            initial={reduce ? false : { opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.82, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="priority-trajectory__context" aria-live="polite">
              <span>{safeActivePoint === points.length - 1 ? visualization.currentStateLabel : inspectedPoint?.label ?? 'Hoy'}</span>
              <strong>{inspectedPoint?.displayValue ?? priority.currentMetric}</strong>
              <small>{inspectedPoint?.label ?? 'Hoy'} · {visualization.metricLabel}</small>
            </div>
            <svg
              viewBox={`0 0 ${chart.width} ${chart.height}`}
              role="img"
              aria-label={`Evolución de ${visualization.metricLabel}: de ${priority.usualMetric} a ${priority.currentMetric}`}
              onPointerMove={handleGraphPointer}
              onPointerLeave={() => setActivePoint(Math.max(0, points.length - 1))}
            >
              <defs>
                <linearGradient id="priority-immersive-stroke" x1="0" x2="1">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="42%" stopColor="#818cf8" />
                  <stop offset="72%" stopColor="#f472b6" />
                  <stop offset="100%" stopColor="#fb4668" />
                </linearGradient>
                <linearGradient id="priority-immersive-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fb4668" stopOpacity=".29" />
                  <stop offset="48%" stopColor="#8b5cf6" stopOpacity=".12" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                </linearGradient>
                <filter id="priority-immersive-glow">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>

              <g className="priority-trajectory__threads" aria-hidden="true">
                {[18, 30, 45, 61, 78].map((offset) => (
                  <motion.path
                    key={offset}
                    d={linePath}
                    fill="none"
                    stroke="url(#priority-immersive-stroke)"
                    strokeWidth="1"
                    initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 0.08 + offset / 700 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: 0.1 + offset / 500 }}
                    transform={`translate(0 ${offset / 10})`}
                  />
                ))}
              </g>
              <line className="priority-trajectory__baseline" x1={chart.left} x2={chart.right} y1={baselineY} y2={baselineY} />
              <text className="priority-trajectory__usual-label" x={chart.left} y={baselineY - 9}>COMPORTAMIENTO HABITUAL · {priority.usualMetric}</text>
              {inflectionPoint && (
                <g className="priority-trajectory__inflection">
                  <line x1={inflectionPoint.x} x2={inflectionPoint.x} y1={chart.top - 4} y2={chart.bottom + 15} />
                  <text x={inflectionPoint.x + 10} y={chart.top + 7}>PUNTO DE INFLEXIÓN</text>
                  <text x={inflectionPoint.x + 10} y={chart.top + 24}>{visualization.inflectionLabel}</text>
                </g>
              )}
              <motion.path
                d={areaPath}
                fill="url(#priority-immersive-area)"
                initial={reduce ? false : { opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.5 }}
              />
              <motion.path
                d={linePath}
                fill="none"
                stroke="url(#priority-immersive-stroke)"
                strokeWidth="4"
                strokeLinecap="round"
                filter="url(#priority-immersive-glow)"
                initial={reduce ? false : { pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 1.65, ease: [0.16, 1, 0.3, 1] }}
              />

              {points.map((point, index) => (
                <g key={`${point.label}-${index}`} className={index === safeActivePoint ? 'is-active' : ''}>
                  <line className="priority-trajectory__probe" x1={point.x} x2={point.x} y1={point.y} y2={chart.bottom + 4} />
                  <motion.circle
                    cx={point.x}
                    cy={point.y}
                    r={index === safeActivePoint ? 6.5 : 3.2}
                    initial={reduce ? false : { opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.26 + index * 0.12, duration: 0.38 }}
                  />
                  <text className="priority-trajectory__day" x={point.x} y={chart.height - 12} textAnchor="middle">{point.label}</text>
                </g>
              ))}
            </svg>
          </motion.div>

          <motion.aside
            className="priority-core-stage"
            initial={reduce ? false : { opacity: 0, x: 28, scale: 0.82 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            aria-label="FOCUS muestra el asunto prioritario"
          >
            <span className="priority-core-stage__label"><Activity aria-hidden="true" /> Asunto prioritario</span>
            <div className="priority-core-stage__orb">
              <FocusCore size="medium" state="attention" interactive variant="orb" />
            </div>
            <p>FOCUS lo colocó primero por su nivel de impacto, deterioro y persistencia.</p>
          </motion.aside>
        </div>

        <motion.div
          className="priority-metric-band"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: 0.7, delay: 0.18 }}
          aria-label="Resumen de la prioridad"
        >
          <span><small>Variación</small><strong className="is-critical">{priority.deltaPercentage > 0 ? '+' : ''}{priority.deltaPercentage}%</strong><em>Frente al comportamiento habitual</em></span>
          <span><small>Persistencia</small><strong>{priority.explanation.persistence}</strong><em>{priority.startedTimeAgo}</em></span>
          <span><small>Impacto</small><strong>{priority.affectedCount}</strong><em>{priority.affectedUnit}</em></span>
          <span className="priority-metric-band__radar" aria-hidden="true"><i /><i /><i /><b /></span>
          <span><small>Tendencia</small><strong className="is-critical">{visualization.trendLabel}</strong><em>{visualization.trendSummary}</em></span>
        </motion.div>

        <div className="priority-detail-grid">
          <motion.div
            className="priority-areas"
            initial={reduce ? false : { opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.75, delay: 0.22 }}
          >
            <div className="priority-areas__heading">
              <strong>Áreas más afectadas</strong>
              <span>{priority.affectedCount} {priority.affectedUnit}</span>
            </div>
            <div className="priority-area-list">
              {visualization.affectedAreas.map((area, index) => {
                const Icon = areaIcons[index % areaIcons.length];
                const isActive = activeArea === index;
                return (
                  <button
                    key={area.id}
                    type="button"
                    className={`priority-area-card ${isActive ? 'is-active' : ''}`}
                    onMouseEnter={() => setActiveArea(index)}
                    onFocus={() => setActiveArea(index)}
                    onClick={() => setActiveArea(index)}
                    aria-pressed={isActive}
                  >
                    <span className="priority-area-card__delta">+{area.deltaPercentage}%</span>
                    <svg className="priority-area-card__spark" viewBox="0 0 54 24" aria-hidden="true">
                      <path d="M1 21 L10 18 L17 19 L25 13 L32 16 L40 9 L46 11 L53 3" />
                    </svg>
                    <span className="priority-area-card__signal"><Icon aria-hidden="true" /></span>
                    <strong>{area.label}</strong>
                    <b>{area.currentMetric}</b>
                    <small>vs. {area.usualMetric}</small>
                  </button>
                );
              })}
            </div>
          </motion.div>

          <motion.aside
            className="priority-reasons"
            initial={reduce ? false : { opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.78, delay: 0.28 }}
          >
            <strong>¿Por qué es prioridad?</strong>
            <div>
              {priority.reasons.map((reason, index) => {
                const Icon = reasonIcons[index % reasonIcons.length];
                return (
                  <span key={`${reason.number}-${reason.label}`}>
                    <i><Icon aria-hidden="true" /></i>
                    <p><b>{reason.label}</b>{reason.detail}</p>
                  </span>
                );
              })}
            </div>
          </motion.aside>
        </div>

        <motion.div
          className="briefing-actions priority-actions"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.3 }}
        >
          <button id="btn-investigate-priority" className="briefing-action briefing-action--primary" onClick={onInvestigate}>
            Investigar prioridad <ArrowRight aria-hidden="true" />
          </button>
          <button id="btn-why-priority" className="briefing-action briefing-action--quiet" onClick={onOpenWhy}>
            <CircleHelp aria-hidden="true" /> ¿Por qué FOCUS la priorizó?
          </button>
        </motion.div>
      </div>
    </section>
  );
};
