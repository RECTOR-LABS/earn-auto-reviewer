'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnimatedScore, JudgeCardPro } from '@/components/pro';
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
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Github,
  Sparkles,
  Users,
  Zap,
  Send,
} from 'lucide-react';

const EXAMPLE_URLS = [
  { label: 'Next.js', url: 'https://github.com/vercel/next.js/pull/71742' },
  { label: 'React', url: 'https://github.com/facebook/react' },
  { label: 'Solana', url: 'https://github.com/solana-labs/solana-web3.js' },
  { label: 'Anchor', url: 'https://github.com/coral-xyz/anchor' },
];

const PRESET_INFO: Record<ReviewPanelPreset, { name: string; count: number }> = {
  quick: { name: 'Quick', count: 3 },
  standard: { name: 'Standard', count: 5 },
  comprehensive: { name: 'Full', count: 8 },
  custom: { name: 'Custom', count: 0 },
};

const ALL_JUDGES: JudgeId[] = [
  'security', 'performance', 'architecture', 'code-quality',
  'testing', 'devops', 'documentation', 'dx',
];

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<ReviewPanelPreset>('comprehensive');
  const [customJudges, setCustomJudges] = useState<Set<JudgeId>>(new Set(ALL_JUDGES));
  const [selectedModel, setSelectedModel] = useState<ModelId>(DEFAULT_MODEL);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const getSelectedJudges = (): JudgeId[] => {
    if (selectedPreset === 'custom') return Array.from(customJudges);
    return PANEL_PRESETS[selectedPreset];
  };

  const handleReview = async (url?: string) => {
    const targetUrl = url || inputUrl;
    if (!targetUrl.trim()) return;

    const judges = getSelectedJudges();
    if (judges.length === 0) {
      setError('Please select at least one judge');
      return;
    }

    setIsLoading(true);
    setError(null);
    setReview(null);
    setCurrentUrl(targetUrl);

    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: targetUrl,
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
    setInputUrl('');
  };

  const toggleJudge = (id: JudgeId) => {
    setCustomJudges((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectedModelInfo = MODELS[selectedModel];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-superteam-purple-50/30 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-superteam-slate-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 max-w-5xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-superteam-purple to-superteam-purple-dark flex items-center justify-center shadow-lg shadow-superteam-purple/25">
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

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <AnimatePresence mode="wait">
          {!review && !isLoading && (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Hero Section with AI Chat Input */}
              <div className="pt-8 pb-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center space-y-4 mb-10"
                >
                  <h2 className="text-4xl md:text-5xl font-bold text-superteam-slate-900 tracking-tight">
                    Get expert code reviews
                    <br />
                    <span className="bg-gradient-to-r from-superteam-purple to-superteam-purple-dark bg-clip-text text-transparent">
                      in seconds
                    </span>
                  </h2>
                  <p className="text-superteam-slate-600 text-lg max-w-xl mx-auto">
                    AI-powered analysis by 8 expert judges
                  </p>
                </motion.div>

                {/* AI Chat Style Input */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="max-w-2xl mx-auto"
                >
                  <div
                    className={`relative rounded-2xl transition-all duration-300 ${
                      isFocused
                        ? 'shadow-[0_0_0_2px_rgba(99,102,241,0.3),0_8px_40px_rgba(99,102,241,0.15)]'
                        : 'shadow-[0_2px_20px_rgba(0,0,0,0.06)]'
                    }`}
                  >
                    {/* Gradient border effect */}
                    <div className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-superteam-purple-400 via-superteam-purple to-superteam-purple-600 opacity-0 transition-opacity duration-300 ${isFocused ? 'opacity-100' : ''}`} />

                    <div className="relative bg-white rounded-2xl">
                      <div className="flex items-center gap-3 p-4">
                        <div className="flex-1">
                          <input
                            ref={inputRef}
                            type="text"
                            value={inputUrl}
                            onChange={(e) => setInputUrl(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            onKeyDown={(e) => e.key === 'Enter' && handleReview()}
                            placeholder="Paste a GitHub PR or repository URL..."
                            className="w-full text-lg bg-transparent outline-none placeholder:text-superteam-slate-400"
                          />
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleReview()}
                          disabled={!inputUrl.trim()}
                          className={`p-3 rounded-xl transition-all ${
                            inputUrl.trim()
                              ? 'bg-gradient-to-r from-superteam-purple to-superteam-purple-dark text-white shadow-lg shadow-superteam-purple/25'
                              : 'bg-superteam-slate-100 text-superteam-slate-400'
                          }`}
                        >
                          <Send className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Quick examples */}
                  <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                    <span className="text-sm text-superteam-slate-400">Try:</span>
                    {EXAMPLE_URLS.map((ex) => (
                      <button
                        key={ex.url}
                        onClick={() => {
                          setInputUrl(ex.url);
                          handleReview(ex.url);
                        }}
                        className="text-sm text-superteam-purple hover:text-superteam-purple-dark hover:underline transition-colors"
                      >
                        {ex.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Compact Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="max-w-2xl mx-auto space-y-4"
              >
                {/* Review Panel - Compact Pills */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-medium text-superteam-slate-700 flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    Panel:
                  </span>
                  <div className="flex gap-1.5">
                    {(Object.keys(PRESET_INFO) as ReviewPanelPreset[]).map((preset) => {
                      const info = PRESET_INFO[preset];
                      const isSelected = selectedPreset === preset;
                      const count = preset === 'custom' ? customJudges.size : info.count;

                      return (
                        <button
                          key={preset}
                          onClick={() => setSelectedPreset(preset)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                            isSelected
                              ? 'bg-superteam-purple text-white shadow-md shadow-superteam-purple/25'
                              : 'bg-superteam-slate-100 text-superteam-slate-600 hover:bg-superteam-slate-200'
                          }`}
                        >
                          {info.name}
                          <span className={`ml-1 ${isSelected ? 'text-white/70' : 'text-superteam-slate-400'}`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Judges - Compact Grid (only when custom selected) */}
                <AnimatePresence>
                  {selectedPreset === 'custom' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-wrap gap-2 pl-16">
                        {ALL_JUDGES.map((id) => {
                          const judge = JUDGES[id];
                          const isSelected = customJudges.has(id);
                          return (
                            <button
                              key={id}
                              onClick={() => toggleJudge(id)}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                                isSelected
                                  ? 'bg-superteam-purple-100 text-superteam-purple border border-superteam-purple/30'
                                  : 'bg-superteam-slate-100 text-superteam-slate-500 hover:bg-superteam-slate-200'
                              }`}
                            >
                              <span>{judge.icon}</span>
                              {judge.name.split(' ')[0]}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Model - Compact Dropdown */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-superteam-slate-700 flex items-center gap-1.5">
                    <Zap className="w-4 h-4" />
                    Model:
                  </span>
                  <div className="relative">
                    <button
                      onClick={() => setShowModelDropdown(!showModelDropdown)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-superteam-slate-100 hover:bg-superteam-slate-200 text-sm font-medium text-superteam-slate-700 transition-all"
                    >
                      {selectedModelInfo.name}
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        selectedModelInfo.costTier === '$' ? 'bg-green-100 text-green-700' :
                        selectedModelInfo.costTier === '$$' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>{selectedModelInfo.costTier}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {showModelDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-superteam-slate-200 overflow-hidden z-50"
                        >
                          {MODEL_ORDER.map((modelId) => {
                            const model = MODELS[modelId];
                            const isSelected = selectedModel === modelId;
                            return (
                              <button
                                key={modelId}
                                onClick={() => {
                                  setSelectedModel(modelId);
                                  setShowModelDropdown(false);
                                }}
                                className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
                                  isSelected
                                    ? 'bg-superteam-purple-50 text-superteam-purple'
                                    : 'hover:bg-superteam-slate-50 text-superteam-slate-700'
                                }`}
                              >
                                <div>
                                  <span className="font-medium">{model.name}</span>
                                  <span className="text-xs text-superteam-slate-400 ml-2">{model.speed}</span>
                                </div>
                                <span className={`text-xs px-1.5 py-0.5 rounded ${
                                  model.costTier === '$' ? 'bg-green-100 text-green-700' :
                                  model.costTier === '$$' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                }`}>{model.costTier}</span>
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-red-50 border border-red-200 rounded-xl p-4 text-center"
                  >
                    <p className="text-red-700 text-sm">{error}</p>
                    <button onClick={handleReset} className="text-red-600 text-sm underline mt-1">
                      Try Again
                    </button>
                  </motion.div>
                )}
              </motion.div>

              {/* Features - Compact */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex justify-center gap-8 pt-12 text-center"
              >
                {[
                  { icon: Users, label: '8 AI Judges' },
                  { icon: Zap, label: 'Instant Results' },
                  { icon: ArrowRight, label: 'Actionable Insights' },
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-superteam-slate-500">
                    <feature.icon className="w-4 h-4" />
                    <span className="text-sm">{feature.label}</span>
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
              className="text-center py-20 space-y-6"
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
            <span>Built by RECTOR-LABS</span>
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

      {/* Click outside to close dropdown */}
      {showModelDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowModelDropdown(false)}
        />
      )}
    </div>
  );
}
