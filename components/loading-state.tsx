'use client';

import { Card } from './ui/card';

export function LoadingState() {
  return (
    <Card className="w-full max-w-3xl p-8">
      <div className="space-y-6 animate-pulse">
        {/* Score skeleton */}
        <div className="flex flex-col items-center space-y-4">
          <div className="h-20 w-32 bg-muted rounded-lg" />
          <div className="h-6 w-24 bg-muted rounded-full" />
        </div>

        {/* Breakdown skeleton */}
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-8 w-16 bg-muted rounded" />
            </div>
          ))}
        </div>

        {/* Notes skeleton */}
        <div className="space-y-3 mt-8">
          <div className="h-5 w-32 bg-muted rounded" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="h-6 w-6 bg-muted rounded shrink-0" />
              <div className="h-6 flex-1 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
