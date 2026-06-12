import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    return [
      {
        source: '/:path*.(ico|png|jpg|jpeg|svg|webp|woff|woff2|ttf|css|js)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  },
  async redirects() {
    return [
      {
        source: '/.env',
        destination: '/',
        permanent: false,
      },
      {
        source: '/.git/:path*',
        destination: '/',
        permanent: false,
      },
      {
        source: '/wp-admin/:path*',
        destination: '/',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;