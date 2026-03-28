'use client';

import type { ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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

interface ApiSession {
  id: string;
  title?: string;
  createdAt?: string | number;
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
  refreshSessions: () => void;
}

const ChatHistoryContext = createContext<ChatHistoryContextType | null>(null);

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

function generateId(): string {
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function extractTitleFromPrompt(prompt: string): string {
  const words = prompt.trim().split(/\s+/).slice(0, 4);
  const title = words.join(' ');
  return title.length > 30 ? `${title.slice(0, 27)}...` : title || 'New Chat';
}

function apiSessionToChatSession(s: ApiSession): ChatSession {
  return {
    id: s.id,
    title: s.title || 'New Chat',
    createdAt: s.createdAt ? new Date(typeof s.createdAt === 'number' ? s.createdAt * 1000 : s.createdAt) : new Date(),
    messages: [],
  };
}

interface ChatHistoryProviderProps {
  children: ReactNode;
  organizationId?: string | undefined;
}

export function ChatHistoryProvider({ children, organizationId }: ChatHistoryProviderProps) {
  const queryClient = useQueryClient();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [localSessions, setLocalSessions] = useState<ChatSession[]>([]);

  const { data: apiSessions } = useQuery<ChatSession[]>({
    queryKey: ['chat-sessions', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      const res = await fetch(
        `${API_GATEWAY_URL}/api/v1/chat/sessions/organization/${organizationId}`,
        { credentials: 'include' }
      );
      if (!res.ok) return [];
      const data = await res.json() as { sessions?: ApiSession[] } | ApiSession[];
      const rawSessions = Array.isArray(data) ? data : (data.sessions ?? []);
      return rawSessions.map(apiSessionToChatSession);
    },
    enabled: !!organizationId,
    staleTime: 30 * 1000,
  });

  const sessions = useMemo(() => {
    const remote = apiSessions ?? [];
    // Merge: local sessions that don't yet appear in remote come first
    const remoteIds = new Set(remote.map((s) => s.id));
    const localOnly = localSessions.filter((s) => !remoteIds.has(s.id));
    return [...localOnly, ...remote];
  }, [apiSessions, localSessions]);

  const refreshSessions = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['chat-sessions', organizationId] });
  }, [queryClient, organizationId]);

  const createNewSession = useCallback((title?: string) => {
    const id = generateId();
    const newSession: ChatSession = {
      id,
      title: title ? extractTitleFromPrompt(title) : 'New Chat',
      createdAt: new Date(),
      messages: [],
    };
    setLocalSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(id);
    return id;
  }, []);

  const setActiveSession = useCallback((id: string) => {
    setActiveSessionId(id);
  }, []);

  const updateSessionTitle = useCallback((id: string, title: string) => {
    // Update in local overrides
    setLocalSessions((prev) =>
      prev.map((session) =>
        session.id === id ? { ...session, title } : session
      )
    );
    // Also update the query cache so remote sessions get updated in UI
    queryClient.setQueryData<ChatSession[]>(['chat-sessions', organizationId], (old) =>
      old ? old.map((s) => (s.id === id ? { ...s, title } : s)) : old
    );
  }, [queryClient, organizationId]);

  const deleteSession = useCallback((id: string) => {
    setLocalSessions((prev) => prev.filter((session) => session.id !== id));
    queryClient.setQueryData<ChatSession[]>(['chat-sessions', organizationId], (old) =>
      old ? old.filter((s) => s.id !== id) : old
    );
    setActiveSessionId((prevActiveId) =>
      prevActiveId === id ? null : prevActiveId
    );
  }, [queryClient, organizationId]);

  const addMessageToSession = useCallback(
    (id: string, role: 'user' | 'assistant', content: string) => {
      const updateFn = (session: ChatSession): ChatSession => {
        if (session.id !== id) return session;
        const newMessage = { role, content };
        const updatedMessages = [...session.messages, newMessage];
        const updatedTitle =
          role === 'user' && session.messages.length === 0 && session.title === 'New Chat'
            ? extractTitleFromPrompt(content)
            : session.title;
        return { ...session, messages: updatedMessages, title: updatedTitle };
      };

      setLocalSessions((prev) => prev.map(updateFn));
      queryClient.setQueryData<ChatSession[]>(['chat-sessions', organizationId], (old) =>
        old ? old.map(updateFn) : old
      );
    },
    [queryClient, organizationId]
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
      refreshSessions,
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
      refreshSessions,
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
