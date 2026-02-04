'use client';

import type { ConfidenceLevel, MetricItem, SourceType } from '@b3-crow/ui-kit';

import {
  cn,
  ConfidenceBadge,
  DetailPanel,
  DetailSection,
  EvidenceList,
  MetricsGrid,
  SourceIcon,
  Tag,
} from '@b3-crow/ui-kit';
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

  return (
    <DetailPanel
      isOpen={isOpen}
      onClose={onClose}
      title={interaction.title}
      subtitle={interaction.subtitle}
      width="lg"
    >
      <HeaderSection interaction={interaction} />
      <ConfidenceSection interaction={interaction} />
      {interaction.description && <DescriptionSection description={interaction.description} />}
      {interaction.evidence && interaction.evidence.length > 0 && (
        <EvidenceSectionComponent evidence={interaction.evidence} />
      )}
      {interaction.sourceData && interaction.sourceData.length > 0 && (
        <SourceDataSection sourceData={interaction.sourceData} />
      )}
      {interaction.metrics && interaction.metrics.length > 0 && (
        <MetricsSectionComponent metrics={interaction.metrics} />
      )}
      <ActionsSection />
    </DetailPanel>
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

function ConfidenceSection({ interaction }: { interaction: InteractionDetail }) {
  return (
    <ConfidenceBadge
      confidence={interaction.confidence}
      confidenceLevel={interaction.confidenceLevel}
      showLabel
      showPercentage
    />
  );
}

function DescriptionSection({ description }: { description: string }) {
  return (
    <DetailSection title="Description" icon={<FileText size={14} />}>
      <p className="text-sm leading-relaxed" style={{ color: '#D1D5DB' }}>
        {description}
      </p>
    </DetailSection>
  );
}

function EvidenceSectionComponent({ evidence }: { evidence: EvidenceItem[] }) {
  return (
    <DetailSection title="Supporting Evidence" icon={<Activity size={14} />}>
      <EvidenceList items={evidence} />
    </DetailSection>
  );
}

function SourceDataSection({ sourceData }: { sourceData: SourceDataItem[] }) {
  return (
    <DetailSection title="Source Data" icon={<FileText size={14} />}>
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
    </DetailSection>
  );
}

function MetricsSectionComponent({ metrics }: { metrics: MetricItem[] }) {
  return (
    <DetailSection title="Related Metrics" icon={<TrendingUp size={14} />}>
      <MetricsGrid metrics={metrics} columns={2} />
    </DetailSection>
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

