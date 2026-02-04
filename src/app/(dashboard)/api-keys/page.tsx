'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Key, Copy, MoreVertical, Plus, Edit2, Trash2, Check } from 'lucide-react';
import { Header } from '@b3-crow/ui-kit';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import { CreateAPIKeyModal } from '@/components/modals/CreateAPIKeyModal';
import { EditAPIKeyModal } from '@/components/modals/EditAPIKeyModal';
import { useMobileSidebar } from '@/contexts/MobileSidebarContext';
import { useRouter } from 'next/navigation';

interface APIKey {
  id: string;
  name: string;
  key: string;
  type: 'secret' | 'publishable';
  scope: string;
  created: string;
  lastUsed: string;
  status: 'active' | 'inactive';
}

const availableScopes = [
  'pattern:read',
  'pattern:write',
  'interaction:read',
  'interaction:write',
];

const mockAPIKeys: APIKey[] = [
  {
    id: '1',
    name: 'Production Core',
    key: 'sk-live...9f2a',
    type: 'secret',
    scope: availableScopes[Math.floor(Math.random() * availableScopes.length)],
    created: 'Oct 24, 2023',
    lastUsed: 'Just now',
    status: 'active',
  },
  {
    id: '2',
    name: 'Development',
    key: 'pk-test...4b1c',
    type: 'publishable',
    scope: availableScopes[Math.floor(Math.random() * availableScopes.length)],
    created: 'Nov 02, 2023',
    lastUsed: '2 hours ago',
    status: 'active',
  },
  {
    id: '3',
    name: 'Mobile iOS',
    key: 'pk-live...8d99',
    type: 'publishable',
    scope: availableScopes[Math.floor(Math.random() * availableScopes.length)],
    created: 'Dec 15, 2023',
    lastUsed: '1 day ago',
    status: 'active',
  },
  {
    id: '4',
    name: 'Backend Service',
    key: 'sk-live...7a3d',
    type: 'secret',
    scope: availableScopes[Math.floor(Math.random() * availableScopes.length)],
    created: 'Jan 15, 2024',
    lastUsed: '5 minutes ago',
    status: 'active',
  },
  {
    id: '5',
    name: 'Web Dashboard',
    key: 'pk-live...5k2b',
    type: 'publishable',
    scope: availableScopes[Math.floor(Math.random() * availableScopes.length)],
    created: 'Feb 01, 2024',
    lastUsed: '2 days ago',
    status: 'active',
  },
];

