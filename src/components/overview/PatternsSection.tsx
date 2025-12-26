'use client';

import type { Pattern, PatternsSectionProps } from './types';

import { ArrowRight, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export type { Pattern, PatternsSectionProps };

const severityStyles = {
  high: { bg: 'rgba(139, 92, 246, 0.20)', text: '#C4B5FD', border: 'rgba(139, 92, 246, 0.20)' },
  medium: { bg: 'rgba(139, 92, 246, 0.10)', text: '#A78BFA', border: 'rgba(139, 92, 246, 0.10)' },
  low: { bg: 'rgba(107, 114, 128, 0.10)', text: '#9CA3AF', border: 'rgba(107, 114, 128, 0.10)' },
};

const defaultPatterns: Pattern[] = [
  {
    id: '1',
    title: 'Checkout Drop-off Spike',
    description: 'Unusual abandonment rate detected at step 3 payment gateway.',
    severity: 'high',
  },
  {
    id: '2',
    title: 'Store A24 Traffic Anomalies',
    description: 'Foot traffic mismatch with POS transactions during peak hours.',
    severity: 'medium',
  },
  {
    id: '3',
    title: 'Positive Sentiment Surge',
    description: 'Brand mentions increasing following the weekend campaign.',
    severity: 'low',
  },
];

export function PatternsSection({
  patterns = defaultPatterns,
  onPatternClick,
}: PatternsSectionProps) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'rgba(255, 255, 255, 0.01)',
        outline: '1px solid rgba(255, 255, 255, 0.06)',
        outlineOffset: '-1px',
      }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{
          background: 'rgba(255, 255, 255, 0.01)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        {/* Title: white, 14px, 600, line-height 20 */}
        <h3 style={{ color: 'white', fontSize: 14, fontWeight: 600, lineHeight: '20px' }}>Top Patterns</h3>
        <Link
          href="/patterns"
          className="flex items-center gap-1 hover:opacity-80 transition-opacity"
        >
          {/* Link: #A78BFA, 12px, 400, line-height 16 */}
          <span style={{ color: '#A78BFA', fontSize: 12, fontWeight: 400, lineHeight: '16px' }}>View all patterns</span>
          <ArrowRight size={14} color="#A78BFA" strokeWidth={2} />
        </Link>
      </div>

      {/* Pattern list */}
      <div className="p-4 space-y-1">
        {patterns.map((pattern) => {
          const severity = severityStyles[pattern.severity];
          return (
            <button
              key={pattern.id}
              type="button"
              onClick={() => onPatternClick?.(pattern)}
              aria-label={`View pattern: ${pattern.title}`}
              className="w-full px-3 py-3 rounded-lg hover:bg-white/[0.02] transition-all text-left group"
            >
              <div className="flex items-center gap-3 mb-1">
                {/* Item title: #E5E7EB, 14px, 500, line-height 20 */}
                <h4 style={{ color: '#E5E7EB', fontSize: 14, fontWeight: 500, lineHeight: '20px' }}>{pattern.title}</h4>
                <span
                  className="px-1.5 py-0.5 rounded-lg"
                  style={{ background: severity.bg, outline: `1px solid ${severity.border}`, outlineOffset: '-1px' }}
                >
                  {/* Severity: 9px, 700, uppercase, line-height 13.5, letter-spacing 0.45 */}
                  <span style={{ fontSize: 9, fontWeight: 700, lineHeight: '13.5px', letterSpacing: 0.45, textTransform: 'uppercase', color: severity.text }}>{pattern.severity}</span>
                </span>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight size={14} color="#4B5563" strokeWidth={2} />
                </div>
              </div>
              {/* Description: #6B7280, 12px, 400, line-height 16 */}
              <p style={{ color: '#6B7280', fontSize: 12, fontWeight: 400, lineHeight: '16px' }}>{pattern.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
