import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Keep visited/prefetched dynamic pages in the client router cache for 30s so
    // switching back to a tab renders instantly. Mutations purge it via revalidateAppData().
    staleTimes: {
      dynamic: 30,
    },
  },
};

export default nextConfig;
