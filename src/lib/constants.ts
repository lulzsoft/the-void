/**
 * Application-wide constants
 */

// Security
export const JWT_SECRET_MIN_LENGTH = 32;

// Session & Auth
export const SESSION_DURATION = 7 * 24 * 60 * 60; // 7 days in seconds
export const TIMING_ATTACK_DELAY = 500; // 500ms for fake delays

// Password Reset
export const RESET_CODE_TTL = 600; // 10 minutes in seconds
export const RESET_CODE_LENGTH = 6;
export const MAX_RESET_ATTEMPTS = 5;

// File Upload
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes
export const ALLOWED_FILE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
];

// Chat
export const MAX_MESSAGE_LENGTH = 1000;
export const MAX_MESSAGES_STORED = 100;
export const MIN_MESSAGE_LENGTH = 1;

// Gatekeeper
export const MIN_ANSWER_LENGTH = 20;
export const MIN_MESSAGES_FOR_VERDICT = 3;
export const MIN_PASSING_SCORE = 7.0;

// Rate Limits
export const RATE_LIMIT_WINDOW = 60; // 1 minute in seconds
export const RATE_LIMIT_MAX_REQUESTS = 20;
export const RATE_LIMIT_AUTH_MAX = 5;
export const RATE_LIMIT_UPLOAD_MAX = 10;

// Email
export const EMAIL_ENCRYPTION_KEY_LENGTH = 64; // 64 hex chars = 32 bytes
