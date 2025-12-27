'use client';

import type { AskCrowCTAProps } from './types';

import { GlassPanel } from '@b3-crow/ui-kit';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

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
    <GlassPanel variant="heavy" className="p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/[0.03] to-transparent pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex-1">
          <div className="text-xs font-bold uppercase tracking-wider text-violet-400 mb-2">
            ASK CROW
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Ask CROW</h3>
          <p className="text-sm text-gray-400 mb-4">
            Get a quick explanation or drill-down from this overview.
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => onPromptClick?.(prompt)}
                aria-label={`Ask CROW: ${prompt}`}
                className="h-[30px] px-3 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors"
              >
                <span className="text-xs text-gray-300">{prompt}</span>
              </button>
            ))}
            <span className="text-[10px] text-gray-600 ml-2">Opens the Ask CROW workspace.</span>
          </div>
        </div>

        <Link
          href="/ask-crow"
          aria-label="Open Ask CROW workspace"
          className="h-10 px-5 rounded-lg flex items-center gap-2 flex-shrink-0 bg-violet-600 shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:opacity-90 transition-opacity"
        >
          <span className="text-sm font-medium text-white">Open Ask CROW</span>
          <ArrowRight size={16} className="text-white" strokeWidth={2} />
        </Link>
      </div>
    </GlassPanel>
  );
}
