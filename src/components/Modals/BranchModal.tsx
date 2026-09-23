import React, { useState } from 'react';
import { Building2, X } from 'lucide-react';
import { Branch } from '../../types/inventory';

interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (branch: Branch) => void;
  existingBranches: Branch[];
}

export const BranchModal: React.FC<BranchModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingBranches
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [region, setRegion] = useState('Miền Bắc');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('0901601600');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanCode = code.trim().toUpperCase();

    if (!cleanName || !cleanCode) {
      alert('Vui lòng nhập tên và mã chi nhánh!');
      return;
    }

    if (existingBranches.some((b) => b.code.toUpperCase() === cleanCode)) {
      alert('Mã chi nhánh này đã tồn tại!');
      return;
    }

    const newBranch: Branch = {
      id: `b-${cleanCode.toLowerCase()}-${Date.now()}`,
      code: cleanCode,
      name: cleanName,
      region,
      address: address.trim() || `Kho ${cleanName}`,
      phone: phone.trim() || '0901601600'
    };

    onSave(newBranch);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-teal-100 animate-in fade-in zoom-in duration-150 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-teal-50 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-black">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-800">
                THÊM CHI NHÁNH MỚI
              </h3>
              <p className="text-[11px] text-teal-700 font-semibold">
                Mở rộng mạng lưới phân phối kho hàng Team CIC
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
                Mã chi nhánh*
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
                placeholder="Ví dụ: HP, BD, VT..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Khu vực*
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="Miền Bắc">Miền Bắc</option>
                <option value="Miền Trung">Miền Trung</option>
                <option value="Miền Nam">Miền Nam</option>
                <option value="Tây Nam Bộ">Tây Nam Bộ</option>
                <option value="Tây Nguyên">Tây Nguyên</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Tên chi nhánh / Kho*
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ví dụ: Hải Phòng, Bình Dương, Nha Trang..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Địa chỉ kho hàng
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Địa chỉ cụ thể của kho"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Hotline liên hệ
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0901601600"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
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
              className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-extrabold shadow-sm transition"
            >
              LƯU CHI NHÁNH
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
