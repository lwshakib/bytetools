/**
 * Catch-all route for Better-Auth.
 * This file handles all authentication-related requests (login, logout, callback, session check)
 * by delegating them to the better-auth heart via a Next.js compatible handler.
 */
import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

export const { GET, POST } = toNextJsHandler(auth);
