// LLM prompts for AI review engine
// Designed to be model-agnostic with strict JSON output

/**
 * STRICT JSON TEMPLATE
 * This exact structure must be returned by any LLM
 */
export const JSON_RESPONSE_TEMPLATE = `{
  "score": {
    "total": 0,
    "breakdown": {
      "codeQuality": 0,
      "completeness": 0,
      "testing": 0,
      "innovation": 0
    }
  },
  "notes": [
    {
      "type": "positive",
      "message": ""
    }
  ]
}`;

/**
 * System prompt for review generation
 * Emphasizes JSON-only output for model-agnostic compatibility
 */
export const REVIEW_SYSTEM_PROMPT = `You are a code review assistant that outputs ONLY valid JSON.

CRITICAL RULES:
1. Output ONLY a JSON object - no text before or after
2. Do NOT include markdown code blocks (\`\`\`json or \`\`\`)
3. Do NOT include explanations, greetings, or commentary
4. Do NOT start with "Here is" or "Based on my review"
5. The response must start with { and end with }

SCORING CRITERIA:
- codeQuality (0-40): Design patterns, complexity, best practices, security
- completeness (0-30): Requirements met, documentation, edge cases, error handling
- testing (0-20): Test coverage, test quality, integration tests
- innovation (0-10): Creative solutions, efficiency, novel approaches

IMPORTANT: total = codeQuality + completeness + testing + innovation

NOTES RULES:
- Provide exactly 3-5 notes
- Each note has "type": "positive" | "negative" | "neutral"
- Each "message" should be specific and actionable (1-2 sentences)`;

/**
 * Create review prompt with strict JSON output instructions
 */
export function createReviewPrompt(data: {
  type: 'pr' | 'repo';
  content: string;
  metadata: Record<string, any>;
}): string {
  const { type, content, metadata } = data;

  // Build metadata section based on type
  let metadataSection: string;
  if (type === 'pr') {
    metadataSection = `SUBMISSION TYPE: Pull Request
- Author: ${metadata.author}
- Files Changed: ${metadata.filesChanged}
- Lines: +${metadata.additions} / -${metadata.deletions}
- Commits: ${metadata.commits}
- Draft Status: ${metadata.isDraft ? 'DRAFT (incomplete)' : 'Ready'}`;
  } else {
    metadataSection = `SUBMISSION TYPE: Repository
- Name: ${metadata.name}
- Language: ${metadata.language || 'Not specified'}
- Stars: ${metadata.stars}
- Has Tests: ${metadata.hasTests ? 'Yes' : 'No'}`;
  }

  return `Review this GitHub submission and respond with ONLY a JSON object.

${metadataSection}

CONTENT TO REVIEW:
${content}

RESPOND WITH THIS EXACT JSON STRUCTURE (replace values, keep structure):
{
  "score": {
    "total": <sum of breakdown scores>,
    "breakdown": {
      "codeQuality": <0-40>,
      "completeness": <0-30>,
      "testing": <0-20>,
      "innovation": <0-10>
    }
  },
  "notes": [
    {"type": "positive", "message": "<specific strength>"},
    {"type": "negative", "message": "<specific issue>"},
    {"type": "neutral", "message": "<suggestion>"}
  ]
}

REMEMBER: Output ONLY the JSON object. No other text.`;
}

/**
 * Validation helper - check if a string looks like valid JSON
 */
export function looksLikeJSON(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.startsWith('{') && trimmed.endsWith('}');
}
