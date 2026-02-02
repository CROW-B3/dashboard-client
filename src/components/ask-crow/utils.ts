import type { Message } from './types';
import { TEXT } from './constants';

export function createUserMessage(content: string): Message {
  return {
    id: `msg-${Date.now()}`,
    role: 'user',
    content: content.trim(),
  };
}

export function createAssistantMessage(isFollowUp: boolean): Message {
  return {
    id: `msg-${Date.now()}`,
    role: 'assistant',
    content: isFollowUp ? TEXT.AI_FOLLOW_UP_RESPONSE : TEXT.AI_INITIAL_RESPONSE,
  };
}

export function loadSessionMessages(
  sessionMessages: Array<{ role: 'user' | 'assistant'; content: string }>,
  sessionId: string
): Message[] {
  return sessionMessages.map((msg, index) => ({
    id: `msg-${sessionId}-${index}`,
    role: msg.role,
    content: msg.content,
  }));
}

export function isValidQuery(query: string, isGenerating: boolean): boolean {
  return query.trim().length > 0 && !isGenerating;
}
