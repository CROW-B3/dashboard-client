'use client';

import type { SourceType } from '@b3-crow/ui-kit';
import { cn, SourceIcon, Tag } from '@b3-crow/ui-kit';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface InteractionData {
  id: string;
  source: SourceType;
  title: string;
  subtitle: string;
  storeSite: string;
  timestamp: string;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  tags: string[];
}

export interface InteractionsTableProps {
  interactions: InteractionData[];
  onRowClick?: (interaction: InteractionData) => void;
  className?: string;
}

const confidenceConfig: Record<ConfidenceLevel, { color: string; bg: string; border: string }> = {
  high: {
    color: '#4ADE80',
    bg: 'rgba(34, 197, 94, 0.10)',
    border: 'rgba(34, 197, 94, 0.20)',
  },
  medium: {
    color: '#FACC15',
    bg: 'rgba(234, 179, 8, 0.10)',
    border: 'rgba(234, 179, 8, 0.20)',
  },
  low: {
    color: '#9CA3AF',
    bg: 'rgba(107, 114, 128, 0.20)',
    border: 'rgba(107, 114, 128, 0.30)',
  },
};

export function InteractionsTable({
  interactions,
  onRowClick,
  className,
}: InteractionsTableProps) {
  return (
    <div
      className={cn('relative z-10 w-full rounded-xl overflow-hidden', className)}
      style={{
        background: 'rgba(10, 5, 20, 0.40)',
        boxShadow: '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        outline: '1px rgba(255, 255, 255, 0.08) solid',
        outlineOffset: '-1px',
        backdropFilter: 'blur(8px)',
      }}
    >
      <TableHeader />
      <div>
        {interactions.map((interaction, index) => (
          <InteractionRow
            key={interaction.id}
            interaction={interaction}
            onClick={() => onRowClick?.(interaction)}
            showBorder={index > 0}
          />
        ))}
      </div>
    </div>
  );
}

function TableHeader() {
  const columns = [
    { label: 'Source', width: 'w-[92px]', left: 'left-6' },
    { label: 'Interaction Summary', width: 'flex-1' },
    { label: 'Store / Site', width: 'w-[140px]' },
    { label: 'Timestamp', width: 'w-[100px]' },
    { label: 'Confidence', width: 'w-[100px]' },
    { label: 'Tags', width: 'w-[150px]' },
  ];

  return (
    <div
      className="h-[44px] flex items-center px-6 border-b"
      style={{
        background: 'rgba(255, 255, 255, 0.01)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
      }}
    >
      {columns.map((col) => (
        <div
          key={col.label}
          className={cn('text-[10px] font-semibold uppercase tracking-[0.5px]', col.width)}
          style={{ color: '#6B7280' }}
        >
          {col.label}
        </div>
      ))}
    </div>
  );
}

interface InteractionRowProps {
  interaction: InteractionData;
  onClick: () => void;
  showBorder: boolean;
}

function InteractionRow({ interaction, onClick, showBorder }: InteractionRowProps) {
  const confidenceStyle = confidenceConfig[interaction.confidenceLevel];
  const confidenceLabel = interaction.confidenceLevel === 'high' ? 'High' : interaction.confidenceLevel === 'medium' ? 'Med' : 'Low';

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full h-[68px] flex items-center px-6 text-left transition-colors hover:bg-white/[0.02]',
        showBorder && 'border-t'
      )}
      style={{
        borderColor: showBorder ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
      }}
    >
      <div className="w-[92px]">
        <SourceIcon source={interaction.source} />
      </div>

      <div className="flex-1 pr-4">
        <p
          className="text-sm font-medium mb-1 truncate"
          style={{ color: '#E5E7EB', lineHeight: '20px' }}
        >
          {interaction.title}
        </p>
        <p
          className="text-xs truncate"
          style={{ color: '#6B7280', lineHeight: '16px' }}
        >
          {interaction.subtitle}
        </p>
      </div>

      <div className="w-[140px]">
        <span
          className="text-sm"
          style={{ color: '#9CA3AF', lineHeight: '20px' }}
        >
          {interaction.storeSite}
        </span>
      </div>

      <div className="w-[100px]">
        <span
          className="text-sm"
          style={{ color: '#9CA3AF', lineHeight: '20px' }}
        >
          {interaction.timestamp}
        </span>
      </div>

      <div className="w-[100px]">
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-medium"
          style={{
            color: confidenceStyle.color,
            background: confidenceStyle.bg,
            outline: `1px ${confidenceStyle.border} solid`,
            outlineOffset: '-1px',
          }}
        >
          {interaction.confidence.toFixed(2)} {confidenceLabel}
        </span>
      </div>

      <div className="w-[150px] flex items-center gap-1.5">
        {interaction.tags.slice(0, 2).map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
    </button>
  );
}
