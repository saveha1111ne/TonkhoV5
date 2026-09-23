import { Branch, Item, Transaction, StockRecord, GoogleSheetsConfig } from '../types/inventory';

export const DEFAULT_BRANCHES: Branch[] = [
  { id: 'b-hn', code: 'HN', name: 'Hà Nội', region: 'Miền Bắc', address: 'Kho Trung Tâm - Cầu Giấy, Hà Nội', phone: '0901601600' },
  { id: 'b-dn', code: 'DN', name: 'Đà Nẵng', region: 'Miền Trung', address: 'Kho Miền Trung - Hải Châu, Đà Nẵng', phone: '0901601600' },
  { id: 'b-hcm', code: 'HCM', name: 'HCM', region: 'Miền Nam', address: 'Kho Tổng Nam Bộ - Tân Bình, TP.HCM', phone: '0901601600' },
  { id: 'b-ct', code: 'CT', name: 'Cần Thơ', region: 'Tây Nam Bộ', address: 'Kho Tây Nam - Ninh Kiều, Cần Thơ', phone: '0901601600' }
];

export const DEFAULT_ITEMS: Item[] = [
  {
    id: 'it-1',
    code: 'TDC-CIC01',
    name: 'Túi đeo chéo Team CIC Premium',
    unit: 'Cái',
    category: 'Túi đeo chéo',
    status: 'active',
    minStockAlert: 50,
    notes: 'Vải Canvas chống thấm nước cao cấp'
  },
  {
    id: 'it-2',
    code: 'DU-CIC02',
    name: 'Dù gập tự động Team CIC chống UV',
    unit: 'Chiếc',
    category: 'Dù',
    status: 'active',
    minStockAlert: 40,
    notes: 'Khung thép 10 nan siêu bền, tán 2 lớp'
  },
  {
    id: 'it-3',
    code: 'BGN-CIC03',
    name: 'Bình giữ nhiệt Lock&Lock CIC Inox 500ml',
    unit: 'Chiếc',
    category: 'Bình giữ nhiệt',
    status: 'active',
    minStockAlert: 30,
    notes: 'Giữ nhiệt 24h, khắc logo laser sắc nét'
  },
  {
    id: 'it-4',
    code: 'AT-CIC04',
    name: 'Áo thun Polo đồng phục Team CIC',
    unit: 'Áo',
    category: 'Đồng phục',
    status: 'active',
    minStockAlert: 60,
    notes: 'Chất cotton cá sấu 4 chiều co giãn'
  },
  {
    id: 'it-5',
    code: 'ST-CIC05',
    name: 'Sổ tay bìa da còng logo CIC',
    unit: 'Cuốn',
    category: 'Quà tặng',
    status: 'active',
    minStockAlert: 25,
    notes: 'Giấy Kraft ngà chống mỏi mắt'
  },
  {
    id: 'it-6',
    code: 'BALO-CIC06',
    name: 'Balo laptop cao cấp CIC Pro',
    unit: 'Cái',
    category: 'Túi đeo chéo',
    status: 'active',
    minStockAlert: 20,
    notes: 'Chống sốc laptop 15.6 inch'
  }
];

export const DEFAULT_MONTHS: string[] = [
  'T06/2026',
  'T07/2026',
  'T08/2026'
];

// Baseline initial stock for the very first month (T06/2026) per item and branch
export const BASELINE_STOCK_T06: Record<string, Record<string, number>> = {
  'TDC-CIC01': { 'b-hn': 120, 'b-dn': 80, 'b-hcm': 150, 'b-ct': 60 },
  'DU-CIC02': { 'b-hn': 90, 'b-dn': 60, 'b-hcm': 110, 'b-ct': 45 },
  'BGN-CIC03': { 'b-hn': 100, 'b-dn': 50, 'b-hcm': 130, 'b-ct': 40 },
  'AT-CIC04': { 'b-hn': 200, 'b-dn': 120, 'b-hcm': 250, 'b-ct': 90 },
  'ST-CIC05': { 'b-hn': 80, 'b-dn': 40, 'b-hcm': 95, 'b-ct': 30 },
  'BALO-CIC06': { 'b-hn': 65, 'b-dn': 35, 'b-hcm': 85, 'b-ct': 25 }
};

