'use client';

import { SearchInput, SuggestionChip } from '@b3-crow/ui-kit';
import { COLORS, LAYOUT, TEXT } from './constants';
import { AttachmentButton } from './AttachmentButton';
import { AttachmentMenu } from './AttachmentMenu';

const SUGGESTED_PROMPTS = [
  'Analyze recent patterns',
  'Security summary',
  'Top interactions',
  'System health check',
];

interface LandingViewProps {
  isVisible: boolean;
  onQuerySubmit: (query: string) => void;
  showAttachMenu: boolean;
  onAttachMenuToggle: () => void;
  onAttachOption: (type: string) => void;
  attachMenuRef: React.RefObject<HTMLDivElement>;
}

function SystemStatus() {
  return (
    <div
      className="flex items-center gap-2 px-4 h-[25px] rounded-full mb-5"
      style={{
        background: COLORS.VIOLET_GLOW_BG,
        outline: `1px ${COLORS.VIOLET_GLOW_BORDER} solid`,
        outlineOffset: '-1px',
        backdropFilter: 'blur(6px)',
      }}
    >
      <div className="w-[6px] h-[6px] rounded-full animate-pulse" style={{ background: COLORS.PURPLE_400 }} />
      <span
        className="text-[10px] font-bold uppercase tracking-[1px]"
        style={{ color: COLORS.VIOLET_LIGHT, lineHeight: '15px' }}
      >
        {TEXT.SYSTEM_STATUS}
      </span>
    </div>
  );
}

function Title() {
  return (
    <h1 className="font-bold mb-4" style={{ fontSize: LAYOUT.LANDING_TITLE_SIZE, lineHeight: '48px' }}>
      <span style={{ color: 'white' }}>{TEXT.LANDING_TITLE}</span>
      <span style={{ color: '#F3F4F6' }}> </span>
      <span className="bg-gradient-to-r from-[#3d1a6d] to-[#8743FA] bg-clip-text text-transparent">
        {TEXT.LANDING_TITLE_GRADIENT}
      </span>
    </h1>
  );
}

function Subtitle() {
  return (
    <p
      className="text-center max-w-[432px] mb-8"
      style={{
        color: '#9CA3AF',
        fontSize: 14,
        fontWeight: 400,
        lineHeight: '22.75px',
      }}
    >
      {TEXT.LANDING_SUBTITLE}
    </p>
  );
}

function SuggestedPromptsSection({ onPromptClick }: { onPromptClick: (prompt: string) => void }) {
  return (
    <div className="mb-12 flex justify-center w-full max-w-[672px]">
      <SuggestionChip suggestions={SUGGESTED_PROMPTS} onSuggestionClick={onPromptClick} />
    </div>
  );
}

function SearchBar({
  onSubmit,
  showAttachMenu,
  onAttachMenuToggle,
  onAttachOption,
  attachMenuRef,
}: Omit<LandingViewProps, 'isVisible'> & { onSubmit: (query: string) => void }) {
  return (
    <div className="w-full max-w-[672px] relative [&_button[aria-label='Submit']_svg]:rotate-[-90deg] [&_.absolute.left-4]:hidden">
      <div
        ref={attachMenuRef}
        className="absolute top-0 h-[48px] sm:h-[54px] z-20 flex items-center justify-center"
        style={{ left: '1rem' }}
      >
        <AttachmentButton onClick={onAttachMenuToggle} />
        <AttachmentMenu isOpen={showAttachMenu} onOptionSelect={onAttachOption} onClose={onAttachMenuToggle} />
      </div>
      <SearchInput
        className="w-full"
        placeholder={TEXT.SEARCH_PLACEHOLDER_LANDING}
        onSubmit={onSubmit}
        showMicButton={false}
        helperText={TEXT.SEARCH_HELPER_TEXT}
      />
    </div>
  );
}

export function LandingView({
  isVisible,
  onQuerySubmit,
  showAttachMenu,
  onAttachMenuToggle,
  onAttachOption,
  attachMenuRef,
}: LandingViewProps) {
  if (!isVisible) return null;

  return (
    <div className="flex-1 flex items-center justify-center transition-all duration-500 ease-out opacity-100 scale-100">
      <div className="flex flex-col items-center text-center w-full max-w-[896px]">
        <SystemStatus />
        <Title />
        <Subtitle />
        <SuggestedPromptsSection onPromptClick={onQuerySubmit} />
        <SearchBar
          onSubmit={onQuerySubmit}
          showAttachMenu={showAttachMenu}
          onAttachMenuToggle={onAttachMenuToggle}
          onAttachOption={onAttachOption}
          attachMenuRef={attachMenuRef}
        />
      </div>
    </div>
  );
}
