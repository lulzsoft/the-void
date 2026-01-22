/**
 * Environment variable validation
 * Run this at startup to ensure all required env vars are set
 */

const requiredEnvVars = {
    // Authentication
    JWT_SECRET: {
        required: true,
        validation: (val: string) => val.length >= 32,
        error: 'JWT_SECRET must be at least 32 characters'
    },

    // Encryption
    EMAIL_ENCRYPTION_KEY: {
        required: true,
        validation: (val: string) => /^[0-9a-fA-F]{64}$/.test(val),
        error: 'EMAIL_ENCRYPTION_KEY must be 64 hex characters (32 bytes)'
    },

    // External Services
    RESEND_API_KEY: {
        required: true,
        validation: (val: string) => val.startsWith('re_'),
        error: 'RESEND_API_KEY must be a valid Resend API key (starts with re_)'
    },

    GOOGLE_GEMINI_KEY: {
        required: true,
        validation: (val: string) => val.length > 0,
        error: 'GOOGLE_GEMINI_KEY is required for Gatekeeper AI'
    },

    // Database
    KV_REST_API_URL: {
        required: true,
        validation: (val: string) => val.startsWith('https://'),
        error: 'KV_REST_API_URL must be a valid HTTPS URL'
    },

    KV_REST_API_TOKEN: {
        required: true,
        validation: (val: string) => val.length > 0,
        error: 'KV_REST_API_TOKEN is required'
    }
};

/**
 * Validates all required environment variables
 * Throws error if any validation fails
 */
export function validateEnv() {
    const errors: string[] = [];

    for (const [key, config] of Object.entries(requiredEnvVars)) {
        const value = process.env[key];

        if (!value) {
            errors.push(`Missing required environment variable: ${key}`);
            continue;
        }

        if (config.validation && !config.validation(value)) {
            errors.push(`Invalid ${key}: ${config.error}`);
        }
    }

    if (errors.length > 0) {
        throw new Error(
            `Environment variable validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}`
        );
    }

    console.log('✅ All environment variables validated successfully');
}

// Auto-run validation in non-production (catches issues early)
if (process.env.NODE_ENV !== 'production') {
    try {
        validateEnv();
    } catch (error) {
        console.error('❌ Environment validation failed:', error);
        // Don't throw in dev, just warn
    }
}
