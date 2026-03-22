'use client';

import type { ConfidenceLevel, MetricItem, SourceType } from '@b3-crow/ui-kit';

import { cn, CONFIDENCE_CONFIG, SidePanel, SourceIcon } from '@b3-crow/ui-kit';
import { Activity, Clock, ExternalLink, FileText, TrendingUp } from 'lucide-react';

export interface InteractionDetail {
  id: string;
  source: SourceType;
  title: string;
  subtitle: string;
  timestamp: string;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  description?: string;
  evidence?: EvidenceItem[];
  sourceData?: SourceDataItem[];
  metrics?: MetricItem[];
}

export interface EvidenceItem {
  id: string;
  type: 'screenshot' | 'log' | 'video' | 'document';
  title: string;
  timestamp: string;
  preview?: string;
}

export interface SourceDataItem {
  label: string;
  value: string;
}

export interface InteractionDetailPanelProps {
  interaction: InteractionDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InteractionDetailPanel({
  interaction,
  isOpen,
  onClose,
}: InteractionDetailPanelProps) {
  if (!interaction) return null;

  const confidenceStyle = CONFIDENCE_CONFIG[interaction.confidenceLevel];

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={interaction.title}
      subtitle={interaction.subtitle}
      width="lg"
    >
      <div className="p-6 space-y-6">
        <HeaderSection interaction={interaction} />
        <ConfidenceSection interaction={interaction} confidenceStyle={confidenceStyle} />
        {interaction.description && <DescriptionSection description={interaction.description} />}
        {interaction.evidence && interaction.evidence.length > 0 && (
          <EvidenceSection evidence={interaction.evidence} />
        )}
        {interaction.sourceData && interaction.sourceData.length > 0 && (
          <SourceDataSection sourceData={interaction.sourceData} />
        )}
        {interaction.metrics && interaction.metrics.length > 0 && (
          <MetricsSection metrics={interaction.metrics} />
        )}
      </div>
    </SidePanel>
  );
}

function HeaderSection({ interaction }: { interaction: InteractionDetail }) {
  return (
    <div className="flex items-start gap-4">
      <SourceIcon source={interaction.source} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-sm" style={{ color: '#9CA3AF' }}>
          <Clock size={14} />
          <span>{interaction.timestamp}</span>
        </div>
      </div>
    </div>
  );
}

interface ConfidenceSectionProps {
  interaction: InteractionDetail;
  confidenceStyle: typeof CONFIDENCE_CONFIG.high;
}

function ConfidenceSection({ interaction, confidenceStyle }: ConfidenceSectionProps) {
  const percentage = Math.round(interaction.confidence * 100);

  return (
    <div
      className="p-4 rounded-xl"
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6B7280' }}>
          Confidence Score
        </span>
        <span
          className="text-sm font-semibold px-2.5 py-1 rounded-lg"
          style={{
            color: confidenceStyle.color,
            background: confidenceStyle.bg,
            border: `1px solid ${confidenceStyle.border}`,
          }}
        >
          {confidenceStyle.label}
        </span>
      </div>
      <div className="flex items-end gap-3">
        <span className="text-3xl font-bold" style={{ color: confidenceStyle.color }}>
          {percentage}%
        </span>
        <div className="flex-1 h-2 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${percentage}%`, background: confidenceStyle.color }}
          />
        </div>
      </div>
    </div>
  );
}

function DescriptionSection({ description }: { description: string }) {
  return (
    <Section title="Description" icon={<FileText size={14} />}>
      <p className="text-sm leading-relaxed" style={{ color: '#D1D5DB' }}>
        {description}
      </p>
    </Section>
  );
}

function EvidenceSection({ evidence }: { evidence: EvidenceItem[] }) {
  return (
    <Section title="Supporting Evidence" icon={<Activity size={14} />}>
      <div className="space-y-2">
        {evidence.map((item) => (
          <button
            key={item.id}
            type="button"
            className="w-full p-3 rounded-lg text-left transition-colors hover:bg-white/[0.03]"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <EvidenceIcon type={item.type} />
                <span className="text-sm font-medium" style={{ color: '#E5E7EB' }}>
                  {item.title}
                </span>
              </div>
              <ExternalLink size={14} color="#6B7280" />
            </div>
            <p className="text-xs mt-1 ml-6" style={{ color: '#6B7280' }}>
              {item.timestamp}
            </p>
          </button>
        ))}
      </div>
    </Section>
  );
}

