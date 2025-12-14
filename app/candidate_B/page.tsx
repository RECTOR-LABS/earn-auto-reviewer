'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UrlInput } from '@/components/url-input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnimatedScore, GlowCard, JudgeCardPro, ProBadge } from '@/components/pro';
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
import {
  ArrowRight,
  Check,
  ChevronRight,
  ExternalLink,
  Github,
  Search,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';

const EXAMPLE_URLS = [
  { label: 'Next.js', url: 'https://github.com/vercel/next.js/pull/71742' },
  { label: 'React', url: 'https://github.com/facebook/react' },
  { label: 'Solana', url: 'https://github.com/solana-labs/solana-web3.js' },
  { label: 'Anchor', url: 'https://github.com/coral-xyz/anchor' },
];

const PRESET_INFO: Record<ReviewPanelPreset, { name: string; desc: string; count: number }> = {
  quick: { name: 'Quick', desc: 'Essential checks', count: 3 },
  standard: { name: 'Standard', desc: 'Balanced review', count: 5 },
  comprehensive: { name: 'Comprehensive', desc: 'Full analysis', count: 8 },
  custom: { name: 'Custom', desc: 'Your selection', count: 0 },
};

const ALL_JUDGES: JudgeId[] = [
  'security', 'performance', 'architecture', 'code-quality',
  'testing', 'devops', 'documentation', 'dx',
];

export default function CandidateB() {
  const [isLoading, setIsLoading] = useState(false);
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<ReviewPanelPreset>('comprehensive');
  const [customJudges, setCustomJudges] = useState<Set<JudgeId>>(new Set(ALL_JUDGES));
  const [selectedModel, setSelectedModel] = useState<ModelId>(DEFAULT_MODEL);

  const getSelectedJudges = (): JudgeId[] => {
    if (selectedPreset === 'custom') return Array.from(customJudges);
    return PANEL_PRESETS[selectedPreset];
  };

  const handleReview = async (url: string) => {
    const judges = getSelectedJudges();
    if (judges.length === 0) {
      setError('Please select at least one judge');
      return;
    }

    setIsLoading(true);
    setError(null);
    setReview(null);
    setCurrentUrl(url);

    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          preset: selectedPreset !== 'custom' ? selectedPreset : undefined,
          judges: selectedPreset === 'custom' ? judges : undefined,
          model: selectedModel,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Review failed');
      setReview(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setReview(null);
    setError(null);
    setCurrentUrl('');
  };

  const toggleJudge = (id: JudgeId) => {
    setCustomJudges((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-superteam-slate-50">
      {/* Clean Header */}
      <header className="bg-white border-b border-superteam-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 max-w-5xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-superteam-purple flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-superteam-slate-900">Earn Auto-Reviewer</h1>
                <p className="text-xs text-superteam-slate-500">by RECTOR-LABS</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <a href="https://earn.superteam.fun" target="_blank" className="text-superteam-slate-600 hover:text-superteam-purple transition-colors">
                Superteam Earn
              </a>
              <a href="https://github.com/RECTOR-LABS/earn-auto-reviewer" target="_blank" className="flex items-center gap-1 text-superteam-slate-600 hover:text-superteam-purple transition-colors">
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <AnimatePresence mode="wait">
          {!review && !isLoading && (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12"
            >
              {/* Hero Section */}
              <div className="text-center space-y-4 max-w-2xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Badge className="bg-superteam-purple-100 text-superteam-purple-700 border-0 mb-4">
                    <Zap className="w-3 h-3 mr-1" />
                    AI-Powered Reviews
                  </Badge>
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl font-bold text-superteam-slate-900"
                >
                  Get expert code reviews in seconds
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg text-superteam-slate-600"
                >
                  Our panel of 8 AI judges analyzes your GitHub submissions for security,
                  performance, architecture, and more.
                </motion.p>
              </div>

              {/* Main Input Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-sm border border-superteam-slate-200 p-8"
              >
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-superteam-slate-700">
                    <Search className="w-5 h-5" />
                    <span className="font-medium">Enter GitHub URL</span>
                  </div>

                  <UrlInput onSubmit={handleReview} isLoading={isLoading} />

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-superteam-slate-500">Try:</span>
                    {EXAMPLE_URLS.map((ex) => (
                      <button
                        key={ex.url}
                        onClick={() => handleReview(ex.url)}
                        className="text-sm text-superteam-purple hover:text-superteam-purple-dark underline underline-offset-2"
                      >
                        {ex.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Review Panel Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-superteam-slate-700" />
                  <h3 className="font-medium text-superteam-slate-900">Review Panel</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(Object.keys(PRESET_INFO) as ReviewPanelPreset[]).map((preset) => {
                    const info = PRESET_INFO[preset];
                    const isSelected = selectedPreset === preset;
                    const count = preset === 'custom' ? customJudges.size : info.count;

                    return (
                      <button
                        key={preset}
                        onClick={() => setSelectedPreset(preset)}
                        className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? 'border-superteam-purple bg-superteam-purple-50'
                            : 'border-superteam-slate-200 hover:border-superteam-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-superteam-purple flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <p className={`font-semibold ${isSelected ? 'text-superteam-purple' : 'text-superteam-slate-900'}`}>
                          {info.name}
                        </p>
                        <p className="text-sm text-superteam-slate-500">{info.desc}</p>
                        <p className={`text-xs mt-2 ${isSelected ? 'text-superteam-purple' : 'text-superteam-slate-400'}`}>
                          {count} judges
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Selection */}
                {selectedPreset === 'custom' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-white rounded-xl border border-superteam-slate-200 p-4"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {ALL_JUDGES.map((id) => {
                        const judge = JUDGES[id];
                        const isSelected = customJudges.has(id);
                        return (
                          <button
                            key={id}
                            onClick={() => toggleJudge(id)}
                            className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                              isSelected
                                ? 'border-superteam-purple bg-superteam-purple-50 text-superteam-purple'
                                : 'border-superteam-slate-200 hover:border-superteam-slate-300 text-superteam-slate-700'
                            }`}
                          >
                            <span>{judge.icon}</span>
                            <span className="text-sm font-medium">{judge.name.split(' ')[0]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Selected Preview */}
                {selectedPreset !== 'custom' && (
                  <div className="flex flex-wrap gap-2">
                    {PANEL_PRESETS[selectedPreset].map((id) => (
                      <span key={id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-superteam-slate-200 text-sm">
                        <span>{JUDGES[id].icon}</span>
                        <span className="text-superteam-slate-700">{JUDGES[id].name}</span>
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Model Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-superteam-slate-700" />
                  <h3 className="font-medium text-superteam-slate-900">AI Model</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {MODEL_ORDER.slice(0, 4).map((modelId) => {
                    const model = MODELS[modelId];
                    const isSelected = selectedModel === modelId;
                    return (
                      <button
                        key={modelId}
                        onClick={() => setSelectedModel(modelId)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? 'border-superteam-purple bg-superteam-purple-50'
                            : 'border-superteam-slate-200 hover:border-superteam-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className={`font-medium ${isSelected ? 'text-superteam-purple' : 'text-superteam-slate-900'}`}>
                            {model.name}
                          </span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            model.costTier === '$' ? 'bg-green-100 text-green-700' :
                            model.costTier === '$$' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                          }`}>{model.costTier}</span>
                        </div>
                        <p className="text-xs text-superteam-slate-500 mt-1">{model.speed} • {model.contextWindow}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Show more models toggle */}
                <details className="group">
                  <summary className="text-sm text-superteam-purple cursor-pointer hover:underline">
                    Show all {MODEL_ORDER.length} models
                  </summary>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                    {MODEL_ORDER.slice(4).map((modelId) => {
                      const model = MODELS[modelId];
                      const isSelected = selectedModel === modelId;
                      return (
                        <button
                          key={modelId}
                          onClick={() => setSelectedModel(modelId)}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            isSelected
                              ? 'border-superteam-purple bg-superteam-purple-50'
                              : 'border-superteam-slate-200 hover:border-superteam-slate-300 bg-white'
                          }`}
                        >
                          <span className={`text-sm font-medium ${isSelected ? 'text-superteam-purple' : 'text-superteam-slate-900'}`}>
                            {model.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </details>
              </motion.div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-700">{error}</p>
                  <Button variant="outline" size="sm" onClick={handleReset} className="mt-2">
                    Try Again
                  </Button>
                </div>
              )}

              {/* Features */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="grid md:grid-cols-3 gap-6 pt-8 border-t border-superteam-slate-200"
              >
                {[
                  { title: 'Multi-Expert Analysis', desc: '8 specialized AI judges review your code', icon: Users },
                  { title: 'Instant Feedback', desc: 'Get comprehensive reviews in seconds', icon: Zap },
                  { title: 'Actionable Insights', desc: 'Clear suggestions for improvement', icon: ArrowRight },
                ].map((feature, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-superteam-purple-100 flex items-center justify-center shrink-0">
                      <feature.icon className="w-5 h-5 text-superteam-purple" />
                    </div>
                    <div>
                      <h4 className="font-medium text-superteam-slate-900">{feature.title}</h4>
                      <p className="text-sm text-superteam-slate-600">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* Loading */}
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16 space-y-6"
            >
              <div className="relative w-20 h-20 mx-auto">
                <motion.div
                  className="absolute inset-0 border-4 border-superteam-purple-200 rounded-full"
                />
                <motion.div
                  className="absolute inset-0 border-4 border-transparent border-t-superteam-purple rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-superteam-slate-900">Analyzing your code...</h3>
                <p className="text-superteam-slate-600 mt-2">
                  {getSelectedJudges().length} experts are reviewing your submission
                </p>
              </div>
              <div className="flex justify-center gap-3">
                {getSelectedJudges().map((id, i) => (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="w-10 h-10 rounded-full bg-superteam-slate-100 flex items-center justify-center text-lg"
                  >
                    {JUDGES[id].icon}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Results */}
          {review && !isLoading && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <Badge className="bg-green-100 text-green-700 border-0 mb-2">
                    <Check className="w-3 h-3 mr-1" />
                    Review Complete
                  </Badge>
                  <p className="text-superteam-slate-600 text-sm truncate max-w-lg">{currentUrl}</p>
                </div>
                <Button onClick={handleReset} className="bg-superteam-purple hover:bg-superteam-purple-dark">
                  New Review <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              {/* Score Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-superteam-slate-200 p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <AnimatedScore score={review.overall.score} size="xl" />
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold text-superteam-slate-900">{review.overall.verdict}</h3>
                    <p className="text-superteam-slate-600 mt-2">{review.overall.summary}</p>
                  </div>
                </div>
              </div>

              {/* Judge Cards */}
              <div className="space-y-4">
                <h3 className="font-semibold text-superteam-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Expert Reviews ({review.judges.length})
                </h3>
                {review.judges.map((judge, i) => (
                  <JudgeCardPro key={judge.id} judge={judge} index={i} variant="default" />
                ))}
              </div>

              {/* Metadata */}
              <div className="text-center text-sm text-superteam-slate-500 pt-4 border-t border-superteam-slate-200">
                Reviewed using {review.metadata.modelUsed?.split('/')[1]} • {review.metadata.judgesUsed.length} judges • {new Date(review.metadata.reviewedAt).toLocaleString()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-superteam-slate-200 mt-16">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          <div className="flex items-center justify-between text-sm text-superteam-slate-500">
            <span>Built by RECTOR-LABS • Candidate B</span>
            <div className="flex items-center gap-4">
              <a href="https://github.com/RECTOR-LABS/earn-auto-reviewer" target="_blank" className="hover:text-superteam-purple">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://earn.superteam.fun" target="_blank" className="hover:text-superteam-purple">
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
