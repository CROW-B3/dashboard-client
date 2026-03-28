'use client';

import { useEffect, useRef } from 'react';

interface MarkdownRendererProps {
  content: string;
}

function markdownToHtml(md: string): string {
  let html = md
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-semibold text-gray-200 mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-base font-semibold text-gray-100 mt-4 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-lg font-bold text-white mt-4 mb-2">$1</h1>')
    // Images: ![alt](url)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="my-3 rounded-lg max-w-full max-h-[300px] object-contain border border-white/10" loading="lazy" />')
    // Links: [text](url) — but not images (already handled above)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-violet-400 hover:text-violet-300 underline">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="text-violet-300 bg-white/5 rounded px-1.5 py-0.5 text-xs">$1</code>')
    .replace(/^\* (.+)$/gm, '<li class="text-gray-300 ml-4 list-disc">$1</li>')
    .replace(/^- (.+)$/gm, '<li class="text-gray-300 ml-4 list-disc">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="text-gray-300 ml-4 list-decimal">$1</li>')
    .replace(/\[(\d+)\]/g, '<sup class="text-violet-400 text-[10px]">[$1]</sup>')
    .replace(/^---$/gm, '<hr class="border-white/10 my-3" />')
    .replace(/\n\n/g, '</p><p class="text-[14px] text-gray-300 leading-relaxed mb-2">')
    .replace(/\n/g, '<br />');

  html = `<p class="text-[14px] text-gray-300 leading-relaxed mb-2">${  html  }</p>`;
  html = html.replace(/<p[^>]*><\/p>/g, '');
  html = html.replace(/<p([^>]*)>(<h[123][^>]*>)/g, '$2');
  html = html.replace(/(<\/h[123]>)<\/p>/g, '$1');
  html = html.replace(/<p([^>]*)>(<li[^>]*>)/g, '<ul class="my-2 space-y-1">$2');
  html = html.replace(/(<\/li>)<\/p>/g, '$1</ul>');

  return html;
}

function MermaidBlock({ code }: { code: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    import('mermaid').then((mermaid) => {
      if (cancelled || !containerRef.current) return;
      mermaid.default.initialize({ startOnLoad: false, theme: 'dark' });
      const id = `mermaid-${Date.now()}`;
      mermaid.default.render(id, code).then(({ svg }) => {
        if (!cancelled && containerRef.current) containerRef.current.innerHTML = svg;
      }).catch(() => {
        if (!cancelled && containerRef.current) containerRef.current.textContent = code;
      });
    });

    return () => { cancelled = true; };
  }, [code]);

  return (
    <div ref={containerRef} className="my-4 flex justify-center overflow-x-auto rounded-lg p-4"
      style={{ background: 'rgba(10, 5, 20, 0.6)', border: '1px solid rgba(255,255,255,0.08)' }} />
  );
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  const mermaidMatch = content.match(/```mermaid\n([\s\S]*?)```/);
  const parts = mermaidMatch ? content.split(/```mermaid\n[\s\S]*?```/) : [content];

  return (
    <div>
      {parts.map((part, i) => (
        <div key={i}>
          <div dangerouslySetInnerHTML={{ __html: markdownToHtml(part) }} />
          {mermaidMatch && i === 0 && mermaidMatch[1] && <MermaidBlock code={mermaidMatch[1]} />}
        </div>
      ))}
    </div>
  );
}
