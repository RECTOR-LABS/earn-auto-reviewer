import { describe, it, expect, vi } from 'vitest';
import { extractJSON, calculateGrade } from '../reviewer';
import { looksLikeJSON } from '../prompts';

// Mock the logger to avoid console output during tests
vi.mock('../logger', () => ({
  logger: {
    reviewer: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    },
  },
}));

describe('looksLikeJSON', () => {
  it('returns true for valid JSON object string', () => {
    expect(looksLikeJSON('{"key": "value"}')).toBe(true);
  });

  it('returns true for complex JSON object', () => {
    expect(looksLikeJSON('{"score": 85, "notes": ["a", "b"]}')).toBe(true);
  });

  it('returns false for array JSON', () => {
    expect(looksLikeJSON('[1, 2, 3]')).toBe(false);
  });

  it('returns false for plain text', () => {
    expect(looksLikeJSON('Hello world')).toBe(false);
  });

  it('returns false for markdown with JSON', () => {
    expect(looksLikeJSON('```json\n{"key": "value"}\n```')).toBe(false);
  });

  it('handles whitespace around JSON', () => {
    expect(looksLikeJSON('  {"key": "value"}  ')).toBe(true);
  });
});

describe('extractJSON', () => {
  it('returns clean JSON when input is already valid JSON', () => {
    const json = '{"score": 85}';
    expect(extractJSON(json)).toBe(json);
  });

  it('extracts JSON from markdown code block', () => {
    const input = '```json\n{"score": 85}\n```';
    expect(extractJSON(input)).toBe('{"score": 85}');
  });

  it('extracts JSON from code block without json label', () => {
    const input = '```\n{"score": 85}\n```';
    expect(extractJSON(input)).toBe('{"score": 85}');
  });

  it('extracts JSON embedded in text', () => {
    const input = 'Here is the result: {"score": 85} and that is it.';
    expect(extractJSON(input)).toBe('{"score": 85}');
  });

  it('handles JSON with preceding text', () => {
    const input = 'Based on my analysis:\n{"score": 85, "verdict": "Good"}';
    expect(extractJSON(input)).toBe('{"score": 85, "verdict": "Good"}');
  });

  it('handles nested JSON objects', () => {
    const input = '{"outer": {"inner": {"deep": 1}}}';
    expect(extractJSON(input)).toBe('{"outer": {"inner": {"deep": 1}}}');
  });

  it('handles multiline JSON', () => {
    const input = `{
  "score": 85,
  "notes": [
    "Note 1",
    "Note 2"
  ]
}`;
    expect(extractJSON(input)).toBe(input);
  });

  it('handles JSON in markdown with explanation', () => {
    const input = `I analyzed the code. Here's my review:

\`\`\`json
{"score": 75, "verdict": "Good"}
\`\`\`

Hope this helps!`;
    expect(extractJSON(input)).toBe('{"score": 75, "verdict": "Good"}');
  });
});

describe('calculateGrade', () => {
  it('returns A+ for scores >= 95', () => {
    expect(calculateGrade(100)).toBe('A+');
    expect(calculateGrade(95)).toBe('A+');
  });

  it('returns A for scores 90-94', () => {
    expect(calculateGrade(94)).toBe('A');
    expect(calculateGrade(90)).toBe('A');
  });

  it('returns B+ for scores 85-89', () => {
    expect(calculateGrade(89)).toBe('B+');
    expect(calculateGrade(85)).toBe('B+');
  });

  it('returns B for scores 80-84', () => {
    expect(calculateGrade(84)).toBe('B');
    expect(calculateGrade(80)).toBe('B');
  });

  it('returns C+ for scores 75-79', () => {
    expect(calculateGrade(79)).toBe('C+');
    expect(calculateGrade(75)).toBe('C+');
  });

  it('returns C for scores 70-74', () => {
    expect(calculateGrade(74)).toBe('C');
    expect(calculateGrade(70)).toBe('C');
  });

  it('returns D for scores 60-69', () => {
    expect(calculateGrade(69)).toBe('D');
    expect(calculateGrade(60)).toBe('D');
  });

  it('returns F for scores < 60', () => {
    expect(calculateGrade(59)).toBe('F');
    expect(calculateGrade(0)).toBe('F');
  });

  it('handles boundary values correctly', () => {
    expect(calculateGrade(94.9)).toBe('A'); // 94.9 rounds to 94
    expect(calculateGrade(95.0)).toBe('A+');
    expect(calculateGrade(84.5)).toBe('B');
  });
});
