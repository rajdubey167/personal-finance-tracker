import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fonts.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'fonts.gstatic.com',
      }
    ]
  },
  
  experimental: {
    // Enable optimizations for imported packages
    optimizePackageImports: ['lucide-react', 'recharts']
  }
};

export default nextConfig;
