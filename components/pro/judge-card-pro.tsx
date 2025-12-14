'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { JudgeReview, Finding, Verdict } from '@/types';
import { ChevronDown } from 'lucide-react';
import { ProBadge } from './pro-badge';

interface JudgeCardProProps {
  judge: JudgeReview;
  index?: number;
  variant?: 'default' | 'dark' | 'glass';
}

function getVerdictColor(verdict: Verdict): string {
  switch (verdict) {
    case 'Excellent':
      return 'text-green-500';
    case 'Good':
      return 'text-blue-500';
    case 'Acceptable':
      return 'text-yellow-500';
    case 'Needs Improvement':
      return 'text-orange-500';
    case 'Critical Issues':
      return 'text-red-500';
    default:
      return 'text-muted-foreground';
  }
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  return 'text-red-500';
}

function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-green-500/10 border-green-500/30';
  if (score >= 60) return 'bg-yellow-500/10 border-yellow-500/30';
  return 'bg-red-500/10 border-red-500/30';
}

export function JudgeCardPro({ judge, index = 0, variant = 'default' }: JudgeCardProProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const criticalCount = judge.findings.filter((f) => f.severity === 'critical').length;
  const warningCount = judge.findings.filter((f) => f.severity === 'warning').length;
  const infoCount = judge.findings.filter((f) => f.severity === 'info').length;

  const bgStyles = {
    default: 'bg-white dark:bg-superteam-slate-900 border-superteam-slate-200 dark:border-superteam-slate-800',
    dark: 'bg-superteam-slate-900/80 backdrop-blur-sm border-superteam-slate-700/50',
    glass: 'bg-white/10 backdrop-blur-md border-white/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
      className={`rounded-xl border overflow-hidden ${bgStyles[variant]}`}
    >
      {/* Header */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-superteam-purple-50/50 dark:hover:bg-superteam-purple-950/30 transition-colors text-left"
        whileTap={{ scale: 0.995 }}
      >
        <div className="flex items-center gap-4">
          {/* Icon with glow */}
          <motion.div
            className="relative"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <span className="text-3xl">{judge.icon}</span>
            <motion.div
              className="absolute inset-0 blur-lg opacity-50"
              style={{ fontSize: '2rem' }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {judge.icon}
            </motion.div>
          </motion.div>

          <div>
            <h4 className="font-semibold text-foreground">{judge.name}</h4>
            <p className={`text-sm font-medium ${getVerdictColor(judge.verdict)}`}>
              {judge.verdict}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Finding counts */}
          <div className="hidden sm:flex gap-2">
            {criticalCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 rounded-full"
              >
                {criticalCount} critical
              </motion.span>
            )}
            {warningCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
                className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300 rounded-full"
              >
                {warningCount} warning
              </motion.span>
            )}
            {infoCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="px-2 py-1 text-xs font-medium bg-superteam-slate-100 text-superteam-slate-700 dark:bg-superteam-slate-800 dark:text-superteam-slate-300 rounded-full"
              >
                {infoCount} info
              </motion.span>
            )}
          </div>

          {/* Score badge */}
          <motion.div
            className={`px-4 py-2 rounded-lg border ${getScoreBg(judge.score)}`}
            whileHover={{ scale: 1.05 }}
          >
            <span className={`text-2xl font-bold ${getScoreColor(judge.score)}`}>
              {judge.score}
            </span>
            <span className="text-xs text-muted-foreground">/100</span>
          </motion.div>

          {/* Expand icon */}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </div>
      </motion.button>

      {/* Findings */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-superteam-slate-200 dark:border-superteam-slate-800 px-4 pb-4 pt-3 space-y-3">
              {judge.findings.map((finding, idx) => (
                <FindingItemPro key={idx} finding={finding} index={idx} />
              ))}
              {judge.findings.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No findings for this category
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FindingItemPro({ finding, index }: { finding: Finding; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex gap-3 p-3 rounded-lg bg-superteam-slate-50 dark:bg-superteam-slate-800/50"
    >
      <div className="shrink-0 mt-0.5">
        <ProBadge severity={finding.severity} />
      </div>
      <div className="space-y-1 flex-1 min-w-0">
        <h5 className="font-medium text-sm">{finding.title}</h5>
        <p className="text-sm text-muted-foreground">{finding.message}</p>
        {finding.suggestion && (
          <p className="text-sm text-superteam-purple-600 dark:text-superteam-purple-400">
            <span className="font-medium">Suggestion:</span> {finding.suggestion}
          </p>
        )}
        {finding.location && (
          <p className="text-xs text-muted-foreground font-mono bg-superteam-slate-100 dark:bg-superteam-slate-900 px-2 py-1 rounded inline-block">
            {finding.location}
          </p>
        )}
      </div>
    </motion.div>
  );
}
