# CLAUDE.md - Earn Auto-Reviewer Project

**Project**: AI-Powered GitHub Review System for Superteam Earn
**Repository**: https://github.com/RECTOR-LABS/earn-auto-reviewer
**Status**: ✅ SUBMITTED (Awaiting Response)
**Owner**: RECTOR-LABS
**Purpose**: Demo/POC to win Superteam Earn bounty opportunity

---

## Project Overview

**The Mission**: Build a working AI agent that auto-reviews GitHub submissions (PRs/repos) for Superteam Earn bounties, generating scores (0-100) and concise review notes.

**The Strategy**: Don't just propose - ship a working demo that proves we can deliver. Stand out from other applicants with a live, production-ready POC.

**Target Bounty**: https://earn.superteam.fun/listing/add-github-links-to-earn-auto-reviews
**Application Deadline**: December 19, 2025
**Demo URL**: earn-auto-review.rectorspace.com (pending deployment)

---

## Tech Stack

**Frontend**:
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components

**AI/LLM**:
- Vercel AI SDK
- OpenRouter API
- Claude Sonnet 3.5 (or GPT-4)

**APIs**:
- GitHub REST API
- Octokit library

**Deployment**:
- Vercel hosting
- Custom subdomain: earn-auto-review.rectorspace.com

**Future Production Stack** (post-POC):
- BullMQ + Redis (event queue)
- MySQL (data persistence)
- Integration with superteamdao/earn-agent

---

## Project Structure

```
earn-auto-reviewer/
├── app/
│   ├── page.tsx              # Main demo UI
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   └── api/
│       └── review/
│           └── route.ts      # Review API endpoint
│
├── lib/
│   ├── github.ts             # GitHub API integration
│   ├── reviewer.ts           # AI review engine
│   ├── scoring.ts            # Scoring logic (0-100)
│   └── prompts.ts            # LLM system prompts
│
├── components/
│   ├── url-input.tsx         # GitHub URL input form
│   ├── review-display.tsx    # Score + notes display
│   └── loading-state.tsx     # Streaming analysis UI
│
├── types/
│   └── index.ts              # TypeScript type definitions
│
├── public/                   # Static assets
├── .env.local               # Environment variables (not committed)
├── CLAUDE.md                # This file
├── STARTER-PROMPT.md        # Session starter context
└── README.md                # Public documentation
```

---

## Core Features (POC Scope)

### 1. Demo Web UI
- ✅ Simple input: "Paste GitHub URL (PR or repo)"
- ✅ Dropdown with 3-5 pre-loaded real Superteam Earn submissions
- ✅ Real-time analysis with streaming responses
- ✅ Display: Score gauge + formatted review notes + metadata
- ✅ Edge case handling with clear error messages

### 2. AI Review Engine
- ✅ GitHub API integration (fetch PR/repo data)
- ✅ LLM analysis using Vercel AI SDK + OpenRouter
- ✅ Scoring system (0-100):
  - Code quality (40pts): patterns, complexity, best practices
  - Completeness (30pts): requirements met, documentation
  - Testing (20pts): test coverage, test quality
  - Innovation (10pts): creative solutions, efficiency
- ✅ Concise review notes (3-5 actionable points)

### 3. Edge Cases Handled
- ✅ Invalid URLs → Clear error message
- ✅ Private repos → "Cannot access" message
- ✅ 404s → "Not found" message
- ✅ Empty repos → "No code to review"
- ✅ WIP/Draft PRs → Flagged in score
- ✅ Rate limiting → Cached or queued

---

## Scoring System

**Total Score**: 0-100 points

**Breakdown**:
1. **Code Quality** (40 points)
   - Design patterns and architecture
   - Code complexity and readability
   - Best practices adherence
   - Security considerations

2. **Completeness** (30 points)
   - Requirements fulfilled
   - Documentation quality
   - Edge case handling
   - Error handling

3. **Testing** (20 points)
   - Test coverage
   - Test quality and assertions
   - Integration tests
   - E2E tests

4. **Innovation** (10 points)
   - Creative solutions
   - Efficiency improvements
   - Novel approaches
   - Technical sophistication

**Review Notes**: 3-5 actionable bullet points, concise and specific

---

## Environment Variables

Create `.env.local` with:

```bash
OPENROUTER_API_KEY=your_key_here
GITHUB_TOKEN=your_token_here  # Optional, for higher rate limits
```

**Note**: `.env.local` is gitignored and never committed

---

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## API Endpoints

### POST /api/review

**Request**:
```json
{
  "url": "https://github.com/owner/repo/pull/123"
}
```

