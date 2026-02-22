'use client'; // Required for Next.js to run this component on the client-side

import * as React from 'react'; // React hooks and core functionality
import { Moon, Sun } from 'lucide-react'; // Icons for light/dark mode
import { useTheme } from 'next-themes'; // Hook to manage theme switching

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * ModeToggle component provides a dropdown menu to switch between application themes (Light, Dark, System).
 * It uses 'next-themes' to handle the actual DOM changes.
 */
export function ModeToggle() {
  const { setTheme } = useTheme(); // Exposes the function to update the current theme context

  return (
    // DropdownMenu acts as the root container orchestrating internal state
    <DropdownMenu>
      {/* Trigger button that opens the dropdown. 'asChild' merges its props with the Button component */}
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          {/* Sun icon: Visible in light mode, rotates and shrinks away in dark mode */}
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          {/* Moon icon: Hidden in light mode, scales up and rotates into view in dark mode */}
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      {/* Dropdown content positioned to the end of the trigger button */}
      <DropdownMenuContent align="end">
        {/* Dispatches theme change to 'light' */}
        <DropdownMenuItem onClick={() => setTheme('light')}>
          Light
        </DropdownMenuItem>
        {/* Dispatches theme change to 'dark' */}
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          Dark
        </DropdownMenuItem>
        {/* Dispatches theme change to follow the user's OS preference */}
        <DropdownMenuItem onClick={() => setTheme('system')}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