export const DEFAULT_TRANSACTIONS: Transaction[] = [
  // T06/2026 transactions
  {
    id: 'tx-101',
    code: 'NK-260601',
    type: 'IN',
    month: 'T06/2026',
    date: '2026-06-05',
    branchId: 'b-hn',
    branchName: 'Hà Nội',
    itemCode: 'TDC-CIC01',
    itemName: 'Túi đeo chéo Team CIC Premium',
    unit: 'Cái',
    quantity: 50,
    receiverOrDeliverer: 'Xưởng may Hà Nội',
    notes: 'Nhập bổ sung đợt 1',
    createdAt: '2026-06-05T08:30:00.000Z'
  },
  {
    id: 'tx-102',
    code: 'XK-260601',
    type: 'OUT',
    month: 'T06/2026',
    date: '2026-06-12',
    branchId: 'b-hn',
    branchName: 'Hà Nội',
    itemCode: 'TDC-CIC01',
    itemName: 'Túi đeo chéo Team CIC Premium',
    unit: 'Cái',
    quantity: 30,
    receiverOrDeliverer: 'Sự kiện CIC miền Bắc',
    notes: 'Phát quà hội thảo',
    createdAt: '2026-06-12T14:00:00.000Z'
  },
  {
    id: 'tx-103',
    code: 'NK-260602',
    type: 'IN',
    month: 'T06/2026',
    date: '2026-06-08',
    branchId: 'b-hcm',
    branchName: 'HCM',
    itemCode: 'BGN-CIC03',
    itemName: 'Bình giữ nhiệt Lock&Lock CIC Inox 500ml',
    unit: 'Chiếc',
    quantity: 80,
    receiverOrDeliverer: 'Lock&Lock VN',
    notes: 'Nhập theo hợp đồng quý 2',
    createdAt: '2026-06-08T09:15:00.000Z'
  },
  {
    id: 'tx-104',
    code: 'XK-260602',
    type: 'OUT',
    month: 'T06/2026',
    date: '2026-06-20',
    branchId: 'b-hcm',
    branchName: 'HCM',
    itemCode: 'BGN-CIC03',
    itemName: 'Bình giữ nhiệt Lock&Lock CIC Inox 500ml',
    unit: 'Chiếc',
    quantity: 45,
    receiverOrDeliverer: 'Team Sales miền Nam',
    notes: 'Tặng khách hàng VIP',
    createdAt: '2026-06-20T16:30:00.000Z'
  },
  {
    id: 'tx-105',
    code: 'NK-260603',
    type: 'IN',
    month: 'T06/2026',
    date: '2026-06-10',
    branchId: 'b-dn',
    branchName: 'Đà Nẵng',
    itemCode: 'DU-CIC02',
    itemName: 'Dù gập tự động Team CIC chống UV',
    unit: 'Chiếc',
    quantity: 40,
    receiverOrDeliverer: 'Xưởng dù Tân Bình',
    notes: 'Nhập mùa mưa miền Trung',
    createdAt: '2026-06-10T10:00:00.000Z'
  },
  {
    id: 'tx-106',
    code: 'XK-260603',
    type: 'OUT',
    month: 'T06/2026',
    date: '2026-06-25',
    branchId: 'b-dn',
    branchName: 'Đà Nẵng',
    itemCode: 'DU-CIC02',
    itemName: 'Dù gập tự động Team CIC chống UV',
    unit: 'Chiếc',
    quantity: 25,
    receiverOrDeliverer: 'Văn phòng CIC Đà Nẵng',
    notes: 'Cấp phát nhân sự mới',
    createdAt: '2026-06-25T11:00:00.000Z'
  },
  {
    id: 'tx-107',
    code: 'NK-260604',
    type: 'IN',
    month: 'T06/2026',
    date: '2026-06-15',
    branchId: 'b-ct',
    branchName: 'Cần Thơ',
    itemCode: 'AT-CIC04',
    itemName: 'Áo thun Polo đồng phục Team CIC',
    unit: 'Áo',
    quantity: 50,
    receiverOrDeliverer: 'Xưởng May Pro',
    notes: 'Đồng phục chi nhánh mới',
    createdAt: '2026-06-15T13:45:00.000Z'
  },
  {
    id: 'tx-108',
    code: 'XK-260604',
    type: 'OUT',
    month: 'T06/2026',
    date: '2026-06-28',
    branchId: 'b-ct',
    branchName: 'Cần Thơ',
    itemCode: 'AT-CIC04',
    itemName: 'Áo thun Polo đồng phục Team CIC',
    unit: 'Áo',
    quantity: 35,
    receiverOrDeliverer: 'Team Marketing Cần Thơ',
    notes: 'Phát cho sự kiện Roadshow Mekong',
    createdAt: '2026-06-28T15:20:00.000Z'
  },

  // T07/2026 transactions
  {
    id: 'tx-201',
    code: 'NK-260701',
    type: 'IN',
    month: 'T07/2026',
    date: '2026-07-02',
    branchId: 'b-hn',
    branchName: 'Hà Nội',
    itemCode: 'TDC-CIC01',
    itemName: 'Túi đeo chéo Team CIC Premium',
    unit: 'Cái',
    quantity: 100,
    receiverOrDeliverer: 'Tổng kho logistic CIC',
    notes: 'Nhập kho đầu tháng 7',
    createdAt: '2026-07-02T09:00:00.000Z'
  },
  {
    id: 'tx-202',
    code: 'XK-260701',
    type: 'OUT',
    month: 'T07/2026',
    date: '2026-07-15',
    branchId: 'b-hn',
    branchName: 'Hà Nội',
    itemCode: 'TDC-CIC01',
    itemName: 'Túi đeo chéo Team CIC Premium',
    unit: 'Cái',
    quantity: 60,
    receiverOrDeliverer: 'Khối Kinh Doanh HN',
    notes: 'Chương trình tri ân quý 3',
    createdAt: '2026-07-15T14:30:00.000Z'
  },
  {
    id: 'tx-203',
    code: 'NK-260702',
    type: 'IN',
    month: 'T07/2026',
    date: '2026-07-06',
    branchId: 'b-hcm',
    branchName: 'HCM',
    itemCode: 'DU-CIC02',
    itemName: 'Dù gập tự động Team CIC chống UV',
    unit: 'Chiếc',
    quantity: 70,
    receiverOrDeliverer: 'Nhà máy Sản xuất Dù Sài Gòn',
    notes: 'Nhập lô hè tháng 7',
    createdAt: '2026-07-06T10:00:00.000Z'
  },
  {
    id: 'tx-204',
    code: 'XK-260702',
    type: 'OUT',
    month: 'T07/2026',
    date: '2026-07-22',
    branchId: 'b-hcm',
    branchName: 'HCM',
    itemCode: 'DU-CIC02',
    itemName: 'Dù gập tự động Team CIC chống UV',
    unit: 'Chiếc',
    quantity: 50,
    receiverOrDeliverer: 'Đại lý phân phối miền Nam',
    notes: 'Xuất hợp đồng đại lý',
    createdAt: '2026-07-22T16:00:00.000Z'
  },
  {
    id: 'tx-205',
    code: 'NK-260703',
    type: 'IN',
    month: 'T07/2026',
    date: '2026-07-08',
    branchId: 'b-dn',
    branchName: 'Đà Nẵng',
    itemCode: 'BGN-CIC03',
    itemName: 'Bình giữ nhiệt Lock&Lock CIC Inox 500ml',
    unit: 'Chiếc',
    quantity: 40,
    receiverOrDeliverer: 'Kho vận Hà Nhung',
    notes: 'Chuyển kho nội bộ',
    createdAt: '2026-07-08T11:15:00.000Z'
  },
  {
    id: 'tx-206',
    code: 'XK-260703',
    type: 'OUT',
    month: 'T07/2026',
    date: '2026-07-26',
    branchId: 'b-dn',
    branchName: 'Đà Nẵng',
    itemCode: 'BGN-CIC03',
    itemName: 'Bình giữ nhiệt Lock&Lock CIC Inox 500ml',
    unit: 'Chiếc',
    quantity: 30,
    receiverOrDeliverer: 'Bộ phận Đối ngoại',
    notes: 'Quà biếu đối tác',
    createdAt: '2026-07-26T15:00:00.000Z'
  },
  {
    id: 'tx-207',
    code: 'NK-260704',
    type: 'IN',
    month: 'T07/2026',
    date: '2026-07-12',
    branchId: 'b-ct',
    branchName: 'Cần Thơ',
    itemCode: 'ST-CIC05',
    itemName: 'Sổ tay bìa da còng logo CIC',
    unit: 'Cuốn',
    quantity: 60,
    receiverOrDeliverer: 'Xưởng in sổ da cao cấp',
    notes: 'Nhập bổ sung',
    createdAt: '2026-07-12T09:30:00.000Z'
  },
  {
    id: 'tx-208',
    code: 'XK-260704',
    type: 'OUT',
    month: 'T07/2026',
    date: '2026-07-28',
    branchId: 'b-ct',
    branchName: 'Cần Thơ',
    itemCode: 'ST-CIC05',
    itemName: 'Sổ tay bìa da còng logo CIC',
    unit: 'Cuốn',
    quantity: 25,
    receiverOrDeliverer: 'Văn phòng đại diện Tây Nam Bộ',
    notes: 'Phát nội bộ',
    createdAt: '2026-07-28T14:45:00.000Z'
  },

  // T08/2026 transactions
  {
    id: 'tx-301',
    code: 'NK-260801',
    type: 'IN',
    month: 'T08/2026',
    date: '2026-08-03',
    branchId: 'b-hcm',
    branchName: 'HCM',
    itemCode: 'TDC-CIC01',
    itemName: 'Túi đeo chéo Team CIC Premium',
    unit: 'Cái',
    quantity: 120,
    receiverOrDeliverer: 'Xưởng may Hà Nhung',
    notes: 'Nhập chuẩn bị mùa sự kiện thu 2026',
    createdAt: '2026-08-03T08:45:00.000Z'
  },
  {
    id: 'tx-302',
    code: 'XK-260801',
    type: 'OUT',
    month: 'T08/2026',
    date: '2026-08-14',
    branchId: 'b-hcm',
    branchName: 'HCM',
    itemCode: 'TDC-CIC01',
    itemName: 'Túi đeo chéo Team CIC Premium',
    unit: 'Cái',
    quantity: 75,
    receiverOrDeliverer: 'Chi nhánh Sài Gòn',
    notes: 'Phân phối các điểm bán',
    createdAt: '2026-08-14T15:20:00.000Z'
  },
  {
    id: 'tx-303',
    code: 'NK-260802',
    type: 'IN',
    month: 'T08/2026',
    date: '2026-08-05',
    branchId: 'b-hn',
    branchName: 'Hà Nội',
    itemCode: 'AT-CIC04',
    itemName: 'Áo thun Polo đồng phục Team CIC',
    unit: 'Áo',
    quantity: 150,
    receiverOrDeliverer: 'Xưởng may dệt CIC',
    notes: 'Đồng phục mùa thu',
    createdAt: '2026-08-05T10:30:00.000Z'
  },
  {
    id: 'tx-304',
    code: 'XK-260802',
    type: 'OUT',
    month: 'T08/2026',
    date: '2026-08-18',
    branchId: 'b-hn',
    branchName: 'Hà Nội',
    itemCode: 'AT-CIC04',
    itemName: 'Áo thun Polo đồng phục Team CIC',
    unit: 'Áo',
    quantity: 110,
    receiverOrDeliverer: 'Phòng Hành chính Tổng hợp',
    notes: 'Cấp phát đợt sinh nhật Team',
    createdAt: '2026-08-18T16:15:00.000Z'
  },
  {
    id: 'tx-305',
    code: 'NK-260803',
    type: 'IN',
    month: 'T08/2026',
    date: '2026-08-10',
    branchId: 'b-dn',
    branchName: 'Đà Nẵng',
    itemCode: 'BALO-CIC06',
    itemName: 'Balo laptop cao cấp CIC Pro',
    unit: 'Cái',
    quantity: 50,
    receiverOrDeliverer: 'Công ty sản xuất túi cặp',
    notes: 'Nhập mẫu mới',
    createdAt: '2026-08-10T11:00:00.000Z'
  },
  {
    id: 'tx-306',
    code: 'XK-260803',
    type: 'OUT',
    month: 'T08/2026',
    date: '2026-08-25',
    branchId: 'b-dn',
    branchName: 'Đà Nẵng',
    itemCode: 'BALO-CIC06',
    itemName: 'Balo laptop cao cấp CIC Pro',
    unit: 'Cái',
    quantity: 30,
    receiverOrDeliverer: 'Đoàn công tác miền Trung',
    notes: 'Trang bị cho cán bộ đi thị trường',
    createdAt: '2026-08-25T14:10:00.000Z'
  }
];

