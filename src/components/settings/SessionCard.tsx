'use client';

import type { Session } from './types';

import { GlassPanel } from '@b3-crow/ui-kit';
import { Laptop, LogOut, Smartphone } from 'lucide-react';
import { useState } from 'react';

interface SessionCardProps {
  session: Session;
  onSignOut?: (sessionId: string) => void;
}

export function SessionCard({ session, onSignOut }: SessionCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getDeviceIcon = () => {
    switch (session.device) {
      case 'mobile':
        return <Smartphone size={16} className="text-violet-400" />;
      case 'laptop':
        return <Laptop size={16} className="text-violet-400" />;
      default:
        return <Laptop size={16} className="text-violet-400" />;
    }
  };

  return (
    <GlassPanel
      variant="light"
      className={`p-4 transition-all ${
        session.isCurrent
          ? 'border-violet-500/30 bg-violet-500/5 border-l-2 border-l-violet-500'
          : 'hover:bg-white/5'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Device Icon */}
          <div className="mt-1">{getDeviceIcon()}</div>

          {/* Device Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-semibold text-white">
                {session.browser}
              </h4>
              {session.isCurrent && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Current
                </span>
              )}
            </div>

            <p className="text-xs text-gray-400 mb-1 truncate">{session.os}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500">{session.location}</span>
              <span className="text-xs text-gray-600">•</span>
              <span className="text-xs text-gray-500">{session.lastActive}</span>
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        {!session.isCurrent && (isHovered || window.innerWidth < 768) && (
          <button
            onClick={() => onSignOut?.(session.id)}
            className="flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            aria-label="Sign out from this session"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </GlassPanel>
  );
}
