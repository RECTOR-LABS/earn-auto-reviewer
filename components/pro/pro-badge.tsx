'use client';

import { motion } from 'framer-motion';
import { Severity } from '@/types';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface ProBadgeProps {
  severity: Severity;
  size?: 'sm' | 'md';
  pulse?: boolean;
}

const severityConfig = {
  critical: {
    bg: 'bg-red-500',
    text: 'text-white',
    icon: AlertCircle,
    label: 'Critical',
    glow: 'rgba(239, 68, 68, 0.5)',
  },
  warning: {
    bg: 'bg-yellow-500',
    text: 'text-yellow-950',
    icon: AlertTriangle,
    label: 'Warning',
    glow: 'rgba(234, 179, 8, 0.5)',
  },
  info: {
    bg: 'bg-superteam-slate-500',
    text: 'text-white',
    icon: Info,
    label: 'Info',
    glow: 'rgba(100, 116, 139, 0.5)',
  },
};

export function ProBadge({ severity, size = 'sm', pulse = true }: ProBadgeProps) {
  const config = severityConfig[severity];
  const Icon = config.icon;

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-sm gap-1.5',
  };

  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center font-medium rounded-full ${config.bg} ${config.text} ${sizeStyles[size]}`}
      style={{
        boxShadow: pulse && severity === 'critical' ? `0 0 12px ${config.glow}` : undefined,
      }}
    >
      {pulse && severity === 'critical' && (
        <motion.span
          className="absolute inset-0 rounded-full bg-red-500"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      <Icon size={iconSize} />
      <span className="relative">{config.label}</span>
    </motion.span>
  );
}
