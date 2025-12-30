'use client';

import type { PatternData, PatternDetail } from '@/components/patterns';
import type { SourceFilter } from '@/components/patterns/PatternsFilterBar';

import { Header, PatternCard, TipCard } from '@b3-crow/ui-kit';
import { useMemo, useState } from 'react';

import {
  PatternDetailPanel,
  PatternsFilterBar,
} from '@/components/patterns';
import { useMobileSidebar } from '@/contexts/MobileSidebarContext';
import { mockPatternDetails, mockPatterns } from './mock-data';

export default function PatternsPage() {
  const { toggle } = useMobileSidebar();
  const [selectedPattern, setSelectedPattern] = useState<PatternDetail | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');

  // Filter patterns based on source selection
  const filteredPatterns = useMemo(() => {
    if (sourceFilter === 'all') {
      return mockPatterns;
    }
    return mockPatterns.filter((pattern) => pattern.source === sourceFilter);
  }, [sourceFilter]);

  const handleSourceChange = (source: SourceFilter) => {
    setSourceFilter(source);
  };

  const handleViewDetails = (pattern: PatternData) => {
    const details = mockPatternDetails[pattern.id];
    const fullPattern: PatternDetail = {
      ...pattern,
      ...(details?.description && { description: details.description }),
      ...(details?.recommendations && { recommendations: details.recommendations }),
      ...(details?.relatedInteractions && { relatedInteractions: details.relatedInteractions }),
      ...(details?.timeline && { timeline: details.timeline }),
      ...(details?.metrics && { metrics: details.metrics }),
    };
    setSelectedPattern(fullPattern);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        userInitials="SJ"
        showNotification={true}
        minimal={true}
        onMenuClick={toggle}
        logoSrc="/favicon.webp"
      />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-[120px] py-6 sm:py-8">
        <div className="max-w-[1640px] mx-auto">
          <PageHeader />

          <div className="mb-6">
            <PatternsFilterBar
              activeSource={sourceFilter}
              onSourceChange={handleSourceChange}
              onExport={() => {}}
            />
          </div>

          {/* Patterns Grid */}
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
                onViewDetails={() => handleViewDetails(pattern)}
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

      <PatternDetailPanel
        pattern={selectedPattern}
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
      />
    </div>
  );
}

function PageHeader() {
  return (
    <div className="relative mb-6 sm:mb-8">
      <h1
        className="mb-1 text-[30px] font-bold leading-9 text-white"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        Patterns
      </h1>
      <p
        className="text-sm font-normal leading-5"
        style={{ color: '#9CA3AF' }}
      >
        Derived behaviors and anomalies generated from interactions.
      </p>
      <p
        className="sm:absolute sm:right-0 sm:top-2 text-xs font-medium leading-4 mt-2 sm:mt-0"
        style={{ color: '#6B7280', letterSpacing: '0.3px' }}
      >
        Last updated 2 min ago
      </p>
    </div>
  );
}
