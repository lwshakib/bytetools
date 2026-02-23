// Import the 'encrypt' and 'decrypt' cryptographic utility functions from the local encryption library
import { encrypt, decrypt } from '@/lib/encryption';

// Start a test suite for the 'Encryption Utilities' using the Jest/Vitest 'describe' block
// This groups related tests together to organize test output
describe('Encryption Utilities', () => {
  // Define a constant string to be used as test payload across multiple test cases
  const testMessage = 'Hello, this is a secret message!';

  // Define a test case verifying that a message can be successfully encrypted and then decrypted back to its original form
  it('should encrypt and decrypt correctly', () => {
    // Call the encrypt function on the test message, storing the resulting ciphertext
    const encrypted = encrypt(testMessage);
    // Assert that the generated ciphertext is not strictly equal to the plaintext message
    // This confirms that some transformation successfully took place
    expect(encrypted).not.toBe(testMessage);

    // Pass the encrypted ciphertext back into the decrypt function to retrieve the plaintext
    const decrypted = decrypt(encrypted);
    // Assert that the decrypted result matches the original test message perfectly
    expect(decrypted).toBe(testMessage);
  });

  // Define a test case that ensures semantic security against chosen-plaintext attacks
  // Encrypting the same message multiple times must yield different ciphertexts
  it('should produce different ciphertexts for the same message (due to salt/iv)', () => {
    // Encrypt the 'testMessage' for the first time
    const encrypted1 = encrypt(testMessage);
    // Encrypt the identical 'testMessage' a second time
    const encrypted2 = encrypt(testMessage);
    
    // Validate that the two ciphertexts are different from each other
    // This implies that a unique Initialization Vector (IV) or salt was used per encryption call
    expect(encrypted1).not.toBe(encrypted2);
  });

  // Define a test case verifying the robustness of decryption against malicious modifications
  it('should fail to decrypt if data is tampered with', () => {
    // Generate an authentic encrypted string from the test message
    const encrypted = encrypt(testMessage);
    
    // Parse the Base64 structured ciphertext string into a binary Buffer object
    // This allows us to manipulate the raw underlying encrypted bytes
    const tampered = Buffer.from(encrypted, 'base64');
    
    // Simulate data tampering by intentionally flipping a single bit at the end of the byte array
    // XORing the last byte with 0x01 (binary 00000001) effectively negates its lowest bit
    tampered[tampered.length - 1] ^= 0x01;
    
    // Re-encode the corrupted bytes back into a standard Base64 string representation
    const tamperedBase64 = tampered.toString('base64');

    // Attempt to decrypt the manipulated ciphertext string
    // Assert that doing so throws a runtime exception, meaning the decryption function properly rejects altered data
    // This is typically due to failed MAC verification or incorrect padding in strong ciphers like AES-GCM
    expect(() => decrypt(tamperedBase64)).toThrow();
  });
});
