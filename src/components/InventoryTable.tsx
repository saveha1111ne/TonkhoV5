import React, { useState } from 'react';
import { Branch, Item, StockRecord } from '../types/inventory';
import { Layers, Building2, ListFilter, AlertTriangle } from 'lucide-react';

interface InventoryTableProps {
  selectedMonth: string;
  items: Item[];
  branches: Branch[];
  stockRecords: Record<string, StockRecord[]>;
  selectedBranch: string;
  searchTerm: string;
  filterType: 'all' | 'in' | 'out' | 'stock';
  onQuickInbound?: (itemCode: string, branchId?: string) => void;
  onQuickOutbound?: (itemCode: string, branchId?: string) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  selectedMonth,
  items,
  branches,
  stockRecords,
  selectedBranch,
  searchTerm,
  filterType,
  onQuickInbound,
  onQuickOutbound
}) => {
  const [viewMode, setViewMode] = useState<'item_summary' | 'branch_summary' | 'detailed'>('item_summary');

  const currentRecords = stockRecords[selectedMonth] || [];
  const itemMap = new Map(items.map((i) => [i.code, i]));
  const branchMap = new Map(branches.map((b) => [b.id, b]));

  // 1. Filter records by branch
  const branchFilteredRecords = selectedBranch === 'all'
    ? currentRecords
    : currentRecords.filter((r) => r.branchId === selectedBranch);

  // 2. Filter by search term
  const searchedRecords = branchFilteredRecords.filter((r) => {
    if (!searchTerm) return true;
    const item = itemMap.get(r.itemCode);
    const searchLower = searchTerm.toLowerCase();
    const codeMatch = r.itemCode.toLowerCase().includes(searchLower);
    const nameMatch = item ? item.name.toLowerCase().includes(searchLower) : false;
    const categoryMatch = item ? item.category.toLowerCase().includes(searchLower) : false;
    return codeMatch || nameMatch || categoryMatch;
  });

  // 3. Filter by type
  const typeFilteredRecords = searchedRecords.filter((r) => {
    if (filterType === 'in') return r.inQty > 0;
    if (filterType === 'out') return r.outQty > 0;
    if (filterType === 'stock') return r.finalStock > 0;
    return true;
  });

  // Aggregation 1: Group by Item (Toàn hệ thống hoặc theo chi nhánh chọn)
  const itemSummaryList = items
    .filter((item) => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        item.code.toLowerCase().includes(searchLower) ||
        item.name.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower)
      );
    })
    .map((item) => {
      const recs = branchFilteredRecords.filter((r) => r.itemCode === item.code);
      const initial = recs.reduce((sum, r) => sum + r.initialStock, 0);
      const inQty = recs.reduce((sum, r) => sum + r.inQty, 0);
      const outQty = recs.reduce((sum, r) => sum + r.outQty, 0);
      const finalStock = initial + inQty - outQty;
      const isLowStock = item.minStockAlert ? finalStock < item.minStockAlert : false;

      return {
        item,
        initial,
        inQty,
        outQty,
        finalStock,
        isLowStock
      };
    })
    .filter((entry) => {
      if (filterType === 'in') return entry.inQty > 0;
      if (filterType === 'out') return entry.outQty > 0;
      if (filterType === 'stock') return entry.finalStock > 0;
      return true;
    });

  // Aggregation 2: Group by Branch
  const branchSummaryList = branches.map((branch) => {
    const recs = currentRecords.filter((r) => r.branchId === branch.id);
    const initial = recs.reduce((sum, r) => sum + r.initialStock, 0);
    const inQty = recs.reduce((sum, r) => sum + r.inQty, 0);
    const outQty = recs.reduce((sum, r) => sum + r.outQty, 0);
    const finalStock = initial + inQty - outQty;

    return {
      branch,
      initial,
      inQty,
      outQty,
      finalStock
    };
  });

  // Overall totals
  const grandInitial = branchSummaryList.reduce((sum, b) => sum + b.initial, 0);
  const grandIn = branchSummaryList.reduce((sum, b) => sum + b.inQty, 0);
  const grandOut = branchSummaryList.reduce((sum, b) => sum + b.outQty, 0);
  const grandFinal = grandInitial + grandIn - grandOut;

  return (
    <div className="bg-white rounded-2xl border border-teal-100 shadow-xs overflow-hidden">
      
      {/* Header & Mode Switcher */}
      <div className="px-4 sm:px-6 py-4 border-b border-teal-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-teal-50/40 to-sky-50/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
            <h2 className="font-extrabold text-base sm:text-lg text-slate-800 tracking-wide">
              BẢNG TỔNG HỢP NHẬP - XUẤT - TỒN ({selectedMonth})
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Công thức: <span className="font-bold text-teal-800">Tồn cuối = Tồn đầu + Nhập - Xuất</span> (Tự động tính ngay lập tức)
          </p>
        </div>

        {/* View Mode Buttons */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-teal-200/80 shadow-2xs">
          <button
            onClick={() => setViewMode('item_summary')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'item_summary'
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Theo vật tư</span>
          </button>

          <button
            onClick={() => setViewMode('branch_summary')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'branch_summary'
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Theo chi nhánh</span>
          </button>

          <button
            onClick={() => setViewMode('detailed')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'detailed'
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Chi tiết VT × Kho</span>
          </button>
        </div>
      </div>

      {/* TABLE 1: THEO VẬT TƯ */}
      {viewMode === 'item_summary' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-[#E0F2F1]/80 text-teal-950 font-extrabold border-b border-teal-200">
              <tr>
                <th className="py-3 px-4 font-mono">MÃ VẬT TƯ</th>
                <th className="py-3 px-4">TÊN VẬT TƯ</th>
                <th className="py-3 px-3">ĐƠN VỊ</th>
                <th className="py-3 px-3">NHÓM</th>
                <th className="py-3 px-3 text-right">TỒN ĐẦU</th>
                <th className="py-3 px-3 text-right text-emerald-800">NHẬP (+)</th>
                <th className="py-3 px-3 text-right text-sky-800">XUẤT (-)</th>
                <th className="py-3 px-4 text-right text-teal-950 font-black">TỒN CUỐI</th>
                <th className="py-3 px-3 text-center">CẢNH BÁO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {itemSummaryList.map((entry) => (
                <tr
                  key={entry.item.code}
                  className="hover:bg-teal-50/40 transition-colors group"
                >
                  <td className="py-3 px-4 font-mono font-bold text-teal-900 group-hover:text-teal-700">
                    {entry.item.code}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {entry.item.name}
                  </td>
                  <td className="py-3 px-3 text-slate-500 font-medium">
                    {entry.item.unit}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600 border border-slate-200">
                      {entry.item.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-slate-600 font-mono">
                    {entry.initial.toLocaleString('vi-VN')}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-600 font-mono">
                    +{entry.inQty.toLocaleString('vi-VN')}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-sky-600 font-mono">
                    -{entry.outQty.toLocaleString('vi-VN')}
                  </td>
                  <td className="py-3 px-4 text-right font-black text-teal-950 font-mono text-sm bg-teal-50/50">
                    {entry.finalStock.toLocaleString('vi-VN')}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {entry.isLowStock ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-300">
                        <AlertTriangle className="w-3 h-3" />
                        Dưới mức ({entry.item.minStockAlert})
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        ✓ Đạt chuẩn
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Total Footer Row */}
            <tfoot className="bg-[#B2DFDB]/50 border-t-2 border-teal-300 font-black text-slate-900">
              <tr>
                <td colSpan={4} className="py-3.5 px-4 uppercase tracking-wider text-teal-950">
                  TỔNG CỘNG TOÀN HỆ THỐNG
                </td>
                <td className="py-3.5 px-3 text-right font-mono text-sm">
                  {grandInitial.toLocaleString('vi-VN')}
                </td>
                <td className="py-3.5 px-3 text-right font-mono text-sm text-emerald-800">
                  +{grandIn.toLocaleString('vi-VN')}
                </td>
                <td className="py-3.5 px-3 text-right font-mono text-sm text-sky-800">
                  -{grandOut.toLocaleString('vi-VN')}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-base text-teal-950 bg-teal-200/50">
                  {grandFinal.toLocaleString('vi-VN')}
                </td>
                <td className="py-3.5 px-3 text-center text-xs text-teal-900">
                  {items.length} SKU
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* TABLE 2: THEO CHI NHÁNH */}
      {viewMode === 'branch_summary' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-[#E0F2F1]/80 text-teal-950 font-extrabold border-b border-teal-200">
              <tr>
                <th className="py-3 px-4">CHI NHÁNH</th>
                <th className="py-3 px-4">KHU VỰC</th>
                <th className="py-3 px-3 text-right">TỒN ĐẦU</th>
                <th className="py-3 px-3 text-right text-emerald-800">TỔNG NHẬP (+)</th>
                <th className="py-3 px-3 text-right text-sky-800">TỔNG XUẤT (-)</th>
                <th className="py-3 px-4 text-right text-teal-950 font-black">TỒN CUỐI</th>
                <th className="py-3 px-4 text-right">TỶ TRỌNG TỒN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {branchSummaryList.map((entry) => {
                const ratio = grandFinal > 0 ? ((entry.finalStock / grandFinal) * 100).toFixed(1) : '0.0';
                return (
                  <tr
                    key={entry.branch.id}
                    className="hover:bg-teal-50/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900 text-sm flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                      {entry.branch.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {entry.branch.region}
                    </td>
                    <td className="py-3.5 px-3 text-right font-medium text-slate-600 font-mono text-sm">
                      {entry.initial.toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-emerald-600 font-mono text-sm">
                      +{entry.inQty.toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-sky-600 font-mono text-sm">
                      -{entry.outQty.toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-teal-950 font-mono text-base bg-teal-50/50">
                      {entry.finalStock.toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-teal-800 font-mono">
                      {ratio}%
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Grand Total */}
            <tfoot className="bg-[#B2DFDB]/50 border-t-2 border-teal-300 font-black text-slate-900">
              <tr>
                <td className="py-3.5 px-4 uppercase tracking-wider text-teal-950">
                  TỔNG TOÀN HỆ THỐNG
                </td>
                <td className="py-3.5 px-4 text-slate-600">4 Chi nhánh</td>
                <td className="py-3.5 px-3 text-right font-mono text-sm">
                  {grandInitial.toLocaleString('vi-VN')}
                </td>
                <td className="py-3.5 px-3 text-right font-mono text-sm text-emerald-800">
                  +{grandIn.toLocaleString('vi-VN')}
                </td>
                <td className="py-3.5 px-3 text-right font-mono text-sm text-sky-800">
                  -{grandOut.toLocaleString('vi-VN')}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-base text-teal-950 bg-teal-200/50">
                  {grandFinal.toLocaleString('vi-VN')}
                </td>
                <td className="py-3.5 px-4 text-right font-bold font-mono">100.0%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* TABLE 3: CHI TIẾT TỪNG CHI NHÁNH & VẬT TƯ */}
      {viewMode === 'detailed' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-[#E0F2F1]/80 text-teal-950 font-extrabold border-b border-teal-200">
              <tr>
                <th className="py-3 px-4 font-mono">MÃ VẬT TƯ</th>
                <th className="py-3 px-4">TÊN VẬT TƯ</th>
                <th className="py-3 px-3">ĐVT</th>
                <th className="py-3 px-3">CHI NHÁNH</th>
                <th className="py-3 px-3 text-right">TỒN ĐẦU</th>
                <th className="py-3 px-3 text-right text-emerald-800">NHẬP (+)</th>
                <th className="py-3 px-3 text-right text-sky-800">XUẤT (-)</th>
                <th className="py-3 px-4 text-right text-teal-950 font-black">TỒN CUỐI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {typeFilteredRecords.map((r, idx) => {
                const item = itemMap.get(r.itemCode);
                const branch = branchMap.get(r.branchId);
                return (
                  <tr
                    key={idx}
                    className="hover:bg-teal-50/40 transition-colors"
                  >
                    <td className="py-2.5 px-4 font-mono font-bold text-teal-900">
                      {r.itemCode}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-800">
                      {item ? item.name : r.itemCode}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-medium">
                      {item ? item.unit : ''}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">
                      {branch ? branch.name : r.branchId}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-600 font-mono">
                      {r.initialStock.toLocaleString('vi-VN')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-600 font-mono">
                      +{r.inQty.toLocaleString('vi-VN')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-sky-600 font-mono">
                      -{r.outQty.toLocaleString('vi-VN')}
                    </td>
                    <td className="py-2.5 px-4 text-right font-black text-teal-950 font-mono bg-teal-50/40">
                      {r.finalStock.toLocaleString('vi-VN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Table Footer Guide */}
      <div className="px-4 py-2.5 bg-slate-50/70 border-t border-teal-100 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
        <span>✓ Dữ liệu được tính toán tức thì theo thời gian thực (Real-time recalculation)</span>
        <span className="font-semibold text-teal-800">Team CIC Inventory Standard</span>
      </div>

    </div>
  );
};
