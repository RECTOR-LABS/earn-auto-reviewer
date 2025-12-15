// Scoring utility functions for code reviews
// Note: Grades now come from AI, but these utilities are still useful for display

/**
 * Get score grade (A+, A, B+, etc.)
 * Used for display purposes when needed
 */
export function getScoreGrade(total: number): string {
  if (total >= 95) return 'A+';
  if (total >= 90) return 'A';
  if (total >= 85) return 'B+';
  if (total >= 80) return 'B';
  if (total >= 75) return 'C+';
  if (total >= 70) return 'C';
  if (total >= 60) return 'D';
  return 'F';
}

/**
 * Get score color class for UI display
 */
export function getScoreColor(total: number): string {
  if (total >= 80) return 'text-green-600';
  if (total >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * Get score background color class
 */
export function getScoreBackground(total: number): string {
  if (total >= 80) return 'bg-green-100 dark:bg-green-900';
  if (total >= 60) return 'bg-yellow-100 dark:bg-yellow-900';
  return 'bg-red-100 dark:bg-red-900';
}

/**
 * Get grade color class
 */
export function getGradeColor(grade: string): string {
  if (grade.startsWith('A')) return 'text-green-600';
  if (grade.startsWith('B')) return 'text-blue-600';
  if (grade.startsWith('C')) return 'text-yellow-600';
  if (grade.startsWith('D')) return 'text-orange-600';
  return 'text-red-600';
}
