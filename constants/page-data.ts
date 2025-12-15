// Extracted constants from app/page.tsx for better code organization
// These are static data used for the demo showcase

import { JudgeId, ReviewPanelPreset } from '@/types';

export const EXAMPLE_URLS = [
  { label: 'Next.js', url: 'https://github.com/vercel/next.js/pull/71742' },
  { label: 'React', url: 'https://github.com/facebook/react' },
  { label: 'Solana', url: 'https://github.com/solana-labs/solana-web3.js' },
  { label: 'Anchor', url: 'https://github.com/coral-xyz/anchor' },
];

export const PRESET_INFO: Record<ReviewPanelPreset, { name: string; count: number }> = {
  quick: { name: 'Quick', count: 3 },
  standard: { name: 'Standard', count: 5 },
  comprehensive: { name: 'Full', count: 8 },
  custom: { name: 'Custom', count: 0 },
};

export const ALL_JUDGES: JudgeId[] = [
  'security', 'performance', 'architecture', 'code-quality',
  'testing', 'devops', 'documentation', 'dx',
];

export const JUDGE_PANEL = [
  { id: 'architecture', icon: '🏗️', name: 'Code Architect', focus: 'Structure & patterns' },
  { id: 'security', icon: '🔒', name: 'Security Sentinel', focus: 'Vulnerabilities & auth' },
  { id: 'performance', icon: '⚡', name: 'Perf Optimizer', focus: 'Speed & efficiency' },
  { id: 'dx', icon: '🎨', name: 'UX/DX Advocate', focus: 'Developer experience' },
  { id: 'testing', icon: '🧪', name: 'Testing Champion', focus: 'Coverage & quality' },
  { id: 'documentation', icon: '📚', name: 'Docs Guru', focus: 'Documentation' },
  { id: 'code-quality', icon: '💡', name: 'Innovation Scout', focus: 'Creative solutions' },
  { id: 'devops', icon: '🔗', name: 'Integration Expert', focus: 'CI/CD & deploy' },
];

// Types for example reviews
export interface ExampleJudge {
  icon: string;
  name: string;
  score: number;
  note: string;
}

export interface ExampleNote {
  type: 'success' | 'warning' | 'error' | 'info';
  text: string;
}

export interface DetailedAnalysis {
  icon: string;
  name: string;
  score: number;
  analysis: string;
}

export interface FileBreakdown {
  file: string;
  score: number;
  status: 'excellent' | 'good' | 'needs-work' | 'critical';
  lines: number;
}

export interface Recommendation {
  priority: 'critical' | 'high' | 'medium' | 'low';
  text: string;
  category: string;
}

export interface CodeSnippet {
  title: string;
  file: string;
  line: number;
  before: string;
  after: string;
}

export interface ExampleFullReport {
  detailedAnalysis: DetailedAnalysis[];
  fileBreakdown: FileBreakdown[];
  recommendations: Recommendation[];
  codeSnippets: CodeSnippet[];
}

export interface ExampleReview {
  id: string;
  label: string;
  type: string;
  score: number;
  url: string;
  verdict: string;
  stars: number;
  breakdown: { codeQuality: number; completeness: number; testing: number; innovation: number };
  judges: ExampleJudge[];
  notes: ExampleNote[];
  fullReport: ExampleFullReport;
}

