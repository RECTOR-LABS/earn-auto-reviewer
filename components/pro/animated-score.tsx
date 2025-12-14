'use client';

import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

interface AnimatedScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showGlow?: boolean;
  variant?: 'default' | 'dark' | 'gradient';
}

const sizeConfig = {
  sm: { width: 120, strokeWidth: 8, fontSize: 'text-2xl', subFontSize: 'text-xs' },
  md: { width: 160, strokeWidth: 10, fontSize: 'text-3xl', subFontSize: 'text-sm' },
  lg: { width: 200, strokeWidth: 12, fontSize: 'text-4xl', subFontSize: 'text-base' },
  xl: { width: 280, strokeWidth: 16, fontSize: 'text-6xl', subFontSize: 'text-lg' },
};

function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e'; // green-500
  if (score >= 60) return '#eab308'; // yellow-500
  if (score >= 40) return '#f97316'; // orange-500
  return '#ef4444'; // red-500
}

function getGrade(score: number): string {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'A-';
  if (score >= 80) return 'B+';
  if (score >= 75) return 'B';
  if (score >= 70) return 'B-';
  if (score >= 65) return 'C+';
  if (score >= 60) return 'C';
  if (score >= 55) return 'C-';
  if (score >= 50) return 'D';
  return 'F';
}

export function AnimatedScore({
  score,
  size = 'lg',
  showGlow = true,
  variant = 'default',
}: AnimatedScoreProps) {
  const config = sizeConfig[size];
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const isVisible = true;
  const springValue = useSpring(0, { stiffness: 50, damping: 20 });
  const displayScore = useTransform(springValue, (v) => Math.round(v));
  const strokeDashoffset = useTransform(
    springValue,
    (v) => circumference - (v / 100) * circumference
  );

  useEffect(() => {
    springValue.set(score);
  }, [score, springValue]);

  const color = getScoreColor(score);
  const grade = getGrade(score);

  const bgClass =
    variant === 'dark'
      ? 'bg-superteam-slate-900/80'
      : variant === 'gradient'
      ? 'bg-gradient-to-br from-superteam-purple-950/80 to-superteam-slate-900/80'
      : 'bg-white dark:bg-superteam-slate-900/80';

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: isVisible ? 1 : 0.8, opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`relative inline-flex items-center justify-center rounded-full p-4 ${bgClass} backdrop-blur-sm`}
      style={{ width: config.width + 32, height: config.width + 32 }}
    >
      {/* Glow effect */}
      {showGlow && (
        <motion.div
          className="absolute inset-0 rounded-full blur-xl opacity-30"
          style={{ backgroundColor: color }}
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* SVG Circle */}
      <svg
        width={config.width}
        height={config.width}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={config.width / 2}
          cy={config.width / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.strokeWidth}
          className="text-superteam-slate-200 dark:text-superteam-slate-700"
        />
        {/* Progress circle */}
        <motion.circle
          cx={config.width / 2}
          cy={config.width / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset }}
          className="drop-shadow-lg"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className={`font-bold ${config.fontSize}`}
          style={{ color }}
        >
          {displayScore}
        </motion.span>
        <span className={`text-muted-foreground ${config.subFontSize}`}>
          / 100
        </span>
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`mt-1 px-3 py-0.5 rounded-full text-white font-semibold ${config.subFontSize}`}
          style={{ backgroundColor: color }}
        >
          {grade}
        </motion.span>
      </div>
    </motion.div>
  );
}
