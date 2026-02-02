import type { SourceType } from '@b3-crow/ui-kit';

export type SeverityLevel = 'high' | 'medium' | 'low';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface PatternData {
  id: string;
  title: string;
  severity: SeverityLevel;
  affectedStores: string;
  lastSeen: string;
  confidence: ConfidenceLevel;
  source?: SourceType;
}

export interface PatternDetail extends PatternData {
  description?: string;
  relatedInteractions?: RelatedInteraction[];
  timeline?: TimelineItem[];
  recommendations?: string[];
  metrics?: MetricItem[];
}

export interface RelatedInteraction {
  id: string;
  title: string;
  timestamp: string;
  source: SourceType;
}

export interface TimelineItem {
  id: string;
  title: string;
  timestamp: string;
  type: 'detection' | 'update' | 'action';
}

export interface MetricItem {
  label: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}
