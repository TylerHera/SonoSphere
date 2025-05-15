/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // Disable PWA in development to avoid caching issues
  // Other PWA options can be added here
});

const nextConfig = {
  reactStrictMode: true,
  // You can add other Next.js configurations here
};

module.exports = withPWA(nextConfig);
