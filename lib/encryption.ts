/**
 * Encryption utilities for securing sensitive data.
 * Uses AES-256-GCM with PBKDF2 key derivation for robust protection.
 */
import crypto from 'crypto';

// Configuration for the encryption algorithm.
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

// The master secret used for key derivation. Should be a strong, unique value from environment variables.
const MASTER_SECRET = process.env.BETTER_AUTH_SECRET || 'architect-vault-genesis-secret-key-32ch';

/**
 * Encrypts a plain text string.
 * Resulting format: base64(salt + iv + tag + encrypted_data)
 * @param text The string to encrypt.
 * @returns A base64 encoded string containing the encrypted data and necessary parameters for decryption.
 */
export function encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);
    // Derive a unique key for this encryption using PBKDF2.
    const key = crypto.pbkdf2Sync(MASTER_SECRET, salt, ITERATIONS, KEY_LENGTH, 'sha512');
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag(); // GCM authentication tag ensures data integrity.
    
    return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
}

/**
 * Decrypts a previously encrypted string.
 * @param encryptedData The base64 encoded string received from the encrypt function.
 * @returns The original decrypted plain text.
 * @throws Error if decryption fails or data has been tampered with.
 */
export function decrypt(encryptedData: string): string {
    const buffer = Buffer.from(encryptedData, 'base64');
    
    // Extract parameters from the combined buffer.
    const salt = buffer.subarray(0, SALT_LENGTH);
    const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = buffer.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const encrypted = buffer.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    
    // Re-derive the same key using the stored salt.
    const key = crypto.pbkdf2Sync(MASTER_SECRET, salt, ITERATIONS, KEY_LENGTH, 'sha512');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
}
