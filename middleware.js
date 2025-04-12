import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req) {
  const token = await getToken({ 
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const isAuthenticated = !!token;

  // If the user is not authenticated, redirect to signin
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  }

  // Add user ID to request headers
  const requestHeaders = new Headers(req.headers);
  // requestHeaders.set('x-user-id', token.sub);
  requestHeaders.set("x-user-id", token.id);
  requestHeaders.set("x-user-name", token.name);

  // Return response with modified headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/client/:path*',
  ],
}; 