'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
  SortingState,
} from '@tanstack/react-table';
import {
  CalendarDays,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Building,
  RotateCcw,
  FileSpreadsheet,
} from 'lucide-react';
import { bookings as initialBookings, getStatusColor, getStatusLabel, getVillaColor } from '@/lib/mock-data';
import { Booking, BookingStatus, VillaId } from '@/lib/types';
import { formatVND, cn } from '@/lib/utils';
import { BookingSlideOver } from '@/components/admin/bookings/BookingSlideOver';
import { InvoiceModal } from '@/components/admin/bookings/InvoiceModal';
import { LuxuryConfirmDialog } from '@/components/LuxuryConfirmDialog';
import { useToastStore } from '@/lib/store';
import {
  getLiveBookings,
  cancelBookingInDb,
  deleteBookingInDb,
  updateBookingStatusInDb,
  confirmBookingInDb,
} from '@/lib/adminDataService';
import { bookingStore } from '@/lib/bookingStore';
import { useIsMounted } from '@/lib/useHydrated';

export default function BookingsListPage() {
  const [data, setData] = useState<Booking[]>(() => getLiveBookings());
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedVilla, setSelectedVilla] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sorting, setSorting] = useState<SortingState>([{ id: 'checkIn', desc: true }]);
  const [rowSelection, setRowSelection] = useState({});
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [invoiceBooking, setInvoiceBooking] = useState<Booking | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    isBulk: boolean;
    bookingId?: string;
    booking?: Booking;
    count?: number;
    selectedIds?: string[];
  }>({
    isOpen: false,
    isBulk: false,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const { addToast } = useToastStore();

  // Real-time synchronization
  React.useEffect(() => {
    setData(getLiveBookings());
    const unsubscribe = bookingStore.subscribe(() => {
      setData(getLiveBookings());
    });
    return () => unsubscribe();
  }, []);

  // Cancel booking with 30-second undo toast
  const handleCancelBooking = async (bookingId: string) => {
    const bookingToCancel = data.find((b) => b.id === bookingId);
    if (!bookingToCancel) return;

    const previousStatus = bookingToCancel.status;
    // Optimistically update
    setData((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' as BookingStatus } : b))
    );

    // Persist to DB
    await cancelBookingInDb(bookingId);

    addToast({
      type: 'warning',
      title: 'Đã hủy đơn đặt phòng',
      message: `Đơn ${bookingId} của ${bookingToCancel.customerName} đã được chuyển sang trạng thái Đã Hủy.`,
      duration: 30000,
      undoAction: async () => {
        setData((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: previousStatus } : b))
        );
        await updateBookingStatusInDb(bookingId, previousStatus);
        addToast({
          type: 'success',
          title: 'Khôi phục thành công',
          message: `Đơn ${bookingId} đã được hoàn tác về trạng thái ban đầu.`,
          duration: 4000,
        });
      },
    });
  };

  const handleUpdateStatus = async (id: string, newStatus: BookingStatus) => {
    try {
      setData((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
      );
      if (activeBooking && activeBooking.id === id) {
        setActiveBooking((prev) => (prev ? { ...prev, status: newStatus } : null));
      }

      // Persist to DB and sync calendar
      await updateBookingStatusInDb(id, newStatus);

      addToast({
        type: 'success',
        title: 'Cập nhật trạng thái',
        message: `Đơn ${id} đã được cập nhật thành "${getStatusLabel(newStatus)}".`,
        duration: 4000,
      });
    } catch (err: any) {
      console.warn('[handleUpdateStatus] Handled gracefully:', err);
      addToast({
        type: 'warning',
        title: 'Lưu ý cập nhật',
        message: err?.message || 'Không thể cập nhật trạng thái đơn do trùng lịch.',
        duration: 5000,
      });
    }
  };

  // Filtered dataset
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (selectedVilla !== 'all' && item.villaId !== selectedVilla) return false;
      if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
      if (globalFilter) {
        const q = globalFilter.toLowerCase();
        const matches =
          item.id.toLowerCase().includes(q) ||
          item.customerName.toLowerCase().includes(q) ||
          item.customerPhone.includes(q) ||
          item.customerEmail.toLowerCase().includes(q) ||
          item.villaId.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [data, selectedVilla, selectedStatus, globalFilter]);

  // Bulk actions
  const handleBulkConfirm = async () => {
    const selectedIndices = Object.keys(rowSelection).map(Number);
    const selectedIds = selectedIndices.map((idx) => filteredData[idx]?.id).filter(Boolean);
    if (selectedIds.length === 0) return;

    try {
      setData((prev) =>
        prev.map((b) =>
          selectedIds.includes(b.id) && b.status === 'pending'
            ? { ...b, status: 'confirmed' }
            : b
        )
      );
      setRowSelection({});

      // Persist all selected to DB
      for (const id of selectedIds) {
        await confirmBookingInDb(id);
      }

      addToast({
        type: 'success',
        title: 'Xác nhận hàng loạt',
        message: `Đã xác nhận ${selectedIds.length} đơn đặt phòng được chọn.`,
        duration: 5000,
      });
    } catch (err: any) {
      console.warn('[handleBulkConfirm] Handled gracefully:', err);
      addToast({
        type: 'warning',
        title: 'Lưu ý xác nhận hàng loạt',
        message: err?.message || 'Một số đơn không thể xác nhận do trùng lịch.',
        duration: 5000,
      });
    }
  };

  // Open luxury dialog for bulk delete
  const promptBulkDelete = () => {
    const selectedIndices = Object.keys(rowSelection).map(Number);
    const selectedIds = selectedIndices.map((idx) => filteredData[idx]?.id).filter(Boolean);
    if (selectedIds.length === 0) return;

    setDeleteConfirm({
      isOpen: true,
      isBulk: true,
      count: selectedIds.length,
      selectedIds,
    });
  };

  // Open luxury dialog for single booking delete
  const promptDeleteSingle = (bookingId: string) => {
    const target = data.find((b) => b.id === bookingId);
    setDeleteConfirm({
      isOpen: true,
      isBulk: false,
      bookingId,
      booking: target,
    });
  };

  // Execute confirmed permanent delete from system
  const executeConfirmedDelete = async () => {
    setIsDeleting(true);
    try {
      if (deleteConfirm.isBulk && deleteConfirm.selectedIds) {
        const ids = deleteConfirm.selectedIds;
        const count = ids.length;
        setData((prev) => prev.filter((b) => !ids.includes(b.id)));
        setRowSelection({});
        setDeleteConfirm({ isOpen: false, isBulk: false });

        for (const id of ids) {
          await deleteBookingInDb(id);
        }
        addToast({
          type: 'info',
          title: 'Đã xóa hàng loạt',
          message: `Đã xóa vĩnh viễn ${count} đơn đặt phòng được chọn khỏi hệ thống.`,
          duration: 4000,
        });
      } else if (deleteConfirm.bookingId) {
        const id = deleteConfirm.bookingId;
        setData((prev) => prev.filter((b) => b.id !== id));
        setDeleteConfirm({ isOpen: false, isBulk: false });

        await deleteBookingInDb(id);
        addToast({
          type: 'info',
          title: 'Đã xóa đơn đặt phòng',
          message: `Đơn ${id} đã được xóa vĩnh viễn khỏi hệ thống.`,
          duration: 4000,
        });
      }
    } catch (err) {
      console.error('Failed to delete booking(s):', err);
      addToast({
        type: 'error',
        title: 'Lỗi xóa đơn',
        message: 'Có lỗi xảy ra khi thực hiện thao tác xóa. Vui lòng thử lại.',
        duration: 5000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Mã Đơn', 'Biệt Thự', 'Khách Hàng', 'SĐT', 'Email', 'Nhận Phòng', 'Trả Phòng', 'Số Đêm', 'Tổng Tiền', 'Trạng Thái'];
    const rows = filteredData.map((b) => [
      b.id,
      b.villaId,
      `"${b.customerName}"`,
      b.customerPhone,
      b.customerEmail,
      b.checkIn.slice(0, 10),
      b.checkOut.slice(0, 10),
      b.nights,
      b.totalAmount,
      getStatusLabel(b.status),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `b-villa-bookings-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'info',
      title: 'Đã xuất dữ liệu',
      message: `Đã xuất ${filteredData.length} đơn đặt phòng ra file CSV.`,
      duration: 4000,
    });
  };

  // TanStack columns
  const columns = useMemo<ColumnDef<Booking>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
            className="rounded text-[#C2A476] focus:ring-[#C2A476] cursor-pointer"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={(e) => row.toggleSelected(!!e.target.checked)}
            onClick={(e) => e.stopPropagation()}
            className="rounded text-[#C2A476] focus:ring-[#C2A476] cursor-pointer"
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'id',
        header: 'Mã Đặt',
        cell: ({ row }) => (
          <span className="font-mono font-bold text-xs text-[#14171A] dark:text-[#FAF8F5]">
            {row.original.id}
          </span>
        ),
      },
      {
        accessorKey: 'villaId',
        header: 'Biệt Thự',
        cell: ({ row }) => {
          const villaId = row.original.villaId;
          const color = getVillaColor(villaId);
          return (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
              style={{
                backgroundColor: `${color}15`,
                color: color,
                border: `1px solid ${color}30`,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
              {villaId}
            </span>
          );
        },
      },
      {
        accessorKey: 'customerName',
        header: 'Khách Hàng',
        cell: ({ row }) => {
          const b = row.original;
          return (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#C2A476]/15 text-[#C2A476] font-bold text-xs flex items-center justify-center shrink-0">
                {b.customerName.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-xs text-[#14171A] dark:text-[#FAF8F5] truncate">
                  {b.customerName}
                </p>
                <p className="text-[11px] text-gray-400 truncate">{b.customerPhone}</p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'checkIn',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 hover:text-[#C2A476] transition-colors"
          >
            <span>Nhận Phòng</span>
            <ArrowUpDown className="w-3 h-3" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
            {new Date(row.original.checkIn).toLocaleDateString('vi-VN')}
          </span>
        ),
      },
      {
        accessorKey: 'checkOut',
        header: 'Trả Phòng',
        cell: ({ row }) => (
          <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
            {new Date(row.original.checkOut).toLocaleDateString('vi-VN')}
          </span>
        ),
      },
      {
        accessorKey: 'nights',
        header: 'Đêm',
        cell: ({ row }) => (
          <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
            {row.original.nights}
          </span>
        ),
      },
      {
        accessorKey: 'totalAmount',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 hover:text-[#C2A476] transition-colors"
          >
            <span>Tổng Tiền</span>
            <ArrowUpDown className="w-3 h-3" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-xs font-extrabold text-[#C2A476]">
            {formatVND(row.original.totalAmount)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Trạng Thái',
        cell: ({ row }) => {
          const status = row.original.status;
          const color = getStatusColor(status);
          return (
            <span
              className="text-[11px] font-bold px-2.5 py-1 rounded-full inline-block"
              style={{
                backgroundColor: `${color}15`,
                color: color,
              }}
            >
              {getStatusLabel(status)}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: 'Thao Tác',
        cell: ({ row }) => {
          const b = row.original;
          return (
            <div
              className="flex items-center gap-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setActiveBooking(b);
                  setSlideOverOpen(true);
                }}
                className="p-1.5 rounded-lg text-gray-500 hover:text-[#C2A476] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                title="Xem nhanh"
              >
                <Eye className="w-4 h-4" />
              </button>
              <Link
                href={`/admin/bookings/${b.id}`}
                className="p-1.5 rounded-lg text-gray-500 hover:text-blue-500 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                title="Chỉnh sửa chi tiết"
              >
                <Edit className="w-4 h-4" />
              </Link>
              {b.status !== 'cancelled' ? (
                <button
                  onClick={() => handleCancelBooking(b.id)}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  title="Hủy đặt phòng"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => promptDeleteSingle(b.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  title="Xóa vĩnh viễn đơn này"
                >
                  <Trash2 className="w-4 h-4 text-red-500/80 hover:text-red-600" />
                </button>
              )}
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, filteredData]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const selectedCount = Object.keys(rowSelection).length;


  return (
    <div className="space-y-6 animate-fade-in pb-12" suppressHydrationWarning>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#14171A] dark:text-[#FAF8F5] tracking-tight">
            Quản Lý Đặt Phòng
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Tổng cộng {data.length} đơn đặt phòng cho 4 biệt thự B1, B2, B3, B4
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-black/10 dark:border-white/10 hover:border-[#C2A476] bg-white dark:bg-[#1E2328] text-xs font-semibold flex items-center gap-2 transition-all shadow-xs"
          >
            <Download className="w-4 h-4 text-[#C2A476]" />
            <span>Xuất CSV</span>
          </button>
          <Link
            href="/admin/bookings/new"
            className="px-4 py-2 rounded-xl bg-[#C2A476] hover:bg-[#d4ba94] text-[#14171A] text-xs font-bold flex items-center gap-2 shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Đặt Phòng</span>
          </Link>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white dark:bg-[#1E2328] rounded-2xl p-4 border border-black/5 dark:border-white/5 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Global Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo mã đơn (BVN-...), tên khách, SĐT, biệt thự..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#FAF8F5] dark:bg-[#14171A] border border-black/5 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:border-[#C2A476] transition-colors text-[#14171A] dark:text-[#FAF8F5]"
            />
          </div>

          {/* Villa Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {['all', 'B1', 'B2', 'B3', 'B4'].map((v) => (
              <button
                key={v}
                onClick={() => setSelectedVilla(v)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedVilla === v
                    ? 'bg-[#C2A476] text-[#14171A] shadow-xs'
                    : 'bg-black/5 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-[#14171A]'
                }`}
              >
                {v === 'all' ? 'Tất cả Villa' : `Villa ${v}`}
              </button>
            ))}
          </div>
        </div>

        {/* Second Row Filters: Status, Source, Bulk Action */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-black/5 dark:border-white/5 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] dark:bg-[#14171A] border border-black/10 dark:border-white/10 text-xs font-semibold focus:outline-none focus:border-[#C2A476]"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ Duyệt</option>
              <option value="confirmed">Đã Xác Nhận</option>
              <option value="checked_in">Đang Lưu Trú</option>
              <option value="completed">Hoàn Thành</option>
              <option value="cancelled">Đã Hủy</option>
            </select>

            {(selectedVilla !== 'all' || selectedStatus !== 'all' || globalFilter) && (
              <button
                onClick={() => {
                  setSelectedVilla('all');
                  setSelectedStatus('all');
                  setGlobalFilter('');
                }}
                className="text-xs text-[#C2A476] hover:underline flex items-center gap-1 font-semibold ml-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Đặt lại
              </button>
            )}
          </div>

          {/* Bulk Selection Actions (Khoanh tròn đỏ: Thêm nút Xóa đã chọn) */}
          {selectedCount > 0 && (
            <div className="flex items-center gap-2 animate-fade-in">
              <button
                onClick={promptBulkDelete}
                className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm hover:shadow-red-600/30 cursor-pointer"
                title="Xóa vĩnh viễn các đơn đặt phòng đã chọn khỏi hệ thống"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa đã chọn</span>
              </button>

              <div className="flex items-center gap-2 bg-[#C2A476]/10 px-3 py-1.5 rounded-xl border border-[#C2A476]/30">
                <span className="font-bold text-xs text-[#14171A] dark:text-[#FAF8F5]">
                  Đã chọn {selectedCount} đơn
                </span>
                <button
                  onClick={handleBulkConfirm}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[11px] hover:bg-blue-700 transition-colors"
                >
                  Xác nhận đã chọn
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TanStack Data Table */}
      <div className="bg-white dark:bg-[#1E2328] rounded-2xl border border-black/5 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="bg-[#FAF8F5] dark:bg-[#14171A] border-b border-black/5 dark:border-white/10 text-[11px] font-bold text-gray-500 uppercase tracking-wider"
                >
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="p-3.5">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5 text-xs">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="p-12 text-center text-gray-400">
                    <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#C2A476]" />
                    <p className="text-sm font-semibold">Không tìm thấy đơn đặt phòng nào</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
                    </p>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => {
                      setActiveBooking(row.original);
                      setSlideOverOpen(true);
                    }}
                    className={cn(
                      'hover:bg-[#C2A476]/5 cursor-pointer transition-colors border-l-2 border-l-transparent hover:border-l-[#C2A476]',
                      row.getIsSelected() && 'bg-[#C2A476]/10'
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-3.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Rows Info */}
        <div className="p-4 border-t border-black/5 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span>Hiển thị</span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="px-2 py-1 rounded-lg bg-[#FAF8F5] dark:bg-[#14171A] border border-black/10 dark:border-white/10 text-xs font-semibold focus:outline-none"
            >
              {[10, 20, 30, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize} dòng
                </option>
              ))}
            </select>
            <span>trong tổng số {filteredData.length} kết quả</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="mr-2">
              Trang {table.getState().pagination.pageIndex + 1} /{' '}
              {Math.max(1, table.getPageCount())}
            </span>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Booking Slide-Over Drawer */}
      <BookingSlideOver
        booking={activeBooking}
        isOpen={slideOverOpen}
        onClose={() => setSlideOverOpen(false)}
        onUpdateStatus={handleUpdateStatus}
        onOpenInvoice={(b) => {
          setInvoiceBooking(b);
          setInvoiceModalOpen(true);
        }}
      />

      {/* Printable Invoice Modal */}
      <InvoiceModal
        booking={invoiceBooking}
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
      />

      {/* Luxury Deletion Confirmation Modal */}
      <LuxuryConfirmDialog
        isOpen={deleteConfirm.isOpen}
        variant="danger"
        badgeText="Bảo Mật & Cảnh Báo"
        title={
          deleteConfirm.isBulk
            ? `Xóa Vĩnh Viễn ${deleteConfirm.count} Đơn Đặt Phòng`
            : `Xác Nhận Xóa Vĩnh Viễn`
        }
        message={
          deleteConfirm.isBulk
            ? `Bạn có chắc chắn muốn xóa vĩnh viễn ${deleteConfirm.count} đơn đặt phòng đã chọn khỏi hệ thống không?\nThao tác này sẽ xóa sạch hồ sơ và tự động mở lại các ngày lưu trú trên trang web công khai.`
            : `Bạn có chắc chắn muốn xóa vĩnh viễn đơn đặt phòng ${deleteConfirm.bookingId} không?\nThao tác này sẽ xóa sạch hồ sơ và tự động giải phóng ngày trên lịch website.`
        }
        noticeText="Cảnh báo: Dữ liệu bị xóa vĩnh viễn sẽ không thể hoàn tác hoặc khôi phục."
        details={
          deleteConfirm.isBulk
            ? [
                { label: 'Số lượng đơn xóa', value: `${deleteConfirm.count} đơn được chọn` },
                { label: 'Phạm vi tác động', value: 'Cơ sở dữ liệu hệ thống & Lịch công khai' },
                { label: 'Trạng thái sau xóa', value: 'Xóa hoàn toàn (Không thể khôi phục)' },
              ]
            : deleteConfirm.booking
            ? [
                { label: 'Mã đơn đặt phòng', value: `#${deleteConfirm.booking.id}` },
                { label: 'Khách hàng', value: deleteConfirm.booking.customerName },
                { label: 'Biệt thự lưu trú', value: deleteConfirm.booking.villaId },
                {
                  label: 'Thời gian lưu trú',
                  value: `${deleteConfirm.booking.checkIn} → ${deleteConfirm.booking.checkOut} (${deleteConfirm.booking.nights} đêm)`,
                },
                {
                  label: 'Tổng giá trị đơn',
                  value: formatVND(deleteConfirm.booking.totalAmount),
                },
                {
                  label: 'Trạng thái hiện tại',
                  value: getStatusLabel(deleteConfirm.booking.status),
                },
              ]
            : deleteConfirm.bookingId
            ? [{ label: 'Mã đơn đặt phòng', value: `#${deleteConfirm.bookingId}` }]
            : undefined
        }
        confirmText={
          deleteConfirm.isBulk
            ? `Xóa ${deleteConfirm.count} Đơn Vĩnh Viễn`
            : 'Xác Nhận Xóa Vĩnh Viễn'
        }
        cancelText="Hủy Bỏ"
        isLoading={isDeleting}
        onConfirm={executeConfirmedDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, isBulk: false })}
      />
    </div>
  );
}
