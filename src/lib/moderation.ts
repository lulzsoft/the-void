export const BANNED_WORDS = [
    'aptal', 'salak', 'gerizekalı', 'mal', 'ahmak',
    'siktir', 'sik', 'yarrak', 'amcık', 'göt', 'orosbu', 'oç', 'piç', 'yavşak', 'ibne', 'puşt',
    'amk', 'aq', 'sikik', 'sürtük', 'kaltak'
    // Bu liste genişletilebilir
];

export interface ModerationResult {
    isClean: boolean;
    flaggedWords: string[];
}

/**
 * Normalizes text to prevent moderation bypass
 * - Removes spaces
 * - Replaces lookalike characters (İ→i, 0→o, etc.)
 * - Removes accents/diacritics
 * - Converts to lowercase
 */
function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .replace(/\s+/g, '') // Remove all spaces
        .replace(/[İıIi]/g, 'i') // Turkish i variations
        .replace(/[0oOöÖ]/g, 'o') // o variations
        .replace(/[aäÄâÂàÀ]/g, 'a') // a variations
        .replace(/[uüÜûÛùÙ]/g, 'u') // u variations
        .replace(/[eéÉêÊèÈ]/g, 'e') // e variations
        .replace(/[1lLıİ]/g, 'i') // 1/l/I confusion
        .replace(/[5sS]/g, 's') // 5/s confusion
        .replace(/[3eE]/g, 'e') // 3/e confusion
        .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Remove accents
}

export function checkProfanity(text: string): ModerationResult {
    const normalized = normalizeText(text);
    const foundWords: string[] = [];

    BANNED_WORDS.forEach(word => {
        const normalizedWord = normalizeText(word);
        if (normalized.includes(normalizedWord)) {
            foundWords.push(word);
        }
    });

    return {
        isClean: foundWords.length === 0,
        flaggedWords: foundWords
    };
}
