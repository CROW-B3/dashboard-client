'use client';

import type { FilterOption } from '@b3-crow/ui-kit';

import {
  cn,
  DEFAULT_DATE_RANGE_OPTIONS,
  DEFAULT_SEVERITY_OPTIONS,
  DEFAULT_SITE_OPTIONS,
  DEFAULT_SOURCE_OPTIONS,
  FilterDropdown,
  Tag,
} from '@b3-crow/ui-kit';
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

const defaultActiveTags: string[] = ['Active'];

export function InteractionsFilterBar({
  dateRangeOptions = DEFAULT_DATE_RANGE_OPTIONS,
  sourceOptions = DEFAULT_SOURCE_OPTIONS,
  siteOptions = DEFAULT_SITE_OPTIONS,
  severityOptions = DEFAULT_SEVERITY_OPTIONS,
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
        'relative z-20 w-full flex flex-col md:flex-row md:items-center gap-2 px-3 md:px-[9px] py-3 md:py-0 md:h-[52px] rounded-xl',
        className
      )}
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        outline: '1px rgba(255, 255, 255, 0.06) solid',
        outlineOffset: '-1px',
        backdropFilter: 'blur(6px)',
      }}
    >
      {/* Filters Row 1 - Desktop single row, Mobile stacked */}
      <div className="flex flex-col md:flex-row gap-2 md:items-center w-full md:w-auto">
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
      </div>

      {/* Tags Section */}
      <div
        className="flex items-center gap-1.5 px-[9px] py-2 md:py-0 md:h-[29px] rounded-lg w-full md:w-auto"
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

      <div className="hidden md:flex flex-1" />

      {/* Search and Actions */}
      <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto md:items-center">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 md:flex-initial">
          <div
            className="w-full md:w-[256px] h-[34px] flex items-center rounded-lg overflow-hidden"
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

        <div className="flex items-center gap-2 md:pl-2 md:border-l md:border-white/5 w-full md:w-auto">
          <button
            type="button"
            onClick={onSaveView}
            className="flex-1 md:flex-initial h-[30px] px-3 flex items-center justify-center md:justify-start rounded-lg transition-colors hover:bg-white/5"
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
            className="flex-1 md:flex-initial h-[30px] px-3 flex items-center justify-center rounded-lg transition-colors"
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
    </div>
  );
}
