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

const STATIC_DATE = new Date('2024-01-01T00:00:00.000Z');
const demoSessions: ChatSession[] = [
  {
    id: 'demo-1',
    title: 'Recursive Pattern Analysis',
    createdAt: STATIC_DATE,
    messages: [
      { role: 'user', content: 'Analyze the recursive patterns in this dataset' },
      { role: 'assistant', content: 'CROW has identified several recursive patterns. The primary pattern shows a 3-level recursion depth with exponential branching at each level. This indicates a hierarchical structure in your data.' }
    ]
  },
  {
    id: 'demo-2',
    title: 'Latent Vector Alignment',
    createdAt: STATIC_DATE,
    messages: [
      { role: 'user', content: 'How do we align latent vectors?' },
      { role: 'assistant', content: 'Latent vector alignment can be achieved through several methods: orthogonal Procrustes analysis, canonical correlation analysis, or learned alignment layers. For your use case, I recommend the orthogonal Procrustes approach for its computational efficiency.' }
    ]
  },
  {
    id: 'demo-3',
    title: 'Context Window Expansion',
    createdAt: STATIC_DATE,
    messages: [
      { role: 'user', content: 'What about expanding context windows?' },
      { role: 'assistant', content: 'Context window expansion involves several techniques: attention caching, sparse attention patterns, and sliding window mechanisms. The choice depends on your latency requirements and memory constraints.' }
    ]
  },
  {
    id: 'demo-4',
    title: 'Prompt Inference Cycle',
    createdAt: STATIC_DATE,
    messages: [
      { role: 'user', content: 'Explain the prompt inference cycle' },
      { role: 'assistant', content: 'The prompt inference cycle consists of: input tokenization, embedding generation, multi-head attention computation, feed-forward network processing, and output token generation. Each cycle refines the model\'s understanding of context.' }
    ]
  },
  {
    id: 'demo-5',
    title: 'Semantic Layer Mapping',
    createdAt: STATIC_DATE,
    messages: [
      { role: 'user', content: 'How do we map semantic layers?' },
      { role: 'assistant', content: 'Semantic layer mapping involves creating representations of relationships between concepts. We use graph-based structures and embedding spaces to capture these relationships, enabling better semantic understanding.' }
    ]
  },
  {
    id: 'demo-6',
    title: 'Cognitive Load Test',
    createdAt: STATIC_DATE,
    messages: [
      { role: 'user', content: 'Run a cognitive load test' },
      { role: 'assistant', content: 'Cognitive load test results show optimal performance at current token counts. The system maintains 94% accuracy with 52ms average latency across all test cases. No bottlenecks detected.' }
    ]
  },
  {
    id: 'demo-7',
    title: 'Memory Checkpoint',
    createdAt: STATIC_DATE,
    messages: [
      { role: 'user', content: 'Create a memory checkpoint' },
      { role: 'assistant', content: 'Memory checkpoint created successfully. Current state: 2.3GB allocated, 1.8GB in use. All critical parameters saved. You can resume from this point anytime.' }
    ]
  },
];

export function ChatHistoryProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
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
