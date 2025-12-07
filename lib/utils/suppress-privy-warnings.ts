/**
 * Utility to suppress Privy-related React warnings
 * These warnings occur because:
 * 1. Privy renders <div> inside <p> tags, which is invalid HTML but doesn't affect functionality
 * 2. Privy's internal components may render lists without keys, which triggers React warnings
 * 
 * This suppresses these warnings in development to clean up console output.
 * In production, React handles these gracefully and they don't appear in user consoles.
 */

if (typeof window !== 'undefined') {
  // Only suppress in development to avoid hiding real errors in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    // Store the original console.error before we override it
    const originalError = console.error.bind(console);
    
    console.error = function(...args: unknown[]) {
      // Only check string arguments to avoid circular reference issues
      // React warnings are typically the first argument as a string
      const firstArg = args[0];
      const message = typeof firstArg === 'string' ? firstArg : '';
      
      // Check if this is the Privy hydration warning or a key prop warning from Privy
      const isPrivyWarning = 
        message.includes('cannot be a descendant of <p>') ||
        message.includes('cannot appear as a descendant of <p>') ||
        message.includes('HelpTextContainer') ||
        message.includes('validateDOMNesting') ||
        (message.includes('Each child in a list should have a unique "key" prop') &&
         message.includes('Check the render method of'));
      
      if (isPrivyWarning) {
        // Suppress this specific warning - it's a known Privy issue that doesn't affect functionality
        return;
      }
      
      // Call original console.error for all other messages
      // Using bind ensures we call the original function, not our wrapper
      originalError(...args);
    };
  }
}

