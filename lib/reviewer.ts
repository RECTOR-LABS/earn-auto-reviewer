// AI review engine using Vercel AI SDK + OpenRouter
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { z } from 'zod';
import { REVIEW_SYSTEM_PROMPT, createReviewPrompt } from './prompts';
import { ReviewResult, ReviewNote } from '@/types';
import { validateScore } from './scoring';

// Initialize OpenRouter client (OpenAI-compatible)
const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

// Response schema for validation
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
 * Extract JSON from text that may contain surrounding prose
 */
function extractJSON(text: string): string {
  // Try to find JSON object in the text
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }
  // If no JSON found, return original text (will fail validation with clear error)
  return text;
}

/**
 * Parse and validate review response
 */
function parseReviewResponse(text: string): z.infer<typeof reviewSchema> {
  // First, try direct parsing
  try {
    const parsed = JSON.parse(text);
    return reviewSchema.parse(parsed);
  } catch {
    // If direct parsing fails, try extracting JSON from text
    const extracted = extractJSON(text);
    try {
      const parsed = JSON.parse(extracted);
      return reviewSchema.parse(parsed);
    } catch (extractError) {
      console.error('Failed to parse extracted JSON:', extracted.substring(0, 200));
      throw new Error('Invalid review response format');
    }
  }
}

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
    // Use generateText instead of generateObject for more control
    const result = await generateText({
      model: openrouter('anthropic/claude-3.5-sonnet'),
      system: REVIEW_SYSTEM_PROMPT,
      prompt: createReviewPrompt({ type, content, metadata }),
    });

    // Parse and validate the response
    const reviewData = parseReviewResponse(result.text);

    // Validate and normalize scores
    const validatedScore = validateScore(reviewData.score);

    return {
      score: validatedScore,
      notes: reviewData.notes as ReviewNote[],
      metadata: {
        reviewedAt: new Date().toISOString(),
        url,
        type,
      },
    };
  } catch (error) {
    console.error('Review generation failed:', error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('API configuration error. Please check your OpenRouter API key.');
      }
      if (error.message.includes('credits') || error.message.includes('afford')) {
        throw new Error('Insufficient API credits. Please add credits to your OpenRouter account.');
      }
      if (error.message.includes('Invalid review response')) {
        throw new Error('Failed to parse AI response. Please try again.');
      }
    }

    throw new Error('Failed to generate review. Please try again.');
  }
}
