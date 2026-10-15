'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { Compass } from 'lucide-react';
import { bookingSourceData } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

export function BookingSourceChart() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalBookings = bookingSourceData.reduce((acc, item) => acc + item.count, 0);

  return (
    <div className="bg-white dark:bg-[#1E2328] rounded-2xl p-6 shadow-sm border border-black/5 dark:border-white/5 card-hover transition-all duration-300 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#C2A476]/10 text-[#C2A476]">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#14171A] dark:text-[#FAF8F5]">
              Nguồn Đặt Phòng
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tỷ trọng kênh phân phối đặt phòng
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 text-[#14171A] dark:text-[#FAF8F5]">
          5 Kênh
        </span>
      </div>

      {/* Content: Chart + Legend Beside */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 my-auto">
        {/* Donut Chart with Center Text */}
        <div className="relative w-[210px] h-[210px] shrink-0 mx-auto">
          {!isMounted ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-7 h-7 border-2 border-[#C2A476] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white/95 dark:bg-[#14171A]/95 backdrop-blur-md p-3 rounded-xl shadow-lg border border-black/10 dark:border-white/10 text-xs min-w-[140px] animate-scale-in">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: data.color }}
                            />
                            <span className="font-bold text-[#14171A] dark:text-[#FAF8F5]">
                              {data.source}
                            </span>
                          </div>
                          <div className="flex justify-between text-gray-600 dark:text-gray-300 text-[11px] mt-1">
                            <span>Số lượng:</span>
                            <span className="font-semibold text-[#14171A] dark:text-[#FAF8F5]">
                              {data.count} đơn
                            </span>
                          </div>
                          <div className="flex justify-between text-gray-600 dark:text-gray-300 text-[11px]">
                            <span>Tỷ lệ:</span>
                            <span className="font-semibold text-[#C2A476]">
                              {data.percentage}%
                            </span>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Pie
                    data={bookingSourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={66}
                    outerRadius={88}
                    paddingAngle={3}
                    dataKey="count"
                    isAnimationActive={true}
                    animationDuration={1200}
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    {bookingSourceData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke={activeIndex === index ? '#fff' : 'transparent'}
                        strokeWidth={activeIndex === index ? 2 : 0}
                        className="transition-all duration-200 cursor-pointer"
                        style={{
                          filter:
                            activeIndex === index
                              ? 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.25))'
                              : 'none',
                          transform: activeIndex === index ? 'scale(1.04)' : 'scale(1)',
                          transformOrigin: 'center center',
                        }}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center Text inside Donut Hole */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none text-center">
                <span className="text-2xl font-extrabold text-[#14171A] dark:text-[#FAF8F5] tracking-tight leading-none">
                  {totalBookings}
                </span>
                <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">
                  Đặt Phòng
                </span>
              </div>
            </>
          )}
        </div>

        {/* Legend Beside the Chart */}
        <div className="flex-1 w-full space-y-2">
          {bookingSourceData.map((item, index) => {
            const isHovered = activeIndex === index;
            return (
              <div
                key={item.source}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                className={cn(
                  'flex items-center justify-between p-2 rounded-xl text-xs transition-all duration-200 cursor-pointer border',
                  isHovered
                    ? 'bg-black/5 dark:bg-white/10 border-[#C2A476]/30 shadow-xs translate-x-1'
                    : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-3 h-3 rounded-md shrink-0 shadow-xs"
                    style={{
                      backgroundColor: item.color,
                      border: item.color === '#14171A' ? '1px solid rgba(255,255,255,0.2)' : undefined,
                    }}
                  />
                  <span className="font-semibold text-[#14171A] dark:text-[#FAF8F5] truncate">
                    {item.source}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">
                    {item.count} đơn
                  </span>
                  <span
                    className="font-bold px-2 py-0.5 rounded-md text-[11px]"
                    style={{
                      backgroundColor: `${item.color}18`,
                      color: item.color === '#14171A' ? '#C2A476' : item.color,
                    }}
                  >
                    {item.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Kênh dẫn đầu: <strong className="text-[#C2A476]">Đặt Trực Tiếp (33%)</strong></span>
        <span>OTAs: <strong>49%</strong></span>
      </div>
    </div>
  );
}

export default BookingSourceChart;
