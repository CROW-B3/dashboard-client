'use client';

import { Header, SearchInput } from '@b3-crow/ui-kit';
import { Check, Copy, FileText, ImageIcon, Link2, Plus } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useChatHistory } from '@/contexts/ChatHistoryContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AskCrowPage() {
  const { createNewSession, addMessageToSession, activeSessionId } = useChatHistory();
  const [chatStarted, setChatStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const attachMenuRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Close attach menu when clicking outside
  useEffect(() => {
    if (!showAttachMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(e.target as Node)) {
        setShowAttachMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showAttachMenu]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCopy = useCallback(async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleQuerySubmit = (query: string) => {
    if (!query.trim() || isGenerating) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: query.trim(),
    };

    if (!chatStarted) {
      // Start transition animation
      setIsTransitioning(true);

      // Create new session
      const sessionId = createNewSession(query.trim());
      addMessageToSession(sessionId, 'user', query);

      // After transition, show chat
      setTimeout(() => {
        setChatStarted(true);
        setMessages([userMessage]);
        setIsTransitioning(false);
        setIsGenerating(true);

        // Simulate AI response after delay
        setTimeout(() => {
          const aiMessage: Message = {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: "CROW is currently processing your request. Our neural networks are analyzing patterns and generating insights. We'll have a comprehensive response ready for you shortly. In the meantime, feel free to ask follow-up questions or provide additional context.",
          };
          setMessages(prev => [...prev, aiMessage]);
          setIsGenerating(false);
          if (sessionId) {
            addMessageToSession(sessionId, 'assistant', aiMessage.content);
          }
        }, 3000);
      }, 500);
    } else {
      // Add to existing chat
      setMessages(prev => [...prev, userMessage]);
      if (activeSessionId) {
        addMessageToSession(activeSessionId, 'user', query);
      }
      setIsGenerating(true);

      // Simulate AI response
      setTimeout(() => {
        const aiMessage: Message = {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: "I've analyzed your follow-up query. CROW continues to process and refine the response based on your input. The system is designed to maintain context across our conversation for more accurate insights.",
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsGenerating(false);
        if (activeSessionId) {
          addMessageToSession(activeSessionId, 'assistant', aiMessage.content);
        }
      }, 2500);
    }
  };

  const handleAttachOption = (_type: string) => {
    setShowAttachMenu(false);
    // TODO: Handle attachment based on type
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        userInitials="SJ"
        showNotification={true}
        minimal={true}
      />

      <main className="flex-1 flex flex-col px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Landing View */}
        <div
          className={`flex-1 flex items-center justify-center transition-all duration-500 ease-out ${
            isTransitioning || chatStarted ? 'opacity-0 scale-95 pointer-events-none absolute inset-0' : 'opacity-100 scale-100'
          }`}
        >
          <div className="flex flex-col items-center text-center w-full max-w-[896px]">
            {/* Status Indicator */}
            <div
              className="flex items-center gap-2 px-4 h-[25px] rounded-full mb-5"
              style={{
                background: 'rgba(139, 92, 246, 0.10)',
                outline: '1px rgba(139, 92, 246, 0.20) solid',
                outlineOffset: '-1px',
                backdropFilter: 'blur(6px)',
              }}
            >
              <div
                className="w-[6px] h-[6px] rounded-full animate-pulse"
                style={{ background: '#A78BFA' }}
              />
              <span
                className="text-[10px] font-bold uppercase tracking-[1px]"
                style={{ color: '#C4B5FD', lineHeight: '15px' }}
              >
                System Active
              </span>
            </div>

            {/* Title */}
            <h1
              className="font-bold mb-4"
              style={{
                fontSize: 48,
                lineHeight: '48px',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              <span style={{ color: 'white' }}>CROW</span>
              <span style={{ color: '#F3F4F6' }}> </span>
              <span className="bg-gradient-to-r from-[#3d1a6d] to-[#8743FA] bg-clip-text text-transparent">
                ENGINE
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className="text-center max-w-[432px] mb-20"
              style={{
                color: '#9CA3AF',
                fontSize: 14,
                fontWeight: 400,
                lineHeight: '22.75px',
              }}
            >
              Neural interface ready. Start a new session or select a suggested
              prompt below.
            </p>

            {/* Search Input with Plus Button */}
            <div className="w-full max-w-[672px] relative [&_button[aria-label='Submit']_svg]:rotate-[-90deg] [&_.absolute.left-4]:hidden">
              <div
                ref={attachMenuRef}
                className="absolute top-0 h-[48px] sm:h-[54px] z-20 flex items-center justify-center"
                style={{ left: '1rem' }}
              >
                <button
                  type="button"
                  onClick={() => setShowAttachMenu(!showAttachMenu)}
                  className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <Plus size={24} className="text-gray-500 hover:text-gray-300 transition-colors" strokeWidth={2} />
                </button>

                {/* Attachment Menu */}
                {showAttachMenu && (
                  <div
                    className="absolute left-0 top-full mt-2 min-w-[180px] rounded-xl overflow-hidden"
                    style={{
                      background: 'rgba(20, 20, 20, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                      backdropFilter: 'blur(12px)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleAttachOption('document')}
                      className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-white/10 transition-colors"
                    >
                      <FileText size={16} className="text-purple-400" />
                      <span className="text-[13px] text-gray-200">Upload Document</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAttachOption('image')}
                      className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-white/10 transition-colors"
                    >
                      <ImageIcon size={16} className="text-blue-400" />
                      <span className="text-[13px] text-gray-200">Upload Image</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAttachOption('link')}
                      className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-white/10 transition-colors"
                    >
                      <Link2 size={16} className="text-green-400" />
                      <span className="text-[13px] text-gray-200">Paste Link</span>
                    </button>
                  </div>
                )}
              </div>
              <SearchInput
                className="w-full"
                placeholder="Ask CROW anything…"
                onSubmit={handleQuerySubmit}
                showMicButton={false}
                helperText="Answers include sources and supporting interactions."
              />
            </div>
          </div>
        </div>

        {/* Chat View */}
        <div
          className={`flex-1 flex flex-col w-full max-w-[800px] mx-auto transition-all duration-500 ease-out ${
            chatStarted && !isTransitioning ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none absolute inset-0'
          }`}
        >
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto py-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                <div
                  className={`group relative max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-purple-600/30 to-purple-800/30 border border-purple-500/20'
                      : 'bg-white/5 border border-white/10'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-black/50 flex items-center justify-center ring-1 ring-purple-500/30">
                        <Image src="/favicon.webp" alt="CROW" width={16} height={16} className="rounded-full" />
                      </div>
                      <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">CROW</span>
                    </div>
                  )}
                  <p className="text-[14px] text-gray-200 leading-[1.8] whitespace-pre-wrap">
                    {message.content}
                  </p>

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={() => handleCopy(message.id, message.content)}
                    className="absolute -bottom-3 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-black/50 hover:bg-black/70 border border-white/10"
                  >
                    {copiedId === message.id ? (
                      <Check size={12} className="text-green-400" />
                    ) : (
                      <Copy size={12} className="text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            ))}

            {/* Generating Animation */}
            {isGenerating && (
              <div className="flex justify-start animate-fadeIn">
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 max-w-[85%]">
                  <div className="flex items-center gap-4">
                    {/* Animated Logo */}
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center ring-1 ring-purple-500/40">
                        <Image
                          src="/favicon.webp"
                          alt="CROW"
                          width={24}
                          height={24}
                          className="rounded-full animate-pulse"
                        />
                      </div>
                      {/* Orbital ring */}
                      <div className="absolute inset-[-4px] rounded-full border border-purple-500/30 animate-spin" style={{ animationDuration: '3s' }} />
                      <div className="absolute inset-[-8px] rounded-full border border-purple-500/10 animate-spin" style={{ animationDuration: '5s', animationDirection: 'reverse' }} />
                    </div>

                    {/* Status Text */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[13px] font-medium text-white/90">Processing your request</span>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-[3px]">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: '0ms' }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: '200ms' }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: '400ms' }} />
                        </div>
                        <span className="text-[11px] text-gray-500 uppercase tracking-wider">CROW is thinking</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input - Fixed at bottom */}
          <div className="sticky bottom-0 pb-4 pt-6">
            <div className="w-full relative [&_button[aria-label='Submit']_svg]:rotate-[-90deg] [&_.absolute.left-4]:hidden">
              <div
                className="absolute top-0 h-[48px] sm:h-[54px] z-20 flex items-center justify-center"
                style={{ left: '1rem' }}
              >
                <button
                  type="button"
                  onClick={() => setShowAttachMenu(!showAttachMenu)}
                  className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <Plus size={24} className="text-gray-500 hover:text-gray-300 transition-colors" strokeWidth={2} />
                </button>
              </div>
              <SearchInput
                className="w-full"
                placeholder="Continue the conversation…"
                onSubmit={handleQuerySubmit}
                showMicButton={false}
                variant="transparent"
              />
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
