import React, { useCallback, useMemo, useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from 'motion/react';
import { CheckCircle2, ShieldCheck, Activity, Check, CheckCheck, Radio } from 'lucide-react';
import { FocusEntity } from '../../types/focus';
import { useBriefingSectionMetrics } from '../../perf';
import { useIntroScrollRoot } from './ArrivalSection';

interface StableSectionProps {
  entities: FocusEntity[];
  onContinue?: () => void;
}

const ROTATION_PATTERNS = [-2.2, 1.8, -1.2, 2.4, -1.6, 1.4, -2.0, 1.0, -1.5, 2.0, -0.8, 1.6];
const STACK_X_OFFSETS = [-14, 12, -8, 16, -10, 8, -12, 10, -6, 14, -10, 12];
const STACK_Y_OFFSETS = [8, 4, 10, 5, 12, 2, 8, 14, 1, 10, 6, 4];

interface CardPhysics {
  stackDeltaX: number;
  stackDeltaY: number;
  stackRotate: number;
  stackScale: number;
  stackOpacity: number;
  wave: 1 | 2 | 3;
}

const getEntityStateIcon = (state: string) => {
  const normalized = state.toLowerCase();
  if (normalized.includes('verific') || normalized.includes('control')) return ShieldCheck;
  if (normalized.includes('activ') || normalized.includes('seguim')) return Activity;
  if (normalized.includes('rango') || normalized.includes('balance')) return Radio;
  return CheckCircle2;
};

const getEntityStateColor = (state: string) => {
  const normalized = state.toLowerCase();
  if (normalized.includes('verific') || normalized.includes('dentro')) {
    return {
      bg: 'bg-emerald-500/15',
      border: 'border-emerald-400/30',
      text: 'text-emerald-300',
      icon: 'text-emerald-400',
    };
  }
  if (normalized.includes('activ') || normalized.includes('cambios')) {
    return {
      bg: 'bg-cyan-500/15',
      border: 'border-cyan-400/30',
      text: 'text-cyan-300',
      icon: 'text-cyan-400',
    };
  }
  return {
    bg: 'bg-teal-500/15',
    border: 'border-teal-400/30',
    text: 'text-teal-300',
    icon: 'text-teal-400',
  };
};

export const StableSection: React.FC<StableSectionProps> = ({ entities, onContinue }) => {
  const reduceMotion = !!useReducedMotion();
  const scrollRootRef = useIntroScrollRoot();
  const sectionRef = useRef<HTMLElement | null>(null);

  const rawProgress = useMotionValue(0);
  const animatedStoryProgress = useSpring(rawProgress, {
    stiffness: 240,
    damping: 28,
    mass: 0.5,
    restDelta: 0.0005,
    restSpeed: 0.002,
  });
  const storyProgress = reduceMotion ? rawProgress : animatedStoryProgress;

  useBriefingSectionMetrics(
    sectionRef,
    'stability',
    scrollRootRef?.current ?? null,
    useCallback(
      (metrics) => {
        rawProgress.set(metrics.progress);
      },
      [rawProgress],
    ),
  );

  const totalCount = entities.length;
  const numCols = totalCount >= 9 ? 5 : totalCount >= 7 ? 4 : 3;

  const cardPhysicsList: CardPhysics[] = useMemo(() => {
    const w1Count = Math.ceil(totalCount / 3);
    const w2Count = Math.ceil((totalCount - w1Count) / 2);
    const numRows = Math.ceil(totalCount / numCols);
    const centerCol = (numCols - 1) / 2;
    const centerRow = (numRows - 1) / 2;

    return entities.map((_, index) => {
      const col = index % numCols;
      const row = Math.floor(index / numCols);
      const rot = ROTATION_PATTERNS[index % ROTATION_PATTERNS.length];
      const offsetX = STACK_X_OFFSETS[index % STACK_X_OFFSETS.length];
      const offsetY = STACK_Y_OFFSETS[index % STACK_Y_OFFSETS.length];

      // Lateral delta to bring card from its grid slot to center stack
      const deltaX = (centerCol - col) * (numCols === 5 ? 245 : 320) + offsetX;

      // Vertical delta to bring card from its grid row to center stack
      const deltaY = (centerRow - row) * 115 + offsetY;

      let wave: 1 | 2 | 3 = 1;
      if (index >= w1Count + w2Count) {
        wave = 3;
      } else if (index >= w1Count) {
        wave = 2;
      }

      const depthFactor = (totalCount - index) / Math.max(1, totalCount);

      return {
        stackDeltaX: deltaX,
        stackDeltaY: deltaY,
        stackRotate: rot,
        stackScale: 0.94 + 0.04 * depthFactor,
        stackOpacity: 0.72 + 0.26 * depthFactor,
        wave,
      };
    });
  }, [totalCount, entities, numCols]);

  // Microtransition from Anomaly (0.00 - 0.12)
  const microLine1Opacity = useTransform(storyProgress, [0, 0.02, 0.07, 0.11], [1, 1, 0.8, 0]);
  const microLine1Y = useTransform(storyProgress, [0, 0.03, 0.11], [0, 0, -16]);
  const microLine2Opacity = useTransform(storyProgress, [0.01, 0.04, 0.08, 0.12], [0, 1, 1, 0]);
  const microLine2Y = useTransform(storyProgress, [0.01, 0.05, 0.12], [14, 0, -16]);

  // Cobertura Header (0.08 - 0.92)
  const headerOpacity = useTransform(storyProgress, [0.08, 0.15, 0.86, 0.92], [0, 1, 1, 0.12]);
  const headerY = useTransform(storyProgress, [0.08, 0.16, 0.86, 0.92], [22, 0, 0, -15]);

  // Ambient Halo behind stack
  const haloScale = useTransform(storyProgress, [0.05, 0.35, 0.75], [0.8, 1.25, 1.45]);
  const haloOpacity = useTransform(storyProgress, [0.05, 0.25, 0.75, 0.9], [0.15, 0.35, 0.38, 0.18]);

  // Sweep light beam across grid (0.74 - 0.84)
  const sweepX = useTransform(storyProgress, [0.74, 0.82], ['-10%', '115%']);
  const sweepOpacity = useTransform(storyProgress, [0.74, 0.76, 0.8, 0.82], [0, 0.65, 0.65, 0]);

  // Grid global container scale & dimming for conclusion (0.84 - 1.0)
  const gridContainerScale = useTransform(storyProgress, [0.84, 0.89], [1, 0.985]);
  const gridContainerOpacity = useTransform(
    storyProgress,
    [0.84, 0.89, 0.94, 1],
    [1, 0.68, 0.28, 0.08],
  );

  // Editorial Conclusion (0.84 - 0.96)
  const conclusionOpacity = useTransform(storyProgress, [0.84, 0.88, 0.93, 0.98], [0, 1, 1, 0]);
  const conclusionY = useTransform(storyProgress, [0.84, 0.88, 0.98], [28, 0, -18]);
  const conclusionScale = useTransform(storyProgress, [0.84, 0.89], [0.95, 1]);

  // Ambient lingering signals for transition (0.94 - 1.0)
  const exitGlowOpacity = useTransform(storyProgress, [0.92, 0.97, 1], [0, 0.6, 0.9]);

  return (
    <section
      ref={sectionRef}
      id="section-chapter-stability"
      className="cov-section select-none"
      data-chapter="stability"
      aria-label="05 / 07 · Cobertura: elementos observados bajo control"
    >
      <div className="cov-sticky">
        {/* Navy + Cyan + Emerald Serene Ambient */}
        <div className="cov-ambient" aria-hidden="true">
          <div className="cov-ambient__base" />
          <motion.div
            className="cov-ambient__halo"
            style={{ scale: reduceMotion ? 1 : haloScale, opacity: haloOpacity }}
          />
          <div className="cov-ambient__breath" />
        </div>

        {/* 1. Microtransition from Anomaly */}
        <motion.div
          className="cov-micro-transition"
          style={{
            display: useTransform(storyProgress, (p: number) => (p > 0.15 ? 'none' : 'block')),
          }}
          aria-hidden="true"
        >
          <motion.p
            className="cov-micro-transition__line1"
            style={{ opacity: microLine1Opacity, y: microLine1Y }}
          >
            Lo excepcional ya está claro.
          </motion.p>
          <motion.h3
            className="cov-micro-transition__line2"
            style={{ opacity: microLine2Opacity, y: microLine2Y }}
          >
            Ahora veamos todo lo que funciona como debería.
          </motion.h3>
        </motion.div>

        {/* 2. Cobertura Editorial Header */}
        <motion.header
          className="cov-header"
          style={{ opacity: reduceMotion ? 1 : headerOpacity, y: reduceMotion ? 0 : headerY }}
        >
          <div className="cov-badge">
            <span className="cov-badge__num">05 / 07</span>
            <div className="cov-badge__dot" />
            <strong className="cov-badge__title">Cobertura</strong>
          </div>

          <h2 className="cov-headline">Lo que puedes dejar tranquilo.</h2>
          <p className="cov-subheadline">FOCUS también revisó el resto del panorama.</p>
          <span className="cov-microtext">
            {totalCount} elementos fueron verificados. Ninguno necesita tu atención.
          </span>
        </motion.header>

        {/* 3. Interactive Unfold Stage & 3-Wave Grid */}
        <div className="cov-stage">
          <motion.div
            className="cov-grid-wrapper"
            style={{
              scale: reduceMotion ? 1 : gridContainerScale,
              opacity: reduceMotion ? 1 : gridContainerOpacity,
            }}
          >
            {/* Sweep light validation beam */}
            {!reduceMotion && (
              <motion.div
                className="cov-sweep"
                style={{
                  left: sweepX,
                  opacity: sweepOpacity,
                }}
                aria-hidden="true"
              />
            )}

            <div
              className={`cov-grid ${
                numCols === 5 ? 'cov-grid--5-cols' : numCols === 4 ? 'cov-grid--4-cols' : 'cov-grid--3-cols'
              }`}
              role="list"
              aria-label="Elementos bajo observación estable"
            >
              {entities.map((entity, index) => {
                const physics = cardPhysicsList[index] ?? {
                  stackDeltaX: 0,
                  stackDeltaY: 0,
                  stackRotate: 0,
                  stackScale: 1,
                  stackOpacity: 1,
                  wave: 1,
                };
                return (
                  <UnfoldCard
                    key={entity.id}
                    entity={entity}
                    index={index}
                    physics={physics}
                    storyProgress={storyProgress}
                    reduceMotion={reduceMotion}
                  />
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* 4. Editorial Conclusion: 'FOCUS también decide qué no mostrarte' */}
        <motion.div
          className="cov-conclusion"
          style={{
            opacity: reduceMotion ? 1 : conclusionOpacity,
            y: reduceMotion ? 0 : conclusionY,
            scale: reduceMotion ? 1 : conclusionScale,
            pointerEvents: useTransform(storyProgress, (p: number) =>
              p >= 0.84 && p <= 0.94 ? 'auto' : 'none',
            ),
          }}
          aria-label="Conclusión editorial de cobertura"
        >
          <div className="cov-conclusion__badge">
            <CheckCheck className="w-3.5 h-3.5" />
            <span>{totalCount} ELEMENTOS REVISADOS</span>
          </div>
          <h3 className="cov-conclusion__headline">FOCUS también decide qué no mostrarte.</h3>
          <p className="cov-conclusion__sub">
            Ninguno de estos puntos requiere tu intervención hoy.
          </p>
          <div className="cov-conclusion__chips">
            <span className="cov-conclusion__chip">COVERAGE / 100%</span>
            <span className="cov-conclusion__chip">
              {totalCount} / {totalCount} VERIFIED
            </span>
            <span className="cov-conclusion__chip">NO ACTION REQUIRED</span>
          </div>
        </motion.div>

        {/* 5. Serene Ambient Exit with Micro-signals */}
        <motion.div
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
          style={{ opacity: reduceMotion ? 0 : exitGlowOpacity }}
          aria-hidden="true"
        >
          <div className="w-[540px] h-[360px] rounded-full bg-emerald-500/10 blur-[100px]" />
          <div className="w-[420px] h-[300px] rounded-full bg-cyan-500/10 blur-[90px]" />
        </motion.div>
      </div>
    </section>
  );
};

interface UnfoldCardProps {
  entity: FocusEntity;
  index: number;
  physics: CardPhysics;
  storyProgress: MotionValue<number>;
  reduceMotion: boolean;
}

const UnfoldCard: React.FC<UnfoldCardProps> = React.memo(
  ({ entity, index, physics, storyProgress, reduceMotion }) => {
    const [isHovered, setIsHovered] = useState(false);
    const StateIcon = getEntityStateIcon(entity.state);
    const stateStyle = getEntityStateColor(entity.state);

    // Wave Intervals mapping
    let waveStart = 0.22;
    let waveEnd = 0.38;

    if (physics.wave === 2) {
      waveStart = 0.42;
      waveEnd = 0.58;
    } else if (physics.wave === 3) {
      waveStart = 0.62;
      waveEnd = 0.76;
    }

    // Unfold Transforms: stack position -> grid position (0, 0, 0, 1, 1)
    // Add an organic curved flight trajectory
    const cardX = useTransform(
      storyProgress,
      [0, waveStart, (waveStart + waveEnd) / 2, waveEnd],
      [physics.stackDeltaX, physics.stackDeltaX, physics.stackDeltaX * 0.35, 0],
    );

    const cardY = useTransform(
      storyProgress,
      [0, waveStart, (waveStart + waveEnd) / 2, waveEnd],
      [physics.stackDeltaY, physics.stackDeltaY, physics.stackDeltaY * 0.5 - 14, 0],
    );

    const cardRotate = useTransform(
      storyProgress,
      [0, waveStart, waveEnd],
      [physics.stackRotate, physics.stackRotate, 0],
    );

    const cardScale = useTransform(
      storyProgress,
      [0, waveStart, waveEnd],
      [physics.stackScale, physics.stackScale, 1],
    );

    const cardOpacity = useTransform(
      storyProgress,
      [0, waveStart, waveEnd],
      [physics.stackOpacity, physics.stackOpacity, 1],
    );

    // Dynamic verification state indicator
    const isVerifiedValue = useTransform(storyProgress, (p: number) => p >= waveEnd - 0.03);
    const [isVerified, setIsVerified] = useState(false);

    React.useEffect(() => {
      return isVerifiedValue.on('change', (val) => setIsVerified(val));
    }, [isVerifiedValue]);

    // Check icon stagger ripple at conclusion beat (0.76 - 0.82)
    const staggerOffset = index * 0.002;
    const checkGlow = useTransform(
      storyProgress,
      [0.75 + staggerOffset, 0.78 + staggerOffset, 0.81 + staggerOffset],
      [0.85, 1, 0.9],
    );

    return (
      <motion.article
        role="listitem"
        className="cov-card group"
        style={{
          x: reduceMotion ? 0 : cardX,
          y: reduceMotion ? 0 : cardY,
          rotate: reduceMotion ? 0 : cardRotate,
          scale: reduceMotion ? 1 : cardScale,
          opacity: reduceMotion ? 1 : cardOpacity,
          zIndex: 30 - index,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="cov-card__specular" />

        <div className="cov-card__header">
          <div className="cov-card__label-group">
            <motion.div
              className="cov-card__icon"
              style={{ scale: isVerified ? 1 : 0.92, opacity: checkGlow }}
            >
              <StateIcon className="w-3.5 h-3.5" />
            </motion.div>
            <strong className="cov-card__title" title={entity.label}>
              {entity.label}
            </strong>
          </div>

          <span
            className={`cov-card__badge ${stateStyle.bg} ${stateStyle.border} ${stateStyle.text}`}
          >
            {entity.state}
          </span>
        </div>

        {entity.description && (
          <p className="cov-card__desc">{entity.description}</p>
        )}

        <div className="cov-card__footer">
          {entity.metric ? (
            <div className="flex items-center gap-1.5">
              <span className="cov-card__metric-label">Métrica</span>
              <span className="cov-card__metric-value">{entity.metric}</span>
            </div>
          ) : (
            <span className="cov-card__metric-label">En supervisión</span>
          )}

          <div className="cov-card__verified-tag">
            <Check className="w-3 h-3" />
            <span>VERIFICADO</span>
          </div>
        </div>
      </motion.article>
    );
  },
);

UnfoldCard.displayName = 'UnfoldCard';
