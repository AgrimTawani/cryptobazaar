/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["pino", "pino-pretty", "thread-stream"],
  webpack: (config, { isServer }) => {
    // Exclude test files from bundling
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    
    config.module.rules.push({
      test: /node_modules\/thread-stream\/test\/.*/,
      loader: 'ignore-loader',
    });

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
      },
      {
        protocol: 'https',
        hostname: 'avatar.vercel.sh',
      },
    ],
  },
};

export default nextConfig;
