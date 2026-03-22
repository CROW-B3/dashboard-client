'use client';

import React, { createContext, use, useCallback, useEffect, useMemo, useState } from 'react';

interface SidebarCollapseContextType {
  isCollapsed: boolean;
  toggle: () => void;
  collapse: () => void;
  expand: () => void;
}

const SidebarCollapseContext = createContext<SidebarCollapseContextType | undefined>(undefined);

const STORAGE_KEY = 'sidebar-collapsed';

function getInitialCollapsedState(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'true';
  } catch {
    return false;
  }
}

export function SidebarCollapseProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

useEffect(() => {
    const initialState = getInitialCollapsedState();
    setIsCollapsed(initialState);
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, isCollapsed.toString());
    } catch {
    }
  }, [isCollapsed, isMounted]);

  const toggle = useCallback(() => setIsCollapsed((prev) => !prev), []);
  const collapse = useCallback(() => setIsCollapsed(true), []);
  const expand = useCallback(() => setIsCollapsed(false), []);

  const value = useMemo(
    () => ({ isCollapsed, toggle, collapse, expand }),
    [isCollapsed, toggle, collapse, expand]
  );

  return (
    <SidebarCollapseContext value={value}>
      {children}
    </SidebarCollapseContext>
  );
}

export function useSidebarCollapse(): SidebarCollapseContextType {
  const context = use(SidebarCollapseContext);
  if (context === undefined) {
    throw new Error('useSidebarCollapse must be used within SidebarCollapseProvider');
  }
  return context;
}
