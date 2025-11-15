import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for Capacitor (comment out for dev with API routes)
  output: process.env.CAPACITOR_BUILD === 'true' ? 'export' : undefined,

  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },

  // Images config for static export
  images: {
    unoptimized: process.env.CAPACITOR_BUILD === 'true',
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