export default function APIKeysPage() {
  const router = useRouter();
  const { toggle } = useMobileSidebar();
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedKeyForEdit, setSelectedKeyForEdit] = useState<APIKey | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleAvatarClick = () => router.push('/settings/profile');
  const handleNotificationClick = () => setIsNotificationDropdownOpen(!isNotificationDropdownOpen);

  const handleCopyKey = (id: string, key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };


  return (
    <div className="flex flex-col min-h-screen">
      <div className="relative">
        <Header
          userInitials="AJ"
          showNotification
          minimal
          onMenuClick={toggle}
          onAvatarClick={handleAvatarClick}
          onNotificationClick={handleNotificationClick}
          logoSrc="/favicon.webp"
        />
        <NotificationDropdown
          isOpen={isNotificationDropdownOpen}
          onClose={() => setIsNotificationDropdownOpen(false)}
          onViewAll={() => router.push('/notifications')}
        />
      </div>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-[120px] py-6 sm:py-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Header Section */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
              <div>
                <h1
                  className="mb-2 text-[30px] font-bold leading-9 text-white"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  API Keys
                </h1>
                <p className="text-sm font-normal leading-5 max-w-2xl" style={{ color: '#9CA3AF' }}>
                  Manage your secret keys for accessing the CROW API.{' '}
                  <span className="text-white font-semibold">Do not share your secret keys</span> with anyone or commit
                  them to version control.
                </p>
              </div>
              <motion.button
                onClick={() => setIsCreateModalOpen(true)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 rounded-xl text-white font-bold text-sm flex items-center gap-2 shadow-lg transition-all w-fit"
                style={{
                  backgroundColor: '#7f0df2',
                  boxShadow: 'rgba(127, 13, 242, 0.3) 0px 8px 16px',
                }}
              >
                <Plus size={18} />
                Create new secret key
              </motion.button>
            </div>
          </motion.div>

          {/* API Keys Table */}
          <motion.div
            className="rounded-2xl overflow-hidden shadow-2xl mb-8"
            style={{
              background: 'rgba(30, 26, 36, 0.4)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} className="border-b">
                    <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-bold text-center" style={{ color: '#ab9cba' }}>
                      Name
                    </th>
                    <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-bold text-center" style={{ color: '#ab9cba' }}>
                      Key
                    </th>
                    <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-bold text-center" style={{ color: '#ab9cba' }}>
                      Type
                    </th>
                    <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-bold text-center" style={{ color: '#ab9cba' }}>
                      Scope
                    </th>
                    <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-bold text-center" style={{ color: '#ab9cba' }}>
                      Created
                    </th>
                    <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-bold text-center" style={{ color: '#ab9cba' }}>
                      Last Used
                    </th>
                    <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-bold text-center" style={{ color: '#ab9cba' }}>
                      Status
                    </th>
                    <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-bold text-center" style={{ color: '#ab9cba' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody style={{ borderColor: 'rgba(255, 255, 255, 0.04)' }} className="divide-y">
                  {mockAPIKeys.map((apiKey, index) => (
                    <motion.tr
                      key={apiKey.id}
                      className="group hover:bg-white/[0.02] transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <td className="py-5 px-6 text-center">
                        <span className="font-bold text-sm text-white">{apiKey.name}</span>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <div className="relative inline-block">
                          <div
                            className="flex items-center gap-2 font-mono text-xs px-2 py-1.5 rounded border w-fit group-hover:border-[#7f0df2]/30 transition-colors"
                            style={{
                              backgroundColor: 'rgba(20, 17, 24, 1)',
                              borderColor: 'rgba(255, 255, 255, 0.08)',
                              color: '#ab9cba',
                            }}
                          >
                            <span>{apiKey.key}</span>
                            <button
                              onClick={() => handleCopyKey(apiKey.id, apiKey.key)}
                              className="hover:text-white transition-colors"
                            >
                              {copiedId === apiKey.id ? (
                                <Check size={14} style={{ color: '#00ff9d' }} />
                              ) : (
                                <Copy size={14} />
                              )}
                            </button>
                          </div>
                          {copiedId === apiKey.id && (
                            <motion.div
                              initial={{ opacity: 0, x: -5 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="absolute left-full ml-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold whitespace-nowrap"
                              style={{ color: '#00ff9d' }}
                            >
                              Copied!
                            </motion.div>
                          )}
                        </div>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border"
                          style={{
                            backgroundColor: 'rgba(20, 17, 24, 1)',
                            borderColor: 'rgba(255, 255, 255, 0.08)',
                            color: apiKey.type === 'secret' ? '#7f0df2' : '#ab9cba',
                          }}
                        >
                          {apiKey.type === 'secret' ? 'Secret' : 'Publishable'}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border"
                          style={{
                            backgroundColor: 'rgba(127, 13, 242, 0.15)',
                            borderColor: 'rgba(127, 13, 242, 0.3)',
                            color: '#a78bfa',
                          }}
                        >
                          {apiKey.scope}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-center text-xs" style={{ color: '#ab9cba' }}>
                        {apiKey.created}
                      </td>
                      <td className="py-5 px-6 text-center text-xs text-white font-medium">{apiKey.lastUsed}</td>
                      <td className="py-5 px-6 text-center">
                        <div
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border"
                          style={{
                            backgroundColor: 'rgba(0, 255, 157, 0.1)',
                            borderColor: 'rgba(0, 255, 157, 0.2)',
                            color: '#00ff9d',
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full animate-pulse"
                            style={{ backgroundColor: '#00ff9d' }}
                          ></span>
                          Active
                        </div>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <div className="flex items-center justify-center gap-3">
                          {/* Update Button */}
                          <div className="relative">
                            <button
                              onClick={() => {
                                setSelectedKeyForEdit(apiKey);
                                setIsEditModalOpen(true);
                              }}
                              className="transition-colors hover:text-white peer"
                              style={{ color: '#ab9cba' }}
                            >
                              <Edit2 size={16} />
                            </button>
                            <div
                              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded text-xs font-semibold opacity-0 hover:opacity-100 peer-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10"
                              style={{
                                backgroundColor: 'rgba(10, 5, 20, 0.98)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                color: '#ab9cba',
                              }}
                            >
                              Update
                            </div>
                          </div>

                          {/* Delete Button */}
                          <div className="relative">
                            <button
                              onClick={() => console.log('Delete', apiKey.id)}
                              className="transition-colors hover:text-red-400 peer"
                              style={{ color: '#ef4444' }}
                            >
                              <Trash2 size={16} />
                            </button>
                            <div
                              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded text-xs font-semibold opacity-0 hover:opacity-100 peer-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10"
                              style={{
                                backgroundColor: 'rgba(10, 5, 20, 0.98)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                color: '#ef4444',
                              }}
                            >
                              Delete
                            </div>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div
              className="flex items-center justify-between p-4 border-t"
              style={{
                backgroundColor: 'rgba(20, 17, 24, 0.3)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <p className="text-xs font-medium" style={{ color: '#ab9cba' }}>
                Showing all {mockAPIKeys.length} keys
              </p>
            </div>
          </motion.div>

        </div>
      </main>

      {/* Create API Key Modal */}
      <CreateAPIKeyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        availableScopes={availableScopes}
      />

      {/* Edit API Key Modal */}
      <EditAPIKeyModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedKeyForEdit(null);
        }}
        availableScopes={availableScopes}
        apiKey={selectedKeyForEdit}
      />
    </div>
  );
}
