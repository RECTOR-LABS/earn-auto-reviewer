'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { UrlInput } from '@/components/url-input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnimatedScore, GlowCard, JudgeCardPro, GradientText } from '@/components/pro';
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
  Cpu,
  ExternalLink,
  Github,
  Loader2,
  Play,
  Rocket,
  Shield,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react';

const EXAMPLE_URLS = [
  { label: 'Next.js', url: 'https://github.com/vercel/next.js/pull/71742', color: 'from-blue-500 to-cyan-500' },
  { label: 'React', url: 'https://github.com/facebook/react', color: 'from-cyan-500 to-blue-500' },
  { label: 'Solana', url: 'https://github.com/solana-labs/solana-web3.js', color: 'from-purple-500 to-pink-500' },
  { label: 'Anchor', url: 'https://github.com/coral-xyz/anchor', color: 'from-orange-500 to-yellow-500' },
];

const PRESET_INFO: Record<ReviewPanelPreset, { name: string; gradient: string; emoji: string }> = {
  quick: { name: 'Quick Scan', gradient: 'from-green-400 to-emerald-500', emoji: '⚡' },
  standard: { name: 'Standard', gradient: 'from-blue-400 to-indigo-500', emoji: '🔍' },
  comprehensive: { name: 'Full Audit', gradient: 'from-superteam-purple-400 to-pink-500', emoji: '🛡️' },
  custom: { name: 'Custom', gradient: 'from-orange-400 to-red-500', emoji: '⚙️' },
};

const ALL_JUDGES: JudgeId[] = [
  'security', 'performance', 'architecture', 'code-quality',
  'testing', 'devops', 'documentation', 'dx',
];

