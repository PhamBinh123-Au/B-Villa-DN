import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifyAdminPin, ADMIN_PINS } from '@/config/adminPinConfig';
import { verifyAdminSession } from '@/lib/serverAuth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

const PIN_CONFIG_PATH = path.join(process.cwd(), 'src', 'config', 'adminPinConfig.ts');

export async function POST(request: NextRequest) {
  try {
    // 1. Verify admin authentication
    if (!verifyAdminSession(request)) {
      return NextResponse.json(
        { success: false, message: 'Quyền truy cập bị từ chối. Vui lòng đăng nhập trang quản trị.' },
        { status: 401 }
      );
    }

    // 2. Rate limiting: Max 5 change PIN attempts per 15 minutes per IP
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`change_pin:${ip}`, 5, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: 'Bạn đã thực hiện thao tác quá nhiều lần. Vui lòng thử lại sau.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { currentPin, newPin, role = 'super_admin' } = body;

    if (!currentPin || !newPin) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng cung cấp mã PIN hiện tại và mã PIN mới.' },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(newPin)) {
      return NextResponse.json(
        { success: false, message: 'Mã PIN mới phải bao gồm đúng 6 chữ số (0-9).' },
        { status: 400 }
      );
    }

    // Verify current PIN
    const verified = verifyAdminPin(currentPin);
    if (!verified) {
      return NextResponse.json(
        { success: false, message: 'Mã PIN hiện tại không chính xác. Vui lòng thử lại.' },
        { status: 401 }
      );
    }

    // Dynamically retrieve existing PINs to avoid overwriting the other role's configured PIN
    const currentSuperAdminPin =
      Object.values(ADMIN_PINS).find((acc) => acc.role === 'super_admin' && acc.userIndex === 0)?.pin || '200928';
    const currentManagerPin =
      Object.values(ADMIN_PINS).find((acc) => acc.role === 'manager')?.pin || '000000';

    const superAdminPin = role === 'super_admin' ? newPin : currentSuperAdminPin;
    const managerPin = role === 'manager' ? newPin : currentManagerPin;

    // Generate updated config content preserving env checks
    const updatedContent = `/**
 * =======================================================================
 * CẤU HÌNH MÃ PIN ĐĂNG NHẬP TRANG QUẢN TRỊ B VILLA ĐÀ NẴNG
 * =======================================================================
 * Đường dẫn file: src/config/adminPinConfig.ts
 * 
 * HƯỚNG DẪN ĐỔI MẬT KHẨU / MÃ PIN:
 * 1. Đổi chuỗi số 6 chữ số ở khóa bên dưới (ví dụ đổi '123456' thành '898989')
 * 2. Cập nhật cả 2 chỗ: tên key ('898989') và trường pin: '898989'
 * 3. Lưu file lại. Mã PIN mới sẽ có hiệu lực ngay lập tức!
 */

export interface AdminPinAccount {
  pin: string;
  role: 'super_admin' | 'manager' | 'staff';
  label: string;
  userIndex: number;
}

export const ADMIN_PINS: Record<string, AdminPinAccount> = {
  // -------------------------------------------------------------
  // 1. MÃ PIN SUPER ADMIN (Toàn quyền quản trị hệ thống)
  // 👉 BẠN THAY ĐỔI MÃ 6 SỐ Ở ĐÂY:
  // -------------------------------------------------------------
  '${superAdminPin}': {
    pin: '${superAdminPin}',
    role: 'super_admin',
    label: 'Super Admin - Quản Trị Cao Cấp',
    userIndex: 0,
  },

  // -------------------------------------------------------------
  // 2. MÃ PIN DỰ PHÒNG / VIP (Nếu bạn muốn có thêm 1 mã phụ)
  // -------------------------------------------------------------
  '888888': {
    pin: '888888',
    role: 'super_admin',
    label: 'Super Admin (Dự Phòng)',
    userIndex: 0,
  },

  // -------------------------------------------------------------
  // 3. MÃ PIN QUẢN LÝ VILLA (Quản lý đặt phòng, lịch phòng, khách)
  // 👉 BẠN THAY ĐỔI MÃ 6 SỐ Ở ĐÂY:
  // -------------------------------------------------------------
  '${managerPin}': {
    pin: '${managerPin}',
    role: 'manager',
    label: 'Quản Lý Villa',
    userIndex: 1,
  },
};

/**
 * Hàm kiểm tra mã PIN nhập vào
 * Ưu tiên kiểm tra biến môi trường process.env để tránh hardcode trên production (Checklist #1)
 */
export function verifyAdminPin(enteredPin: string): AdminPinAccount | null {
  if (!enteredPin || typeof enteredPin !== 'string') return null;
  const trimmed = enteredPin.trim();

  // 1. Kiểm tra mã PIN Super Admin từ biến môi trường
  const envAdminPin = process.env.ADMIN_PIN || process.env.DEFAULT_ADMIN_PIN;
  if (envAdminPin && trimmed === envAdminPin) {
    return {
      pin: envAdminPin,
      role: 'super_admin',
      label: 'Super Admin',
      userIndex: 0,
    };
  }

  // 2. Kiểm tra mã PIN Quản Lý từ biến môi trường
  const envManagerPin = process.env.MANAGER_PIN || process.env.DEFAULT_MANAGER_PIN;
  if (envManagerPin && trimmed === envManagerPin) {
    return {
      pin: envManagerPin,
      role: 'manager',
      label: 'Quản Lý Villa',
      userIndex: 1,
    };
  }

  // 3. Fallback danh sách PIN nội bộ
  return ADMIN_PINS[trimmed] || null;
}
`;

    // Write to disk safely
    try {
      fs.writeFileSync(PIN_CONFIG_PATH, updatedContent, 'utf-8');
    } catch {
      // In read-only serverless/cloud environments, configuration cannot be written to disk at runtime
      return NextResponse.json(
        { 
          success: false, 
          message: 'Môi trường đám mây đang ở chế độ Read-Only. Vui lòng thiết lập biến môi trường ADMIN_PIN / MANAGER_PIN trên trang quản lý lưu trữ (Vercel / Cloud).' 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Đổi mã PIN ${role === 'super_admin' ? 'Super Admin' : 'Quản Lý'} thành công! Mã PIN mới: ${newPin}.`,
      newPin,
    });
  } catch {
    // Keep internal error details safe (Checklist Item #17 & #18)
    return NextResponse.json(
      { success: false, message: 'Lỗi hệ thống khi lưu mã PIN mới. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}
