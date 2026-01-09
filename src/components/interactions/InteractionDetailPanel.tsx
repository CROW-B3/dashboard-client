'use client';

import type { ConfidenceLevel, MetricItem, SourceType } from '@b3-crow/ui-kit';

import { cn, CONFIDENCE_CONFIG, SidePanel, SourceIcon, Tag } from '@b3-crow/ui-kit';
import { Activity, AlertCircle, Clock, ExternalLink, FileText, MapPin, TrendingUp } from 'lucide-react';

export interface InteractionDetail {
  id: string;
  source: SourceType;
  title: string;
  subtitle: string;
  storeSite: string;
  timestamp: string;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  tags: string[];
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
        <ActionsSection />
      </div>
    </SidePanel>
  );
}

function HeaderSection({ interaction }: { interaction: InteractionDetail }) {
  return (
    <div className="flex items-start gap-4">
      <SourceIcon source={interaction.source} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-1.5 text-sm" style={{ color: '#9CA3AF' }}>
            <MapPin size={14} />
            <span>{interaction.storeSite}</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-600" />
          <div className="flex items-center gap-1.5 text-sm" style={{ color: '#9CA3AF' }}>
            <Clock size={14} />
            <span>{interaction.timestamp}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {interaction.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
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

function EvidenceIcon({ type }: { type: EvidenceItem['type'] }) {
  const iconClasses = 'w-4 h-4';
  switch (type) {
    case 'screenshot':
      return <div className={cn(iconClasses, 'rounded bg-blue-500/20 flex items-center justify-center')}><span className="text-[8px] text-blue-400">IMG</span></div>;
    case 'video':
      return <div className={cn(iconClasses, 'rounded bg-red-500/20 flex items-center justify-center')}><span className="text-[8px] text-red-400">VID</span></div>;
    case 'log':
      return <div className={cn(iconClasses, 'rounded bg-green-500/20 flex items-center justify-center')}><span className="text-[8px] text-green-400">LOG</span></div>;
    case 'document':
      return <div className={cn(iconClasses, 'rounded bg-purple-500/20 flex items-center justify-center')}><span className="text-[8px] text-purple-400">DOC</span></div>;
    default:
      return null;
  }
}

function SourceDataSection({ sourceData }: { sourceData: SourceDataItem[] }) {
  return (
    <Section title="Source Data" icon={<FileText size={14} />}>
      <div className="space-y-2">
        {sourceData.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between py-2 border-b last:border-0"
            style={{ borderColor: 'rgba(255,255,255,0.05)' }}
          >
            <span className="text-xs" style={{ color: '#6B7280' }}>{item.label}</span>
            <span className="text-sm font-medium" style={{ color: '#D1D5DB' }}>{item.value}</span>
          </div>
        ))}
      </div>
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

function ActionsSection() {
  return (
    <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
      <button
        type="button"
        className="flex-1 h-10 flex items-center justify-center gap-2 rounded-lg transition-colors hover:bg-white/5"
        style={{
          border: '1px solid rgba(255, 255, 255, 0.10)',
        }}
      >
        <AlertCircle size={16} color="#9CA3AF" />
        <span className="text-sm font-medium" style={{ color: '#D1D5DB' }}>Flag Issue</span>
      </button>
      <button
        type="button"
        className="flex-1 h-10 flex items-center justify-center gap-2 rounded-lg transition-colors"
        style={{
          background: '#7C3AED',
          boxShadow: '0px 0px 10px rgba(124, 58, 237, 0.30)',
        }}
      >
        <ExternalLink size={16} color="white" />
        <span className="text-sm font-medium text-white">View Full Report</span>
      </button>
    </div>
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
