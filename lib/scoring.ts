// Scoring logic for code reviews
import { ReviewScore } from '@/types';

/**
 * Validate and normalize review scores
 */
export function validateScore(score: ReviewScore): ReviewScore {
  const { breakdown } = score;

  // Ensure scores are within valid ranges
  const normalized = {
    codeQuality: Math.min(Math.max(breakdown.codeQuality, 0), 40),
    completeness: Math.min(Math.max(breakdown.completeness, 0), 30),
    testing: Math.min(Math.max(breakdown.testing, 0), 20),
    innovation: Math.min(Math.max(breakdown.innovation, 0), 10),
  };

  const total = Math.min(
    Math.max(
      normalized.codeQuality +
        normalized.completeness +
        normalized.testing +
        normalized.innovation,
      0
    ),
    100
  );

  return {
    total,
    breakdown: normalized,
  };
}

/**
 * Get score grade (A+, A, B+, etc.)
 */
export function getScoreGrade(total: number): string {
  if (total >= 95) return 'A+';
  if (total >= 90) return 'A';
  if (total >= 85) return 'A-';
  if (total >= 80) return 'B+';
  if (total >= 75) return 'B';
  if (total >= 70) return 'B-';
  if (total >= 65) return 'C+';
  if (total >= 60) return 'C';
  if (total >= 55) return 'C-';
  if (total >= 50) return 'D';
  return 'F';
}

/**
 * Get score color for UI display
 */
export function getScoreColor(total: number): string {
  if (total >= 80) return 'text-green-600';
  if (total >= 60) return 'text-yellow-600';
  return 'text-red-600';
}
