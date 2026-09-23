import React, { useState, useEffect } from 'react';
import { Branch, Item, Transaction } from '../../types/inventory';
import { ArrowDownToLine, X } from 'lucide-react';

interface InboundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Partial<Transaction>) => void;
  editingTransaction: Transaction | null;
  items: Item[];
  branches: Branch[];
  months: string[];
  defaultMonth: string;
}

export const InboundModal: React.FC<InboundModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
  items,
  branches,
  months,
  defaultMonth
}) => {
  const [month, setMonth] = useState(defaultMonth);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [branchId, setBranchId] = useState(branches[0]?.id || 'b-hn');
  const [itemCode, setItemCode] = useState(items[0]?.code || '');
  const [quantity, setQuantity] = useState<number | string>(10);
  const [receiverOrDeliverer, setReceiverOrDeliverer] = useState('');
  const [notes, setNotes] = useState('');

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
      setQuantity(50);
      setReceiverOrDeliverer('');
      setNotes('');
    }
  }, [editingTransaction, isOpen, defaultMonth, branches, items]);

  if (!isOpen) return null;

  const selectedItem = items.find((i) => i.code === itemCode);
  const selectedBranch = branches.find((b) => b.id === branchId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      alert('Vui lòng nhập số lượng hợp lệ lớn hơn 0!');
      return;
    }

    onSave({
      ...(editingTransaction ? { id: editingTransaction.id, code: editingTransaction.code } : {}),
      type: 'IN',
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
      <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-emerald-100 animate-in fade-in zoom-in duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-emerald-50 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
              <ArrowDownToLine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-800">
                {editingTransaction ? 'SỬA PHIẾU NHẬP KHO' : 'LẬP PHIẾU NHẬP KHO'}
              </h3>
              <p className="text-[11px] text-emerald-700 font-semibold">
                Team CIC • Tự động cộng vào tồn kho
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Chi nhánh nhập hàng*
            </label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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
              Vật tư nhập kho*
            </label>
            <select
              value={itemCode}
              onChange={(e) => setItemCode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {items.map((it) => (
                <option key={it.code} value={it.code}>
                  [{it.code}] {it.name} ({it.unit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Số lượng nhập* ({selectedItem?.unit || 'Cái'})
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              placeholder="Nhập số lượng"
              className="w-full bg-emerald-50/50 border border-emerald-300 rounded-xl px-3 py-2 text-sm font-black text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Người giao / Nguồn hàng
            </label>
            <input
              type="text"
              value={receiverOrDeliverer}
              onChange={(e) => setReceiverOrDeliverer(e.target.value)}
              placeholder="Ví dụ: Xưởng may Hà Nhung, Nhà cung cấp..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Ghi chú
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi chú đợt hàng, hợp đồng..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold shadow-sm transition"
            >
              {editingTransaction ? 'CẬP NHẬT' : 'LƯU NHẬP KHO'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
