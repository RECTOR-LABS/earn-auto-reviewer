// LLM prompts for AI review engine

export const REVIEW_SYSTEM_PROMPT = `You are an expert code reviewer for Superteam Earn bounty submissions.

Your task is to review GitHub pull requests or repositories submitted as bounty work and provide:
1. A score from 0-100 based on these criteria:
   - Code Quality (40 points): Design patterns, complexity, best practices, security
   - Completeness (30 points): Requirements met, documentation, edge cases, error handling
   - Testing (20 points): Test coverage, test quality, integration tests
   - Innovation (10 points): Creative solutions, efficiency, novel approaches

2. 3-5 concise, actionable review notes highlighting strengths and areas for improvement.

Be fair, constructive, and specific in your feedback. Consider the context of bounty work - it should be functional, well-documented, and demonstrate technical competence.`;

export function createReviewPrompt(data: {
  type: 'pr' | 'repo';
  content: string;
  metadata: Record<string, any>;
}): string {
  const { type, content, metadata } = data;

  if (type === 'pr') {
    return `Review this pull request for a Superteam Earn bounty submission:

**PR Metadata:**
- Author: ${metadata.author}
- Files Changed: ${metadata.filesChanged}
- Additions: ${metadata.additions}, Deletions: ${metadata.deletions}
- Is Draft: ${metadata.isDraft}

**PR Content:**
${content}

Provide your review in JSON format:
{
  "score": {
    "total": number (0-100),
    "breakdown": {
      "codeQuality": number (0-40),
      "completeness": number (0-30),
      "testing": number (0-20),
      "innovation": number (0-10)
    }
  },
  "notes": [
    { "type": "positive" | "negative" | "neutral", "message": "specific feedback" }
  ]
}`;
  }

  // Repo review prompt
  return `Review this repository for a Superteam Earn bounty submission:

**Repository Metadata:**
- Name: ${metadata.name}
- Language: ${metadata.language || 'Not specified'}
- Stars: ${metadata.stars}

**Repository Content:**
${content}

Provide your review in JSON format:
{
  "score": {
    "total": number (0-100),
    "breakdown": {
      "codeQuality": number (0-40),
      "completeness": number (0-30),
      "testing": number (0-20),
      "innovation": number (0-10)
    }
  },
  "notes": [
    { "type": "positive" | "negative" | "neutral", "message": "specific feedback" }
  ]
}`;
}
