'use client';

import { useState } from 'react';
import { CheckCircle } from 'lucide-react';

import type { Preferences, AIStyleOption } from './types';


interface PreferencesSectionProps {
  initialPreferences: Preferences;
  onSave?: (preferences: Preferences) => void;
}

export function PreferencesSection({
  initialPreferences,
  onSave,
}: PreferencesSectionProps) {
  const [preferences, setPreferences] = useState<Preferences>(initialPreferences);

  const handleAIStyleChange = (style: AIStyleOption) => {
    const updated = { ...preferences, aiResponseStyle: style };
    setPreferences(updated);
    onSave?.(updated);
  };

  const handleNotificationChange = (
    key: 'emailNotifications' | 'pushNotifications' | 'weeklyDigest',
  ) => {
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    onSave?.(updated);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Notification Preferences */}
      <div className="space-y-6">
        <h4 className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#ab9cba' }}>
          Notifications
        </h4>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white">Email Notifications</span>
              <span className="text-xs" style={{ color: '#ab9cba' }}>
                Important updates via email
              </span>
            </div>
            <input
              type="checkbox"
              checked={preferences.emailNotifications}
              onChange={() => handleNotificationChange('emailNotifications')}
              className="w-5 h-5 rounded accent-[#7f0df2]"
              style={{
                backgroundColor: 'rgba(20, 17, 24, 1)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
              }}
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white">Push Notifications</span>
              <span className="text-xs" style={{ color: '#ab9cba' }}>
                Real-time alerts in the browser
              </span>
            </div>
            <input
              type="checkbox"
              checked={preferences.pushNotifications}
              onChange={() => handleNotificationChange('pushNotifications')}
              className="w-5 h-5 rounded accent-[#7f0df2]"
              style={{
                backgroundColor: 'rgba(20, 17, 24, 1)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
              }}
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white">Weekly Digest</span>
              <span className="text-xs" style={{ color: '#ab9cba' }}>
                Summary of your activity
              </span>
            </div>
            <input
              type="checkbox"
              checked={preferences.weeklyDigest}
              onChange={() => handleNotificationChange('weeklyDigest')}
              className="w-5 h-5 rounded accent-[#7f0df2]"
              style={{
                backgroundColor: 'rgba(20, 17, 24, 1)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
              }}
            />
          </label>
        </div>
      </div>

      {/* AI Response Style */}
      <div className="space-y-6">
        <h4 className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#ab9cba' }}>
          AI Response Style
        </h4>
        <div className="grid grid-cols-1 gap-3">
          {(
            [
              {
                value: 'concise' as const,
                label: 'Concise',
                description: 'Short and direct answers',
              },
              {
                value: 'balanced' as const,
                label: 'Balanced',
                description: 'Complete information',
              },
              {
                value: 'detailed' as const,
                label: 'Detailed',
                description: 'Comprehensive analysis',
              },
            ] as const
          ).map(({ value, label, description }) => (
            <label
              key={value}
              className="relative flex items-center p-4 rounded-xl border cursor-pointer transition-all"
              style={{
                borderColor:
                  preferences.aiResponseStyle === value
                    ? '#7f0df2'
                    : 'rgba(255, 255, 255, 0.08)',
                backgroundColor:
                  preferences.aiResponseStyle === value
                    ? 'rgba(127, 13, 242, 0.05)'
                    : 'rgba(20, 17, 24, 0.4)',
              }}
            >
              <input
                type="radio"
                name="ai-style"
                value={value}
                checked={preferences.aiResponseStyle === value}
                onChange={() => handleAIStyleChange(value)}
                className="hidden"
              />
              <div className="flex-1">
                <p className="text-sm font-bold text-white">{label}</p>
                <p className="text-xs" style={{ color: '#ab9cba' }}>
                  {description}
                </p>
              </div>
              <CheckCircle
                size={20}
                style={{
                  color: '#7f0df2',
                  opacity: preferences.aiResponseStyle === value ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                }}
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
