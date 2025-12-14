'use client';

import { useState } from 'react';
import { UrlInput } from '@/components/url-input';
import { ReviewDisplay } from '@/components/review-display';
import { LoadingState } from '@/components/loading-state';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ReviewResult,
  JudgeId,
  ReviewPanelPreset,
  PANEL_PRESETS,
  JUDGES,
  ModelId,
  MODELS,
  MODEL_ORDER,
  DEFAULT_MODEL,
} from '@/types';

// Pre-loaded examples from Superteam Earn submissions
const EXAMPLE_URLS = [
  {
    label: 'Example: Next.js PR',
    url: 'https://github.com/vercel/next.js/pull/71742',
  },
  {
    label: 'Example: React Repository',
    url: 'https://github.com/facebook/react',
  },
  {
    label: 'Example: TypeScript PR',
    url: 'https://github.com/microsoft/TypeScript/pull/60127',
  },
  {
    label: 'Example: Solana Web3.js',
    url: 'https://github.com/solana-labs/solana-web3.js',
  },
  {
    label: 'Example: Anchor Framework',
    url: 'https://github.com/coral-xyz/anchor',
  },
];

// Preset descriptions
const PRESET_INFO: Record<ReviewPanelPreset, { name: string; description: string }> = {
  quick: {
    name: 'Quick Review',
    description: '3 essential judges for fast feedback',
  },
  standard: {
    name: 'Standard Review',
    description: '5 judges covering key areas',
  },
  comprehensive: {
    name: 'Comprehensive Review',
    description: 'All 8 expert judges for thorough analysis',
  },
  custom: {
    name: 'Custom Selection',
    description: 'Choose your own judges',
  },
};

