export interface SuggestedPromptsProps {
  prompts: string[];
  onPromptClick?: (prompt: string) => void;
  className?: string;
}
