import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminPin } from '@/config/adminPinConfig';
import { generateSessionToken, ADMIN_COOKIE_NAME } from '@/lib/serverAuth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimitKey = `login:${ip}`;

    // Rate Limiting: Max 5 login attempts per 15 minutes per IP
    const rateLimitResult = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);
    if (!rateLimitResult.allowed) {
      const waitMinutes = Math.ceil(rateLimitResult.resetMs / 60000);
      return NextResponse.json(
        {
          success: false,
          message: `Bạn đã thử quá nhiều lần. Vui lòng thử lại sau ${waitMinutes} phút.`,
          isLocked: true,
          lockoutSecondsLeft: Math.ceil(rateLimitResult.resetMs / 1000),
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { pin } = body;

    if (!pin || typeof pin !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Vui lòng nhập mã PIN hợp lệ.' },
        { status: 400 }
      );
    }

    // Verify PIN strictly on server
    const matchedAccount = verifyAdminPin(pin.trim());
    if (!matchedAccount) {
      return NextResponse.json(
        {
          success: false,
          message: `Mã PIN không chính xác. Còn lại ${rateLimitResult.remaining} lần thử.`,
          remainingAttempts: rateLimitResult.remaining,
        },
        { status: 401 }
      );
    }

    // PIN is correct: Generate cryptographically signed session token
    const token = generateSessionToken(matchedAccount.role);

    const response = NextResponse.json({
      success: true,
      message: 'Đăng nhập thành công',
      user: {
        role: matchedAccount.role,
        label: matchedAccount.label,
        userIndex: matchedAccount.userIndex,
      },
    });

    // Set secure HttpOnly cookie
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: 'Lỗi hệ thống khi xử lý đăng nhập.' },
      { status: 500 }
    );
  }
}
