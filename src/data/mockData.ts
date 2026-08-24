import { FocusBriefing, FocusPerspective, FocusScenario, AskSuggestion } from '../types/focus';

export function getFocusBriefing(
  perspective: FocusPerspective = 'executive',
  scenario: FocusScenario = 'attention'
): FocusBriefing {
  // Personalization settings based on Perspective
  const userProfiles: Record<FocusPerspective, { name: string; role: string; greeting: string }> = {
    executive: {
      name: 'Alejandro Acuña',
      role: 'Director de Operaciones',
      greeting: 'Buenos días, Alejandro',
    },
    coordination: {
      name: 'Valeria Morales',
      role: 'Líder de Coordinación y Entrega',
      greeting: 'Buenos días, Valeria',
    },
    analyst: {
      name: 'Sebastián Ríos',
      role: 'Especialista de Calidad y Procesos',
      greeting: 'Buenos días, Sebastián',
    },
    personal: {
      name: 'Alejandro Acuña',
      role: 'Mi espacio de trabajo',
      greeting: 'Hola, Alejandro',
    },
  };

  const profile = userProfiles[perspective];

  // Scenario 1: Stable (All under control - silence is information)
  if (scenario === 'stable') {
    return {
      perspective,
      scenario: 'stable',
      greeting: profile.greeting,
      userName: profile.name,
      userRole: profile.role,
      summarySentence: 'Todo está bajo control. No detecté asuntos que requieran tu intervención ahora.',
      detectedCount: 0,
      dimensions: {
        prioritiesCount: 0,
        prioritiesSummary: 'Sin asuntos críticos pendientes.',
        changesCount: 2,
        changesSummary: '2 mejoras consolidadas desde tu última visita.',
        anomaliesCount: 0,
        anomaliesSummary: 'Todos los patrones dentro del rango histórico.',
        stableCount: 12,
        stableSummary: '12 áreas operan con total normalidad.',
      },
      mainPriority: {
        id: 'p-stable',
        code: 'EST-00',
        title: 'Operación balanceada',
        headline: 'Todos los flujos clave operan en parámetros óptimos.',
        description: 'La totalidad de procesos supervisados cumple con los tiempos de respuesta y niveles de servicio acordados.',
        affectedCount: 0,
        affectedUnit: 'bloqueos',
        usualMetric: '2.1 días',
        currentMetric: '1.9 días',
        deltaPercentage: -9,
        startedTimeAgo: 'Periodo estable',
        reasons: [
          {
            number: '01',
            label: 'CUMPLIMIENTO',
            detail: '100% de los elementos dentro de la ventana esperada.',
          },
          {
            number: '02',
            label: 'ESTABILIDAD',
            detail: 'Sin incrementos anómalos de latencia.',
          },
          {
            number: '03',
            label: 'RESOLUCIÓN',
            detail: '14 elementos se completaron satisfactoriamente hoy.',
          },
          {
            number: '04',
            label: 'COBERTURA',
            detail: 'Todos los puntos de control están activos.',
          },
        ],
        explanation: {
          impact: 'Medio',
          impactDescription: 'Parámetros óptimos en todos los canales.',
          deterioration: '0%',
          persistence: '0 días',
          relevance: 'Informativa',
          summaryText: 'FOCUS no detectó desvíos ni comportamientos que justifiquen interrumpir tu flujo de trabajo.',
          algorithmNote: 'Algoritmo de prioridad ejecutiva: Score 0/100 (Sin alerta requerida).',
        },
        actionRecommendation: 'No requieres tomar acciones correctivas hoy.',
        keyCases: [],
      },
      changes: {
        id: 'c-stable',
        newItemsCount: 14,
        resolvedItemsCount: 14,
        pendingItemsCount: 0,
        relevantChangesCount: 2,
        events: [
          { time: '08:15', title: '14 elementos finalizaron correctamente.', category: 'resolved' },
          { time: '09:30', title: '2 indicadores de rendimiento mejoraron.', category: 'resolved' },
          { time: '10:00', title: 'Verificación de integridad sin novedades.', category: 'resolved' },
        ],
      },
      anomaly: {
        id: 'a-stable',
        title: 'Comportamiento de la operación',
        headline: 'Todas las curvas siguen la trayectoria habitual.',
        description: 'El flujo de procesamiento disminuye ordenadamente al ritmo proyectado para la jornada.',
        usualBehavior: 'Curva de resolución descendente progresiva.',
        currentBehavior: 'Curva en sincronía exacta con el modelo esperado.',
        isCritical: false,
        isUnusual: false,
        insight: 'Sin anomalías registradas en las últimas 72 horas.',
      },
      stable: {
        monitoredProcessesCount: 12,
        noCriticalBlockers: true,
        regularTimingsCount: 12,
        noOtherAnomalies: true,
        editorialNote: 'La operación no presenta fricciones. Tu atención no es requerida en este momento.',
      },
      estimatedReadTime: '~30 seg',
      completionTime: '0 min 35 s',
    };
  }

  // Scenario 2: High Activity
  if (scenario === 'high_activity') {
    return {
      perspective,
      scenario: 'high_activity',
      greeting: profile.greeting,
      userName: profile.name,
      userRole: profile.role,
      summarySentence: 'Detecté 5 asuntos prioritarios y un volumen inusual de cambios en curso.',
      detectedCount: 5,
      dimensions: {
        prioritiesCount: 5,
        prioritiesSummary: '5 asuntos requieren acción prioritaria.',
        changesCount: 12,
        changesSummary: '12 cambios relevantes en las últimas 3 horas.',
        anomaliesCount: 2,
        anomaliesSummary: '2 comportamientos fuera de lo habitual.',
        stableCount: 6,
        stableSummary: '6 procesos continúan operando estables.',
      },
      mainPriority: {
        id: 'p-high-1',
        code: 'URG-01',
        title: 'Proceso de Validación Central',
        headline: 'Sobrecarga concentrada en el nodo de autorización.',
        description: 'El tiempo promedio de respuesta se duplicó en las últimas 48 horas debido a acumulación en el Punto B.',
        affectedCount: 28,
        affectedUnit: 'elementos afectados',
        usualMetric: '1.8 días',
        currentMetric: '6.4 días',
        deltaPercentage: 55,
        startedTimeAgo: 'Comenzó hace 4 días',
        reasons: [
          { number: '01', label: 'IMPACTO', detail: '28 elementos con retraso crítico.' },
          { number: '02', label: 'DETERIORO', detail: 'Incremento del 55% sobre el tiempo esperado.' },
          { number: '03', label: 'TIEMPO', detail: 'Tendencia alcista continua durante 4 días.' },
          { number: '04', label: 'CONTEXTO', detail: 'Compromete entregas comprometidas para este periodo.' },
        ],
        explanation: {
          impact: 'Crítico',
          impactDescription: 'Afecta la capacidad general de cierre del ciclo.',
          deterioration: '+55%',
          persistence: '4 días acumulados',
          relevance: 'Prioridad 1 en tu rol',
          summaryText: 'La concentración del retraso en el nodo B está generando un efecto cascada.',
          algorithmNote: 'Score de atención: 94/100 (Revisión urgente aconsejada).',
        },
        actionRecommendation: 'Revisar de inmediato los 3 casos que retienen el 80% de la carga.',
        keyCases: [
          { id: 'c-1042', name: 'Caso #1042 · Validación Contratos', impactScore: 92, owner: 'Unidad Central', delayTime: '6.8 días', status: 'Retenido en Punto B', rootCausePoint: 'Punto de Validación B' },
          { id: 'c-1089', name: 'Caso #1089 · Aprobación Presupuestal', impactScore: 88, owner: 'Equipo Norte', delayTime: '6.1 días', status: 'En espera de firma', rootCausePoint: 'Punto de Validación B' },
          { id: 'c-1104', name: 'Caso #1104 · Auditoría Documental', impactScore: 84, owner: 'Unidad Central', delayTime: '5.9 días', status: 'Documentación incompleta', rootCausePoint: 'Punto de Validación B' },
        ],
      },
      changes: {
        id: 'c-high',
        newItemsCount: 34,
        resolvedItemsCount: 16,
        pendingItemsCount: 18,
        relevantChangesCount: 12,
        events: [
          { time: '07:45', title: 'Pico de ingresos en cola central superó el percentil 95.', category: 'threshold' },
          { time: '08:30', title: 'FOCUS elevó la prioridad del Proceso Central a Crítica.', category: 'escalation' },
          { time: '09:10', title: '8 elementos superaron el tiempo habitual simultáneamente.', category: 'new' },
          { time: '10:05', title: 'Se detectó desvío en la tasa de resolución del Equipo Norte.', category: 'new' },
        ],
      },
      anomaly: {
        id: 'a-high',
        title: 'Tasa de entrada vs resolución',
        headline: 'La tasa de entrada superó en un 240% la tasa de desahogo.',
        description: 'En este periodo habitualmente la entrada se desacelera. Hoy se registró una aceleración no programada.',
        usualBehavior: 'Entrada decreciente (-15% por hora).',
        currentBehavior: 'Entrada creciente (+48% por hora).',
        isCritical: true,
        isUnusual: true,
        insight: 'Comportamiento inédito en los últimos 90 días de registro.',
      },
      stable: {
        monitoredProcessesCount: 6,
        noCriticalBlockers: false,
        regularTimingsCount: 6,
        noOtherAnomalies: false,
        editorialNote: '6 áreas continúan en régimen normal mientras el núcleo central absorbe la contingencia.',
      },
      estimatedReadTime: '~1.5 min',
      completionTime: '1 min 45 s',
    };
  }

  // Default Scenario: Attention (The canonical FOCUS demonstration scenario)
  const perspectiveTitles: Record<FocusPerspective, { headline: string; subtitle: string; perspectiveFocus: string }> = {
    executive: {
      headline: 'Hay un asunto que merece tu atención primero.',
      subtitle: 'Un proceso importante está tardando mucho más de lo habitual.',
      perspectiveFocus: 'Impacto operacional en la entrega general del periodo.',
    },
    coordination: {
      headline: 'Hay un cuello de botella que frena al equipo.',
      subtitle: 'El flujo de asignaciones en el Punto B está bloqueando el avance.',
      perspectiveFocus: 'Redistribución de casos y balanceo de carga activa.',
    },
    analyst: {
      headline: '12 casos específicos concentran la anomalía de tiempo.',
      subtitle: 'El tiempo promedio subió de 2.1 a 5.8 días en validación.',
      perspectiveFocus: 'Análisis de causas raíz y trazabilidad técnica.',
    },
    personal: {
      headline: 'Tienes 2 asuntos pendientes que impactan a tu equipo.',
      subtitle: 'La revisión del Punto B espera tu confirmación para avanzar.',
      perspectiveFocus: 'Asuntos directos bajo tu ámbito de decisión.',
    },
  };

  const pInfo = perspectiveTitles[perspective];

  return {
    perspective,
    scenario: 'attention',
    greeting: profile.greeting,
    userName: profile.name,
    userRole: profile.role,
    summarySentence: 'Detecté 3 asuntos que requieren tu atención. El resto de la operación se mantiene estable.',
    detectedCount: 3,
    dimensions: {
      prioritiesCount: 2,
      prioritiesSummary: '2 asuntos requieren acción inmediata.',
      changesCount: 4,
      changesSummary: '4 cambios relevantes desde tu última visita.',
      anomaliesCount: 1,
      anomaliesSummary: '1 comportamiento inusual detectado.',
      stableCount: 10,
      stableSummary: '10 áreas operan con normalidad.',
    },
    mainPriority: {
      id: 'p-101',
      code: '01 / 03',
      title: 'Proceso de Validación y Cierre',
      headline: pInfo.headline,
      description: 'Un proceso importante está tardando mucho más de lo habitual.',
      affectedCount: 12,
      affectedUnit: 'elementos afectados',
      usualMetric: '2.1 días',
      currentMetric: '5.8 días',
      deltaPercentage: 38,
      startedTimeAgo: 'El deterioro comenzó hace seis días.',
      reasons: [
        {
          number: '01',
          label: 'IMPACTO',
          detail: '12 elementos están afectados.',
        },
        {
          number: '02',
          label: 'DETERIORO',
          detail: 'La situación empeoró +38% frente al tiempo habitual.',
        },
        {
          number: '03',
          label: 'TIEMPO',
          detail: 'El retraso continúa de forma sostenida desde hace seis días.',
        },
        {
          number: '04',
          label: 'CONTEXTO',
          detail: 'Este asunto tiene relación directa con lo que debes supervisar.',
        },
      ],
      explanation: {
        impact: 'Alto',
        impactDescription: 'Afecta directamente el tiempo de ciclo del periodo actual.',
        deterioration: '+38%',
        persistence: '6 días continuos',
        relevance: 'Directa',
        summaryText: 'FOCUS combina estos factores para decidir qué merece tu atención primero.',
        algorithmNote: 'Por eso este asunto aparece como prioridad #1 en tu briefing.',
      },
      actionRecommendation: 'Lo más útil ahora es revisar los elementos que concentran el retraso.',
      keyCases: [
        {
          id: 'c-1042',
          name: 'Caso #1042 · Registro y Validación Inicial',
          impactScore: 88,
          owner: 'Unidad Central',
          delayTime: '6.2 días (habitual 2.0)',
          status: 'En espera en Punto B',
          rootCausePoint: 'Punto de Validación B',
        },
        {
          id: 'c-1089',
          name: 'Caso #1089 · Verificación de Conformidad',
          impactScore: 81,
          owner: 'Equipo Norte',
          delayTime: '5.9 días (habitual 2.2)',
          status: 'Pendiente de firma cruzada',
          rootCausePoint: 'Punto de Validación B',
        },
      ],
    },
    changes: {
      id: 'c-1',
      newItemsCount: 18,
      resolvedItemsCount: 7,
      pendingItemsCount: 2,
      relevantChangesCount: 4,
      events: [
        { time: '08:40', title: 'Nuevo comportamiento detectado en el Punto de Validación B.', category: 'new' },
        { time: '09:15', title: 'Dos elementos superaron el tiempo habitual de procesamiento.', category: 'threshold' },
        { time: '10:05', title: 'Una situación de latencia en la Unidad Este volvió a estado normal.', category: 'resolved' },
        { time: '11:20', title: 'FOCUS elevó este proceso como prioridad #1 del briefing.', category: 'escalation' },
      ],
    },
    anomaly: {
      id: 'a-1',
      title: 'Comportamiento inusual en el flujo',
      headline: 'Esto no suele ocurrir.',
      description: 'Normalmente este indicador disminuye a medida que avanza el periodo. Esta vez está aumentando.',
      usualBehavior: 'Trayectoria descendente hacia el final del ciclo.',
      currentBehavior: 'Trayectoria ascendente anómala (+24% en 48 horas).',
      isCritical: false,
      isUnusual: true,
      insight: 'Es la primera vez que este comportamiento aparece dentro del periodo observado.',
    },
    stable: {
      monitoredProcessesCount: 8,
      noCriticalBlockers: true,
      regularTimingsCount: 8,
      noOtherAnomalies: true,
      editorialNote: '8 procesos funcionan dentro de lo esperado. No existen bloqueos críticos. La mayoría de los tiempos permanecen normales. No aparecieron otras anomalías relevantes.',
    },
    estimatedReadTime: '~1 minuto',
    completionTime: '1 min 08 s',
  };
}

