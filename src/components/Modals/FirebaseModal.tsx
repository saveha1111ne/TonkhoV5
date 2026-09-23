import React, { useState } from 'react';
import { 
  Cloud, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Copy, 
  ExternalLink, 
  Database, 
  RefreshCw, 
  UploadCloud,
  ShieldAlert
} from 'lucide-react';
import { firebaseConfig } from '../../firebase';

interface FirebaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
  isSyncing: boolean;
  errorMessage: string | null;
  itemCount: number;
  branchCount: number;
  transactionCount: number;
  onReseedCloud: () => void;
  onRefreshData: () => void;
}

export const FirebaseModal: React.FC<FirebaseModalProps> = ({
  isOpen,
  onClose,
  isConnected,
  isSyncing,
  errorMessage,
  itemCount,
  branchCount,
  transactionCount,
  onReseedCloud,
  onRefreshData
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const firestoreRulesSample = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;

  const copyRules = () => {
    navigator.clipboard.writeText(firestoreRulesSample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-teal-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#00695C] via-[#00897B] to-[#29B6F6] text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center">
              <Cloud className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-wide">
                ĐỒNG BỘ ĐÁM MÂY FIREBASE FIRESTORE
              </h3>
              <p className="text-xs text-teal-100 font-medium">
                Dự án: <span className="font-mono font-bold text-yellow-300">{firebaseConfig.projectId}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs text-slate-600">

          {/* Status Alert */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
            isConnected
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            {isConnected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="font-black text-sm">
                {isConnected ? '✓ Đang kết nối thời gian thực (Real-time Cloud Sync)' : 'Chế độ ngoại tuyến hoặc đang kết nối...'}
              </h4>
              <p className="mt-1 leading-relaxed">
                {isConnected 
                  ? 'Mọi thay đổi khi nhập kho, xuất kho, thêm vật tư hoặc tạo tháng mới sẽ được tự động lưu trên đám mây Firestore và cập nhật tức thì cho tất cả nhân viên mở ứng dụng.'
                  : errorMessage 
                    ? `Thông báo: ${errorMessage}. Hãy kiểm tra cấu hình Firestore Security Rules trên Firebase Console.`
                    : 'Hệ thống đang kết nối đến máy chủ Firestore của bạn. Trong khi đó, dữ liệu vẫn được lưu an toàn trong trình duyệt.'
                }
              </p>
            </div>
          </div>

          {/* Live Data Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Mã vật tư</span>
              <p className="text-xl font-extrabold text-teal-700 mt-0.5">{itemCount}</p>
              <span className="text-[10px] text-slate-400">cic_items</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Chi nhánh</span>
              <p className="text-xl font-extrabold text-sky-700 mt-0.5">{branchCount}</p>
              <span className="text-[10px] text-slate-400">cic_branches</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Giao dịch</span>
              <p className="text-xl font-extrabold text-indigo-700 mt-0.5">{transactionCount}</p>
              <span className="text-[10px] text-slate-400">cic_transactions</span>
            </div>
          </div>

          {/* Configuration details */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Project ID:</span>
              <span className="font-bold text-slate-800">{firebaseConfig.projectId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Auth Domain:</span>
              <span className="text-slate-700">{firebaseConfig.authDomain}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Storage Bucket:</span>
              <span className="text-slate-700">{firebaseConfig.storageBucket}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">App ID:</span>
              <span className="text-slate-700">{firebaseConfig.appId}</span>
            </div>
          </div>

          {/* Security Rules Helper if permission error occurs */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-extrabold text-amber-900">
                  Lưu ý quan trọng về Security Rules trên Firebase Console:
                </h5>
                <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">
                  Để toàn bộ thành viên trong Team CIC có thể đọc & ghi dữ liệu mà không bị chặn quyền, hãy đảm bảo bạn đã mở quyền truy cập trong tab <strong>Firestore Database → Rules</strong> trên Firebase Console:
                </p>
              </div>
            </div>

            <div className="relative">
              <pre className="p-3 bg-slate-900 text-teal-300 rounded-xl text-[10px] font-mono overflow-x-auto">
                {firestoreRulesSample}
              </pre>
              <button
                onClick={copyRules}
                className="absolute top-2 right-2 inline-flex items-center gap-1 px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-[10px] font-bold transition"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? 'Đã chép!' : 'Chép Rules'}</span>
              </button>
            </div>

            <a
              href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/rules`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sky-700 hover:text-sky-900 font-bold text-[11px] transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Mở trang cấu hình Rules trên Firebase Console ({firebaseConfig.projectId})</span>
            </a>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={onReseedCloud}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{isSyncing ? 'Đang đồng bộ...' : 'Đẩy dữ liệu mẫu lên Cloud'}</span>
              </button>

              <button
                onClick={onRefreshData}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Nạp lại</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition"
            >
              Đóng
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
