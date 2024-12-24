/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/api/frame',
      },
    ];
  },
  env: {
    NEXT_PUBLIC_HOST: process.env.NEXT_PUBLIC_HOST,
  }
};

module.exports = nextConfig;