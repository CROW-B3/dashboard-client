'use client';

import type { AskCrowCTAProps } from './types';

import { GlassPanel } from '@b3-crow/ui-kit';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { SuggestedPrompts } from '@/components/ask-crow';

export type { AskCrowCTAProps };

const defaultPrompts = [
  'Why did conversion drop?',
  'Summarize friction signals',
  'Show top anomalies',
];

export function AskCrowCTA({
  suggestedPrompts = defaultPrompts,
  onPromptClick,
}: AskCrowCTAProps) {
  return (
    <GlassPanel variant="heavy" className="p-4 sm:p-6 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to right, rgba(139, 92, 246, 0.03), transparent)',
        }}
      />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
        <ContentSection
          suggestedPrompts={suggestedPrompts}
          onPromptClick={onPromptClick}
        />

        <OpenAskCrowButton />
      </div>
    </GlassPanel>
  );
}

interface ContentSectionProps {
  suggestedPrompts: string[];
  onPromptClick?: (prompt: string) => void;
}

function ContentSection({
  suggestedPrompts,
  onPromptClick,
}: ContentSectionProps) {
  return (
    <div className="flex-1 min-w-0">
      <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-violet-400 mb-1.5 sm:mb-2">
        ASK CROW
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-white mb-1.5 sm:mb-2">
        Ask CROW
      </h3>
      <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
        Get a quick explanation or drill-down from this overview.
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        <SuggestedPrompts
          prompts={suggestedPrompts}
          onPromptClick={onPromptClick}
        />
        <span className="text-[10px] text-gray-600 hidden sm:inline ml-2">
          Opens the Ask CROW workspace.
        </span>
      </div>
    </div>
  );
}

function OpenAskCrowButton() {
  return (
    <Link
      href="/ask-crow"
      aria-label="Open Ask CROW workspace"
      className="h-10 px-4 sm:px-5 rounded-lg flex items-center justify-center sm:justify-start gap-2 flex-shrink-0 hover:opacity-90 transition-opacity w-full sm:w-auto"
      style={{
        background: '#7C3AED',
        boxShadow: '0 0 15px rgba(124, 58, 237, 0.3)',
      }}
    >
      <span className="text-sm font-medium text-white">
        Open Ask CROW
      </span>
      <ArrowRight size={16} className="text-white" strokeWidth={2} />
    </Link>
  );
}
