/**
 * FOCUS — Pausa de animaciones por capitulo.
 *
 * El CSS puede pausar sus propias animaciones con animation-play-state, pero
 * las que crea Motion (motion/react) viven en la Web Animations API y siguen
 * corriendo aunque su seccion este fuera de pantalla. Con siete capitulos
 * montados a la vez eso son decenas de animaciones compitiendo por el hilo
 * principal sin que nadie las vea.
 *
 * Este helper pausa el subarbol completo de una seccion cuando sale de
 * pantalla y lo reanuda exactamente donde estaba al volver, asi que ninguna
 * animacion se pierde: solo dejan de consumir mientras no se ven.
 */

/** Animaciones pausadas por nosotros, para no reanudar las que ya lo estaban. */
const ownPaused = new WeakSet<Animation>();

const supportsGetAnimations =
  typeof Element !== 'undefined' && typeof Element.prototype.getAnimations === 'function';

export const pauseSubtreeAnimations = (element: Element): void => {
  if (!supportsGetAnimations) return;

  let animations: Animation[] = [];
  try {
    animations = element.getAnimations({ subtree: true });
  } catch {
    return;
  }

  for (const animation of animations) {
    if (animation.playState !== 'running') continue;
    try {
      animation.pause();
      ownPaused.add(animation);
    } catch {
      /* una animacion ya finalizada o cancelada puede rechazar pause() */
    }
  }
};

export const resumeSubtreeAnimations = (element: Element): void => {
  if (!supportsGetAnimations) return;

  let animations: Animation[] = [];
  try {
    animations = element.getAnimations({ subtree: true });
  } catch {
    return;
  }

  for (const animation of animations) {
    if (!ownPaused.has(animation)) continue;
    ownPaused.delete(animation);
    try {
      animation.play();
    } catch {
      /* idem */
    }
  }
};
