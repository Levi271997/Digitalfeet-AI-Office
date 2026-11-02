import type { NextConfig } from 'next';

const SERVER_URL = process.env.SERVER_URL ?? 'http://localhost:4000';

const config: NextConfig = {
  transpilePackages: ['@ai-office/shared'],
  // The browser calls /api/* on the web app; Next forwards it to the agent server.
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${SERVER_URL}/api/:path*` }];
  },
};

export default config;
