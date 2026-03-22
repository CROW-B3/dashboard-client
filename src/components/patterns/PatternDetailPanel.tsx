'use client';

import type { MetricItem } from '@b3-crow/ui-kit';
import type { PatternDetail, RelatedInteraction, TimelineItem } from './types';

import {
  cn,
  CONFIDENCE_CONFIG,
  SEVERITY_CONFIG,
  SidePanel,
  SourceIcon,
} from '@b3-crow/ui-kit';
import {
  Activity,
  Clock,
  ExternalLink,
  FileText,
  Lightbulb,
  MapPin,
  TrendingUp
} from 'lucide-react';

export interface PatternDetailPanelProps {
  pattern: PatternDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PatternDetailPanel({
  pattern,
  isOpen,
  onClose,
}: PatternDetailPanelProps) {
  if (!pattern) return null;

  const severityStyle = SEVERITY_CONFIG[pattern.severity];
  const confidenceStyle = CONFIDENCE_CONFIG[pattern.confidence];

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={pattern.title}
      subtitle={`Pattern ID: ${pattern.id}`}
      width="lg"
    >
      <div className="p-6 space-y-6">
        <HeaderSection pattern={pattern} severityStyle={severityStyle} />
        <ConfidenceSection confidenceStyle={confidenceStyle} />
        {pattern.description && <DescriptionSection description={pattern.description} />}
        {pattern.recommendations && pattern.recommendations.length > 0 && (
          <RecommendationsSection recommendations={pattern.recommendations} />
        )}
        {pattern.relatedInteractions && pattern.relatedInteractions.length > 0 && (
          <RelatedInteractionsSection interactions={pattern.relatedInteractions} />
        )}
        {pattern.timeline && pattern.timeline.length > 0 && (
          <TimelineSection timeline={pattern.timeline} />
        )}
        {pattern.metrics && pattern.metrics.length > 0 && (
          <MetricsSection metrics={pattern.metrics} />
        )}
        <ActionsSection />
      </div>
    </SidePanel>
  );
}

interface HeaderSectionProps {
  pattern: PatternDetail;
  severityStyle: typeof SEVERITY_CONFIG.high;
}

function HeaderSection({ pattern, severityStyle }: HeaderSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span
          className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide"
          style={{
            color: severityStyle.color,
            background: severityStyle.bg,
            border: `1px solid ${severityStyle.border}`,
          }}
        >
          {severityStyle.label}
        </span>
        {pattern.source && (
          <SourceIcon source={pattern.source} size="md" />
        )}
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 text-sm" style={{ color: '#9CA3AF' }}>
          <MapPin size={14} />
          <span>{pattern.affectedStores}</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-gray-600" />
        <div className="flex items-center gap-1.5 text-sm" style={{ color: '#9CA3AF' }}>
          <Clock size={14} />
          <span>Last seen: {pattern.lastSeen}</span>
        </div>
      </div>
    </div>
  );
}

interface ConfidenceSectionProps {
  confidenceStyle: typeof CONFIDENCE_CONFIG.high;
}

function ConfidenceSection({ confidenceStyle }: ConfidenceSectionProps) {
  return (
    <div
      className="p-4 rounded-xl"
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6B7280' }}>
          Confidence Level
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
    </div>
  );
}

function DescriptionSection({ description }: { description: string }) {
  return (
    <Section title="Pattern Description" icon={<FileText size={14} />}>
      <p className="text-sm leading-relaxed" style={{ color: '#D1D5DB' }}>
        {description}
      </p>
    </Section>
  );
}

function RecommendationsSection({ recommendations }: { recommendations: string[] }) {
  return (
    <Section title="Recommendations" icon={<Lightbulb size={14} />}>
      <ul className="space-y-2">
        {recommendations.map((rec) => (
          <li
            key={rec}
            className="flex items-start gap-2 text-sm"
            style={{ color: '#D1D5DB' }}
          >
            <span className="text-violet-400 mt-1">•</span>
            <span>{rec}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function RelatedInteractionsSection({ interactions }: { interactions: RelatedInteraction[] }) {
  return (
    <Section title="Related Interactions" icon={<Activity size={14} />}>
      <div className="space-y-2">
        {interactions.map((item) => (
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
                <SourceIcon source={item.source} size="sm" />
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

function TimelineSection({ timeline }: { timeline: TimelineItem[] }) {
  return (
    <Section title="Pattern Timeline" icon={<Clock size={14} />}>
      <div className="space-y-3">
        {timeline.map((item, idx) => (
          <div key={item.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  item.type === 'detection' && 'bg-violet-500',
                  item.type === 'update' && 'bg-blue-500',
                  item.type === 'action' && 'bg-green-500'
                )}
              />
              {idx < timeline.length - 1 && (
                <div className="w-px h-full min-h-[20px] bg-white/10" />
              )}
            </div>
            <div className="pb-3">
              <p className="text-sm font-medium" style={{ color: '#E5E7EB' }}>
                {item.title}
              </p>
              <p className="text-xs" style={{ color: '#6B7280' }}>
                {item.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function MetricsSection({ metrics }: { metrics: MetricItem[] }) {
  return (
    <Section title="Impact Metrics" icon={<TrendingUp size={14} />}>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
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
  return null;
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
