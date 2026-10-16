'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CustomerDetailPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/bookings');
  }, [router]);

  return (
    <div className="p-8 text-center text-xs text-gray-500">
      Đang chuyển hướng về danh sách đặt phòng...
    </div>
  );
}
