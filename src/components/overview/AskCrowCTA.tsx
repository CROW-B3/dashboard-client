'use client';

import type { AskCrowCTAProps } from './types';

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
    <div
      className="rounded-xl p-6 relative overflow-hidden"
      style={{
        background: 'rgba(255, 255, 255, 0.01)',
        outline: '1px solid rgba(255, 255, 255, 0.06)',
        outlineOffset: '-1px',
      }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6]/[0.03] to-[#8B5CF6]/0 pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex-1">
          {/* Label: #A78BFA, 12px, 700, uppercase, line-height 16, letter-spacing 0.6 */}
          <div style={{ color: '#A78BFA', fontSize: 12, fontWeight: 700, lineHeight: '16px', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8 }}>ASK CROW</div>
          {/* Title: white, 18px, 600, line-height 28 */}
          <h3 style={{ color: 'white', fontSize: 18, fontWeight: 600, lineHeight: '28px', marginBottom: 8 }}>Ask CROW</h3>
          {/* Description: #9CA3AF, 14px, 400, line-height 20 */}
          <p style={{ color: '#9CA3AF', fontSize: 14, fontWeight: 400, lineHeight: '20px', marginBottom: 16 }}>Get a quick explanation or drill-down from this overview.</p>

          <div className="flex items-center gap-2 flex-wrap">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => onPromptClick?.(prompt)}
                aria-label={`Ask CROW: ${prompt}`}
                className="h-[30px] px-3 rounded-lg hover:bg-white/[0.05] transition-colors"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                {/* Prompt: #D1D5DB, 12px, 400, line-height 16 */}
                <span style={{ color: '#D1D5DB', fontSize: 12, fontWeight: 400, lineHeight: '16px' }}>{prompt}</span>
              </button>
            ))}
            {/* Helper: #4B5563, 10px, 400, line-height 15 */}
            <span style={{ color: '#4B5563', fontSize: 10, fontWeight: 400, lineHeight: '15px', marginLeft: 8 }}>Opens the Ask CROW workspace.</span>
          </div>
        </div>

        <Link
          href="/ask-crow"
          aria-label="Open Ask CROW workspace"
          className="h-10 px-5 rounded-lg flex items-center gap-2 flex-shrink-0 hover:opacity-90 transition-opacity"
          style={{
            background: '#7C3AED',
            boxShadow: '0px 0px 15px 0px rgba(124, 58, 237, 0.30)',
          }}
        >
          {/* Button text: white, 14px, 500, line-height 20 */}
          <span style={{ color: 'white', fontSize: 14, fontWeight: 500, lineHeight: '20px' }}>Open Ask CROW</span>
          <ArrowRight size={16} color="white" strokeWidth={2} />
        </Link>
      </div>
    </div>
  );
}
