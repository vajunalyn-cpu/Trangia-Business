import type { NextConfig } from "next";

// Static export: the site is plain HTML/CSS/JS and deploys to Vercel (or any static host)
// without a server. The inquiry form posts to an external endpoint (see .env.example).
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
