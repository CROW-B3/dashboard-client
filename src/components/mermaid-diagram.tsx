'use client';

import { useEffect, useId, useRef, useState } from 'react';

interface MermaidDiagramProps {
  chart: string;
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const diagramId = useId().replace(/:/g, '_');

  useEffect(() => {
    let cancelled = false;
    import('mermaid').then(async ({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        themeVariables: {
          primaryColor: '#7c3aed',
          primaryTextColor: '#e5e7eb',
          lineColor: '#a78bfa',
          secondaryColor: '#1e1b4b',
          tertiaryColor: '#1f2937',
        },
      });
      try {
        const { svg: renderedSvg } = await mermaid.render(`mermaid-${diagramId}`, chart.trim());
        if (!cancelled) setSvg(renderedSvg);
      } catch (renderError) {
        if (!cancelled) setError(renderError instanceof Error ? renderError.message : 'Invalid diagram');
      }
    });
    return () => { cancelled = true; };
  }, [chart, diagramId]);

  if (error) {
    return (
      <div className="my-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
        Diagram error: {error}
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="my-2 flex items-center justify-center rounded-lg border border-white/10 bg-black/20 p-6 text-xs text-gray-500">
        Rendering diagram...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-2 overflow-x-auto rounded-lg border border-white/10 bg-black/20 p-4 [&_svg]:mx-auto [&_svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
