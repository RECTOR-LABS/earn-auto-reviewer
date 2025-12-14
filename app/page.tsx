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
  Link,
  Search,
  Bot,
  BarChart3,
  Shield,
  Gauge,
  Code2,
  TestTube,
  Lightbulb,
  Database,
  Target,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
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

// Example reviews data for the showcase
const EXAMPLE_REVIEWS = [
  {
    id: 'solana',
    label: 'Solana Swap',
    type: 'PR',
    score: 85,
    url: 'github.com/example/solana-token-swap/pull/42',
    verdict: 'Excellent Submission',
    stars: 4,
    breakdown: { codeQuality: 34, completeness: 27, testing: 16, innovation: 8 },
    judges: [
      { icon: '🏗️', name: 'Code Architect', score: 88, note: 'Excellent Anchor patterns' },
      { icon: '🔒', name: 'Security Sentinel', score: 82, note: 'Proper signer validation' },
      { icon: '⚡', name: 'Perf Optimizer', score: 91, note: 'Efficient PDA derivation' },
      { icon: '🧪', name: 'Testing Champion', score: 78, note: 'Good coverage, add fuzz' },
    ],
    notes: [
      { type: 'success', text: 'Clean Anchor program with proper account validation' },
      { type: 'success', text: 'Efficient use of PDAs and seeds' },
      { type: 'success', text: 'Good error handling with custom error enum' },
      { type: 'warning', text: 'Consider adding fuzz tests for edge cases' },
      { type: 'info', text: 'Could add events for off-chain indexing' },
    ],
  },
  {
    id: 'react',
    label: 'React Dashboard',
    type: 'Repo',
    score: 72,
    url: 'github.com/example/defi-dashboard',
    verdict: 'Good Submission',
    stars: 3.5,
    breakdown: { codeQuality: 28, completeness: 25, testing: 12, innovation: 7 },
    judges: [
      { icon: '🏗️', name: 'Code Architect', score: 75, note: 'Good component structure' },
      { icon: '🎨', name: 'UX/DX Advocate', score: 80, note: 'Clean UI, good a11y' },
      { icon: '🧪', name: 'Testing Champion', score: 58, note: 'Missing unit tests' },
      { icon: '📚', name: 'Docs Guru', score: 72, note: 'README needs examples' },
    ],
    notes: [
      { type: 'success', text: 'Well-organized React component hierarchy' },
      { type: 'success', text: 'Good TypeScript usage with proper interfaces' },
      { type: 'warning', text: 'Add unit tests - currently 0% coverage' },
      { type: 'warning', text: 'README lacks setup instructions and examples' },
      { type: 'info', text: 'Consider React Query for data fetching' },
    ],
  },
  {
    id: 'python',
    label: 'Python CLI',
    type: 'PR',
    score: 58,
    url: 'github.com/example/wallet-tracker/pull/17',
    verdict: 'Needs Improvement',
    stars: 2.5,
    breakdown: { codeQuality: 20, completeness: 20, testing: 10, innovation: 8 },
    judges: [
      { icon: '🔒', name: 'Security Sentinel', score: 45, note: 'API keys in source code!' },
      { icon: '🏗️', name: 'Code Architect', score: 62, note: 'Needs refactoring' },
      { icon: '🧪', name: 'Testing Champion', score: 52, note: 'No tests provided' },
      { icon: '📚', name: 'Docs Guru', score: 68, note: 'Basic docs present' },
    ],
    notes: [
      { type: 'success', text: 'Interesting concept for wallet tracking' },
      { type: 'error', text: 'CRITICAL: API keys hardcoded in config.py' },
      { type: 'warning', text: 'Functions too long - extract into smaller units' },
      { type: 'warning', text: 'No tests - add pytest coverage' },
      { type: 'warning', text: 'Add .env support for sensitive credentials' },
    ],
  },
];

