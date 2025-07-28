"use client";

import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768; // Corresponds to Tailwind's `md` breakpoint

/**
 * A hook to check if the current screen width is mobile-sized.
 * It listens for resize events to ensure the value is always up-to-date.
 * @returns {boolean} `true` if the screen width is less than `MOBILE_BREAKPOINT`, `false` otherwise.
 */
export function useIsMobile(): boolean {
  // Initialize state to a default value, `false`.
  // This helps prevent hydration mismatches between server and client.
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // This function will be called to check the window size.
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Run the check once on component mount.
    checkIsMobile(); 

    // Add an event listener to re-check when the window is resized.
    window.addEventListener('resize', checkIsMobile);

    // Cleanup: remove the event listener when the component unmounts.
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []); // The empty dependency array ensures this effect runs only once on mount.

  return isMobile;
} 