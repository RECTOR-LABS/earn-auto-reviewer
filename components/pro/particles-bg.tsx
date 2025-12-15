'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  xOffset: number;
}

interface ParticlesBgProps {
  count?: number;
  color?: string;
  minSize?: number;
  maxSize?: number;
}

function generateParticles(count: number, minSize: number, maxSize: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: minSize + Math.random() * (maxSize - minSize),
      duration: 15 + Math.random() * 20,
      delay: Math.random() * 10,
      xOffset: Math.random() * 50 - 25,
    });
  }
  return particles;
}

export function ParticlesBg({
  count = 50,
  color = 'rgba(99, 102, 241, 0.3)', // superteam-purple with opacity
  minSize = 2,
  maxSize = 6,
}: ParticlesBgProps) {
  // Generate particles once on mount - useMemo with empty deps acts like useState initializer
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const particles = useMemo(() => generateParticles(count, minSize, maxSize), []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: color,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, particle.xOffset, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
