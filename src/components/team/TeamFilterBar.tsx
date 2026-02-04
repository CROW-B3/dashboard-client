'use client';

import type { FilterOption, FilterConfig } from '@b3-crow/ui-kit';
import { MultiFilterBar } from '@b3-crow/ui-kit';

export interface TeamFilterBarProps {
  roleOptions?: FilterOption[];
  statusOptions?: FilterOption[];
  onRoleChange?: (value: string) => void;
  onStatusChange?: (value: string) => void;
  onSearch?: (query: string) => void;
  className?: string;
}

function getDefaultTeamRoleOptions(): FilterOption[] {
  return [
    { label: 'Role: All', value: 'all' },
    { label: 'Admin', value: 'admin' },
    { label: 'Editor', value: 'editor' },
    { label: 'Viewer', value: 'viewer' },
  ];
}

function getDefaultTeamStatusOptions(): FilterOption[] {
  return [
    { label: 'Status: All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Invited', value: 'invited' },
  ];
}

export function TeamFilterBar({
  roleOptions = getDefaultTeamRoleOptions(),
  statusOptions = getDefaultTeamStatusOptions(),
  onRoleChange,
  onStatusChange,
  onSearch,
  className,
}: TeamFilterBarProps) {
  const filters: FilterConfig[] = [
    {
      label: 'Role: All',
      options: roleOptions,
      onChange: onRoleChange,
      showBorder: true,
    },
    {
      label: 'Status: All',
      options: statusOptions,
      onChange: onStatusChange,
    },
  ];

  return (
    <MultiFilterBar
      filters={filters}
      onSearch={onSearch}
      searchPlaceholder="Search members..."
      showSearch={true}
      showActions={false}
      className={className}
    />
  );
}
