'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

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
    return stored === 'true' ? true : false;
  } catch {
    return false;
  }
}

export function SidebarCollapseProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsCollapsed(getInitialCollapsedState());
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, isCollapsed.toString());
    } catch {
      // Handle quota exceeded or other localStorage errors
    }
  }, [isCollapsed, isMounted]);

  const toggle = () => setIsCollapsed((prev) => !prev);
  const collapse = () => setIsCollapsed(true);
  const expand = () => setIsCollapsed(false);

  return (
    <SidebarCollapseContext.Provider value={{ isCollapsed, toggle, collapse, expand }}>
      {children}
    </SidebarCollapseContext.Provider>
  );
}

export function useSidebarCollapse(): SidebarCollapseContextType {
  const context = useContext(SidebarCollapseContext);
  if (context === undefined) {
    throw new Error('useSidebarCollapse must be used within SidebarCollapseProvider');
  }
  return context;
}
