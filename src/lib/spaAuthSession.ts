/**
 * In-memory SPA Session Controller for B Villa Da Nang Admin.
 * 
 * BẢO MẬT TỐI ĐA TRÊN CẢ MÁY TÍNH VÀ ĐIỆN THOẠI:
 * - Phiên đăng nhập chỉ tồn tại trong bộ nhớ RAM của phiên SPA hiện tại.
 * - Bất kỳ khi nào người dùng nhấn F5, Reload, Tải lại trang, Kéo để refresh trên điện thoại,
 *   hoặc mở tab mới: Toàn bộ bộ nhớ bị xóa sạch ngay lập tức -> Bắt buộc phải đăng nhập lại.
 * - Điều hướng nội bộ trong dashboard (SPA routing: bấm menu, link, nút) vẫn giữ đăng nhập mượt mà.
 */

let _spaSessionActive = false;

/**
 * Đánh dấu phiên SPA đang hoạt động (gọi ngay sau khi đăng nhập thành công)
 */
export function markSpaSessionActive(): void {
  _spaSessionActive = true;
}

/**
 * Xóa sạch phiên đăng nhập (khi F5, reload hoặc bấm Đăng xuất)
 */
export function clearSpaSession(): void {
  _spaSessionActive = false;
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('bvilla_admin_session');
    localStorage.removeItem('bvilla_auth');
  }
}

/**
 * Kiểm tra xem phiên SPA hiện tại có đang hợp lệ không.
 * Luôn trả về `false` ngay khi F5, mở tab mới hoặc tải lại trang vì RAM bị reset về ban đầu.
 */
export function isSpaSessionActive(): boolean {
  if (typeof window === 'undefined') return false;
  return _spaSessionActive;
}
