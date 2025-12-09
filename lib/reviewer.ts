// AI review engine using Vercel AI SDK + OpenRouter
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { REVIEW_SYSTEM_PROMPT, createReviewPrompt } from './prompts';
import { ReviewResult, ReviewScore, ReviewNote } from '@/types';
import { validateScore } from './scoring';

// Initialize OpenRouter client (OpenAI-compatible)
const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

// Response schema for structured output
const reviewSchema = z.object({
  score: z.object({
    total: z.number().min(0).max(100),
    breakdown: z.object({
      codeQuality: z.number().min(0).max(40),
      completeness: z.number().min(0).max(30),
      testing: z.number().min(0).max(20),
      innovation: z.number().min(0).max(10),
    }),
  }),
  notes: z.array(
    z.object({
      type: z.enum(['positive', 'negative', 'neutral']),
      message: z.string(),
    })
  ),
});

/**
 * Generate AI review for a GitHub submission
 */
export async function generateReview(params: {
  type: 'pr' | 'repo';
  content: string;
  metadata: Record<string, any>;
  url: string;
}): Promise<ReviewResult> {
  const { type, content, metadata, url } = params;

  try {
    const result = await generateObject({
      model: openrouter('anthropic/claude-3.5-sonnet'),
      system: REVIEW_SYSTEM_PROMPT,
      prompt: createReviewPrompt({ type, content, metadata }),
      schema: reviewSchema,
    });

    // Validate and normalize scores
    const validatedScore = validateScore(result.object.score);

    return {
      score: validatedScore,
      notes: result.object.notes,
      metadata: {
        reviewedAt: new Date().toISOString(),
        url,
        type,
      },
    };
  } catch (error) {
    console.error('Review generation failed:', error);
    throw new Error('Failed to generate review. Please try again.');
  }
}
