import type { NextConfig } from "next";

const IMPORT_BASE = "/plugin/onoff-builder-bridge/imports/modemo";

const nextConfig: NextConfig = {
  output: "export",
  basePath: IMPORT_BASE,
  assetPrefix: IMPORT_BASE,
  trailingSlash: true,
  reactCompiler: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
