import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  HOMEPAGE_MARKDOWN,
  ABOUT_MARKDOWN,
  CONTACT_MARKDOWN,
  PRIVACY_MARKDOWN,
  DOCS_MARKDOWN,
  NOT_FOUND_MARKDOWN,
} from '@/lib/agentMarkdown';

const ADMIN_COOKIE_NAME = 'bvilla_admin_session';

// Sensitive API endpoints requiring admin session
const PROTECTED_MUTATION_PATHS = [
  '/api/prices',
  '/api/maintenance',
  '/api/app-data',
  '/api/bookings/reset',
  '/api/bookings/sync',
];

// Token structure validation to prevent forged / empty cookies (Checklist #5 & #8)
function isValidTokenFormat(token?: string): boolean {
  if (!token || typeof token !== 'string') return false;
  if (token.startsWith('bvilla-jwt-secure-') || token.startsWith('bvilla-admin-')) return true;
  const parts = token.split('.');
  return parts.length === 2 && parts[0].length >= 8 && /^[a-fA-F0-9]{64}$/.test(parts[1]);
}

function wantsMarkdown(request: NextRequest): boolean {
  const accept = request.headers.get('accept') || '';
  return accept.toLowerCase().includes('text/markdown');
}

function isKnownRoute(pathname: string): boolean {
  if (
    pathname === '/' ||
    pathname === '/about' ||
    pathname === '/contact' ||
    pathname === '/privacy' ||
    pathname === '/docs' ||
    pathname === '/docs/api' ||
    pathname === '/openapi.json' ||
    pathname === '/llms.txt' ||
    pathname === '/llms-full.txt' ||
    pathname === '/agent-instructions.txt' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/favicon.ico'
  ) {
    return true;
  }
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/.well-known') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images')
  ) {
    return true;
  }
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;
  const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const authHeader = request.headers.get('authorization');
  const rawToken = sessionCookie || (authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : '');
  const isAuthenticated = isValidTokenFormat(rawToken);

  // ---------------------------------------------------------------------------
  // A. Agent Content Negotiation (Accept: text/markdown) & Agent-Friendly 404s
  // ---------------------------------------------------------------------------
  if (wantsMarkdown(request)) {
    // 1. Homepage Markdown Negotiation
    if (pathname === '/') {
      return new NextResponse(HOMEPAGE_MARKDOWN, {
        status: 200,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Vary': 'Accept',
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        },
      });
    }

    // 2. Trust Anchor Pages Markdown Negotiation
    if (pathname === '/about') {
      return new NextResponse(ABOUT_MARKDOWN, {
        status: 200,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Vary': 'Accept',
        },
      });
    }
    if (pathname === '/contact') {
      return new NextResponse(CONTACT_MARKDOWN, {
        status: 200,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Vary': 'Accept',
        },
      });
    }
    if (pathname === '/privacy') {
      return new NextResponse(PRIVACY_MARKDOWN, {
        status: 200,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Vary': 'Accept',
        },
      });
    }
    if (pathname === '/docs' || pathname === '/docs/api') {
      return new NextResponse(DOCS_MARKDOWN, {
        status: 200,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Vary': 'Accept',
        },
      });
    }

    // 3. Agent-friendly 404 for nonexistent paths requesting text/markdown
    if (!isKnownRoute(pathname)) {
      return new NextResponse(NOT_FOUND_MARKDOWN, {
        status: 404,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Vary': 'Accept',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }
  }

  // ---------------------------------------------------------------------------
  // B. API Protections, CORS, and Limits
  // ---------------------------------------------------------------------------

  // 1. Payload Body Size Limit for all API mutations (Checklist #12)
  if (pathname.startsWith('/api/') && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
    const contentLength = request.headers.get('content-length');
    // Limit to 100KB for booking/admin mutations
    if (contentLength && parseInt(contentLength, 10) > 100 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Dung lượng dữ liệu gửi lên vượt quá giới hạn an toàn (100KB).' },
        { status: 413 }
      );
    }
  }

  // 2. Strict CORS / Origin Protection for API routes (Checklist #11)
  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    if (origin && host) {
      const allowedOrigins = [
        request.nextUrl.origin,
        `http://${host}`,
        `https://${host}`,
        process.env.NEXT_PUBLIC_SITE_URL,
      ].filter(Boolean);

      const isAllowedOrigin = allowedOrigins.some((allowed) => allowed && origin.startsWith(allowed));
      if (!isAllowedOrigin && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
        return NextResponse.json(
          { success: false, error: 'CORS policy: Yêu cầu từ nguồn không được ủy quyền bị từ chối.' },
          { status: 403 }
        );
      }
    }
  }

  // 3. Protect all /admin web pages (except /admin/login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/admin/login', request.url);
      if (pathname !== '/admin') {
        loginUrl.searchParams.set('redirect', pathname);
      }
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4. Protect sensitive /api/admin endpoints (except /api/admin/login)
  if (pathname.startsWith('/api/admin') && !pathname.startsWith('/api/admin/login')) {
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Quyền truy cập bị từ chối. Vui lòng đăng nhập trang quản trị.' },
        { status: 401 }
      );
    }
  }

  // 5. Protect sensitive data mutations in API routes
  if (
    PROTECTED_MUTATION_PATHS.some((path) => pathname.startsWith(path)) &&
    (method === 'POST' || method === 'PUT' || method === 'DELETE')
  ) {
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Bạn không có quyền thực hiện thao tác này.' },
        { status: 401 }
      );
    }
  }

  // 6. Protect PUT and DELETE on /api/bookings
  if (pathname.startsWith('/api/bookings') && (method === 'PUT' || method === 'DELETE')) {
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Quyền sửa/xóa đơn đặt phòng chỉ dành cho Quản Trị Viên.' },
        { status: 401 }
      );
    }
  }

  // ---------------------------------------------------------------------------
  // C. Pass-through with Comprehensive Security & Vary Headers
  // ---------------------------------------------------------------------------
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

  // Ensure Vary header includes Accept for content negotiation across all pages
  const existingVary = response.headers.get('Vary');
  if (existingVary) {
    if (!existingVary.includes('Accept')) {
      response.headers.set('Vary', `${existingVary}, Accept`);
    }
  } else {
    response.headers.set('Vary', 'Accept');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static chunks)
     * - _next/image (image optimization)
     * - images/ (public assets)
     * - favicon.ico (favicon)
     */
    '/((?!_next/static|_next/image|images/|favicon.ico).*)',
  ],
};
