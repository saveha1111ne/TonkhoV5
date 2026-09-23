import React, { useState } from 'react';
import { CloudUpload, X, Check, Copy, ExternalLink, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { GoogleSheetsConfig } from '../../types/inventory';
import { GOOGLE_APPS_SCRIPT_SAMPLE_CODE } from '../../utils/googleSheets';

interface GoogleSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GoogleSheetsConfig;
  onSaveConfig: (config: GoogleSheetsConfig) => void;
  onSyncNow: () => Promise<void>;
  isSyncing: boolean;
}

export const GoogleSheetModal: React.FC<GoogleSheetModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onSyncNow,
  isSyncing
}) => {
  const [webhookUrl, setWebhookUrl] = useState(config.webhookUrl || '');
  const [autoSync, setAutoSync] = useState(config.autoSync || false);
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_SAMPLE_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      ...config,
      webhookUrl: webhookUrl.trim(),
      autoSync
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-teal-100 animate-in fade-in zoom-in duration-150 space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-teal-50 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-black">
              <CloudUpload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-800">
                LIÊN KẾT & CẬP NHẬT GOOGLE SHEETS
              </h3>
              <p className="text-[11px] text-teal-700 font-semibold">
                Đồng bộ hai chiều dữ liệu kho Team CIC lên Google Sheet
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

        {/* Sync Status Banner */}
        <div className="p-3 bg-gradient-to-r from-teal-50 to-sky-50 border border-teal-200 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-teal-900 block">Trạng thái đồng bộ:</span>
            <span className="text-[11px] text-slate-600">
              {config.lastSyncedAt
                ? `Lần cuối lúc: ${new Date(config.lastSyncedAt).toLocaleString('vi-VN')}`
                : 'Chưa thực hiện đồng bộ lần nào'}
            </span>
          </div>
          <button
            type="button"
            disabled={isSyncing || !webhookUrl}
            onClick={onSyncNow}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-black text-xs shadow-sm transition active:scale-95 whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Đang đẩy dữ liệu...' : 'ĐỒNG BỘ NGAY'}</span>
          </button>
        </div>

        {/* Form Config */}
        <form onSubmit={handleSave} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              URL Google Apps Script Web App (Webhook URL)*
            </label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Dán Web App URL được sinh ra từ Google Sheets Apps Script vào đây.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 block">Tự động cập nhật liên tục</span>
              <span className="text-[11px] text-slate-500">
                Tự động gửi số liệu lên Google Sheet mỗi khi lập phiếu Nhập / Xuất kho
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoSync}
                onChange={(e) => setAutoSync(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-extrabold shadow-sm transition"
          >
            LƯU CẤU HÌNH GOOGLE SHEET
          </button>
        </form>

        {/* Step-by-step Setup Guide */}
        <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Hướng dẫn kết nối Google Sheet trong 1 phút</span>
            </span>
            <button
              onClick={() => setShowCode(!showCode)}
              className="text-teal-700 font-bold hover:underline"
            >
              {showCode ? 'Ẩn mã Script' : 'Xem mã Script'}
            </button>
          </div>

          <ol className="list-decimal list-inside space-y-1.5 text-slate-600 text-[11px] leading-relaxed">
            <li>Mở file Google Sheet của bạn trên trình duyệt (hoặc tạo file mới).</li>
            <li>Chọn menu <strong>Tiện ích mở rộng (Extensions)</strong> &gt; <strong>Apps Script</strong>.</li>
            <li>Dán toàn bộ mã nguồn bên dưới vào trình soạn thảo và bấm <strong>Lưu (Ctrl+S)</strong>.</li>
            <li>Bấm <strong>Triển khai (Deploy)</strong> &gt; <strong>Triển khai mới (New deployment)</strong>.</li>
            <li>Chọn loại <strong>Ứng dụng web (Web app)</strong>, mục "Ai có quyền truy cập" chọn <strong>Bất kỳ ai (Anyone)</strong>.</li>
            <li>Sao chép <strong>Web app URL</strong> dán vào ô bên trên rồi bấm Lưu!</li>
          </ol>

          {/* Copy Script Button */}
          <div className="pt-1 flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-100 hover:bg-teal-200 text-teal-900 font-bold text-xs transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Đã sao chép mã Script!' : 'Sao chép mã Apps Script'}</span>
            </button>
          </div>

          {showCode && (
            <pre className="bg-slate-900 text-slate-200 p-3 rounded-xl overflow-x-auto text-[10px] font-mono max-h-48 border border-slate-800">
              {GOOGLE_APPS_SCRIPT_SAMPLE_CODE}
            </pre>
          )}
        </div>

      </div>
    </div>
  );
};
