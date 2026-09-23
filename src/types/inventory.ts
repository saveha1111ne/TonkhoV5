export interface Item {
  id: string;
  code: string; // Mã vật tư (SKU)
  name: string; // Tên vật tư
  unit: string; // Đơn vị tính (Cái, Chiếc, Bộ, v.v.)
  category: string; // Nhóm vật tư (Túi đeo chéo, Dù, Bình giữ nhiệt, v.v.)
  status: 'active' | 'inactive'; // Trạng thái
  notes?: string;
  minStockAlert?: number;
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  region: string; // Miền Bắc, Miền Trung, Miền Nam, Tây Nam Bộ
  address?: string;
  phone?: string;
}

export type TransactionType = 'IN' | 'OUT';

export interface Transaction {
  id: string;
  code: string; // Mã phiếu (NK-..., XK-...)
  type: TransactionType;
  month: string; // format 'T06/2026', 'T07/2026', 'T08/2026'
  date: string; // YYYY-MM-DD
  branchId: string;
  branchName: string;
  itemCode: string;
  itemName: string;
  unit: string;
  quantity: number;
  receiverOrDeliverer?: string; // Người giao / người nhận
  notes?: string;
  createdAt: string;
}

export interface StockRecord {
  month: string;
  itemCode: string;
  branchId: string;
  initialStock: number; // Tồn đầu kỳ
  inQty: number; // Nhập trong kỳ
  outQty: number; // Xuất trong kỳ
  finalStock: number; // Tồn cuối kỳ = Tồn đầu + Nhập - Xuất
}

export type BaselineStock = Record<string, Record<string, number>>;

export interface GoogleSheetsConfig {
  webhookUrl: string;
  sheetName: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}

export type ActiveTab = 
  | 'overview' 
  | 'inventory' 
  | 'inbound' 
  | 'outbound' 
  | 'reports' 
  | 'analytics' 
  | 'catalog'
  | 'sync';
