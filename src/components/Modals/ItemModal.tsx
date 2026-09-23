import React, { useState, useEffect } from 'react';
import { Item } from '../../types/inventory';
import { Package, X } from 'lucide-react';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<Item>) => void;
  editingItem: Item | null;
  existingCodes: string[];
}

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  existingCodes
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('Cái');
  const [category, setCategory] = useState('Túi đeo chéo');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [minStockAlert, setMinStockAlert] = useState<number | string>(20);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingItem) {
      setCode(editingItem.code);
      setName(editingItem.name);
      setUnit(editingItem.unit);
      setCategory(editingItem.category);
      setStatus(editingItem.status);
      setMinStockAlert(editingItem.minStockAlert ?? 20);
      setNotes(editingItem.notes || '');
    } else {
      setCode('');
      setName('');
      setUnit('Cái');
      setCategory('Túi đeo chéo');
      setStatus('active');
      setMinStockAlert(20);
      setNotes('');
    }
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      alert('Vui lòng nhập mã vật tư (SKU)!');
      return;
    }

    if (!editingItem && existingCodes.includes(cleanCode)) {
      alert(`Mã vật tư "${cleanCode}" đã tồn tại trong danh mục!`);
      return;
    }

    onSave({
      ...(editingItem ? { id: editingItem.id } : {}),
      code: cleanCode,
      name: name.trim(),
      unit: unit.trim(),
      category: category.trim(),
      status,
      minStockAlert: Number(minStockAlert) || 20,
      notes: notes.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-teal-100 animate-in fade-in zoom-in duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-teal-50 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-black">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-800">
                {editingItem ? 'SỬA THÔNG TIN VẬT TƯ' : 'THÊM VẬT TƯ MỚI'}
              </h3>
              <p className="text-[11px] text-teal-700 font-semibold">
                Quản lý mã hàng hóa SKU Team CIC
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
                Mã vật tư (SKU)*
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
                disabled={!!editingItem}
                placeholder="Ví dụ: TDC-CIC07"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Đơn vị tính*
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                required
                placeholder="Cái, Chiếc, Bộ, Hộp..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Tên vật tư hàng hóa*
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ví dụ: Túi đeo chéo Team CIC Limited Edition..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Nhóm vật tư*
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                placeholder="Túi đeo chéo, Dù, Bình nhiệt..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Tồn kho tối thiểu (Cảnh báo)
              </label>
              <input
                type="number"
                min="0"
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Trạng thái hoạt động
            </label>
            <div className="flex gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                <input
                  type="radio"
                  name="status"
                  checked={status === 'active'}
                  onChange={() => setStatus('active')}
                  className="text-teal-600 focus:ring-teal-500"
                />
                <span>Đang sử dụng</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                <input
                  type="radio"
                  name="status"
                  checked={status === 'inactive'}
                  onChange={() => setStatus('inactive')}
                  className="text-slate-400 focus:ring-slate-500"
                />
                <span>Tạm ngừng</span>
              </label>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Ghi chú / Quy cách sản phẩm
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Chất liệu, nguồn gốc, quy cách đóng gói..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2.5 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-extrabold shadow-sm transition"
            >
              {editingItem ? 'CẬP NHẬT' : 'THÊM VẬT TƯ'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