// Judge panel data
const JUDGE_PANEL = [
  { id: 'architecture', icon: '🏗️', name: 'Code Architect', focus: 'Structure & patterns' },
  { id: 'security', icon: '🔒', name: 'Security Sentinel', focus: 'Vulnerabilities & auth' },
  { id: 'performance', icon: '⚡', name: 'Perf Optimizer', focus: 'Speed & efficiency' },
  { id: 'dx', icon: '🎨', name: 'UX/DX Advocate', focus: 'Developer experience' },
  { id: 'testing', icon: '🧪', name: 'Testing Champion', focus: 'Coverage & quality' },
  { id: 'documentation', icon: '📚', name: 'Docs Guru', focus: 'Documentation' },
  { id: 'code-quality', icon: '💡', name: 'Innovation Scout', focus: 'Creative solutions' },
  { id: 'devops', icon: '🔗', name: 'Integration Expert', focus: 'CI/CD & deploy' },
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
  const [selectedExample, setSelectedExample] = useState(0);
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
  const currentExample = EXAMPLE_REVIEWS[selectedExample];

  const renderStars = (count: number) => {
    const full = Math.floor(count);
    const half = count % 1 >= 0.5;
    return (
      <span className="text-yellow-400">
        {'★'.repeat(full)}{half ? '½' : ''}{'☆'.repeat(5 - full - (half ? 1 : 0))}
      </span>
    );
  };

  const getNoteIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Lightbulb className="w-4 h-4 text-blue-500" />;
    }
  };

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

              {/* Compact Settings - Centered, No Titles */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center gap-4"
              >
                {/* Review Panel - Compact Pills (Centered, No Title) */}
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-superteam-slate-400" />
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
                      <div className="flex flex-wrap gap-2 justify-center">
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

                {/* Model - Compact Dropdown (Centered, No Title) */}
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-superteam-slate-400" />
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
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white rounded-xl shadow-xl border border-superteam-slate-200 overflow-hidden z-50"
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

              {/* ═══════════════════════════════════════════════════════════════ */}
              {/* HOW IT WORKS SECTION */}
              {/* ═══════════════════════════════════════════════════════════════ */}
              <motion.section
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="pt-20"
              >
                <div className="text-center mb-10">
                  <h3 className="text-2xl font-bold text-superteam-slate-900 mb-2">How It Works</h3>
                  <p className="text-superteam-slate-500">From URL to expert review in 5 steps</p>
                </div>

                {/* 5 Step Flow */}
                <div className="flex flex-wrap justify-center items-center gap-4 md:gap-2">
                  {[
                    { icon: Link, label: 'Paste URL', desc: 'Any GitHub PR or repo' },
                    { icon: Search, label: 'Fetch Code', desc: 'Files, diff, metadata' },
                    { icon: Bot, label: 'AI Parse', desc: 'Smart token optimization' },
                    { icon: Users, label: 'Multi-Judge', desc: '8 experts analyze' },
                    { icon: BarChart3, label: 'Score & Report', desc: '0-100 with notes' },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                        className="flex flex-col items-center text-center w-24 md:w-28"
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-superteam-purple-100 to-superteam-purple-50 flex items-center justify-center mb-2">
                          <step.icon className="w-6 h-6 text-superteam-purple" />
                        </div>
                        <span className="text-sm font-medium text-superteam-slate-900">{step.label}</span>
                        <span className="text-xs text-superteam-slate-500">{step.desc}</span>
                      </motion.div>
                      {i < 4 && (
                        <ArrowRight className="w-5 h-5 text-superteam-slate-300 mx-1 hidden md:block" />
                      )}
                    </div>
                  ))}
                </div>
              </motion.section>

              {/* ═══════════════════════════════════════════════════════════════ */}
              {/* EXAMPLE REVIEWS SECTION */}
              {/* ═══════════════════════════════════════════════════════════════ */}
              <motion.section
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="pt-16"
              >
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-superteam-slate-900 mb-2">Example Reviews</h3>
                  <p className="text-superteam-slate-500">See what our AI judges produce</p>
                </div>

                {/* Example Tabs */}
                <div className="flex justify-center gap-2 mb-6">
                  {EXAMPLE_REVIEWS.map((ex, i) => (
                    <button
                      key={ex.id}
                      onClick={() => setSelectedExample(i)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedExample === i
                          ? 'bg-superteam-purple text-white shadow-md'
                          : 'bg-superteam-slate-100 text-superteam-slate-600 hover:bg-superteam-slate-200'
                      }`}
                    >
                      {ex.label}
                      <span className={`ml-2 ${selectedExample === i ? 'text-white/70' : 'text-superteam-slate-400'}`}>
                        {ex.type} · {ex.score}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Example Card */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentExample.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white rounded-2xl border border-superteam-slate-200 shadow-lg overflow-hidden"
                  >
                    {/* URL Bar */}
                    <div className="bg-superteam-slate-50 px-4 py-3 border-b border-superteam-slate-200 flex items-center gap-2">
                      <Link className="w-4 h-4 text-superteam-slate-400" />
                      <span className="text-sm text-superteam-slate-600 font-mono">{currentExample.url}</span>
                      <Badge variant="outline" className="ml-auto text-xs">{currentExample.type}</Badge>
                    </div>

                    <div className="p-6">
                      {/* Score Section */}
                      <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                        <div className="relative">
                          <div className={`w-28 h-28 rounded-full flex items-center justify-center text-4xl font-bold ${
                            currentExample.score >= 80 ? 'bg-green-100 text-green-600' :
                            currentExample.score >= 60 ? 'bg-yellow-100 text-yellow-600' :
                            'bg-red-100 text-red-600'
                          }`}>
                            {currentExample.score}
                          </div>
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 rounded-full text-xs text-superteam-slate-500 border">
                            /100
                          </div>
                        </div>
                        <div className="text-center md:text-left">
                          <h4 className="text-xl font-bold text-superteam-slate-900">{currentExample.verdict}</h4>
                          <div className="text-lg mt-1">{renderStars(currentExample.stars)}</div>
                        </div>
                      </div>

                      {/* Breakdown Bars */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                        {[
                          { label: 'Code Quality', value: currentExample.breakdown.codeQuality, max: 40 },
                          { label: 'Completeness', value: currentExample.breakdown.completeness, max: 30 },
                          { label: 'Testing', value: currentExample.breakdown.testing, max: 20 },
                          { label: 'Innovation', value: currentExample.breakdown.innovation, max: 10 },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center gap-3">
                            <span className="text-sm text-superteam-slate-600 w-28">{item.label}</span>
                            <div className="flex-1 h-2 bg-superteam-slate-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(item.value / item.max) * 100}%` }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="h-full bg-gradient-to-r from-superteam-purple to-superteam-purple-dark rounded-full"
                              />
                            </div>
                            <span className="text-sm font-medium text-superteam-slate-700 w-12 text-right">
                              {item.value}/{item.max}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Judge Verdicts */}
                      <div className="mb-6">
                        <h5 className="text-sm font-semibold text-superteam-slate-700 mb-3 flex items-center gap-2">
                          <Users className="w-4 h-4" /> Top Verdicts
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {currentExample.judges.map((judge, i) => (
                            <div key={i} className="flex items-center gap-3 bg-superteam-slate-50 rounded-lg px-3 py-2">
                              <span className="text-lg">{judge.icon}</span>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium text-superteam-slate-700">{judge.name}</span>
                                <p className="text-xs text-superteam-slate-500 truncate">{judge.note}</p>
                              </div>
                              <span className={`text-sm font-bold ${
                                judge.score >= 80 ? 'text-green-600' :
                                judge.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                              }`}>{judge.score}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Review Notes */}
                      <div>
                        <h5 className="text-sm font-semibold text-superteam-slate-700 mb-3">Review Summary</h5>
                        <div className="space-y-2">
                          {currentExample.notes.map((note, i) => (
                            <div key={i} className="flex items-start gap-2">
                              {getNoteIcon(note.type)}
                              <span className={`text-sm ${
                                note.type === 'error' ? 'text-red-700 font-medium' : 'text-superteam-slate-600'
                              }`}>{note.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </motion.section>

              {/* ═══════════════════════════════════════════════════════════════ */}
              {/* 8-JUDGE PANEL SECTION */}
              {/* ═══════════════════════════════════════════════════════════════ */}
              <motion.section
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="pt-16"
              >
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-superteam-slate-900 mb-2">The 8-Judge Panel</h3>
                  <p className="text-superteam-slate-500">Each expert focuses on what they know best</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {JUDGE_PANEL.map((judge, i) => (
                    <motion.div
                      key={judge.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 + i * 0.05 }}
                      className="bg-white rounded-xl border border-superteam-slate-200 p-4 text-center hover:shadow-md hover:border-superteam-purple/30 transition-all"
                    >
                      <span className="text-2xl">{judge.icon}</span>
                      <h4 className="text-sm font-semibold text-superteam-slate-900 mt-2">{judge.name}</h4>
                      <p className="text-xs text-superteam-slate-500 mt-1">{judge.focus}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* ═══════════════════════════════════════════════════════════════ */}
              {/* SCORING METHODOLOGY SECTION */}
              {/* ═══════════════════════════════════════════════════════════════ */}
              <motion.section
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="pt-16"
              >
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-superteam-slate-900 mb-2">Scoring Methodology</h3>
                  <p className="text-superteam-slate-500">Weighted evaluation across 4 dimensions</p>
                </div>

                <div className="bg-white rounded-2xl border border-superteam-slate-200 p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { icon: Code2, label: 'Code Quality', points: 40, color: 'from-purple-500 to-indigo-500' },
                      { icon: Check, label: 'Completeness', points: 30, color: 'from-blue-500 to-cyan-500' },
                      { icon: TestTube, label: 'Testing', points: 20, color: 'from-green-500 to-emerald-500' },
                      { icon: Lightbulb, label: 'Innovation', points: 10, color: 'from-orange-500 to-yellow-500' },
                    ].map((item, i) => (
                      <div key={i} className="text-center">
                        <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3`}>
                          <item.icon className="w-8 h-8 text-white" />
                        </div>
                        <h4 className="font-semibold text-superteam-slate-900">{item.label}</h4>
                        <p className="text-2xl font-bold text-superteam-purple mt-1">{item.points}<span className="text-sm text-superteam-slate-400">pts</span></p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.section>

              {/* ═══════════════════════════════════════════════════════════════ */}
              {/* SMART FEATURES SECTION */}
              {/* ═══════════════════════════════════════════════════════════════ */}
              <motion.section
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="pt-16 pb-8"
              >
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-superteam-slate-900 mb-2">Smart Features</h3>
                  <p className="text-superteam-slate-500">Built for production-grade reliability</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { icon: Database, title: 'Smart Caching', desc: 'Results cached with commit hash validation - instant re-reviews for unchanged code' },
                    { icon: Target, title: 'Token Optimization', desc: 'Intelligent file filtering for large PRs - focus on critical code, skip binaries' },
                    { icon: RefreshCw, title: 'Multi-Model Support', desc: 'Switch between AI models based on cost/quality tradeoffs via OpenRouter' },
                  ].map((feature, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.1 + i * 0.1 }}
                      className="bg-white rounded-xl border border-superteam-slate-200 p-5 hover:shadow-md transition-all"
                    >
                      <feature.icon className="w-8 h-8 text-superteam-purple mb-3" />
                      <h4 className="font-semibold text-superteam-slate-900 mb-1">{feature.title}</h4>
                      <p className="text-sm text-superteam-slate-500">{feature.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
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
