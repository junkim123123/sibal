/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cdn.sanity.io'],
  },
  eslint: {
    // 빌드 시 ESLint 오류가 있어도 경고로만 처리
    ignoreDuringBuilds: false,
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

