// E2EE Encryption utilities for member data
// Uses Web Crypto API with AES-256-GCM

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const TAG_LENGTH = 128;

// Generate a new encryption key
export async function generateKey(): Promise<CryptoKey> {
    return crypto.subtle.generateKey(
        { name: ALGORITHM, length: KEY_LENGTH },
        true, // extractable
        ['encrypt', 'decrypt']
    );
}

// Export key to base64 for storage
export async function exportKey(key: CryptoKey): Promise<string> {
    const exported = await crypto.subtle.exportKey('raw', key);
    return arrayBufferToBase64(exported);
}

// Import key from base64
export async function importKey(keyBase64: string): Promise<CryptoKey> {
    const keyData = base64ToArrayBuffer(keyBase64);
    return crypto.subtle.importKey(
        'raw',
        keyData,
        { name: ALGORITHM, length: KEY_LENGTH },
        true,
        ['encrypt', 'decrypt']
    );
}

// Encrypt data
export async function encrypt(data: string, key: CryptoKey): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);

    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    const encryptedBuffer = await crypto.subtle.encrypt(
        { name: ALGORITHM, iv, tagLength: TAG_LENGTH },
        key,
        dataBuffer
    );

    // Combine IV + encrypted data
    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedBuffer), iv.length);

    return arrayBufferToBase64(combined.buffer);
}

// Decrypt data
export async function decrypt(encryptedBase64: string, key: CryptoKey): Promise<string> {
    const combined = base64ToArrayBuffer(encryptedBase64);
    const combinedArray = new Uint8Array(combined);

    // Extract IV and encrypted data
    const iv = combinedArray.slice(0, IV_LENGTH);
    const encryptedData = combinedArray.slice(IV_LENGTH);

    const decryptedBuffer = await crypto.subtle.decrypt(
        { name: ALGORITHM, iv, tagLength: TAG_LENGTH },
        key,
        encryptedData
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
}

// Helper: ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

// Helper: Base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

// Encrypt member data object
export async function encryptMemberData(
    data: { name: string; email: string; notes?: string },
    key: CryptoKey
): Promise<string> {
    return encrypt(JSON.stringify(data), key);
}

// Decrypt member data object
export async function decryptMemberData(
    encryptedData: string,
    key: CryptoKey
): Promise<{ name: string; email: string; notes?: string }> {
    const decrypted = await decrypt(encryptedData, key);
    return JSON.parse(decrypted);
}

// Hash IP for anonymized storage
export async function hashIP(ip: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(ip + 'void-salt-' + ip.split('.').reverse().join(''));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return arrayBufferToBase64(hashBuffer);
}
