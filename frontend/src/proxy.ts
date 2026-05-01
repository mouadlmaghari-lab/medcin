import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

// Routes that require authentication
const PROTECTED_PREFIXES = ['/doctor', '/assistant'];
// Routes accessible only when NOT authenticated
const AUTH_ROUTES = ['/login', '/forgot-password'];

function getTokenFromRequest(request: NextRequest): string | null {
  // Check cookie (set by SSR) or rely on client-side store
  return request.cookies.get('tabibcare_token')?.value ?? null;
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Strip locale prefix to get the real path
  const pathWithoutLocale = pathname.replace(/^\/(fr|ar|en)/, '') || '/';

  const isProtected = PROTECTED_PREFIXES.some((p) =>
    pathWithoutLocale.startsWith(p),
  );
  const isAuthRoute = AUTH_ROUTES.some((p) => pathWithoutLocale.startsWith(p));

  const token = getTokenFromRequest(request);

  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && token) {
    const role = request.cookies.get('tabibcare_role')?.value;
    const dest = role === 'secretary' ? '/assistant/dashboard' : '/doctor/dashboard';
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/',
    '/(fr|ar|en)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