function getEvidenceIconStyles(type: EvidenceItem['type']): {
  bgClass: string;
  textClass: string;
  label: string;
} {
  const styleMapping: Record<EvidenceItem['type'], { bgClass: string; textClass: string; label: string }> = {
    screenshot: { bgClass: 'bg-blue-500/20', textClass: 'text-blue-400', label: 'IMG' },
    video: { bgClass: 'bg-red-500/20', textClass: 'text-red-400', label: 'VID' },
    log: { bgClass: 'bg-green-500/20', textClass: 'text-green-400', label: 'LOG' },
    document: { bgClass: 'bg-purple-500/20', textClass: 'text-purple-400', label: 'DOC' },
  };
  return styleMapping[type];
}

function EvidenceIcon({ type }: { type: EvidenceItem['type'] }) {
  const styles = getEvidenceIconStyles(type);
  return (
    <div className={cn('w-4 h-4 rounded flex items-center justify-center', styles.bgClass)}>
      <span className={cn('text-[8px]', styles.textClass)}>{styles.label}</span>
    </div>
  );
}

interface AgentFinding {
  observation?: string;
  evidence?: string;
  significance?: string;
  [key: string]: unknown;
}

interface AgentEntry {
  agentName?: string;
  findings?: AgentFinding[];
  [key: string]: unknown;
}

function isNonEmpty(v: unknown): boolean {
  if (v === null || v === undefined) return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'object') return Object.keys(v).length > 0;
  if (typeof v === 'string') return v.length > 0;
  return true;
}

function tryParseAgentFindings(value: string): AgentEntry[] | null {
  try {
    const parsed = JSON.parse(value);
    if (
      Array.isArray(parsed) &&
      parsed.length > 0 &&
      parsed.some((e: Record<string, unknown>) => e.agentName || e.findings)
    ) {
      return parsed as AgentEntry[];
    }
  } catch { /* not parseable */ }
  return null;
}

