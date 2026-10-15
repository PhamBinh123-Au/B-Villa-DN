'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { TrendingUp, Layers } from 'lucide-react';
import { revenueChartData } from '@/lib/mock-data';
import { formatVND, formatCompactVND, cn } from '@/lib/utils';

interface VillaLineConfig {
  key: 'B1' | 'B2' | 'B3' | 'B4';
  name: string;
  fullName: string;
  color: string;
}

const VILLAS_CONFIG: VillaLineConfig[] = [
  { key: 'B1', name: 'B1', fullName: 'B1 - Sơn Trà Premium', color: '#C2A476' },
  { key: 'B2', name: 'B2', fullName: 'B2 - Ngũ Hành Sơn Retreat', color: '#3B82F6' },
  { key: 'B3', name: 'B3', fullName: 'B3 - Biển Non Nước Luxury', color: '#10B981' },
  { key: 'B4', name: 'B4', fullName: 'B4 - Bán Đảo Ocean View', color: '#8B5CF6' },
];

export function RevenueChart() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeVillas, setActiveVillas] = useState<Record<string, boolean>>({
    B1: true,
    B2: true,
    B3: true,
    B4: true,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleVilla = (key: string) => {
    // Keep at least one villa visible
    const activeCount = Object.values(activeVillas).filter(Boolean).length;
    if (activeCount === 1 && activeVillas[key]) return;
    setActiveVillas((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Calculate total 12-month revenue
  const totalRevenue12m = revenueChartData.reduce((acc, item) => {
    return acc + item.B1 + item.B2 + item.B3 + item.B4;
  }, 0);

  return (
    <div className="bg-white dark:bg-[#1E2328] rounded-2xl p-6 shadow-sm border border-black/5 dark:border-white/5 card-hover transition-all duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#C2A476]/10 text-[#C2A476]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#14171A] dark:text-[#FAF8F5]">
                Doanh Thu 12 Tháng Gần Nhất
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Phân tích doanh thu thực nhận theo từng biệt thự (T11/2024 - T10/2025)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:self-center">
          <div className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] dark:bg-[#14171A] border border-black/5 dark:border-white/5 text-right">
            <span className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 block font-medium">
              Tổng 12 tháng
            </span>
            <span className="text-sm font-bold text-[#C2A476]">
              {formatVND(totalRevenue12m)}
            </span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-[320px] sm:h-[360px]">
        {!isMounted ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#C2A476] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={revenueChartData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-gray-200 dark:text-gray-800"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                stroke="currentColor"
                className="text-[11px] font-medium text-gray-500 dark:text-gray-400"
                tickLine={false}
                axisLine={{ stroke: 'currentColor', className: 'text-gray-200 dark:text-gray-800' }}
                dy={8}
              />
              <YAxis
                stroke="currentColor"
                className="text-[11px] font-medium text-gray-500 dark:text-gray-400"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCompactVND(value)}
                dx={-6}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const monthTotal = payload.reduce(
                    (acc, entry) => acc + (Number(entry.value) || 0),
                    0
                  );

                  return (
                    <div className="bg-white/95 dark:bg-[#14171A]/95 backdrop-blur-md p-4 rounded-xl shadow-xl border border-black/10 dark:border-white/10 text-xs min-w-[210px] animate-scale-in">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/5 dark:border-white/10">
                        <span className="font-bold text-sm text-[#14171A] dark:text-[#FAF8F5]">
                          Tháng {label}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C2A476]/15 text-[#C2A476] font-semibold">
                          VNĐ
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {payload.map((entry) => {
                          const conf = VILLAS_CONFIG.find((v) => v.key === entry.dataKey);
                          return (
                            <div
                              key={String(entry.dataKey || entry.name)}
                              className="flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-2.5 h-2.5 rounded-full shrink-0"
                                  style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-gray-600 dark:text-gray-300 font-medium">
                                  {conf ? conf.fullName : entry.name}
                                </span>
                              </div>
                              <span className="font-semibold text-[#14171A] dark:text-[#FAF8F5]">
                                {formatVND(Number(entry.value) || 0)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between font-bold">
                        <span className="text-gray-500 dark:text-gray-400">Tổng tháng:</span>
                        <span className="text-[#C2A476]">{formatVND(monthTotal)}</span>
                      </div>
                    </div>
                  );
                }}
              />

              {VILLAS_CONFIG.map((villa) =>
                activeVillas[villa.key] ? (
                  <Line
                    key={villa.key}
                    type="monotone"
                    dataKey={villa.key}
                    name={villa.fullName}
                    stroke={villa.color}
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: villa.color, strokeWidth: 1.5, stroke: '#FAF8F5' }}
                    activeDot={{ r: 6, fill: villa.color, stroke: '#fff', strokeWidth: 2 }}
                    isAnimationActive={true}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                ) : null
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Interactive Legend at bottom */}
      <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex flex-wrap items-center justify-center gap-2 sm:gap-4">
        <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mr-1">
          <Layers className="w-3.5 h-3.5" /> Biệt thự:
        </span>
        {VILLAS_CONFIG.map((villa) => {
          const isActive = activeVillas[villa.key];
          return (
            <button
              key={villa.key}
              onClick={() => toggleVilla(villa.key)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 border',
                isActive
                  ? 'bg-black/5 dark:bg-white/5 border-transparent shadow-xs'
                  : 'opacity-40 border-dashed border-gray-300 dark:border-gray-700 hover:opacity-75'
              )}
              title={`Bật/tắt hiển thị ${villa.fullName}`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full transition-transform duration-200"
                style={{
                  backgroundColor: villa.color,
                  boxShadow: isActive ? `0 0 8px ${villa.color}66` : 'none',
                }}
              />
              <span className="text-[#14171A] dark:text-[#FAF8F5]">{villa.fullName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default RevenueChart;
