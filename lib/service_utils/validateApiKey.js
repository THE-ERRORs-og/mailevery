// validateApiKey.js
import ApiKey from "@/models/ApiKey";
import { errorResponse } from "./response";

/**
 * Validates the API key from request headers or query parameters
 * @param {Request} request - The request object
 * @returns {Promise<Object|null>} - User object if API key is valid, null otherwise
 */
export async function validateApiKey(request) {
  let apiKey = null;
  
  // Try to get API key from headers
  if (request.headers) {
    apiKey = request.headers.get ? request.headers.get("x-api-key") : request.headers["x-api-key"];
  }
  
  // If no API key in headers, check query parameters
  if (!apiKey && request.url) {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);
    apiKey = searchParams.get('apiKey') || searchParams.get('api_key') || searchParams.get('key');
  }
  
  // If still no API key, return null
  if (!apiKey) return null;

  // Use the findByKey method to get the key document and associated user
  const keyDoc = await ApiKey.findByKey(apiKey);
  
  // If the key exists and is valid, return the associated user
  if (keyDoc && keyDoc.user) {
    // Increment the usage counter
    await keyDoc.incrementUsage();
    return keyDoc.user;
  }
  
  return null;
}

/**
 * Requires a valid API key, throws error if not present or invalid
 * @param {Request} request - The request object
 * @returns {Promise<Object>} - User object if API key is valid
 * @throws {Object} - Error response object with status and message
 */
export async function requireApiKey(request) {
  let apiKey = null;
  
  // Try to get API key from headers
  if (request.headers) {
    apiKey = request.headers.get ? request.headers.get("x-api-key") : request.headers["x-api-key"];
  }
  
  // If no API key in headers, check query parameters
  if (!apiKey && request.url) {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);
    apiKey = searchParams.get('apiKey') || searchParams.get('api_key') || searchParams.get('key');
  }
  
  if (!apiKey) {
    throw errorResponse({
      message: "API key missing",
      status: 401
    });
  }
  
  const user = await validateApiKey(request);
  if (!user) {
    throw errorResponse({
      message: "Invalid API key",
      status: 401
    });
  }
  
  return user;
}


