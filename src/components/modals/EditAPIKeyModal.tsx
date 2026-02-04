'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check } from 'lucide-react';

interface EditAPIKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableScopes: string[];
  apiKey?: {
    id: string;
    name: string;
    key: string;
    type: 'secret' | 'publishable';
    scope: string;
    created: string;
    lastUsed: string;
    status: 'active' | 'inactive';
  } | null;
}

export function EditAPIKeyModal({
  isOpen,
  onClose,
  availableScopes,
  apiKey,
}: EditAPIKeyModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    scope: availableScopes[0] || '',
    description: '',
  });

  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    if (apiKey && isOpen) {
      setFormData({
        name: apiKey.name,
        scope: apiKey.scope,
        description: '',
      });
    }
  }, [apiKey, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      scope: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Updating API Key:', { id: apiKey?.id, ...formData });
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCopyKey = () => {
    if (apiKey?.key) {
      navigator.clipboard.writeText(apiKey.key);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const scopeOptions = availableScopes.map((scope) => ({
    value: scope,
    label: scope,
  }));

  if (!apiKey) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{
              background: 'rgba(0, 0, 0, 0.60)',
              backdropFilter: 'blur(4px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleBackdropClick}
          />

          {/* Modal Container */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="w-full max-w-md rounded-2xl border border-white/[0.08] p-8"
              style={{
                background: 'rgba(10, 5, 20, 0.98)',
                boxShadow: '0px 24px 48px rgba(0,0,0,0.5), 0px 0px 1px rgba(139,92,246,0.3)',
                backdropFilter: 'blur(20px)',
              }}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 200, damping: 30 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Edit API Key</h2>
                  <p className="text-xs font-normal mt-1" style={{ color: '#9CA3AF' }}>
                    Manage and update your API key settings
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 transition-colors"
                  style={{
                    color: '#ab9cba',
                  }}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Key Display Section */}
                <div
                  className="rounded-xl p-4 border"
                  style={{
                    backgroundColor: 'rgba(20, 17, 24, 0.5)',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                    API Key
                  </p>
                  <div className="flex items-center gap-2">
                    <div
                      className="flex-1 flex items-center gap-2 font-mono text-xs px-3 py-2 rounded border"
                      style={{
                        backgroundColor: 'rgba(20, 17, 24, 0.8)',
                        borderColor: 'rgba(255, 255, 255, 0.05)',
                        color: '#ab9cba',
                      }}
                    >
                      <span>{apiKey.key}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyKey}
                      className="p-2 rounded-lg transition-colors"
                      style={{
                        backgroundColor: 'rgba(127, 13, 242, 0.1)',
                        color: '#a78bfa',
                      }}
                    >
                      {copiedKey ? (
                        <Check size={16} style={{ color: '#00ff9d' }} />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Key Type Info */}
                <div
                  className="rounded-xl p-4 border"
                  style={{
                    backgroundColor: 'rgba(20, 17, 24, 0.5)',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                    Key Type
                  </p>
                  <span
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border"
                    style={{
                      backgroundColor: 'rgba(20, 17, 24, 0.8)',
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                      color: apiKey.type === 'secret' ? '#7f0df2' : '#ab9cba',
                    }}
                  >
                    {apiKey.type === 'secret' ? '🔒 Secret Key' : '🔓 Publishable Key'}
                  </span>
                </div>

                {/* Created & Last Used Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className="rounded-xl p-3 border"
                    style={{
                      backgroundColor: 'rgba(20, 17, 24, 0.5)',
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <p className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">
                      Created
                    </p>
                    <p className="text-xs text-white font-medium">{apiKey.created}</p>
                  </div>
                  <div
                    className="rounded-xl p-3 border"
                    style={{
                      backgroundColor: 'rgba(20, 17, 24, 0.5)',
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <p className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">
                      Last Used
                    </p>
                    <p className="text-xs text-white font-medium">{apiKey.lastUsed}</p>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />

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
                      onChange={(e) => handleSelectChange(e.target.value)}
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
                    Notes <span style={{ color: '#9CA3AF' }}>(Optional)</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Add notes or changes..."
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

                {/* Status Badge */}
                <div
                  className="rounded-lg p-3 text-xs font-medium flex items-center gap-2"
                  style={{
                    backgroundColor:
                      apiKey.status === 'active'
                        ? 'rgba(0, 255, 157, 0.1)'
                        : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${
                      apiKey.status === 'active'
                        ? 'rgba(0, 255, 157, 0.2)'
                        : 'rgba(239, 68, 68, 0.2)'
                    }`,
                    color: apiKey.status === 'active' ? '#00ff9d' : '#ef4444',
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{
                      backgroundColor: apiKey.status === 'active' ? '#00ff9d' : '#ef4444',
                    }}
                  />
                  Status: <span className="font-bold capitalize">{apiKey.status}</span>
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
                    Close
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors"
                    style={{
                      backgroundColor: '#7f0df2',
                      boxShadow: 'rgba(127, 13, 242, 0.3) 0px 8px 16px',
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
