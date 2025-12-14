'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Check,
  CheckCircle,
  ChevronRight,
  Clock,
  Code2,
  Database,
  ExternalLink,
  FileCode,
  Github,
  Layers,
  Play,
  Plug,
  RefreshCw,
  Server,
  Sparkles,
  Target,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const DEMO_VIDEOS = [
  {
    id: 'video1',
    title: 'Full Review Demo',
    description: 'Watch our 8-judge AI system analyze a real GitHub repository',
    youtubeId: 'h417a4o90Ps',
    url: 'https://www.youtube.com/watch?v=h417a4o90Ps',
  },
  {
    id: 'video2',
    title: 'Full Report Feature',
    description: 'Deep dive into detailed analysis, file breakdown, and code suggestions',
    youtubeId: 'lFqoYyjXIks',
    url: 'https://www.youtube.com/watch?v=lFqoYyjXIks',
  },
];

const INTEGRATION_STEPS = [
  {
    phase: 'Phase 1',
    title: 'Queue Integration',
    duration: 'Week 1',
    items: [
      'Fork and setup earn-agent repository',
      'Configure BullMQ + Redis queue system',
      'Create review job processor worker',
      'Setup event triggers for submissions',
    ],
  },
  {
    phase: 'Phase 2',
    title: 'Database & API',
    duration: 'Week 2',
    items: [
      'Implement MySQL schema with Prisma',
      'Store reviews with submission references',
      'Add cron jobs for batch processing',
      'Create sponsor dashboard endpoints',
    ],
  },
  {
    phase: 'Phase 3',
    title: 'Testing & Polish',
    duration: 'Week 3',
    items: [
      'Test with 50+ real submissions',
      'Score calibration and validation',
      'Performance optimization (<10s)',
      'Error monitoring with Sentry',
    ],
  },
];

const TECH_STACK = [
  { name: 'Next.js 14', category: 'Frontend', match: true },
  { name: 'TypeScript', category: 'Language', match: true },
  { name: 'Vercel AI SDK', category: 'AI', match: true },
  { name: 'OpenRouter', category: 'LLM', match: true },
  { name: 'Octokit', category: 'GitHub API', match: true },
  { name: 'MySQL', category: 'Database', match: true },
  { name: 'BullMQ', category: 'Queue', match: true },
  { name: 'Redis', category: 'Cache', match: true },
];

