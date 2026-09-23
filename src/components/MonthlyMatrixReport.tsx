import React, { useState } from 'react';
import { Branch, Item, StockRecord } from '../types/inventory';
import { Table, Calendar, Eye } from 'lucide-react';

interface MonthlyMatrixReportProps {
  months: string[];
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  items: Item[];
  branches: Branch[];
  stockRecords: Record<string, StockRecord[]>;
}

export const MonthlyMatrixReport: React.FC<MonthlyMatrixReportProps> = ({
  months,
  selectedMonth,
  onMonthChange,
  items,
  branches,
  stockRecords
}) => {
  const [metric, setMetric] = useState<'final' | 'in' | 'out' | 'initial' | 'all'>('final');

  const currentRecords = stockRecords[selectedMonth] || [];

  // Helper to get record
  const getRecord = (itemCode: string, branchId: string) => {
    return currentRecords.find((r) => r.itemCode === itemCode && r.branchId === branchId);
  };

  // Branch totals for footer
  const branchTotals = branches.map((b) => {
    const recs = currentRecords.filter((r) => r.branchId === b.id);
    return {
      branchId: b.id,
      initial: recs.reduce((s, r) => s + r.initialStock, 0),
      inQty: recs.reduce((s, r) => s + r.inQty, 0),
      outQty: recs.reduce((s, r) => s + r.outQty, 0),
      finalStock: recs.reduce((s, r) => s + r.finalStock, 0)
    };
  });

  const grandSystemTotal = {
    initial: branchTotals.reduce((s, b) => s + b.initial, 0),
    inQty: branchTotals.reduce((s, b) => s + b.inQty, 0),
    outQty: branchTotals.reduce((s, b) => s + b.outQty, 0),
    finalStock: branchTotals.reduce((s, b) => s + b.finalStock, 0)
  };

  return (
    <div className="bg-white rounded-2xl border border-teal-100 shadow-xs overflow-hidden space-y-4 p-4 sm:p-6">
      
      {/* Top Header of Matrix */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-teal-50 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Table className="w-5 h-5 text-teal-600" />
            <h2 className="font-extrabold text-base sm:text-lg text-slate-800">
              BÁO CÁO MA TRẬN NHẬP - XUẤT - TỒN THEO CHI NHÁNH
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            So sánh trực quan chỉ số giữa 4 chi nhánh: Hà Nội, Đà Nẵng, HCM, Cần Thơ
          </p>
        </div>

        {/* Controls: Month Dropdown + Metric Tabs */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month Dropdown */}
          <div className="flex items-center gap-1.5 bg-sky-50 border border-sky-300 rounded-xl px-3 py-1.5 shadow-2xs">
            <Calendar className="w-4 h-4 text-sky-700" />
            <span className="text-xs font-bold text-sky-900">Tháng:</span>
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              aria-label="Chọn tháng báo cáo ma trận"
              className="bg-transparent text-xs font-black text-sky-800 focus:outline-none cursor-pointer pr-1"
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setMetric('final')}
              className={`px-2.5 py-1 rounded-lg transition ${
                metric === 'final'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tồn cuối
            </button>
            <button
              onClick={() => setMetric('in')}
              className={`px-2.5 py-1 rounded-lg transition ${
                metric === 'in'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nhập kho
            </button>
            <button
              onClick={() => setMetric('out')}
              className={`px-2.5 py-1 rounded-lg transition ${
                metric === 'out'
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Xuất kho
            </button>
            <button
              onClick={() => setMetric('all')}
              className={`px-2.5 py-1 rounded-lg transition ${
                metric === 'all'
                  ? 'bg-slate-800 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Xem chi tiết cả 3
            </button>
          </div>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto border border-teal-100 rounded-xl">
        <table className="w-full text-xs text-left">
          <thead className="bg-[#E0F2F1] text-teal-950 font-extrabold border-b border-teal-200">
            <tr>
              <th className="py-3 px-4 font-mono w-28">MÃ SKU</th>
              <th className="py-3 px-4">TÊN VẬT TƯ</th>
              <th className="py-3 px-2 text-center w-16">ĐVT</th>
              {branches.map((b) => (
                <th key={b.id} className="py-3 px-3 text-right font-black">
                  {b.name.toUpperCase()}
                </th>
              ))}
              <th className="py-3 px-4 text-right bg-teal-200/60 text-teal-950 font-black">
                TỔNG HỆ THỐNG
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {items.map((item) => {
              // Calculate row total
              let rowTotal = 0;
              branches.forEach((b) => {
                const rec = getRecord(item.code, b.id);
                if (rec) {
                  if (metric === 'final') rowTotal += rec.finalStock;
                  else if (metric === 'in') rowTotal += rec.inQty;
                  else if (metric === 'out') rowTotal += rec.outQty;
                  else if (metric === 'initial') rowTotal += rec.initialStock;
                  else rowTotal += rec.finalStock;
                }
              });

              return (
                <tr key={item.code} className="hover:bg-teal-50/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-teal-900">
                    {item.code}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {item.name}
                  </td>
                  <td className="py-3 px-2 text-center text-slate-500 font-medium">
                    {item.unit}
                  </td>

                  {/* Branch Cells */}
                  {branches.map((b) => {
                    const rec = getRecord(item.code, b.id);
                    if (!rec) return <td key={b.id} className="py-3 px-3 text-right text-slate-300">-</td>;

                    if (metric === 'all') {
                      return (
                        <td key={b.id} className="py-2.5 px-3 text-right font-mono bg-slate-50/50">
                          <div className="text-[10px] text-slate-400">Đầu: {rec.initialStock}</div>
                          <div className="text-[11px] text-emerald-600 font-bold">+{rec.inQty}</div>
                          <div className="text-[11px] text-sky-600 font-bold">-{rec.outQty}</div>
                          <div className="text-xs font-black text-teal-900 border-t border-slate-200 pt-0.5">
                            Tồn: {rec.finalStock}
                          </div>
                        </td>
                      );
                    }

                    const val =
                      metric === 'final'
                        ? rec.finalStock
                        : metric === 'in'
                        ? rec.inQty
                        : metric === 'out'
                        ? rec.outQty
                        : rec.initialStock;

                    const colorClass =
                      metric === 'in'
                        ? 'text-emerald-700 font-bold'
                        : metric === 'out'
                        ? 'text-sky-700 font-bold'
                        : 'text-slate-800 font-bold';

                    return (
                      <td key={b.id} className={`py-3 px-3 text-right font-mono text-xs ${colorClass}`}>
                        {val.toLocaleString('vi-VN')}
                      </td>
                    );
                  })}

                  {/* Row Total Cell */}
                  <td className="py-3 px-4 text-right font-black font-mono text-sm text-teal-950 bg-teal-50/70">
                    {rowTotal.toLocaleString('vi-VN')}
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Matrix Footer Totals */}
          <tfoot className="bg-[#B2DFDB]/60 border-t-2 border-teal-300 font-black text-slate-900">
            <tr>
              <td colSpan={3} className="py-3.5 px-4 uppercase tracking-wider text-teal-950">
                TỔNG {metric === 'in' ? 'NHẬP' : metric === 'out' ? 'XUẤT' : 'TỒN'} THEO CHI NHÁNH
              </td>
              {branchTotals.map((bt) => {
                const bVal =
                  metric === 'in'
                    ? bt.inQty
                    : metric === 'out'
                    ? bt.outQty
                    : metric === 'initial'
                    ? bt.initial
                    : bt.finalStock;

                return (
                  <td key={bt.branchId} className="py-3.5 px-3 text-right font-mono text-sm text-teal-950">
                    {bVal.toLocaleString('vi-VN')}
                  </td>
                );
              })}
              <td className="py-3.5 px-4 text-right font-mono text-base text-teal-950 bg-teal-200/70">
                {(metric === 'in'
                  ? grandSystemTotal.inQty
                  : metric === 'out'
                  ? grandSystemTotal.outQty
                  : grandSystemTotal.finalStock
                ).toLocaleString('vi-VN')}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

    </div>
  );
};
