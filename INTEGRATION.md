# Production Integration Guide

This document outlines how to integrate the Earn Auto-Reviewer with the Superteam Earn platform's production infrastructure.

---

## 🏗️ Architecture Overview

```mermaid
flowchart LR
    User[User Submits<br/>GitHub URL] --> Earn[Earn Platform]
    Earn --> BullMQ[BullMQ Queue]
    BullMQ --> Redis[(Redis)]

    Worker[Review Worker] --> BullMQ
    Worker --> API[Review API]
    API --> GitHub[GitHub API]
    API --> OpenRouter[OpenRouter/Claude]

    API --> Result[Review Result]
    Result --> MySQL[(MySQL)]
    Result --> Earn
    Earn --> User

    style BullMQ fill:#ef4444
    style Worker fill:#10b981
    style API fill:#3b82f6
```

---

## 📋 Integration Steps

### 1. Deploy Review Service

**Option A: Standalone Service (Recommended)**

Deploy the review API as a separate microservice:

```bash
# Clone and setup
git clone https://github.com/RECTOR-LABS/earn-auto-reviewer.git
cd earn-auto-reviewer
npm install

# Configure environment
cp .env.example .env.production
# Add OPENROUTER_API_KEY and GITHUB_TOKEN

# Build and deploy
npm run build
npm start

# Or deploy to Vercel
vercel deploy --prod
```

**Option B: Integrate into earn-agent**

Merge the review logic into your existing `earn-agent` service:

```bash
# Copy review modules
cp -r lib/ ../earn-agent/src/lib/review/
cp -r types/ ../earn-agent/src/types/review/

# Install dependencies
cd ../earn-agent
npm install ai @ai-sdk/openai openai @octokit/rest zod
```

---

### 2. Setup BullMQ Queue

Create a dedicated queue for review jobs:

```typescript
// queues/reviewQueue.ts
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

export const reviewQueue = new Queue('github-reviews', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 1000,
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  },
});

// Job interface
export interface ReviewJob {
  submissionId: string;
  githubUrl: string;
  userId: string;
  listingId: string;
}
```

---

### 3. Create Worker Process

Process review jobs in the background:

```typescript
// workers/reviewWorker.ts
import { Worker } from 'bullmq';
import { reviewQueue, ReviewJob } from '../queues/reviewQueue';
import { prisma } from '../lib/prisma'; // Your database client

const worker = new Worker<ReviewJob>(
  'github-reviews',
  async (job) => {
    const { submissionId, githubUrl, userId, listingId } = job.data;

    try {
      // Call review API
      const response = await fetch(process.env.REVIEW_API_URL + '/api/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REVIEW_API_KEY}`,
        },
        body: JSON.stringify({ url: githubUrl }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Review failed');
      }

      const review = await response.json();

      // Save to database
      await prisma.submission.update({
        where: { id: submissionId },
        data: {
          reviewScore: review.score.total,
          reviewBreakdown: review.score.breakdown,
          reviewNotes: review.notes,
          reviewedAt: new Date(),
          status: 'reviewed',
        },
      });

      // Optional: Send notification
      await sendReviewNotification(userId, submissionId, review);

      return review;
    } catch (error) {
      console.error('Review worker error:', error);
      throw error; // Will trigger retry
    }
  },
  {
    connection: reviewQueue.opts.connection,
    concurrency: 5, // Process 5 reviews concurrently
  }
);

worker.on('completed', (job) => {
  console.log(`Review completed for submission ${job.data.submissionId}`);
});

worker.on('failed', (job, err) => {
  console.error(`Review failed for submission ${job?.data.submissionId}:`, err);
});
```

---

### 4. Enqueue Review Jobs

When a user submits a GitHub URL:

```typescript
// routes/submissions.ts
import { reviewQueue } from '../queues/reviewQueue';

