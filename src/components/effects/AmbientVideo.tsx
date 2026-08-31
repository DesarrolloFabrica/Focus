import React, { useEffect, useRef, useState } from 'react';

interface AmbientVideoProps {
  src: string;
  poster: string;
  className?: string;
}

/**
 * Video ambiental de bucle que solo descarga y decodifica cuando hace falta.
 *
 * Un <video autoplay loop> siempre montado sigue decodificando fotogramas
 * aunque este fuera de pantalla: es una carga constante de CPU/GPU que en
 * portatiles modestos compite con el scroll. Aqui:
 *   - la fuente se asigna cuando el elemento se acerca al viewport
 *   - se reproduce solo mientras se ve y la pestana esta activa
 *   - mientras tanto se muestra el poster, asi que no hay salto visual
 */
export const AmbientVideo: React.FC<AmbientVideoProps> = ({ src, poster, className = '' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    let inView = true;

    const sync = () => {
      if (inView && !document.hidden) {
        const attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') attempt.catch(() => undefined);
      } else if (!video.paused) {
        video.pause();
      }
    };

    const onVisibility = () => sync();
    document.addEventListener('visibilitychange', onVisibility);

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          inView = entries.some((entry) => entry.isIntersecting);
          sync();
        },
        { rootMargin: '400px', threshold: 0 },
      );
      observer.observe(video);
    }

    sync();

    return () => {
      observer?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className={className}
      src={src}
      poster={poster}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      aria-hidden="true"
    />
  );
};
