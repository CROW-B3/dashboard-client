'use client';

import type { ReactNode } from 'react';
import {
  createContext,
  use,
  useCallback,
  useMemo,
  useState,
} from 'react';

export interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
  messages: { role: 'user' | 'assistant'; content: string }[];
}

interface ChatHistoryContextType {
  sessions: ChatSession[];
  activeSessionId: string | null;
  isExpanded: boolean;
  createNewSession: (title?: string) => string;
  setActiveSession: (id: string) => void;
  updateSessionTitle: (id: string, title: string) => void;
  deleteSession: (id: string) => void;
  addMessageToSession: (id: string, role: 'user' | 'assistant', content: string) => void;
  toggleExpanded: () => void;
}

const ChatHistoryContext = createContext<ChatHistoryContextType | null>(null);

function generateId(): string {
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function extractTitleFromPrompt(prompt: string): string {
  const words = prompt.trim().split(/\s+/).slice(0, 4);
  const title = words.join(' ');
  return title.length > 30 ? `${title.slice(0, 27)}...` : title || 'New Chat';
}

// Demo chats to show initially (from Figma design)
// Using static date to avoid hydration mismatch
const STATIC_DATE = new Date('2024-01-01T00:00:00.000Z');
const demoSessions: ChatSession[] = [
  { id: 'demo-1', title: 'Recursive Pattern Analysis', createdAt: STATIC_DATE, messages: [] },
  { id: 'demo-2', title: 'Latent Vector Alignment', createdAt: STATIC_DATE, messages: [] },
  { id: 'demo-3', title: 'Context Window Expansion', createdAt: STATIC_DATE, messages: [] },
  { id: 'demo-4', title: 'Prompt Inference Cycle', createdAt: STATIC_DATE, messages: [] },
  { id: 'demo-5', title: 'Semantic Layer Mapping', createdAt: STATIC_DATE, messages: [] },
  { id: 'demo-6', title: 'Cognitive Load Test', createdAt: STATIC_DATE, messages: [] },
  { id: 'demo-7', title: 'Memory Checkpoint', createdAt: STATIC_DATE, messages: [] },
];

export function ChatHistoryProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>(demoSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const createNewSession = useCallback((title?: string) => {
    const id = generateId();
    const newSession: ChatSession = {
      id,
      title: title ? extractTitleFromPrompt(title) : 'New Chat',
      createdAt: new Date(),
      messages: [],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(id);
    return id;
  }, []);

  const setActiveSession = useCallback((id: string) => {
    setActiveSessionId(id);
  }, []);

  const updateSessionTitle = useCallback((id: string, title: string) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === id ? { ...session, title } : session
      )
    );
  }, []);

  const deleteSession = useCallback((id: string) => {
    setSessions((prev) => {
      const filtered = prev.filter((session) => session.id !== id);
      return filtered;
    });
    // If the deleted session was active, clear the active session
    setActiveSessionId((prevActiveId) =>
      prevActiveId === id ? null : prevActiveId
    );
  }, []);

  const addMessageToSession = useCallback(
    (id: string, role: 'user' | 'assistant', content: string) => {
      setSessions((prev) =>
        prev.map((session) => {
          if (session.id !== id) return session;

          const newMessage = { role, content };
          const updatedSession = {
            ...session,
            messages: [...session.messages, newMessage],
          };

          // Update title from first user message if it's still "New Chat"
          if (
            role === 'user' &&
            session.messages.length === 0 &&
            session.title === 'New Chat'
          ) {
            updatedSession.title = extractTitleFromPrompt(content);
          }

          return updatedSession;
        })
      );
    },
    []
  );

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const contextValue = useMemo(
    () => ({
      sessions,
      activeSessionId,
      isExpanded,
      createNewSession,
      setActiveSession,
      updateSessionTitle,
      deleteSession,
      addMessageToSession,
      toggleExpanded,
    }),
    [
      sessions,
      activeSessionId,
      isExpanded,
      createNewSession,
      setActiveSession,
      updateSessionTitle,
      deleteSession,
      addMessageToSession,
      toggleExpanded,
    ]
  );

  return (
    <ChatHistoryContext value={contextValue}>
      {children}
    </ChatHistoryContext>
  );
}

export function useChatHistory() {
  const context = use(ChatHistoryContext);
  if (!context) {
    throw new Error('useChatHistory must be used within a ChatHistoryProvider');
  }
  return context;
}
