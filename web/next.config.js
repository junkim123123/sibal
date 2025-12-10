const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Set the root directory for file tracing to avoid workspace root inference issues
  outputFileTracingRoot: path.join(__dirname),
  images: {
    domains: ['cdn.sanity.io'],
  },
  // HTML 최적화 및 DOCTYPE 명시
  poweredByHeader: false,
  compress: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    // Fix module resolution for uuid and other packages
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Ensure uuid is resolved from root node_modules
    config.resolve.alias = {
      ...config.resolve.alias,
      uuid: require.resolve('uuid'),
    };
    
    return config;
  },
}

module.exports = nextConfig

