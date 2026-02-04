'use client';

import type { Notification } from './types';

import { cn } from '@b3-crow/ui-kit';
import { AlertCircle, Bell, Info, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { mockNotifications } from './mockData';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onViewAll?: () => void;
}

function getNotificationIcon(type: Notification['icon']) {
  switch (type) {
    case 'info':
      return <Info size={18} className="text-blue-400" />;
    case 'warning':
      return <AlertCircle size={18} className="text-yellow-400" />;
    case 'error':
      return <AlertCircle size={18} className="text-red-500" />;
    default:
      return <Bell size={18} className="text-gray-400" />;
  }
}

function getSourceBadgeColor(source: Notification['source']) {
  switch (source) {
    case 'web':
      return 'bg-blue-500/10 text-blue-300';
    case 'cctv':
      return 'bg-red-500/10 text-red-300';
    case 'social':
      return 'bg-purple-500/10 text-purple-300';
    default:
      return 'bg-gray-500/10 text-gray-300';
  }
}

export function NotificationDropdown({
  isOpen,
  onClose,
  onViewAll,
}: NotificationDropdownProps) {
  const [isClosing, setIsClosing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const recentNotifications = mockNotifications.slice(0, 3);
  const unreadCount = mockNotifications.filter(n => !n.read).length;

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  }, [onClose]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, handleClose]);

  const handleViewAll = () => {
    handleClose();
    setTimeout(() => {
      onViewAll?.();
    }, 200);
  };

  if (!isOpen && !isClosing) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-[100] transition-opacity duration-200',
          isClosing ? 'opacity-0' : 'opacity-0 pointer-events-none'
        )}
        onClick={handleClose}
      />

      {/* Dropdown Panel */}
      <div
        ref={ref}
        className={cn(
          'absolute top-[50px] right-0 w-[400px] max-w-[90vw]',
          'bg-[rgba(10,5,20,0.98)] backdrop-blur-[20px]',
          'border border-white/[0.08] rounded-xl',
          'shadow-[0px_20px_40px_rgba(0,0,0,0.5),0px_0px_1px_rgba(139,92,246,0.3)]',
          'z-[101] transition-all duration-200',
          isClosing
            ? 'opacity-0 scale-[0.96] pointer-events-none'
            : 'opacity-100 scale-100'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
          <div>
            <h3 className="text-white font-semibold text-sm">Notifications</h3>
            <p className="text-gray-400 text-xs mt-1">
              {unreadCount} unread notifications
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-white transition-colors"
            aria-label="Close notifications"
          >
            <X size={18} />
          </button>
        </div>

        {/* Notifications List */}
        <div className="max-h-[400px] overflow-y-auto">
          {recentNotifications.map((notification, idx) => (
            <div
              key={notification.id}
              className={cn(
                'px-4 py-3 hover:bg-white/[0.02] transition-colors cursor-pointer',
                idx !== recentNotifications.length - 1 &&
                  'border-b border-white/[0.04]'
              )}
            >
              <div className="flex gap-3">
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notification.icon)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {notification.title}
                  </p>
                  <p className="text-gray-400 text-xs mt-1 truncate">
                    {notification.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded',
                        getSourceBadgeColor(notification.source)
                      )}
                    >
                      {notification.source.toUpperCase()}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {notification.timestamp}
                    </span>
                  </div>
                </div>

                {/* Unread indicator */}
                {!notification.read && (
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-violet-500 mt-2" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.06] bg-gradient-to-b from-transparent to-violet-500/[0.03]">
          <button
            onClick={handleViewAll}
            className="w-full text-center text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors"
          >
            View All Notifications →
          </button>
        </div>
      </div>
    </>
  );
}
