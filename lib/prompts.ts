// LLM prompts for AI review engine

export const REVIEW_SYSTEM_PROMPT = `You are an expert code reviewer for Superteam Earn bounty submissions.

Your task is to review GitHub pull requests or repositories and provide a structured JSON review.

CRITICAL: You must respond with ONLY valid JSON. No explanations, no preamble, no additional text.
Do not include phrases like "Based on my review" or "Here is my assessment" - ONLY output the JSON object.

Scoring criteria:
- Code Quality (0-40 points): Design patterns, complexity, best practices, security
- Completeness (0-30 points): Requirements met, documentation, edge cases, error handling
- Testing (0-20 points): Test coverage, test quality, integration tests
- Innovation (0-10 points): Creative solutions, efficiency, novel approaches

Be fair and constructive. The total score should equal the sum of all breakdown scores.`;

export function createReviewPrompt(data: {
  type: 'pr' | 'repo';
  content: string;
  metadata: Record<string, any>;
}): string {
  const { type, content, metadata } = data;

  const jsonFormat = `RESPOND WITH ONLY THIS JSON STRUCTURE (no other text):
{
  "score": {
    "total": <number 0-100>,
    "breakdown": {
      "codeQuality": <number 0-40>,
      "completeness": <number 0-30>,
      "testing": <number 0-20>,
      "innovation": <number 0-10>
    }
  },
  "notes": [
    { "type": "positive", "message": "<specific strength>" },
    { "type": "negative", "message": "<specific issue>" },
    { "type": "neutral", "message": "<suggestion>" }
  ]
}`;

  if (type === 'pr') {
    return `Review this pull request submission:

PR Metadata:
- Author: ${metadata.author}
- Files Changed: ${metadata.filesChanged}
- Additions: ${metadata.additions}, Deletions: ${metadata.deletions}
- Is Draft: ${metadata.isDraft}

PR Content:
${content}

${jsonFormat}`;
  }

  // Repo review prompt
  return `Review this repository submission:

Repository Metadata:
- Name: ${metadata.name}
- Language: ${metadata.language || 'Not specified'}
- Stars: ${metadata.stars}

Repository Content:
${content}

${jsonFormat}`;
}
