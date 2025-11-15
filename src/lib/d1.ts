import { getCloudflareContext } from "@opennextjs/cloudflare";
import { upstashCache } from "drizzle-orm/cache/upstash";
import { drizzle } from "drizzle-orm/d1";
import { cache } from "react";
import { logger } from "@/lib/logger";
import * as schema from "../db/schema";

export const getDb = cache(() => {
        try {
                const { env } = getCloudflareContext();
                return drizzle((env as any).DB_MAIN, {
                        schema,
                        logger: true,
                        cache: upstashCache({
                                // eslint-disable-next-line dot-notation
                                url: process.env["UPSTASH_URL"]!,
                                // eslint-disable-next-line dot-notation
                                token: process.env["UPSTASH_TOKEN"]!,
                                global: true,
                                config: { ex: 60 },
                        }),
                });
        } catch (error) {
                logger.error({ err: error }, "Cloudflare context not available");
                throw new Error(
                        'Database not available. Please run with "wrangler dev" or use "--remote" flag for D1 operations in development.',
                );
        }
});
