import React, { useState } from 'react';
import { CalendarPlus, X, ArrowRight, CheckCircle2 } from 'lucide-react';
import { getNextMonthLabel } from '../../utils/storage';

interface AddMonthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMonth: (newMonth: string) => void;
  months: string[];
}

export const AddMonthModal: React.FC<AddMonthModalProps> = ({
  isOpen,
  onClose,
  onAddMonth,
  months
}) => {
  const lastMonth = months[months.length - 1] || 'T08/2026';
  const suggestedNext = getNextMonthLabel(lastMonth);

  const [newMonth, setNewMonth] = useState(suggestedNext);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMonth = newMonth.trim().toUpperCase();
    if (!cleanMonth) {
      alert('Vui lòng nhập tên kỳ tháng!');
      return;
    }

    if (months.includes(cleanMonth)) {
      alert(`Kỳ tháng "${cleanMonth}" đã tồn tại trong hệ thống!`);
      return;
    }

    onAddMonth(cleanMonth);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-indigo-100 animate-in fade-in zoom-in duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-indigo-50 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-800">
                THÊM KỲ THÁNG MỚI
              </h3>
              <p className="text-[11px] text-indigo-700 font-semibold">
                Tự động kết chuyển tồn cuối kỳ sang tồn đầu kỳ
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

        {/* Explain Banner */}
        <div className="p-3 bg-gradient-to-br from-indigo-50/70 to-sky-50/70 border border-indigo-200 rounded-xl mb-4 space-y-2 text-xs">
          <div className="flex items-center justify-between font-bold text-slate-700">
            <span className="px-2.5 py-1 bg-white rounded-lg border border-indigo-100 text-indigo-900 font-mono font-black">
              {lastMonth} (Tháng trước)
            </span>
            <ArrowRight className="w-4 h-4 text-indigo-600" />
            <span className="px-2.5 py-1 bg-indigo-600 rounded-lg text-white font-mono font-black shadow-2xs">
              {newMonth} (Tháng mới)
            </span>
          </div>
          <div className="flex items-start gap-1.5 text-slate-600 text-[11px]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Nguyên tắc kết chuyển ERP:</strong> Toàn bộ <strong>Tồn cuối kỳ</strong> của tháng {lastMonth} sẽ tự động trở thành <strong>Tồn đầu kỳ</strong> của tháng {newMonth} cho tất cả 4 chi nhánh và mọi mã vật tư.
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Định dạng kỳ tháng mới (Ví dụ: T09/2026, T10/2026)*
            </label>
            <input
              type="text"
              value={newMonth}
              onChange={(e) => setNewMonth(e.target.value)}
              required
              placeholder="Ví dụ: T09/2026"
              className="w-full bg-slate-50 border border-indigo-300 rounded-xl px-3 py-2.5 font-mono font-black text-sm text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold shadow-sm transition"
            >
              XÁC NHẬN TẠO THÁNG
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
