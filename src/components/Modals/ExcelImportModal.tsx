import React, { useState, useRef } from 'react';
import { Upload, X, FileSpreadsheet, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { Branch, Item, Transaction } from '../../types/inventory';
import { downloadSampleExcelTemplate, parseUploadedExcel } from '../../utils/excel';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (data: { newItems: Item[]; newTransactions: Transaction[]; message: string }) => void;
  existingItems: Item[];
  existingBranches: Branch[];
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  existingItems,
  existingBranches
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<{
    newItems: Item[];
    newTransactions: Transaction[];
    message: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setError(null);
    setLoading(true);

    try {
      const result = await parseUploadedExcel(selected, existingItems, existingBranches);
      setParsedData(result);
    } catch (err: any) {
      console.error(err);
      setError('Lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng hoặc dùng mẫu chuẩn của hệ thống.');
      setParsedData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!parsedData) return;
    onImportSuccess(parsedData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-purple-100 animate-in fade-in zoom-in duration-150 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-50 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-800">
                NẠP DỮ LIỆU TỪ FILE EXCEL / CSV
              </h3>
              <p className="text-[11px] text-purple-700 font-semibold">
                Tự động nhập danh mục vật tư & phiếu giao dịch
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

        {/* Download Template Banner */}
        <div className="bg-purple-50/60 border border-purple-200 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
          <div>
            <p className="font-bold text-purple-900">
              Chưa có file đúng chuẩn định dạng?
            </p>
            <p className="text-[11px] text-purple-700">
              Tải mẫu Excel chuẩn CIC gồm Sheet Danh mục vật tư & Giao dịch
            </p>
          </div>
          <button
            onClick={downloadSampleExcelTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-2xs whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải file mẫu</span>
          </button>
        </div>

        {/* Dropzone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-2xl p-6 text-center cursor-pointer transition bg-slate-50/50 hover:bg-purple-50/20 space-y-2"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <FileSpreadsheet className="w-10 h-10 text-purple-500 mx-auto" />
          <div>
            <p className="text-xs font-bold text-slate-700">
              {file ? file.name : 'Bấm vào đây để chọn file Excel (.xlsx, .xls, .csv)'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Hỗ trợ kéo thả file trực tiếp vào trình duyệt
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-2 text-xs font-bold text-purple-700 animate-pulse">
            Đang phân tích dữ liệu từ file Excel...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Result Preview */}
        {parsedData && (
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{parsedData.message}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-700 text-[11px]">
              <div className="p-2 bg-white rounded-lg border border-emerald-100">
                <span className="text-slate-500">Vật tư SKU mới:</span>{' '}
                <strong className="text-emerald-800 text-sm">+{parsedData.newItems.length}</strong>
              </div>
              <div className="p-2 bg-white rounded-lg border border-emerald-100">
                <span className="text-slate-500">Phiếu giao dịch:</span>{' '}
                <strong className="text-emerald-800 text-sm">+{parsedData.newTransactions.length}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-700 transition"
          >
            Đóng
          </button>
          <button
            type="button"
            disabled={!parsedData || (parsedData.newItems.length === 0 && parsedData.newTransactions.length === 0)}
            onClick={handleApply}
            className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-sm transition"
          >
            NẠP VÀO HỆ THỐNG
          </button>
        </div>

      </div>
    </div>
  );
};
