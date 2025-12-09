// Type definitions for the Earn Auto-Reviewer

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

export interface ReviewScore {
  total: number;
  breakdown: {
    codeQuality: number;
    completeness: number;
    testing: number;
    innovation: number;
  };
}

export interface ReviewNote {
  type: 'positive' | 'negative' | 'neutral';
  message: string;
}

export interface ReviewResult {
  score: ReviewScore;
  notes: ReviewNote[];
  metadata: {
    reviewedAt: string;
    url: string;
    type: 'pr' | 'repo';
  };
}

export interface ParsedGitHubUrl {
  type: 'pr' | 'repo' | 'commit' | 'branch' | 'invalid';
  owner: string;
  repo: string;
  identifier?: number | string;
  url: string;
}
