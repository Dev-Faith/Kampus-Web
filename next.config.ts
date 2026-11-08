import type { NextConfig } from "next";
import androidRelease from "./src/lib/constants/android-release.json";

const nextConfig: NextConfig = {
  async redirects() {
    if (!androidRelease.assetUrl) return [];
    const target = new URL(androidRelease.assetUrl);
    if (target.protocol !== "https:" || target.username || target.password || target.search || target.hash) {
      throw new Error("Use a permanent public HTTPS URL for the Android release asset.");
    }
    return [{ source: "/" + androidRelease.apkFileName, destination: target.href, permanent: false }];
  },
  async headers() {
    return [{
      source: "/:file(kampus-v[0-9][0-9A-Za-z.-]*\\.apk)",
      headers: [
        { key: "Content-Type", value: "application/vnd.android.package-archive" },
        { key: "Content-Disposition", value: "attachment" },
      ],
    }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "**.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "photo-sphere-viewer-data.netlify.app",
      },
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
    ],
  },
};

export default nextConfig;
