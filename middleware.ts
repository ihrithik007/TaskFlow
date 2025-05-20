import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Socket.io is initialized elsewhere via the app/api/socketio/route.ts
  return NextResponse.next();
}

// Only run middleware on specific paths (not for static files)
export const config = {
  matcher: [
    /*
     * Match all API routes except for Socket.io which will
     * be handled separately for WebSockets
     */
    '/((?!_next/static|_next/image|favicon.ico|api/socketio).*)',
  ],
}; 