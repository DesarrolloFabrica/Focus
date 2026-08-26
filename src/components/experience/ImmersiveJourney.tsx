import React, { createContext, useContext, useMemo, useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import {
  Activity,
  ArrowRight,
  Check,
  Clock3,
  Eye,
  Gauge,
  MessageSquareText,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import focusObservatory from '../../assets/focus-observatory.png';
import focusPriorityBeacon from '../../assets/focus-priority-beacon.png';
import signalLandscape from '../../assets/focus-signal-landscape.png';
import { FocusBriefing } from '../../types/focus';

export const IntroScrollContext = createContext<React.RefObject<HTMLDivElement | null>>({ current: null });

export interface JourneyChapter {
  id: string;
  label: string;
  shortLabel: string;
}

export const getJourneyChapters = (briefing: FocusBriefing): JourneyChapter[] => {
  const shared: JourneyChapter[] = [
    { id: 'panorama', label: 'Panorama general', shortLabel: 'Panorama' },
  ];

  if (briefing.scenario !== 'stable') {
    shared.push(
      { id: 'priority', label: 'Prioridad principal', shortLabel: 'Prioridad' },
      { id: 'why', label: 'Por qué importa', shortLabel: 'Por qué' },
    );
  }

  shared.push({ id: 'changes', label: 'Qué cambió', shortLabel: 'Cambios' });

  if (briefing.scenario !== 'stable') {
    shared.push({ id: 'anomaly', label: 'Fuera de lo habitual', shortLabel: 'Anomalía' });
  }

  shared.push(
    { id: 'stability', label: 'Cobertura estable', shortLabel: 'Cobertura' },
    { id: 'summary', label: 'Síntesis', shortLabel: 'Síntesis' },
  );

  return shared;
};

interface ImmersiveJourneyProps {
  briefing: FocusBriefing;
  isComplete: boolean;
  onActiveSection: (id: string) => void;
  onFinalReached: () => void;
  onOpenAsk: () => void;
  onInvestigate: () => void;
  onReset: () => void;
}

interface SceneShellProps {
  id: string;
  className: string;
  onActive: (id: string) => void;
  children: React.ReactNode;
}

const SceneShell: React.FC<SceneShellProps> = ({ id, className, onActive, children }) => {
  const scrollRoot = useContext(IntroScrollContext);

  return (
    <motion.section
      id={`briefing-${id}`}
      className={className}
      onViewportEnter={() => onActive(id)}
      viewport={{ amount: 0.32, root: scrollRoot }}
    >
      {children}
    </motion.section>
  );
};

const SceneLabel: React.FC<{ index: number; total: number; children: React.ReactNode; light?: boolean }> = ({
  index,
  total,
  children,
  light = false,
}) => (
  <div className={`iv-scene-label ${light ? 'is-light' : ''}`}>
    <span>{String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
    <i />
    <strong>{children}</strong>
  </div>
);

const ContinueButton: React.FC<{ target: string; label?: string; light?: boolean }> = ({
  target,
  label = 'Continuar',
  light = false,
}) => (
  <button
    type="button"
    className={`iv-continue ${light ? 'is-light' : ''}`}
    onClick={() => document.getElementById(`briefing-${target}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
  >
    <span>{label}</span>
    <ArrowRight aria-hidden="true" />
  </button>
);

const stableAreaNames = [
  'Admisiones',
  'Validación',
  'Asignación',
  'Control',
  'Archivo',
  'Entrega',
  'Calidad',
  'Documentación',
  'Seguimiento',
  'Cierre',
  'Planeación',
  'Servicio',
];

export const ImmersiveJourney: React.FC<ImmersiveJourneyProps> = ({
  briefing,
  isComplete,
  onActiveSection,
  onFinalReached,
  onOpenAsk,
  onInvestigate,
  onReset,
}) => {
  const reduceMotion = !!useReducedMotion();
  const chapters = useMemo(() => getJourneyChapters(briefing), [briefing]);
  const chapterIndex = (id: string) => Math.max(0, chapters.findIndex((chapter) => chapter.id === id));
  const nextAfter = (id: string) => chapters[Math.min(chapterIndex(id) + 1, chapters.length - 1)]?.id ?? 'summary';
  const priority = briefing.mainPriority;

  const changesRef = useRef<HTMLElement>(null);
  const scrollRoot = useContext(IntroScrollContext);
  const { scrollYProgress: changesProgress } = useScroll({
    target: changesRef,
    container: scrollRoot,
    offset: ['start end', 'end start'],
  });
  const landscapeY = useTransform(changesProgress, [0, 1], reduceMotion ? ['0%', '0%'] : ['-4%', '6%']);
  const landscapeScale = useTransform(changesProgress, [0, 1], reduceMotion ? [1, 1] : [1.08, 1]);

  const stablePanorama = briefing.scenario === 'stable';
  const panoramaCards = [
    {
      id: 'priority',
      label: 'Asuntos priorizados',
      value: briefing.dimensions.prioritiesCount,
      detail: briefing.dimensions.prioritiesSummary,
      icon: Gauge,
      emphasis: !stablePanorama,
    },
    {
      id: 'changes',
      label: 'Cambios relevantes',
      value: briefing.dimensions.changesCount,
      detail: briefing.dimensions.changesSummary,
      icon: TrendingUp,
      emphasis: false,
    },
    {
      id: 'anomaly',
      label: 'Patrones inusuales',
      value: briefing.dimensions.anomaliesCount,
      detail: briefing.dimensions.anomaliesSummary,
      icon: Radar,
      emphasis: false,
    },
    {
      id: 'coverage',
      label: 'Áreas verificadas',
      value: briefing.dimensions.stableCount,
      detail: briefing.dimensions.stableSummary,
      icon: ShieldCheck,
      emphasis: stablePanorama,
    },
  ];
  const panoramaNextTarget = nextAfter('panorama');
  const panoramaCtaLabel = stablePanorama ? 'Ver qué cambió' : 'Ver lo prioritario';

  const stabilityAreas = stableAreaNames.slice(0, Math.min(briefing.dimensions.stableCount, stableAreaNames.length));

  return (
    <div className="iv-journey">
      <SceneShell id="panorama" className="iv-scene iv-panorama" onActive={onActiveSection}>
        <div className="iv-shell iv-panorama__layout">
          <div className="iv-panorama__main">
            <div className="iv-panorama__intro">
              <SceneLabel index={chapterIndex('panorama')} total={chapters.length} light>Panorama general</SceneLabel>

              <motion.div
                className="iv-panorama__headline"
                initial={reduceMotion ? false : { opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              >
                <h2>
                  FOCUS reduce tu operación<br />
                  a <span>cuatro señales claras.</span>
                </h2>
                <p className="iv-panorama__lede">
                  {briefing.summarySentence}
                </p>
              </motion.div>

              <div className="iv-panorama__actions">
                <ContinueButton target={panoramaNextTarget} label={panoramaCtaLabel} />
                <div className="iv-panorama__meta">
                  <span><Check aria-hidden="true" /><strong>100%</strong> analizada</span>
                  <span><Clock3 aria-hidden="true" /><strong>{briefing.estimatedReadTime}</strong></span>
                </div>
              </div>
            </div>

            <div className="iv-panorama__grid" role="list">
              {panoramaCards.map(({ id, label, value, detail, icon: Icon, emphasis }, index) => (
                  <motion.article
                    className={`iv-panorama-card${emphasis ? ' is-emphasis' : ''}`}
                    key={id}
                    role="listitem"
                    aria-label={`${label}: ${value}. ${detail}`}
                    initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.55, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="iv-panorama-card__orb" aria-hidden="true" />
                    <div className="iv-panorama-card__top">
                      <span className="iv-panorama-card__icon"><Icon aria-hidden="true" /></span>
                      <h3>{label}</h3>
                    </div>
                    <p className="iv-panorama-card__detail">{detail}</p>
                  </motion.article>
              ))}
            </div>
          </div>

          <motion.aside
            className="iv-panorama__stage"
            initial={reduceMotion ? false : { opacity: 0, x: 28, scale: 0.98 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            aria-hidden="true"
          >
            <div className="iv-panorama__stage-glow" />
            <div className="iv-panorama__stage-frame">
              <img src={focusObservatory} alt="" />
            </div>
            <span className="iv-panorama__live"><i /> FOCUS / LIVE</span>
          </motion.aside>
        </div>
      </SceneShell>

      {briefing.scenario !== 'stable' && (
        <>
          <SceneShell id="priority" className="iv-scene iv-priority" onActive={onActiveSection}>
            <div className="iv-priority__glow" aria-hidden="true" />
            <div className="iv-shell iv-priority__layout">
              <div className="iv-priority__lead">
                <SceneLabel index={chapterIndex('priority')} total={chapters.length} light>
                  Prioridad principal
                </SceneLabel>

                <motion.div
                  className="iv-priority__copy"
                  initial={reduceMotion ? false : { opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                >
                  <p>{priority.title}</p>
                  <h2>{priority.headline}</h2>
                </motion.div>

                <motion.figure
                  className="iv-priority__figure"
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="iv-priority__figure-glow" aria-hidden="true" />
                  <div className="iv-priority__figure-frame">
                    <img src={focusPriorityBeacon} alt="" />
                  </div>
                  <figcaption className="iv-priority__figure-cap">
                    <div>
                      <small>Señal activa</small>
                      <strong>{priority.currentMetric}</strong>
                    </div>
                    <span className={priority.deltaPercentage > 0 ? 'is-up' : 'is-down'}>
                      {priority.deltaPercentage > 0 ? '+' : ''}{priority.deltaPercentage}%
                    </span>
                  </figcaption>
                </motion.figure>

                <ContinueButton target="why" label="Entender por qué" light />
              </div>

              <motion.div
                className="iv-priority__panel"
                initial={reduceMotion ? false : { opacity: 0, x: 28 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.8, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="iv-priority__panel-kicker">
                  {priority.description}
                </p>

                <div className="iv-priority__cards">
                  <article className="iv-priority-card">
                    <span>01</span>
                    <h3>situación actual</h3>
                    <p>
                      El indicador opera en <b>{priority.currentMetric}</b>, lejos del ritmo que esta operación suele sostener.
                    </p>
                  </article>

                  <article className="iv-priority-card">
                    <span>02</span>
                    <h3>referencia habitual</h3>
                    <p>
                      El comportamiento esperado se mantiene cerca de <b>{priority.usualMetric}</b>. Ese contraste define la prioridad.
                    </p>
                  </article>

                  <article className="iv-priority-card iv-priority-card--wide">
                    <span>lectura de focus</span>
                    <p>
                      FOCUS elevó este asunto porque concentra <b>{priority.affectedCount} {priority.affectedUnit}</b>,
                      con un deterioro de <b>{priority.deltaPercentage > 0 ? '+' : ''}{priority.deltaPercentage}%</b> frente
                      a lo habitual. {priority.startedTimeAgo}{' '}
                      {priority.explanation.summaryText}
                    </p>
                    <div className="iv-priority-card__meta">
                      <div>
                        <small>Impacto</small>
                        <strong>{priority.explanation.impact}</strong>
                      </div>
                      <div>
                        <small>Persistencia</small>
                        <strong>{priority.explanation.persistence}</strong>
                      </div>
                      <div>
                        <small>Relevancia</small>
                        <strong>{priority.explanation.relevance}</strong>
                      </div>
                    </div>
                  </article>
                </div>
              </motion.div>
            </div>
          </SceneShell>

          <SceneShell id="why" className="iv-scene iv-why" onActive={onActiveSection}>
            <div className="iv-shell">
              <SceneLabel index={chapterIndex('why')} total={chapters.length}>Por qué importa</SceneLabel>
              <motion.header
                className="iv-why__heading"
                initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.75 }}
              >
                <p>No fue una sola métrica.</p>
                <h2>Cuatro señales convergen<br />en una misma decisión.</h2>
              </motion.header>

              <div className="iv-why__rail">
                {priority.reasons.slice(0, 4).map((reason, index) => (
                  <motion.article
                    key={`${reason.number}-${reason.label}`}
                    initial={reduceMotion ? false : { opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.45 }}
                    transition={{ duration: 0.58, delay: index * 0.1 }}
                  >
                    <span>{reason.number}</span>
                    <div className="iv-why__node"><i /></div>
                    <small>{reason.label}</small>
                    <strong>{index === 0 ? priority.affectedCount : index === 1 ? `${priority.deltaPercentage > 0 ? '+' : ''}${priority.deltaPercentage}%` : index === 2 ? priority.explanation.persistence : 'P1'}</strong>
                    <p>{reason.detail}</p>
                  </motion.article>
                ))}
              </div>

              <motion.div
                className="iv-why__conclusion"
                initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.45 }}
                transition={{ duration: 0.8 }}
              >
                <div className="iv-why__mark"><span>F</span><i /><i /><i /></div>
                <blockquote>
                  “{priority.explanation.summaryText}”
                  <footer>Lectura contextual de FOCUS</footer>
                </blockquote>
                <div><small>Score de atención</small><strong>{priority.explanation.impact === 'Crítico' ? '94' : '87'}<span>/100</span></strong></div>
              </motion.div>

              <div className="iv-scene-footer">
                <p>La prioridad ya está explicada. Ahora veamos qué se movió alrededor.</p>
                <ContinueButton target={nextAfter('why')} label="Ver qué cambió" />
              </div>
            </div>
          </SceneShell>
        </>
      )}

      <motion.section
        ref={changesRef}
        id="briefing-changes"
        className="iv-scene iv-changes"
        onViewportEnter={() => onActiveSection('changes')}
        viewport={{ amount: 0.3 }}
      >
        <motion.div className="iv-changes__image" style={{ y: landscapeY, scale: landscapeScale }} aria-hidden="true">
          <img src={signalLandscape} alt="" />
        </motion.div>
        <div className="iv-changes__veil" aria-hidden="true" />
        <div className="iv-shell iv-changes__content">
          <SceneLabel index={chapterIndex('changes')} total={chapters.length} light>Qué cambió</SceneLabel>
          <motion.header
            className="iv-changes__heading"
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.75 }}
          >
            <p>Tu última visita → ahora</p>
            <h2>Mucho cambió.<br /><span>Poco merece quedarse.</span></h2>
          </motion.header>

          <div className="iv-changes__dashboard">
            <motion.div
              className="iv-change-filter-card"
              initial={reduceMotion ? false : { opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7 }}
            >
              <div className="iv-change-filter-card__head">
                <span><Sparkles aria-hidden="true" /> Filtro de relevancia</span>
                <small>FOCUS / LIVE</small>
              </div>
              <div className="iv-change-filter-card__numbers">
                <div><strong>{briefing.changes.newItemsCount}</strong><span>señales nuevas</span></div>
                <i><ArrowRight aria-hidden="true" /></i>
                <div className="is-relevant"><strong>{briefing.changes.relevantChangesCount}</strong><span>cambios relevantes</span></div>
              </div>
              <div className="iv-change-filter-card__flow" aria-hidden="true">
                {Array.from({ length: 22 }).map((_, index) => <i key={index} style={{ '--i': index } as React.CSSProperties} />)}
                <span />
              </div>
              <p>FOCUS descartó lo resuelto, agrupó duplicados y dejó visible solo lo que cambia una decisión.</p>
            </motion.div>

            <motion.div
              className="iv-change-events-card"
              initial={reduceMotion ? false : { opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.38 }}
              transition={{ duration: 0.7, delay: 0.08 }}
            >
              <div className="iv-change-events-card__head">
                <div><small>Señal condensada</small><strong>Lo que debes conservar</strong></div>
                <span>{String(briefing.changes.relevantChangesCount).padStart(2, '0')}</span>
              </div>
              <div className="iv-change-events-card__list">
                {briefing.changes.events.slice(0, 4).map((event, index) => (
                  <article key={`${event.time}-${event.title}`}>
                    <span>{event.time}</span>
                    <i className={`is-${event.category}`} />
                    <p>{event.title}</p>
                    <b>{String(index + 1).padStart(2, '0')}</b>
                  </article>
                ))}
              </div>
              <ContinueButton target={nextAfter('changes')} label={briefing.scenario === 'stable' ? 'Ver cobertura' : 'Revisar anomalía'} light />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {briefing.scenario !== 'stable' && (
        <SceneShell id="anomaly" className="iv-scene iv-anomaly" onActive={onActiveSection}>
          <div className="iv-shell">
            <SceneLabel index={chapterIndex('anomaly')} total={chapters.length} light>Fuera de lo habitual</SceneLabel>
            <div className="iv-anomaly__layout">
              <motion.div
                className="iv-anomaly__copy"
                initial={reduceMotion ? false : { opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.45 }}
                transition={{ duration: 0.75 }}
              >
                <span className={`iv-anomaly__badge ${briefing.anomaly.isCritical ? 'is-critical' : ''}`}>
                  <Activity aria-hidden="true" /> {briefing.anomaly.isCritical ? 'Requiere atención' : 'No crítico · sí inusual'}
                </span>
                <p>{briefing.anomaly.title}</p>
                <h2>{briefing.anomaly.headline}</h2>
                <div className="iv-anomaly__quote">
                  <Eye aria-hidden="true" />
                  <span>{briefing.anomaly.insight}</span>
                </div>
              </motion.div>

              <motion.figure
                className="iv-anomaly__report"
                initial={reduceMotion ? false : { opacity: 0, y: 32, rotateY: -4 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                viewport={{ once: true, amount: 0.32 }}
                transition={{ duration: 0.85 }}
              >
                <figcaption>
                  <div><small>Análisis comparativo</small><strong>Esperado vs. observado</strong></div>
                  <span><i /> Desvío detectado</span>
                </figcaption>
                <svg viewBox="0 0 760 330" role="img" aria-label="Comparación entre la trayectoria esperada y la trayectoria observada">
                  <g className="iv-anomaly-chart__grid" aria-hidden="true">
                    {[64, 126, 188, 250].map((y) => <line key={y} x1="42" x2="718" y1={y} y2={y} />)}
                  </g>
                  <motion.path
                    className="iv-anomaly-chart__expected"
                    d="M42 92 C170 108 275 142 380 177 C512 220 602 239 718 250"
                    initial={reduceMotion ? false : { pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.25 }}
                  />
                  <motion.path
                    className="iv-anomaly-chart__actual"
                    d="M42 92 C170 108 275 142 380 177 C470 208 505 183 550 144 C604 98 654 77 718 66"
                    initial={reduceMotion ? false : { pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.45, delay: 0.12 }}
                  />
                  <g className="iv-anomaly-chart__point">
                    <circle cx="512" cy="179" r="9" />
                    <circle cx="512" cy="179" r="20" />
                    <path d="M512 153 L512 110 L638 110" />
                    <text x="648" y="106">RUPTURA DEL PATRÓN</text>
                  </g>
                  <g className="iv-anomaly-chart__labels">
                    <text x="42" y="302">INICIO</text>
                    <text x="718" y="302" textAnchor="end">AHORA</text>
                  </g>
                </svg>
                <div className="iv-anomaly__comparison">
                  <div><span>Comportamiento habitual</span><p>{briefing.anomaly.usualBehavior}</p></div>
                  <div className="is-current"><span>Comportamiento actual</span><p>{briefing.anomaly.currentBehavior}</p></div>
                </div>
              </motion.figure>
            </div>
            <div className="iv-scene-footer iv-scene-footer--dark">
              <p>La anomalía queda registrada para explorarla después del briefing.</p>
              <ContinueButton target={nextAfter('anomaly')} label="Ver lo que está estable" light />
            </div>
          </div>
        </SceneShell>
      )}

      <SceneShell id="stability" className="iv-scene iv-stability" onActive={onActiveSection}>
        <div className="iv-stability__halo" aria-hidden="true" />
        <div className="iv-shell">
          <SceneLabel index={chapterIndex('stability')} total={chapters.length}>Cobertura estable</SceneLabel>
          <div className="iv-stability__heading">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{ duration: 0.75 }}
            >
              <p>El valor de no interrumpir</p>
              <h2>{briefing.dimensions.stableCount} áreas revisadas.<br /><span>Ninguna necesita tu atención.</span></h2>
            </motion.div>
            <p>{briefing.stable.editorialNote}</p>
          </div>

          <div className="iv-stability__field">
            <motion.div
              className="iv-stability__score"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.88 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{ duration: 0.85 }}
            >
              <div><span>{briefing.dimensions.stableCount}</span><i>/ {briefing.dimensions.stableCount}</i></div>
              <strong>Cobertura verificada</strong>
              <small>Dentro de parámetros</small>
              <svg viewBox="0 0 220 220" aria-hidden="true">
                <circle cx="110" cy="110" r="96" />
                <motion.circle
                  cx="110"
                  cy="110"
                  r="96"
                  initial={reduceMotion ? false : { pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.4 }}
                />
              </svg>
            </motion.div>

            <div className="iv-stability__areas">
              {stabilityAreas.map((area, index) => (
                <motion.div
                  key={area}
                  initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.42, delay: (index % 6) * 0.05 }}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <i><Check aria-hidden="true" /></i>
                  <strong>{area}</strong>
                  <small>En rango</small>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="iv-stability__principle">
            <span>FOCUS también decide</span>
            <strong>qué no mostrarte.</strong>
            <ContinueButton target="summary" label="Cerrar el briefing" />
          </div>
        </div>
      </SceneShell>

      <motion.section
        id="briefing-summary"
        className={`iv-scene iv-summary ${isComplete ? 'is-unlocked' : ''}`}
        onViewportEnter={() => {
          onActiveSection('summary');
          onFinalReached();
        }}
        viewport={{ amount: 0.42 }}
      >
        <div className="iv-summary__aura" aria-hidden="true" />
        <div className="iv-shell">
          <SceneLabel index={chapterIndex('summary')} total={chapters.length} light>Síntesis final</SceneLabel>
          <motion.header
            className="iv-summary__heading"
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.75 }}
          >
            <div>
              <span className="iv-summary__complete-badge"><Check aria-hidden="true" /> Briefing completado</span>
              <h2>Ya tienes el contexto.<br /><span>Ahora puedes profundizar.</span></h2>
            </div>
            <p>Recorriste el estado general de la plataforma. FOCUS conserva el contexto completo para responder, comparar o abrir cualquier hallazgo.</p>
          </motion.header>

          <div className="iv-summary__grid">
            <article className="iv-summary-card iv-summary-card--priority">
              <div><span>01</span><small>Prioridad</small><Gauge aria-hidden="true" /></div>
              <strong>{briefing.scenario === 'stable' ? 'Sin asuntos críticos' : priority.title}</strong>
              <p>{briefing.scenario === 'stable' ? briefing.dimensions.prioritiesSummary : priority.headline}</p>
              <b>{briefing.dimensions.prioritiesCount}</b>
            </article>
            <article className="iv-summary-card">
              <div><span>02</span><small>Cambios</small><TrendingUp aria-hidden="true" /></div>
              <strong>{briefing.changes.relevantChangesCount} relevantes</strong>
              <p>De {briefing.changes.newItemsCount} señales nuevas analizadas.</p>
              <div className="iv-summary-card__bars"><i /><i /><i /><i /><i /></div>
            </article>
            <article className="iv-summary-card">
              <div><span>03</span><small>Anomalía</small><Radar aria-hidden="true" /></div>
              <strong>{briefing.dimensions.anomaliesCount ? 'Patrón registrado' : 'Sin anomalías'}</strong>
              <p>{briefing.dimensions.anomaliesSummary}</p>
              <div className="iv-summary-card__spark"><i /><i /><i /><i /><i /><i /></div>
            </article>
            <article className="iv-summary-card iv-summary-card--stable">
              <div><span>04</span><small>Cobertura</small><ShieldCheck aria-hidden="true" /></div>
              <strong>{briefing.dimensions.stableCount} áreas en rango</strong>
              <p>Monitoreo activo, sin interrupciones adicionales.</p>
              <span className="iv-summary-card__ok"><Check aria-hidden="true" /> Verificado</span>
            </article>
          </div>

          <motion.div
            className="iv-summary__unlock"
            initial={reduceMotion ? false : { opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, delay: 0.18 }}
          >
            <div className="iv-summary__core" aria-hidden="true">
              <i /><i /><i />
              <span>F</span>
              <b />
            </div>
            <div className="iv-summary__unlock-copy">
              <span><Sparkles aria-hidden="true" /> Contexto completo activo</span>
              <h3>FOCUS Ask está listo.</h3>
              <p>Pregunta en lenguaje natural o abre la evidencia que viste durante el briefing.</p>
            </div>
            <div className="iv-summary__actions">
              <button id="btn-open-ask-after-briefing" type="button" className="iv-primary-button" onClick={onOpenAsk} disabled={!isComplete}>
                <MessageSquareText aria-hidden="true" /> Preguntar a FOCUS
              </button>
              <button id="btn-investigate-after-briefing" type="button" className="iv-secondary-button" onClick={onInvestigate} disabled={!isComplete}>
                <Search aria-hidden="true" /> Explorar prioridad
              </button>
            </div>
          </motion.div>

          <div className="iv-summary__footer">
            <span>Lectura guiada · {briefing.completionTime}</span>
            <button type="button" onClick={onReset}>Volver al inicio</button>
          </div>
        </div>
      </motion.section>
    </div>
  );
};
