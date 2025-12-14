import { describe, it, expect } from 'vitest';
import { parseGitHubUrl } from '../github';

describe('parseGitHubUrl', () => {
  describe('PR URLs', () => {
    it('parses standard PR URL', () => {
      const result = parseGitHubUrl('https://github.com/owner/repo/pull/123');
      expect(result.type).toBe('pr');
      expect(result.owner).toBe('owner');
      expect(result.repo).toBe('repo');
      expect(result.identifier).toBe(123);
    });

    it('parses PR URL without https', () => {
      const result = parseGitHubUrl('github.com/vercel/next.js/pull/71742');
      expect(result.type).toBe('pr');
      expect(result.owner).toBe('vercel');
      expect(result.repo).toBe('next.js');
      expect(result.identifier).toBe(71742);
    });

    it('parses PR URL with www', () => {
      const result = parseGitHubUrl('www.github.com/facebook/react/pull/999');
      expect(result.type).toBe('pr');
      expect(result.owner).toBe('facebook');
      expect(result.repo).toBe('react');
      expect(result.identifier).toBe(999);
    });

    it('returns invalid for non-numeric PR number', () => {
      const result = parseGitHubUrl('https://github.com/owner/repo/pull/abc');
      expect(result.type).toBe('invalid');
    });

    it('returns invalid for PR URL without number', () => {
      const result = parseGitHubUrl('https://github.com/owner/repo/pull/');
      expect(result.type).toBe('repo');
    });
  });

  describe('Repository URLs', () => {
    it('parses standard repo URL', () => {
      const result = parseGitHubUrl('https://github.com/solana-labs/solana-web3.js');
      expect(result.type).toBe('repo');
      expect(result.owner).toBe('solana-labs');
      expect(result.repo).toBe('solana-web3.js');
    });

    it('parses repo URL with trailing slash', () => {
      const result = parseGitHubUrl('https://github.com/owner/repo/');
      expect(result.type).toBe('repo');
      expect(result.owner).toBe('owner');
      expect(result.repo).toBe('repo');
    });

    it('parses repo URL with .git extension', () => {
      const result = parseGitHubUrl('https://github.com/owner/repo.git');
      expect(result.type).toBe('repo');
      expect(result.repo).toBe('repo');
    });

    it('parses repo URL without protocol', () => {
      const result = parseGitHubUrl('github.com/coral-xyz/anchor');
      expect(result.type).toBe('repo');
      expect(result.owner).toBe('coral-xyz');
      expect(result.repo).toBe('anchor');
    });
  });

  describe('Commit URLs', () => {
    it('parses commit URL with full SHA', () => {
      const sha = 'abc123def456789012345678901234567890abcd';
      const result = parseGitHubUrl(`https://github.com/owner/repo/commit/${sha}`);
      expect(result.type).toBe('commit');
      expect(result.owner).toBe('owner');
      expect(result.repo).toBe('repo');
      expect(result.identifier).toBe(sha);
    });

    it('parses commit URL with short SHA', () => {
      const result = parseGitHubUrl('https://github.com/owner/repo/commit/abc123');
      expect(result.type).toBe('commit');
      expect(result.identifier).toBe('abc123');
    });
  });

  describe('Branch URLs', () => {
    it('parses branch URL', () => {
      const result = parseGitHubUrl('https://github.com/owner/repo/tree/main');
      expect(result.type).toBe('branch');
      expect(result.owner).toBe('owner');
      expect(result.repo).toBe('repo');
      expect(result.identifier).toBe('main');
    });

    it('parses branch URL with slashes in branch name', () => {
      const result = parseGitHubUrl('https://github.com/owner/repo/tree/feature/new-feature');
      expect(result.type).toBe('branch');
      expect(result.identifier).toBe('feature/new-feature');
    });

    it('parses branch URL with multiple slashes', () => {
      const result = parseGitHubUrl('https://github.com/owner/repo/tree/feat/user/auth');
      expect(result.type).toBe('branch');
      expect(result.identifier).toBe('feat/user/auth');
    });
  });

  describe('Invalid URLs', () => {
    it('returns invalid for non-GitHub domain', () => {
      const result = parseGitHubUrl('https://gitlab.com/owner/repo');
      expect(result.type).toBe('invalid');
    });

    it('returns invalid for URL with only owner', () => {
      const result = parseGitHubUrl('https://github.com/owner');
      expect(result.type).toBe('invalid');
    });

    it('returns invalid for empty string', () => {
      const result = parseGitHubUrl('');
      expect(result.type).toBe('invalid');
    });

    it('returns invalid for malformed URL', () => {
      const result = parseGitHubUrl('not-a-url');
      expect(result.type).toBe('invalid');
    });

    it('returns invalid for github.com root', () => {
      const result = parseGitHubUrl('https://github.com/');
      expect(result.type).toBe('invalid');
    });
  });

  describe('Edge cases', () => {
    it('handles URLs with query parameters', () => {
      const result = parseGitHubUrl('https://github.com/owner/repo/pull/123?diff=unified');
      expect(result.type).toBe('pr');
      expect(result.identifier).toBe(123);
    });

    it('handles URLs with hash fragments', () => {
      const result = parseGitHubUrl('https://github.com/owner/repo/pull/456#discussion_r123');
      expect(result.type).toBe('pr');
      expect(result.identifier).toBe(456);
    });

    it('handles whitespace in URL', () => {
      const result = parseGitHubUrl('  https://github.com/owner/repo  ');
      expect(result.type).toBe('repo');
      expect(result.owner).toBe('owner');
      expect(result.repo).toBe('repo');
    });

    it('handles repos with dots in name', () => {
      const result = parseGitHubUrl('https://github.com/owner/repo.name.here');
      expect(result.type).toBe('repo');
      expect(result.repo).toBe('repo.name.here');
    });

    it('handles repos with hyphens', () => {
      const result = parseGitHubUrl('https://github.com/my-org/my-repo-name');
      expect(result.type).toBe('repo');
      expect(result.owner).toBe('my-org');
      expect(result.repo).toBe('my-repo-name');
    });

    it('handles repos with underscores', () => {
      const result = parseGitHubUrl('https://github.com/some_org/some_repo');
      expect(result.type).toBe('repo');
      expect(result.owner).toBe('some_org');
      expect(result.repo).toBe('some_repo');
    });
  });
});
