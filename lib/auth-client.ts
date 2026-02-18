/**
 * Better-Auth client configuration for the browser.
 * This client provides hooks and methods for authentication (sign in, sign up, session management).
 */
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    // The base URL for the auth server, used for API requests.
    baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
});

// Destructuring common auth methods for easier access across the application.
export const { signIn, signUp, useSession, signOut } = authClient;
