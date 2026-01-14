'use client';

import type { InteractionData, InteractionDetail } from '@/components/interactions';
import { Header, TipCard } from '@b3-crow/ui-kit';
import { useState } from 'react';
import {
  InteractionDetailPanel,
  InteractionsFilterBar,
  InteractionsTable,
} from '@/components/interactions';
import { useMobileSidebar } from '@/contexts/MobileSidebarContext';
import { mockInteractionDetails, mockInteractions } from './mock-data';

function buildDetailFromMockData(interaction: InteractionData): InteractionDetail {
  const details = mockInteractionDetails[interaction.id];
  return {
    ...interaction,
    ...(details?.description && { description: details.description }),
    ...(details?.evidence && { evidence: details.evidence }),
    ...(details?.sourceData && { sourceData: details.sourceData }),
    ...(details?.metrics && { metrics: details.metrics }),
  };
}

export default function InteractionsPage() {
  const { toggle } = useMobileSidebar();
  const [selectedInteraction, setSelectedInteraction] = useState<InteractionDetail | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Header userInitials="SJ" showNotification minimal onMenuClick={toggle} logoSrc="/favicon.webp" />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-[120px] py-6 sm:py-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="relative mb-6 sm:mb-8">
            <h1 className="mb-1 text-[30px] font-bold leading-9 text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
              Interactions
            </h1>
            <p className="text-sm font-normal leading-5" style={{ color: '#9CA3AF' }}>
              Unified evidence feed across Web, CCTV, and Social.
            </p>
            <p className="sm:absolute sm:right-0 sm:top-2 text-xs font-medium leading-4 mt-2 sm:mt-0" style={{ color: '#6B7280', letterSpacing: '0.3px' }}>
              Last updated: 30 seconds ago
            </p>
          </div>

          <div className="mb-6">
            <InteractionsFilterBar onExport={() => {}} onSaveView={() => {}} onSearch={() => {}} />
          </div>

          <div className="mb-8">
            <InteractionsTable
              interactions={mockInteractions}
              onRowClick={(interaction) => {
                setSelectedInteraction(buildDetailFromMockData(interaction));
                setIsPanelOpen(true);
              }}
            />
          </div>

          <div className="flex justify-end">
            <TipCard>
              Open an interaction to view supporting evidence, raw
              <br />
              source data, and confidence metrics.
            </TipCard>
          </div>
        </div>
      </main>

      <InteractionDetailPanel
        interaction={selectedInteraction}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </div>
  );
}
