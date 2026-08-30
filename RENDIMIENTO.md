# FOCUS — Notas de rendimiento

La plataforma conserva la intención visual, las transiciones narrativas y los
efectos que aportan información. Lo que cambió es *cuándo* y *con qué coste*
se ejecutan; los movimientos ambientales puramente decorativos se congelan en
equipos ajustados para que vaya fluida tanto en una torre potente como en un
portátil con gráficos integrados.

## 1. Niveles adaptativos (`src/perf/perfTier.ts`)

Al arrancar se estima la capacidad del equipo (núcleos, memoria, tipo de
puntero, densidad de pantalla) y se marca `<html data-perf="…">` con uno de
tres niveles:

| Nivel      | Para                          | DPR canvas | Partículas | FPS canvas | Glow canvas |
|------------|-------------------------------|-----------:|-----------:|-----------:|-------------|
| `high`     | equipos holgados              |       1.5  |      100 % |         60 | sí          |
| `balanced` | portátiles normales           |      1.25  |       70 % |         45 | sí          |
| `lite`     | equipos modestos / integrados |         1  |       45 % |         30 | no          |

El umbral para `high` es más estricto (score ≥ 4). Si el sistema tiene
`prefers-reduced-motion: reduce`, el arranque se limita como mínimo a
`balanced`.

Además hay un **monitor de FPS**: si el rendimiento real cae por debajo de
~50 fps de forma sostenida, baja un nivel automáticamente. Solo degrada,
nunca sube solo, para que no se vea oscilar.

Para probar o forzar un nivel:

```
http://localhost:3002/?perf=lite      (o balanced / high)
localStorage.setItem('focus:perf', 'lite')
```

## 2. Montaje progresivo del briefing

Al pulsar **Iniciar briefing** ya no se montan los siete capítulos de golpe.
`FocusExperience` monta primero la transición Panorama → Prioridad y va
añadiendo bloques según proximidad de scroll (`MOUNT_MARGIN = 400px`).

Las secciones más pesadas (`NoiseFilterTransition`, `WhyItMattersSection`,
`WhatChangedSection`, `AnomalySection`) se cargan con `React.lazy` la primera
vez que toca montarlas.

Si el usuario salta de capítulo desde la barra de progreso, se montan todos
los bloques necesarios hasta ese paso.

## 3. Nada se anima fuera de pantalla

Cada capítulo montado lleva `data-inview="true|false"` (IntersectionObserver
en `FocusExperience`) y:

- **CSS**: `animation-play-state: paused` para todo el subárbol
  (`src/styles/focus-performance.css`).
- **Motion**: se pausan y reanudan por código (`src/perf/animationGate.ts`).
- **Canvas**: bucles gestionados con `startManagedLoop` (viewport + pestaña
  activa + tope de FPS por nivel). El núcleo FOCUS y el campo del cursor en
  la portada entran en reposo tras ~3 s sin interacción.
- **Vídeo**: el anillo 3D del panorama solo reproduce video en `high`; en
  `balanced` y `lite` se muestra el póster WebP estático.

## 4. Portada de inicio (arrival)

| Efecto | `high` | `balanced` | `lite` |
|--------|--------|------------|--------|
| Campo del cursor | activo | menos partículas, sin glow | desactivado |
| Fotones SVG en los streams | activos | ocultos | ocultos |
| Canvas del núcleo F | completo | completo, reposo idle | oculto (solo marca) |
| `backdrop-filter` en tarjetas | moderado (14px) | 8–16px | gradiente sólido |

Las transiciones inicio → briefing usan solo `opacity` y `transform` (sin
`filter: blur()` animado), que era uno de los costes más altos por frame.

## 5. Menos trabajo de layout en el scroll

- El capítulo activo se resuelve con `IntersectionObserver` sobre una banda de
  enfoque, en vez de medir las siete secciones en cada frame de scroll.
- Los manejadores de **Por qué** y **NoiseFilterTransition** no miden geometría
  si el capítulo tiene `data-inview="false"` (`isSubtreeInView`).
- En **Anomalía**, el desenfoque ligado al scroll solo corre en `high`; en
  `balanced` y `lite` se usan opacidad y traslación.
- Las variables CSS de altura (`--iv-*-viewport-height`) solo se escriben
  cuando cambian de verdad.

## 6. Efectos caros escalados por nivel

`src/styles/focus-performance.css` reduce radios de `filter: blur()` y
`backdrop-filter` en **los tres niveles**, incluido `high` (valores moderados
que conservan el look premium sin el coste extremo de 30–100px).

En **Cambios**:

- cristal sin `backdrop-filter` en superficies casi opacas;
- halos con gradientes radiales en lugar de `blur(140px)`;
- filtros SVG de área completa desactivados;
- animación ambiental de halos solo en `high`.

En **lite**, los trazos orgánicos SVG no aplican `feGaussianBlur`.

## 7. Carga inicial

| | Antes | Ahora |
|---|---:|---:|
| Imágenes del briefing | 3,1 MB (PNG) | 224 KB (WebP) |
| Vídeo ambiental | 3,07 MB | 882 KB |
| Archivos de fuente | 15 estáticos | 3 variables |
| JS inicial | un solo bundle | react / motion / icons / app separados |

Los paneles (Ask, Acciones, Por qué, Demo) y la vista de Investigación se
cargan bajo demanda la primera vez que se abren.

## 8. Cómo validar

1. Abrir `http://localhost:3002/?perf=balanced` y recorrer portada → briefing
   → capítulos 0–3.
2. Repetir con `?perf=lite` y confirmar que la narrativa sigue legible.
3. En Chrome DevTools → Performance, grabar la transición inicio → panorama
   y el scroll por Prioridad / Por qué / Cambios.
4. Objetivo: scroll fluido en `balanced` en portátil integrado; como máximo
   1–2 canvas activos en el capítulo visible.
