import { Suspense } from 'react';

import { InteractionsTable } from './table';

export default function InteractionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Interactions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Customer interaction events from all sources
        </p>
      </div>
      <Suspense fallback={<div className="space-y-2">{['a', 'b', 'c', 'd', 'e'].map((k) => <div key={k} className="h-12 animate-pulse rounded bg-muted" />)}</div>}>
        <InteractionsTable />
      </Suspense>
    </div>
  );
}
