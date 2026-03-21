'use client';

import type { ReactNode } from 'react';
import Lenis from 'lenis';
import { useEffect, useRef } from 'react';

export interface LenisProviderProps {
  children: ReactNode;
  options?: ConstructorParameters<typeof Lenis>[0];
  wrapper?: string;
  content?: string;
}

export function LenisProvider({ children, options, wrapper, content }: LenisProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const wrapperEl = wrapper ? document.querySelector(wrapper) : undefined;
    const contentEl = content ? document.querySelector(content) : undefined;

    const lenisOptions: ConstructorParameters<typeof Lenis>[0] = {
      duration: 0.6,
      easing: (t: number) => 1 - (1 - t) ** 3,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.2,
      touchMultiplier: 2,
      wrapper: wrapperEl || window,
      ...(contentEl && { content: contentEl }),
      ...options,
    };

    const lenis = new Lenis(lenisOptions);
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      rafIdRef.current = requestAnimationFrame(raf);
    }

    rafIdRef.current = requestAnimationFrame(raf);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [options, wrapper, content]);

  return <>{children}</>;
}
