import { withBotId } from "botid/next/config";
import { withEve } from "eve/next";
import type { NextConfig } from "next";

import { shopConfig } from "./lib/config";
import { withShopConfig } from "./lib/config/server";

const tunnelOrigins = ["*.ngrok-free.app", "*.ngrok-free.dev", "*.trycloudflare.com"];
const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  allowedDevOrigins: tunnelOrigins,
  cacheComponents: true,
  experimental: {
    agentUpgrade: "security",
    ...(isProduction ? {} : { serverActions: { allowedOrigins: tunnelOrigins } }),
  },
  images: {
    deviceSizes: [1320, 1920],
    imageSizes: [],
    minimumCacheTTL: 31536000,
    qualities: [75, 90],
    remotePatterns: [
      {
        hostname: "cdn.shopify.com",
        protocol: "https",
      },
    ],
    unoptimized: !!process.env.V0_CALLBACK_URL,
  },
  partialPrefetching: true,
  reactCompiler: true,
  turbopack: {
    // Hydrogen's development entry and @shopify/hydrogen/customer-account load different cart-sync symbols; pin the core entry so dev matches production.
    resolveAlias: {
      "@shopify/hydrogen": "./node_modules/@shopify/hydrogen/dist/core/index.mjs",
    },
    rules: {
      "*.css": {
        as: "*.css",
        loaders: ["@tailwindcss/turbopack"],
      },
    },
  },
};

export default withShopConfig(nextConfig, [
  shopConfig.botid.isEnabled && withBotId,
  shopConfig.agent.isEnabled && withEve,
]);
