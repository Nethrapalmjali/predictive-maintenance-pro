import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Only rewrite to local backend if we're not using an external API
    const isExternalApi = process.env.NEXT_PUBLIC_API_URL?.startsWith('http');
    if (isExternalApi) return [];
    
    return [
      {
        source: "/api/v1/:path*",
        destination: process.env.NODE_ENV === 'development' 
          ? "http://127.0.0.1:8000/api/v1/:path*"
          : "/api/v1/:path*", // Vercel will handle this via vercel.json if backend is in same project
      },
    ];
  },
};

export default nextConfig;
