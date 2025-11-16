import withPWA from 'next-pwa';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const hasCapacitorDeps = () => {
  try {
    require.resolve('@capacitor/core');
    require.resolve('@capacitor/haptics');
    require.resolve('@capacitor/status-bar');
    require.resolve('@capacitor/splash-screen');
    return true;
  } catch {
    return false;
  }
};

const shouldUseCapacitorStubs =
  process.env.CAPACITOR_BUILD === 'true' ? false : !hasCapacitorDeps();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for Capacitor (comment out for dev with API routes)
  // output: process.env.CAPACITOR_BUILD === 'true' ? 'export' : undefined,

  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },

  // Images config for static export
  images: {
    unoptimized: process.env.CAPACITOR_BUILD === 'true',
  },

  webpack: (config) => {
    if (shouldUseCapacitorStubs) {
      const stubDir = path.join(__dirname, 'src/lib/stubs');
      config.resolve = config.resolve || {};
      config.resolve.alias = config.resolve.alias || {};

      config.resolve.alias['@capacitor/core'] = path.join(
        stubDir,
        'capacitor-core.ts'
      );
      config.resolve.alias['@capacitor/haptics'] = path.join(
        stubDir,
        'capacitor-haptics.ts'
      );
      config.resolve.alias['@capacitor/status-bar'] = path.join(
        stubDir,
        'capacitor-status-bar.ts'
      );
      config.resolve.alias['@capacitor/splash-screen'] = path.join(
        stubDir,
        'capacitor-splash-screen.ts'
      );
    }
    return config;
  },

  // Security Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "worker-src 'self' blob:",
              "child-src 'self' blob:",
              "connect-src 'self' https://world.openfoodfacts.org blob: data:",
              "font-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=()',
          },
        ],
      },
    ];
  },
};

// PWA Configuration
const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/world\.openfoodfacts\.org\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'openfoodfacts-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
      },
    },
  ],
});

export default pwaConfig(nextConfig);
