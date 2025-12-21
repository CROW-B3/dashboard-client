import { env } from "node:process";
import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({ path: ".env.local" });

export default defineConfig({
        schema: "./src/db/schema.ts",
        dialect: "sqlite",
        driver: "d1-http",
        dbCredentials: {
                // eslint-disable-next-line dot-notation
                accountId: env["CLOUDFLARE_ACCOUNT_ID"]!,
                // eslint-disable-next-line dot-notation
                databaseId: env["CLOUDFLARE_DATABASE_ID"]!,
                // eslint-disable-next-line dot-notation
                token: env["CLOUDFLARE_D1_TOKEN"]!,
        },
        out: "./drizzle/migrations",
});
