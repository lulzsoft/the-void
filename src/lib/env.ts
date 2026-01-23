import { z } from "zod";

const serverSchema = z.object({
    DATABASE_URL: z.string().url().optional(), // Optional for now if using mock
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    ADMIN_SECRET: z.string().min(1).optional(),
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
    RESEND_API_KEY: z.string().min(1).optional(),
    JWT_SECRET: z.string().min(32).optional(),
});

const clientSchema = z.object({
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

const processEnv = {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    ADMIN_SECRET: process.env.ADMIN_SECRET,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    JWT_SECRET: process.env.JWT_SECRET,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
};

// Parse and merge
const serverParsed = serverSchema.safeParse(processEnv);
const clientParsed = clientSchema.safeParse(processEnv);

if (!serverParsed.success) {
    console.error("❌ Invalid environment variables:", serverParsed.error.format());
    // In strict mode we'd throw, but for resilience we'll warn
}

if (!clientParsed.success) {
    console.error("❌ Invalid client environment variables:", clientParsed.error.format());
}

export const env = {
    ...processEnv,
    ...(serverParsed.success ? serverParsed.data : {}),
    ...(clientParsed.success ? clientParsed.data : {}),
} as const;

