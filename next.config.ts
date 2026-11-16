import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "*.supabase.co";

const nextConfig: NextConfig = {
  images: {
    // One high quality setting for every image (Next picks the closest allowed value).
    qualities: [90],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1280, 1600, 1920, 2560, 3200],
    minimumCacheTTL: 60 * 60 * 24 * 30,
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
