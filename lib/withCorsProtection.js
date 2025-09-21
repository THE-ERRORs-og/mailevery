// lib/withCorsProtection.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ApiKey from '@/models/ApiKey';
import { isOriginAllowedForApiKey, generateCorsHeaders } from '@/lib/cors';

/**
 * Higher-order function that wraps an API route handler with CORS protection.
 * @param {Function} handler - The original route handler function
 * @returns {Function} - The wrapped route handler with CORS protection
 */
export function withCorsProtection(handler) {
  return async function corsProtectedHandler(req, ...args) {
    // Get API key from headers or query params
    const apiKeyFromHeader = req.headers.get('x-api-key');
    const url = new URL(req.url);
    const apiKeyFromQuery = url.searchParams.get('x-api-key');
    const apiKey = apiKeyFromHeader || apiKeyFromQuery;
    
    // Handle preflight OPTIONS request separately with CORS headers
    if (req.method === 'OPTIONS') {
      // For OPTIONS requests, we need a more permissive approach
      const origin = req.headers.get('origin');
      const headers = {
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
        'Access-Control-Max-Age': '86400', // 24 hours
      };
      
      // If we have an API key and origin, attempt to validate
      if (apiKey && origin) {
        try {
          await connectDB();
          const apiKeyDoc = await ApiKey.findOne({ key: apiKey, active: true });
          
          if (apiKeyDoc) {
            // Use the isOriginAllowedForApiKey function for consistent validation
            const isAllowed = await isOriginAllowedForApiKey(apiKey, origin);
            
            if (isAllowed) {
              headers['Access-Control-Allow-Origin'] = origin;
              headers['Access-Control-Allow-Credentials'] = 'true';
              headers['Vary'] = 'Origin';
            }
          }
        } catch (error) {
          console.error('Error processing OPTIONS request:', error);
          // Even in case of error, try to send a valid CORS response for debugging
          if (origin) {
            headers['Access-Control-Allow-Origin'] = origin;
          }
        }
      } else if (origin) {
        // If no API key but origin is present, set permissive headers for better debugging
        headers['Access-Control-Allow-Origin'] = origin;
      }
      
      return new NextResponse(null, { status: 204, headers });
    }
    
    // For non-OPTIONS requests, we handle CORS manually
    try {
      if (!apiKey) {
        return NextResponse.json(
          { success: false, message: 'API key missing' },
          { status: 401 }
        );
      }
      
      await connectDB();
      const apiKeyDoc = await ApiKey.findOne({ key: apiKey, active: true });
      
      if (!apiKeyDoc) {
        return NextResponse.json(
          { success: false, message: 'Invalid API key' },
          { status: 401 }
        );
      }
      
      // Get the origin from request headers
      const origin = req.headers.get('origin');
      
      // Validate origin before proceeding (moved from middleware)
      if (origin) {
        // Check if the origin is allowed for this API key
        const isAllowed = await isOriginAllowedForApiKey(apiKey, origin);
        
        if (!isAllowed) {
          // Return a proper CORS error response that browsers can display
          const corsErrorHeaders = {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
          };
          
          return NextResponse.json(
            { success: false, message: 'Origin not allowed for this API key' },
            { status: 403, headers: corsErrorHeaders }
          );
        }
      }
      
      // Increment API key usage
      await apiKeyDoc.incrementUsage();
      
      // Call the original handler
      const response = await handler(req, ...args);
      
      // Add CORS headers to the response
      if (response instanceof NextResponse) {
        const origin = req.headers.get('origin');
        if (origin) {
          // Generate the appropriate CORS headers based on API key and origin
          const corsHeaders = await generateCorsHeaders(apiKey, origin);
          
          // Create a new response with the updated headers
          const headers = new Headers(response.headers);
          
          // Add all CORS headers
          Object.entries(corsHeaders).forEach(([key, value]) => {
            headers.set(key, value);
          });
          
          // Create a new response with the updated headers
          return new NextResponse(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers
          });
        }
      }
      
      return response;
    } catch (error) {
      console.error('Error in CORS-protected route:', error);
      
      // Get origin for potential CORS headers in error response
      const origin = req.headers.get('origin');
      let headers = {
        'Content-Type': 'application/json'
      };
      
      // If there's an origin, try to add CORS headers even in error cases
      // This helps browsers display the error instead of a generic CORS failure
      if (origin) {
        headers = {
          ...headers,
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
        };
      }
      
      // Determine if error is related to origin validation
      if (error.message && (error.message.includes('origin') || error.message.includes('CORS') || error.message.includes('domain'))) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Origin validation failed', 
            error: error.message 
          },
          { status: 403, headers }
        );
      }
      
      // Generic server error
      return NextResponse.json(
        { success: false, message: 'Internal server error' },
        { status: 500, headers }
      );
    }
  };
}