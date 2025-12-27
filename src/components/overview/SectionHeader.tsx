'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export interface SectionHeaderProps {
  title: string;
  viewAllHref: string;
  viewAllText: string;
}

export function SectionHeader({ title, viewAllHref, viewAllText }: SectionHeaderProps) {
  return (
    <div
      className="px-6 py-4 flex items-center justify-between"
      style={{
        background: 'rgba(255, 255, 255, 0.01)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <Link
        href={viewAllHref}
        className="flex items-center gap-1 hover:opacity-80 transition-opacity"
      >
        <span className="text-xs text-violet-400">{viewAllText}</span>
        <ArrowRight size={14} className="text-violet-400" strokeWidth={2} />
      </Link>
    </div>
  );
}
