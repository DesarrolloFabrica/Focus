export type FocusPerspective = 'executive' | 'coordination' | 'analyst' | 'personal';

export type FocusScenario = 'attention' | 'stable' | 'high_activity';

export type FocusCoreState = 
  | 'observing' 
  | 'attention' 
  | 'explaining' 
  | 'change' 
  | 'anomaly' 
  | 'stable' 
  | 'complete' 
  | 'default';

export interface DimensionSummary {
  prioritiesCount: number;
  prioritiesSummary: string;
  changesCount: number;
  changesSummary: string;
  anomaliesCount: number;
  anomaliesSummary: string;
  stableCount: number;
  stableSummary: string;
}

export interface FocusPriority {
  id: string;
  code: string;
  title: string;
  headline: string;
  description: string;
  affectedCount: number;
  affectedUnit: string;
  usualMetric: string;
  currentMetric: string;
  deltaPercentage: number;
  startedTimeAgo: string;
  reasons: {
    number: string;
    label: string;
    detail: string;
  }[];
  explanation: FocusExplanation;
  actionRecommendation: string;
  keyCases: KeyCase[];
}

export interface KeyCase {
  id: string;
  name: string;
  impactScore: number;
  owner: string;
  delayTime: string;
  status: string;
  rootCausePoint: string;
}

export interface FocusExplanation {
  impact: 'Alto' | 'Medio' | 'Crítico';
  impactDescription: string;
  deterioration: string;
  persistence: string;
  relevance: string;
  summaryText: string;
  algorithmNote: string;
}

export interface FocusChange {
  id: string;
  newItemsCount: number;
  resolvedItemsCount: number;
  pendingItemsCount: number;
  relevantChangesCount: number;
  events: {
    time: string;
    title: string;
    category: 'new' | 'threshold' | 'resolved' | 'escalation';
  }[];
}

export interface FocusAnomaly {
  id: string;
  title: string;
  headline: string;
  description: string;
  usualBehavior: string;
  currentBehavior: string;
  isCritical: boolean;
  isUnusual: boolean;
  insight: string;
}

export interface FocusStableSummary {
  monitoredProcessesCount: number;
  noCriticalBlockers: boolean;
  regularTimingsCount: number;
  noOtherAnomalies: boolean;
  editorialNote: string;
}

export interface FocusBriefing {
  perspective: FocusPerspective;
  scenario: FocusScenario;
  greeting: string;
  userName: string;
  userRole: string;
  summarySentence: string;
  detectedCount: number;
  dimensions: DimensionSummary;
  mainPriority: FocusPriority;
  changes: FocusChange;
  anomaly: FocusAnomaly;
  stable: FocusStableSummary;
  estimatedReadTime: string;
  completionTime: string;
}

export interface AskSuggestion {
  id: string;
  query: string;
  answer: string;
  subPoints?: {
    title: string;
    desc: string;
  }[];
  recommendedActionLabel?: string;
  recommendedActionType?: 'focus_cases' | 'compare_period' | 'explore_point';
}
