import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher(['/', '/login(.*)', '/sso-callback(.*)', '/terms(.*)', '/articles(.*)', '/api/webhooks/(.*)', '/marketplace', '/api/orders', '/api/stats(.*)', '/opengraph-image(.*)', '/twitter-image(.*)'])

export const middleware = clerkMiddleware(async (auth, request) => {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host');
  
  const isAdminDomain = host === 'admin.cryptobazaar.co.in' || host?.startsWith('admin.localhost');
  const isTargetingAdmin = isAdminDomain || url.pathname.startsWith('/admin');

  if (isTargetingAdmin) {
    // 2. Auth Protect (Custom Admin Cookie)
    // Exclude the login page and auth API from the cookie check
    if (!url.pathname.startsWith('/admin/login') && !url.pathname.startsWith('/api/admin/auth')) {
      const adminCookie = request.cookies.get('admin_token')?.value;
      const validToken = process.env.ADMIN_PASSWORD;
      
      if (validToken && adminCookie !== validToken) {
        url.pathname = '/admin/login';
        return NextResponse.redirect(url);
      }
    }
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
