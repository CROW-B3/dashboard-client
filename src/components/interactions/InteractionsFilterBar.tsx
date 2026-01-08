'use client';

import type { FilterOption } from '@b3-crow/ui-kit';
import { cn, FilterDropdown, Tag } from '@b3-crow/ui-kit';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';

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
  onSearch?: (query: string) => void;
  onSaveView?: () => void;
  onExport?: () => void;
  className?: string;
}

const defaultDateRangeOptions: FilterOption[] = [
  { label: 'Date range', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 days', value: 'last_7_days' },
  { label: 'Last 30 days', value: 'last_30_days' },
];

const defaultSourceOptions: FilterOption[] = [
  { label: 'Source: All', value: 'all' },
  { label: 'Web', value: 'web' },
  { label: 'CCTV', value: 'cctv' },
  { label: 'Social', value: 'social' },
];

const defaultSiteOptions: FilterOption[] = [
  { label: 'Site: Global', value: 'global' },
  { label: 'Store NY-04', value: 'ny-04' },
  { label: 'Store LA-02', value: 'la-02' },
  { label: 'Store LDN-02', value: 'ldn-02' },
];

const defaultSeverityOptions: FilterOption[] = [
  { label: 'Severity', value: 'all' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];

const defaultActiveTags: string[] = ['Active'];

export function InteractionsFilterBar({
  dateRangeOptions = defaultDateRangeOptions,
  sourceOptions = defaultSourceOptions,
  siteOptions = defaultSiteOptions,
  severityOptions = defaultSeverityOptions,
  activeTags = defaultActiveTags,
  onDateRangeChange,
  onSourceChange,
  onSiteChange,
  onSeverityChange,
  onSearch,
  onSaveView,
  onExport,
  className,
}: InteractionsFilterBarProps) {
  const [searchValue, setSearchValue] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchValue);
  };

  return (
    <div
      className={cn(
        'relative z-20 w-full h-[52px] flex items-center gap-2 px-[9px] rounded-xl',
        className
      )}
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        outline: '1px rgba(255, 255, 255, 0.06) solid',
        outlineOffset: '-1px',
        backdropFilter: 'blur(6px)',
      }}
    >
      <FilterDropdown
        label="Date range"
        options={dateRangeOptions}
        {...(onDateRangeChange && { onChange: onDateRangeChange })}
        showBorder
      />
      <FilterDropdown
        label="Source: All"
        options={sourceOptions}
        {...(onSourceChange && { onChange: onSourceChange })}
      />
      <FilterDropdown
        label="Site: Global"
        options={siteOptions}
        {...(onSiteChange && { onChange: onSiteChange })}
      />
      <FilterDropdown
        label="Severity"
        options={severityOptions}
        {...(onSeverityChange && { onChange: onSeverityChange })}
      />

      <div
        className="h-[29px] flex items-center gap-1.5 px-[9px] rounded-lg"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          outline: '1px rgba(255, 255, 255, 0.10) solid',
          outlineOffset: '-1px',
        }}
      >
        {activeTags.map((tag) => (
          <Tag key={tag} variant="active">{tag}</Tag>
        ))}
        <button
          type="button"
          className="flex items-center text-xs text-gray-600 hover:text-gray-400 transition-colors"
        >
          <Plus size={12} className="mr-0.5" />
          Tag
        </button>
      </div>

      <div className="flex-1" />

      <form onSubmit={handleSearchSubmit} className="relative">
        <div
          className="w-[256px] h-[34px] flex items-center rounded-lg overflow-hidden"
          style={{
            background: 'rgba(0, 0, 0, 0.20)',
            outline: '1px rgba(255, 255, 255, 0.10) solid',
            outlineOffset: '-1px',
          }}
        >
          <div className="pl-3 flex items-center justify-center">
            <Search size={12} color="#6B7280" />
          </div>
          <input
            type="text"
            placeholder="Search interactions..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="flex-1 h-full px-2.5 bg-transparent text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none"
          />
        </div>
      </form>

      <div className="flex items-center gap-2 pl-2 border-l border-white/5">
        <button
          type="button"
          onClick={onSaveView}
          className="h-[30px] px-3 flex items-center rounded-lg transition-colors hover:bg-white/5"
          style={{
            outline: '1px rgba(255, 255, 255, 0.10) solid',
            outlineOffset: '-1px',
          }}
        >
          <span className="text-xs font-medium text-gray-300">Save view</span>
        </button>
        <button
          type="button"
          onClick={onExport}
          className="h-[30px] px-3 flex items-center rounded-lg transition-colors"
          style={{
            background: '#7C3AED',
            boxShadow: '0px 0px 10px rgba(124, 58, 237, 0.30)',
            outline: '1px #8B5CF6 solid',
            outlineOffset: '-1px',
          }}
        >
          <span className="text-xs font-medium text-white">Export</span>
        </button>
      </div>
    </div>
  );
}
