import React from 'react';

export type OrganicFramingVariant = 'signal-filter' | 'why-bridge';

interface OrganicFramingShapesProps {
  active?: boolean;
  /**
   * Los gradientes SVG animados fuerzan a repintar formas muy grandes en cada
   * frame. Se pueden congelar conservando exactamente la misma composicion.
   */
  animated?: boolean;
  variant?: OrganicFramingVariant;
  className?: string;
}

const LEFT_PATHS = {
  backWave: 'M 0,0 L 740,0 C 660,110 560,260 460,440 C 340,640 180,780 0,840 Z',
  body: 'M 0,0 L 580,0 C 520,50 440,140 360,260 C 260,400 140,500 0,540 Z',
  crease: 'M 0,0 L 480,0 C 400,80 320,180 240,300 C 160,420 80,480 0,510 Z',
  edge: 'M 0,540 C 140,500 260,400 360,260 C 440,140 520,50 580,0',
};

const RIGHT_PATHS = {
  backWave: 'M 800,900 L 80,900 C 180,810 320,680 440,500 C 560,300 700,180 800,120 Z',
  body: 'M 800,900 L 220,900 C 280,840 360,740 440,600 C 540,440 660,380 800,360 Z',
  crease: 'M 800,900 L 320,900 C 400,820 480,720 560,600 C 640,480 720,420 800,390 Z',
  edge: 'M 220,900 C 280,840 360,740 440,600 C 540,440 660,380 800,360',
};

