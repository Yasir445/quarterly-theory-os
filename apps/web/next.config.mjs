import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@qt/database", "@qt/types"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
    outputFileTracingRoot: path.join(__dirname, "../../"),
    outputFileTracingIncludes: {
      "*": [
        "./node_modules/.bun/@prisma+client*/node_modules/.prisma/client/**/*",
        "../../node_modules/.bun/@prisma+client*/node_modules/.prisma/client/**/*",
        "../../packages/database/node_modules/.prisma/client/**/*",
      ],
    },
  },
};

export default nextConfig;