function tryParseJson(value: string): unknown | null {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function AgentFindingsDisplay({ agents }: { agents: AgentEntry[] }) {
  return (
    <div className="space-y-4">
      {agents.map((agent, i) => (
        <div key={i}>
          {agent.agentName && (
            <div
              className="text-xs font-semibold uppercase tracking-wide mb-2 px-2 py-1 rounded-md inline-block"
              style={{ color: '#93C5FD', background: 'rgba(59, 130, 246, 0.1)' }}
            >
              {agent.agentName.replace(/-/g, ' ')}
            </div>
          )}
          {agent.findings && agent.findings.length > 0 && (
            <div className="space-y-2">
              {agent.findings.map((finding, j) => (
                <div
                  key={j}
                  className="p-3 rounded-lg"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  {finding.observation && (
                    <p className="text-sm mb-1.5" style={{ color: '#E5E7EB' }}>
                      {finding.observation}
                    </p>
                  )}
                  {finding.evidence && (
                    <p className="text-xs mb-1" style={{ color: '#9CA3AF' }}>
                      <span className="font-medium" style={{ color: '#6B7280' }}>Evidence: </span>
                      {finding.evidence}
                    </p>
                  )}
                  {finding.significance && (
                    <p className="text-xs" style={{ color: '#9CA3AF' }}>
                      <span className="font-medium" style={{ color: '#6B7280' }}>Significance: </span>
                      {finding.significance}
                    </p>
                  )}
                  {Object.entries(finding)
                    .filter(([k, v]) => !['observation', 'evidence', 'significance'].includes(k) && isNonEmpty(v))
                    .map(([k, v]) => (
                      <p key={k} className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                        <span className="font-medium" style={{ color: '#6B7280' }}>{k}: </span>
                        {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                      </p>
                    ))}
                </div>
              ))}
            </div>
          )}
          {Object.entries(agent)
            .filter(([k, v]) => !['agentName', 'findings'].includes(k) && isNonEmpty(v))
            .map(([k, v]) => (
              <div
                key={k}
                className="flex items-center justify-between py-2 border-b last:border-0"
                style={{ borderColor: 'rgba(255,255,255,0.05)' }}
              >
                <span className="text-xs" style={{ color: '#6B7280' }}>{k}</span>
                <span className="text-sm font-medium" style={{ color: '#D1D5DB' }}>
                  {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                </span>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}

interface FinalWhy {
  why?: string;
  confidence?: number;
  category?: string;
  recommendations?: string[];
}

interface DeterministicIssue {
  type?: string;
  severity?: string;
  description?: string;
  metric?: number;
}

function FinalWhysDisplay({ items }: { items: FinalWhy[] }) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div
          key={i}
          className="p-3 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {item.why && <p className="text-sm mb-1.5" style={{ color: '#E5E7EB' }}>{item.why}</p>}
          <div className="flex items-center gap-3 flex-wrap">
            {item.category && (
              <span className="text-[10px] px-2 py-0.5 rounded-md font-medium" style={{ color: '#C084FC', background: 'rgba(192,132,252,0.1)' }}>
                {item.category.replace(/_/g, ' ')}
              </span>
            )}
            {item.confidence !== undefined && (
              <span className="text-xs" style={{ color: '#9CA3AF' }}>
                {Math.round(item.confidence * 100)}% confidence
              </span>
            )}
          </div>
          {item.recommendations && item.recommendations.length > 0 && (
            <div className="mt-2 space-y-1">
              {item.recommendations.map((rec, j) => (
                <p key={j} className="text-xs" style={{ color: '#6EE7B7' }}>→ {rec}</p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function DeterministicIssuesDisplay({ items }: { items: DeterministicIssue[] }) {
  const severityColor: Record<string, string> = { critical: '#F87171', high: '#FBBF24', medium: '#60A5FA', low: '#9CA3AF' };
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-start gap-3 p-2.5 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <span
            className="text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase shrink-0 mt-0.5"
            style={{ color: severityColor[item.severity ?? 'medium'] ?? '#9CA3AF', background: 'rgba(255,255,255,0.05)' }}
          >
            {item.severity ?? 'info'}
          </span>
          <p className="text-sm" style={{ color: '#D1D5DB' }}>{item.description ?? item.type}</p>
        </div>
      ))}
    </div>
  );
}

function SourceDataSection({ sourceData }: { sourceData: SourceDataItem[] }) {
  const agentItem = sourceData.find((item) => tryParseAgentFindings(item.value));
  const agents = agentItem ? tryParseAgentFindings(agentItem.value) : null;

  const remainingItems = sourceData.filter((item) => {
    if (item === agentItem) return false;
    const parsed = tryParseJson(item.value);
    if (Array.isArray(parsed) && parsed.length === 0) return false;
    if (parsed && typeof parsed === 'object' && Object.keys(parsed).length === 0) return false;
    if (item.value === '[]' || item.value === '{}') return false;
    return true;
  });

  const finalWhysItem = remainingItems.find((item) => item.label === 'finalWhys');
  const deterministicItem = remainingItems.find((item) => item.label === 'deterministicIssues');

  const finalWhys = finalWhysItem ? (tryParseJson(finalWhysItem.value) as FinalWhy[] | null) : null;
  const deterministicIssues = deterministicItem ? (tryParseJson(deterministicItem.value) as DeterministicIssue[] | null) : null;

  const otherItems = remainingItems.filter((item) => item !== finalWhysItem && item !== deterministicItem);

  return (
    <Section title="Source Data" icon={<FileText size={14} />}>
      {agents && <AgentFindingsDisplay agents={agents} />}
      {deterministicIssues && Array.isArray(deterministicIssues) && deterministicIssues.length > 0 && (
        <div className={cn(agents ? 'mt-4' : '')}>
          <span className="text-xs font-semibold uppercase tracking-wide block mb-2" style={{ color: '#FBBF24' }}>
            Performance Issues
          </span>
          <DeterministicIssuesDisplay items={deterministicIssues} />
        </div>
      )}
      {finalWhys && Array.isArray(finalWhys) && finalWhys.length > 0 && (
        <div className="mt-4">
          <span className="text-xs font-semibold uppercase tracking-wide block mb-2" style={{ color: '#C084FC' }}>
            Key Conclusions
          </span>
          <FinalWhysDisplay items={finalWhys} />
        </div>
      )}
      {otherItems.length > 0 && (
        <div className={cn(agents || finalWhys || deterministicIssues ? 'mt-4' : '', 'space-y-2')}>
          {otherItems.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-2 border-b last:border-0"
              style={{ borderColor: 'rgba(255,255,255,0.05)' }}
            >
              <span className="text-xs" style={{ color: '#6B7280' }}>{item.label}</span>
              <span className="text-sm font-medium truncate max-w-[60%] text-right" style={{ color: '#D1D5DB' }}>{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

function MetricsSection({ metrics }: { metrics: MetricItem[] }) {
  return (
    <Section title="Related Metrics" icon={<TrendingUp size={14} />}>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className="p-3 rounded-lg"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <p className="text-xs mb-1" style={{ color: '#6B7280' }}>{metric.label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold" style={{ color: '#F3F4F6' }}>{metric.value}</span>
              {metric.change && (
                <span
                  className="text-xs font-medium"
                  style={{
                    color: metric.changeType === 'positive' ? '#4ADE80' : metric.changeType === 'negative' ? '#F87171' : '#9CA3AF',
                  }}
                >
                  {metric.change}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function Section({ title, icon, children }: SectionProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span style={{ color: '#6B7280' }}>{icon}</span>
        <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6B7280' }}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}
