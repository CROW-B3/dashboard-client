'use client';

import { useState } from 'react';
import { AlertCircle, Info, Search, AlertTriangle, Zap } from 'lucide-react';
import { Header } from '@b3-crow/ui-kit';
import { useRouter } from 'next/navigation';

import type { Notification } from '@/components/notifications/types';
import { mockNotifications } from '@/components/notifications/mockData';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import { useMobileSidebar } from '@/contexts/MobileSidebarContext';

function getNotificationIcon(type: Notification['icon']) {
  switch (type) {
    case 'info':
      return <Info size={18} className="text-blue-400" />;
    case 'warning':
      return <AlertCircle size={18} className="text-yellow-400" />;
    case 'error':
      return <AlertCircle size={18} className="text-red-500" />;
    default:
      return <div className="w-4 h-4 rounded-full bg-gray-400" />;
  }
}

function getPriorityIcon(priority: string) {
  switch (priority) {
    case 'critical':
      return <Zap size={16} className="text-red-400" />;
    case 'high':
      return <AlertTriangle size={16} className="text-orange-400" />;
    case 'medium':
      return <AlertCircle size={16} className="text-yellow-400" />;
    case 'low':
      return <Info size={16} className="text-blue-400" />;
    default:
      return <Info size={16} className="text-gray-400" />;
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'critical':
      return 'bg-red-500/10 text-red-400';
    case 'high':
      return 'bg-orange-500/10 text-orange-400';
    case 'medium':
      return 'bg-yellow-500/10 text-yellow-400';
    case 'low':
      return 'bg-blue-500/10 text-blue-400';
    default:
      return 'bg-gray-500/10 text-gray-300';
  }
}

export default function NotificationsPage() {
  const router = useRouter();
  const { toggle } = useMobileSidebar();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read'>('all');
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);

  const handleAvatarClick = () => router.push('/settings/profile');
  const handleNotificationClick = () => setIsNotificationDropdownOpen(!isNotificationDropdownOpen);

  const filteredNotifications = mockNotifications.filter(notification => {
    const matchesSearch = notification.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'unread' && !notification.read) ||
      (filterStatus === 'read' && notification.read);

    return matchesSearch && matchesFilter;
  });

  const unreadCount = mockNotifications.filter(n => !n.read).length;

  return (
    <div className="flex flex-col min-h-screen">
      <div className="relative">
        <Header
          userInitials="SJ"
          showNotification={unreadCount > 0}
          minimal
          onMenuClick={toggle}
          onAvatarClick={handleAvatarClick}
          onNotificationClick={handleNotificationClick}
          logoSrc="/favicon.webp"
        />
        <NotificationDropdown
          isOpen={isNotificationDropdownOpen}
          onClose={() => setIsNotificationDropdownOpen(false)}
          onViewAll={() => {}} // Already on notifications page
        />
      </div>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-[120px] py-6 sm:py-8">
        <div className="max-w-[1640px] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-[30px] font-bold text-white mb-2">
              Notifications
            </h1>
            <p className="text-sm text-gray-400">
              Real-time alerts from across your CROW environment.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Last updated: 30 seconds ago
            </p>
          </div>

          {/* Filter Bar */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search Notifications…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white placeholder-gray-500 transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
              <Search size={16} className="absolute right-3 top-3 text-gray-500" />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => setFilterStatus('unread')}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  filterStatus === 'unread'
                    ? 'bg-white/[0.08] border border-white/[0.2] text-white'
                    : 'bg-transparent border border-white/[0.1] text-gray-400 hover:text-white'
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilterStatus('read')}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  filterStatus === 'read'
                    ? 'bg-white/[0.08] border border-white/[0.2] text-white'
                    : 'bg-transparent border border-white/[0.1] text-gray-400 hover:text-white'
                }`}
              >
                Read
              </button>
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  filterStatus === 'all'
                    ? 'bg-white/[0.08] border border-white/[0.2] text-white'
                    : 'bg-transparent border border-white/[0.1] text-gray-400 hover:text-white'
                }`}
              >
                All
              </button>
            </div>
          </div>

          {/* Notifications Table */}
          <div className="-webkit-backdrop-filter: blur(8px) brightness(100%); backdrop-filter: blur(8px) brightness(100%); bg-[rgba(10,5,20,0.4)] border border-white/[0.08] rounded-xl overflow-hidden shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.4)]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody>
                  {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification, idx) => (
                      <tr
                        key={notification.id}
                        className={`hover:bg-white/[0.02] transition-colors ${
                          idx !== filteredNotifications.length - 1
                            ? 'border-b border-white/[0.04]'
                            : ''
                        }`}
                      >
                        {/* Priority Cell */}
                        <td className="px-4 py-2.5">
                          <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.1] flex items-center justify-center flex-shrink-0">
                            {getPriorityIcon(notification.priority)}
                          </div>
                        </td>

                        {/* Notification Cell */}
                        <td className="px-3 py-2.5">
                          <p className="text-white text-sm font-medium">
                            {notification.title}
                          </p>
                          <p className="text-gray-400 text-xs mt-0.5">
                            {notification.description}
                          </p>
                        </td>

                        {/* Time Cell */}
                        <td className="px-4 py-2.5 text-right text-gray-400 text-xs whitespace-nowrap">
                          {notification.timestamp}
                        </td>

                        {/* Status Indicator */}
                        {!notification.read && (
                          <td className="px-4 py-2.5">
                            <div className="w-2 h-2 rounded-full bg-violet-500" />
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <p className="text-gray-400 text-sm">
                          No notifications found
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
