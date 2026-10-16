'use client';

import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { bookings } from '@/lib/mock-data';

export function OccupancyHeatmap() {
  const [selectedMonth, setSelectedMonth] = useState('10/2025');

  // Days in month
  const daysInMonth = 31;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Calculate day-by-day occupancy across 4 villas (B1, B2, B3, B4)
  // Let's generate realistic booking states for October 2025 based on bookings
  const getDayStatus = (day: number) => {
    // Generate deterministic status for demo
    const dayStr = `2025-10-${day.toString().padStart(2, '0')}`;
    
    // Check bookings that span this date
    const dayBookings = (bookings || []).filter((b) => {
      const inDate = (b?.checkIn || '').slice(0, 10);
      const outDate = (b?.checkOut || '').slice(0, 10);
      return inDate && outDate && dayStr >= inDate && dayStr <= outDate && b?.status !== 'cancelled';
    });

    const bookedVillas = Array.from(new Set(dayBookings.map((b) => b.villaId)));
    const count = bookedVillas.length;
    const rate = Math.round((count / 4) * 100);

    return {
      day,
      dateStr: dayStr,
      count,
      rate,
      bookedVillas,
      bookings: dayBookings,
    };
  };

  const heatmapDays = days.map((d) => getDayStatus(d));
  const avgOccupancy = Math.round(
    heatmapDays.reduce((acc, d) => acc + d.rate, 0) / daysInMonth
  );

  return (
    <div className="bg-white dark:bg-[#1E2328] rounded-2xl p-6 shadow-sm border border-black/5 dark:border-white/5 card-hover transition-all duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#C2A476]/10 text-[#C2A476]">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#14171A] dark:text-[#FAF8F5]">
              Heatmap Công Suất Phòng
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Mật độ lấp đầy từng ngày theo 4 biệt thự
            </p>
          </div>
        </div>

        {/* Month Selector & Avg */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 rounded-xl px-2 py-1 text-xs font-semibold">
            <button className="p-1 hover:text-[#C2A476] transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[#14171A] dark:text-[#FAF8F5]">Tháng 10/2025</span>
            <button className="p-1 hover:text-[#C2A476] transition-colors">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#C2A476]/15 text-[#C2A476]">
            TB: {avgOccupancy}%
          </span>
        </div>
      </div>

      {/* Grid of days (Weekdays header + 31 days) */}
      <div className="space-y-2">
        <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-bold text-gray-400 pb-1">
          <span>T2</span>
          <span>T3</span>
          <span>T4</span>
          <span>T5</span>
          <span>T6</span>
          <span className="text-[#C2A476]">T7</span>
          <span className="text-[#C2A476]">CN</span>
        </div>

        {/* 1st October 2025 was a Wednesday (offset by 2 days in grid) */}
        <div className="grid grid-cols-7 gap-1.5">
          {/* Empty padding for Wed start */}
          <div className="aspect-square rounded-lg bg-black/[0.01] dark:bg-white/[0.01]" />
          <div className="aspect-square rounded-lg bg-black/[0.01] dark:bg-white/[0.01]" />

          {heatmapDays.map((item) => {
            // Color based on occupancy rate: 0%, 25%, 50%, 75%, 100%
            let bgClass = 'bg-black/5 dark:bg-white/5 text-gray-600 dark:text-gray-400';
            if (item.rate === 25) {
              bgClass = 'bg-[#C2A476]/25 text-[#14171A] dark:text-[#FAF8F5] font-semibold';
            } else if (item.rate === 50) {
              bgClass = 'bg-[#C2A476]/50 text-white font-bold';
            } else if (item.rate === 75) {
              bgClass = 'bg-[#C2A476]/75 text-white font-bold';
            } else if (item.rate === 100) {
              bgClass = 'bg-[#C2A476] text-[#14171A] font-extrabold shadow-xs';
            }

            return (
              <div
                key={item.day}
                className={`group relative aspect-square rounded-xl ${bgClass} flex flex-col items-center justify-center p-1 cursor-pointer transition-all duration-200 hover:scale-105 hover:z-20`}
              >
                <span className="text-xs leading-none">{item.day}</span>
                <span className="text-[9px] opacity-80 mt-0.5 leading-none">
                  {item.count}/4
                </span>

                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2.5 rounded-xl bg-white dark:bg-[#14171A] shadow-xl border border-black/10 dark:border-white/10 text-xs text-left z-30 pointer-events-none animate-scale-in">
                  <p className="font-bold text-[#14171A] dark:text-[#FAF8F5] mb-1">
                    Ngày {item.day}/10/2025
                  </p>
                  <div className="flex items-center justify-between text-[11px] mb-1.5 text-gray-500">
                    <span>Lấp đầy:</span>
                    <strong className="text-[#C2A476] font-bold">{item.rate}% ({item.count}/4 villa)</strong>
                  </div>
                  {item.bookedVillas.length > 0 ? (
                    <div className="space-y-1 pt-1 border-t border-black/5 dark:border-white/5">
                      <p className="text-[10px] text-gray-400 font-medium">Đang lưu trú:</p>
                      <div className="flex flex-wrap gap-1">
                        {item.bookedVillas.map((v) => (
                          <span
                            key={v}
                            className="px-1.5 py-0.5 rounded bg-[#C2A476]/20 text-[#C2A476] font-bold text-[10px]"
                          >
                            Villa {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-emerald-500 font-medium pt-1">
                      Còn trống tất cả 4 villa
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-black/5 dark:border-white/5 text-xs text-gray-500">
        <span className="flex items-center gap-1 text-[11px]">
          <Info className="w-3.5 h-3.5 text-[#C2A476]" /> 4 Villa: B1, B2, B3, B4
        </span>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span>Trống (0%)</span>
          <div className="w-3 h-3 rounded bg-black/5 dark:bg-white/5" />
          <div className="w-3 h-3 rounded bg-[#C2A476]/25" />
          <div className="w-3 h-3 rounded bg-[#C2A476]/50" />
          <div className="w-3 h-3 rounded bg-[#C2A476]/75" />
          <div className="w-3 h-3 rounded bg-[#C2A476]" />
          <span>Kín (100%)</span>
        </div>
      </div>
    </div>
  );
}
