'use client';

import type { FilterOption } from '@b3-crow/ui-kit';
import { cn, FilterDropdown } from '@b3-crow/ui-kit';
import { useState } from 'react';

export type SourceFilter = 'all' | 'web' | 'cctv' | 'social';

export interface PatternsFilterBarProps {
  severityOptions?: FilterOption[];
  storeOptions?: FilterOption[];
  timeOptions?: FilterOption[];
  sortOptions?: FilterOption[];
  activeSource?: SourceFilter;
  onSeverityChange?: (value: string) => void;
  onSourceChange?: (source: SourceFilter) => void;
  onStoreChange?: (value: string) => void;
  onTimeChange?: (value: string) => void;
  onSortChange?: (value: string) => void;
  onExport?: () => void;
  className?: string;
}

const defaultSeverityOptions: FilterOption[] = [
  { label: 'Severity: All', value: 'all' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];

const defaultStoreOptions: FilterOption[] = [
  { label: 'Store: All', value: 'all' },
  { label: 'NY-04', value: 'ny-04' },
  { label: 'LA-01', value: 'la-01' },
  { label: 'CH-02', value: 'ch-02' },
  { label: 'Global Web', value: 'global-web' },
];

const defaultTimeOptions: FilterOption[] = [
  { label: 'Time: 7d', value: '7d' },
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 24h', value: '24h' },
  { label: 'Last 30d', value: '30d' },
];

const defaultSortOptions: FilterOption[] = [
  { label: 'Sort: Most recent', value: 'recent' },
  { label: 'Severity (High to Low)', value: 'severity-desc' },
  { label: 'Severity (Low to High)', value: 'severity-asc' },
  { label: 'Confidence', value: 'confidence' },
];

const sourceFilters: { label: string; value: SourceFilter }[] = [
  { label: 'Web', value: 'web' },
  { label: 'CCTV', value: 'cctv' },
  { label: 'Social', value: 'social' },
  { label: 'All', value: 'all' },
];

export function PatternsFilterBar({
  severityOptions = defaultSeverityOptions,
  storeOptions = defaultStoreOptions,
  timeOptions = defaultTimeOptions,
  sortOptions = defaultSortOptions,
  activeSource = 'all',
  onSeverityChange,
  onSourceChange,
  onStoreChange,
  onTimeChange,
  onSortChange,
  onExport,
  className,
}: PatternsFilterBarProps) {
  const [currentSource, setCurrentSource] = useState<SourceFilter>(activeSource);

  const handleSourceClick = (source: SourceFilter) => {
    setCurrentSource(source);
    onSourceChange?.(source);
  };

  return (
    <div
      className={cn(
        'relative z-50 w-full min-h-[52px] flex items-center gap-2 px-[9px] py-2 rounded-xl',
        className
      )}
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        outline: '1px rgba(255, 255, 255, 0.06) solid',
        outlineOffset: '-1px',
        backdropFilter: 'blur(6px)',
      }}
    >
      {/* Severity Dropdown with border */}
      <div className="pr-3 border-r border-white/5 shrink-0">
        <FilterDropdown
          label="Severity: All"
          options={severityOptions}
          {...(onSeverityChange && { onChange: onSeverityChange })}
        />
      </div>

      {/* Source Toggle Tabs */}
      <div
        className="h-[34px] flex items-center gap-0 px-[3px] rounded-lg shrink-0"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          outline: '1px rgba(255, 255, 255, 0.10) solid',
          outlineOffset: '-1px',
        }}
      >
        {sourceFilters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => handleSourceClick(filter.value)}
            className={cn(
              'h-[28px] px-3 flex items-center justify-center rounded-md text-xs font-medium transition-colors',
              currentSource === filter.value
                ? 'text-white'
                : 'text-gray-400 hover:text-gray-300'
            )}
            style={
              currentSource === filter.value
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

      {/* Store Dropdown */}
      <div className="shrink-0 hidden sm:block">
        <FilterDropdown
          label="Store: All"
          options={storeOptions}
          {...(onStoreChange && { onChange: onStoreChange })}
        />
      </div>

      {/* Time Dropdown */}
      <div className="shrink-0 hidden sm:block">
        <FilterDropdown
          label="Time: 7d"
          options={timeOptions}
          {...(onTimeChange && { onChange: onTimeChange })}
        />
      </div>

      <div className="flex-1 min-w-2" />

      {/* Right side: Sort + Export */}
      <div className="flex items-center gap-2 pl-2 border-l border-white/5 shrink-0">
        <div className="hidden lg:block">
          <FilterDropdown
            label="Sort: Most recent"
            options={sortOptions}
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
