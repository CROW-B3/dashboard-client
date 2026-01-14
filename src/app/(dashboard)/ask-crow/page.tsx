'use client';

import type { Message } from '@/components/ask-crow/types';
import { Header } from '@b3-crow/ui-kit';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChatView } from '@/components/ask-crow/ChatView';
import { ANIMATION_DURATIONS } from '@/components/ask-crow/constants';
import { LandingView } from '@/components/ask-crow/LandingView';
import { createAssistantMessage, createUserMessage, isValidQuery, loadSessionMessages } from '@/components/ask-crow/utils';
import { useChatHistory } from '@/contexts/ChatHistoryContext';
import { useMobileSidebar } from '@/contexts/MobileSidebarContext';

export default function AskCrowPage() {
  const { createNewSession, addMessageToSession, activeSessionId, sessions } = useChatHistory();
  const { toggle } = useMobileSidebar();
  const attachMenuRef = useRef<HTMLDivElement>(null);

  const [chatStarted, setChatStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!activeSessionId) return;

    const activeSession = sessions.find((s) => s.id === activeSessionId);
    if (!activeSession || activeSession.messages.length === 0) return;

    const loadedMessages = loadSessionMessages(activeSession.messages, activeSessionId);
    setMessages(loadedMessages);
    setChatStarted(true);
  }, [activeSessionId, sessions]);

  const handleCopy = useCallback(async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), ANIMATION_DURATIONS.COPY_FEEDBACK);
  }, []);

  const handleInitialAiResponse = useCallback(
    (sessionId: string) => {
      const aiMessage = createAssistantMessage(false);
      setMessages((prev) => [...prev, aiMessage]);
      setIsGenerating(false);
      addMessageToSession(sessionId, 'assistant', aiMessage.content);
    },
    [addMessageToSession]
  );

  const handleStartNewChat = useCallback(
    (query: string, userMessage: Message) => {
      setIsTransitioning(true);
      const sessionId = createNewSession(query);

      setTimeout(() => {
        setChatStarted(true);
        setMessages([userMessage]);
        setIsTransitioning(false);
        setIsGenerating(true);

        setTimeout(() => handleInitialAiResponse(sessionId), ANIMATION_DURATIONS.AI_RESPONSE_INITIAL);
      }, ANIMATION_DURATIONS.START_CHAT);
    },
    [createNewSession, handleInitialAiResponse]
  );

  const handleFollowUpMessage = useCallback(
    (query: string, userMessage: Message) => {
      setMessages((prev) => [...prev, userMessage]);
      addMessageToSession(activeSessionId || '', 'user', query);
      setIsGenerating(true);

      setTimeout(() => {
        const aiMessage = createAssistantMessage(true);
        setMessages((prev) => [...prev, aiMessage]);
        setIsGenerating(false);
        addMessageToSession(activeSessionId || '', 'assistant', aiMessage.content);
      }, ANIMATION_DURATIONS.AI_RESPONSE_FOLLOW_UP);
    },
    [activeSessionId, addMessageToSession]
  );

  const handleQuerySubmit = useCallback(
    (query: string) => {
      if (!isValidQuery(query, isGenerating)) return;

      const userMessage = createUserMessage(query);

      if (!chatStarted) {
        handleStartNewChat(query, userMessage);
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
        userInitials="SJ"
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
