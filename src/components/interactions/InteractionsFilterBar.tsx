'use client';

import type { FilterOption } from '@b3-crow/ui-kit';

import {
  cn,
  DEFAULT_DATE_RANGE_OPTIONS,
  DEFAULT_SOURCE_OPTIONS,
  FilterDropdown,
} from '@b3-crow/ui-kit';
import { Search } from 'lucide-react';
import { useState } from 'react';

export interface InteractionsFilterBarProps {
  dateRangeOptions?: FilterOption[];
  sourceOptions?: FilterOption[];
  onDateRangeChange?: (value: string) => void;
  onSourceChange?: (value: string) => void;
  onSearch?: (query: string) => void;
  className?: string;
}

export function InteractionsFilterBar({
  dateRangeOptions = DEFAULT_DATE_RANGE_OPTIONS,
  sourceOptions = DEFAULT_SOURCE_OPTIONS,
  onDateRangeChange,
  onSourceChange,
  onSearch,
  className,
}: InteractionsFilterBarProps) {
  const [searchValue, setSearchValue] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchValue);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <div
      className={cn(
        'relative z-20 w-full flex flex-col md:flex-row md:items-center gap-2 px-3 md:px-[9px] py-3 md:py-2 rounded-xl whitespace-nowrap flex-wrap',
        className
      )}
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        outline: '1px rgba(255, 255, 255, 0.06) solid',
        outlineOffset: '-1px',
        backdropFilter: 'blur(6px)',
      }}
    >
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
      </div>

      <div className="hidden md:flex flex-1" />

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
              onChange={handleSearchChange}
              className="flex-1 h-full px-2.5 bg-transparent text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
