// AI review engine using Vercel AI SDK + OpenRouter
// Multi-Judge Panel System

import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { z } from 'zod';
import {
  MULTI_JUDGE_SYSTEM_PROMPT,
  createMultiJudgePrompt,
  looksLikeJSON,
} from './prompts';
import {
  ReviewResult,
  JudgeId,
  JudgeReview,
  OverallScore,
  FullReport,
  JUDGES,
  ModelId,
  DEFAULT_MODEL,
} from '@/types';
import { logger } from './logger';

// Initialize OpenRouter client
const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

// ============================================
// Zod Schemas for Multi-Judge System
// ============================================

const findingSchema = z.object({
  severity: z.enum(['critical', 'warning', 'info']),
  title: z.string(),
  message: z.string(),
  suggestion: z.string().optional(),
  location: z.string().optional(),
});

const judgeReviewSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  score: z.number().min(0).max(100),
  verdict: z.enum(['Excellent', 'Good', 'Acceptable', 'Needs Improvement', 'Critical Issues']),
  findings: z.array(findingSchema).min(1).max(10),
});

const overallScoreSchema = z.object({
  score: z.number().min(0).max(100),
  grade: z.string(),
  verdict: z.string(),
  summary: z.string(),
});

// Full Report Schemas
const detailedAnalysisSchema = z.object({
  judgeId: z.string(),
  judgeName: z.string(),
  analysis: z.string(),
});

const fileBreakdownSchema = z.object({
  file: z.string(),
  score: z.number().min(0).max(100),
  status: z.enum(['good', 'warning', 'critical']),
  issues: z.number().min(0),
});

const recommendationSchema = z.object({
  priority: z.enum(['high', 'medium', 'low']),
  title: z.string(),
  description: z.string(),
  effort: z.enum(['quick', 'moderate', 'significant']),
});

const codeSnippetSchema = z.object({
  file: z.string(),
  issue: z.string(),
  before: z.string(),
  after: z.string(),
  language: z.string(),
});

const fullReportSchema = z.object({
  detailedAnalysis: z.array(detailedAnalysisSchema).default([]),
  fileBreakdown: z.array(fileBreakdownSchema).default([]),
  recommendations: z.array(recommendationSchema).default([]),
  codeSnippets: z.array(codeSnippetSchema).default([]),
});

const multiJudgeReviewSchema = z.object({
  overall: overallScoreSchema,
  judges: z.array(judgeReviewSchema).min(1),
  fullReport: fullReportSchema.optional(),
});

// ============================================
// JSON Extraction
// ============================================

export function extractJSON(text: string): string {
  const trimmed = text.trim();

  // Strategy 1: Already valid JSON
  if (looksLikeJSON(trimmed)) {
    return trimmed;
  }

  // Strategy 2: JSON in markdown code block
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    const extracted = codeBlockMatch[1].trim();
    if (looksLikeJSON(extracted)) {
      return extracted;
    }
  }

  // Strategy 3: Find JSON object in text
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }

  logger.reviewer.error('Could not extract JSON from response');
  return trimmed;
}

// ============================================
// Grade Calculation
// ============================================

export function calculateGrade(score: number): string {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'B+';
  if (score >= 80) return 'B';
  if (score >= 75) return 'C+';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

// ============================================
// Response Parsing
// ============================================

function parseMultiJudgeResponse(
  text: string,
  expectedJudges: JudgeId[]
): { overall: OverallScore; judges: JudgeReview[]; fullReport: FullReport } {
  const extracted = extractJSON(text);

  try {
    const parsed = JSON.parse(extracted);
    const validated = multiJudgeReviewSchema.parse(parsed);

    // Ensure all expected judges are present
    const judgeIds = validated.judges.map(j => j.id);
    const missingJudges = expectedJudges.filter(id => !judgeIds.includes(id));

    if (missingJudges.length > 0) {
      logger.reviewer.warn('Missing judges in response', { missing: missingJudges });
      // Add placeholder for missing judges
      for (const missingId of missingJudges) {
        const judgeInfo = JUDGES[missingId];
        validated.judges.push({
          id: missingId,
          name: judgeInfo.name,
          icon: judgeInfo.icon,
          score: 50,
          verdict: 'Acceptable',
          findings: [{
            severity: 'info',
            title: 'Analysis Incomplete',
            message: 'This judge could not complete analysis for this submission.',
          }],
        });
      }
    }

    // Recalculate overall score if needed
    const avgScore = Math.round(
      validated.judges.reduce((sum, j) => sum + j.score, 0) / validated.judges.length
    );

    if (Math.abs(validated.overall.score - avgScore) > 5) {
      logger.reviewer.info('Correcting overall score', { original: validated.overall.score, corrected: avgScore });
      validated.overall.score = avgScore;
      validated.overall.grade = calculateGrade(avgScore);
    }

    // Provide default fullReport if missing
    const defaultFullReport: FullReport = {
      detailedAnalysis: [],
      fileBreakdown: [],
      recommendations: [],
      codeSnippets: [],
    };

    return {
      overall: validated.overall as OverallScore,
      judges: validated.judges as JudgeReview[],
      fullReport: (validated.fullReport as FullReport) || defaultFullReport,
    };
  } catch (error) {
    logger.reviewer.error('Parse error', {
      error: error instanceof Error ? error.message : 'Unknown',
      extracted: extracted.substring(0, 200),
    });

    if (error instanceof z.ZodError) {
      logger.reviewer.error('Zod validation failed', { issues: error.issues });
    }

    throw new Error('Invalid review response format from AI');
  }
}

// ============================================
// Main Review Function
// ============================================

export async function generateMultiJudgeReview(params: {
  type: 'pr' | 'repo';
  content: string;
  metadata: Record<string, unknown>;
  url: string;
  judges: JudgeId[];
  model?: ModelId;
}): Promise<ReviewResult> {
  const { type, content, metadata, url, judges, model = DEFAULT_MODEL } = params;

  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const startTime = Date.now();

  try {
    logger.reviewer.info('Starting multi-judge review', {
      judges: judges.length,
      judgeList: judges.join(', '),
      model,
    });

    const result = await generateText({
      model: openrouter(model),
      system: MULTI_JUDGE_SYSTEM_PROMPT,
      prompt: createMultiJudgePrompt({ type, content, metadata, judges }),
    });

    logger.reviewer.info('Received response', { chars: result.text.length });

    const { overall, judges: judgeReviews, fullReport } = parseMultiJudgeResponse(result.text, judges);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    return {
      overall,
      judges: judgeReviews,
      fullReport,
      metadata: {
        reviewedAt: new Date().toISOString(),
        url,
        type,
        judgesUsed: judges,
        modelUsed: model,
        reviewDuration: `${duration}s`,
      },
    };
  } catch (error) {
    logger.reviewer.error('Multi-judge review failed', {
      error: error instanceof Error ? error.message : 'Unknown',
    });

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
      if (error.message.includes('not found') || error.message.includes('Access denied')) {
        throw error;
      }
    }

    throw new Error('Failed to generate review. Please try again.');
  }
}

// Alias for backward compatibility
export const generateReview = generateMultiJudgeReview;
