/**
 * Catch-all route for Better-Auth.
 * This file handles all authentication-related requests (login, logout, callback, session check)
 * by delegating them to the better-auth heart via a Next.js compatible handler.
 */
import { auth } from '@/lib/auth'; // Imports the core Better-Auth instance configured for this project
import { toNextJsHandler } from 'better-auth/next-js'; // Utility to adapt the auth logic strictly into Next.js App Router compatible methods

// Generates both GET and POST HTTP handlers dynamically and exports them targeting `/api/auth/*` routes
export const { GET, POST } = toNextJsHandler(auth);
