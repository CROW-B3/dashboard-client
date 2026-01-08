'use client';

import type { SuggestedPromptsProps } from './types';
import { cn } from '@/lib/utils';

export type { SuggestedPromptsProps };

export function SuggestedPrompts({
  prompts,
  onPromptClick,
  className,
}: SuggestedPromptsProps) {
  if (prompts.length === 0) return null;

  return (
    <div className={cn('flex items-center gap-1.5 sm:gap-2 flex-wrap', className)}>
      {prompts.map((prompt) => (
        <PromptChip
          key={prompt}
          prompt={prompt}
          onClick={() => onPromptClick?.(prompt)}
        />
      ))}
    </div>
  );
}

interface PromptChipProps {
  prompt: string;
  onClick: () => void;
}

function PromptChip({ prompt, onClick }: PromptChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Ask CROW: ${prompt}`}
      className={cn(
        'h-7 sm:h-[30px] px-2.5 sm:px-3 rounded-lg',
        'bg-white/[0.03] border border-white/5',
        'hover:bg-white/[0.05] transition-colors'
      )}
    >
      <span className="text-[10px] sm:text-xs text-gray-300">
        {prompt}
      </span>
    </button>
  );
}
