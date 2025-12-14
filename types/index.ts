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
    modelUsed?: ModelId;
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
// Model Selection Types
// ============================================

export type ModelId =
  | 'anthropic/claude-haiku-4.5'
  | 'anthropic/claude-3.5-haiku'
  | 'google/gemini-2.5-flash'
  | 'openai/gpt-5.1'
  | 'anthropic/claude-sonnet-4.5'
  | 'anthropic/claude-opus-4.5'
  | 'google/gemini-2.5-pro';

export type CostTier = '$' | '$$' | '$$$' | '$$$$';

export interface ModelInfo {
  id: ModelId;
  name: string;
  provider: string;
  description: string;
  costTier: CostTier;
  inputCost: string;  // e.g., "$0.80/M"
  outputCost: string; // e.g., "$4/M"
  speed: 'Very Fast' | 'Fast' | 'Medium' | 'Slow';
  contextWindow: string;
}

export const DEFAULT_MODEL: ModelId = 'anthropic/claude-haiku-4.5';

export const MODELS: Record<ModelId, ModelInfo> = {
  'anthropic/claude-haiku-4.5': {
    id: 'anthropic/claude-haiku-4.5',
    name: 'Claude Haiku 4.5',
    provider: 'Anthropic',
    description: 'Latest Haiku - fast & smart (Recommended)',
    costTier: '$',
    inputCost: '$1/M',
    outputCost: '$5/M',
    speed: 'Fast',
    contextWindow: '200K',
  },
  'anthropic/claude-3.5-haiku': {
    id: 'anthropic/claude-3.5-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
    description: 'Previous gen - slightly cheaper',
    costTier: '$',
    inputCost: '$0.80/M',
    outputCost: '$4/M',
    speed: 'Fast',
    contextWindow: '200K',
  },
  'google/gemini-2.5-flash': {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    description: 'Ultra budget with 1M context window',
    costTier: '$',
    inputCost: '$0.30/M',
    outputCost: '$2.50/M',
    speed: 'Very Fast',
    contextWindow: '1M',
  },
  'openai/gpt-5.1': {
    id: 'openai/gpt-5.1',
    name: 'GPT-5.1',
    provider: 'OpenAI',
    description: 'OpenAI latest - adaptive reasoning',
    costTier: '$',
    inputCost: '$1.25/M',
    outputCost: '$10/M',
    speed: 'Fast',
    contextWindow: '128K',
  },
  'anthropic/claude-sonnet-4.5': {
    id: 'anthropic/claude-sonnet-4.5',
    name: 'Claude Sonnet 4.5',
    provider: 'Anthropic',
    description: 'Balanced quality and cost',
    costTier: '$$',
    inputCost: '$3/M',
    outputCost: '$15/M',
    speed: 'Medium',
    contextWindow: '200K',
  },
  'anthropic/claude-opus-4.5': {
    id: 'anthropic/claude-opus-4.5',
    name: 'Claude Opus 4.5',
    provider: 'Anthropic',
    description: 'Most capable - deep analysis',
    costTier: '$$$',
    inputCost: '$5/M',
    outputCost: '$25/M',
    speed: 'Slow',
    contextWindow: '200K',
  },
  'google/gemini-2.5-pro': {
    id: 'google/gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    description: 'Google flagship with 1M context',
    costTier: '$',
    inputCost: '$0.30/M',
    outputCost: '$2.50/M',
    speed: 'Medium',
    contextWindow: '1M',
  },
};

// Model list ordered for UI (recommended first, then by cost)
export const MODEL_ORDER: ModelId[] = [
  'anthropic/claude-haiku-4.5',
  'google/gemini-2.5-flash',
  'anthropic/claude-3.5-haiku',
  'openai/gpt-5.1',
  'anthropic/claude-sonnet-4.5',
  'google/gemini-2.5-pro',
  'anthropic/claude-opus-4.5',
];

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
