import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // Product images are pasted as Google Drive links by the admin team.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
