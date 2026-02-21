import { Suspense } from 'react';

import { PatternsTable } from './table';

export default function PatternsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Patterns</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI-detected behavioral patterns from your data
        </p>
      </div>
      <Suspense fallback={<div className="space-y-2">{['a', 'b', 'c', 'd', 'e'].map((k) => <div key={k} className="h-12 animate-pulse rounded bg-muted" />)}</div>}>
        <PatternsTable />
      </Suspense>
    </div>
  );
}
