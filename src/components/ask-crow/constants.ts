export const ANIMATION_DURATIONS = {
  TRANSITION: 500,
  START_CHAT: 500,
  AI_RESPONSE_INITIAL: 3000,
  AI_RESPONSE_FOLLOW_UP: 2500,
  COPY_FEEDBACK: 2000,
  ORBITAL_SLOW: 5000,
  ORBITAL_FAST: 3000,
} as const;

export const ANIMATION_DELAYS = {
  DOT_1: '0ms',
  DOT_2: '200ms',
  DOT_3: '400ms',
} as const;

export const COLORS = {
  VIOLET: '#8B5CF6',
  VIOLET_LIGHT: '#C4B5FD',
  VIOLET_GLOW_BG: 'rgba(139, 92, 246, 0.10)',
  VIOLET_GLOW_BORDER: 'rgba(139, 92, 246, 0.20)',
  PURPLE_400: '#A78BFA',
  PURPLE_500_LOW_OPACITY: 'rgba(168, 85, 247, 0.3)',
  PURPLE_500_LOWER_OPACITY: 'rgba(168, 85, 247, 0.1)',
  WHITE_10: 'rgba(255, 255, 255, 0.1)',
  WHITE_5: 'rgba(255, 255, 255, 0.05)',
  WHITE_3: 'rgba(255, 255, 255, 0.03)',
  BLACK_50: 'rgba(0, 0, 0, 0.5)',
  BLACK_60: 'rgba(0, 0, 0, 0.6)',
  BLACK_70: 'rgba(0, 0, 0, 0.7)',
  BLACK_95: 'rgba(20, 20, 20, 0.95)',
} as const;

export const TEXT = {
  SYSTEM_STATUS: 'System Active',
  LANDING_TITLE: 'CROW',
  LANDING_TITLE_GRADIENT: 'ENGINE',
  LANDING_SUBTITLE: 'Neural interface ready. Start a new session or select a suggested prompt below.',
  SEARCH_PLACEHOLDER_LANDING: 'Ask CROW anything…',
  SEARCH_PLACEHOLDER_CHAT: 'Continue the conversation…',
  SEARCH_HELPER_TEXT: 'Answers include sources and supporting interactions.',
  PROCESSING_STATUS: 'Processing your request',
  CROW_THINKING: 'CROW is thinking',
  AI_INITIAL_RESPONSE: "CROW is currently processing your request. Our neural networks are analyzing patterns and generating insights. We'll have a comprehensive response ready for you shortly. In the meantime, feel free to ask follow-up questions or provide additional context.",
  AI_FOLLOW_UP_RESPONSE: "I've analyzed your follow-up query. CROW continues to process and refine the response based on your input. The system is designed to maintain context across our conversation for more accurate insights.",
} as const;

export const ATTACH_MENU_OPTIONS = [
  {
    type: 'document',
    icon: 'FileText',
    label: 'Upload Document',
    color: 'text-purple-400',
  },
  {
    type: 'image',
    icon: 'ImageIcon',
    label: 'Upload Image',
    color: 'text-blue-400',
  },
  {
    type: 'link',
    icon: 'Link2',
    label: 'Paste Link',
    color: 'text-green-400',
  },
] as const;

export const LAYOUT = {
  LANDING_TITLE_SIZE: 48,
  MAX_MESSAGE_WIDTH_PERCENT: 85,
} as const;
