'use client';

import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ReviewResult, JudgeReview, Finding, Severity, Verdict } from '@/types';
import { useState } from 'react';

interface ReviewDisplayProps {
  review: ReviewResult;
}

// Severity badge colors
function getSeverityBadge(severity: Severity) {
  switch (severity) {
    case 'critical':
      return <Badge variant="destructive">Critical</Badge>;
    case 'warning':
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Warning</Badge>;
    case 'info':
      return <Badge variant="secondary">Info</Badge>;
    default:
      return <Badge variant="outline">{severity}</Badge>;
  }
}

// Verdict color
function getVerdictColor(verdict: Verdict): string {
  switch (verdict) {
    case 'Excellent':
      return 'text-green-600 dark:text-green-400';
    case 'Good':
      return 'text-blue-600 dark:text-blue-400';
    case 'Acceptable':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'Needs Improvement':
      return 'text-orange-600 dark:text-orange-400';
    case 'Critical Issues':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-muted-foreground';
  }
}

// Score color
function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600 dark:text-green-400';
  if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

// Grade background
function getGradeBackground(grade: string): string {
  if (grade.startsWith('A')) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  if (grade.startsWith('D')) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
  return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
}

// Individual Judge Card Component
function JudgeCard({ judge, isExpanded, onToggle }: {
  judge: JudgeReview;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const criticalCount = judge.findings.filter(f => f.severity === 'critical').length;
  const warningCount = judge.findings.filter(f => f.severity === 'warning').length;
  const infoCount = judge.findings.filter(f => f.severity === 'info').length;

  return (
    <Card className="overflow-hidden">
      {/* Judge Header - Clickable */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{judge.icon}</span>
          <div>
            <h4 className="font-semibold">{judge.name}</h4>
            <p className={`text-sm ${getVerdictColor(judge.verdict)}`}>
              {judge.verdict}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Finding counts */}
          <div className="flex gap-2 text-xs">
            {criticalCount > 0 && (
              <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-full">
                {criticalCount} critical
              </span>
            )}
            {warningCount > 0 && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 rounded-full">
                {warningCount} warning
              </span>
            )}
            {infoCount > 0 && (
              <span className="px-2 py-1 bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 rounded-full">
                {infoCount} info
              </span>
            )}
          </div>
          {/* Score */}
          <div className="text-right">
            <span className={`text-2xl font-bold ${getScoreColor(judge.score)}`}>
              {judge.score}
            </span>
            <span className="text-sm text-muted-foreground">/100</span>
          </div>
          {/* Expand indicator */}
          <svg
            className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Findings - Expandable */}
      {isExpanded && (
        <div className="border-t px-4 pb-4 pt-2 space-y-3">
          {judge.findings.map((finding, idx) => (
            <FindingItem key={idx} finding={finding} />
          ))}
        </div>
      )}
    </Card>
  );
}

// Finding Item Component
function FindingItem({ finding }: { finding: Finding }) {
  return (
    <div className="flex gap-3 p-3 rounded-lg bg-muted/30">
      <div className="shrink-0 mt-0.5">
        {getSeverityBadge(finding.severity)}
      </div>
      <div className="space-y-1 flex-1 min-w-0">
        <h5 className="font-medium text-sm">{finding.title}</h5>
        <p className="text-sm text-muted-foreground">{finding.message}</p>
        {finding.suggestion && (
          <p className="text-sm text-blue-600 dark:text-blue-400">
            <span className="font-medium">Suggestion:</span> {finding.suggestion}
          </p>
        )}
        {finding.location && (
          <p className="text-xs text-muted-foreground font-mono">
            {finding.location}
          </p>
        )}
      </div>
    </div>
  );
}

export function ReviewDisplay({ review }: ReviewDisplayProps) {
  const { overall, judges, metadata } = review;
  const [expandedJudges, setExpandedJudges] = useState<Set<string>>(new Set());

  const toggleJudge = (id: string) => {
    setExpandedJudges(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedJudges(new Set(judges.map(j => j.id)));
  };

  const collapseAll = () => {
    setExpandedJudges(new Set());
  };

  // Count total findings by severity
  const totalFindings = judges.reduce((acc, j) => {
    j.findings.forEach(f => {
      acc[f.severity] = (acc[f.severity] || 0) + 1;
    });
    return acc;
  }, {} as Record<Severity, number>);

  return (
    <div className="w-full space-y-6">
      {/* Overall Score Card */}
      <Card className="p-8">
        <div className="text-center space-y-4">
          {/* Big Score */}
          <div className="space-y-2">
            <h2 className="text-6xl font-bold">
              <span className={getScoreColor(overall.score)}>{overall.score}</span>
              <span className="text-3xl text-muted-foreground">/100</span>
            </h2>
            <Badge className={`text-lg px-4 py-1 ${getGradeBackground(overall.grade)}`}>
              Grade: {overall.grade}
            </Badge>
          </div>

          {/* Verdict */}
          <p className="text-xl font-medium">{overall.verdict}</p>

          {/* Summary */}
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {overall.summary}
          </p>

          {/* Total Findings Summary */}
          <div className="flex justify-center gap-4 pt-4">
            {totalFindings.critical > 0 && (
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{totalFindings.critical}</p>
                <p className="text-xs text-muted-foreground">Critical</p>
              </div>
            )}
            {totalFindings.warning > 0 && (
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{totalFindings.warning}</p>
                <p className="text-xs text-muted-foreground">Warnings</p>
              </div>
            )}
            {totalFindings.info > 0 && (
              <div className="text-center">
                <p className="text-2xl font-bold text-zinc-600">{totalFindings.info}</p>
                <p className="text-xs text-muted-foreground">Info</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Judge Reviews Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">
            Expert Panel Review ({judges.length} Judges)
          </h3>
          <div className="flex gap-2">
            <button
              onClick={expandAll}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Expand All
            </button>
            <span className="text-muted-foreground">|</span>
            <button
              onClick={collapseAll}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Judge Cards */}
        <div className="space-y-3">
          {judges.map((judge) => (
            <JudgeCard
              key={judge.id}
              judge={judge}
              isExpanded={expandedJudges.has(judge.id)}
              onToggle={() => toggleJudge(judge.id)}
            />
          ))}
        </div>
      </div>

      {/* Metadata */}
      <div className="text-xs text-muted-foreground text-center space-y-1">
        <p>
          Reviewed by {metadata.judgesUsed.length} expert judges
          {metadata.reviewDuration && ` in ${metadata.reviewDuration}`}
        </p>
        <p>
          {new Date(metadata.reviewedAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
