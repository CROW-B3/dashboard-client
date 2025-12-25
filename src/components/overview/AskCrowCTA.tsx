'use client';

import { GlassPanel } from '@b3-crow/ui-kit';

interface AskCrowCTAProps {
  onOpenClick?: () => void;
}

const suggestedPrompts = [
  'Why did conversion drop?',
  'Summarize friction signals',
  'Show top anomalies',
];

export function AskCrowCTA({ onOpenClick }: AskCrowCTAProps) {
  return (
    <div className="mt-4">
      <GlassPanel
        variant="light"
        className="p-6 relative overflow-hidden group hover:border-violet-500/20 w-full"
      >
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

        {/* Content */}
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1 space-y-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">ASK CROW</span>
              </div>
              <h3 className="text-lg font-semibold text-white">Ask CROW</h3>
              <p className="text-sm text-gray-400 max-w-lg">
                Get a quick explanation or drill-down from this overview.
              </p>
            </div>

            {/* Suggested prompts */}
            <div className="flex flex-wrap items-center gap-2">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] hover:border-violet-500/30 text-xs text-gray-300 transition-all cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
              <span className="text-[10px] text-gray-600 ml-1">Opens the Ask CROW workspace.</span>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={onOpenClick}
            className="shrink-0 px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_20px_rgba(124,58,237,0.5)] flex items-center gap-2"
          >
            Open Ask CROW
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </GlassPanel>
    </div>
  );
}
