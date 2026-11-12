import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "*.supabase.co";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: supabaseHost },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // Admins can paste image URLs from any HTTPS host.
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
