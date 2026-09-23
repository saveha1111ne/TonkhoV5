import React, { useState } from 'react';
import { Branch, Item, StockRecord, Transaction } from '../types/inventory';
import { BarChart3, PieChart, TrendingUp, ArrowUpDown } from 'lucide-react';

interface ChartsSectionProps {
  selectedMonth: string;
  branches: Branch[];
  items: Item[];
  months: string[];
  stockRecords: Record<string, StockRecord[]>;
  transactions: Transaction[];
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  selectedMonth,
  branches,
  items,
  months,
  stockRecords,
  transactions
}) => {
  const [hoveredBranch, setHoveredBranch] = useState<string | null>(null);

  // 1. Data for Branch Stock Comparison (Selected Month)
  const currentMonthRecords = stockRecords[selectedMonth] || [];
  const totalSystemStock = currentMonthRecords.reduce((sum, r) => sum + r.finalStock, 0);

  const branchData = branches.map((branch) => {
    const branchRecs = currentMonthRecords.filter((r) => r.branchId === branch.id);
    const stock = branchRecs.reduce((sum, r) => sum + r.finalStock, 0);
    const inQty = branchRecs.reduce((sum, r) => sum + r.inQty, 0);
    const outQty = branchRecs.reduce((sum, r) => sum + r.outQty, 0);
    const percentage = totalSystemStock > 0 ? (stock / totalSystemStock) * 100 : 0;
    return {
      id: branch.id,
      name: branch.name,
      stock,
      inQty,
      outQty,
      percentage
    };
  });

  const maxBranchStock = Math.max(...branchData.map((b) => b.stock), 100);

  // 2. Data for Monthly In/Out Comparison across all months
  const monthlyData = months.map((m) => {
    const mTrans = transactions.filter((t) => t.month === m);
    const inSum = mTrans.filter((t) => t.type === 'IN').reduce((sum, t) => sum + Number(t.quantity || 0), 0);
    const outSum = mTrans.filter((t) => t.type === 'OUT').reduce((sum, t) => sum + Number(t.quantity || 0), 0);
    const mRecs = stockRecords[m] || [];
    const stockSum = mRecs.reduce((sum, r) => sum + r.finalStock, 0);
    return {
      month: m,
      inQty: inSum,
      outQty: outSum,
      finalStock: stockSum
    };
  });

  const maxMonthlyActivity = Math.max(
    ...monthlyData.map((d) => Math.max(d.inQty, d.outQty, 10))
  );

  const maxMonthlyStock = Math.max(...monthlyData.map((d) => d.finalStock), 100);

  // Palette colors for branches
  const BRANCH_COLORS = ['#00897B', '#29B6F6', '#80CBC4', '#FFB74D', '#BA68C8', '#4DB6AC'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-6 bg-gradient-to-b from-[#00897B] to-[#29B6F6] rounded-full" />
          <h2 className="font-extrabold text-base sm:text-lg text-slate-800">
            PHÂN TÍCH HÀNG TỒN KHO & XU HƯỚNG
          </h2>
        </div>
        <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          Kỳ phân tích: {selectedMonth}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* CHART 1: TỒN KHO THEO CHI NHÁNH (Bar Chart) */}
        <div className="bg-white rounded-2xl border border-teal-100 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-teal-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                1. Tồn kho theo từng chi nhánh ({selectedMonth})
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">Đơn vị: Sản phẩm</span>
          </div>

          <div className="space-y-3.5 my-auto pt-2">
            {branchData.map((branch, index) => {
              const barWidth = maxBranchStock > 0 ? (branch.stock / maxBranchStock) * 100 : 0;
              const color = BRANCH_COLORS[index % BRANCH_COLORS.length];

              return (
                <div key={branch.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: color }} />
                      {branch.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-slate-900">
                        {branch.stock.toLocaleString('vi-VN')} SP
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        ({branch.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-1 text-[9px] font-bold text-white"
                      style={{
                        width: `${Math.max(barWidth, 6)}%`,
                        backgroundColor: color
                      }}
                    >
                      {barWidth > 15 && `${branch.percentage.toFixed(0)}%`}
                    </div>
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-600 px-1">
                    <span>Nhập: <strong className="text-emerald-700">+{branch.inQty}</strong></span>
                    <span>Xuất: <strong className="text-sky-700">-{branch.outQty}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500">Tổng tồn 4 chi nhánh:</span>
            <span className="font-black text-teal-900 font-mono text-sm">
              {totalSystemStock.toLocaleString('vi-VN')} sản phẩm
            </span>
          </div>
        </div>

        {/* CHART 2: TỶ LỆ TỒN KHO THEO VÙNG (Donut Chart) */}
        <div className="bg-white rounded-2xl border border-teal-100 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-sky-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                2. Tỷ lệ tồn kho theo khu vực (Doughnut)
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">Thị phần kho</span>
          </div>

          {/* SVG Donut Visual */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
            <div className="relative w-40 h-40 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {(() => {
                  let accumulatedPercent = 0;
                  return branchData.map((branch, idx) => {
                    const strokeDasharray = `${branch.percentage} ${100 - branch.percentage}`;
                    const strokeDashoffset = -accumulatedPercent;
                    accumulatedPercent += branch.percentage;
                    const color = BRANCH_COLORS[idx % BRANCH_COLORS.length];

                    return (
                      <circle
                        key={branch.id}
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke={color}
                        strokeWidth="16"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        pathLength="100"
                        className="transition-all duration-500 hover:opacity-85 cursor-pointer"
                        onMouseEnter={() => setHoveredBranch(branch.id)}
                        onMouseLeave={() => setHoveredBranch(null)}
                      />
                    );
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider">TỒN KHO</span>
                <span className="text-base font-black text-teal-900 font-mono">
                  {totalSystemStock.toLocaleString('vi-VN')}
                </span>
                <span className="text-[9px] text-teal-700 font-semibold">{selectedMonth}</span>
              </div>
            </div>

            {/* Legend & Breakdown */}
            <div className="space-y-2 flex-1 w-full text-xs">
              {branchData.map((branch, idx) => {
                const color = BRANCH_COLORS[idx % BRANCH_COLORS.length];
                const isHovered = hoveredBranch === branch.id;
                return (
                  <div
                    key={branch.id}
                    className={`flex items-center justify-between p-1.5 rounded-lg transition ${
                      isHovered ? 'bg-teal-50 font-bold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                      <span className="font-semibold text-slate-700">{branch.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-900">{branch.stock} SP</span>
                      <span className="text-slate-600 ml-1.5 font-bold">({branch.percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 text-center">
            * Dữ liệu phản ánh tỷ trọng tồn hàng thực tế giữa các chi nhánh để cân đối điều phối
          </div>
        </div>

        {/* CHART 3: NHẬP - XUẤT THEO THÁNG (Monthly In vs Out Bar Chart) */}
        <div className="bg-white rounded-2xl border border-teal-100 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                3. Nhập - Xuất theo từng tháng
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" /> Nhập
              </span>
              <span className="flex items-center gap-1 text-sky-700 font-bold">
                <span className="w-2.5 h-2.5 bg-sky-500 rounded-sm" /> Xuất
              </span>
            </div>
          </div>

          {/* Vertical Comparison Bars */}
          <div className="pt-6 pb-2 flex items-end justify-around gap-2 h-48 border-b border-slate-200">
            {monthlyData.map((d) => {
              const inHeight = maxMonthlyActivity > 0 ? (d.inQty / maxMonthlyActivity) * 100 : 0;
              const outHeight = maxMonthlyActivity > 0 ? (d.outQty / maxMonthlyActivity) * 100 : 0;
              const isCurrent = d.month === selectedMonth;

              return (
                <div key={d.month} className="flex flex-col items-center flex-1 h-full justify-end group">
                  <div className="flex items-end gap-1 w-full justify-center h-full">
                    {/* In Bar */}
                    <div className="w-4 sm:w-6 flex flex-col items-center justify-end h-full">
                      <span className="text-[10px] font-bold text-emerald-700 mb-1 opacity-90 group-hover:opacity-100">
                        {d.inQty}
                      </span>
                      <div
                        className="w-full bg-emerald-500 hover:bg-emerald-600 rounded-t-md transition-all duration-300"
                        style={{ height: `${Math.max(inHeight, 4)}%` }}
                        title={`Nhập tháng ${d.month}: ${d.inQty} SP`}
                      />
                    </div>

                    {/* Out Bar */}
                    <div className="w-4 sm:w-6 flex flex-col items-center justify-end h-full">
                      <span className="text-[10px] font-bold text-sky-700 mb-1 opacity-90 group-hover:opacity-100">
                        {d.outQty}
                      </span>
                      <div
                        className="w-full bg-sky-500 hover:bg-sky-600 rounded-t-md transition-all duration-300"
                        style={{ height: `${Math.max(outHeight, 4)}%` }}
                        title={`Xuất tháng ${d.month}: ${d.outQty} SP`}
                      />
                    </div>
                  </div>

                  <span className={`mt-2 text-xs font-bold ${isCurrent ? 'text-teal-800 underline' : 'text-slate-600'}`}>
                    {d.month}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-2 text-[11px] text-slate-500 flex justify-between">
            <span>Tự động cập nhật khi phát sinh giao dịch mới</span>
            <span className="font-semibold text-slate-700">Đơn vị: Sản phẩm</span>
          </div>
        </div>

        {/* CHART 4: XU HƯỚNG TỒN KHO THEO THỜI GIAN (Line/Area Chart) */}
        <div className="bg-white rounded-2xl border border-teal-100 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                4. Xu hướng tồn kho toàn hệ thống
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">Diễn biến tổng tồn</span>
          </div>

          {/* SVG Line Graph */}
          <div className="py-2">
            <div className="h-44 w-full relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="stockAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#29B6F6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#00897B" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                <line x1="0" y1="20" x2="300" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
                <line x1="0" y1="60" x2="300" y2="60" stroke="#f1f5f9" strokeDasharray="3 3" />
                <line x1="0" y1="100" x2="300" y2="100" stroke="#f1f5f9" strokeDasharray="3 3" />

                {/* Calculate points */}
                {(() => {
                  if (monthlyData.length === 0) return null;
                  const stepX = 300 / Math.max(monthlyData.length - 1, 1);
                  const points = monthlyData.map((d, i) => {
                    const x = i * stepX;
                    const y = 110 - (d.finalStock / maxMonthlyStock) * 90;
                    return { x, y, d };
                  });

                  const pathD = points.reduce((acc, p, i) => {
                    return `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
                  }, '');

                  const areaD = `${pathD} L ${points[points.length - 1].x} 120 L ${points[0].x} 120 Z`;

                  return (
                    <>
                      {/* Area */}
                      <path d={areaD} fill="url(#stockAreaGrad)" />
                      {/* Line */}
                      <path d={pathD} fill="none" stroke="#00897B" strokeWidth="3" strokeLinecap="round" />
                      {/* Points */}
                      {points.map((p, idx) => (
                        <g key={idx}>
                          <circle cx={p.x} cy={p.y} r="5" fill="#29B6F6" stroke="#ffffff" strokeWidth="2" />
                          <text
                            x={p.x}
                            y={p.y - 10}
                            textAnchor="middle"
                            fontSize="9"
                            fontWeight="bold"
                            fill="#00695C"
                          >
                            {p.d.finalStock}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>

            {/* Labels under graph */}
            <div className="flex justify-between mt-2 pt-1 border-t border-slate-100 text-xs font-bold text-slate-600">
              {monthlyData.map((d) => (
                <span key={d.month}>{d.month}</span>
              ))}
            </div>
          </div>

          <div className="mt-2 text-[11px] text-slate-500 flex justify-between">
            <span>Tồn cuối tháng N tự động chuyển thành Tồn đầu tháng N+1</span>
            <span className="font-semibold text-teal-800">Cơ chế ERP liên tục</span>
          </div>
        </div>

      </div>
    </div>
  );
};