async function handleSubmission(req, res) {
  const { githubUrl, listingId } = req.body;
  const userId = req.user.id;

  // Create submission record
  const submission = await prisma.submission.create({
    data: {
      userId,
      listingId,
      githubUrl,
      status: 'pending_review',
    },
  });

  // Enqueue review job
  await reviewQueue.add('review', {
    submissionId: submission.id,
    githubUrl,
    userId,
    listingId,
  });

  res.json({
    submissionId: submission.id,
    status: 'pending_review',
    message: 'Review queued successfully',
  });
}
```

---

### 5. MySQL Database Schema

Add review columns to your submissions table:

```sql
-- Add review columns to existing submissions table
ALTER TABLE submissions
ADD COLUMN review_score INT DEFAULT NULL,
ADD COLUMN review_breakdown JSON DEFAULT NULL,
ADD COLUMN review_notes JSON DEFAULT NULL,
ADD COLUMN reviewed_at TIMESTAMP DEFAULT NULL,
ADD INDEX idx_review_score (review_score),
ADD INDEX idx_reviewed_at (reviewed_at);

-- Optional: Create dedicated reviews table
CREATE TABLE github_reviews (
  id VARCHAR(36) PRIMARY KEY,
  submission_id VARCHAR(36) NOT NULL,
  github_url VARCHAR(500) NOT NULL,
  github_type ENUM('pr', 'repo', 'commit', 'branch') NOT NULL,

  -- Scores
  total_score INT NOT NULL,
  code_quality_score INT NOT NULL,
  completeness_score INT NOT NULL,
  testing_score INT NOT NULL,
  innovation_score INT NOT NULL,

  -- Review data
  review_notes JSON NOT NULL,
  metadata JSON,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
  INDEX idx_total_score (total_score),
  INDEX idx_created_at (created_at)
);
```

**Prisma Schema** (if using Prisma):

```prisma
model Submission {
  id              String    @id @default(uuid())
  userId          String
  listingId       String
  githubUrl       String
  status          String    @default("pending_review")

  // Review fields
  reviewScore     Int?
  reviewBreakdown Json?
  reviewNotes     Json?
  reviewedAt      DateTime?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([reviewScore])
  @@index([reviewedAt])
}

model GitHubReview {
  id                    String    @id @default(uuid())
  submissionId          String
  githubUrl             String
  githubType            String    // 'pr' | 'repo' | 'commit' | 'branch'

  totalScore            Int
  codeQualityScore      Int
  completenessScore     Int
  testingScore          Int
  innovationScore       Int

  reviewNotes           Json
  metadata              Json?

  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([totalScore])
  @@index([createdAt])
}
```

---

### 6. Environment Configuration

Add these variables to your production environment:

```bash
# Review API Configuration
REVIEW_API_URL=https://earn-auto-review.rectorspace.com
REVIEW_API_KEY=your-secure-api-key-here

# Or if self-hosted
OPENROUTER_API_KEY=sk-or-v1-your-key
GITHUB_TOKEN=ghp_your-token

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-password

# Database
DATABASE_URL=mysql://user:password@localhost:3306/earn_db
```

---

### 7. API Authentication (Optional)

Add API key authentication to protect the review endpoint:

```typescript
// middleware/auth.ts
export function authenticateReviewAPI(req, res, next) {
  const apiKey = req.headers['authorization']?.replace('Bearer ', '');

  if (!apiKey || apiKey !== process.env.REVIEW_API_KEY) {
    return res.status(401).json({
      error: 'Unauthorized',
      code: 'INVALID_API_KEY',
    });
  }

  next();
}

// app/api/review/route.ts
import { authenticateReviewAPI } from '@/middleware/auth';

export async function POST(request: NextRequest) {
  // Add auth check
  const authHeader = request.headers.get('authorization');
  if (authHeader?.replace('Bearer ', '') !== process.env.REVIEW_API_KEY) {
    return NextResponse.json(
      { error: 'Unauthorized', code: 'INVALID_API_KEY' },
      { status: 401 }
    );
  }

  // ... rest of handler
}
```

---

### 8. Rate Limiting

Implement rate limiting to prevent abuse:

```typescript
import rateLimit from 'express-rate-limit';

const reviewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many review requests, please try again later',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

app.post('/api/review', reviewLimiter, handleReview);
```

---

### 9. Monitoring & Logging

Track review performance and errors:

```typescript
// Metrics to track
interface ReviewMetrics {
  totalReviews: number;
  avgResponseTime: number;
  successRate: number;
  errorRate: number;
  avgScore: number;
  costPerReview: number;
}

