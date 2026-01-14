export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface SuggestedPromptsProps {
  prompts: string[];
  onPromptClick?: (prompt: string) => void;
  className?: string;
}

export interface AttachmentMenuProps {
  isOpen: boolean;
  onOptionSelect: (type: string) => void;
  onClose: () => void;
}
