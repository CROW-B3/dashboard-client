'use client';

import { Header } from '@b3-crow/ui-kit';

import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { useMobileSidebar } from '@/contexts/MobileSidebarContext';
import { useCurrentUser } from '@/hooks/use-current-user';
import { InteractionsTable } from './table';

function SkeletonRows() {
  return (
    <div className="space-y-2">
      {['a', 'b', 'c', 'd', 'e'].map((k) => (
        <div key={k} className="h-12 animate-pulse rounded-lg bg-white/5" />
      ))}
    </div>
  );
}

export default function InteractionsPage() {
  const router = useRouter();

  const { toggle } = useMobileSidebar();
  const { data: user } = useCurrentUser();
  const userInitials = user ? (user.name || user.email || '').slice(0, 2).toUpperCase() : '';

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        userInitials={userInitials}
        showNotification={false}
        minimal
        onMenuClick={toggle}
        logoSrc="/favicon.webp"
        onAvatarClick={() => router.push('/dashboard/settings')}
      />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-[120px] py-6 sm:py-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="relative mb-6 sm:mb-8">
            <h1 className="mb-1 text-[30px] font-bold leading-9 text-white">
              Interactions
            </h1>
            <p className="text-sm font-normal leading-5 text-gray-400">
              Customer interaction events from all connected sources.
            </p>
          </div>

          <Suspense fallback={<SkeletonRows />}>
            <div className="space-y-4">
              <InteractionsTable />
            </div>
          </Suspense>
        </div>
      </main>
    </div>
  );
}
