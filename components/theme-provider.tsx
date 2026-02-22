'use client'; // Marks this file as a Client Component in Next.js, meaning it will be shipped to and run in the browser.

import * as React from 'react'; // Import core React libraries.
import { ThemeProvider as NextThemesProvider } from 'next-themes'; // Imports the provider component that manages dark/light mode state and DOM classes.

/**
 * A wrapper component that integrates 'next-themes' into the application.
 * It provides context to children components about the current active color theme (dark, light, system).
 * 
 * @param children - The React nodes nested inside this provider.
 * @param props - Additional configuration options passed to NextThemesProvider (e.g. defaultTheme, attribute).
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) { // Copies the Prop types expected by NextThemesProvider
  // Wraps the application hierarchy in NextThemesProvider which manipulates the <html> or <body> tags to apply theming classes.
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
