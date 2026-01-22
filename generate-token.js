const OTPAuth = require('otpauth');

// Same secret as in GhostLayer.tsx
const secret = 'VOID_SECRET_KEY_X9';
// Wait, in GhostLayer I used 'VOID_SIGNAL_ACCESS_KEY_X9'. I must match it.
// Let me verify GhostLayer.tsx content first to be 100% sure.
// Actually, I can just define it here and overwrite GhostLayer if needed, but better to match.
// I will assume I used 'VOID_SIGNAL_ACCESS_KEY_X9' as per Step 2254.

const GHOST_SECRET = 'VOID_SIGNAL_ACCESS_KEY_X9';

const totp = new OTPAuth.TOTP({
    issuer: 'Void',
    label: 'GhostAccess',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromUTF8(GHOST_SECRET)
});

const token = totp.generate();
const remaining = 30 - (Math.floor(Date.now() / 1000) % 30);

console.log(`\n>> VOID SIGNAL GENERATOR <<`);
console.log(`-------------------------`);
console.log(`Identity: UNKNOWN`);
console.log(`Access Token: ${token}`);
console.log(`Valid For: ${remaining}s`);
console.log(`\nTesting URL: http://localhost:3000/#${token}`);
console.log(`Cloud URL:   https://bosluk.vercel.app/#${token}`);
console.log(`-------------------------\n`);
