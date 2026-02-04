'use client';

import type { FilterOption, FilterConfig } from '@b3-crow/ui-kit';
import {
  DEFAULT_SEVERITY_OPTIONS,
  DEFAULT_SORT_OPTIONS,
  DEFAULT_STORE_OPTIONS,
  DEFAULT_TIME_OPTIONS,
  MultiFilterBar,
} from '@b3-crow/ui-kit';

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

function getPatternSourceOptions(): FilterOption[] {
  return [
    { label: 'All', value: 'all' },
    { label: 'Web', value: 'web' },
    { label: 'CCTV', value: 'cctv' },
    { label: 'Social', value: 'social' },
  ];
}

export function PatternsFilterBar({
  severityOptions = DEFAULT_SEVERITY_OPTIONS,
  storeOptions = DEFAULT_STORE_OPTIONS,
  timeOptions = DEFAULT_TIME_OPTIONS,
  sortOptions = DEFAULT_SORT_OPTIONS,
  activeSource = 'all',
  onSeverityChange,
  onSourceChange,
  onStoreChange,
  onTimeChange,
  onSortChange,
  onExport,
  className,
}: PatternsFilterBarProps) {
  const filters: FilterConfig[] = [
    {
      label: 'Severity: All',
      options: severityOptions,
      onChange: onSeverityChange,
      showBorder: true,
    },
    {
      label: 'Source: ' + (activeSource.charAt(0).toUpperCase() + activeSource.slice(1)),
      options: getPatternSourceOptions(),
      onChange: (value) => onSourceChange?.(value as SourceFilter),
    },
    {
      label: 'Store: All',
      options: storeOptions,
      onChange: onStoreChange,
    },
    {
      label: 'Time: 7d',
      options: timeOptions,
      onChange: onTimeChange,
    },
    {
      label: 'Sort: Most recent',
      options: sortOptions,
      onChange: onSortChange,
    },
  ];

  return (
    <MultiFilterBar
      filters={filters}
      onExport={onExport}
      showSearch={false}
      showActions={true}
      className={className}
    />
  );
}
