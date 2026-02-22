/**
 * Better-Auth client configuration for the browser environment.
 * This client provides React hooks and methods necessary to interact with auth API endpoints (sign in, sign up, session management).
 */
import { createAuthClient } from 'better-auth/react'; // Imports the factory function to create a browser-ready auth client.

// Instantiate the specialized Better-Auth client to handle network requests and local session caching.
export const authClient = createAuthClient({
  // The absolute base URL for the backend auth server endpoints (/api/auth/*).
  // It falls back to localhost for development if the public env variable is missing.
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
});

// Destructuring common auth interaction methods to expose them directly as named exports
// This makes importing them into components cleaner and easier to read.
export const { signIn, signUp, useSession, signOut } = authClient;
