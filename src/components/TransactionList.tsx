import React, { useState } from 'react';
import { Transaction, Branch, Item } from '../types/inventory';
import { ArrowDownToLine, ArrowUpFromLine, Edit2, Trash2, Plus, Calendar, MapPin, Search } from 'lucide-react';

interface TransactionListProps {
  type: 'IN' | 'OUT';
  transactions: Transaction[];
  branches: Branch[];
  items: Item[];
  months: string[];
  selectedMonth: string;
  onOpenCreate: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (tx: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  type,
  transactions,
  branches,
  items,
  months,
  selectedMonth,
  onOpenCreate,
  onEditTransaction,
  onDeleteTransaction
}) => {
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterBranch, setFilterBranch] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const isIN = type === 'IN';

  // Filter transactions
  const filtered = transactions
    .filter((t) => t.type === type)
    .filter((t) => (filterMonth === 'all' ? true : t.month === filterMonth))
    .filter((t) => (filterBranch === 'all' ? true : t.branchId === filterBranch))
    .filter((t) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        t.code.toLowerCase().includes(s) ||
        t.itemCode.toLowerCase().includes(s) ||
        t.itemName.toLowerCase().includes(s) ||
        (t.receiverOrDeliverer || '').toLowerCase().includes(s) ||
        (t.notes || '').toLowerCase().includes(s)
      );
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalQty = filtered.reduce((sum, t) => sum + Number(t.quantity || 0), 0);

  return (
    <div className="bg-white rounded-2xl border border-teal-100 shadow-xs overflow-hidden space-y-4 p-4 sm:p-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-teal-50 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm ${
              isIN ? 'bg-emerald-600' : 'bg-sky-600'
            }`}
          >
            {isIN ? <ArrowDownToLine className="w-5 h-5" /> : <ArrowUpFromLine className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="font-extrabold text-base sm:text-lg text-slate-800">
              {isIN ? 'DANH SÁCH PHIẾU NHẬP KHO' : 'DANH SÁCH PHIẾU XUẤT KHO'}
            </h2>
            <p className="text-xs text-slate-500">
              Tổng số {filtered.length} phiếu ({totalQty.toLocaleString('vi-VN')} đơn vị sản phẩm)
            </p>
          </div>
        </div>

        {/* Add Transaction Button */}
        <button
          onClick={onOpenCreate}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold shadow-sm hover:shadow transition active:scale-95 ${
            isIN ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-sky-600 hover:bg-sky-700'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>{isIN ? 'LẬP PHIẾU NHẬP' : 'LẬP PHIẾU XUẤT'}</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
        <div className="flex flex-wrap items-center gap-2">
          {/* Month */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-600">Tháng:</span>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              aria-label="Lọc tháng giao dịch"
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">Tất cả các tháng</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Branch */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-600">Chi nhánh:</span>
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              aria-label="Lọc chi nhánh giao dịch"
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">Tất cả 4 chi nhánh</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo mã phiếu, vật tư, người nhận..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-teal-100 rounded-xl">
        <table className="w-full text-xs text-left">
          <thead className="bg-[#E0F2F1] text-teal-950 font-extrabold border-b border-teal-200">
            <tr>
              <th className="py-3 px-3 w-28">MÃ PHIẾU</th>
              <th className="py-3 px-3">NGÀY GD</th>
              <th className="py-3 px-3">THÁNG</th>
              <th className="py-3 px-3">CHI NHÁNH</th>
              <th className="py-3 px-3 font-mono">MÃ VẬT TƯ</th>
              <th className="py-3 px-4">TÊN VẬT TƯ</th>
              <th className="py-3 px-2 text-center">ĐVT</th>
              <th className="py-3 px-3 text-right">SỐ LƯỢNG</th>
              <th className="py-3 px-3">{isIN ? 'NGƯỜI GIAO / NGUỒN' : 'NGƯỜI NHẬN / BỘ PHẬN'}</th>
              <th className="py-3 px-3">GHI CHÚ</th>
              <th className="py-3 px-3 text-center">THAO TÁC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-slate-400">
                  Không tìm thấy giao dịch nào phù hợp với điều kiện lọc
                </td>
              </tr>
            ) : (
              filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-teal-50/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                        isIN ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {tx.code}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-600 whitespace-nowrap">
                    {tx.date}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-700 whitespace-nowrap">
                    {tx.month}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800">
                    {tx.branchName}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-teal-800">
                    {tx.itemCode}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {tx.itemName}
                  </td>
                  <td className="py-3 px-2 text-center text-slate-500">
                    {tx.unit}
                  </td>
                  <td
                    className={`py-3 px-3 text-right font-mono font-black text-sm ${
                      isIN ? 'text-emerald-700' : 'text-sky-700'
                    }`}
                  >
                    {isIN ? `+${tx.quantity}` : `-${tx.quantity}`}
                  </td>
                  <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                    {tx.receiverOrDeliverer || '-'}
                  </td>
                  <td className="py-3 px-3 text-slate-500 max-w-xs truncate">
                    {tx.notes || '-'}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onEditTransaction(tx)}
                        className="p-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 transition"
                        title="Sửa giao dịch"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteTransaction(tx)}
                        className="p-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition"
                        title="Xóa giao dịch"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>

          {/* Footer Total */}
          {filtered.length > 0 && (
            <tfoot className="bg-[#B2DFDB]/60 border-t-2 border-teal-300 font-black text-slate-900">
              <tr>
                <td colSpan={7} className="py-3 px-3 uppercase tracking-wider text-teal-950">
                  TỔNG CỘNG ({filtered.length} PHIẾU)
                </td>
                <td
                  className={`py-3 px-3 text-right font-mono text-sm ${
                    isIN ? 'text-emerald-900' : 'text-sky-900'
                  }`}
                >
                  {isIN ? `+${totalQty.toLocaleString('vi-VN')}` : `-${totalQty.toLocaleString('vi-VN')}`}
                </td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

    </div>
  );
};
