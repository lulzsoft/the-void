import crypto from 'crypto';
import { EMAIL_ENCRYPTION_KEY_LENGTH } from './constants';

const ALGORITHM = 'aes-256-gcm';

// 32-byte key from environment variable (hex string)
function getKey(): Buffer {
    const key = process.env.EMAIL_ENCRYPTION_KEY;
    if (!key) {
        throw new Error('EMAIL_ENCRYPTION_KEY environment variable not set');
    }

    // Validate hex format and length (64 hex chars = 32 bytes)
    const hexRegex = new RegExp(`^[0-9a-fA-F]{${EMAIL_ENCRYPTION_KEY_LENGTH}}$`);
    if (!hexRegex.test(key)) {
        throw new Error(`EMAIL_ENCRYPTION_KEY must be ${EMAIL_ENCRYPTION_KEY_LENGTH} hex characters (${EMAIL_ENCRYPTION_KEY_LENGTH / 2} bytes)`);
    }

    return Buffer.from(key, 'hex');
}

/**
 * E-postayı AES-256-GCM ile şifreler
 * @param email - Şifrelenecek e-posta adresi
 * @returns Şifrelenmiş veri (format: iv:tag:encrypted, tümü hex)
 */
export function encryptEmail(email: string): string {
    if (!email) return '';

    const KEY = getKey();
    const iv = crypto.randomBytes(12); // 96-bit IV for GCM
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

    const encrypted = Buffer.concat([
        cipher.update(email, 'utf8'),
        cipher.final()
    ]);

    const tag = cipher.getAuthTag();

    // Format: iv:tag:encrypted (all hex)
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Şifrelenmiş e-postayı çözer
 * @param encryptedData - Şifrelenmiş veri (iv:tag:encrypted formatında)
 * @returns Çözülmüş e-posta adresi
 */
export function decryptEmail(encryptedData: string): string {
    if (!encryptedData) return '';

    const KEY = getKey();
    const [ivHex, tagHex, encryptedHex] = encryptedData.split(':');

    if (!ivHex || !tagHex || !encryptedHex) {
        throw new Error('Invalid encrypted email format');
    }

    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
    ]);

    return decrypted.toString('utf8');
}

/**
 * 6 haneli doğrulama kodu üretir (cryptographically secure)
 */
export function generateVerificationCode(): string {
    // Use crypto.randomInt for cryptographically secure random
    const randomNum = crypto.randomInt(100000, 1000000);
    return randomNum.toString();
}
