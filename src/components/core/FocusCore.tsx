import React, { useId } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { FocusCoreState } from '../../types/focus';
import { FocusCoreCanvas } from './FocusCoreCanvas';

interface FocusCoreProps {
  size?: 'hero' | 'large' | 'medium' | 'small' | 'companion';
  state?: FocusCoreState;
  interactive?: boolean;
  onHoverStateChange?: (hovered: boolean) => void;
  className?: string;
  anomalyActive?: boolean;
  variant?: 'orb' | 'particle';
  /** 'letter' = geometric F mark (hero landing); 'spark' = four-point star */
  markStyle?: 'spark' | 'letter';
}

export const FocusCore: React.FC<FocusCoreProps> = ({
  size = 'large',
  state = 'default',
  interactive = true,
  onHoverStateChange,
  className = '',
  anomalyActive = false,
  variant = 'orb',
  markStyle = 'letter',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const letterGradientId = `focus-letter-${useId().replace(/:/g, '')}`;
  // Color configuration by state
  const stateThemes: Record<
    FocusCoreState,
    {
      primary: string;
      secondary: string;
      tertiary: string;
      glow: string;
      sphereCenter: string;
      sphereEdge: string;
      haloOpacity: number;
    }
  > = {
    observing: {
      primary: '#3B82F6', // Blue
      secondary: '#6366F1', // Indigo
      tertiary: '#06B6D4', // Cyan
      glow: 'rgba(59, 130, 246, 0.45)',
      sphereCenter: '#60A5FA',
      sphereEdge: '#091533',
      haloOpacity: 0.5,
    },
    attention: {
      primary: '#F43F5E', // Coral / Rose
      secondary: '#3B82F6', // Blue base
      tertiary: '#FB7185',
      glow: 'rgba(244, 63, 94, 0.55)',
      sphereCenter: '#FDA4AF',
      sphereEdge: '#260814',
      haloOpacity: 0.65,
    },
    explaining: {
      primary: '#0070F3', // Electric Blue
      secondary: '#00DFD8', // Electric Cyan
      tertiary: '#7928CA',
      glow: 'rgba(0, 112, 243, 0.55)',
      sphereCenter: '#93C5FD',
      sphereEdge: '#05112B',
      haloOpacity: 0.6,
    },
    change: {
      primary: '#06B6D4', // Cyan
      secondary: '#38BDF8', // Sky
      tertiary: '#0284C7',
      glow: 'rgba(6, 182, 212, 0.5)',
      sphereCenter: '#67E8F9',
      sphereEdge: '#041726',
      haloOpacity: 0.55,
    },
    anomaly: {
      primary: '#A855F7', // Violet
      secondary: '#C084FC',
      tertiary: '#F43F5E',
      glow: 'rgba(168, 85, 247, 0.55)',
      sphereCenter: '#D8B4FE',
      sphereEdge: '#1B082B',
      haloOpacity: 0.65,
    },
    stable: {
      primary: '#10B981', // Emerald
      secondary: '#14B8A6', // Teal
      tertiary: '#059669',
      glow: 'rgba(16, 185, 129, 0.45)',
      sphereCenter: '#6EE7B7',
      sphereEdge: '#041A14',
      haloOpacity: 0.5,
    },
    complete: {
      primary: '#10B981',
      secondary: '#06B6D4',
      tertiary: '#3B82F6',
      glow: 'rgba(16, 185, 129, 0.5)',
      sphereCenter: '#A7F3D0',
      sphereEdge: '#061C1E',
      haloOpacity: 0.55,
    },
    critical: {
      primary: '#3B82F6',
      secondary: '#F43F5E',
      tertiary: '#FB7185',
      glow: 'rgba(244, 63, 94, 0.5)',
      sphereCenter: '#FDA4AF',
      sphereEdge: '#260814',
      haloOpacity: 0.64,
    },
    analysis: {
      primary: '#238BFF',
      secondary: '#35D9FF',
      tertiary: '#A855F7',
      glow: 'rgba(59, 130, 246, 0.5)',
      sphereCenter: '#7DD3FC',
      sphereEdge: '#091533',
      haloOpacity: 0.58,
    },
    default: {
      primary: '#3B82F6',
      secondary: '#6366F1',
      tertiary: '#06B6D4',
      glow: 'rgba(59, 130, 246, 0.45)',
      sphereCenter: '#60A5FA',
      sphereEdge: '#091533',
      haloOpacity: 0.5,
    },
  };

  const currentTheme = stateThemes[state] || stateThemes.default;

  // Sizing matrix
  const sizeMap = {
    hero: 'w-72 h-72 sm:w-96 sm:h-96 md:w-[420px] md:h-[420px]',
    large: 'w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96',
    medium: 'w-52 h-52 sm:w-64 sm:h-64 md:w-72 md:h-72',
    small: 'w-36 h-36 sm:w-44 sm:h-44',
    companion: 'w-24 h-24 sm:w-28 sm:h-28',
  };

  const isAnomaly = state === 'anomaly' || anomalyActive;
  const useLetterMark = markStyle === 'letter' || size === 'hero';

  if (variant === 'particle') {
    const particleGlow =
      state === 'stable' || state === 'complete'
        ? 'rgba(37, 214, 181, 0.22)'
        : state === 'critical'
          ? 'rgba(244, 63, 94, 0.2)'
          : state === 'anomaly'
            ? 'rgba(168, 85, 247, 0.22)'
            : state === 'change'
              ? 'rgba(6, 182, 212, 0.2)'
              : 'rgba(30, 100, 255, 0.2)';

    return (
      <div
        className={`focus-particle-core relative flex items-center justify-center select-none ${sizeMap[size]} ${className}`}
        data-core-state={state}
        onMouseEnter={() => onHoverStateChange?.(true)}
        onMouseLeave={() => onHoverStateChange?.(false)}
      >
        {/* CAPA 3 — Campo: halo + órbitas extendidas */}
        <div
          className="focus-particle-core__field pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          aria-hidden="true"
        />
        <div
          className="focus-particle-core__aura absolute inset-[-16%] rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle at center,
              ${particleGlow} 0%,
              rgba(37, 99, 235, 0.08) 28%,
              rgba(99, 102, 241, 0.03) 48%,
              transparent 70%)`,
          }}
        />
        <div className="focus-particle-core__orbit focus-particle-core__orbit--field absolute inset-[-6%] rounded-full pointer-events-none" />
        <div className="focus-particle-core__orbit focus-particle-core__orbit--outer absolute inset-[3%] rounded-full pointer-events-none" />
        <div className="focus-particle-core__orbit focus-particle-core__orbit--inner absolute inset-[16%] rounded-full pointer-events-none" />

        {/* CAPA 2 — Inteligencia: filamentos / partículas */}
        <FocusCoreCanvas state={state} interactive={interactive && !shouldReduceMotion} className="absolute inset-[-4%]" />

        {/* CAPA 1 — Núcleo con iluminación por capas: F -> inner glow -> halo compacto -> aura */}
        <div className="focus-particle-core__void absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none" />
        {useLetterMark && (
          <div className="focus-particle-core__mark-ring pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full" aria-hidden="true" />
        )}
        <motion.div
          className={`focus-particle-core__mark relative z-10 flex items-center justify-center pointer-events-none ${useLetterMark ? 'focus-particle-core__mark--letter' : ''}`}
          animate={
            shouldReduceMotion
              ? { opacity: 0.96, scale: 1 }
              : { opacity: [0.93, 1, 0.93], scale: [1, useLetterMark ? 1.015 : 1.025, 1] }
          }
          transition={
            shouldReduceMotion
              ? { duration: 0.01 }
              : { duration: 6.0, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          {useLetterMark ? (
            <svg className="focus-particle-core__letter" viewBox="0 0 64 64" fill="none" aria-hidden="true">
              <defs>
                <linearGradient id={letterGradientId} x1="10" y1="10" x2="54" y2="54" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="35%" stopColor="#e0f2fe" />
                  <stop offset="70%" stopColor="#7dd3fc" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
              <path
                fill={`url(#${letterGradientId})`}
                d="M14 12h36v9H24v9h20v9H24v13H14V12z"
              />
            </svg>
          ) : (
            <svg className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-[#d9f7ff]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
            </svg>
          )}
        </motion.div>

        <div className="focus-particle-core__horizon absolute -bottom-[1%] left-[14%] right-[14%] h-px pointer-events-none" />
        <div className="focus-particle-core__floor-light pointer-events-none absolute left-1/2 top-[78%] -translate-x-1/2" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center select-none ${sizeMap[size]} ${className}`}
      data-core-state={state}
      onMouseEnter={() => onHoverStateChange && onHoverStateChange(true)}
      onMouseLeave={() => onHoverStateChange && onHoverStateChange(false)}
    >
      {/* Outer ambient radiant atmosphere */}
      <motion.div
        className="absolute inset-0 rounded-full blur-3xl pointer-events-none"
        animate={{
          scale: isAnomaly ? [1, 1.12, 0.95, 1.08, 1] : [1, 1.1, 1],
          opacity: [
            currentTheme.haloOpacity * 0.7,
            currentTheme.haloOpacity,
            currentTheme.haloOpacity * 0.7,
          ],
        }}
        transition={{
          duration: isAnomaly ? 3.5 : 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          background: `radial-gradient(circle, ${currentTheme.glow} 0%, rgba(3, 7, 18, 0) 70%)`,
        }}
      />

      {/* Ripple wave pulse for change or attention states */}
      {(state === 'change' || state === 'attention' || state === 'explaining') && (
        <div
          className="absolute inset-2 rounded-full border border-blue-400/25 animate-wave-ripple pointer-events-none"
          style={{ borderColor: currentTheme.primary }}
        />
      )}

      {/* SVG Multi-Layer Orbital Geometry */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`orbit-grad-${state}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={currentTheme.primary} stopOpacity="0.85" />
            <stop offset="50%" stopColor={currentTheme.secondary} stopOpacity="0.45" />
            <stop offset="100%" stopColor={currentTheme.tertiary} stopOpacity="0.15" />
          </linearGradient>

          <radialGradient id={`sphere-core-${state}`} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="25%" stopColor={currentTheme.sphereCenter} stopOpacity="0.9" />
            <stop offset="60%" stopColor={currentTheme.sphereEdge} stopOpacity="0.95" />
            <stop offset="100%" stopColor="#02050E" stopOpacity="1" />
          </radialGradient>
        </defs>

        {/* Orbit Ring 1: Primary broken arc (clockwise) */}
        <g className={`origin-center ${isAnomaly ? 'animate-slow-spin animate-organic-anomaly' : 'animate-slow-spin'}`}>
          <ellipse
            cx="200"
            cy="200"
            rx={isAnomaly ? '175' : '182'}
            ry={isAnomaly ? '135' : '148'}
            stroke={`url(#orbit-grad-${state})`}
            strokeWidth="1.2"
            strokeDasharray="24 16 64 28 8 20"
            strokeOpacity="0.6"
            transform="rotate(-18 200 200)"
          />
          {/* Orbital nodes */}
          <circle cx="18" cy="200" r="3" fill={currentTheme.primary} className="opacity-90" />
          <circle cx="382" cy="200" r="2.5" fill="#FFFFFF" className="opacity-95" />
          <circle cx="200" cy="52" r="2" fill={currentTheme.secondary} className="opacity-70" />
        </g>

        {/* Orbit Ring 2: Secondary broken arc (counter-clockwise) */}
        <g className="animate-reverse-slow-spin origin-center">
          <ellipse
            cx="200"
            cy="200"
            rx="150"
            ry="172"
            stroke={`url(#orbit-grad-${state})`}
            strokeWidth="1"
            strokeDasharray="14 30 42 20 8 16"
            strokeOpacity="0.5"
            transform="rotate(38 200 200)"
          />
          <circle cx="200" cy="28" r="2.5" fill={currentTheme.tertiary} className="opacity-80" />
          <circle cx="350" cy="200" r="2" fill={currentTheme.primary} className="opacity-85" />
          <circle cx="50" cy="200" r="2" fill="#FFFFFF" className="opacity-90" />
        </g>

        {/* Orbit Ring 3: Subtle inner broken resonance ring */}
        <g className="animate-slow-spin origin-center opacity-60">
          <circle
            cx="200"
            cy="200"
            r="125"
            stroke={currentTheme.primary}
            strokeWidth="0.8"
            strokeDasharray="4 24 18 32"
            strokeOpacity="0.4"
            transform="rotate(85 200 200)"
          />
          <circle cx="325" cy="200" r="1.5" fill={currentTheme.secondary} />
          <circle cx="75" cy="200" r="1.5" fill="#FFFFFF" />
        </g>

        {/* Harmonic Resonance Curves connecting the field */}
        <g className="animate-pulse-subtle origin-center">
          <path
            d="M 65 200 Q 130 95 200 200 T 335 200"
            stroke={currentTheme.primary}
            strokeWidth="0.8"
            strokeOpacity="0.28"
            fill="none"
          />
          <path
            d="M 65 200 Q 130 305 200 200 T 335 200"
            stroke={currentTheme.secondary}
            strokeWidth="0.8"
            strokeOpacity="0.28"
            fill="none"
          />
        </g>
      </svg>

      {/* Internal Volumetric Spherical Core */}
      <motion.div
        className={`relative w-3/4 h-3/4 rounded-full flex items-center justify-center overflow-hidden transition-all duration-700 ${
          isAnomaly ? 'animate-organic-anomaly' : ''
        }`}
        style={{
          background: `radial-gradient(circle at 35% 35%, #FFFFFF 0%, ${currentTheme.sphereCenter} 28%, ${currentTheme.sphereEdge} 68%, #030712 100%)`,
          boxShadow: `inset 0 0 40px rgba(255, 255, 255, 0.45), 0 0 50px ${currentTheme.glow}`,
        }}
        animate={{
          scale: isAnomaly ? [1, 1.05, 0.97, 1.04, 1] : [1, 1.03, 1],
        }}
        transition={{
          duration: isAnomaly ? 3 : 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Subtle Swirling Mesh & Lighting Layer */}
        <div
          className="absolute inset-0 opacity-45 mix-blend-overlay animate-slow-spin pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(ellipse at center, transparent 25%, ${currentTheme.primary} 70%, #000 100%), conic-gradient(from 0deg, transparent 0deg, ${currentTheme.secondary} 90deg, transparent 180deg, ${currentTheme.primary} 270deg, transparent 360deg)`,
          }}
        />

        {/* Central FOCUS signature */}
        <motion.div
          className="relative z-10 flex items-center justify-center text-white drop-shadow-[0_0_18px_rgba(255,255,255,0.95)]"
          animate={
            useLetterMark
              ? { scale: state === 'attention' ? [1, 1.09, 1] : [1, 1.05, 1] }
              : {
                  scale: state === 'attention' ? [1, 1.25, 1] : [1, 1.15, 1],
                  rotate: [0, 90, 180, 270, 360],
                }
          }
          transition={{
            scale: { duration: state === 'attention' ? 2.5 : 4.5, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: 60, repeat: Infinity, ease: 'linear' },
          }}
        >
          {useLetterMark ? (
            <svg className="focus-orb__letter" viewBox="0 0 64 64" fill="none" aria-hidden="true">
              <defs>
                <linearGradient id={letterGradientId} x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="48%" stopColor="#d9f7ff" />
                  <stop offset="100%" stopColor={currentTheme.secondary} />
                </linearGradient>
              </defs>
              <path fill={`url(#${letterGradientId})`} d="M14 12h36v9H24v9h20v9H24v13H14V12z" />
            </svg>
          ) : (
            <svg className="h-8 w-8 sm:h-11 sm:w-11 md:h-14 md:w-14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
            </svg>
          )}
        </motion.div>

        {/* Specular glass reflection curve */}
        <div className="absolute -top-1/3 -left-1/3 w-3/4 h-3/4 bg-gradient-to-br from-white/35 to-transparent rounded-full blur-[2px] pointer-events-none transform rotate-12" />
      </motion.div>
    </div>
  );
};
