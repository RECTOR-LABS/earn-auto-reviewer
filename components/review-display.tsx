'use client';

import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ReviewResult } from '@/types';
import { getScoreGrade, getScoreColor } from '@/lib/scoring';

interface ReviewDisplayProps {
  review: ReviewResult;
}

export function ReviewDisplay({ review }: ReviewDisplayProps) {
  const { score, notes, metadata } = review;
  const grade = getScoreGrade(score.total);
  const colorClass = getScoreColor(score.total);

  return (
    <div className="w-full max-w-3xl space-y-6">
      {/* Score Card */}
      <Card className="p-8">
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <h2 className="text-6xl font-bold">
              <span className={colorClass}>{score.total}</span>
              <span className="text-3xl text-muted-foreground">/100</span>
            </h2>
            <Badge variant="outline" className="text-lg px-4 py-1">
              Grade: {grade}
            </Badge>
          </div>

          {/* Score Breakdown */}
          <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">Code Quality</p>
              <p className="text-xl font-semibold">
                {score.breakdown.codeQuality}/40
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Completeness</p>
              <p className="text-xl font-semibold">
                {score.breakdown.completeness}/30
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Testing</p>
              <p className="text-xl font-semibold">
                {score.breakdown.testing}/20
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Innovation</p>
              <p className="text-xl font-semibold">
                {score.breakdown.innovation}/10
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Review Notes */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Review Notes</h3>
        <ul className="space-y-3">
          {notes.map((note, index) => (
            <li key={index} className="flex gap-3">
              <Badge
                variant={
                  note.type === 'positive'
                    ? 'default'
                    : note.type === 'negative'
                    ? 'destructive'
                    : 'secondary'
                }
                className="shrink-0 h-6"
              >
                {note.type === 'positive' ? '✓' : note.type === 'negative' ? '✗' : '•'}
              </Badge>
              <span className="text-sm">{note.message}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Metadata */}
      <div className="text-xs text-muted-foreground text-center">
        Reviewed at {new Date(metadata.reviewedAt).toLocaleString()}
      </div>
    </div>
  );
}
