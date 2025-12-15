// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',

  // Image optimization for external domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/vi/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
        pathname: '/**',
      },
    ],
  },

  // Performance optimizations
  experimental: {
    // Optimize package imports for better tree-shaking
    optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts'],
  },
};

// Bundle analyzer is optional (devDependency, not available in production build)
let config = nextConfig;

if (process.env.ANALYZE === 'true') {
  try {
    const bundleAnalyzer = await import('@next/bundle-analyzer');
    const withBundleAnalyzer = bundleAnalyzer.default({
      enabled: true,
    });
    config = withBundleAnalyzer(nextConfig);
  } catch {
    console.warn('Bundle analyzer not available, skipping...');
  }
}

export default config;
