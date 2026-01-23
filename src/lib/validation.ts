import { z } from 'zod';

/**
 * Validation schemas for API inputs
 * Using Zod for type-safe validation and XSS protection
 */

// Helper function to sanitize strings (remove HTML/script tags)
const sanitizeString = (str: string) =>
    str
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
        .trim();

// Custom Zod transform for sanitized strings
const sanitizedString = (minLength = 1, maxLength = 1000) =>
    z.string()
        .min(minLength)
        .max(maxLength)
        .transform(sanitizeString);

/**
 * Squad Validation
 */
export const createSquadSchema = z.object({
    name: sanitizedString(3, 50),
    description: sanitizedString(10, 500),
    maxMembers: z.number().int().min(2).max(8),
    skills: z.array(sanitizedString(1, 30)).max(10).default([]),
    tags: z.array(sanitizedString(1, 20)).max(5).default([]),
});

export const updateSquadSchema = z.object({
    name: sanitizedString(3, 50).optional(),
    description: sanitizedString(10, 500).optional(),
    skills: z.array(sanitizedString(1, 30)).max(10).optional(),
    tags: z.array(sanitizedString(1, 20)).max(5).optional(),
    status: z.enum(['recruiting', 'full', 'active', 'disbanded']).optional(),
});

export type CreateSquadInput = z.infer<typeof createSquadSchema>;
export type UpdateSquadInput = z.infer<typeof updateSquadSchema>;

/**
 * Mission Validation
 */
export const createMissionSchema = z.object({
    title: sanitizedString(5, 100),
    description: sanitizedString(20, 2000),
    requirements: z.array(sanitizedString(1, 50)).max(10).default([]),
    duration: sanitizedString(1, 50),
    compensation: sanitizedString(1, 100),
    requiredSquadSize: z.number().int().min(1).max(20).optional(),
    tags: z.array(sanitizedString(1, 20)).max(10).optional(),
    remote: z.boolean().default(true),
    deadline: z.number().optional(),
});

export const updateMissionSchema = z.object({
    title: sanitizedString(5, 100).optional(),
    description: sanitizedString(20, 2000).optional(),
    requirements: z.array(sanitizedString(1, 50)).max(10).optional(),
    duration: sanitizedString(1, 50).optional(),
    compensation: sanitizedString(1, 100).optional(),
    requiredSquadSize: z.number().int().min(1).max(20).optional(),
    tags: z.array(sanitizedString(1, 20)).max(10).optional(),
    remote: z.boolean().optional(),
    deadline: z.number().optional(),
    status: z.enum(['open', 'in-progress', 'completed', 'cancelled']).optional(),
});

export const missionApplicationSchema = z.object({
    squadId: z.string().min(1),
    message: sanitizedString(0, 500).optional(),
});

export type CreateMissionInput = z.infer<typeof createMissionSchema>;
export type UpdateMissionInput = z.infer<typeof updateMissionSchema>;
export type MissionApplicationInput = z.infer<typeof missionApplicationSchema>;

/**
 * User/Auth Validation
 */
export const registerSchema = z.object({
    codename: sanitizedString(3, 30),
    username: sanitizedString(3, 30),
    password: z.string().min(8).max(100),
    skills: sanitizedString(10, 500),
    painTolerance: sanitizedString(10, 500),
    email: z.string().email().optional(),
});

export const loginSchema = z.object({
    username: sanitizedString(3, 30),
    password: z.string().min(1).max(100),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Helper function to validate and parse request body
 * Returns parsed data or error response
 */
export async function validateBody<T>(
    schema: z.ZodSchema<T>,
    body: any
): Promise<{ success: true; data: T } | { success: false; error: string }> {
    try {
        const data = await schema.parseAsync(body);
        return { success: true, data };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const firstError = error.errors[0];
            return {
                success: false,
                error: `${firstError.path.join('.')}: ${firstError.message}`,
            };
        }
        return { success: false, error: 'Validation failed' };
    }
}
