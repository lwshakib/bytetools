/**
 * Custom hook to detect if the current device is a mobile device based on screen width.
 * Useful for adjusting UI layouts dynamically without strictly relying on CSS media queries.
 */
import * as React from 'react';

// Standard mobile breakpoint in pixels. Any viewport narrower than this is considered "mobile".
const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  // State to track if the viewport matches the mobile breakpoint.
  // Initialized to undefined instead of false to prevent hydration mismatches during SSR.
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined
  );

  React.useEffect(() => {
    // Determine the media query string dynamically based on our constant
    // e.g., "(max-width: 767px)" means width is strictly less than the breakpoint
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    // Callback event listener tailored to update our internal state when the viewport crosses the threshold.
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Subscribe to resize events using the Media Query List API (much more performant than global `resize` event)
    mql.addEventListener('change', onChange);

    // Explicitly set the initial state right after mounting to trigger the correct render pass instantly if on mobile
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    // Cleanup function automatically executing on unmount to prevent memory leaks from stray listeners
    return () => mql.removeEventListener('change', onChange);
  }, []); // Empty dependency array ensures this effect runs exactly once when the component mounts.

  // Double negation effectively coerces `undefined` (SSR initial state) to `false` preventing tricky undefined return states
  return !!isMobile;
}
