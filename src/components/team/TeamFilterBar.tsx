'use client';

import type { FilterOption } from '@b3-crow/ui-kit';
import { cn, FilterDropdown } from '@b3-crow/ui-kit';
import { Search } from 'lucide-react';
import { useState } from 'react';

export interface TeamFilterBarProps {
  roleOptions?: FilterOption[];
  statusOptions?: FilterOption[];
  onRoleChange?: (value: string) => void;
  onStatusChange?: (value: string) => void;
  onSearch?: (query: string) => void;
  className?: string;
}

const defaultRoleOptions: FilterOption[] = [
  { label: 'Role: All', value: 'all' },
  { label: 'Admin', value: 'admin' },
  { label: 'Editor', value: 'editor' },
  { label: 'Viewer', value: 'viewer' },
];

const defaultStatusOptions: FilterOption[] = [
  { label: 'Status: All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Invited', value: 'invited' },
];

export function TeamFilterBar({
  roleOptions = defaultRoleOptions,
  statusOptions = defaultStatusOptions,
  onRoleChange,
  onStatusChange,
  onSearch,
  className,
}: TeamFilterBarProps) {
  const [searchValue, setSearchValue] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Search Input */}
      <div
        className="w-[384px] h-[38px] flex items-center rounded-lg overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          outline: '1px rgba(255, 255, 255, 0.10) solid',
          outlineOffset: '-1px',
        }}
      >
        <div className="pl-3 flex items-center justify-center">
          <Search size={14} color="#6B7280" />
        </div>
        <input
          type="text"
          placeholder="Search members..."
          value={searchValue}
          onChange={handleSearchChange}
          className="flex-1 h-full px-2.5 bg-transparent text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none"
        />
      </div>

      {/* Role Dropdown */}
      <div
        className="h-[38px] flex items-center rounded-lg"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          outline: '1px rgba(255, 255, 255, 0.10) solid',
          outlineOffset: '-1px',
        }}
      >
        <FilterDropdown
          label="Role: All"
          options={roleOptions}
          {...(onRoleChange && { onChange: onRoleChange })}
        />
      </div>

      {/* Status Dropdown */}
      <div
        className="h-[38px] flex items-center rounded-lg"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          outline: '1px rgba(255, 255, 255, 0.10) solid',
          outlineOffset: '-1px',
        }}
      >
        <FilterDropdown
          label="Status: All"
          options={statusOptions}
          {...(onStatusChange && { onChange: onStatusChange })}
        />
      </div>
    </div>
  );
}
