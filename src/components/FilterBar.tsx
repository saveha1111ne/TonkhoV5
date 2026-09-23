import React from 'react';
import { Search, Calendar, MapPin, Filter, X } from 'lucide-react';
import { Branch } from '../types/inventory';

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  months: string[];
  selectedBranch: string;
  onBranchChange: (branchId: string) => void;
  branches: Branch[];
  filterType: 'all' | 'in' | 'out' | 'stock';
  onFilterTypeChange: (type: 'all' | 'in' | 'out' | 'stock') => void;
  onResetFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedMonth,
  onMonthChange,
  months,
  selectedBranch,
  onBranchChange,
  branches,
  filterType,
  onFilterTypeChange,
  onResetFilters
}) => {
  const isFiltered = searchTerm !== '' || selectedBranch !== 'all' || filterType !== 'all';

  return (
    <div className="bg-white rounded-2xl border border-teal-100/90 p-3 sm:p-4 shadow-xs space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        
        {/* Left Side: Selectors */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Month Selector */}
          <div className="flex items-center gap-1.5 bg-sky-50/70 border border-sky-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
            <Calendar className="w-4 h-4 text-sky-600" />
            <span className="text-xs font-bold text-sky-900">Kỳ tháng:</span>
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              aria-label="Chọn kỳ tháng"
              className="bg-transparent text-xs font-black text-sky-800 focus:outline-none cursor-pointer pr-1"
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Branch Selector */}
          <div className="flex items-center gap-1.5 bg-teal-50/60 border border-teal-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
            <MapPin className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-bold text-teal-900">Chi nhánh:</span>
            <select
              value={selectedBranch}
              onChange={(e) => onBranchChange(e.target.value)}
              aria-label="Chọn chi nhánh"
              className="bg-transparent text-xs font-semibold text-teal-950 focus:outline-none cursor-pointer pr-1"
            >
              <option value="all">Toàn bộ 4 chi nhánh</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.region})
                </option>
              ))}
            </select>
          </div>

          {/* Data Type Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-700">Hiển thị:</span>
            <select
              value={filterType}
              onChange={(e) => onFilterTypeChange(e.target.value as any)}
              aria-label="Chọn kiểu dữ liệu hiển thị"
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1"
            >
              <option value="all">Tất cả (Đầu - Nhập - Xuất - Tồn)</option>
              <option value="in">Chỉ có phát sinh Nhập</option>
              <option value="out">Chỉ có phát sinh Xuất</option>
              <option value="stock">Chỉ hàng còn Tồn kho</option>
            </select>
          </div>

          {/* Reset button if filtered */}
          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition"
              title="Đặt lại bộ lọc về mặc định"
            >
              <X className="w-3.5 h-3.5" />
              <span>Xóa lọc</span>
            </button>
          )}

        </div>

        {/* Right Side: Search Box */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="🔍 Tìm kiếm mã vật tư / tên vật tư..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs font-medium bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-teal-500 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-2xs"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
