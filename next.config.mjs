/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com', 'authjs.dev'],
  },
  webpack: (config) => {
    config.cache = false;
    config.externals = [...config.externals, 'canvas', 'jsdom'];
    return config;
  },
};

export default nextConfig;
