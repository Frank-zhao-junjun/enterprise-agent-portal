import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['*.dev.coze.site'],
  images: {
    remotePatterns: [
      {
        protocol: 'https' as const,
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https' as const,
        hostname: 'cdn.jsdelivr.net',
      },
    ],
  },
};

export default nextConfig;