const STORAGE_KEYS = {
  BRANCHES: 'cic_inventory_branches_v1',
  ITEMS: 'cic_inventory_items_v1',
  MONTHS: 'cic_inventory_months_v1',
  TRANSACTIONS: 'cic_inventory_transactions_v1',
  BASELINE_STOCK: 'cic_inventory_baseline_v1',
  SHEETS_CONFIG: 'cic_inventory_sheets_config_v1'
};

export const getInitialData = () => {
  try {
    const rawBranches = localStorage.getItem(STORAGE_KEYS.BRANCHES);
    const rawItems = localStorage.getItem(STORAGE_KEYS.ITEMS);
    const rawMonths = localStorage.getItem(STORAGE_KEYS.MONTHS);
    const rawTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    const rawBaseline = localStorage.getItem(STORAGE_KEYS.BASELINE_STOCK);
    const rawConfig = localStorage.getItem(STORAGE_KEYS.SHEETS_CONFIG);

    const branches: Branch[] = rawBranches ? JSON.parse(rawBranches) : DEFAULT_BRANCHES;
    const items: Item[] = rawItems ? JSON.parse(rawItems) : DEFAULT_ITEMS;
    const months: string[] = rawMonths ? JSON.parse(rawMonths) : DEFAULT_MONTHS;
    const transactions: Transaction[] = rawTransactions ? JSON.parse(rawTransactions) : DEFAULT_TRANSACTIONS;
    const baselineStock: any = rawBaseline ? JSON.parse(rawBaseline) : BASELINE_STOCK_T06;
    const googleSheetsConfig: GoogleSheetsConfig = rawConfig ? JSON.parse(rawConfig) : {
      webhookUrl: '',
      sheetName: 'Kho_CIC',
      autoSync: false
    };

    return { 
      branches, 
      items, 
      months, 
      selectedMonth: months[months.length - 1] || 'T08/2026',
      transactions, 
      baselineStock, 
      googleSheetsConfig 
    };
  } catch (error) {
    console.error('Error reading localStorage, using defaults:', error);
    return {
      branches: DEFAULT_BRANCHES,
      items: DEFAULT_ITEMS,
      months: DEFAULT_MONTHS,
      selectedMonth: 'T08/2026',
      transactions: DEFAULT_TRANSACTIONS,
      baselineStock: BASELINE_STOCK_T06,
      googleSheetsConfig: {
        webhookUrl: '',
        sheetName: 'Kho_CIC',
        autoSync: false
      }
    };
  }
};

