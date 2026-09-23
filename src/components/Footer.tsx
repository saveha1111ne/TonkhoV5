import React from 'react';
import { PhoneCall, ShieldCheck, RefreshCcw } from 'lucide-react';

interface FooterProps {
  onResetData: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onResetData }) => {
  return (
    <footer className="mt-12 bg-white border-t border-teal-100 py-6 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        
        {/* Left: Brand & Hotline */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
          <span className="font-black text-teal-900">
            HỆ THỐNG QUẢN LÝ HÀNG TỒN KHO TEAM CIC
          </span>
          <span className="hidden sm:inline text-slate-300">|</span>
          <span className="font-bold text-[#00897B]">
            Version Made by Ha Nhung logistic
          </span>
          <span className="hidden sm:inline text-slate-300">|</span>
          <a
            href="tel:0901601600"
            className="inline-flex items-center gap-1.5 font-extrabold text-sky-700 hover:text-sky-900 transition"
          >
            <PhoneCall className="w-3.5 h-3.5 text-teal-600" />
            <span>Hotline: 0901601600</span>
          </a>
        </div>

        {/* Right: Data Security & Reset sample */}
        <div className="flex items-center gap-4 text-slate-500">
          <span className="flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Dữ liệu lưu an toàn trên trình duyệt (LocalStorage)</span>
          </span>

          <button
            onClick={onResetData}
            className="inline-flex items-center gap-1 text-slate-400 hover:text-red-600 transition font-medium"
            title="Khôi phục lại dữ liệu mẫu CIC ban đầu"
          >
            <RefreshCcw className="w-3 h-3" />
            <span>Dữ liệu mẫu</span>
          </button>
        </div>

      </div>
    </footer>
  );
};
