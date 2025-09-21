/**
 * Validates if a string is a valid domain name
 * @param {string} domain - The domain to validate
 * @returns {boolean} - True if valid domain, false otherwise
 */
export function isValidDomain(domain) {
  if (!domain) return false;
  
  // Allow wildcards for subdomains (e.g., *.example.com)
  if (domain.startsWith('*.')) {
    domain = domain.substring(2);
  }
  
  // Basic regex for domain validation
  // Allows domains, subdomains, and optionally port numbers
  const domainRegex = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])(\:\d+)?$/;
  
  return domainRegex.test(domain);
}

/**
 * Validates an array of domains
 * @param {Array<string>} domains - Array of domains to validate
 * @returns {Object} - Validation result with success and any invalid domains
 */
export function validateDomains(domains) {
  if (!Array.isArray(domains)) {
    return { success: false, error: 'Domains must be an array' };
  }
  
  const invalidDomains = domains.filter(domain => !isValidDomain(domain));
  
  if (invalidDomains.length > 0) {
    return { 
      success: false, 
      error: 'Invalid domains found', 
      invalidDomains 
    };
  }
  
  return { success: true };
}