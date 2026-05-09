import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: path.resolve(__dirname),
  },
  serverExternalPackages: ["@prisma/client", "prisma", "pdf-parse"],

};

export default nextConfig;
