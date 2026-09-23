import React from 'react';
import { 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  PlusCircle, 
  CalendarPlus, 
  FileSpreadsheet, 
  FileText, 
  Upload, 
  CloudUpload, 
  Download,
  PhoneCall,
  PackageCheck
} from 'lucide-react';

interface HeaderProps {
  onOpenInbound: () => void;
  onOpenOutbound: () => void;
  onOpenItemModal: () => void;
  onOpenAddMonth: () => void;
  onExportExcel: () => void;
  onExportCSV: () => void;
  onOpenExcelImport: () => void;
  onOpenGoogleSheetSync: () => void;
  onDownloadSingleHtml: () => void;
  firebaseConnected?: boolean;
  isFirebaseSyncing?: boolean;
  onOpenFirebaseModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenInbound,
  onOpenOutbound,
  onOpenItemModal,
  onOpenAddMonth,
  onExportExcel,
  onExportCSV,
  onOpenExcelImport,
  onOpenGoogleSheetSync,
  onDownloadSingleHtml,
  firebaseConnected = false,
  isFirebaseSyncing = false,
  onOpenFirebaseModal
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white shadow-md">
      {/* Top Banner Gradient: Deep Teal -> Teal -> Sky Blue */}
      <div className="bg-gradient-to-r from-[#00695C] via-[#00897B] to-[#29B6F6] text-white px-4 sm:px-6 py-3.5 border-b border-teal-700/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Logo & App Title */}
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-inner flex-shrink-0">
              <PackageCheck className="w-7 h-7 text-white drop-shadow" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-extrabold text-lg sm:text-xl md:text-2xl tracking-wide uppercase text-white drop-shadow-sm">
                  HỆ THỐNG QUẢN LÝ HÀNG TỒN KHO TEAM CIC
                </h1>
                <span className="bg-white/20 text-[11px] font-bold px-2 py-0.5 rounded-full border border-white/30 backdrop-blur-sm">
                  v2.5 Pro
                </span>
              </div>
              <p className="text-xs sm:text-sm text-sky-100 font-medium tracking-wide">
                Inventory Management Dashboard • Chuẩn ERP Kho 4 Chi Nhánh
              </p>
            </div>
          </div>

          {/* Right: Firebase Cloud Badge & Hotline */}
          <div className="flex flex-col sm:items-end items-center text-xs gap-1.5">
            <div className="flex items-center gap-2">
              {/* Firebase Cloud Live Badge */}
              <button
                onClick={onOpenFirebaseModal}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 transition border border-white/35 rounded-full font-bold text-white text-[11px] backdrop-blur-md shadow-xs active:scale-95"
                title="Bấm để xem chi tiết kết nối đám mây Firebase Firestore"
              >
                <span className={`w-2 h-2 rounded-full ${
                  isFirebaseSyncing 
                    ? 'bg-yellow-300 animate-ping' 
                    : firebaseConnected 
                    ? 'bg-emerald-400 animate-pulse' 
                    : 'bg-amber-400'
                }`} />
                <span>
                  {isFirebaseSyncing ? 'Đang đồng bộ...' : firebaseConnected ? '☁️ Cloud Firestore: Real-time' : '☁️ Cloud: Cục bộ/Kết nối'}
                </span>
              </button>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/15 hover:bg-white/25 transition border border-white/30 rounded-full font-semibold text-white backdrop-blur-sm">
                <span>Made by</span>
                <span className="font-bold text-yellow-300">Ha Nhung logistic</span>
              </div>
            </div>

            <a 
              href="tel:0901601600" 
              className="inline-flex items-center gap-1.5 font-black text-white hover:text-yellow-300 transition text-sm drop-shadow"
            >
              <PhoneCall className="w-4 h-4 text-emerald-300 animate-pulse" />
              <span>Hotline: 0901601600</span>
            </a>
          </div>
        </div>
      </div>

      {/* Action Bar (Buttons) */}
      <div className="bg-[#F0FDF9] border-b border-teal-100/80 px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
          
          {/* Primary Operations */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenInbound}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-sm hover:shadow transition"
              title="Lập phiếu nhập kho vật tư"
            >
              <ArrowDownToLine className="w-4 h-4 text-emerald-100" />
              <span>NHẬP KHO</span>
            </button>

            <button
              onClick={onOpenOutbound}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-95 text-white text-xs font-bold shadow-sm hover:shadow transition"
              title="Lập phiếu xuất kho vật tư"
            >
              <ArrowUpFromLine className="w-4 h-4 text-sky-100" />
              <span>XUẤT KHO</span>
            </button>

            <button
              onClick={onOpenItemModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-bold shadow-sm hover:shadow transition"
              title="Thêm mã vật tư (SKU) mới"
            >
              <PlusCircle className="w-4 h-4 text-teal-100" />
              <span>THÊM VẬT TƯ</span>
            </button>

            <button
              onClick={onOpenAddMonth}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold shadow-sm hover:shadow transition"
              title="Thêm tháng mới và tự động kết chuyển tồn cuối -> tồn đầu"
            >
              <CalendarPlus className="w-4 h-4 text-indigo-100" />
              <span>THÊM THÁNG MỚI</span>
            </button>
          </div>

          {/* Integrations & Exports */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition shadow-2xs"
              title="Xuất file Excel đầy đủ các Sheet: Tổng quan, Tồn kho, Nhập, Xuất, Chi nhánh"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>📥 XUẤT EXCEL</span>
            </button>

            <button
              onClick={onExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold transition shadow-2xs"
              title="Xuất file định dạng CSV"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>📄 XUẤT CSV</span>
            </button>

            <button
              onClick={onOpenExcelImport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-300 text-xs font-bold transition shadow-2xs"
              title="Nhập dữ liệu vật tư hoặc giao dịch từ file Excel"
            >
              <Upload className="w-3.5 h-3.5 text-purple-600" />
              <span>📤 UP EXCEL</span>
            </button>

            <button
              onClick={onOpenGoogleSheetSync}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 text-xs font-bold transition shadow-2xs"
              title="Đồng bộ tự động hoặc thủ công lên Google Sheet"
            >
              <CloudUpload className="w-3.5 h-3.5 text-teal-600" />
              <span>☁️ GOOGLE SHEET</span>
            </button>

            <button
              onClick={onDownloadSingleHtml}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-extrabold shadow-sm transition"
              title="Tải về file inventory-cic.html duy nhất chạy trực tiếp offline trên trình duyệt hoặc up Netlify"
            >
              <Download className="w-3.5 h-3.5 text-amber-100" />
              <span>💾 TẢI FILE HTML ĐỘC LẬP</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
