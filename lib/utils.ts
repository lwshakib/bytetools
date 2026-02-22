/**
 * Utility functions for common operations.
 * This file contains helpers for Tailwind CSS class manipulation and other shared utilities.
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names and merges Tailwind CSS classes as needed.
 * This function resolves conflicts between Tailwind classes (e.g., 'p-4' and 'p-2') by letting the latter override the former.
 * It is a standard utility pattern for building reusable React components with conditional Tailwind styling.
 * 
 * @param inputs - An array of class names, objects, or conditional values to be combined.
 * @returns A single merged string of CSS classes with conflicts resolved.
 */
export function cn(...inputs: ClassValue[]) {
  // 1. clsx(inputs) conditionally joins the provided class names into a single string.
  // 2. twMerge intelligently merges them, removing overridden Tailwind utility classes.
  return twMerge(clsx(inputs));
}
