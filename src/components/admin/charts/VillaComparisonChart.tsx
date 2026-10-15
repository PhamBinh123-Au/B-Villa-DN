'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { BarChart3, TrendingUp, Users, Calendar } from 'lucide-react';
import { villaComparisonData, getVillaColor } from '@/lib/mock-data';
import { formatCompactVND, formatVND } from '@/lib/utils';
import { VillaId } from '@/lib/types';

export function VillaComparisonChart() {
  const [isMounted, setIsMounted] = useState(false);
  const [metric, setMetric] = useState<'revenue' | 'bookings'>('revenue');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const villaLabels: Record<string, string> = {
    B1: 'B1 (Sơn Trà)',
    B2: 'B2 (Ngũ Hành Sơn)',
    B3: 'B3 (Sơn Trà)',
    B4: 'B4 (Ngũ Hành Sơn)',
  };

  const chartData = villaComparisonData.map((d) => ({
    ...d,
    name: villaLabels[d.villa] || d.villa,
    color: getVillaColor(d.villa as VillaId),
  }));

  return (
    <div className="bg-white dark:bg-[#1E2328] rounded-2xl p-6 shadow-sm border border-black/5 dark:border-white/5 card-hover transition-all duration-300">
      {/* Header with metric switchers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#C2A476]/10 text-[#C2A476]">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#14171A] dark:text-[#FAF8F5]">
              So Sánh Hiệu Suất 4 Biệt Thự
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Đối chiếu doanh thu và số lượt đặt phòng theo từng biệt thự
            </p>
          </div>
        </div>

        {/* Metric tabs */}
        <div className="flex items-center p-1 bg-black/5 dark:bg-white/5 rounded-xl self-start sm:self-auto text-xs font-semibold">
          <button
            onClick={() => setMetric('revenue')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              metric === 'revenue'
                ? 'bg-white dark:bg-[#14171A] text-[#14171A] dark:text-[#FAF8F5] shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-[#14171A]'
            }`}
          >
            Doanh thu
          </button>
          <button
            onClick={() => setMetric('bookings')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              metric === 'bookings'
                ? 'bg-white dark:bg-[#14171A] text-[#14171A] dark:text-[#FAF8F5] shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-[#14171A]'
            }`}
          >
            Lượt đặt phòng
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[260px] w-full">
        {!isMounted ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-7 h-7 border-2 border-[#C2A476] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150, 150, 150, 0.15)" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#888888', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#888888', fontSize: 11 }}
                tickFormatter={(val) => {
                  if (metric === 'revenue') return formatCompactVND(val);
                  return val.toString();
                }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0].payload;
                  return (
                    <div className="bg-white/95 dark:bg-[#14171A]/95 backdrop-blur-md p-3.5 rounded-xl shadow-lg border border-black/10 dark:border-white/10 text-xs min-w-[160px]">
                      <p className="font-bold text-[#14171A] dark:text-[#FAF8F5] mb-2 flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        {item.name}
                      </p>
                      <div className="space-y-1 text-gray-600 dark:text-gray-300">
                        <div className="flex justify-between">
                          <span>Doanh thu:</span>
                          <span className="font-bold text-[#C2A476]">{formatVND(item.revenue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Số lượt đặt:</span>
                          <span className="font-bold text-[#14171A] dark:text-[#FAF8F5]">
                            {item.bookings} đơn
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Bar dataKey={metric} radius={[8, 8, 0, 0]} maxBarSize={48}>
                {chartData.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Villa Mini Cards at Bottom */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-black/5 dark:border-white/5">
        {chartData.map((v) => (
          <div
            key={v.villa}
            className="p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 flex items-center gap-2.5"
          >
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: v.color }}
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#14171A] dark:text-[#FAF8F5] truncate">
                Villa {v.villa}
              </p>
              <p className="text-[11px] text-gray-500 truncate">
                {metric === 'revenue' ? formatCompactVND(v.revenue) : `${v.bookings} đơn đặt`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
