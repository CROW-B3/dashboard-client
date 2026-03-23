'use client';

import type { ConfidenceLevel, SourceType } from '@b3-crow/ui-kit';

import { cn, CONFIDENCE_CONFIG, SourceIcon } from '@b3-crow/ui-kit';

export interface InteractionData {
  id: string;
  source: SourceType;
  title: string;
  subtitle: string;
  timestamp: string;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
}

export interface InteractionsTableProps {
  interactions: InteractionData[];
  onRowClick?: (interaction: InteractionData) => void;
  className?: string;
}

interface TableColumn {
  label: string;
  width: string;
}

function getInteractionsTableColumns(): TableColumn[] {
  return [
    { label: 'Source', width: 'w-[92px]' },
    { label: 'Summary', width: 'flex-1' },
    { label: 'Timestamp', width: 'w-[100px]' },
    { label: 'Confidence', width: 'w-[100px]' },
  ];
}

function getConfidenceLevelLabel(confidenceLevel: ConfidenceLevel): string {
  const labelMapping: Record<ConfidenceLevel, string> = { high: 'High', medium: 'Med', low: 'Low' };
  return labelMapping[confidenceLevel];
}

export function InteractionsTable({
  interactions,
  onRowClick,
  className,
}: InteractionsTableProps) {
  return (
    <>
      <div
        className={cn('hidden md:block relative z-10 w-full rounded-xl overflow-hidden', className)}
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

      <div className="md:hidden space-y-3">
        {interactions.map((interaction) => (
          <button
            key={interaction.id}
            type="button"
            onClick={() => onRowClick?.(interaction)}
            className="w-full p-4 rounded-lg text-left transition-colors hover:bg-white/[0.05]"
            style={{
              background: 'rgba(10, 5, 20, 0.40)',
              outline: '1px rgba(255, 255, 255, 0.08) solid',
              outlineOffset: '-1px',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex-1 min-w-0">
                <SourceIcon source={interaction.source} />
              </div>
              <span
                className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-medium whitespace-nowrap"
                style={{
                  color: CONFIDENCE_CONFIG[interaction.confidenceLevel].color,
                  background: CONFIDENCE_CONFIG[interaction.confidenceLevel].bg,
                  outline: `1px ${CONFIDENCE_CONFIG[interaction.confidenceLevel].border} solid`,
                  outlineOffset: '-1px',
                }}
              >
                {interaction.confidence.toFixed(2)}
              </span>
            </div>

            <div className="mb-3">
              <p
                className="text-sm font-medium mb-1 break-words"
                style={{ color: '#E5E7EB', lineHeight: '20px' }}
              >
                {interaction.title}
              </p>
              <p
                className="text-xs break-words"
                style={{ color: '#6B7280', lineHeight: '16px' }}
              >
                {interaction.subtitle}
              </p>
            </div>

            <div className="space-y-2 mb-3 text-xs">
              <div style={{ color: '#9CA3AF' }}>
                <span className="text-gray-500">Time:</span> {interaction.timestamp}
              </div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

function TableHeader() {
  const columns = getInteractionsTableColumns();

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
  const confidenceStyle = CONFIDENCE_CONFIG[interaction.confidenceLevel];
  const confidenceLabel = getConfidenceLevelLabel(interaction.confidenceLevel);

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
      <div className="w-[72px] shrink-0">
        <SourceIcon source={interaction.source} />
      </div>

      <div className="flex-1 min-w-0 pr-4">
        <p
          className="text-sm font-medium mb-0.5 truncate"
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

      <div className="w-[100px]">
        <span
          className="text-sm"
          style={{ color: '#9CA3AF', lineHeight: '20px' }}
        >
          {interaction.timestamp}
        </span>
      </div>

      <div className="w-[90px] shrink-0">
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-medium whitespace-nowrap"
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
    </button>
  );
}
