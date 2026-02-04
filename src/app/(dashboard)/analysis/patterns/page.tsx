'use client';

import type { PatternData, PatternDetail } from '@/components/patterns';
import type { SourceFilter } from '@/components/patterns/PatternsFilterBar';
import { Header, PatternCard, TipCard } from '@b3-crow/ui-kit';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import { PatternDetailPanel, PatternsFilterBar } from '@/components/patterns';
import { useMobileSidebar } from '@/contexts/MobileSidebarContext';
import { mockPatternDetails, mockPatterns } from './mock-data';

function buildDetailFromMockData(pattern: PatternData): PatternDetail {
  const details = mockPatternDetails[pattern.id];
  return {
    ...pattern,
    ...(details?.description && { description: details.description }),
    ...(details?.recommendations && { recommendations: details.recommendations }),
    ...(details?.relatedInteractions && { relatedInteractions: details.relatedInteractions }),
    ...(details?.timeline && { timeline: details.timeline }),
    ...(details?.metrics && { metrics: details.metrics }),
  };
}

export default function PatternsPage() {
  const router = useRouter();
  const { toggle } = useMobileSidebar();
  const [selectedPattern, setSelectedPattern] = useState<PatternDetail | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const handleAvatarClick = () => router.push('/settings/profile');
  const handleNotificationClick = () => setIsNotificationDropdownOpen(!isNotificationDropdownOpen);

  const filteredPatterns = useMemo(
    () => (sourceFilter === 'all' ? mockPatterns : mockPatterns.filter((p) => p.source === sourceFilter)),
    [sourceFilter]
  );

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
          <div className="relative mb-6 sm:mb-8">
            <h1 className="mb-1 text-[30px] font-bold leading-9 text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
              Patterns
            </h1>
            <p className="text-sm font-normal leading-5" style={{ color: '#9CA3AF' }}>
              Derived behaviors and anomalies generated from interactions.
            </p>
            <p className="sm:absolute sm:right-0 sm:top-2 text-xs font-medium leading-4 mt-2 sm:mt-0" style={{ color: '#6B7280', letterSpacing: '0.3px' }}>
              Last updated 2 min ago
            </p>
          </div>

          <div className="mb-6">
            <PatternsFilterBar activeSource={sourceFilter} onSourceChange={setSourceFilter} onExport={() => {}} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {filteredPatterns.map((pattern) => (
              <PatternCard
                key={pattern.id}
                id={pattern.id}
                title={pattern.title}
                severity={pattern.severity}
                affectedStores={pattern.affectedStores}
                lastSeen={pattern.lastSeen}
                confidence={pattern.confidence}
                onViewDetails={() => {
                  setSelectedPattern(buildDetailFromMockData(pattern));
                  setIsPanelOpen(true);
                }}
                onViewEvidence={() => {}}
                onCreateAlert={() => {}}
              />
            ))}
          </div>

          <div className="flex justify-end">
            <TipCard>
              Click on a pattern card to view detailed analysis,
              <br />
              recommendations, and related interactions.
            </TipCard>
          </div>
        </div>
      </main>

      <PatternDetailPanel pattern={selectedPattern} isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} />
    </div>
  );
}
