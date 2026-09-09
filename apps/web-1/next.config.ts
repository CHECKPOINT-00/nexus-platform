import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,
  transpilePackages: ["@repo/validation"],
  turbopack: {
    root: path.resolve(import.meta.dirname ?? __dirname, "../../"),
  },
};

export default nextConfig;
