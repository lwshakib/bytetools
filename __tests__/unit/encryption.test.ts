import { encrypt, decrypt } from '@/lib/encryption';

describe('Encryption Utilities', () => {
  const testMessage = 'Hello, this is a secret message!';

  it('should encrypt and decrypt correctly', () => {
    const encrypted = encrypt(testMessage);
    expect(encrypted).not.toBe(testMessage);

    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(testMessage);
  });

  it('should produce different ciphertexts for the same message (due to salt/iv)', () => {
    const encrypted1 = encrypt(testMessage);
    const encrypted2 = encrypt(testMessage);
    expect(encrypted1).not.toBe(encrypted2);
  });

  it('should fail to decrypt if data is tampered with', () => {
    const encrypted = encrypt(testMessage);
    const tampered = Buffer.from(encrypted, 'base64');
    // Flip a bit in the encrypted data
    tampered[tampered.length - 1] ^= 0x01;
    const tamperedBase64 = tampered.toString('base64');

    expect(() => decrypt(tamperedBase64)).toThrow();
  });
});
