/**
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
  '123456': {
    pin: '123456',
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
  '654321': {
    pin: '654321',
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