export default function CandidateC() {
  const [isLoading, setIsLoading] = useState(false);
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<ReviewPanelPreset>('comprehensive');
  const [customJudges, setCustomJudges] = useState<Set<JudgeId>>(new Set(ALL_JUDGES));
  const [selectedModel, setSelectedModel] = useState<ModelId>(DEFAULT_MODEL);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const getSelectedJudges = (): JudgeId[] => {
    if (selectedPreset === 'custom') return Array.from(customJudges);
    return PANEL_PRESETS[selectedPreset];
  };

  const handleReview = async (url: string) => {
    const judges = getSelectedJudges();
    if (judges.length === 0) {
      setError('Select at least one judge');
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
    <div className="min-h-screen bg-superteam-slate-950 text-white overflow-hidden relative">
      {/* Animated gradient background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-superteam-purple-950 via-superteam-slate-950 to-superteam-slate-900" />
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-30"
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
            left: mousePosition.x - 300,
            top: mousePosition.y - 300,
          }}
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-superteam-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Mesh gradient overlay */}
      <div className="fixed inset-0 z-0 opacity-30">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(99, 102, 241, 0.1)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 backdrop-blur-xl bg-superteam-slate-950/50">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <motion.div
                className="relative p-2 rounded-xl bg-gradient-to-br from-superteam-purple-500 to-pink-500"
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <Rocket className="w-6 h-6 text-white" />
                <motion.div
                  className="absolute inset-0 rounded-xl bg-gradient-to-br from-superteam-purple-500 to-pink-500 blur-lg opacity-50"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-superteam-purple-200 bg-clip-text text-transparent">
                  Earn Auto-Reviewer
                </h1>
                <div className="flex items-center gap-2 text-xs text-superteam-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Powered by AI
                </div>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Badge className="bg-gradient-to-r from-superteam-purple-500/20 to-pink-500/20 border-superteam-purple-500/50 text-white">
                <Sparkles className="w-3 h-3 mr-1" />
                Candidate C
              </Badge>
            </motion.div>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-12 max-w-6xl">
        <AnimatePresence mode="wait">
          {!review && !isLoading && (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              {/* Hero */}
              <motion.div
                className="text-center space-y-6 py-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                >
                  <Badge className="bg-gradient-to-r from-superteam-purple-500/30 to-pink-500/30 border-superteam-purple-400/50 text-superteam-purple-200 text-sm px-4 py-1">
                    <Star className="w-3 h-3 mr-1 text-yellow-400" />
                    8 Expert AI Judges
                  </Badge>
                </motion.div>

                <h2 className="text-5xl md:text-6xl font-bold leading-tight">
                  <span className="text-white">Get </span>
                  <GradientText variant="rainbow" animate className="font-extrabold">
                    World-Class
                  </GradientText>
                  <br />
                  <span className="text-white">Code Reviews</span>
                </h2>

                <p className="text-xl text-superteam-slate-400 max-w-2xl mx-auto">
                  Submit your GitHub PR or repo and receive comprehensive analysis from our panel of AI experts.
                </p>
              </motion.div>

              {/* Main Input */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-superteam-purple-500 to-pink-500 rounded-2xl blur-xl opacity-20" />
                <div className="relative bg-superteam-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-6">
                  <UrlInput onSubmit={handleReview} isLoading={isLoading} />

                  {/* Example buttons with gradients */}
                  <div className="flex flex-wrap gap-3 justify-center">
                    {EXAMPLE_URLS.map((ex, i) => (
                      <motion.button
                        key={ex.url}
                        onClick={() => handleReview(ex.url)}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-4 py-2 rounded-full bg-gradient-to-r ${ex.color} text-white text-sm font-medium shadow-lg`}
                      >
                        <Play className="w-3 h-3 inline mr-1" />
                        {ex.label}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Panel Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 justify-center">
                  <Shield className="w-5 h-5 text-superteam-purple-400" />
                  <h3 className="font-semibold text-lg">Choose Your Panel</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(Object.keys(PRESET_INFO) as ReviewPanelPreset[]).map((preset, i) => {
                    const info = PRESET_INFO[preset];
                    const isSelected = selectedPreset === preset;
                    const count = preset === 'custom' ? customJudges.size : PANEL_PRESETS[preset].length;

                    return (
                      <motion.button
                        key={preset}
                        onClick={() => setSelectedPreset(preset)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative p-5 rounded-xl border text-left transition-all overflow-hidden ${
                          isSelected
                            ? 'border-white/30 bg-white/10'
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        {isSelected && (
                          <motion.div
                            className={`absolute inset-0 bg-gradient-to-br ${info.gradient} opacity-20`}
                            layoutId="selectedPanel"
                          />
                        )}
                        <div className="relative z-10">
                          <span className="text-3xl">{info.emoji}</span>
                          <p className="font-semibold mt-2">{info.name}</p>
                          <p className="text-sm text-superteam-slate-400">{count} judges</p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Custom Judge Grid */}
                {selectedPreset === 'custom' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-3"
                  >
                    {ALL_JUDGES.map((id) => {
                      const judge = JUDGES[id];
                      const isSelected = customJudges.has(id);
                      return (
                        <motion.button
                          key={id}
                          onClick={() => toggleJudge(id)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-3 rounded-xl border flex items-center gap-2 transition-all ${
                            isSelected
                              ? 'border-superteam-purple-500 bg-superteam-purple-500/20'
                              : 'border-white/10 bg-white/5'
                          }`}
                        >
                          <span className="text-xl">{judge.icon}</span>
                          <span className="text-sm">{judge.name.split(' ')[0]}</span>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}

                {/* Selected Preview */}
                {selectedPreset !== 'custom' && (
                  <motion.div
                    className="flex flex-wrap gap-2 justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {PANEL_PRESETS[selectedPreset].map((id, i) => (
                      <motion.span
                        key={id}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full border border-white/10 text-sm"
                      >
                        {JUDGES[id].icon} {JUDGES[id].name}
                      </motion.span>
                    ))}
                  </motion.div>
                )}
              </motion.div>

              {/* Model Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 justify-center">
                  <Cpu className="w-5 h-5 text-superteam-purple-400" />
                  <h3 className="font-semibold text-lg">Select AI Model</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {MODEL_ORDER.slice(0, 4).map((modelId, i) => {
                    const model = MODELS[modelId];
                    const isSelected = selectedModel === modelId;
                    return (
                      <motion.button
                        key={modelId}
                        onClick={() => setSelectedModel(modelId)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + i * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-superteam-purple-500 bg-superteam-purple-500/20'
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-medium">{model.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            model.costTier === '$' ? 'bg-green-500/20 text-green-400' :
                            model.costTier === '$$' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                          }`}>{model.costTier}</span>
                        </div>
                        <p className="text-xs text-superteam-slate-400 mt-1">{model.speed}</p>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-center"
                >
                  <p className="text-red-400">{error}</p>
                  <Button variant="outline" size="sm" onClick={handleReset} className="mt-3 border-red-500/50">
                    Try Again
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Loading */}
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-20 space-y-8"
            >
              <motion.div
                className="relative w-32 h-32 mx-auto"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-superteam-purple-500 to-pink-500 blur-lg opacity-50" />
                <div className="absolute inset-2 rounded-full bg-superteam-slate-950" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-superteam-purple-500 border-r-pink-500" />
              </motion.div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold">
                  <GradientText variant="rainbow" animate>Analyzing Code...</GradientText>
                </h3>
                <p className="text-superteam-slate-400">{getSelectedJudges().length} AI experts reviewing your submission</p>
              </div>

              <div className="flex justify-center gap-4">
                {getSelectedJudges().map((id, i) => (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-3xl"
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
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <Badge className="bg-gradient-to-r from-green-500/30 to-emerald-500/30 border-green-500/50 text-green-300 mb-2">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Review Complete
                  </Badge>
                  <p className="text-superteam-slate-400 text-sm truncate max-w-lg">{currentUrl}</p>
                </div>
                <Button
                  onClick={handleReset}
                  className="bg-gradient-to-r from-superteam-purple-500 to-pink-500 hover:from-superteam-purple-600 hover:to-pink-600 text-white"
                >
                  New Review <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              {/* Score Card */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-superteam-purple-500 to-pink-500 rounded-2xl blur-xl opacity-20" />
                <div className="relative bg-superteam-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <AnimatedScore score={review.overall.score} size="xl" variant="gradient" showGlow />
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-3xl font-bold">{review.overall.verdict}</h3>
                      <p className="text-superteam-slate-400 mt-2 text-lg">{review.overall.summary}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Judge Cards */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-superteam-purple-400" />
                  Expert Assessments ({review.judges.length})
                </h3>
                {review.judges.map((judge, i) => (
                  <JudgeCardPro key={judge.id} judge={judge} index={i} variant="glass" />
                ))}
              </div>

              {/* Metadata */}
              <div className="text-center text-sm text-superteam-slate-500">
                <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-white/5 border border-white/10">
                  <span>Model: {review.metadata.modelUsed?.split('/')[1]}</span>
                  <span className="w-1 h-1 rounded-full bg-superteam-slate-500" />
                  <span>{review.metadata.judgesUsed.length} Judges</span>
                  <span className="w-1 h-1 rounded-full bg-superteam-slate-500" />
                  <span>{review.metadata.reviewDuration || 'N/A'}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-superteam-slate-950/80 backdrop-blur-xl mt-16">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="flex items-center justify-between text-sm text-superteam-slate-500">
            <span>Built by RECTOR-LABS • Candidate C</span>
            <div className="flex items-center gap-4">
              <a href="https://github.com/RECTOR-LABS/earn-auto-reviewer" target="_blank" className="hover:text-superteam-purple-400 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://earn.superteam.fun" target="_blank" className="hover:text-superteam-purple-400 transition-colors">
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