export const ASK_PRESET_SUGGESTIONS: AskSuggestion[] = [
  {
    id: 'sug-1',
    query: '¿Qué debería revisar primero?',
    answer: 'Dos puntos concentran aproximadamente el 70% del deterioro observado. Empezaría por ellos para obtener el mayor impacto inmediato con el menor esfuerzo.',
    subPoints: [
      {
        title: 'Punto de Validación B',
        desc: 'Mayor impacto (acumula 9 de los 12 elementos retrasados).',
      },
      {
        title: 'Caso #1042 y Caso #1089',
        desc: 'Mayor tiempo acumulado sin actividad (6.2 y 5.9 días).',
      },
    ],
    recommendedActionLabel: 'Revisar estos dos casos ahora',
    recommendedActionType: 'focus_cases',
  },
  {
    id: 'sug-2',
    query: '¿Por qué ocurrió este retraso?',
    answer: 'El retraso se originó cuando la tasa de validaciones en el Punto B cayó un 45% tras la actualización de criterios del jueves pasado. No se incrementó el personal de revisión para compensar el nuevo paso documental.',
    subPoints: [
      {
        title: 'Causa primaria',
        desc: 'Nuevo requisito de doble firma sin asignación de suplente.',
      },
      {
        title: 'Efecto acumulado',
        desc: 'Fila de espera pasó de 2 a 12 expedientes en 6 días.',
      },
    ],
    recommendedActionLabel: 'Ver distribución del problema',
    recommendedActionType: 'explore_point',
  },
  {
    id: 'sug-3',
    query: '¿Desde cuándo viene ocurriendo?',
    answer: 'El deterioro comenzó exactamente hace seis días (miércoles 18). Durante los primeros 3 días el impacto fue marginal, pero a partir del quinto día superó el umbral de tolerancia operacional de FOCUS.',
    subPoints: [
      {
        title: 'Día 1 a 3',
        desc: 'Variación leve (2.4 a 3.1 días). Considerado ruido estadístico.',
      },
      {
        title: 'Día 4 a 6',
        desc: 'Crecimiento exponencial hasta alcanzar 5.8 días hoy.',
      },
    ],
    recommendedActionLabel: 'Comparar con periodo anterior',
    recommendedActionType: 'compare_period',
  },
  {
    id: 'sug-4',
    query: '¿Qué cambió respecto a ayer?',
    answer: 'Desde ayer se sumaron 3 elementos adicionales al Punto B y uno de los casos prioritarios (Caso #1042) cumplió 6 días sin transición de estado.',
    subPoints: [
      {
        title: 'Nuevos ingresos',
        desc: '+3 elementos derivados del Equipo Norte.',
      },
      {
        title: 'Alerta de escalación',
        desc: 'FOCUS reclasificó el evento de advertencia a Prioridad #1.',
      },
    ],
  },
  {
    id: 'sug-5',
    query: 'Compáralo con el periodo anterior',
    answer: 'En el ciclo anterior, este mismo proceso mantuvo una media de 2.1 días con una varianza máxima de ±0.3 días. El comportamiento actual representa una desviación de 2.7 desviaciones estándar sobre la media histórica.',
    subPoints: [
      {
        title: 'Periodo anterior',
        desc: 'Tiempo promedio 2.1 días | 98.4% de cumplimiento.',
      },
      {
        title: 'Periodo actual',
        desc: 'Tiempo promedio 5.8 días | 62.1% de cumplimiento.',
      },
    ],
  },
];
