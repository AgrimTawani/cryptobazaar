import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher(['/', '/login(.*)', '/sso-callback(.*)', '/terms(.*)', '/articles(.*)', '/api/webhooks/(.*)', '/marketplace', '/waitlist(.*)', '/api/waitlist(.*)', '/api/orders', '/api/stats(.*)', '/opengraph-image(.*)', '/twitter-image(.*)'])

export const middleware = clerkMiddleware(async (auth, request) => {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host');
  
  const isAdminDomain = host === 'admin.cryptobazaar.co.in' || host?.startsWith('admin.localhost');
  const isTargetingAdmin = isAdminDomain || url.pathname.startsWith('/admin') || url.pathname.startsWith('/api/admin');

  if (isTargetingAdmin) {
    // Admin routes are now protected by client-side AdminSessionGuard and API Authorization headers
  } else if (!isPublicRoute(request)) {
    await auth.protect();
  }

  // 3. Subdomain Rewrite
  if (isAdminDomain && !request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/api')) {
    url.pathname = `/admin${url.pathname === '/' ? '' : url.pathname}`;
    return NextResponse.rewrite(url);
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
