import type { Metadata } from 'next'; // Next.js metadata API types for SEO
import { Geist, Geist_Mono } from 'next/font/google'; // Optimized Google fonts provided by Next.js
import './globals.css'; // Global CSS containing Tailwind directives and theme variables

// Initialize and configure the Geist Sans font
const geistSans = Geist({
  variable: '--font-geist-sans', // CSS variable to be attached to the root for custom styling
  subsets: ['latin'], // Include latin characters
});

// Initialize and configure the Geist Mono font
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Next.js standard metadata export to define static HTML <head> tags like title, description, and favicons.
export const metadata: Metadata = {
  title: 'ByteTools - Essential Developer Utilities & Tools',
  description:
    'A comprehensive suite of developer tools including URL shortening, QR code generation, and more to streamline your workflow.',
  icons: {
    icon: [
      {
        url: '/favicon_io/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        url: '/favicon_io/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      { url: '/favicon_io/favicon.ico', sizes: 'any', type: 'image/x-icon' },
      {
        url: '/favicon_io/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/favicon_io/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    apple: '/favicon_io/apple-touch-icon.png',
  },
  manifest: '/favicon_io/site.webmanifest',
};

// Global Providers & floating components
import { ThemeProvider } from '@/components/theme-provider'; // Wrapper for next-themes to handle dark/light mode
import { Toaster } from '@/components/ui/sonner'; // Global toast notification container
import { AuthModal } from '@/components/auth-modal'; // Global authentication modal component
import { VerificationListener } from '@/components/verification-listener'; // Listens to auth events to handle verification redirects

/**
 * The RootLayout is a specialized Next.js component that wraps all pages.
 * It is responsible for injecting global CSS, fonts, metadata, and app-wide context providers.
 */
export default function RootLayout({
  children, // Represents the distinct page components rendered within the application hierarchy.
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning prevents mismatch errors caused by third-party extensions manipulating the DOM (like theme injectors)
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body
        // Attach the optimized Google Font CSS variables to the document body, enabling them in Tailwind
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* ThemeProvider intelligently wraps the app to monitor OS or manual dark/light mode switches */}
        <ThemeProvider
          attribute="class" // Alters the HTML class attribute (compatible with Tailwind Dark Mode strategy)
          defaultTheme="system" // Falls back to OS preference initially
          enableSystem // Allow tracking the OS theme preference changes
          disableTransitionOnChange // Prevents jarring flash of animations when switching themes
        >
          {children} {/* Renders the actual navigated page content */}
          {/* Below are floating UI elements that exist globally above specific pages */}
          <Toaster /> {/* Mounts the toast notification stack */}
          <AuthModal /> {/* Mounts the global Auth Modal, managed by Zustand */}
          <VerificationListener />{' '}
          {/* Invisible component actively handling auth callback verifications */}
        </ThemeProvider>
      </body>
    </html>
  );
}