// All judge IDs for selection
const ALL_JUDGES: JudgeId[] = [
  'security',
  'performance',
  'architecture',
  'code-quality',
  'testing',
  'devops',
  'documentation',
  'dx',
];

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState('');

  // Judge selection state
  const [selectedPreset, setSelectedPreset] = useState<ReviewPanelPreset>('comprehensive');
  const [customJudges, setCustomJudges] = useState<Set<JudgeId>>(new Set(ALL_JUDGES));

  // Model selection state
  const [selectedModel, setSelectedModel] = useState<ModelId>(DEFAULT_MODEL);

  // Get effective judges based on selection
  const getSelectedJudges = (): JudgeId[] => {
    if (selectedPreset === 'custom') {
      return Array.from(customJudges);
    }
    return PANEL_PRESETS[selectedPreset];
  };

  const handleReview = async (url: string) => {
    const judges = getSelectedJudges();

    if (judges.length === 0) {
      setError('Please select at least one judge for the review.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setReview(null);
    setCurrentUrl(url);

    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          preset: selectedPreset !== 'custom' ? selectedPreset : undefined,
          judges: selectedPreset === 'custom' ? judges : undefined,
          model: selectedModel,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to review submission');
      }

      setReview(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setReview(null);
    setError(null);
    setCurrentUrl('');
  };

  const handleExampleSelect = (url: string) => {
    handleReview(url);
  };

  const toggleCustomJudge = (id: JudgeId) => {
    setCustomJudges((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAllJudges = () => {
    setCustomJudges(new Set(ALL_JUDGES));
  };

  const clearAllJudges = () => {
    setCustomJudges(new Set());
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      {/* Hero Section */}
      <header className="border-b bg-white/50 backdrop-blur-sm dark:bg-zinc-950/50">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Superteam Earn{' '}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Auto-Reviewer
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              AI-powered GitHub submission reviews with a panel of 8 expert judges.
              Get comprehensive scores and actionable feedback from multiple perspectives.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <a
                href="https://earn.superteam.fun/listing/add-github-links-to-earn-auto-reviews"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors underline"
              >
                View Bounty
              </a>
              <span>|</span>
              <a
                href="https://github.com/RECTOR-LABS/earn-auto-reviewer"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors underline"
              >
                GitHub Repo
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="space-y-8">
          {/* Input Section */}
          {!review && !isLoading && (
            <div className="space-y-6">
              <Card className="p-6 space-y-6">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Submit for Review</h2>
                  <p className="text-sm text-muted-foreground">
                    Paste a GitHub pull request or repository URL to get started.
                  </p>
                </div>

                <UrlInput onSubmit={handleReview} isLoading={isLoading} />

                {/* Judge Panel Selection */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <h3 className="font-medium">Select Review Panel</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose which expert judges will evaluate your submission
                    </p>
                  </div>

                  {/* Preset Buttons */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {(Object.keys(PRESET_INFO) as ReviewPanelPreset[]).map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setSelectedPreset(preset)}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          selectedPreset === preset
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'border-muted hover:border-primary/50'
                        }`}
                      >
                        <p className="font-medium text-sm">{PRESET_INFO[preset].name}</p>
                        <p className="text-xs text-muted-foreground">
                          {PRESET_INFO[preset].description}
                        </p>
                      </button>
                    ))}
                  </div>

                  {/* Custom Judge Selection */}
                  {selectedPreset === 'custom' && (
                    <div className="space-y-3 p-4 rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          Selected: {customJudges.size} of {ALL_JUDGES.length} judges
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={selectAllJudges}
                            className="text-xs text-primary hover:underline"
                          >
                            Select All
                          </button>
                          <span className="text-muted-foreground">|</span>
                          <button
                            onClick={clearAllJudges}
                            className="text-xs text-primary hover:underline"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {ALL_JUDGES.map((id) => {
                          const judge = JUDGES[id];
                          const isSelected = customJudges.has(id);
                          return (
                            <button
                              key={id}
                              onClick={() => toggleCustomJudge(id)}
                              className={`p-2 rounded-lg border text-left transition-colors ${
                                isSelected
                                  ? 'border-primary bg-primary/10'
                                  : 'border-muted bg-background hover:border-muted-foreground/30'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span>{judge.icon}</span>
                                <span className="text-xs font-medium truncate">
                                  {judge.name}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Selected Judges Preview (for presets) */}
                  {selectedPreset !== 'custom' && (
                    <div className="flex flex-wrap gap-2">
                      {PANEL_PRESETS[selectedPreset].map((id) => {
                        const judge = JUDGES[id];
                        return (
                          <Badge key={id} variant="secondary" className="gap-1">
                            <span>{judge.icon}</span>
                            {judge.name}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Model Selection */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <h3 className="font-medium">Select AI Model</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose the AI model for review analysis
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {MODEL_ORDER.map((modelId) => {
                      const model = MODELS[modelId];
                      const isSelected = selectedModel === modelId;
                      return (
                        <button
                          key={modelId}
                          onClick={() => setSelectedModel(modelId)}
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            isSelected
                              ? 'border-primary bg-primary/5 ring-1 ring-primary'
                              : 'border-muted hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{model.name}</span>
                            <span className={`text-xs font-mono ${
                              model.costTier === '$' ? 'text-green-600' :
                              model.costTier === '$$' ? 'text-yellow-600' :
                              model.costTier === '$$$' ? 'text-orange-600' :
                              'text-red-600'
                            }`}>
                              {model.costTier}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {model.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <span>{model.speed}</span>
                            <span>•</span>
                            <span>{model.contextWindow} ctx</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Cost Legend */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="font-medium">Cost:</span>
                    <span><span className="text-green-600 font-mono">$</span> Budget</span>
                    <span><span className="text-yellow-600 font-mono">$$</span> Standard</span>
                    <span><span className="text-red-600 font-mono">$$$$</span> Premium</span>
                  </div>
                </div>

                {/* Pre-loaded Examples */}
                <div className="space-y-3 pt-4 border-t">
                  <p className="text-sm font-medium text-muted-foreground">
                    Or try an example:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {EXAMPLE_URLS.map((example) => (
                      <Button
                        key={example.url}
                        variant="outline"
                        size="sm"
                        onClick={() => handleExampleSelect(example.url)}
                        className="text-xs"
                      >
                        {example.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Error Display */}
              {error && (
                <Card className="p-6 border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-red-900 dark:text-red-100">
                      Error
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {error}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      className="mt-4"
                    >
                      Try Again
                    </Button>
                  </div>
                </Card>
              )}

              {/* Features Section */}
              <div className="grid md:grid-cols-3 gap-4 mt-8">
                <Card className="p-4">
                  <h3 className="font-semibold mb-2">8 Expert Judges</h3>
                  <p className="text-sm text-muted-foreground">
                    Security, Performance, Architecture, Code Quality, Testing, DevOps,
                    Documentation, and Developer Experience experts.
                  </p>
                </Card>
                <Card className="p-4">
                  <h3 className="font-semibold mb-2">Severity Levels</h3>
                  <p className="text-sm text-muted-foreground">
                    Findings categorized as Critical, Warning, or Info with actionable
                    suggestions for improvement.
                  </p>
                </Card>
                <Card className="p-4">
                  <h3 className="font-semibold mb-2">Smart Caching</h3>
                  <p className="text-sm text-muted-foreground">
                    Reviews are cached per commit hash. Same code = instant results.
                    Changes trigger fresh analysis.
                  </p>
                </Card>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold">Reviewing Submission...</h2>
                <p className="text-sm text-muted-foreground">
                  Our expert panel is analyzing your code from multiple perspectives
                </p>
              </div>
              <LoadingState judgeCount={getSelectedJudges().length} />
            </div>
          )}

          {/* Review Results */}
          {review && !isLoading && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Review Complete</h2>
                  <p className="text-sm text-muted-foreground mt-1 break-all">
                    {currentUrl}
                  </p>
                </div>
                <Button onClick={handleReset} variant="outline">
                  Review Another
                </Button>
              </div>
              <ReviewDisplay review={review} />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 bg-white/50 backdrop-blur-sm dark:bg-zinc-950/50">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Built by</span>
              <a
                href="https://github.com/RECTOR-LABS"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold hover:text-foreground transition-colors"
              >
                RECTOR-LABS
              </a>
            </div>
            <div className="flex items-center gap-4">
              <span>Tech Stack:</span>
              <div className="flex gap-2 text-xs">
                <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded">
                  Next.js 14
                </span>
                <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded">
                  OpenRouter
                </span>
                <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded">
                  Octokit
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
