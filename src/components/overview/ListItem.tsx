'use client';

import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ListItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
  showChevron?: boolean;
  highlighted?: boolean;
  className?: string;
}

export function ListItem({
  children,
  onClick,
  ariaLabel,
  showChevron = false,
  highlighted = false,
  className,
}: ListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        'w-full px-3 py-3 rounded-lg text-left transition-all group',
        highlighted
          ? 'border-l-2 border-l-violet-500 bg-violet-500/[0.02] pl-3.5'
          : 'hover:bg-white/[0.02]',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">{children}</div>
        {showChevron && (
          <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity mt-1">
            <ChevronRight size={14} className="text-gray-600" strokeWidth={2} />
          </div>
        )}
      </div>
    </button>
  );
}
