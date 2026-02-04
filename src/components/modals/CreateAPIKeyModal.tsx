'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { BaseModal } from '@b3-crow/ui-kit';

interface CreateAPIKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableScopes: string[];
}

export function CreateAPIKeyModal({
  isOpen,
  onClose,
  availableScopes,
}: CreateAPIKeyModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'secret',
    scope: availableScopes[0] || '',
    description: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (value: string, field: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating API Key:', formData);
    setFormData({
      name: '',
      type: 'secret',
      scope: availableScopes[0] || '',
      description: '',
    });
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const scopeOptions = availableScopes.map((scope) => ({
    value: scope,
    label: scope,
  }));

  const typeOptions = [
    { value: 'secret', label: 'Secret Key' },
    { value: 'publishable', label: 'Publishable Key' },
  ];

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create API Key"
      subtitle="Generate a new API key for your application"
      closeButton={<X size={20} style={{ color: '#ab9cba' }} />}
      maxWidth="max-w-md"
    >
      {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Input */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Key Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Production Server"
                    className="w-full px-4 py-2.5 rounded-xl text-white text-sm transition-colors"
                    style={{
                      backgroundColor: 'rgba(20, 17, 24, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: '#FFFFFF',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(20, 17, 24, 1)';
                      e.currentTarget.style.borderColor = 'rgba(127, 13, 242, 0.3)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(20, 17, 24, 0.8)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    }}
                    required
                  />
                </div>

                {/* Type Select */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Key Type
                  </label>
                  <div
                    className="relative rounded-xl border overflow-hidden"
                    style={{
                      backgroundColor: 'rgba(20, 17, 24, 0.8)',
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <select
                      value={formData.type}
                      onChange={(e) => handleSelectChange(e.target.value, 'type')}
                      className="w-full px-4 py-2.5 bg-transparent text-white text-sm appearance-none cursor-pointer focus:outline-none"
                      style={{ color: '#FFFFFF' }}
                    >
                      {typeOptions.map((option) => (
                        <option key={option.value} value={option.value} style={{ color: '#000' }}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: '#ab9cba' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M4 6L8 10L12 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Scope Select */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Scope
                  </label>
                  <div
                    className="relative rounded-xl border overflow-hidden"
                    style={{
                      backgroundColor: 'rgba(20, 17, 24, 0.8)',
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <select
                      value={formData.scope}
                      onChange={(e) => handleSelectChange(e.target.value, 'scope')}
                      className="w-full px-4 py-2.5 bg-transparent text-white text-sm appearance-none cursor-pointer focus:outline-none"
                      style={{ color: '#FFFFFF' }}
                    >
                      {scopeOptions.map((option) => (
                        <option key={option.value} value={option.value} style={{ color: '#000' }}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: '#ab9cba' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M4 6L8 10L12 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Description Input */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Description <span style={{ color: '#9CA3AF' }}>(Optional)</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Add a description for this key..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl text-white text-sm resize-none transition-colors"
                    style={{
                      backgroundColor: 'rgba(20, 17, 24, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: '#FFFFFF',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(20, 17, 24, 1)';
                      e.currentTarget.style.borderColor = 'rgba(127, 13, 242, 0.3)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(20, 17, 24, 0.8)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    }}
                  />
                </div>

                {/* Info Message */}
                <div
                  className="rounded-lg p-3 text-xs font-medium"
                  style={{
                    backgroundColor: 'rgba(127, 13, 242, 0.08)',
                    border: '1px solid rgba(127, 13, 242, 0.15)',
                    color: '#a78bfa',
                  }}
                >
                  ⚠️ Save your API key safely. You won't be able to see it again after creation.
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold border transition-colors"
                    style={{
                      backgroundColor: 'transparent',
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                      color: '#ab9cba',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors"
                    style={{
                      backgroundColor: '#7f0df2',
                      boxShadow: 'rgba(127, 13, 242, 0.3) 0px 8px 16px',
                    }}
                  >
                    Create Key
                  </button>
                </div>
              </form>
    </BaseModal>
  );
}
