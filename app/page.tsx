'use client';

import { useState } from 'react';
import { UrlInput } from '@/components/url-input';
import { ReviewDisplay } from '@/components/review-display';
import { LoadingState } from '@/components/loading-state';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ReviewResult } from '@/types';

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

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState('');

  const handleReview = async (url: string) => {
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
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle API errors
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
              AI-powered GitHub submission reviews for Superteam Earn bounties.
              Get instant scores and actionable feedback on pull requests and repositories.
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
              <span>•</span>
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

                {/* Pre-loaded Examples */}
                <div className="space-y-3">
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
                  <h3 className="font-semibold mb-2">🎯 Smart Scoring</h3>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive 0-100 score based on code quality, completeness,
                    testing, and innovation.
                  </p>
                </Card>
                <Card className="p-4">
                  <h3 className="font-semibold mb-2">⚡ Fast Review</h3>
                  <p className="text-sm text-muted-foreground">
                    Get results in under 15 seconds with AI-powered analysis using
                    Claude Sonnet 3.5.
                  </p>
                </Card>
                <Card className="p-4">
                  <h3 className="font-semibold mb-2">📝 Actionable Feedback</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive 3-5 specific, actionable notes to improve your
                    submission quality.
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
                  Analyzing code quality, completeness, and best practices
                </p>
              </div>
              <LoadingState />
            </div>
          )}

          {/* Review Results */}
          {review && !isLoading && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Review Complete</h2>
                  <p className="text-sm text-muted-foreground mt-1">
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
                  Claude Sonnet 3.5
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
