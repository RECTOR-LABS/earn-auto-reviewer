// Type definitions for the Earn Auto-Reviewer

// ============================================
// GitHub Types
// ============================================

export interface GitHubPR {
  number: number;
  title: string;
  author: string;
  url: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  commits: number;
  body: string | null;
  isDraft: boolean;
  createdAt: string;
}

export interface GitHubRepo {
  name: string;
  owner: string;
  url: string;
  description: string | null;
  stars: number;
  language: string | null;
  hasTests: boolean;
  readmeContent: string | null;
}

export interface ParsedGitHubUrl {
  type: 'pr' | 'repo' | 'commit' | 'branch' | 'invalid';
  owner: string;
  repo: string;
  identifier?: number | string;
  url: string;
}

// ============================================
// Judge Types (Multi-Judge Panel System)
// ============================================

export type JudgeId =
  | 'security'
  | 'performance'
  | 'architecture'
  | 'code-quality'
  | 'testing'
  | 'devops'
  | 'documentation'
  | 'dx';

export type Severity = 'critical' | 'warning' | 'info';

export type Verdict =
  | 'Excellent'
  | 'Good'
  | 'Acceptable'
  | 'Needs Improvement'
  | 'Critical Issues';

export interface JudgeInfo {
  id: JudgeId;
  name: string;
  icon: string;
  description: string;
  focusAreas: string[];
}

export interface Finding {
  severity: Severity;
  title: string;
  message: string;
  suggestion?: string;
  location?: string; // e.g., "src/auth.ts:45"
}

export interface JudgeReview {
  id: JudgeId;
  name: string;
  icon: string;
  score: number; // 0-100
  verdict: Verdict;
  findings: Finding[];
}

// ============================================
// Review Result Types
// ============================================

export interface OverallScore {
  score: number; // 0-100
  grade: string; // A+, A, B+, B, C+, C, D, F
  verdict: string;
  summary: string;
}

export interface ReviewResult {
  overall: OverallScore;
  judges: JudgeReview[];
  metadata: {
    reviewedAt: string;
    url: string;
    type: 'pr' | 'repo';
    judgesUsed: JudgeId[];
    reviewDuration?: string;
  };
}

// ============================================
// Review Panel Presets
// ============================================

export type ReviewPanelPreset = 'quick' | 'standard' | 'comprehensive' | 'custom';

export interface ReviewPanelConfig {
  preset: ReviewPanelPreset;
  judges: JudgeId[];
}

// Preset configurations
export const PANEL_PRESETS: Record<ReviewPanelPreset, JudgeId[]> = {
  quick: ['security', 'code-quality', 'testing'],
  standard: ['security', 'performance', 'architecture', 'testing', 'documentation'],
  comprehensive: ['security', 'performance', 'architecture', 'code-quality', 'testing', 'devops', 'documentation', 'dx'],
  custom: [], // User selects
};

// ============================================
// Judge Definitions
// ============================================

export const JUDGES: Record<JudgeId, JudgeInfo> = {
  security: {
    id: 'security',
    name: 'Security Expert',
    icon: '🔒',
    description: 'Analyzes code for vulnerabilities and security best practices',
    focusAreas: ['OWASP Top 10', 'Authentication', 'Authorization', 'Input Validation', 'Secrets Management', 'SQL Injection', 'XSS', 'CSRF'],
  },
  performance: {
    id: 'performance',
    name: 'Performance Engineer',
    icon: '⚡',
    description: 'Evaluates code efficiency and optimization opportunities',
    focusAreas: ['Time Complexity', 'Space Complexity', 'Caching', 'Database Queries', 'Memory Leaks', 'Bundle Size', 'Lazy Loading'],
  },
  architecture: {
    id: 'architecture',
    name: 'Architecture Reviewer',
    icon: '🏗️',
    description: 'Reviews system design and structural patterns',
    focusAreas: ['Design Patterns', 'SOLID Principles', 'Separation of Concerns', 'Modularity', 'Scalability', 'Dependency Management'],
  },
  'code-quality': {
    id: 'code-quality',
    name: 'Code Quality Analyst',
    icon: '✨',
    description: 'Assesses code readability and maintainability',
    focusAreas: ['Naming Conventions', 'Code Duplication', 'Complexity', 'Readability', 'DRY Principle', 'Clean Code'],
  },
  testing: {
    id: 'testing',
    name: 'Testing Specialist',
    icon: '🧪',
    description: 'Evaluates test coverage and quality',
    focusAreas: ['Unit Tests', 'Integration Tests', 'E2E Tests', 'Test Coverage', 'Edge Cases', 'Mocking', 'TDD'],
  },
  devops: {
    id: 'devops',
    name: 'DevOps Engineer',
    icon: '🚀',
    description: 'Reviews deployment and infrastructure readiness',
    focusAreas: ['CI/CD', 'Docker', 'Environment Config', 'Logging', 'Monitoring', 'Error Handling', 'Health Checks'],
  },
  documentation: {
    id: 'documentation',
    name: 'Documentation Auditor',
    icon: '📚',
    description: 'Assesses documentation completeness and quality',
    focusAreas: ['README', 'API Docs', 'Code Comments', 'Examples', 'Changelog', 'Contributing Guide'],
  },
  dx: {
    id: 'dx',
    name: 'Developer Experience',
    icon: '🎯',
    description: 'Evaluates developer experience and API design',
    focusAreas: ['API Design', 'Error Messages', 'Type Safety', 'SDK Usability', 'Onboarding', 'Debugging Experience'],
  },
};

// ============================================
// Legacy Types (Backward Compatibility)
// ============================================

export interface LegacyReviewScore {
  total: number;
  breakdown: {
    codeQuality: number;
    completeness: number;
    testing: number;
    innovation: number;
  };
}

export interface LegacyReviewNote {
  type: 'positive' | 'negative' | 'neutral';
  message: string;
}

export interface LegacyReviewResult {
  score: LegacyReviewScore;
  notes: LegacyReviewNote[];
  metadata: {
    reviewedAt: string;
    url: string;
    type: 'pr' | 'repo';
  };
}
