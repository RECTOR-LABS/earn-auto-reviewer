// AI review engine using Vercel AI SDK + OpenRouter
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { z } from 'zod';
import { REVIEW_SYSTEM_PROMPT, createReviewPrompt, looksLikeJSON } from './prompts';
import { ReviewResult, ReviewNote } from '@/types';
import { validateScore } from './scoring';

// Initialize OpenRouter client (OpenAI-compatible)
const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

// Strict response schema for validation
// This ensures consistent output regardless of LLM used
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
  ).min(1).max(10), // Allow 1-10 notes, prefer 3-5
});

/**
 * Extract JSON from text using multiple strategies
 * Handles: pure JSON, JSON in prose, JSON in markdown code blocks
 */
function extractJSON(text: string): string {
  const trimmed = text.trim();

  // Strategy 1: Already valid JSON (starts with { and ends with })
  if (looksLikeJSON(trimmed)) {
    return trimmed;
  }

  // Strategy 2: JSON wrapped in markdown code block
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    const extracted = codeBlockMatch[1].trim();
    if (looksLikeJSON(extracted)) {
      return extracted;
    }
  }

  // Strategy 3: Find JSON object in surrounding text
  // Match from first { to last } (greedy for nested objects)
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }

  // No JSON found - return original (will fail validation with clear error)
  console.error('[Reviewer] Could not extract JSON from response');
  console.error('[Reviewer] Response preview:', trimmed.substring(0, 200));
  return trimmed;
}

/**
 * Parse and validate review response with multiple fallback strategies
 */
function parseReviewResponse(text: string): z.infer<typeof reviewSchema> {
  const extracted = extractJSON(text);

  try {
    const parsed = JSON.parse(extracted);
    const validated = reviewSchema.parse(parsed);

    // Ensure total matches breakdown sum
    const breakdown = validated.score.breakdown;
    const calculatedTotal =
      breakdown.codeQuality +
      breakdown.completeness +
      breakdown.testing +
      breakdown.innovation;

    // Auto-correct total if it doesn't match
    if (validated.score.total !== calculatedTotal) {
      console.log(`[Reviewer] Auto-correcting total: ${validated.score.total} → ${calculatedTotal}`);
      validated.score.total = calculatedTotal;
    }

    return validated;
  } catch (error) {
    console.error('[Reviewer] JSON parse/validation failed');
    console.error('[Reviewer] Extracted text:', extracted.substring(0, 300));

    if (error instanceof z.ZodError) {
      console.error('[Reviewer] Zod errors:', JSON.stringify(error.issues, null, 2));
    }

    throw new Error('Invalid review response format from AI');
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

  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  try {
    console.log(`[Reviewer] Generating review for ${type}: ${url}`);

    // Use generateText for maximum control over response parsing
    const result = await generateText({
      model: openrouter('anthropic/claude-3.5-sonnet'),
      system: REVIEW_SYSTEM_PROMPT,
      prompt: createReviewPrompt({ type, content, metadata }),
    });

    console.log(`[Reviewer] Received response (${result.text.length} chars)`);

    // Parse and validate the response
    const reviewData = parseReviewResponse(result.text);

    // Validate and normalize scores (clamp to valid ranges)
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
    console.error('[Reviewer] Review generation failed:', error);

    // Provide specific error messages
    if (error instanceof Error) {
      if (error.message.includes('API key') || error.message.includes('OPENROUTER')) {
        throw new Error('API configuration error. Please check your OpenRouter API key.');
      }
      if (error.message.includes('credits') || error.message.includes('afford')) {
        throw new Error('Insufficient API credits. Please add credits to your OpenRouter account.');
      }
      if (error.message.includes('Invalid review response')) {
        throw new Error('AI returned invalid format. Please try again.');
      }
      // Pass through known errors
      if (error.message.includes('not found') || error.message.includes('Access denied')) {
        throw error;
      }
    }

    throw new Error('Failed to generate review. Please try again.');
  }
}
