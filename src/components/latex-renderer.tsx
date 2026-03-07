'use client';

import katex from 'katex';
import { useMemo } from 'react';
import 'katex/dist/katex.min.css';

interface LatexBlockProps {
  expression: string;
  displayMode?: boolean;
}

export function LatexBlock({ expression, displayMode = false }: LatexBlockProps) {
  const rendered = useMemo(() => {
    try {
      return katex.renderToString(expression.trim(), {
        displayMode,
        throwOnError: false,
        trust: false,
        strict: false,
      });
    } catch {
      return null;
    }
  }, [expression, displayMode]);

  if (!rendered) {
    return <code className="rounded bg-red-500/10 px-1 py-0.5 text-xs text-red-300">{expression}</code>;
  }

  return (
    <span
      className={displayMode ? 'my-2 block overflow-x-auto text-center' : 'inline'}
      dangerouslySetInnerHTML={{ __html: rendered }}
    />
  );
}
