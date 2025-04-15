/**
 * Returns a fallback image for project logos that do not exist
 * The fallback is based on the project name's first character
 */
export const getImageFallback = (name: string): string => {
  // Create a simple fallback based on the first letter of the project name
  const firstChar = name.charAt(0).toUpperCase();
  
  // Generate a deterministic color from the project name
  const hash = hashCode(name);
  const hue = hash % 360;
  const saturation = 70; // Make it a bit muted
  const lightness = 45; // Not too light, not too dark

  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect width="100" height="100" fill="hsl(${hue}, ${saturation}%, ${lightness}%)"/>
    <text x="50" y="50" font-family="Arial" font-size="50" font-weight="bold" text-anchor="middle" dominant-baseline="central" fill="white">${firstChar}</text>
  </svg>`;
};

/**
 * Simple hash code function for strings
 */
const hashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

/**
 * Handle Next.js image loading errors and use fallback
 */
export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, name: string): void => {
  const target = e.target as HTMLImageElement;
  target.src = getImageFallback(name);
  target.onerror = null; // Prevent infinite error loop
}; 