export const loadInitialState = getInitialData;

export const saveData = (data: {
  branches?: Branch[];
  items?: Item[];
  months?: string[];
  transactions?: Transaction[];
  baselineStock?: any;
  baseline?: any;
  sheetsConfig?: GoogleSheetsConfig;
  googleSheetsConfig?: GoogleSheetsConfig;
  selectedMonth?: string;
}) => {
  try {
    if (data.branches) localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(data.branches));
    if (data.items) localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(data.items));
    if (data.months) localStorage.setItem(STORAGE_KEYS.MONTHS, JSON.stringify(data.months));
    if (data.transactions) localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(data.transactions));
    if (data.baselineStock || data.baseline) localStorage.setItem(STORAGE_KEYS.BASELINE_STOCK, JSON.stringify(data.baselineStock || data.baseline));
    if (data.googleSheetsConfig || data.sheetsConfig) localStorage.setItem(STORAGE_KEYS.SHEETS_CONFIG, JSON.stringify(data.googleSheetsConfig || data.sheetsConfig));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
};

export const saveState = saveData;

export const generateTransactionCode = (type: 'IN' | 'OUT', branchCodeOrId: string = 'HN'): string => {
  const prefix = type === 'IN' ? 'NK' : 'XK';
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const dd = now.getDate().toString().padStart(2, '0');
  const rand = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${yy}${mm}${dd}-${rand}`;
};

export const resetToSampleData = () => {
  localStorage.removeItem(STORAGE_KEYS.BRANCHES);
  localStorage.removeItem(STORAGE_KEYS.ITEMS);
  localStorage.removeItem(STORAGE_KEYS.MONTHS);
  localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
  localStorage.removeItem(STORAGE_KEYS.BASELINE_STOCK);
  localStorage.removeItem(STORAGE_KEYS.SHEETS_CONFIG);
  return getInitialData();
};

/**
 * Parses month string like 'T07/2026' into sortable number (e.g. 202607)
 */
export const parseMonthToSortKey = (monthStr: string): number => {
  const match = monthStr.match(/T?(\d{1,2})\/(\d{4})/i);
  if (!match) return 0;
  const m = parseInt(match[1], 10);
  const y = parseInt(match[2], 10);
  return y * 100 + m;
};

/**
 * Sorts an array of months chronologically
 */
export const sortMonthsChronological = (months: string[]): string[] => {
  return [...months].sort((a, b) => parseMonthToSortKey(a) - parseMonthToSortKey(b));
};

/**
 * Generates the next month label in sequence (e.g. 'T08/2026' -> 'T09/2026')
 */
export const getNextMonthLabel = (lastMonthStr: string): string => {
  const match = lastMonthStr.match(/T?(\d{1,2})\/(\d{4})/i);
  if (!match) return 'T01/2027';
  let m = parseInt(match[1], 10);
  let y = parseInt(match[2], 10);
  m += 1;
  if (m > 12) {
    m = 1;
    y += 1;
  }
  const mPadded = m.toString().padStart(2, '0');
  return `T${mPadded}/${y}`;
};

/**
 * CORE ERP INVENTORY CALCULATION ENGINE:
 * Computes StockRecords across months, ensuring that for every (item, branch):
 * FinalStock(month N) = InitialStock(month N) + In(month N) - Out(month N)
 * InitialStock(month N+1) = FinalStock(month N)
 */
export const computeAllStockRecords = (
  months: string[],
  items: Item[],
  branches: Branch[],
  arg4: any,
  arg5: any
): Record<string, StockRecord[]> => {
  const transactions: Transaction[] = Array.isArray(arg4) ? arg4 : (Array.isArray(arg5) ? arg5 : []);
  const baselineStock: Record<string, Record<string, number>> = (!Array.isArray(arg4) && typeof arg4 === 'object' && arg4 !== null)
    ? arg4
    : ((!Array.isArray(arg5) && typeof arg5 === 'object' && arg5 !== null) ? arg5 : BASELINE_STOCK_T06);

  const sortedMonths = sortMonthsChronological(months);
  const result: Record<string, StockRecord[]> = {};

  // Track carry-over stock per itemCode and branchId
  // key: `${itemCode}_${branchId}` -> number
  const currentRunningStock: Record<string, number> = {};

  // First, initialize running stock using baselineStock for the very first month
  items.forEach(item => {
    branches.forEach(branch => {
      const key = `${item.code}_${branch.id}`;
      const base = baselineStock[item.code]?.[branch.id] ?? 0;
      currentRunningStock[key] = base;
    });
  });

  sortedMonths.forEach((month, monthIndex) => {
    const monthRecords: StockRecord[] = [];

    // Sum transactions in this month
    const inMap: Record<string, number> = {};
    const outMap: Record<string, number> = {};

    transactions.filter(t => t.month === month).forEach(t => {
      const key = `${t.itemCode}_${t.branchId}`;
      if (t.type === 'IN') {
        inMap[key] = (inMap[key] || 0) + Number(t.quantity || 0);
      } else if (t.type === 'OUT') {
        outMap[key] = (outMap[key] || 0) + Number(t.quantity || 0);
      }
    });

    items.forEach(item => {
      branches.forEach(branch => {
        const key = `${item.code}_${branch.id}`;
        
        let initialStock = 0;
        if (monthIndex === 0) {
          initialStock = baselineStock[item.code]?.[branch.id] ?? 0;
        } else {
          // Carry over from previous month's final stock
          initialStock = currentRunningStock[key] || 0;
        }

        const inQty = inMap[key] || 0;
        const outQty = outMap[key] || 0;
        const finalStock = initialStock + inQty - outQty;

        // Update running stock for the next month
        currentRunningStock[key] = finalStock;

        monthRecords.push({
          month,
          itemCode: item.code,
          branchId: branch.id,
          initialStock,
          inQty,
          outQty,
          finalStock
        });
      });
    });

    result[month] = monthRecords;
  });

  return result;
};