export default function ProposalPage() {
  const [activeVideo, setActiveVideo] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-superteam-purple-50/30 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-superteam-slate-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-superteam-purple to-superteam-purple-dark flex items-center justify-center shadow-lg shadow-superteam-purple/25">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-superteam-slate-900">Earn Auto-Reviewer</h1>
                <p className="text-xs text-superteam-slate-500">Proposal by RECTOR-LABS</p>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/" className="text-sm text-superteam-slate-600 hover:text-superteam-purple">
                Try Demo
              </Link>
              <a
                href="https://github.com/RECTOR-LABS/earn-auto-reviewer"
                target="_blank"
                className="flex items-center gap-1 text-sm text-superteam-slate-600 hover:text-superteam-purple"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <Badge className="bg-superteam-purple/10 text-superteam-purple border-superteam-purple/20 mb-4">
            Bounty Proposal - December 2025
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-superteam-slate-900 mb-4">
            AI-Powered GitHub Reviews
            <br />
            <span className="bg-gradient-to-r from-superteam-purple to-superteam-purple-dark bg-clip-text text-transparent">
              for Superteam Earn
            </span>
          </h1>
          <p className="text-xl text-superteam-slate-600 max-w-2xl mx-auto mb-4">
            We didn't just propose an idea — we built a working demo. 8 AI judges, detailed analysis, and production-ready code.
          </p>
          <p className="text-2xl md:text-3xl font-bold text-superteam-slate-900 mb-8">
            <span className="bg-gradient-to-r from-superteam-purple to-superteam-purple-dark bg-clip-text text-transparent">
              "I don't submit words. I submit works."
            </span>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/">
              <Button className="bg-superteam-purple hover:bg-superteam-purple-dark">
                <Play className="w-4 h-4 mr-2" />
                Try Live Demo
              </Button>
            </Link>
            <a href="https://github.com/RECTOR-LABS/earn-auto-reviewer" target="_blank">
              <Button variant="outline">
                <Github className="w-4 h-4 mr-2" />
                View Source Code
              </Button>
            </a>
          </div>
        </motion.section>

        {/* Key Differentiator */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-superteam-slate-900 mb-2">
                  We Shipped, Not Just Proposed
                </h2>
                <p className="text-superteam-slate-600 mb-4">
                  Most applicants will submit ideas and plans. We built a <strong>working demo</strong> you can test right now at{' '}
                  <a href="https://earn-auto-review.rectorspace.com" className="text-superteam-purple underline">
                    earn-auto-review.rectorspace.com
                  </a>
                </p>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="outline" className="bg-white">
                    <Check className="w-3 h-3 mr-1" /> Live Demo
                  </Badge>
                  <Badge variant="outline" className="bg-white">
                    <Check className="w-3 h-3 mr-1" /> 8 AI Judges
                  </Badge>
                  <Badge variant="outline" className="bg-white">
                    <Check className="w-3 h-3 mr-1" /> Full Report
                  </Badge>
                  <Badge variant="outline" className="bg-white">
                    <Check className="w-3 h-3 mr-1" /> API Ready
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Demo Videos */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-superteam-slate-900 mb-2">See It In Action</h2>
            <p className="text-superteam-slate-600">Watch our AI review system analyze real GitHub submissions</p>
          </div>

          <div className="bg-white rounded-2xl border border-superteam-slate-200 shadow-lg overflow-hidden">
            {/* Video Tabs */}
            <div className="flex border-b border-superteam-slate-200">
              {DEMO_VIDEOS.map((video, i) => (
                <button
                  key={video.id}
                  onClick={() => setActiveVideo(i)}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    activeVideo === i
                      ? 'bg-superteam-purple-50 text-superteam-purple border-b-2 border-superteam-purple'
                      : 'text-superteam-slate-600 hover:bg-superteam-slate-50'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <Play className="w-4 h-4" />
                    {video.title}
                  </span>
                </button>
              ))}
            </div>

            {/* Video Embed */}
            <div className="aspect-video bg-superteam-slate-900">
              <iframe
                src={`https://www.youtube.com/embed/${DEMO_VIDEOS[activeVideo].youtubeId}`}
                title={DEMO_VIDEOS[activeVideo].title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>

            {/* Video Description */}
            <div className="p-4 bg-superteam-slate-50">
              <p className="text-sm text-superteam-slate-600">{DEMO_VIDEOS[activeVideo].description}</p>
            </div>
          </div>
        </motion.section>

        {/* What We Built */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-superteam-slate-900 mb-2">What We Built</h2>
            <p className="text-superteam-slate-600">A complete AI review system with 8 expert judges</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-superteam-slate-200 p-6">
              <div className="w-12 h-12 rounded-xl bg-superteam-purple-100 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-superteam-purple" />
              </div>
              <h3 className="font-semibold text-superteam-slate-900 mb-2">8-Judge Panel System</h3>
              <p className="text-sm text-superteam-slate-600 mb-3">
                Each submission is reviewed by 8 AI experts with different specializations
              </p>
              <div className="flex flex-wrap gap-2">
                {['Security', 'Performance', 'Architecture', 'Testing'].map((judge) => (
                  <Badge key={judge} variant="outline" className="text-xs">
                    {judge}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-superteam-slate-200 p-6">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                <FileCode className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-superteam-slate-900 mb-2">Full Report Analysis</h3>
              <p className="text-sm text-superteam-slate-600 mb-3">
                Detailed breakdown with actionable recommendations and code suggestions
              </p>
              <div className="flex flex-wrap gap-2">
                {['File Breakdown', 'Recommendations', 'Code Snippets'].map((item) => (
                  <Badge key={item} variant="outline" className="text-xs">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-superteam-slate-200 p-6">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-superteam-slate-900 mb-2">Smart Scoring (0-100)</h3>
              <p className="text-sm text-superteam-slate-600 mb-3">
                Weighted scoring across code quality, completeness, testing, and innovation
              </p>
              <div className="flex flex-wrap gap-2">
                {['Quality 40pts', 'Complete 30pts', 'Testing 20pts', 'Innovation 10pts'].map((item) => (
                  <Badge key={item} variant="outline" className="text-xs">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-superteam-slate-200 p-6">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-superteam-slate-900 mb-2">Production Ready</h3>
              <p className="text-sm text-superteam-slate-600 mb-3">
                Edge cases handled, token optimization, multi-model support
              </p>
              <div className="flex flex-wrap gap-2">
                {['Edge Cases', 'Rate Limits', 'Large PRs', 'Private Repos'].map((item) => (
                  <Badge key={item} variant="outline" className="text-xs">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Tech Stack Match */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-superteam-slate-900 mb-2">Tech Stack Alignment</h2>
            <p className="text-superteam-slate-600">Our stack matches exactly what you're looking for</p>
          </div>

          <div className="bg-white rounded-2xl border border-superteam-slate-200 p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {TECH_STACK.map((tech) => (
                <div
                  key={tech.name}
                  className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200"
                >
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-superteam-slate-900 text-sm">{tech.name}</p>
                    <p className="text-xs text-superteam-slate-500">{tech.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Integration Architecture */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-superteam-slate-900 mb-2">Integration Architecture</h2>
            <p className="text-superteam-slate-600">How we'll integrate with earn-agent and your infrastructure</p>
          </div>

          <div className="bg-superteam-slate-900 rounded-2xl p-8 text-white overflow-x-auto">
            <pre className="text-sm font-mono whitespace-pre">
{`┌─────────────────────────────────────────────────────────────────────────────┐
│                           EARN-AGENT INTEGRATION                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│   │   Sponsor    │    │    Earn      │    │   GitHub     │                  │
│   │  Dashboard   │◄───│   Frontend   │───►│     API      │                  │
│   └──────────────┘    └──────────────┘    └──────────────┘                  │
│          ▲                   │                    │                         │
│          │                   ▼                    ▼                         │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│   │    MySQL     │◄───│  earn-agent  │◄───│   Review     │                  │
│   │   Database   │    │   Service    │    │    API       │                  │
│   └──────────────┘    └──────────────┘    └──────────────┘                  │
│          ▲                   │                    │                         │
│          │                   ▼                    ▼                         │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│   │    Redis     │◄───│   BullMQ     │───►│  OpenRouter  │                  │
│   │    Cache     │    │    Queue     │    │   (LLM)      │                  │
│   └──────────────┘    └──────────────┘    └──────────────┘                  │
│                              │                                              │
│                              ▼                                              │
│                       ┌──────────────┐                                      │
│                       │  Cron Jobs   │                                      │
│                       │  (Batch)     │                                      │
│                       └──────────────┘                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘`}
            </pre>
          </div>

          {/* Integration Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-white rounded-xl border border-superteam-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-6 h-6 text-superteam-purple" />
                <h3 className="font-semibold text-superteam-slate-900">MySQL Schema</h3>
              </div>
              <pre className="text-xs bg-superteam-slate-50 p-4 rounded-lg overflow-x-auto">
{`CREATE TABLE github_reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  submission_id VARCHAR(255) NOT NULL,
  github_url VARCHAR(500) NOT NULL,
  review_type ENUM('pr', 'repo'),
  overall_score INT NOT NULL,
  grade VARCHAR(2),
  verdict TEXT,
  judges JSON,
  full_report JSON,
  model_used VARCHAR(100),
  review_duration VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_submission (submission_id),
  INDEX idx_score (overall_score)
);`}
              </pre>
            </div>

            <div className="bg-white rounded-xl border border-superteam-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Server className="w-6 h-6 text-superteam-purple" />
                <h3 className="font-semibold text-superteam-slate-900">BullMQ Worker</h3>
              </div>
              <pre className="text-xs bg-superteam-slate-50 p-4 rounded-lg overflow-x-auto">
{`// review.worker.ts
const reviewWorker = new Worker(
  'github-reviews',
  async (job) => {
    const { submissionId, githubUrl } = job.data;

    // Call our review API
    const review = await generateReview({
      url: githubUrl,
      judges: ['security', 'performance', ...],
      model: 'claude-haiku-4.5'
    });

    // Store in MySQL
    await db.githubReviews.create({
      submissionId,
      ...review
    });

    return review;
  },
  { connection: redis }
);`}
              </pre>
            </div>

            <div className="bg-white rounded-xl border border-superteam-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-superteam-purple" />
                <h3 className="font-semibold text-superteam-slate-900">Cron Jobs</h3>
              </div>
              <pre className="text-xs bg-superteam-slate-50 p-4 rounded-lg overflow-x-auto">
{`// cron/batch-review.ts
// Run every hour - process pending submissions
cron.schedule('0 * * * *', async () => {
  const pending = await db.submissions
    .findMany({
      where: { reviewStatus: 'pending' },
      take: 50
    });

  for (const sub of pending) {
    await reviewQueue.add('review', {
      submissionId: sub.id,
      githubUrl: sub.githubUrl
    });
  }
});`}
              </pre>
            </div>

            <div className="bg-white rounded-xl border border-superteam-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Plug className="w-6 h-6 text-superteam-purple" />
                <h3 className="font-semibold text-superteam-slate-900">Event Integration</h3>
              </div>
              <pre className="text-xs bg-superteam-slate-50 p-4 rounded-lg overflow-x-auto">
{`// events/submission.handler.ts
export async function onSubmissionCreated(
  submission: Submission
) {
  // Check if GitHub URL present
  if (!submission.githubUrl) return;

  // Add to review queue
  await reviewQueue.add('review', {
    submissionId: submission.id,
    githubUrl: submission.githubUrl,
    priority: submission.isPriority ? 1 : 5
  });

  // Emit event for dashboard
  emit('review:queued', submission.id);
}`}
              </pre>
            </div>
          </div>
        </motion.section>

        {/* Integration Roadmap */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-superteam-slate-900 mb-2">Integration Roadmap</h2>
            <p className="text-superteam-slate-600">3-week plan to full production integration</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {INTEGRATION_STEPS.map((step, i) => (
              <div key={step.phase} className="bg-white rounded-xl border border-superteam-slate-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-superteam-purple-100 flex items-center justify-center text-superteam-purple font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-xs text-superteam-slate-500">{step.phase}</p>
                    <h3 className="font-semibold text-superteam-slate-900">{step.title}</h3>
                  </div>
                </div>
                <Badge className="bg-superteam-purple/10 text-superteam-purple mb-4">{step.duration}</Badge>
                <ul className="space-y-2">
                  {step.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-superteam-slate-600">
                      <ChevronRight className="w-4 h-4 text-superteam-purple flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.section>

        {/* API Reference */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-superteam-slate-900 mb-2">API Reference</h2>
            <p className="text-superteam-slate-600">Production-ready API for earn-agent integration</p>
          </div>

          <div className="bg-white rounded-2xl border border-superteam-slate-200 overflow-hidden">
            <div className="bg-superteam-slate-900 px-6 py-4">
              <code className="text-green-400 font-mono">POST /api/review</code>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-superteam-slate-900 mb-3">Request</h4>
                <pre className="text-xs bg-superteam-slate-50 p-4 rounded-lg overflow-x-auto">
{`{
  "url": "https://github.com/owner/repo/pull/123",
  "preset": "comprehensive",
  "model": "anthropic/claude-haiku-4.5"
}`}
                </pre>
              </div>
              <div>
                <h4 className="font-semibold text-superteam-slate-900 mb-3">Response</h4>
                <pre className="text-xs bg-superteam-slate-50 p-4 rounded-lg overflow-x-auto">
{`{
  "overall": {
    "score": 85,
    "grade": "B+",
    "verdict": "Solid implementation",
    "summary": "..."
  },
  "judges": [...],
  "fullReport": {
    "detailedAnalysis": [...],
    "fileBreakdown": [...],
    "recommendations": [...],
    "codeSnippets": [...]
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Why Choose Us */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-superteam-slate-900 mb-2">Why Choose Us</h2>
            <p className="text-superteam-slate-600">What sets our proposal apart</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: Zap,
                title: 'We Execute Fast',
                desc: 'Built this entire demo in under a week. Production-quality code from day one.',
              },
              {
                icon: Target,
                title: 'We Understand the Problem',
                desc: 'Analyzed Superteam Earn\'s submission flow. Built for actual use cases.',
              },
              {
                icon: Layers,
                title: 'We Think Long-Term',
                desc: 'Production integration guide already written. Scalability considered from start.',
              },
              {
                icon: Code2,
                title: 'We\'re Technical',
                desc: 'Senior-level engineering. Clean architecture. Comprehensive error handling.',
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 p-6 bg-white rounded-xl border border-superteam-slate-200">
                <div className="w-12 h-12 rounded-xl bg-superteam-purple-100 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-superteam-purple" />
                </div>
                <div>
                  <h3 className="font-semibold text-superteam-slate-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-superteam-slate-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-superteam-purple to-superteam-purple-dark rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Ready to Build the Future of Bounty Reviews</h2>
            <p className="text-white/80 mb-6 max-w-xl mx-auto">
              We didn't just apply — we shipped. Try our demo, review our code, and let's discuss how we can integrate this into Superteam Earn.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/">
                <Button className="bg-white text-superteam-purple hover:bg-white/90">
                  <Play className="w-4 h-4 mr-2" />
                  Try Live Demo
                </Button>
              </Link>
              <a href="https://github.com/RECTOR-LABS/earn-auto-reviewer" target="_blank">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <Github className="w-4 h-4 mr-2" />
                  View Repository
                </Button>
              </a>
            </div>
          </div>

          <div className="mt-8 text-sm text-superteam-slate-500">
            <p>Submitted by <strong>RECTOR-LABS</strong> • December 2025</p>
            <p className="mt-2">
              <a href="https://github.com/RECTOR-LABS" className="text-superteam-purple hover:underline">GitHub</a>
              {' • '}
              <a href="mailto:contact@rectorspace.com" className="text-superteam-purple hover:underline">Contact</a>
            </p>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-superteam-slate-200 mt-16">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          <div className="flex items-center justify-between text-sm text-superteam-slate-500">
            <span>Built by RECTOR-LABS for Superteam Earn</span>
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
