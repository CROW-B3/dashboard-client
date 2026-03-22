'use client';

import type { Message } from '@/components/ask-crow/types';
import { Header } from '@b3-crow/ui-kit';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChatView } from '@/components/ask-crow/ChatView';
import { ANIMATION_DURATIONS } from '@/components/ask-crow/constants';
import { LandingView } from '@/components/ask-crow/LandingView';
import { isValidQuery } from '@/components/ask-crow/utils';
import { useChatHistory } from '@/contexts/ChatHistoryContext';
import { useMobileSidebar } from '@/contexts/MobileSidebarContext';
import { useCurrentUser } from '@/hooks/use-current-user';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

interface ApiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string | number;
}

async function fetchSessionMessages(sessionId: string): Promise<ApiMessage[]> {
  const response = await fetch(
    `${API_GATEWAY_URL}/api/v1/chat/sessions/${sessionId}/messages?limit=50`,
    { credentials: 'include' }
  );
  if (!response.ok) return [];
  const data = await response.json() as { messages: ApiMessage[] };
  return data.messages ?? [];
}

async function createChatSession(
  organizationId: string,
  userId: string,
  title: string
): Promise<string> {
  const response = await fetch(`${API_GATEWAY_URL}/api/v1/chat/sessions`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ organizationId, userId, title }),
  });
  if (!response.ok) throw new Error('Failed to create chat session');
  const data = await response.json() as { session: { id: string; title: string } };
  return data.session.id;
}

async function sendChatMessage(
  sessionId: string,
  content: string
): Promise<{ userMessage: ApiMessage; assistantMessage: ApiMessage }> {
  const response = await fetch(
    `${API_GATEWAY_URL}/api/v1/chat/sessions/${sessionId}/messages`,
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, role: 'user' }),
    }
  );
  if (!response.ok) throw new Error('Failed to send message');
  const data = await response.json() as { message: ApiMessage; assistantMessage: ApiMessage };
  return { userMessage: data.message, assistantMessage: data.assistantMessage };
}

function apiMessagesToUiMessages(apiMessages: ApiMessage[]): Message[] {
  return apiMessages.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
  }));
}

export default function AskCrowPage() {
  const { setActiveSession } = useChatHistory();
  const { toggle } = useMobileSidebar();
  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();
  const attachMenuRef = useRef<HTMLDivElement>(null);

  const organizationId = user?.orgUuid;
  const userId = user?.betterAuthUserId;

  const [chatStarted, setChatStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Fetch messages when a session is active
  const { data: sessionMessages } = useQuery({
    queryKey: ['ask-crow-messages', activeSessionId],
    queryFn: () => fetchSessionMessages(activeSessionId!),
    enabled: !!activeSessionId,
  });

  // Sync fetched messages into local state (after session switch)
  useEffect(() => {
    if (!sessionMessages || sessionMessages.length === 0) return;
    setMessages(apiMessagesToUiMessages(sessionMessages));
    setChatStarted(true);
  }, [sessionMessages]);

  const handleCopy = useCallback(async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), ANIMATION_DURATIONS.COPY_FEEDBACK);
  }, []);

  const createSessionMutation = useMutation({
    mutationFn: ({ title }: { title: string }) => {
      if (!organizationId || !userId) throw new Error('User not loaded');
      return createChatSession(organizationId, userId, title);
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ sessionId, content }: { sessionId: string; content: string }) =>
      sendChatMessage(sessionId, content),
    onSuccess: (result, variables) => {
      // Replace optimistic assistant placeholder with real response
      const assistantMsg: Message = {
        id: result.assistantMessage.id,
        role: 'assistant',
        content: result.assistantMessage.content,
      };
      setMessages((prev) => {
        // Remove the temporary generating placeholder and append real response
        return [...prev.filter((m) => m.id !== 'generating-placeholder'), assistantMsg];
      });
      setIsGenerating(false);
      void queryClient.invalidateQueries({ queryKey: ['ask-crow-messages', variables.sessionId] });
    },
    onError: () => {
      setMessages((prev) => prev.filter((m) => m.id !== 'generating-placeholder'));
      setIsGenerating(false);
    },
  });

  const handleStartNewChat = useCallback(
    async (query: string, userMessage: Message) => {
      if (!organizationId || !userId) return;

      setIsTransitioning(true);

      let sessionId: string;
      try {
        sessionId = await createSessionMutation.mutateAsync({ title: query });
      } catch {
        setIsTransitioning(false);
        return;
      }

      setActiveSessionId(sessionId);
      setActiveSession(sessionId);

      setTimeout(() => {
        setChatStarted(true);
        setMessages([userMessage]);
        setIsTransitioning(false);
        setIsGenerating(true);

        sendMessageMutation.mutate({ sessionId, content: query });
      }, ANIMATION_DURATIONS.START_CHAT);
    },
    [organizationId, userId, createSessionMutation, sendMessageMutation, setActiveSession]
  );

  const handleFollowUpMessage = useCallback(
    (query: string, userMessage: Message) => {
      if (!activeSessionId) return;

      setMessages((prev) => [...prev, userMessage]);
      setIsGenerating(true);

      sendMessageMutation.mutate({ sessionId: activeSessionId, content: query });
    },
    [activeSessionId, sendMessageMutation]
  );

  const handleQuerySubmit = useCallback(
    (query: string) => {
      if (!isValidQuery(query, isGenerating)) return;

      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: query.trim(),
      };

      if (!chatStarted) {
        void handleStartNewChat(query, userMessage);
      } else {
        handleFollowUpMessage(query, userMessage);
      }
    },
    [chatStarted, isGenerating, handleStartNewChat, handleFollowUpMessage]
  );

  const isLandingVisible = !chatStarted && !isTransitioning;
  const isChatVisible = chatStarted && !isTransitioning;

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        userInitials={(user?.name || user?.email || 'U').slice(0, 2).toUpperCase()}
        showNotification
        minimal
        onMenuClick={toggle}
        logoSrc="/favicon.webp"
      />

      <main className="flex-1 flex flex-col px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <LandingView
          isVisible={isLandingVisible}
          onQuerySubmit={handleQuerySubmit}
          showAttachMenu={showAttachMenu}
          onAttachMenuToggle={() => setShowAttachMenu(!showAttachMenu)}
          onAttachOption={() => setShowAttachMenu(false)}
          attachMenuRef={attachMenuRef}
        />

        <ChatView
          isVisible={isChatVisible}
          messages={messages}
          isGenerating={isGenerating}
          copiedMessageId={copiedMessageId}
          showAttachMenu={showAttachMenu}
          onQuerySubmit={handleQuerySubmit}
          onCopyMessage={handleCopy}
          onAttachMenuToggle={() => setShowAttachMenu(!showAttachMenu)}
          onAttachOption={() => setShowAttachMenu(false)}
        />
      </main>
    </div>
  );
}
