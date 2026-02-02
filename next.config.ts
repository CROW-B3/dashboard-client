import type { NextConfig } from "next";

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
        transpilePackages: ["@b3-crow/ui-kit"],
        trailingSlash: true,
        generateEtags: true,
        cacheMaxMemorySize: 0,
        reactStrictMode: true,
        experimental: {
                serverMinification: true, // Enable minification to reduce bundle size
                cssChunking: true,
                inlineCss: true,
        },
        images: {
                loader: "custom",
                loaderFile: "./image-loader.ts",
                formats: ["image/avif", "image/webp"],
                deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
                imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
                minimumCacheTTL: 60 * 60 * 24 * 365,
                dangerouslyAllowSVG: true,
                contentDispositionType: "attachment",
                contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
                remotePatterns: [
                        {
                                protocol: "https",
                                hostname: "**.r2.cloudflarestorage.com",
                                port: "",
                                pathname: "/**",
                        },
                ],
        },
};

export default nextConfig;
initOpenNextCloudflareForDev();
