'use client';

import { Header, SearchInput, StatusIndicator } from '@b3-crow/ui-kit';

export default function AskCrowPage() {
  const handleQuerySubmit = (query: string) => {
    // TODO: Handle query submission
    console.log('Query submitted:', query);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header - minimal version with only notification and profile */}
      <Header
        userInitials="SJ"
        showNotification={true}
        minimal={true}
      />

      {/* Main content area - centered */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center w-full max-w-[896px]">
          {/* Status Indicator - Figma: 135.23x25, pill shape */}
          <div
            className="flex items-center gap-2 px-4 h-[25px] rounded-full mb-5"
            style={{
              background: 'rgba(139, 92, 246, 0.10)',
              outline: '1px rgba(139, 92, 246, 0.20) solid',
              outlineOffset: '-1px',
              backdropFilter: 'blur(6px)',
            }}
          >
            <div
              className="w-[6px] h-[6px] rounded-full"
              style={{ background: '#A78BFA' }}
            />
            <span
              className="text-[10px] font-bold uppercase tracking-[1px]"
              style={{ color: '#C4B5FD', lineHeight: '15px' }}
            >
              System Active
            </span>
          </div>

          {/* Title - CROW ENGINE */}
          <h1
            className="font-bold mb-4"
            style={{
              fontSize: 48,
              lineHeight: '48px',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <span style={{ color: 'white' }}>CROW</span>
            <span style={{ color: '#F3F4F6' }}> </span>
            <span className="bg-gradient-to-r from-[#3d1a6d] to-[#8743FA] bg-clip-text text-transparent">
              ENGINE
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-center max-w-[432px] mb-20"
            style={{
              color: '#9CA3AF',
              fontSize: 14,
              fontWeight: 400,
              lineHeight: '22.75px',
            }}
          >
            Neural interface ready. Start a new session or select a suggested
            prompt below.
          </p>

          {/* Search Input - Figma: 672x54, gap from subtitle ~82px */}
          <div className="w-full max-w-[672px]">
            <SearchInput
              className="w-full"
              placeholder="Ask CROW anything…"
              onSubmit={handleQuerySubmit}
              helperText="Answers include sources and supporting interactions."
            />
          </div>
        </div>
      </main>
    </div>
  );
}
