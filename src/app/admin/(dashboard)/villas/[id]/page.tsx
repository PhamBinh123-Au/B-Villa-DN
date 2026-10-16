'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminVillaDetailPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin');
  }, [router]);

  return (
    <div className="p-8 text-center text-xs text-gray-500">
      Đang chuyển hướng về trang quản trị...
    </div>
  );
}
