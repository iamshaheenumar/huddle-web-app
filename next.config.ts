import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Keep visited/prefetched dynamic pages in the client router cache for 30s so
    // switching back to a tab renders instantly. Mutations purge it via revalidateAppData().
    // Static app shells hold no data (it comes from the client query cache), so
    // keep prefetched ones for an hour: offline, navigating to a cached shell
    // stays in-app instead of falling back to a full page load.
    staleTimes: {
      dynamic: 30,
      static: 3600,
    },
  },
};

export default nextConfig;
