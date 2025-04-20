/**
 * Parses request data from various formats into a normalized object
 * @param {Request} request - Next.js request object
 * @returns {Promise<Object>} - Normalized data object
 */
export async function parseRequest(request) {
  try {
    // Get content-type header
    const contentType = request.headers.get('content-type') || '';
    
    // Handle URL parameters for GET/HEAD requests
    if (['GET', 'HEAD'].includes(request.method)) {
      const url = new URL(request.url);
      return Object.fromEntries(url.searchParams.entries());
    }
    
    // Handle JSON data
    if (contentType.includes('application/json')) {
      try {
        return await request.json();
      } catch (error) {
        throw { status: 400, message: 'Invalid JSON payload' };
      }
    }
    
    // Handle form data
    if (contentType.includes('multipart/form-data') || 
        contentType.includes('application/x-www-form-urlencoded')) {
      try {
        const formData = await request.formData();
        const data = {};
        
        // Convert FormData to object
        for (const [key, value] of formData.entries()) {
          // Try to parse nested JSON objects in form fields
          if (typeof value === 'string' && 
              (value.startsWith('{') || value.startsWith('['))) {
            try {
              data[key] = JSON.parse(value);
            } catch {
              data[key] = value;
            }
          } else {
            data[key] = value;
          }
        }
        
        return data;
      } catch (error) {
        throw { status: 400, message: 'Invalid form data' };
      }
    }
    
    // Handle text/plain or other content types
    try {
      const text = await request.text();
      
      // Try to parse as JSON if it looks like JSON
      if ((text.startsWith('{') && text.endsWith('}')) || 
          (text.startsWith('[') && text.endsWith(']'))) {
        try {
          return JSON.parse(text);
        } catch {
          return { data: text };
        }
      }
      
      return { data: text };
    } catch (error) {
      throw { status: 400, message: 'Could not parse request body' };
    }
  } catch (error) {
    if (error.status) throw error;
    throw { status: 500, message: 'Error parsing request data' };
  }
}
