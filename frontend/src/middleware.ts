import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher(['/', '/login(.*)', '/sso-callback(.*)', '/terms(.*)', '/articles(.*)', '/api/webhooks/(.*)', '/marketplace', '/api/orders', '/api/stats', '/opengraph-image(.*)', '/twitter-image(.*)'])

export const middleware = clerkMiddleware(async (auth, request) => {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host');
  
  const isAdminDomain = host === 'admin.cryptobazaar.co.in' || host?.startsWith('admin.localhost');
  const isTargetingAdmin = isAdminDomain || url.pathname.startsWith('/admin');

  if (isTargetingAdmin) {
    // 1. IP Whitelist Check (if configured)
    const allowedIps = process.env.ADMIN_ALLOWED_IPS?.split(',').map(ip => ip.trim()).filter(Boolean) || [];
    if (allowedIps.length > 0) {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || '127.0.0.1';
      if (!allowedIps.includes(ip) && ip !== '127.0.0.1' && ip !== '::1') {
         return new NextResponse('Access Denied: IP not whitelisted', { status: 403 });
      }
    }
    
    // 2. Auth Protect (force login)
    await auth.protect();
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