export const EXAMPLE_REVIEWS: ExampleReview[] = [
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
    fullReport: {
      detailedAnalysis: [
        {
          icon: '🏗️',
          name: 'Code Architect',
          score: 88,
          analysis: 'The Anchor program demonstrates excellent separation of concerns with well-defined account structures. The use of PDAs for token vaults follows best practices and ensures deterministic address derivation. The instruction handlers are clean and focused, each handling a single responsibility. Consider extracting the swap calculation logic into a separate module for better testability and potential reuse.',
        },
        {
          icon: '🔒',
          name: 'Security Sentinel',
          score: 82,
          analysis: "Proper signer validation is implemented across all instructions. The program correctly validates account ownership and uses Anchor's account constraints effectively. However, there's a potential front-running vulnerability in the swap function - consider implementing slippage protection with a maximum price impact parameter.",
        },
        {
          icon: '⚡',
          name: 'Perf Optimizer',
          score: 91,
          analysis: 'Efficient PDA derivation with cached bump seeds. The program minimizes CPI calls and uses zero-copy deserialization where appropriate. Token transfers are batched efficiently. One optimization opportunity: consider using remaining_accounts for dynamic token pair support instead of hardcoded accounts.',
        },
        {
          icon: '🧪',
          name: 'Testing Champion',
          score: 78,
          analysis: 'Good test coverage for happy paths with Bankrun integration tests. Unit tests cover core calculation logic. However, edge cases are underrepresented - add tests for: zero amounts, maximum u64 values, same token swaps, and insufficient liquidity scenarios. Consider adding fuzz tests using Trident or similar framework.',
        },
      ],
      fileBreakdown: [
        { file: 'programs/swap/src/lib.rs', score: 92, status: 'excellent', lines: 245 },
        { file: 'programs/swap/src/state.rs', score: 85, status: 'good', lines: 67 },
        { file: 'programs/swap/src/errors.rs', score: 90, status: 'excellent', lines: 32 },
        { file: 'tests/swap.ts', score: 70, status: 'needs-work', lines: 189 },
        { file: 'programs/swap/src/instructions/mod.rs', score: 88, status: 'good', lines: 156 },
      ],
      recommendations: [
        { priority: 'high', text: 'Add slippage protection parameter to swap instruction', category: 'Security' },
        { priority: 'high', text: 'Implement fuzz testing for edge cases', category: 'Testing' },
        { priority: 'medium', text: 'Add events for off-chain indexing (swap, deposit, withdraw)', category: 'Integration' },
        { priority: 'medium', text: 'Consider using remaining_accounts for flexible token pairs', category: 'Architecture' },
        { priority: 'low', text: 'Add inline documentation for complex calculation logic', category: 'Documentation' },
      ],
      codeSnippets: [
        {
          title: 'Slippage Protection (Recommended)',
          file: 'programs/swap/src/instructions/swap.rs',
          line: 42,
          before: 'let output_amount = calculate_swap(input_amount, pool_state);',
          after: `let output_amount = calculate_swap(input_amount, pool_state);
require!(
    output_amount >= min_output_amount,
    SwapError::SlippageExceeded
);`,
        },
      ],
    },
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
    fullReport: {
      detailedAnalysis: [
        {
          icon: '🏗️',
          name: 'Code Architect',
          score: 75,
          analysis: "The component structure follows a reasonable atomic design pattern with atoms, molecules, and organisms. However, there's inconsistent use of custom hooks - some components have inline data fetching while others use hooks. Standardize on a single approach. The state management using Context is appropriate for this scale but consider Zustand if it grows.",
        },
        {
          icon: '🎨',
          name: 'UX/DX Advocate',
          score: 80,
          analysis: 'Clean, modern UI with consistent spacing and typography. Good use of semantic HTML and ARIA labels. The dashboard is responsive down to tablet sizes but needs work on mobile. Loading states are handled well with skeleton components. Consider adding keyboard navigation for the data tables.',
        },
        {
          icon: '🧪',
          name: 'Testing Champion',
          score: 58,
          analysis: 'No unit tests found in the repository. This is a significant gap for a production application. At minimum, add tests for: utility functions, custom hooks, and critical user flows. Consider using React Testing Library for component tests and MSW for API mocking.',
        },
        {
          icon: '📚',
          name: 'Docs Guru',
          score: 72,
          analysis: 'README exists but lacks practical information. Missing: installation steps, environment variable documentation, architecture overview, and contribution guidelines. The inline code comments are sparse - complex components would benefit from JSDoc annotations.',
        },
      ],
      fileBreakdown: [
        { file: 'src/components/Dashboard.tsx', score: 78, status: 'good', lines: 312 },
        { file: 'src/hooks/useWalletData.ts', score: 82, status: 'good', lines: 89 },
        { file: 'src/components/Charts/PortfolioChart.tsx', score: 75, status: 'good', lines: 156 },
        { file: 'src/utils/formatters.ts', score: 85, status: 'good', lines: 45 },
        { file: 'src/App.tsx', score: 70, status: 'needs-work', lines: 67 },
      ],
      recommendations: [
        { priority: 'high', text: 'Add unit tests with React Testing Library', category: 'Testing' },
        { priority: 'high', text: 'Document environment variables and setup steps', category: 'Documentation' },
        { priority: 'medium', text: 'Implement error boundaries for graceful failure', category: 'Reliability' },
        { priority: 'medium', text: 'Add mobile-responsive styles for <768px', category: 'UX' },
        { priority: 'low', text: 'Consider React Query for caching and refetching', category: 'Performance' },
      ],
      codeSnippets: [
        {
          title: 'Add Error Boundary (Recommended)',
          file: 'src/App.tsx',
          line: 15,
          before: '<Dashboard />',
          after: `<ErrorBoundary fallback={<ErrorFallback />}>
  <Dashboard />
</ErrorBoundary>`,
        },
      ],
    },
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
    fullReport: {
      detailedAnalysis: [
        {
          icon: '🔒',
          name: 'Security Sentinel',
          score: 45,
          analysis: "CRITICAL SECURITY ISSUE: API keys for Helius and Birdeye are hardcoded in config.py (lines 12-15). These credentials are now exposed in git history. Immediate action required: rotate these keys, add them to .gitignore, and use environment variables or a secrets manager. Additionally, the HTTP requests don't validate SSL certificates in development mode.",
        },
        {
          icon: '🏗️',
          name: 'Code Architect',
          score: 62,
          analysis: 'The code structure is flat with most logic in a single tracker.py file (~450 lines). Functions like fetch_and_process() are doing too much - fetching, parsing, calculating, and printing. Apply single responsibility principle. Consider a class-based approach or at least separate modules for API clients, data processing, and CLI output.',
        },
        {
          icon: '🧪',
          name: 'Testing Champion',
          score: 52,
          analysis: 'No test files found. For a CLI tool that handles financial data, this is risky. Add pytest with fixtures for: API response mocking, calculation accuracy, edge cases (empty wallets, API errors). The current code structure makes testing difficult - another reason to refactor into smaller, testable units.',
        },
        {
          icon: '📚',
          name: 'Docs Guru',
          score: 68,
          analysis: 'Basic README with installation steps exists. Missing: usage examples, CLI argument documentation, expected output format, and error handling guide. The code has minimal inline comments - the complex price calculation logic in lines 234-267 is particularly opaque.',
        },
      ],
      fileBreakdown: [
        { file: 'tracker.py', score: 55, status: 'needs-work', lines: 456 },
        { file: 'config.py', score: 30, status: 'critical', lines: 28 },
        { file: 'utils.py', score: 65, status: 'needs-work', lines: 89 },
        { file: 'README.md', score: 70, status: 'needs-work', lines: 45 },
      ],
      recommendations: [
        { priority: 'critical', text: 'IMMEDIATELY rotate exposed API keys and use .env', category: 'Security' },
        { priority: 'high', text: 'Refactor tracker.py into smaller modules', category: 'Architecture' },
        { priority: 'high', text: 'Add pytest test suite with mocked API responses', category: 'Testing' },
        { priority: 'medium', text: 'Add type hints throughout the codebase', category: 'Code Quality' },
        { priority: 'medium', text: 'Implement proper error handling with custom exceptions', category: 'Reliability' },
      ],
      codeSnippets: [
        {
          title: 'Fix Hardcoded Credentials (CRITICAL)',
          file: 'config.py',
          line: 12,
          before: `HELIUS_API_KEY = "abc123-your-key-here"
BIRDEYE_API_KEY = "xyz789-another-key"`,
          after: `import os
from dotenv import load_dotenv

load_dotenv()

HELIUS_API_KEY = os.getenv("HELIUS_API_KEY")
BIRDEYE_API_KEY = os.getenv("BIRDEYE_API_KEY")

if not HELIUS_API_KEY or not BIRDEYE_API_KEY:
    raise ValueError("Missing required API keys in environment")`,
        },
      ],
    },
  },
];
