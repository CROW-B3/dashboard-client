'use client';

import { Header } from '@b3-crow/ui-kit';
import { TeamFilterBar, TeamTable } from '@/components/team';
import { useMobileSidebar } from '@/contexts/MobileSidebarContext';
import { mockTeamMembers } from './mock-data';

export default function TeamPage() {
  const { toggle } = useMobileSidebar();

  return (
    <div className="flex flex-col min-h-screen">
      <Header userInitials="SJ" showNotification minimal onMenuClick={toggle} logoSrc="/favicon.webp" />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-[120px] py-6 sm:py-8">
        <div className="max-w-[1640px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="mb-1 text-[30px] font-bold leading-9 text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                Team
              </h1>
              <p className="text-sm font-normal leading-5" style={{ color: '#9CA3AF' }}>
                Manage users and permissions in your workspace.
              </p>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-2">
              <div className="flex items-center gap-3">
                <button type="button" className="h-[38px] px-4 flex items-center justify-center rounded-lg text-sm font-medium transition-colors hover:bg-white/5" style={{ color: '#D1D5DB', outline: '1px rgba(255, 255, 255, 0.10) solid', outlineOffset: '-1px' }}>
                  Role permissions
                </button>
                <button type="button" className="h-[38px] px-4 flex items-center justify-center rounded-lg text-sm font-medium text-white transition-colors" style={{ background: '#7C3AED', boxShadow: '0px 0px 15px rgba(124, 58, 237, 0.30)', outline: '1px #8B5CF6 solid', outlineOffset: '-1px' }}>
                  Invite members
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs" style={{ color: '#6B7280' }}>
                <span>Seats used: 5 / 10</span>
                <span style={{ color: '#4B5563' }}>|</span>
                <button type="button" className="hover:underline" style={{ color: '#A78BFA' }}>
                  View audit log
                </button>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <TeamFilterBar onSearch={() => {}} onRoleChange={() => {}} onStatusChange={() => {}} />
          </div>

          <div className="mb-8">
            <TeamTable members={mockTeamMembers} onRowClick={() => {}} />
          </div>
        </div>
      </main>
    </div>
  );
}
