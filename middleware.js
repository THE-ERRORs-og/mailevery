import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const url = new URL(req.url);
  const pathname = url.pathname;

  const isSignupOrSignin = pathname.startsWith("/api/client/auth");
  if (isSignupOrSignin) {
    return NextResponse.next();
  }

  const isServiceApi = pathname.startsWith("/api/services");

  // API key handling for /api/services routes
  if (isServiceApi) {
    const apiKeyFromHeader = req.headers.get("x-api-key");
    const apiKeyFromQuery = url.searchParams.get("x-api-key");

    const apiKey = apiKeyFromHeader || apiKeyFromQuery;

    if (!apiKey) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "API key missing",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Add x-api-key to headers
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-api-key", apiKey);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Authenticated routes using next-auth
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const isAuthenticated = !!token;

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-id", token.id);
  requestHeaders.set("x-user-name", token.name);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/client/:path*", "/api/services/:path*"],
};
