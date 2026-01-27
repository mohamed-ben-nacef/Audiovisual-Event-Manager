import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/"]
  const isPublicRoute = publicRoutes.some((route) => request.nextUrl.pathname === route)

  // Check for auth token in cookies or headers
  const token = request.cookies.get("auth_token")?.value ||
    request.headers.get("authorization")

  // If accessing a protected route without token, redirect to login
  if (!isPublicRoute && !token) {
    // Check localStorage on client side instead
    // Server-side middleware can't access localStorage
    // So we'll handle this in the layout components
    return NextResponse.next()
  }

  // If accessing login page while authenticated, redirect to dashboard
  if (request.nextUrl.pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
