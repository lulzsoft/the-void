import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server: {
        DATABASE_URL: z.string().url(),
        NODE_ENV: z.enum(["development", "test", "production"]),
        ADMIN_SECRET: z.string().min(1).optional(),
        UPSTASH_REDIS_REST_URL: z.string().url(),
        UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
    },
    client: {
        NEXT_PUBLIC_APP_URL: z.string().url().optional(),
    },
    // If you're using Next.js < 13.4.4, you'll need to specify the runtimeEnv manually
    runtimeEnv: {
        DATABASE_URL: process.env.DATABASE_URL,
        NODE_ENV: process.env.NODE_ENV,
        ADMIN_SECRET: process.env.ADMIN_SECRET,
        UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
        UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    },
    // For Next.js >= 13.4.4, you only need to destructure client variables:
    // experimental__runtimeEnv: {
    //   NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    // }
});
