# Earn Auto-Reviewer - Starter Prompt for New Session

## Quick Context

We're building an **AI-powered GitHub review system** for Superteam Earn bounty submissions. This is a demo/POC to land a bounty opportunity and stand out from other applicants.

**The Strategy**: Don't just propose - ship a working demo that proves we can deliver.

**Repository**: https://github.com/RECTOR-LABS/earn-auto-reviewer
**Working Directory**: ~/local-dev/earn-auto-reviewer (currently on `dev` branch)

---

## The Opportunity

**Bounty**: https://earn.superteam.fun/listing/add-github-links-to-earn-auto-reviews
**Client**: Superteam Earn (Solana bounty platform)
**Timeline**: 2-3 weeks for full implementation
**Payment**: Quote-based (USDC)
**Deadline to Apply**: December 19, 2025

**What They Want**:
- Build AI agent that auto-reviews GitHub submissions (PRs/repos) for bounties
- Generate scores (0-100) + concise review notes
- Integrate with their `earn-agent` service
- Handle edge cases (404s, private repos, invalid URLs, etc.)
- Event-based architecture (BullMQ + Redis)
- Tech stack: TypeScript, Node.js, MySQL, Vercel AI SDK/OpenRouter

**Our Differentiator**:
Instead of a boring proposal, we're shipping:
1. ✅ Working demo with live UI (earn-auto-review.rectorspace.com)
2. ✅ Real-time GitHub PR/repo analysis
3. ✅ Pre-loaded examples from their platform
4. ✅ Video walkthrough (2-3 min)
5. ✅ Contribution PR to their main repo
6. ✅ Technical deep-dive documentation
7. ✅ Production-ready integration plan

---

## Project Goals (POC Phase)

### Core Features to Build:

**1. Demo Web UI** (Next.js + Tailwind)
- Simple input: "Paste GitHub URL (PR or repo)"
- Dropdown with 3-5 pre-loaded real Superteam Earn submissions
- Real-time analysis with streaming responses
- Display: Score gauge + formatted review notes + metadata
- Edge case handling with clear error messages

**2. AI Review Engine**
- GitHub API integration (fetch PR/repo data)
- LLM analysis using Vercel AI SDK + OpenRouter (Claude Sonnet 3.5)
- Scoring system (0-100):
  - Code quality (40pts): patterns, complexity, best practices
  - Completeness (30pts): requirements met, documentation
  - Testing (20pts): test coverage, test quality
  - Innovation (10pts): creative solutions, efficiency
- Concise review notes (3-5 actionable points)

**3. Edge Cases Handled**
- ✅ Invalid URLs → Clear error
- ✅ Private repos → "Cannot access"
- ✅ 404s → "Not found"
- ✅ Empty repos → "No code to review"
- ✅ WIP/Draft PRs → Flagged in score
- ✅ Rate limiting → Cached or queued

**4. Deployment**
- Deploy to: earn-auto-review.rectorspace.com
- Vercel hosting (fast, free tier)
- Environment: OPENROUTER_API_KEY, GITHUB_TOKEN

**5. Documentation**
- README with architecture diagram
- API design for production integration
- Edge cases matrix
- Cost analysis (LLM API usage estimates)
- Video walkthrough (2-3 min)

**6. Bonus Points**
- Find + fix small issue in superteamdao/earn repo
- Submit clean PR (reference in proposal)
- Analyze 5-10 real Earn submissions
- Include insights: "I found patterns X, Y, Z..."

---

## Tech Stack Decisions

**Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
**AI**: Vercel AI SDK + OpenRouter (Claude Sonnet 3.5 or GPT-4)
**APIs**: GitHub REST API, Octokit
**Deployment**: Vercel + rectorspace.com subdomain
**Future** (production): BullMQ + Redis + MySQL

---

## Next Steps to Execute

### Phase 1: Project Setup (Start here)
```bash
cd ~/local-dev/earn-auto-reviewer
```

1. **Initialize Next.js project**
   - Run: `npx create-next-app@latest . --typescript --tailwind --app --no-src`
   - Install deps: `@vercel/ai-sdk`, `ai`, `openai`, `@octokit/rest`
   - Setup shadcn/ui: `npx shadcn@latest init`
   - Add components: `npx shadcn@latest add button input card badge`

