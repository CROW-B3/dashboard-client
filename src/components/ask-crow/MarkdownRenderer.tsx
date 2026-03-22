'use client';

import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

function MermaidBlock({ code }: { code: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    import('mermaid').then((mermaid) => {
      if (cancelled || !containerRef.current) return;
      mermaid.default.initialize({
        startOnLoad: false,
        theme: 'dark',
        themeVariables: {
          primaryColor: '#7c3aed',
          primaryTextColor: '#e5e7eb',
          primaryBorderColor: '#4c1d95',
          lineColor: '#6b7280',
          secondaryColor: '#1e1b4b',
          tertiaryColor: '#0f0a1e',
          background: '#0a0514',
          mainBkg: '#1a1035',
          nodeBorder: '#4c1d95',
          clusterBkg: '#0f0a1e',
          titleColor: '#e5e7eb',
          edgeLabelBackground: '#0a0514',
        },
      });
      const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      mermaid.default.render(id, code).then(({ svg }) => {
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      }).catch(() => {
        if (!cancelled && containerRef.current) {
          containerRef.current.textContent = code;
        }
      });
    });

    return () => { cancelled = true; };
  }, [code]);

  return (
    <div
      ref={containerRef}
      className="my-4 flex justify-center overflow-x-auto rounded-lg p-4"
      style={{ background: 'rgba(10, 5, 20, 0.6)', border: '1px solid rgba(255,255,255,0.08)' }}
    />
  );
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-invert prose-sm max-w-none
      prose-headings:text-gray-200 prose-headings:font-semibold
      prose-p:text-gray-300 prose-p:leading-relaxed
      prose-a:text-violet-400 prose-a:no-underline hover:prose-a:underline
      prose-strong:text-white
      prose-code:text-violet-300 prose-code:bg-white/5 prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:text-xs
      prose-pre:bg-[rgba(10,5,20,0.6)] prose-pre:border prose-pre:border-white/8 prose-pre:rounded-lg
      prose-li:text-gray-300
      prose-table:text-gray-300
      prose-th:text-gray-200 prose-th:border-white/10
      prose-td:border-white/10
      prose-blockquote:border-violet-500/40 prose-blockquote:text-gray-400
      prose-hr:border-white/10
    ">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const codeStr = String(children).replace(/\n$/, '');

            if (match?.[1] === 'mermaid') {
              return <MermaidBlock code={codeStr} />;
            }

            if (match) {
              return (
                <pre className="overflow-x-auto rounded-lg p-4 text-xs" style={{ background: 'rgba(10, 5, 20, 0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <code className={className} {...props}>{children}</code>
                </pre>
              );
            }

            return <code className={className} {...props}>{children}</code>;
          },
          pre({ children }) {
            return <>{children}</>;
          },
        }}
      />
    </div>
  );
}
