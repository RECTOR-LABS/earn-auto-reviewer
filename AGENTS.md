<!-- Satellite context file — extends the global hub (~/.claude/CLAUDE.md | ~/.pi/agent/AGENTS.md). Host-neutral; project-specific only. Do not duplicate hub standards here. -->

# Earn Auto-Reviewer

> AI-powered GitHub review system for Superteam Earn bounties. Demo/POC that auto-reviews GitHub submissions (PRs/repos), generating scores (0-100) and concise review notes. Submitted to Superteam Earn bounty (Dec 15, 2025, quote $2,500 USDC).

**Demo:** https://earn-auto-review.rectorspace.com (Vercel)
**Status:** ✅ SUBMITTED — awaiting response.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **AI/LLM:** Vercel AI SDK, OpenRouter API, Claude Sonnet 3.5 (or GPT-4)
- **APIs:** GitHub REST API, Octokit
- **Deployment:** Vercel, custom subdomain earn-auto-review.rectorspace.com

**Future production stack (post-POC):** BullMQ + Redis (event queue), MySQL, integration with `superteamdao/earn-agent`.

## Project Structure

```
app/{page,layout,globals.css} · app/api/review/route.ts
lib/{github,reviewer,scoring,prompts}.ts
components/{url-input,review-display,loading-state}.tsx
types/index.ts
STARTER-PROMPT.md · README.md
```

## Common Commands

```bash
npm install
npm run dev
npm run build
npm start
npm run type-check
npm run lint
```

## Core Features (POC)

1. **Demo Web UI** — GitHub URL input (PR or repo), 3-5 pre-loaded real Superteam Earn submissions, real-time streaming analysis, score gauge + review notes + metadata, edge case handling.
2. **AI Review Engine** — GitHub API integration (fetch PR/repo data), LLM analysis (Vercel AI SDK + OpenRouter), scoring 0-100, concise review notes (3-5 actionable points).
3. **Edge cases** — invalid URLs, private repos, 404s, empty repos, WIP/draft PRs (flagged), rate limiting (cached/queued).

## Scoring System (0-100)

- **Code Quality (40pts):** design patterns, complexity, best practices, security
- **Completeness (30pts):** requirements met, documentation, edge cases, error handling
- **Testing (20pts):** coverage, test quality, integration/E2E
- **Innovation (10pts):** creative solutions, efficiency, novel approaches

Review notes: 3-5 actionable bullet points, concise and specific.

## API

### POST /api/review

Request: `{ "url": "https://github.com/owner/repo/pull/123" }`
Response (streaming): `{ score, breakdown: {codeQuality, completeness, testing, innovation}, notes: [...], metadata: {prNumber, author, filesChanged, additions, deletions} }`

## Environment Variables

```bash
OPENROUTER_API_KEY=your_key_here
GITHUB_TOKEN=your_token_here  # Optional, for higher rate limits
```

`.env.local` is gitignored, never committed.

## Key Decisions

- **URL parsing:** PR (`/pull/123`), repo (`/owner/repo`), commit (`/commit/abc123`), branch (`/tree/branch-name`)
- **Token optimization:** don't send full diff for large PRs (>10k lines) — summarize file changes, focus on critical files (src, tests, config), exclude generated/lockfiles/assets
- **Error hierarchy:** invalid URL (client-side) → network (retry exp backoff) → GitHub API (parse + meaningful message) → LLM (cached/queue fallback) → rate limits (wait time/queue position)

## Submission Details

- Submitted: December 15, 2025 · Quote: $2,500 USDC
- Demo: https://earn-auto-review.rectorspace.com
- Videos: YouTube (MDF9AIaDhl8 — Tesior Web Review, DEjf_az7EKU — SuperteamDAO PR Review #1288)
- Proposal: /proposal page

## Notes

- Always read `STARTER-PROMPT.md` for full session context.
- Work on `dev` branch; push to GitHub after each major feature; PR to main when POC complete.
- Ship working demo fast, then polish — this is about proving capability.
- Future production: event flow (Earn emits to BullMQ → worker → review API → MySQL → status update), API contract (auth, 30s timeout, 3 retries), reviews DB table.