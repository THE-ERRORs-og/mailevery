// lib/cors.js
import ApiKey from '@/models/ApiKey';
import connectDB from './mongodb';

// Validate if the origin is allowed for the given API key
export async function isOriginAllowedForApiKey(apiKey, origin) {
  try {
    // No origin check needed if no origin provided
    if (!origin) return true;
    await connectDB();
    // Find the API key
    const apiKeyDoc = await ApiKey.findOne({ key: apiKey, active: true });
    if (!apiKeyDoc) return false;

    // Parse the origin
    const originUrl = new URL(origin);
    const originHostname = originUrl.hostname;
    const originWithPort = originUrl.host;
    
    // Check if localhost
    const isLocalhostRequest = originHostname === 'localhost' || originHostname === '127.0.0.1';
    
    // Check if domain is explicitly whitelisted
    const isAllowedDomain = apiKeyDoc.domains.some(domain => {
      if (domain.startsWith('*.')) {
        const baseDomain = domain.substring(2);
        return originHostname.endsWith(baseDomain);
      }
      return domain === originHostname || domain === originWithPort;
    });
    
    return isAllowedDomain || (isLocalhostRequest && apiKeyDoc.allowLocalhost);
  } catch (error) {
    console.error('Error validating origin:', error);
    return false;
  }
}

// Generate CORS headers based on the API key and origin
export async function generateCorsHeaders(apiKey, origin) {
  try {
    // Default headers
    const headers = {
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
      'Access-Control-Max-Age': '86400', // 24 hours
    };

    // If there's an origin, check if it's allowed
    if (origin) {
      const allowed = await isOriginAllowedForApiKey(apiKey, origin);
      
      if (allowed) {
        headers['Access-Control-Allow-Origin'] = origin;
        headers['Access-Control-Allow-Credentials'] = 'true';
        headers['Vary'] = 'Origin';
      }
    }
    
    return headers;
  } catch (error) {
    console.error('Error generating CORS headers:', error);
    return {};
  }
}