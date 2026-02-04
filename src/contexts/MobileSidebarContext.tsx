'use client';

import type { ReactNode } from 'react';
import {
  createContext,
  use,
  useCallback,
  useState,
} from 'react';

interface MobileSidebarContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const MobileSidebarContext = createContext<MobileSidebarContextType | null>(null);

interface MobileSidebarProviderProps {
  children: ReactNode;
}

export function MobileSidebarProvider({ children }: MobileSidebarProviderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return (
    <MobileSidebarContext value={{ isOpen, open, close, toggle }}>
      {children}
    </MobileSidebarContext>
  );
}

export function useMobileSidebar() {
  const context = use(MobileSidebarContext);
  if (!context) {
    throw new Error('useMobileSidebar must be used within a MobileSidebarProvider');
  }
  return context;
}
