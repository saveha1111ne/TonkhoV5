import React, { useState, useEffect } from 'react';
import { Branch, Item, StockRecord, Transaction } from '../../types/inventory';
import { ArrowUpFromLine, X, AlertTriangle } from 'lucide-react';

interface OutboundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Partial<Transaction>) => void;
  editingTransaction: Transaction | null;
  items: Item[];
  branches: Branch[];
  months: string[];
  defaultMonth: string;
  stockRecords: Record<string, StockRecord[]>;
}

export const OutboundModal: React.FC<OutboundModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
  items,
  branches,
  months,
  defaultMonth,
  stockRecords
}) => {
  const [month, setMonth] = useState(defaultMonth);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [branchId, setBranchId] = useState(branches[0]?.id || 'b-hn');
  const [itemCode, setItemCode] = useState(items[0]?.code || '');
  const [quantity, setQuantity] = useState<number | string>(10);
  const [receiverOrDeliverer, setReceiverOrDeliverer] = useState('');
  const [notes, setNotes] = useState('');
  const [forceAllowExcess, setForceAllowExcess] = useState(false);

  useEffect(() => {
    if (editingTransaction) {
      setMonth(editingTransaction.month);
      setDate(editingTransaction.date);
      setBranchId(editingTransaction.branchId);
      setItemCode(editingTransaction.itemCode);
      setQuantity(editingTransaction.quantity);
      setReceiverOrDeliverer(editingTransaction.receiverOrDeliverer || '');
      setNotes(editingTransaction.notes || '');
    } else {
      setMonth(defaultMonth);
      setDate(new Date().toISOString().split('T')[0]);
      if (branches[0]) setBranchId(branches[0].id);
      if (items[0]) setItemCode(items[0].code);
      setQuantity(20);
      setReceiverOrDeliverer('');
      setNotes('');
      setForceAllowExcess(false);
    }
  }, [editingTransaction, isOpen, defaultMonth, branches, items]);

  if (!isOpen) return null;

  const selectedItem = items.find((i) => i.code === itemCode);
  const selectedBranch = branches.find((b) => b.id === branchId);

  // Calculate current available stock at this branch in this month
  const monthRecords = stockRecords[month] || [];
  const currentRecord = monthRecords.find((r) => r.itemCode === itemCode && r.branchId === branchId);
  // When editing, available stock calculation adds back the editing tx quantity
  const availableStock = currentRecord
    ? currentRecord.finalStock + (editingTransaction ? Number(editingTransaction.quantity || 0) : 0)
    : 0;

  const currentQtyNum = Number(quantity) || 0;
  const isExceeding = currentQtyNum > availableStock;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      alert('Vui lòng nhập số lượng xuất hợp lệ lớn hơn 0!');
      return;
    }

    if (isExceeding && !forceAllowExcess) {
      const confirmExceed = window.confirm(
        `⚠️ CẢNH BÁO XUẤT VƯỢT TỒN KHO:\n\nSố lượng xuất (${qty}) lớn hơn tồn kho hiện có (${availableStock}) tại ${selectedBranch?.name}.\n\nBạn có muốn ghi nhận xuất nợ kho không?`
      );
      if (!confirmExceed) {
        return;
      }
    }

    onSave({
      ...(editingTransaction ? { id: editingTransaction.id, code: editingTransaction.code } : {}),
      type: 'OUT',
      month,
      date,
      branchId,
      branchName: selectedBranch?.name || 'Chi nhánh',
      itemCode,
      itemName: selectedItem?.name || itemCode,
      unit: selectedItem?.unit || 'Cái',
      quantity: qty,
      receiverOrDeliverer,
      notes
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-sky-100 animate-in fade-in zoom-in duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-sky-50 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-black">
              <ArrowUpFromLine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-800">
                {editingTransaction ? 'SỬA PHIẾU XUẤT KHO' : 'LẬP PHIẾU XUẤT KHO'}
              </h3>
              <p className="text-[11px] text-sky-700 font-semibold">
                Team CIC • Tự động trừ vào tồn kho
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Kỳ tháng giao dịch*
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              >
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Ngày giao dịch*
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Chi nhánh xuất hàng*
            </label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.region})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Vật tư xuất kho*
            </label>
            <select
              value={itemCode}
              onChange={(e) => setItemCode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              {items.map((it) => (
                <option key={it.code} value={it.code}>
                  [{it.code}] {it.name} ({it.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Current Stock Indicator */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-teal-50/70 border border-teal-200">
            <span className="text-[11px] font-bold text-teal-900">
              Tồn khả dụng tại {selectedBranch?.name}:
            </span>
            <span className="font-mono font-black text-teal-900 text-sm">
              {availableStock.toLocaleString('vi-VN')} {selectedItem?.unit || 'Cái'}
            </span>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Số lượng xuất* ({selectedItem?.unit || 'Cái'})
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              placeholder="Nhập số lượng xuất"
              className={`w-full border rounded-xl px-3 py-2 text-sm font-black focus:outline-none focus:ring-2 ${
                isExceeding
                  ? 'bg-red-50 border-red-400 text-red-900 focus:ring-red-400/20'
                  : 'bg-sky-50/50 border-sky-300 text-sky-900 focus:ring-sky-500/20'
              }`}
            />
          </div>

          {/* Warning banner if exceeding */}
          {isExceeding && (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-2 text-[11px] font-medium">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Cảnh báo: Xuất vượt quá tồn hiện tại ({availableStock})</p>
                <p className="text-amber-800">Kho sẽ ghi nhận âm/nợ kho nếu bạn tiếp tục.</p>
              </div>
            </div>
          )}

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Người nhận / Bộ phận nhận
            </label>
            <input
              type="text"
              value={receiverOrDeliverer}
              onChange={(e) => setReceiverOrDeliverer(e.target.value)}
              placeholder="Ví dụ: Team Sales HCM, Sự kiện nội bộ, Đối tác..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Ghi chú xuất kho
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Mục đích xuất, sự kiện áp dụng..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 transition"
            >
              Hủy thao tác
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-extrabold shadow-sm transition"
            >
              {editingTransaction ? 'CẬP NHẬT' : 'LƯU XUẤT KHO'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
