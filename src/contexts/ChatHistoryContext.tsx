'use client';

import type { ReactNode } from 'react';
import {
  createContext,
  use,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

interface ApiChatSession {
  id: string;
  organizationId: string;
  createdAt: number;
  title?: string;
}

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
  setActiveSession: (id: string) => void;
  updateSessionTitle: (id: string, title: string) => void;
  deleteSession: (id: string) => void;
  toggleExpanded: () => void;
  refreshSessions: () => void;
}

const ChatHistoryContext = createContext<ChatHistoryContextType | null>(null);

async function fetchChatSessions(organizationId: string): Promise<ApiChatSession[]> {
  const response = await fetch(
    `${API_GATEWAY_URL}/api/v1/chat/sessions/organization/${organizationId}`,
    { credentials: 'include' }
  );
  if (!response.ok) return [];
  const data = await response.json() as { sessions: ApiChatSession[] };
  return data.sessions ?? [];
}

function formatSessionTitle(session: ApiChatSession): string {
  if (session.title) return session.title;
  return new Date(session.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface ChatHistoryProviderProps {
  children: ReactNode;
  organizationId?: string;
}

export function ChatHistoryProvider({ children, organizationId }: ChatHistoryProviderProps) {
  const queryClient = useQueryClient();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [titleOverrides, setTitleOverrides] = useState<Record<string, string>>({});
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const queryKey = useMemo(() => ['chat-history-sessions', organizationId], [organizationId]);

  const { data: apiSessions = [] } = useQuery({
    queryKey,
    queryFn: () => fetchChatSessions(organizationId!),
    enabled: !!organizationId,
    staleTime: 30 * 1000,
  });

  const sessions: ChatSession[] = useMemo(
    () =>
      apiSessions
        .filter((s) => !deletedIds.has(s.id))
        .map((s) => ({
          id: s.id,
          title: titleOverrides[s.id] ?? formatSessionTitle(s),
          createdAt: new Date(s.createdAt),
          messages: [],
        })),
    [apiSessions, titleOverrides, deletedIds]
  );

  const refreshSessions = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  const setActiveSession = useCallback((id: string) => {
    setActiveSessionId(id);
  }, []);

  const updateSessionTitle = useCallback((id: string, title: string) => {
    setTitleOverrides((prev) => ({ ...prev, [id]: title }));
  }, []);

  const deleteSession = useCallback((id: string) => {
    setDeletedIds((prev) => new Set([...prev, id]));
    setActiveSessionId((prev) => (prev === id ? null : prev));
  }, []);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const contextValue = useMemo(
    () => ({
      sessions,
      activeSessionId,
      isExpanded,
      setActiveSession,
      updateSessionTitle,
      deleteSession,
      toggleExpanded,
      refreshSessions,
    }),
    [
      sessions,
      activeSessionId,
      isExpanded,
      setActiveSession,
      updateSessionTitle,
      deleteSession,
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
