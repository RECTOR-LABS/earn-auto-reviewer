'use client';

import { Card } from './ui/card';

interface LoadingStateProps {
  judgeCount?: number;
}

export function LoadingState({ judgeCount = 8 }: LoadingStateProps) {
  return (
    <div className="w-full space-y-6">
      {/* Overall Score Card Skeleton */}
      <Card className="p-8">
        <div className="space-y-6 animate-pulse">
          {/* Score skeleton */}
          <div className="flex flex-col items-center space-y-4">
            <div className="h-20 w-32 bg-muted rounded-lg" />
            <div className="h-8 w-24 bg-muted rounded-full" />
          </div>

          {/* Verdict skeleton */}
          <div className="flex flex-col items-center space-y-2">
            <div className="h-6 w-48 bg-muted rounded" />
            <div className="h-4 w-64 bg-muted rounded" />
          </div>

          {/* Finding counts skeleton */}
          <div className="flex justify-center gap-4 pt-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-center space-y-1">
                <div className="h-8 w-8 bg-muted rounded mx-auto" />
                <div className="h-3 w-12 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Judge Cards Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        </div>

        <div className="space-y-3">
          {[...Array(judgeCount)].map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-muted rounded-full" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-muted rounded" />
                    <div className="h-3 w-20 bg-muted rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <div className="h-5 w-16 bg-muted rounded-full" />
                    <div className="h-5 w-16 bg-muted rounded-full" />
                  </div>
                  <div className="text-right">
                    <div className="h-8 w-16 bg-muted rounded" />
                  </div>
                  <div className="w-5 h-5 bg-muted rounded" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Progress indicator */}
      <div className="text-center space-y-2">
        <div className="flex justify-center gap-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Analyzing with {judgeCount} expert judges...
        </p>
      </div>
    </div>
  );
}
