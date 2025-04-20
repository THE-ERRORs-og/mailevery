import { NextResponse } from 'next/server';

/**
 * Creates a standardized success response object
 * @param {Object} options - Response options
 * @param {String} options.message - Success message
 * @param {Object} options.data - Response data
 * @param {Number} options.status - HTTP status code (default: 200)
 * @returns {NextResponse} - Formatted NextResponse object
 */
export function successResponse({ message = 'Success', data = {}, status = 200 }) {
  return NextResponse.json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  }, { status });
}

/**
 * Creates a standardized error response object
 * @param {Object} options - Response options
 * @param {String} options.message - Error message
 * @param {Object} options.error - Error details
 * @param {Number} options.status - HTTP status code (default: 400)
 * @returns {NextResponse} - Formatted NextResponse object
 */
export function errorResponse({ message = 'An error occurred', error = {}, status = 400 }) {
  return NextResponse.json({
    success: false,
    message,
    error,
    timestamp: new Date().toISOString(),
  }, { status });
}
