'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Settings } from 'lucide-react';

import { mockFormData, mockPreferences, mockUser } from '@/components/settings/mockData';
import { AccountSection } from '@/components/settings/AccountSection';
import { SecuritySection } from '@/components/settings/SecuritySection';
import { PreferencesSection } from '@/components/settings/PreferencesSection';
import { Enable2FAModal } from '@/components/settings/modals/Enable2FAModal';

import type { TabType, Preferences, FormData } from '@/components/settings/types';

const tabOptions: { label: string; value: TabType }[] = [
  { label: 'Account', value: 'account' },
  { label: 'Security', value: 'security' },
  { label: 'Preferences', value: 'preferences' }
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>('account');
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isEnable2FAOpen, setIsEnable2FAOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [accountFormData, setAccountFormData] = useState<FormData>(mockFormData);
  const [preferences, setPreferences] = useState<Preferences>(mockPreferences);

  const handleEnable2FA = (code: string) => {
    setIs2FAEnabled(true);
    setHasChanges(true);
    console.log('2FA enabled with code:', code);
  };

  const handleAccountChange = (data: FormData) => {
    setAccountFormData(data);
    setHasChanges(true);
    console.log('Account updated:', data);
  };

  const handlePreferencesChange = (prefs: Preferences) => {
    setPreferences(prefs);
    setHasChanges(true);
    console.log('Preferences updated:', prefs);
  };

  const handleDiscard = () => {
    setHasChanges(false);
    setAccountFormData(mockFormData);
    setPreferences(mockPreferences);
  };

  const handleCommit = () => {
    setHasChanges(false);
    console.log('Changes committed');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a090c' }}>
      <main className="pt-14">
        {/* Profile Hero Section */}
        <motion.section
          className="max-w-4xl mx-auto pt-16 pb-12 px-6 text-center relative"
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Gradient Blur Background */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full pointer-events-none"
            style={{
              background: 'rgba(127, 13, 242, 0.1)',
              filter: 'blur(100px)',
            }}
          ></div>

          <div className="relative inline-block mb-6">
            {/* Gradient Border Avatar */}
            <div
              className="w-32 h-32 rounded-full p-1.5"
              style={{
                background: 'linear-gradient(135deg, #7f0df2 0%, transparent 50%, #00ff9d 100%)',
              }}
            >
              <img
                src={mockUser.avatar}
                alt={mockUser.name}
                className="w-full h-full rounded-full bg-cover bg-center border-4"
                style={{ borderColor: '#0a090c' }}
              />
            </div>
            {/* Online Status Indicator */}
            <div
              className="absolute bottom-1 right-2 w-6 h-6 rounded-full border-4 flex items-center justify-center"
              style={{ background: '#00ff9d', borderColor: '#0a090c' }}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#0a090c' }}>
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            </div>
          </div>

          {/* User Info */}
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">{mockUser.name}</h1>
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="font-medium" style={{ color: '#ab9cba' }}>Head of Operations</span>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}></span>
            <span
              className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border"
              style={{
                backgroundColor: 'rgba(127, 13, 242, 0.2)',
                color: '#7f0df2',
                borderColor: 'rgba(127, 13, 242, 0.3)',
              }}
            >
              Company Admin
            </span>
          </div>

        </motion.section>

        {/* Main Content Section */}
        <motion.section
          className="max-w-4xl mx-auto px-6 pb-24 space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {/* Tab Navigation */}
          <motion.div
            className="flex items-center justify-center gap-10 border-b mb-12"
            style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            {tabOptions.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`pb-4 text-sm font-bold transition-colors relative ${
                  activeTab === tab.value ? 'text-white' : 'text-[#ab9cba] hover:text-white'
                }`}
                style={
                  activeTab === tab.value
                    ? {
                        borderBottom: '2px solid #7f0df2',
                        paddingBottom: 'calc(1rem - 2px)',
                      }
                    : {}
                }
              >
                {tab.label}
              </button>
            ))}
          </motion.div>

          {/* Account Section */}
          {activeTab === 'account' && (
            <motion.div
              key="account"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(30, 26, 36, 0.4)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <User size={20} style={{ color: '#7f0df2' }} />
                    <h3 className="text-lg font-bold text-white">Profile Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#ab9cba' }}>
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={accountFormData.name}
                        onChange={(e) => handleAccountChange({ ...accountFormData, name: e.target.value })}
                        className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-all"
                        style={{
                          backgroundColor: 'rgba(20, 17, 24, 0.5)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          color: '#ffffff',
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#ab9cba' }}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={accountFormData.email}
                        disabled
                        className="w-full rounded-xl px-4 py-3 text-sm cursor-not-allowed"
                        style={{
                          backgroundColor: 'rgba(20, 17, 24, 0.3)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          color: '#665d70',
                        }}
                      />
                      <p className="text-[10px] font-medium px-1" style={{ color: '#7f0df2' }}>
                        Contact support to change your email
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#ab9cba' }}>
                        Timezone
                      </label>
                      <select
                        value={accountFormData.timezone}
                        onChange={(e) => handleAccountChange({ ...accountFormData, timezone: e.target.value })}
                        className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-all"
                        style={{
                          backgroundColor: 'rgba(20, 17, 24, 0.5)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          color: '#ffffff',
                        }}
                      >
                        <option>America/Los_Angeles</option>
                        <option>America/New_York</option>
                        <option>Europe/London</option>
                        <option>Europe/Paris</option>
                        <option>Asia/Tokyo</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#ab9cba' }}>
                        Language
                      </label>
                      <select
                        value={accountFormData.language}
                        onChange={(e) => handleAccountChange({ ...accountFormData, language: e.target.value })}
                        className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-all"
                        style={{
                          backgroundColor: 'rgba(20, 17, 24, 0.5)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          color: '#ffffff',
                        }}
                      >
                        <option>English</option>
                        <option>French</option>
                        <option>German</option>
                        <option>Spanish</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div
                  className="p-4 flex justify-end gap-3 border-t"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <button
                    onClick={handleDiscard}
                    className="px-6 py-2 text-sm font-bold transition-colors hover:text-white"
                    style={{ color: '#ab9cba' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleAccountChange(accountFormData)}
                    className="px-8 py-2 rounded-lg text-sm font-bold text-white shadow-lg transition-all hover:opacity-80"
                    style={{
                      backgroundColor: '#7f0df2',
                      boxShadow: 'rgba(127, 13, 242, 0.2) 0px 8px 16px',
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Security Section */}
          {activeTab === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className="rounded-2xl p-8"
                style={{
                  background: 'rgba(30, 26, 36, 0.4)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div className="flex items-center gap-3 mb-8">
                  <Lock size={20} style={{ color: '#7f0df2' }} />
                  <h3 className="text-lg font-bold text-white">Security & Access</h3>
                </div>
                <div className="space-y-6">
                  <SecuritySection
                    is2FAEnabled={is2FAEnabled}
                    onChangePassword={() => console.log('Change password clicked')}
                    onConfigure2FA={() => setIsEnable2FAOpen(true)}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Preferences Section */}
          {activeTab === 'preferences' && (
            <motion.div
              key="preferences"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className="rounded-2xl p-8"
                style={{
                  background: 'rgba(30, 26, 36, 0.4)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div className="flex items-center gap-3 mb-8">
                  <Settings size={20} style={{ color: '#7f0df2' }} />
                  <h3 className="text-lg font-bold text-white">Preferences</h3>
                </div>
                <PreferencesSection
                  initialPreferences={preferences}
                  onSave={handlePreferencesChange}
                />
              </div>
            </motion.div>
          )}
        </motion.section>
      </main>

      {/* Bottom Action Bar */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 rounded-full py-2 px-6 flex items-center gap-6 shadow-2xl z-50"
          style={{
            backgroundColor: 'rgba(20, 17, 24, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <p className="text-xs font-bold" style={{ color: '#ab9cba' }}>
            Draft changes active
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDiscard}
              className="px-4 py-1.5 rounded-full text-xs font-bold hover:bg-white/10 transition-colors"
              style={{ color: '#ab9cba' }}
            >
              Discard
            </button>
            <button
              onClick={handleCommit}
              className="px-6 py-1.5 rounded-full text-xs font-black text-white shadow-lg transition-all hover:opacity-90"
              style={{
                backgroundColor: '#7f0df2',
                boxShadow: 'rgba(127, 13, 242, 0.3) 0px 8px 16px',
              }}
            >
              Save Changes
            </button>
          </div>
        </motion.div>
      )}

      {/* Modals */}
      <Enable2FAModal
        isOpen={isEnable2FAOpen}
        onClose={() => setIsEnable2FAOpen(false)}
        onConfirm={handleEnable2FA}
      />
    </div>
  );
}
