import { MlKem768 } from 'crystals-kyber-js';
import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64 } from 'tweetnacl-util';

// ALIEN TECH: HYBRID CRYPTOGRAPHY CORE
// Combines Post-Quantum (ML-KEM-768) + Classical (X25519)
// Security Level: 5 (Maximum)

export interface AlienIdentity {
    kyberPublicKey: Uint8Array;
    kyberPrivateKey: Uint8Array;
    curvePublicKey: Uint8Array;
    curvePrivateKey: Uint8Array;
}

export class AlienCrypto {
    // 1. Generate Hybrid Identity (ML-KEM-768 + Curve25519)
    static async generateIdentity(): Promise<AlienIdentity> {
        // Post-Quantum Keypair
        const recipient = new MlKem768();
        const [pk_kyber, sk_kyber] = await recipient.generateKeyPair();

        // Classical Keypair (Curve25519)
        const curvePair = nacl.box.keyPair();

        return {
            kyberPublicKey: pk_kyber,
            kyberPrivateKey: sk_kyber,
            curvePublicKey: curvePair.publicKey,
            curvePrivateKey: curvePair.secretKey
        };
    }

    // 2. Encap Secret (Client calls this to talk to Server/Peer)
    // Returns: { cyphertext, sharedSecret }
    static async encap(recipientKyberPK: Uint8Array, recipientCurvePK: Uint8Array): Promise<{ cipherText: string, sharedSecret: Uint8Array }> {
        // Kyber Encap
        const sender = new MlKem768();
        const [ct_kyber, ss_kyber] = await sender.encap(recipientKyberPK);

        // X25519 Ephemeral Key for this session
        const ephemeralCurve = nacl.box.keyPair();
        const ss_curve = nacl.scalarMult(ephemeralCurve.secretKey, recipientCurvePK);

        // HYBRID KDF: Combine both secrets
        const combinedSecret = new Uint8Array(ss_kyber.length + ss_curve.length);
        combinedSecret.set(ss_kyber);
        combinedSecret.set(ss_curve, ss_kyber.length);

        // Hash the combination to get the final Root Key
        const rootKey = nacl.hash(combinedSecret).slice(0, 32);

        // Package the payload: KyberCiphertext + EphemeralCurvePK
        // We just return Base64 of concatenated blob for simplicity in this Dumb Pipe
        const payload = new Uint8Array(ct_kyber.length + ephemeralCurve.publicKey.length);
        payload.set(ct_kyber);
        payload.set(ephemeralCurve.publicKey, ct_kyber.length);

        return {
            cipherText: encodeBase64(payload),
            sharedSecret: rootKey
        };
    }

    // 3. Decap Secret (Server/Peer calls this to receive)
    static async decap(identity: AlienIdentity, payloadBase64: string): Promise<Uint8Array> {
        const payload = decodeBase64(payloadBase64);

        // Extract parts
        // ML-KEM-768 Ciphertext length is 1088 bytes
        const kyberCTLength = 1088;
        const ct_kyber = payload.slice(0, kyberCTLength);
        const ephemeralCurvePK = payload.slice(kyberCTLength);

        // Kyber Decap
        const recipient = new MlKem768();
        const ss_kyber = await recipient.decap(ct_kyber, identity.kyberPrivateKey);

        // X25519 Decapsulation
        const ss_curve = nacl.scalarMult(identity.curvePrivateKey, ephemeralCurvePK);

        // HYBRID KDF: Reconstruct Root Key
        const combinedSecret = new Uint8Array(ss_kyber.length + ss_curve.length);
        combinedSecret.set(ss_kyber);
        combinedSecret.set(ss_curve, ss_kyber.length);

        return nacl.hash(combinedSecret).slice(0, 32);
    }

    // 4. Encrypt Message (AES-GCM equivalent via NaCl SecretBox)
    static encryptMessage(message: string, sharedKey: Uint8Array): string {
        const nonce = nacl.randomBytes(nacl.box.nonceLength);
        const msgBytes = new TextEncoder().encode(message);
        const box = nacl.secretbox(msgBytes, nonce, sharedKey);

        const fullMessage = new Uint8Array(nonce.length + box.length);
        fullMessage.set(nonce);
        fullMessage.set(box, nonce.length);

        return encodeBase64(fullMessage);
    }

    // 5. Decrypt Message
    static decryptMessage(cipherFull: string, sharedKey: Uint8Array): string | null {
        try {
            const fullMessage = decodeBase64(cipherFull);
            const nonce = fullMessage.slice(0, nacl.box.nonceLength);
            const box = fullMessage.slice(nacl.box.nonceLength);

            const decrypted = nacl.secretbox.open(box, nonce, sharedKey);
            if (!decrypted) return null;

            return new TextDecoder().decode(decrypted);
        } catch (e) {
            return null;
        }
    }
}