**Response** (streaming):
```json
{
  "score": 85,
  "breakdown": {
    "codeQuality": 35,
    "completeness": 28,
    "testing": 15,
    "innovation": 7
  },
  "notes": [
    "Excellent error handling with try-catch blocks",
    "Missing unit tests for edge cases",
    "Consider extracting magic numbers to constants",
    "Good use of TypeScript types for type safety"
  ],
  "metadata": {
    "prNumber": 123,
    "author": "username",
    "filesChanged": 12,
    "additions": 234,
    "deletions": 45
  }
}
```

---

## Deployment Checklist

- [x] Environment variables set in Vercel
- [x] Custom domain configured: earn-auto-review.rectorspace.com
- [x] SSL certificate (auto via Vercel)
- [x] Test with 5+ real Earn submissions
- [x] Performance < 15 seconds per review
- [ ] Error tracking setup (post-bounty)
- [ ] Analytics (post-bounty)

---

## Phase Progress

### ✅ Phase 0: Planning
- [x] Read bounty requirements
- [x] Create STARTER-PROMPT.md
- [x] Create CLAUDE.md
- [x] Define architecture

### ✅ Phase 1: Project Setup
- [x] Initialize Next.js 14 project
- [x] Install dependencies (Vercel AI SDK, Octokit, shadcn/ui)
- [x] Setup project structure
- [x] Create .env.local template
- [x] Configure TypeScript + Tailwind
- [x] Created skeleton files for lib/, components/, types/
- [x] Build verified successfully (no TypeScript errors)

### ✅ Phase 2: Core Implementation (COMPLETE!)
- [x] GitHub API integration (lib/github.ts) - Issue #1 ✅
  - URL parser (PR/repo/commit/branch)
  - fetchPullRequest() with Octokit
  - fetchRepository() with Octokit
  - fetchPRFiles() with token optimization
  - Comprehensive error handling
- [x] AI review engine (lib/reviewer.ts) - Skeleton ready ✅
- [x] Scoring system (lib/scoring.ts) - Complete ✅
- [x] API endpoint (/api/review/route.ts) - Issue #2 ✅
  - POST handler with validation
  - GitHub data fetching integration
  - LLM content preparation
  - Error handling (400/403/404/500)
  - Ready for testing with API keys
- [x] Demo UI (app/page.tsx) - Issue #3 ✅
  - Hero section with branding
  - URL input with 5 pre-loaded examples
  - Complete state management
  - API integration and error handling
  - Review display with scores/notes
  - Loading states and responsive design
  - Footer with credits

### ✅ Phase 3: Polish & Deploy (COMPLETE!)
- [x] Test with real Earn submissions - Issue #4 ✅
  - Tested with SuperteamDAO PR and Tesior repository
  - Demo videos recorded as evidence
- [x] Deploy to Vercel - Issue #5 ✅
  - Deployed to production with Vercel CLI
  - Environment variables configured (OpenRouter + GitHub)
  - Custom domain: earn-auto-review.rectorspace.com
  - SSL certificate enabled (HTTPS)
  - Push-to-deploy configured (auto-deploys on push)
  - Site verified live and operational
- [x] Update documentation - Issue #6 ✅
  - Comprehensive README with architecture diagram
  - Edge cases matrix and cost analysis
  - Complete API documentation
  - Production INTEGRATION.md guide
  - Screenshots placeholders ready

### ✅ Phase 4: Submission (COMPLETE! ✅)
- [x] Write proposal document - /proposal page created ✅
- [x] Create demo video script - DEMO-SCRIPT.md created ✅
- [x] Add OpenRouter credits ✅
- [x] Test with real examples - Issue #4 ✅
- [x] Record demo videos - Issue #8 ✅
  - Video 1: SuperteamDAO PR Review (YouTube: h417a4o90Ps)
  - Video 2: Tesior Web Review (YouTube: lFqoYyjXIks)
- [x] Upload videos to YouTube ✅
- [x] Embed videos in /proposal page ✅
- [x] Submit to Superteam Earn ✅ (Dec 15, 2025 - Quote: $2,500 USDC)
- [x] Close Issue #7 (contribute to their repo) - Not needed for path B ✅

---

## Key Decisions & Patterns

### URL Parsing Strategy
- Support PR URLs: `github.com/owner/repo/pull/123`
- Support repo URLs: `github.com/owner/repo`
- Support commit URLs: `github.com/owner/repo/commit/abc123`
- Support branch URLs: `github.com/owner/repo/tree/branch-name`

### Token Optimization
- Don't send full diff for large PRs (>10k lines)
- Summarize file changes instead
- Focus on critical files (src, tests, config)
- Exclude generated files, lockfiles, assets