2. **Project Structure**
   ```
   app/
   ├── page.tsx              # Main demo UI
   ├── api/
   │   └── review/
   │       └── route.ts      # API endpoint for review
   ├── layout.tsx
   └── globals.css

   lib/
   ├── github.ts             # GitHub API integration
   ├── reviewer.ts           # AI review engine
   ├── scoring.ts            # Scoring logic
   └── prompts.ts            # LLM prompts

   components/
   ├── url-input.tsx         # GitHub URL input
   ├── review-display.tsx    # Score + notes display
   └── loading-state.tsx     # Streaming analysis

   types/
   └── index.ts              # TypeScript types
   ```

3. **Environment Setup**
   Create `.env.local`:
   ```
   OPENROUTER_API_KEY=your_key_here
   GITHUB_TOKEN=your_token_here  # Optional, for higher rate limits
   ```

### Phase 2: Core Implementation

4. **GitHub API Integration** (lib/github.ts)
   - Fetch PR: commits, files, diff, metadata
   - Fetch repo: README, structure, languages
   - Parse URL variants (PR, repo, commit, branch)
   - Handle errors gracefully

5. **AI Review Engine** (lib/reviewer.ts)
   - Custom prompt for bounty submissions
   - Streaming responses for real-time UI
   - Token optimization (don't send massive diffs)
   - Structured output (JSON with score + notes)

6. **Scoring System** (lib/scoring.ts)
   - Calculate 0-100 score
   - Weight categories (quality 40, completeness 30, testing 20, innovation 10)
   - Return breakdown for transparency

7. **Demo UI** (app/page.tsx)
   - Clean hero with input
   - Pre-loaded examples dropdown
   - Real-time streaming display
   - Error states with retry

### Phase 3: Polish & Deploy

8. **Testing**
   - Test with 5+ real Earn submissions
   - Validate score accuracy
   - Ensure edge cases handled
   - Performance: < 15 sec per review

9. **Deploy to Vercel**
   - Connect GitHub repo
   - Add environment vars
   - Setup custom domain: earn-auto-review.rectorspace.com

10. **Documentation**
    - Update README with demo link
    - Add architecture diagram (mermaid)
    - Document API for production integration
    - Create edge cases matrix

### Phase 4: The Extras

11. **Contribute to superteamdao/earn**
    - Clone repo, find low-hanging fruit
    - Submit clean PR with good commit message
    - Reference in proposal

12. **Record Video**
    - 2-3 min walkthrough (Loom/OBS)
    - Show demo, architecture, edge cases
    - End with impact statement

13. **Write Proposal**
    - Lead with demo link (not resume)
    - Show working system
    - Include GitHub contribution
    - Specific integration plan
    - Make it skimmable

---

## Starter Prompt for CIPHER

Copy-paste this to start working in new session:

```
Assalamu'alaikum CIPHER! Let's build the earn-auto-reviewer POC.

Context: We're building an AI-powered GitHub review demo for Superteam Earn bounty application. Goal is to ship a working product instead of just a proposal.

Repository: ~/local-dev/earn-auto-reviewer (on dev branch)
Read: STARTER-PROMPT.md for full context

Next steps:
1. Initialize Next.js 14 project with TypeScript, Tailwind, shadcn/ui
2. Setup project structure (see Phase 1 in STARTER-PROMPT.md)
3. Install required dependencies
4. Create .env.local template

Let's start with Phase 1. Use the TodoWrite tool to track progress.

Bismillah, let's ship this!
```

---

## Key Resources

- **Bounty Listing**: https://earn.superteam.fun/listing/add-github-links-to-earn-auto-reviews
- **Their Repo**: https://github.com/superteamdao/earn/
- **Our Repo**: https://github.com/RECTOR-LABS/earn-auto-reviewer
- **Contact**: Telegram @JayeshVP24

---

## Success Criteria

✅ Demo works flawlessly with real submissions
✅ Edge cases handled gracefully
✅ Response time < 15 seconds
✅ Score feels accurate (manual validation)
✅ Code is production-ready quality
✅ Deployment is live and accessible
✅ Documentation is comprehensive
✅ Proposal is compelling and unique

---

## Timeline Estimate

- **Phase 1-2** (Setup + Core): 1-2 days
- **Phase 3** (Polish + Deploy): 1 day
- **Phase 4** (Extras): 1 day

**Total**: 3-4 days to ship complete POC

---

Bismillah! May Allah make this work easy and successful. Let's build something that stands out and wins this opportunity. InshaAllah!
