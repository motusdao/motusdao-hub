/**
 * Utility to suppress Privy hydration warnings
 * These warnings occur because Privy renders <div> inside <p> tags,
 * which is invalid HTML but doesn't affect functionality.
 * 
 * This suppresses the warnings in development to clean up console output.
 * In production, React handles these gracefully and they don't appear in user consoles.
 */

if (typeof window !== 'undefined') {
  // Only suppress in development to avoid hiding real errors in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    const originalError = console.error;
    
    console.error = (...args: any[]) => {
      // Suppress the specific Privy hydration warning
      const firstArg = args[0];
      
      // Check if this is the Privy hydration warning
      const isPrivyWarning = 
        (typeof firstArg === 'string' &&
         (firstArg.includes('cannot be a descendant of <p>') ||
          firstArg.includes('cannot appear as a descendant of <p>') ||
          firstArg.includes('HelpTextContainer') ||
          firstArg.includes('validateDOMNesting'))) ||
        (firstArg?.props?.children && 
         typeof firstArg.props.children === 'string' &&
         firstArg.props.children.includes('HelpTextContainer'));
      
      if (isPrivyWarning) {
        // Suppress this specific warning - it's a known Privy issue that doesn't affect functionality
        return;
      }
      
      // Call original console.error for all other messages
      originalError.apply(console, args);
    };
  }
}

