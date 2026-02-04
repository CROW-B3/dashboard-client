'use client';

import type { FilterOption, FilterConfig } from '@b3-crow/ui-kit';
import {
  DEFAULT_DATE_RANGE_OPTIONS,
  DEFAULT_SEVERITY_OPTIONS,
  DEFAULT_SITE_OPTIONS,
  DEFAULT_SOURCE_OPTIONS,
  MultiFilterBar,
} from '@b3-crow/ui-kit';

export interface InteractionsFilterBarProps {
  dateRangeOptions?: FilterOption[];
  sourceOptions?: FilterOption[];
  siteOptions?: FilterOption[];
  severityOptions?: FilterOption[];
  activeTags?: string[];
  onDateRangeChange?: (value: string) => void;
  onSourceChange?: (value: string) => void;
  onSiteChange?: (value: string) => void;
  onSeverityChange?: (value: string) => void;
  onTagRemove?: (tag: string) => void;
  onSearch?: (query: string) => void;
  onSaveView?: () => void;
  onExport?: () => void;
  className?: string;
}

function getDefaultInteractionActiveTags(): string[] {
  return ['Active'];
}

export function InteractionsFilterBar({
  dateRangeOptions = DEFAULT_DATE_RANGE_OPTIONS,
  sourceOptions = DEFAULT_SOURCE_OPTIONS,
  siteOptions = DEFAULT_SITE_OPTIONS,
  severityOptions = DEFAULT_SEVERITY_OPTIONS,
  activeTags = getDefaultInteractionActiveTags(),
  onDateRangeChange,
  onSourceChange,
  onSiteChange,
  onSeverityChange,
  onTagRemove,
  onSearch,
  onSaveView,
  onExport,
  className,
}: InteractionsFilterBarProps) {
  const filters: FilterConfig[] = [
    {
      label: 'Date range',
      options: dateRangeOptions,
      onChange: onDateRangeChange,
      showBorder: true,
    },
    {
      label: 'Source: All',
      options: sourceOptions,
      onChange: onSourceChange,
    },
    {
      label: 'Site: Global',
      options: siteOptions,
      onChange: onSiteChange,
    },
    {
      label: 'Severity',
      options: severityOptions,
      onChange: onSeverityChange,
    },
  ];

  return (
    <MultiFilterBar
      filters={filters}
      activeTags={activeTags}
      onTagRemove={onTagRemove}
      onSearch={onSearch}
      onSaveView={onSaveView}
      onExport={onExport}
      searchPlaceholder="Search interactions..."
      showSearch={true}
      showActions={true}
      className={className}
    />
  );
}
