'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  variant?: 'purple' | 'rainbow' | 'fire' | 'ocean';
  animate?: boolean;
}

const gradients = {
  purple: 'from-superteam-purple-400 via-superteam-purple-600 to-superteam-purple-800',
  rainbow: 'from-purple-500 via-pink-500 to-orange-500',
  fire: 'from-yellow-400 via-orange-500 to-red-600',
  ocean: 'from-cyan-400 via-blue-500 to-purple-600',
};

export function GradientText({
  children,
  className,
  variant = 'purple',
  animate = false,
}: GradientTextProps) {
  const gradientClass = `bg-gradient-to-r ${gradients[variant]} bg-clip-text text-transparent`;

  if (animate) {
    return (
      <motion.span
        className={cn(gradientClass, 'bg-[length:200%_auto]', className)}
        animate={{
          backgroundPosition: ['0%', '100%', '0%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {children}
      </motion.span>
    );
  }

  return <span className={cn(gradientClass, className)}>{children}</span>;
}
