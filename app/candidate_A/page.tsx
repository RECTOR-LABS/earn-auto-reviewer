'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UrlInput } from '@/components/url-input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AnimatedScore,
  GlowCard,
  JudgeCardPro,
  GradientText,
  ParticlesBg,
} from '@/components/pro';
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
import { Zap, Github, ExternalLink, Terminal, Shield, Code2 } from 'lucide-react';

// Pre-loaded examples
const EXAMPLE_URLS = [
  { label: 'Next.js PR', url: 'https://github.com/vercel/next.js/pull/71742' },
  { label: 'React Repo', url: 'https://github.com/facebook/react' },
  { label: 'Solana Web3', url: 'https://github.com/solana-labs/solana-web3.js' },
];

const PRESET_INFO: Record<ReviewPanelPreset, { name: string; icon: string }> = {
  quick: { name: 'Quick Scan', icon: '⚡' },
  standard: { name: 'Standard', icon: '🔍' },
  comprehensive: { name: 'Full Audit', icon: '🛡️' },
  custom: { name: 'Custom', icon: '⚙️' },
};

const ALL_JUDGES: JudgeId[] = [
  'security', 'performance', 'architecture', 'code-quality',
  'testing', 'devops', 'documentation', 'dx',
];

export default function CandidateA() {
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
    <div className="min-h-screen bg-superteam-slate-950 text-white relative overflow-hidden">
      {/* Animated Particles Background */}
      <ParticlesBg count={60} color="rgba(99, 102, 241, 0.4)" />

      {/* Gradient Orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-superteam-purple-600/20 rounded-full blur-3xl" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-superteam-purple-800/20 rounded-full blur-3xl" />

      {/* Header */}
      <header className="relative z-10 border-b border-superteam-slate-800/50 bg-superteam-slate-950/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="p-2 rounded-lg bg-superteam-purple-600/20 border border-superteam-purple-500/30"
              >
                <Terminal className="w-6 h-6 text-superteam-purple-400" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold">
                  <GradientText variant="purple">EARN_REVIEWER</GradientText>
                </h1>
                <p className="text-xs text-superteam-slate-400 font-mono">v2.0.0 // dark_mode</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-superteam-purple-500/50 text-superteam-purple-400">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                ONLINE
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-12 max-w-6xl">
        <AnimatePresence mode="wait">
          {!review && !isLoading && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Hero */}
              <div className="text-center space-y-4">
                <motion.h2
                  className="text-4xl md:text-5xl font-bold"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <GradientText variant="purple" animate>
                    AI-Powered Code Auditor
                  </GradientText>
                </motion.h2>
                <p className="text-superteam-slate-400 max-w-2xl mx-auto">
                  8 expert judges analyze your GitHub submissions. Get comprehensive security,
                  performance, and quality insights in seconds.
                </p>
              </div>

              {/* Input Card */}
              <GlowCard variant="glass" className="p-6 space-y-6">
                <div className="flex items-center gap-2 text-superteam-purple-400 font-mono text-sm">
                  <span className="text-green-400">$</span>
                  <span>submit_review</span>
                  <span className="animate-pulse">_</span>
                </div>

                <UrlInput onSubmit={handleReview} isLoading={isLoading} />

                {/* Quick Examples */}
                <div className="flex flex-wrap gap-2">
                  {EXAMPLE_URLS.map((ex) => (
                    <Button
                      key={ex.url}
                      variant="outline"
                      size="sm"
                      onClick={() => handleReview(ex.url)}
                      className="border-superteam-slate-700 hover:border-superteam-purple-500 hover:bg-superteam-purple-500/10 text-xs font-mono"
                    >
                      <Code2 className="w-3 h-3 mr-1" />
                      {ex.label}
                    </Button>
                  ))}
                </div>
              </GlowCard>

              {/* Panel Selection */}
              <GlowCard variant="glass" className="p-6 space-y-4">
                <h3 className="font-mono text-superteam-purple-400 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  audit_panel.select()
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(Object.keys(PRESET_INFO) as ReviewPanelPreset[]).map((preset) => (
                    <motion.button
                      key={preset}
                      onClick={() => setSelectedPreset(preset)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        selectedPreset === preset
                          ? 'border-superteam-purple-500 bg-superteam-purple-500/20 shadow-lg shadow-superteam-purple-500/20'
                          : 'border-superteam-slate-700 hover:border-superteam-slate-600 bg-superteam-slate-800/50'
                      }`}
                    >
                      <span className="text-2xl">{PRESET_INFO[preset].icon}</span>
                      <p className="font-medium mt-2">{PRESET_INFO[preset].name}</p>
                      <p className="text-xs text-superteam-slate-400">
                        {preset === 'custom' ? `${customJudges.size} selected` : `${PANEL_PRESETS[preset].length} judges`}
                      </p>
                    </motion.button>
                  ))}
                </div>

                {/* Custom Judge Selection */}
                {selectedPreset === 'custom' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-4 border-t border-superteam-slate-700"
                  >
                    {ALL_JUDGES.map((id) => {
                      const judge = JUDGES[id];
                      const isSelected = customJudges.has(id);
                      return (
                        <button
                          key={id}
                          onClick={() => toggleJudge(id)}
                          className={`p-2 rounded-lg border text-left transition-all text-sm ${
                            isSelected
                              ? 'border-superteam-purple-500 bg-superteam-purple-500/20'
                              : 'border-superteam-slate-700 bg-superteam-slate-800/30'
                          }`}
                        >
                          <span className="mr-2">{judge.icon}</span>
                          {judge.name.split(' ')[0]}
                        </button>
                      );
                    })}
                  </motion.div>
                )}

                {/* Selected Preview */}
                {selectedPreset !== 'custom' && (
                  <div className="flex flex-wrap gap-2">
                    {PANEL_PRESETS[selectedPreset].map((id) => (
                      <Badge key={id} className="bg-superteam-purple-500/20 text-superteam-purple-300 border-superteam-purple-500/30">
                        {JUDGES[id].icon} {JUDGES[id].name.split(' ')[0]}
                      </Badge>
                    ))}
                  </div>
                )}
              </GlowCard>

              {/* Model Selection */}
              <GlowCard variant="glass" className="p-6 space-y-4">
                <h3 className="font-mono text-superteam-purple-400 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  model.configure()
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {MODEL_ORDER.map((modelId) => {
                    const model = MODELS[modelId];
                    const isSelected = selectedModel === modelId;
                    return (
                      <motion.button
                        key={modelId}
                        onClick={() => setSelectedModel(modelId)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'border-superteam-purple-500 bg-superteam-purple-500/20'
                            : 'border-superteam-slate-700 hover:border-superteam-slate-600 bg-superteam-slate-800/50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-medium text-sm">{model.name}</span>
                          <span className={`text-xs font-mono ${
                            model.costTier === '$' ? 'text-green-400' :
                            model.costTier === '$$' ? 'text-yellow-400' : 'text-red-400'
                          }`}>{model.costTier}</span>
                        </div>
                        <p className="text-xs text-superteam-slate-400 mt-1">{model.speed}</p>
                      </motion.button>
                    );
                  })}
                </div>
              </GlowCard>

              {/* Error */}
              {error && (
                <GlowCard variant="glass" className="p-4 border-red-500/50">
                  <p className="text-red-400 font-mono text-sm">ERROR: {error}</p>
                  <Button variant="outline" size="sm" onClick={handleReset} className="mt-3">
                    retry()
                  </Button>
                </GlowCard>
              )}
            </motion.div>
          )}

          {/* Loading State */}
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-8 py-12"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 mx-auto border-4 border-superteam-purple-500/30 border-t-superteam-purple-500 rounded-full"
              />
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-mono">
                  <GradientText variant="purple">ANALYZING...</GradientText>
                </h3>
                <p className="text-superteam-slate-400 font-mono text-sm">
                  {getSelectedJudges().length} judges scanning your code
                </p>
              </div>
              <div className="flex justify-center gap-2">
                {getSelectedJudges().map((id, i) => (
                  <motion.span
                    key={id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-2xl"
                  >
                    {JUDGES[id].icon}
                  </motion.span>
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
                  <h2 className="text-2xl font-bold font-mono">
                    <GradientText variant="purple">AUDIT_COMPLETE</GradientText>
                  </h2>
                  <p className="text-superteam-slate-400 text-sm font-mono truncate max-w-lg">
                    {currentUrl}
                  </p>
                </div>
                <Button onClick={handleReset} variant="outline" className="border-superteam-purple-500 text-superteam-purple-400">
                  new_scan()
                </Button>
              </div>

              {/* Overall Score */}
              <GlowCard variant="glass" className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <AnimatedScore score={review.overall.score} size="xl" variant="dark" />
                  <div className="flex-1 space-y-4 text-center md:text-left">
                    <h3 className="text-2xl font-bold">{review.overall.verdict}</h3>
                    <p className="text-superteam-slate-400">{review.overall.summary}</p>
                  </div>
                </div>
              </GlowCard>

              {/* Judge Cards */}
              <div className="space-y-4">
                <h3 className="font-mono text-superteam-purple-400">
                  judge_reports[{review.judges.length}]
                </h3>
                {review.judges.map((judge, i) => (
                  <JudgeCardPro key={judge.id} judge={judge} index={i} variant="dark" />
                ))}
              </div>

              {/* Metadata */}
              <div className="text-center text-superteam-slate-500 text-xs font-mono">
                <p>
                  processed_by: {review.metadata.modelUsed?.split('/')[1]} //
                  judges: {review.metadata.judgesUsed.length} //
                  time: {review.metadata.reviewDuration || 'N/A'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-superteam-slate-800/50 bg-superteam-slate-950/80 backdrop-blur-xl mt-16">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="flex items-center justify-between text-superteam-slate-500 text-sm">
            <span className="font-mono">RECTOR-LABS // Candidate A</span>
            <div className="flex items-center gap-4">
              <a href="https://github.com/RECTOR-LABS/earn-auto-reviewer" target="_blank" className="hover:text-superteam-purple-400">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://earn.superteam.fun" target="_blank" className="hover:text-superteam-purple-400">
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
