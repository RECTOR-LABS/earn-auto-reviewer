'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  variant?: 'default' | 'glass' | 'solid' | 'gradient';
  hover?: boolean;
  onClick?: () => void;
}

export function GlowCard({
  children,
  className,
  glowColor = 'rgba(99, 102, 241, 0.3)', // superteam-purple with opacity
  variant = 'default',
  hover = true,
  onClick,
}: GlowCardProps) {
  const baseStyles = 'relative overflow-hidden rounded-xl border transition-all duration-300';

  const variantStyles = {
    default: 'bg-white dark:bg-superteam-slate-900 border-superteam-slate-200 dark:border-superteam-slate-800',
    glass: 'bg-white/10 dark:bg-superteam-slate-900/50 backdrop-blur-md border-white/20 dark:border-superteam-slate-700/50',
    solid: 'bg-superteam-slate-50 dark:bg-superteam-slate-800 border-superteam-slate-200 dark:border-superteam-slate-700',
    gradient: 'bg-gradient-to-br from-superteam-purple-50 to-white dark:from-superteam-purple-950/50 dark:to-superteam-slate-900 border-superteam-purple-200 dark:border-superteam-purple-800/50',
  };

  const hoverStyles = hover
    ? 'hover:shadow-lg hover:border-superteam-purple-400 dark:hover:border-superteam-purple-600 hover:-translate-y-0.5'
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={hover ? { scale: 1.01 } : undefined}
      className={cn(baseStyles, variantStyles[variant], hoverStyles, className)}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : undefined }}
    >
      {/* Glow effect on hover */}
      {hover && (
        <motion.div
          className="absolute inset-0 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100"
          style={{ backgroundColor: glowColor }}
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 0.15 }}
        />
      )}

      {/* Gradient border animation */}
      <motion.div
        className="absolute inset-0 rounded-xl opacity-0"
        style={{
          background: `linear-gradient(135deg, ${glowColor}, transparent, ${glowColor})`,
          backgroundSize: '200% 200%',
        }}
        whileHover={{ opacity: 0.3 }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