export const OrganicFramingShapes: React.FC<OrganicFramingShapesProps> = ({
  active = true,
  animated = true,
  variant = 'signal-filter',
  className = '',
}) => {
  const prefix = variant === 'why-bridge' ? 'why-org' : 'iv';
  const isWhy = variant === 'why-bridge';

  const leftContourStroke = isWhy ? 'rgba(103, 232, 249, 0.10)' : 'rgba(101, 217, 255, 0.08)';
  const rightContourStroke = isWhy ? 'rgba(167, 139, 250, 0.10)' : 'rgba(196, 181, 253, 0.08)';

  const ambientStyle = isWhy
    ? 'radial-gradient(ellipse 72% 62% at 50% 50%, rgba(34, 211, 238, 0.11), rgba(139, 92, 246, 0.07) 48%, transparent 74%)'
    : undefined;

  return (
    <div className={`iv-organic-framing${animated ? '' : ' is-static'} ${className}`.trim()} aria-hidden="true">
      {isWhy && (
        <div
          className="iv-organic-framing__ambient"
          style={{ background: ambientStyle }}
        />
      )}
      <div className="iv-organic-framing__grain" />

      <div className="iv-organic-framing__layer">
        {/* Left organic form */}
        <div className={`iv-organic-shape iv-organic-shape--left ${active ? 'is-active' : ''}`}>
          <svg className="iv-organic-shape__svg" viewBox="0 0 800 900" preserveAspectRatio="none">
            <defs>
              {isWhy ? (
                <>
                  <linearGradient id={`${prefix}-left-back-wave-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#041018" stopOpacity="0.55" />
                    <stop offset="40%" stopColor="#082038" stopOpacity="0.30" />
                    <stop offset="75%" stopColor="#0e3a5c" stopOpacity="0.10" />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id={`${prefix}-left-organic-grad`} x1="0%" y1="0%" x2="85%" y2="85%">
                    <stop offset="0%" stopColor="#061018" stopOpacity="0.75" />
                    <stop offset="28%" stopColor="#0c1e32" stopOpacity="0.50" />
                    <stop offset="58%" stopColor="#134e6f" stopOpacity="0.28" />
                    <stop offset="82%" stopColor="#0891b2" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                  </linearGradient>
                  <radialGradient id={`${prefix}-left-specular`} cx="42%" cy="32%" r="58%">
                    <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.26" />
                    <stop offset="35%" stopColor="#06b6d4" stopOpacity="0.11" />
                    <stop offset="70%" stopColor="#0f172a" stopOpacity="0.03" />
                    <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id={`${prefix}-left-crease-shadow`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#010408" stopOpacity="0.6" />
                    <stop offset="50%" stopColor="#020810" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id={`${prefix}-left-ray-gradient`} x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
                    <stop offset="16%" stopColor="#22d3ee" stopOpacity="0.06" />
                    <stop offset="36%" stopColor="#67e8f9" stopOpacity="0.55" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
                    <stop offset="64%" stopColor="#93c5fd" stopOpacity="0.55" />
                    <stop offset="84%" stopColor="#818cf8" stopOpacity="0.06" />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                    {animated && (
                      <animateTransform
                        attributeName="gradientTransform"
                        type="translate"
                        values="-0.9,0.9; 0.9,-0.9; -0.9,0.9"
                        keyTimes="0; 0.5; 1"
                        dur="5.5s"
                        repeatCount="indefinite"
                      />
                    )}
                  </linearGradient>
                </>
              ) : (
                <>
                  <linearGradient id={`${prefix}-left-back-wave-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#040e24" stopOpacity="0.55" />
                    <stop offset="40%" stopColor="#081b3e" stopOpacity="0.30" />
                    <stop offset="75%" stopColor="#102e62" stopOpacity="0.10" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id={`${prefix}-left-organic-grad`} x1="0%" y1="0%" x2="85%" y2="85%">
                    <stop offset="0%" stopColor="#06132d" stopOpacity="0.75" />
                    <stop offset="28%" stopColor="#0a2046" stopOpacity="0.50" />
                    <stop offset="58%" stopColor="#123366" stopOpacity="0.28" />
                    <stop offset="82%" stopColor="#1e40af" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                  </linearGradient>
                  <radialGradient id={`${prefix}-left-specular`} cx="42%" cy="32%" r="58%">
                    <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.28" />
                    <stop offset="35%" stopColor="#1d4ed8" stopOpacity="0.12" />
                    <stop offset="70%" stopColor="#0f172a" stopOpacity="0.03" />
                    <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id={`${prefix}-left-crease-shadow`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#01040a" stopOpacity="0.6" />
                    <stop offset="50%" stopColor="#020816" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id={`${prefix}-left-ray-gradient`} x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
                    <stop offset="16%" stopColor="#38bdf8" stopOpacity="0.06" />
                    <stop offset="36%" stopColor="#65d9ff" stopOpacity="0.6" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
                    <stop offset="64%" stopColor="#93c5fd" stopOpacity="0.6" />
                    <stop offset="84%" stopColor="#818cf8" stopOpacity="0.06" />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                    {animated && (
                      <animateTransform
                        attributeName="gradientTransform"
                        type="translate"
                        values="-0.9,0.9; 0.9,-0.9; -0.9,0.9"
                        keyTimes="0; 0.5; 1"
                        dur="5.5s"
                        repeatCount="indefinite"
                      />
                    )}
                  </linearGradient>
                </>
              )}
              <filter id={`${prefix}-left-ray-bloom`} x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="8" result="blur1" />
                <feGaussianBlur stdDeviation="2.5" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur1" />
                  <feMergeNode in="blur2" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <path d={LEFT_PATHS.backWave} fill={`url(#${prefix}-left-back-wave-grad)`} className="iv-organic-shape__back-wave" />
            <path d={LEFT_PATHS.body} fill={`url(#${prefix}-left-organic-grad)`} className="iv-organic-shape__body" />
            <path d={LEFT_PATHS.body} fill={`url(#${prefix}-left-specular)`} />
            <path d={LEFT_PATHS.crease} fill={`url(#${prefix}-left-crease-shadow)`} opacity="0.5" />
            <path d={LEFT_PATHS.edge} fill="none" stroke={leftContourStroke} strokeWidth="0.8" />
            <path d={LEFT_PATHS.edge} fill="none" stroke={`url(#${prefix}-left-ray-gradient)`} strokeWidth="12" filter={`url(#${prefix}-left-ray-bloom)`} opacity="0.65" />
            <path d={LEFT_PATHS.edge} fill="none" stroke={`url(#${prefix}-left-ray-gradient)`} strokeWidth="4.5" filter={`url(#${prefix}-left-ray-bloom)`} opacity="0.88" />
            <path d={LEFT_PATHS.edge} fill="none" stroke={`url(#${prefix}-left-ray-gradient)`} strokeWidth="1.8" opacity="0.95" />
          </svg>
        </div>

        {/* Right organic form */}
        <div className={`iv-organic-shape iv-organic-shape--right ${active ? 'is-active' : ''}`}>
          <svg className="iv-organic-shape__svg" viewBox="0 0 800 900" preserveAspectRatio="none">
            <defs>
              {isWhy ? (
                <>
                  <linearGradient id={`${prefix}-right-back-wave-grad`} x1="100%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#0a0618" stopOpacity="0.55" />
                    <stop offset="40%" stopColor="#140e38" stopOpacity="0.30" />
                    <stop offset="75%" stopColor="#2e1065" stopOpacity="0.10" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id={`${prefix}-right-organic-grad`} x1="100%" y1="100%" x2="15%" y2="15%">
                    <stop offset="0%" stopColor="#0d0928" stopOpacity="0.75" />
                    <stop offset="28%" stopColor="#1e1044" stopOpacity="0.50" />
                    <stop offset="58%" stopColor="#312e81" stopOpacity="0.28" />
                    <stop offset="82%" stopColor="#4c1d95" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                  </linearGradient>
                  <radialGradient id={`${prefix}-right-specular`} cx="58%" cy="68%" r="58%">
                    <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.26" />
                    <stop offset="35%" stopColor="#7c3aed" stopOpacity="0.11" />
                    <stop offset="70%" stopColor="#0f172a" stopOpacity="0.03" />
                    <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id={`${prefix}-right-crease-shadow`} x1="100%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#01040a" stopOpacity="0.6" />
                    <stop offset="50%" stopColor="#040214" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id={`${prefix}-right-ray-gradient`} x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
                    <stop offset="16%" stopColor="#8b5cf6" stopOpacity="0.06" />
                    <stop offset="36%" stopColor="#a78bfa" stopOpacity="0.55" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
                    <stop offset="64%" stopColor="#c4b5fd" stopOpacity="0.55" />
                    <stop offset="84%" stopColor="#818cf8" stopOpacity="0.06" />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                    {animated && (
                      <animateTransform
                        attributeName="gradientTransform"
                        type="translate"
                        values="0.9,-0.9; -0.9,0.9; 0.9,-0.9"
                        keyTimes="0; 0.5; 1"
                        dur="5.5s"
                        repeatCount="indefinite"
                      />
                    )}
                  </linearGradient>
                </>
              ) : (
                <>
                  <linearGradient id={`${prefix}-right-back-wave-grad`} x1="100%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#0a0724" stopOpacity="0.55" />
                    <stop offset="40%" stopColor="#140e38" stopOpacity="0.30" />
                    <stop offset="75%" stopColor="#221558" stopOpacity="0.10" />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id={`${prefix}-right-organic-grad`} x1="100%" y1="100%" x2="15%" y2="15%">
                    <stop offset="0%" stopColor="#0d092d" stopOpacity="0.75" />
                    <stop offset="28%" stopColor="#161044" stopOpacity="0.50" />
                    <stop offset="58%" stopColor="#261a64" stopOpacity="0.28" />
                    <stop offset="82%" stopColor="#3730a3" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                  </linearGradient>
                  <radialGradient id={`${prefix}-right-specular`} cx="58%" cy="68%" r="58%">
                    <stop offset="0%" stopColor="#c084fc" stopOpacity="0.28" />
                    <stop offset="35%" stopColor="#7c3aed" stopOpacity="0.12" />
                    <stop offset="70%" stopColor="#0f172a" stopOpacity="0.03" />
                    <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id={`${prefix}-right-crease-shadow`} x1="100%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#01040a" stopOpacity="0.6" />
                    <stop offset="50%" stopColor="#040214" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id={`${prefix}-right-ray-gradient`} x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#c084fc" stopOpacity="0" />
                    <stop offset="16%" stopColor="#c084fc" stopOpacity="0.06" />
                    <stop offset="36%" stopColor="#c4b5fd" stopOpacity="0.6" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
                    <stop offset="64%" stopColor="#818cf8" stopOpacity="0.6" />
                    <stop offset="84%" stopColor="#38bdf8" stopOpacity="0.06" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                    {animated && (
                      <animateTransform
                        attributeName="gradientTransform"
                        type="translate"
                        values="0.9,-0.9; -0.9,0.9; 0.9,-0.9"
                        keyTimes="0; 0.5; 1"
                        dur="5.5s"
                        repeatCount="indefinite"
                      />
                    )}
                  </linearGradient>
                </>
              )}
              <filter id={`${prefix}-right-ray-bloom`} x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="8" result="blur1" />
                <feGaussianBlur stdDeviation="2.5" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur1" />
                  <feMergeNode in="blur2" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <path d={RIGHT_PATHS.backWave} fill={`url(#${prefix}-right-back-wave-grad)`} className="iv-organic-shape__back-wave" />
            <path d={RIGHT_PATHS.body} fill={`url(#${prefix}-right-organic-grad)`} className="iv-organic-shape__body" />
            <path d={RIGHT_PATHS.body} fill={`url(#${prefix}-right-specular)`} />
            <path d={RIGHT_PATHS.crease} fill={`url(#${prefix}-right-crease-shadow)`} opacity="0.5" />
            <path d={RIGHT_PATHS.edge} fill="none" stroke={rightContourStroke} strokeWidth="0.8" />
            <path d={RIGHT_PATHS.edge} fill="none" stroke={`url(#${prefix}-right-ray-gradient)`} strokeWidth="12" filter={`url(#${prefix}-right-ray-bloom)`} opacity="0.65" />
            <path d={RIGHT_PATHS.edge} fill="none" stroke={`url(#${prefix}-right-ray-gradient)`} strokeWidth="4.5" filter={`url(#${prefix}-right-ray-bloom)`} opacity="0.88" />
            <path d={RIGHT_PATHS.edge} fill="none" stroke={`url(#${prefix}-right-ray-gradient)`} strokeWidth="1.8" opacity="0.95" />
          </svg>
        </div>
      </div>
    </div>
  );
};
