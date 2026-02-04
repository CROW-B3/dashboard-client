'use client';

import { Shield, ShieldAlert } from 'lucide-react';

interface Security2FABadgeProps {
  isEnabled: boolean;
}

export function Security2FABadge({ isEnabled }: Security2FABadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${
        isEnabled
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
      }`}
    >
      {isEnabled ? (
        <>
          <Shield size={14} />
          <span className="text-xs font-medium">Protected</span>
        </>
      ) : (
        <>
          <ShieldAlert size={14} />
          <span className="text-xs font-medium">Not Protected</span>
        </>
      )}
    </div>
  );
}
