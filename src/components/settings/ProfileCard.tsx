'use client';

import type { User } from './types';

import { GlassPanel } from '@b3-crow/ui-kit';
import { Edit2, MapPin } from 'lucide-react';

interface ProfileCardProps {
  user: User;
  onEditClick: () => void;
}

export function ProfileCard({ user, onEditClick }: ProfileCardProps) {
  return (
    <GlassPanel variant="heavy" className="p-6 sticky top-8">
      {/* Avatar Section */}
      <div className="flex flex-col items-center mb-6">
        <div
          className="relative mb-4 group cursor-pointer"
          onClick={onEditClick}
        >
          {/* Gradient ring */}
          <div className="absolute inset-0 rounded-full p-[2px] bg-gradient-to-tr from-violet-500 via-purple-500 to-blue-500" />

          {/* Avatar */}
          <img
            src={user.avatar}
            alt={user.name}
            className="relative w-24 h-24 rounded-full object-cover bg-gray-900"
          />

          {/* Edit overlay */}
          <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Edit2 size={18} className="text-white" />
          </div>

          {/* Online indicator */}
          <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-gray-900" />
        </div>

        {/* User info */}
        <h3 className="text-lg font-semibold text-white text-center mb-1">
          {user.name}
        </h3>
        <p className="text-sm text-gray-400 text-center mb-3">{user.email}</p>

        {/* Role badge */}
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-violet-600/20 border border-violet-500/30 mb-6">
          <span className="text-xs font-medium text-violet-300">{user.role}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6 pt-6 border-t border-white/10">
        <div className="p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-default">
          <p className="text-xs text-gray-400 mb-1">Total Logins</p>
          <p className="text-lg font-semibold text-white">{user.stats.logins}</p>
        </div>
        <div className="p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-default">
          <p className="text-xs text-gray-400 mb-1">Uptime</p>
          <p className="text-lg font-semibold text-white">{user.stats.uptime}</p>
        </div>
      </div>

      {/* Edit Profile Button */}
      <button
        onClick={onEditClick}
        className="w-full h-10 rounded-lg bg-violet-600 text-white font-medium text-sm transition-all hover:bg-violet-700 hover:shadow-neon"
      >
        Edit Public Profile
      </button>

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
        <a
          href="https://support.b3crow.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between w-full px-4 py-2 rounded-lg hover:bg-white/5 transition-colors text-gray-300 hover:text-white text-sm"
        >
          <span>Contact Support</span>
          <MapPin size={14} className="text-gray-500" />
        </a>
        <button className="w-full px-4 py-2 rounded-lg hover:bg-white/5 transition-colors text-gray-300 hover:text-white text-sm text-left">
          View Subscription
        </button>
      </div>
    </GlassPanel>
  );
}
