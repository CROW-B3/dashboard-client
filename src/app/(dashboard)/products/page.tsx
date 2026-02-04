'use client';

import { useState } from 'react';
import { Header } from '@b3-crow/ui-kit';
import { useRouter } from 'next/navigation';

import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import { useMobileSidebar } from '@/contexts/MobileSidebarContext';

export default function ProductsPage() {
  const router = useRouter();
  const { toggle } = useMobileSidebar();
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const handleAvatarClick = () => router.push('/settings/profile');
  const handleNotificationClick = () => setIsNotificationDropdownOpen(!isNotificationDropdownOpen);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="relative">
        <Header userInitials="SJ" showNotification minimal onMenuClick={toggle} onAvatarClick={handleAvatarClick} onNotificationClick={handleNotificationClick} logoSrc="/favicon.webp" />
        <NotificationDropdown
          isOpen={isNotificationDropdownOpen}
          onClose={() => setIsNotificationDropdownOpen(false)}
          onViewAll={() => router.push('/notifications')}
        />
      </div>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-[120px] py-6 sm:py-8">
        <div className="max-w-[1640px] mx-auto">
          <div className="mb-8">
            <h1 className="mb-2 text-[30px] font-bold leading-9 text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
              Products
            </h1>
            <p className="text-sm font-normal leading-5" style={{ color: '#9CA3AF' }}>
              Manage your products and inventory.
            </p>
          </div>

          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-gray-400">Products page coming soon...</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
