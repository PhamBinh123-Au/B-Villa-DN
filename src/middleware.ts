import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_COOKIE_NAME = 'bvilla_admin_session';

// Sensitive API endpoints requiring admin session
const PROTECTED_MUTATION_PATHS = [
  '/api/prices',
  '/api/maintenance',
  '/api/app-data',
  '/api/bookings/reset',
  '/api/bookings/sync',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;
  const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const authHeader = request.headers.get('authorization');
  const isAuthenticated = Boolean(sessionCookie || (authHeader && authHeader.startsWith('Bearer ')));

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

  // 7. Attach Comprehensive Security Headers (Checklist #19)
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/bookings',
    '/api/bookings/:path*',
    '/api/prices',
    '/api/maintenance',
    '/api/app-data',
  ],
};
