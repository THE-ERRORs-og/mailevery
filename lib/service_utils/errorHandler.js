import { errorResponse } from './response';

/**
 * Handles errors and returns standardized error responses
 * @param {Error|Object} error - The error to handle
 * @returns {NextResponse} - Formatted error response
 */
export function handleError(error) {
  console.error('API Error:', error);

  // Handle custom error objects with status
  if (error && error.status) {
    return errorResponse({
      message: error.message || 'An error occurred',
      error: {
        type: error.name || 'Error',
        details: error.details || error.stack,
      },
      status: error.status,
    });
  }

  // Handle MongoDB validation errors
  if (error.name === 'ValidationError') {
    const errorDetails = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message,
    }));

    return errorResponse({
      message: 'Validation error',
      error: {
        type: 'ValidationError',
        details: errorDetails,
      },
      status: 400,
    });
  }

  // Handle MongoDB duplicate key errors
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    const value = Object.values(error.keyValue)[0];

    return errorResponse({
      message: `Duplicate value for ${field}`,
      error: {
        type: 'DuplicateKeyError',
        details: `${field} '${value}' already exists`,
      },
      status: 409,
    });
  }

  // Handle nodemailer errors
  if (error.code === 'EENVELOPE' || error.code === 'EAUTH' || error.code === 'ECONNECTION') {
    return errorResponse({
      message: 'Email sending failed',
      error: {
        type: 'EmailError',
        details: error.message,
      },
      status: 502,
    });
  }

  // Handle other errors
  return errorResponse({
    message: error.message || 'An unexpected error occurred',
    error: {
      type: error.name || 'InternalError',
      details: process.env.NODE_ENV === 'production' ? 'Internal server error' : (error.stack || String(error)),
    },
    status: error.status || 500,
  });
}
