'use client';

import type { FilterOption } from '@b3-crow/ui-kit';

import {
  cn,
  DEFAULT_SEVERITY_OPTIONS,
  DEFAULT_SORT_OPTIONS,
  DEFAULT_TIME_OPTIONS,
  FilterDropdown,
} from '@b3-crow/ui-kit';

export type SourceFilter = 'all' | 'web' | 'cctv' | 'social';

export interface PatternsFilterBarProps {
  severityOptions?: FilterOption[];
  timeOptions?: FilterOption[];
  sortOptions?: FilterOption[];
  activeSource?: SourceFilter;
  timeValue?: string;
  severityValue?: string;
  sortValue?: string;
  onSeverityChange?: (value: string) => void;
  onSourceChange?: (source: SourceFilter) => void;
  onTimeChange?: (value: string) => void;
  onSortChange?: (value: string) => void;
  onExport?: () => void;
  className?: string;
}

interface SourceFilterOption {
  label: string;
  value: SourceFilter;
}

function getPatternSourceFilters(): SourceFilterOption[] {
  return [
    { label: 'Web', value: 'web' },
    { label: 'CCTV', value: 'cctv' },
    { label: 'Social', value: 'social' },
    { label: 'All', value: 'all' },
  ];
}

export function PatternsFilterBar({
  severityOptions = DEFAULT_SEVERITY_OPTIONS,
  timeOptions = DEFAULT_TIME_OPTIONS,
  sortOptions = DEFAULT_SORT_OPTIONS,
  activeSource = 'all',
  timeValue,
  severityValue,
  sortValue,
  onSeverityChange,
  onSourceChange,
  onTimeChange,
  onSortChange,
  onExport,
  className,
}: PatternsFilterBarProps) {
  return (
    <div
      className={cn(
        'relative z-50 w-full flex flex-wrap items-center gap-2 px-[9px] py-2 rounded-xl',
        className
      )}
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        outline: '1px rgba(255, 255, 255, 0.06) solid',
        outlineOffset: '-1px',
        backdropFilter: 'blur(6px)',
        minHeight: '52px',
      }}
    >
      <div className="pr-3 border-r border-white/5 shrink-0">
        <FilterDropdown
          label="Severity: All"
          options={severityOptions}
          {...(severityValue !== undefined ? { value: severityValue } : {})}
          {...(onSeverityChange && { onChange: onSeverityChange })}
        />
      </div>

      <div
        className="h-[34px] flex items-center gap-0 px-[3px] rounded-lg shrink-0"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          outline: '1px rgba(255, 255, 255, 0.10) solid',
          outlineOffset: '-1px',
        }}
      >
        {getPatternSourceFilters().map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => onSourceChange?.(filter.value)}
            className={cn(
              'h-[28px] px-3 flex items-center justify-center rounded-md text-xs font-medium transition-colors',
              activeSource === filter.value
                ? 'text-white'
                : 'text-gray-400 hover:text-gray-300'
            )}
            style={
              activeSource === filter.value
                ? {
                    background: 'rgba(255, 255, 255, 0.08)',
                    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
                  }
                : undefined
            }
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="shrink-0">
        <FilterDropdown
          label="Time"
          options={timeOptions}
          {...(timeValue !== undefined ? { value: timeValue } : {})}
          {...(onTimeChange && { onChange: onTimeChange })}
        />
      </div>

      <div className="flex-1 min-w-[8px]" />

      <div className="flex items-center gap-2 pl-2 border-l border-white/5 shrink-0">
        <div className="hidden lg:block">
          <FilterDropdown
            label="Sort: Most recent"
            options={sortOptions}
            {...(sortValue !== undefined ? { value: sortValue } : {})}
            {...(onSortChange && { onChange: onSortChange })}
          />
        </div>
        <button
          type="button"
          onClick={onExport}
          className="h-[30px] px-3.5 flex items-center justify-center rounded-lg text-xs font-medium transition-colors hover:bg-white/5"
          style={{
            color: '#D1D5DB',
            outline: '1px rgba(255, 255, 255, 0.10) solid',
            outlineOffset: '-1px',
          }}
        >
          Export
        </button>
      </div>
    </div>
  );
}
