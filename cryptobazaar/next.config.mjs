/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["pino", "pino-pretty", "thread-stream"],
  turbopack: {
    // Empty config to acknowledge we're using Turbopack
    // The serverExternalPackages above handles the pino/thread-stream issues
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
