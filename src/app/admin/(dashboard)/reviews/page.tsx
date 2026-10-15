'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Star,
  MessageSquare,
  Sparkles,
  Eye,
  EyeOff,
  CornerDownRight,
  Send,
  Building,
  CheckCircle,
  X,
  Filter,
} from 'lucide-react';
import { getVillaColor, getReviewSourceLabel } from '@/lib/mock-data';
import { Review, ReviewSource, ReviewStatus } from '@/lib/types';
import { useToastStore } from '@/lib/store';
import { getLiveReviews, updateReviewsInDb } from '@/lib/adminDataService';
import { bookingStore } from '@/lib/bookingStore';
import { useIsMounted } from '@/lib/useHydrated';

export default function ReviewsManagementPage() {
  const [reviewsList, setReviewsList] = useState<Review[]>(() => getLiveReviews());
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<ReviewSource | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'all'>('all');

  useEffect(() => {
    setReviewsList(getLiveReviews());
    const unsub = bookingStore.subscribe((payload) => {
      if (payload.action === 'APP_DATA_UPDATE' || payload.action === 'UPDATE') {
        setReviewsList(getLiveReviews());
      }
    });
    return () => unsub();
  }, []);

  // Reply modal
  const [replyModal, setReplyModal] = useState<{
    isOpen: boolean;
    review: Review | null;
    replyText: string;
  }>({ isOpen: false, review: null, replyText: '' });

  const { addToast } = useToastStore();

  // Analytics calculations
  const totalReviews = reviewsList.length;
  const avgRating = totalReviews > 0
    ? (reviewsList.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : '5.0';

  const starCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewsList.forEach((r) => {
      const star = r.rating as 1 | 2 | 3 | 4 | 5;
      if (counts[star] !== undefined) counts[star]++;
    });
    return counts;
  }, [reviewsList]);

  const respondedCount = reviewsList.filter((r) => r.staffResponse).length;
  const responseRate = totalReviews > 0 ? Math.round((respondedCount / totalReviews) * 100) : 100;

  // Toggle Featured
  const handleToggleFeatured = async (id: string) => {
    const updated = reviewsList.map((r) => (r.id === id ? { ...r, isFeatured: !r.isFeatured } : r));
    setReviewsList(updated);
    await updateReviewsInDb(updated);
    addToast({
      type: 'info',
      title: 'Cập nhật trạng thái hiển thị',
      message: 'Đã thay đổi trạng thái Nổi Bật của đánh giá trên trang chủ.',
      duration: 3000,
    });
  };

  // Toggle Visibility
  const handleToggleVisibility = async (id: string) => {
    let newStatus: ReviewStatus = 'published';
    const updated = reviewsList.map((r) => {
      if (r.id === id) {
        newStatus = r.status === 'published' ? 'hidden' : 'published';
        return { ...r, status: newStatus };
      }
      return r;
    });
    setReviewsList(updated);
    await updateReviewsInDb(updated);
    addToast({
      type: newStatus === 'published' ? 'success' : 'warning',
      title: newStatus === 'published' ? 'Đã công khai đánh giá' : 'Đã ẩn đánh giá',
      message: `Đánh giá ${id} hiện ${newStatus === 'published' ? 'hiển thị' : 'bị ẩn'} trên website.`,
      duration: 3000,
    });
  };

  // Submit Reply
  const handleSaveReply = async () => {
    if (!replyModal.review || !replyModal.replyText.trim()) return;
    const rId = replyModal.review.id;
    const updated = reviewsList.map((r) =>
      r.id === rId
        ? {
            ...r,
            staffResponse: replyModal.replyText.trim(),
            respondedAt: new Date().toISOString(),
          }
        : r
    );
    setReviewsList(updated);
    setReplyModal({ isOpen: false, review: null, replyText: '' });
    await updateReviewsInDb(updated);
    addToast({
      type: 'success',
      title: 'Đã gửi phản hồi',
      message: `Phản hồi cho đánh giá ${rId} đã được lưu và công khai.`,
      duration: 4000,
    });
  };


  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviewsList.filter((r) => {
      if (ratingFilter !== 'all' && r.rating !== ratingFilter) return false;
      if (sourceFilter !== 'all' && r.source !== sourceFilter) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      return true;
    });
  }, [reviewsList, ratingFilter, sourceFilter, statusFilter]);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#14171A] dark:text-[#FAF8F5] tracking-tight">
          Quản Lý Đánh Giá & Nhận Xét (Reviews)
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Lắng nghe phản hồi của khách hàng từ Google, Airbnb, Booking.com và trang chủ B Villa
        </p>
      </div>

      {/* Analytics KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rating Score */}
        <div className="bg-white dark:bg-[#1E2328] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-xs flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-[#C2A476]/15 text-[#C2A476] flex items-center justify-center font-extrabold text-2xl shadow-xs">
            {avgRating}★
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 block uppercase">Điểm Đánh Giá TB</span>
            <div className="flex text-[#C2A476] text-sm mt-0.5">★★★★★</div>
            <p className="text-[11px] text-gray-400 mt-1">{totalReviews} lượt đánh giá thực</p>
          </div>
        </div>

        {/* Rating Distribution Bar */}
        <div className="bg-white dark:bg-[#1E2328] rounded-3xl p-5 border border-black/5 dark:border-white/5 shadow-xs flex flex-col justify-center space-y-1.5 text-xs">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = (starCounts as any)[star] || 0;
            const pct = totalReviews ? Math.round((count / totalReviews) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="w-4 font-bold text-gray-400">{star}★</span>
                <div className="flex-1 bg-black/5 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#C2A476] h-1.5 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-7 text-right text-[10px] text-gray-400">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Response Rate */}
        <div className="bg-white dark:bg-[#1E2328] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-xs flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-extrabold text-2xl shadow-xs">
            {responseRate}%
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 block uppercase">Tỷ Lệ Phản Hồi</span>
            <p className="text-xs text-gray-700 dark:text-gray-300 font-bold mt-1">
              {respondedCount} / {totalReviews} nhận xét
            </p>
            <p className="text-[11px] text-emerald-500 font-semibold mt-0.5">Thời gian TB: 3 giờ</p>
          </div>
        </div>

        {/* Sentiment Score */}
        <div className="bg-white dark:bg-[#1E2328] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-xs flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-extrabold text-2xl shadow-xs">
            96%
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 block uppercase">Độ Hài Lòng</span>
            <p className="text-xs text-gray-700 dark:text-gray-300 font-bold mt-1">
              Phản hồi tích cực
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">Khách sẵn sàng giới thiệu</p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-[#1E2328] rounded-2xl p-4 border border-black/5 dark:border-white/5 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Rating filter */}
          <select
            value={ratingFilter}
            onChange={(e) =>
              setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
            }
            className="p-2 rounded-xl bg-[#FAF8F5] dark:bg-[#14171A] border border-black/10 dark:border-white/10 font-bold"
          >
            <option value="all">Tất cả số sao</option>
            <option value="5">5 Sao (★★★★★)</option>
            <option value="4">4 Sao (★★★★☆)</option>
            <option value="3">3 Sao (★★★☆☆)</option>
            <option value="2">2 Sao (★★☆☆☆)</option>
            <option value="1">1 Sao (★☆☆☆☆)</option>
          </select>

          {/* Source filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as any)}
            className="p-2 rounded-xl bg-[#FAF8F5] dark:bg-[#14171A] border border-black/10 dark:border-white/10 font-bold"
          >
            <option value="all">Tất cả nguồn review</option>
            <option value="google">Google Reviews</option>
            <option value="airbnb">Airbnb</option>
            <option value="booking_com">Booking.com</option>
            <option value="direct">Website B Villa</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="p-2 rounded-xl bg-[#FAF8F5] dark:bg-[#14171A] border border-black/10 dark:border-white/10 font-bold"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đang công khai</option>
            <option value="hidden">Đang ẩn</option>
          </select>
        </div>

        <span className="text-gray-400 font-semibold">
          Tìm thấy {filteredReviews.length} nhận xét
        </span>
      </div>

      {/* Reviews Cards List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => {
          const villaColor = getVillaColor(review.villaId);
          return (
            <div
              key={review.id}
              className="bg-white dark:bg-[#1E2328] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-xs hover:shadow-md transition-all space-y-4"
            >
              {/* Review Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#C2A476]/15 text-[#C2A476] font-bold text-xs flex items-center justify-center">
                    {review.customerName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-sm font-extrabold text-[#14171A] dark:text-[#FAF8F5]">
                        {review.customerName}
                      </strong>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-extrabold"
                        style={{
                          backgroundColor: `${villaColor}15`,
                          color: villaColor,
                        }}
                      >
                        Villa {review.villaId}
                      </span>
                      {review.isFeatured && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C2A476] text-[#14171A]">
                          ★ Nổi Bật
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400">
                      Nguồn: {getReviewSourceLabel(review.source)} • Đăng ngày{' '}
                      {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <div className="flex text-[#C2A476] text-sm">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i} className={i < review.rating ? 'opacity-100' : 'opacity-20'}>
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-[#14171A] dark:text-[#FAF8F5]">
                    {review.rating}.0
                  </span>
                </div>
              </div>

              {/* Review Content */}
              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed italic">
                &ldquo;{review.content}&rdquo;
              </p>

              {/* Staff Response (if any) */}
              {review.staffResponse ? (
                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#14171A] border border-black/5 dark:border-white/5 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 text-[#C2A476] font-bold text-[11px]">
                    <CornerDownRight className="w-3.5 h-3.5" />
                    <span>Phản hồi từ Ban Quản Lý B Villa:</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 pl-5 leading-relaxed">
                    {review.staffResponse}
                  </p>
                </div>
              ) : (
                <div className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
                  <span>⚠️ Chưa phản hồi nhận xét này</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setReplyModal({
                        isOpen: true,
                        review,
                        replyText: review.staffResponse || '',
                      })
                    }
                    className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-[#C2A476] hover:text-[#14171A] font-bold transition-colors flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{review.staffResponse ? 'Chỉnh sửa phản hồi' : 'Trả lời nhận xét'}</span>
                  </button>

                  <button
                    onClick={() => handleToggleFeatured(review.id)}
                    className={`px-3 py-1.5 rounded-xl border transition-colors font-bold ${
                      review.isFeatured
                        ? 'border-[#C2A476] text-[#C2A476] bg-[#C2A476]/10'
                        : 'border-black/10 dark:border-white/10 text-gray-500 hover:border-gray-400'
                    }`}
                  >
                    {review.isFeatured ? 'Gỡ nổi bật' : 'Ghim nổi bật'}
                  </button>
                </div>

                <button
                  onClick={() => handleToggleVisibility(review.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors flex items-center gap-1 text-[11px]"
                >
                  {review.status === 'published' ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Ẩn khỏi web</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500 font-bold">Hiển thị lại</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reply Modal */}
      {replyModal.isOpen && replyModal.review && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#1E2328] rounded-3xl p-6 border border-black/10 dark:border-white/10 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#14171A] dark:text-[#FAF8F5]">
                Phản Hồi Đánh Giá Của {replyModal.review.customerName}
              </h3>
              <button
                onClick={() => setReplyModal({ isOpen: false, review: null, replyText: '' })}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#14171A] text-xs text-gray-600 dark:text-gray-300 italic">
              &ldquo;{replyModal.review.content}&rdquo;
            </p>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-gray-700 dark:text-gray-300">
                Nội dung phản hồi chính thức:
              </label>
              <textarea
                rows={4}
                value={replyModal.replyText}
                onChange={(e) =>
                  setReplyModal((prev) => ({ ...prev, replyText: e.target.value }))
                }
                placeholder="Cảm ơn quý khách đã dành thời gian chia sẻ trải nghiệm tuyệt vời tại B Villa Da Nang..."
                className="w-full p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#14171A] border border-black/10 dark:border-white/10 text-xs focus:outline-none focus:border-[#C2A476]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReplyModal({ isOpen: false, review: null, replyText: '' })}
                className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveReply}
                className="px-5 py-2.5 rounded-xl bg-[#C2A476] text-[#14171A] text-xs font-bold hover:bg-[#d4ba94] transition-colors shadow-xs"
              >
                Gửi Phản Hồi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
