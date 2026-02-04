'use client';

import { useState } from 'react';

import type { FormData } from './types';

import { Button, Input } from '@b3-crow/ui-kit';

interface AccountSectionProps {
  initialData: FormData;
  onSave?: (data: FormData) => void;
}

export function AccountSection({ initialData, onSave }: AccountSectionProps) {
  const [formData, setFormData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.includes('@')) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.timezone) {
      newErrors.timezone = 'Timezone is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave?.(formData);
    }
  };

  const timezones = [
    'America/Los_Angeles',
    'America/Denver',
    'America/Chicago',
    'America/New_York',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
  ];

  const languages = ['English', 'Spanish', 'French', 'German', 'Japanese', 'Chinese'];

  return (
    <div className="space-y-6">
      {/* Full Name Field */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2.5">
          Full Name
        </label>
        <Input
          variant="primary"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name || ''}
          className="backdrop-blur-md"
        />
      </div>

      {/* Email Field (disabled) */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2.5">
          Email Address
        </label>
        <div
          className="w-full px-4 py-3 rounded-lg text-white text-sm transition-all duration-300 backdrop-blur-md"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1.5px solid rgba(255, 255, 255, 0.08)',
            boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.3)',
          }}
        >
          {formData.email}
        </div>
        <p className="text-xs text-gray-500 mt-2">Contact support to change your email</p>
      </div>

      {/* Timezone Select */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2.5">
          Timezone
        </label>
        <select
          value={formData.timezone}
          onChange={(e) => handleChange('timezone', e.target.value)}
          className="w-full px-4 py-3 rounded-lg text-white text-sm focus:outline-none transition-all duration-300 backdrop-blur-md"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1.5px solid rgba(255, 255, 255, 0.1)',
            boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.2)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(124, 58, 237, 0.15), inset 0 1px 2px rgba(0, 0, 0, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.4)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = 'inset 0 1px 2px rgba(0, 0, 0, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          }}
        >
          <option value="" disabled>
            Select a timezone
          </option>
          {timezones.map((tz) => (
            <option key={tz} value={tz}>
              {tz.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        {errors.timezone && (
          <p className="text-xs text-red-400 mt-2">{errors.timezone}</p>
        )}
      </div>

      {/* Language Select */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2.5">
          Language
        </label>
        <select
          value={formData.language}
          onChange={(e) => handleChange('language', e.target.value)}
          className="w-full px-4 py-3 rounded-lg text-white text-sm focus:outline-none transition-all duration-300 backdrop-blur-md"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1.5px solid rgba(255, 255, 255, 0.1)',
            boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.2)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(124, 58, 237, 0.15), inset 0 1px 2px rgba(0, 0, 0, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.4)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = 'inset 0 1px 2px rgba(0, 0, 0, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          }}
        >
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-6 border-t border-white/10">
        <button
          onClick={handleSave}
          className="flex-1 h-11 px-6 rounded-xl font-medium text-sm text-white transition-all duration-300 backdrop-blur-md"
          style={{
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.5) 0%, rgba(147, 51, 234, 0.4) 100%)',
            border: '1.5px solid rgba(124, 58, 237, 0.5)',
            boxShadow: '0 8px 32px rgba(124, 58, 237, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 12px 48px rgba(124, 58, 237, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(124, 58, 237, 0.7) 0%, rgba(147, 51, 234, 0.6) 100%)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(124, 58, 237, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(124, 58, 237, 0.5) 0%, rgba(147, 51, 234, 0.4) 100%)';
          }}
        >
          Save Changes
        </button>
        <button
          className="flex-1 h-11 px-6 rounded-xl font-medium text-sm text-gray-300 transition-all duration-300 backdrop-blur-md hover:text-white"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1.5px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 12px 48px rgba(255, 255, 255, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
