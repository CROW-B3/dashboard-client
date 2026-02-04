'use client';

import type { AskCrowCTAProps } from './types';

import { CTACard } from '@b3-crow/ui-kit';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export type { AskCrowCTAProps };

function getDefaultAskCrowPrompts(): string[] {
  return [
    'Why did conversion drop?',
    'Summarize friction signals',
    'Show top anomalies',
  ];
}

export function AskCrowCTA({
  suggestedPrompts = getDefaultAskCrowPrompts(),
  onPromptClick,
}: AskCrowCTAProps) {
  const actionButton = (
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

  return (
    <CTACard
      badge="ASK CROW"
      title="Ask CROW"
      description="Get a quick explanation or drill-down from this overview."
      suggestions={suggestedPrompts}
      onSuggestionClick={onPromptClick || (() => {})}
      actionButton={actionButton}
      badgeColor="text-violet-400"
    />
  );
}