### Error Handling Hierarchy
1. Invalid URL format → Client-side validation
2. Network errors → Retry with exponential backoff
3. GitHub API errors → Parse and display meaningful message
4. LLM API errors → Fallback to cached or queue
5. Rate limits → Display wait time or queue position

---

## Real Earn Submissions (for testing)

Pre-loaded examples from Superteam Earn:
1. [TBD - Add real submission URLs]
2. [TBD - Add real submission URLs]
3. [TBD - Add real submission URLs]
4. [TBD - Add real submission URLs]
5. [TBD - Add real submission URLs]

**Action**: Research and add 5 real GitHub submission URLs from earn.superteam.fun

---

## Known Issues / TODOs

**Current**:
- [ ] None yet (project not started)

**Future Considerations**:
- [ ] Rate limiting for demo (prevent abuse)
- [ ] Caching layer (Redis) for repeated reviews
- [ ] Webhook integration for real-time reviews
- [ ] Database persistence for review history
- [ ] User authentication (if needed for production)

---

## Integration Plan (Production)

**For production integration with superteamdao/earn**:

1. **Event Flow**:
   - User submits bounty with GitHub URL
   - Earn platform emits event to BullMQ
   - Worker picks up job
   - Calls our review API
   - Stores result in MySQL
   - Updates Earn platform status

2. **API Contract**:
   - Endpoint: `POST /api/review`
   - Auth: API key or JWT
   - Timeout: 30 seconds max
   - Retry: 3 attempts with exponential backoff

3. **Database Schema** (future):
   ```sql
   CREATE TABLE reviews (
     id INT PRIMARY KEY AUTO_INCREMENT,
     submission_id VARCHAR(255) NOT NULL,
     github_url VARCHAR(500) NOT NULL,
     score INT NOT NULL,
     breakdown JSON,
     notes JSON,
     metadata JSON,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     INDEX idx_submission (submission_id)
   );
   ```

---

## Success Metrics

**POC Phase**:
- ✅ Demo works flawlessly with real submissions
- ✅ Edge cases handled gracefully
- ✅ Response time < 15 seconds
- ✅ Score feels accurate (manual validation)
- ✅ Code is production-ready quality
- ✅ Deployment is live and accessible
- ✅ Documentation is comprehensive
- ✅ Proposal is compelling and unique

**Production Phase** (if we win):
- Review accuracy > 85% (vs manual review)
- Response time < 10 seconds (p95)
- Uptime > 99.5%
- Cost per review < $0.10 (LLM API)
- Support 100+ reviews/day

---

## Resources

- **Bounty Listing**: https://earn.superteam.fun/listing/add-github-links-to-earn-auto-reviews
- **Their Repo**: https://github.com/superteamdao/earn/
- **Our Repo**: https://github.com/RECTOR-LABS/earn-auto-reviewer
- **Contact**: Telegram @JayeshVP24
- **OpenRouter Docs**: https://openrouter.ai/docs
- **Vercel AI SDK**: https://sdk.vercel.ai/docs
- **Octokit Docs**: https://octokit.github.io/rest.js/

---

## Notes for CIPHER

**Context for New Sessions**:
- Always read STARTER-PROMPT.md for full context
- Check Phase Progress above for current status
- Update this file after significant changes
- Keep TODO list current
- Test thoroughly - this is a demo to win business

**Code Style**:
- Follow global CLAUDE.md standards (2-space indentation)
- Use TypeScript strict mode
- Prefer functional components (React)
- Use Tailwind utility classes (no custom CSS unless needed)
- shadcn/ui for all UI components

**Git Workflow**:
- Work on `dev` branch
- Descriptive commits
- Push to GitHub after each major feature
- Will create PR to main when POC is complete

**Priority**: Ship working demo fast, then polish. This is about proving capability, not perfection.

---

**Last Updated**: 2025-12-15
**Status**: ✅ SUBMITTED - Awaiting Response

**Submission Details**:
- 📅 Submitted: December 15, 2025
- 💰 Quote: $2,500 USDC
- 🔗 Demo: https://earn-auto-review.rectorspace.com
- 📺 Videos: YouTube (h417a4o90Ps, lFqoYyjXIks)
- 📋 Proposal: /proposal page

**All Phases Complete**:
- ✅ Demo videos recorded and uploaded to YouTube
- ✅ Proposal page live at /proposal
- ✅ Testing with real submissions verified
- ✅ Security fixes applied (npm audit, Zod validation)
- ✅ Code quality improvements (type safety, unused imports)
- ✅ LICENSE file added (MIT)
- ✅ Application submitted to Superteam Earn

**Next**: Wait for response from Superteam. InshaAllah khayr! 🤲