// Log review completion
function logReviewCompletion(review, duration) {
  console.log({
    event: 'review_completed',
    score: review.score.total,
    duration_ms: duration,
    github_type: review.metadata.type,
    timestamp: new Date().toISOString(),
  });

  // Send to analytics/monitoring service
  analytics.track('review_completed', {
    score: review.score.total,
    duration,
    type: review.metadata.type,
  });
}
```

---

### 10. Webhook Integration (Alternative)

If you prefer webhooks over queues:

```typescript
// When submission is created
async function handleSubmissionWebhook(submission) {
  await fetch(process.env.REVIEW_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': generateSignature(submission),
    },
    body: JSON.stringify({
      event: 'submission.created',
      submissionId: submission.id,
      githubUrl: submission.githubUrl,
      callbackUrl: `${process.env.API_URL}/submissions/${submission.id}/review`,
    }),
  });
}

// Callback to receive review results
app.post('/submissions/:id/review', async (req, res) => {
  const { id } = req.params;
  const review = req.body;

  await prisma.submission.update({
    where: { id },
    data: {
      reviewScore: review.score.total,
      reviewBreakdown: review.score.breakdown,
      reviewNotes: review.notes,
      reviewedAt: new Date(),
      status: 'reviewed',
    },
  });

  res.json({ success: true });
});
```

---

## 🔒 Security Considerations

1. **API Keys**: Store in environment variables, never commit to git
2. **Rate Limiting**: Prevent abuse with IP-based or user-based limits
3. **Input Validation**: Validate all GitHub URLs before processing
4. **CORS**: Configure appropriate CORS headers for production
5. **HTTPS**: Always use HTTPS in production
6. **Secrets Rotation**: Rotate API keys periodically

---

## 📊 Cost Management

**Estimated Monthly Costs** (based on usage):

| Reviews/Month | OpenRouter Cost | GitHub API | Total |
|---------------|----------------|------------|-------|
| 1,000 | $20 - $50 | Free | $20 - $50 |
| 10,000 | $200 - $500 | Free | $200 - $500 |
| 100,000 | $2,000 - $5,000 | Free* | $2,000 - $5,000 |

*GitHub API is free up to 5,000 requests/hour with authentication

**Cost Optimization**:
- Cache reviews for identical URLs (TTL: 24h)
- Implement request deduplication
- Use lower-cost models for simple reviews
- Batch reviews when possible

---

## 🧪 Testing Integration

Test the integration before going live:

```bash
# 1. Setup test environment
cp .env.production .env.test

# 2. Start worker in test mode
NODE_ENV=test npm run worker

# 3. Submit test review
curl -X POST http://localhost:3000/api/review \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-key" \
  -d '{"url": "https://github.com/vercel/next.js/pull/71742"}'

# 4. Check database
psql -d earn_test -c "SELECT * FROM github_reviews ORDER BY created_at DESC LIMIT 1;"
```

---

## 📝 Deployment Checklist

- [ ] Review API deployed and accessible
- [ ] Environment variables configured
- [ ] BullMQ worker running
- [ ] Redis connection established
- [ ] Database schema migrated
- [ ] API authentication enabled
- [ ] Rate limiting configured
- [ ] Monitoring/logging setup
- [ ] Error alerts configured
- [ ] Load testing completed
- [ ] Documentation updated
- [ ] Team trained on system

---

## 🆘 Troubleshooting

**Common Issues**:

| Issue | Solution |
|-------|----------|
| Reviews timing out | Increase timeout in worker, optimize token usage |
| High error rate | Check API keys, GitHub rate limits, OpenRouter credits |
| Queue backed up | Increase worker concurrency, add more workers |
| Inconsistent scores | Validate prompt consistency, check model versions |
| Database deadlocks | Add proper indexes, optimize query patterns |

---

## 📞 Support

For integration support:
- GitHub Issues: https://github.com/RECTOR-LABS/earn-auto-reviewer/issues
- Email: [Contact info]
- Telegram: @JayeshVP24

---

**Last Updated**: December 9, 2025
