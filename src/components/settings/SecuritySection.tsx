'use client';

import { Lock, Shield, CheckCircle } from 'lucide-react';

interface SecuritySectionProps {
  is2FAEnabled?: boolean;
  onChangePassword?: () => void;
  onConfigure2FA?: () => void;
}

export function SecuritySection({
  is2FAEnabled = false,
  onChangePassword,
  onConfigure2FA,
}: SecuritySectionProps) {
  return (
    <div className="space-y-6">
      {/* Password Card */}
      <div
        className="flex items-center justify-between p-4 rounded-xl border"
        style={{
          backgroundColor: 'rgba(20, 17, 24, 0.4)',
          borderColor: 'rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'rgba(127, 13, 242, 0.1)' }}
          >
            <Lock size={18} style={{ color: '#7f0df2' }} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Password</p>
            <p className="text-xs" style={{ color: '#ab9cba' }}>
              Last changed 3 months ago
            </p>
          </div>
        </div>
        <button
          onClick={onChangePassword}
          className="px-4 py-1.5 rounded-lg border text-xs font-bold transition-colors hover:bg-white/5"
          style={{ borderColor: 'rgba(255, 255, 255, 0.08)', color: '#ffffff' }}
        >
          Change
        </button>
      </div>

      {/* 2FA Card */}
      <div
        className="flex items-center justify-between p-4 rounded-xl border"
        style={{
          backgroundColor: 'rgba(20, 17, 24, 0.4)',
          borderColor: 'rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: is2FAEnabled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}
          >
            {is2FAEnabled ? (
              <CheckCircle size={18} style={{ color: '#10b981' }} />
            ) : (
              <Shield size={18} style={{ color: '#ef4444' }} />
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-white">Two-Factor Authentication</p>
            <p
              className="text-xs font-medium italic"
              style={{ color: is2FAEnabled ? '#10b981' : '#ef4444' }}
            >
              {is2FAEnabled ? 'Protected' : 'Not Protected'}
            </p>
          </div>
        </div>
        <button
          onClick={onConfigure2FA}
          className="px-4 py-1.5 rounded-lg text-xs font-bold text-white shadow-lg transition-all hover:opacity-90"
          style={{
            backgroundColor: '#7f0df2',
            boxShadow: 'rgba(127, 13, 242, 0.2) 0px 8px 16px',
          }}
        >
          {is2FAEnabled ? 'Manage' : 'Enable'}
        </button>
      </div>
    </div>
  );
}
