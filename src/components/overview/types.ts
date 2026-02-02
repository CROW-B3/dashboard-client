export interface Pattern {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
}

export interface PatternsSectionProps {
  patterns?: Pattern[];
  onPatternClick?: (pattern: Pattern) => void;
}

export interface Interaction {
  id: string;
  title: string;
  icon: 'store' | 'globe' | 'video';
  location: string;
  time: string;
  isHighlighted?: boolean;
}

export interface LatestInteractionsProps {
  interactions?: Interaction[];
  onInteractionClick?: (interaction: Interaction) => void;
}

export interface MetricsCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral' | 'info';
  chartData?: readonly number[];
  chartColor?: 'violet' | 'rose' | 'gray';
}

export interface DataSourceStatusProps {
  icon: 'web' | 'cctv' | 'social';
  name: string;
  isActive?: boolean;
  statusText: string;
  lastUpdate: string;
}

export interface AskCrowCTAProps {
  suggestedPrompts?: string[];
  onPromptClick?: (prompt: string) => void;
}
