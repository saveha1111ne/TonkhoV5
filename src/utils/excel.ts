import * as XLSX from 'xlsx';
import { Branch, Item, StockRecord, Transaction } from '../types/inventory';

export interface ExportExcelParams {
  months?: string[];
  selectedMonth: string;
  items: Item[];
  branches: Branch[];
  transactions: Transaction[];
  stockRecords: Record<string, StockRecord[]>;
}

export const exportToExcel = ({
  months,
  selectedMonth,
  items,
  branches,
  transactions,
  stockRecords
}: ExportExcelParams) => {
  const wb = XLSX.utils.book_new();

  // 1. SHEET: TỔNG QUAN HỆ THỐNG
  const currentMonthRecords = stockRecords[selectedMonth] || [];
  const currentMonthTransactions = transactions.filter(t => t.month === selectedMonth);

  const totalIn = currentMonthTransactions
    .filter(t => t.type === 'IN')
    .reduce((sum, t) => sum + Number(t.quantity || 0), 0);
  const totalOut = currentMonthTransactions
    .filter(t => t.type === 'OUT')
    .reduce((sum, t) => sum + Number(t.quantity || 0), 0);
  const totalStock = currentMonthRecords.reduce((sum, r) => sum + r.finalStock, 0);
  const totalInitial = currentMonthRecords.reduce((sum, r) => sum + r.initialStock, 0);

  const overviewData: (string | number)[][] = [
    ['HỆ THỐNG QUẢN LÝ HÀNG TỒN KHO TEAM CIC'],
    ['Version: Made by Ha Nhung logistic | Hotline: 0901601600'],
    ['BÁO CÁO TỔNG HỢP NHẬP - XUẤT - TỒN TOÀN HỆ THỐNG'],
    [`Kỳ báo cáo: ${selectedMonth}`],
    ['Ngày xuất báo cáo:', new Date().toLocaleString('vi-VN')],
    [],
    ['CHỈ SỐ', 'GIÁ TRỊ', 'ĐƠN VỊ'],
    ['Tổng tồn đầu kỳ', totalInitial, 'SP'],
    ['Tổng nhập trong kỳ', totalIn, 'SP'],
    ['Tổng xuất trong kỳ', totalOut, 'SP'],
    ['Tổng tồn cuối kỳ', totalStock, 'SP'],
    ['Số lượng chi nhánh', branches.length, 'Chi nhánh'],
    ['Số lượng mã vật tư', items.length, 'Mã SKU']
  ];
  const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
  XLSX.utils.book_append_sheet(wb, wsOverview, 'Tổng quan');

  // 2. SHEET: TỒN KHO CHI TIẾT (Theo vật tư & chi nhánh)
  const itemMap = new Map(items.map(i => [i.code, i]));
  const branchMap = new Map(branches.map(b => [b.id, b.name]));

  const detailRows: (string | number)[][] = [
    ['STT', 'Mã vật tư', 'Tên vật tư', 'Đơn vị tính', 'Nhóm vật tư', 'Chi nhánh', 'Tồn đầu kỳ', 'Nhập trong kỳ', 'Xuất trong kỳ', 'Tồn cuối kỳ']
  ];

  let counter = 1;
  currentMonthRecords.forEach(r => {
    const item = itemMap.get(r.itemCode);
    const branchName = branchMap.get(r.branchId) || r.branchId;
    detailRows.push([
      counter++,
      r.itemCode,
      item ? item.name : r.itemCode,
      item ? item.unit : '',
      item ? item.category : '',
      branchName,
      r.initialStock,
      r.inQty,
      r.outQty,
      r.finalStock
    ]);
  });
  const wsDetail = XLSX.utils.aoa_to_sheet(detailRows);
  XLSX.utils.book_append_sheet(wb, wsDetail, 'Tồn kho chi tiết');

  // 3. SHEET: NHẬP KHO
  const inTransactions = transactions.filter(t => t.type === 'IN');
  const inRows: (string | number)[][] = [
    ['STT', 'Mã giao dịch', 'Tháng', 'Ngày giao dịch', 'Chi nhánh', 'Mã vật tư', 'Tên vật tư', 'Đơn vị', 'Số lượng', 'Người giao / Nguồn nhập', 'Ghi chú']
  ];
  inTransactions.forEach((t, idx) => {
    inRows.push([
      idx + 1,
      t.code,
      t.month,
      t.date,
      t.branchName,
      t.itemCode,
      t.itemName,
      t.unit,
      t.quantity,
      t.receiverOrDeliverer || '',
      t.notes || ''
    ]);
  });
  const wsIn = XLSX.utils.aoa_to_sheet(inRows);
  XLSX.utils.book_append_sheet(wb, wsIn, 'Nhập kho');

  // 4. SHEET: XUẤT KHO
  const outTransactions = transactions.filter(t => t.type === 'OUT');
  const outRows: (string | number)[][] = [
    ['STT', 'Mã giao dịch', 'Tháng', 'Ngày giao dịch', 'Chi nhánh', 'Mã vật tư', 'Tên vật tư', 'Đơn vị', 'Số lượng xuất', 'Người nhận / Đơn vị nhận', 'Ghi chú']
  ];
  outTransactions.forEach((t, idx) => {
    outRows.push([
      idx + 1,
      t.code,
      t.month,
      t.date,
      t.branchName,
      t.itemCode,
      t.itemName,
      t.unit,
      t.quantity,
      t.receiverOrDeliverer || '',
      t.notes || ''
    ]);
  });
  const wsOut = XLSX.utils.aoa_to_sheet(outRows);
  XLSX.utils.book_append_sheet(wb, wsOut, 'Xuất kho');

  // 5. SHEET: THEO CHI NHÁNH
  const branchReportRows: (string | number)[][] = [
    ['STT', 'Mã chi nhánh', 'Tên chi nhánh', 'Khu vực', 'Tồn đầu', 'Tổng nhập', 'Tổng xuất', 'Tồn cuối', 'Tỷ lệ tồn (%)']
  ];
  branches.forEach((b, idx) => {
    const branchRecs = currentMonthRecords.filter(r => r.branchId === b.id);
    const bInit = branchRecs.reduce((s, r) => s + r.initialStock, 0);
    const bIn = branchRecs.reduce((s, r) => s + r.inQty, 0);
    const bOut = branchRecs.reduce((s, r) => s + r.outQty, 0);
    const bFinal = branchRecs.reduce((s, r) => s + r.finalStock, 0);
    const bPct = totalStock > 0 ? ((bFinal / totalStock) * 100).toFixed(1) + '%' : '0%';

    branchReportRows.push([
      idx + 1,
      b.code,
      b.name,
      b.region,
      bInit,
      bIn,
      bOut,
      bFinal,
      bPct
    ]);
  });
  branchReportRows.push([
    '',
    'TỔNG',
    'TOÀN HỆ THỐNG',
    '',
    totalInitial,
    totalIn,
    totalOut,
    totalStock,
    '100%'
  ]);
  const wsBranch = XLSX.utils.aoa_to_sheet(branchReportRows);
  XLSX.utils.book_append_sheet(wb, wsBranch, 'Theo chi nhánh');

  // 6. SHEET: DANH MỤC VẬT TƯ
  const itemCatalogRows: (string | number)[][] = [
    ['STT', 'Mã vật tư', 'Tên vật tư', 'Đơn vị tính', 'Nhóm vật tư', 'Định mức tồn tối thiểu', 'Trạng thái', 'Ghi chú']
  ];
  items.forEach((item, idx) => {
    itemCatalogRows.push([
      idx + 1,
      item.code,
      item.name,
      item.unit,
      item.category,
      item.minStockAlert || 0,
      item.status === 'active' ? 'Đang hoạt động' : 'Tạm ngừng',
      item.notes || ''
    ]);
  });
  const wsItems = XLSX.utils.aoa_to_sheet(itemCatalogRows);
  XLSX.utils.book_append_sheet(wb, wsItems, 'Danh mục vật tư');

  // Clean filename: Bao_Cao_Ton_Kho_CIC_07_2026.xlsx
  const cleanMonth = selectedMonth.replace(/[^\w]/g, '_');
  const filename = `Bao_Cao_Ton_Kho_CIC_${cleanMonth}.xlsx`;

  XLSX.writeFile(wb, filename);
};

export const exportToCSV = (
  records: StockRecord[],
  items: Item[],
  branches: Branch[],
  month: string
) => {
  const itemMap = new Map(items.map(i => [i.code, i]));
  const branchMap = new Map(branches.map(b => [b.id, b.name]));

  const headers = ['Tháng', 'Mã vật tư', 'Tên vật tư', 'Đơn vị', 'Chi nhánh', 'Tồn đầu', 'Nhập', 'Xuất', 'Tồn cuối'];
  const rows = records.map(r => {
    const item = itemMap.get(r.itemCode);
    const branchName = branchMap.get(r.branchId) || r.branchId;
    return [
      `"${r.month}"`,
      `"${r.itemCode}"`,
      `"${item?.name || r.itemCode}"`,
      `"${item?.unit || ''}"`,
      `"${branchName}"`,
      r.initialStock,
      r.inQty,
      r.outQty,
      r.finalStock
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Bao_Cao_Ton_Kho_CIC_${month.replace('/', '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadSampleExcelTemplate = () => {
  const wb = XLSX.utils.book_new();

  // Template 1: Danh mục vật tư
  const wsItems = XLSX.utils.aoa_to_sheet([
    ['Mã vật tư*', 'Tên vật tư*', 'Đơn vị tính*', 'Nhóm vật tư', 'Tồn tối thiểu', 'Ghi chú'],
    ['TDC-CIC01', 'Túi đeo chéo Team CIC Premium', 'Cái', 'Túi đeo chéo', 50, 'Chống nước'],
    ['DU-CIC02', 'Dù gập tự động Team CIC chống UV', 'Chiếc', 'Dù', 40, 'Khung thép 10 nan'],
    ['BGN-CIC03', 'Bình giữ nhiệt Lock&Lock CIC Inox 500ml', 'Chiếc', 'Bình giữ nhiệt', 30, 'Inox 304']
  ]);
  XLSX.utils.book_append_sheet(wb, wsItems, 'Mau_Vat_Tu');

  // Template 2: Giao dịch Nhập - Xuất
  const wsTrans = XLSX.utils.aoa_to_sheet([
    ['Loại (IN/OUT)*', 'Tháng*', 'Ngày (YYYY-MM-DD)*', 'Chi nhánh*', 'Mã vật tư*', 'Số lượng*', 'Người giao nhận', 'Ghi chú'],
    ['IN', 'T08/2026', '2026-08-05', 'Hà Nội', 'TDC-CIC01', 50, 'Xưởng may Hà Nội', 'Nhập đợt mới'],
    ['OUT', 'T08/2026', '2026-08-10', 'Hà Nội', 'TDC-CIC01', 20, 'Phòng Kinh Doanh', 'Phát sự kiện']
  ]);
  XLSX.utils.book_append_sheet(wb, wsTrans, 'Mau_Giao_Dich');

  XLSX.writeFile(wb, 'Mau_Nhap_Lieu_Kho_CIC.xlsx');
};

export const parseUploadedExcel = async (
  file: File,
  existingItems: Item[],
  existingBranches: Branch[]
): Promise<{
  newItems: Item[];
  newTransactions: Transaction[];
  message: string;
}> => {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });

  let newItems: Item[] = [];
  let newTransactions: Transaction[] = [];

  const branchLookup = new Map<string, Branch>();
  existingBranches.forEach(b => {
    branchLookup.set(b.name.toLowerCase().trim(), b);
    branchLookup.set(b.code.toLowerCase().trim(), b);
    branchLookup.set(b.id.toLowerCase().trim(), b);
  });

  const itemLookup = new Map<string, Item>();
  existingItems.forEach(i => {
    itemLookup.set(i.code.toLowerCase().trim(), i);
  });

  // Check each sheet
  wb.SheetNames.forEach(sheetName => {
    const ws = wb.Sheets[sheetName];
    const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
    if (data.length < 2) return;

    const header = data[0].map(h => String(h || '').toLowerCase().trim());

    // Is it Items sheet?
    if (header.some(h => h.includes('mã vật tư') || h.includes('sku') || h.includes('ma vat tu'))) {
      const codeIdx = header.findIndex(h => h.includes('mã vật tư') || h.includes('sku') || h.includes('ma vat tu'));
      const nameIdx = header.findIndex(h => h.includes('tên vật tư') || h.includes('ten vat tu') || h.includes('name'));
      const unitIdx = header.findIndex(h => h.includes('đơn vị') || h.includes('don vi') || h.includes('unit'));
      const catIdx = header.findIndex(h => h.includes('nhóm') || h.includes('nhom') || h.includes('category'));
      const minStockIdx = header.findIndex(h => h.includes('tối thiểu') || h.includes('toi thieu') || h.includes('min'));
      const noteIdx = header.findIndex(h => h.includes('ghi chú') || h.includes('ghi chu') || h.includes('note'));

      for (let r = 1; r < data.length; r++) {
        const row = data[r];
        const code = row[codeIdx] ? String(row[codeIdx]).trim() : '';
        const name = row[nameIdx] ? String(row[nameIdx]).trim() : code;
        const unit = row[unitIdx] ? String(row[unitIdx]).trim() : 'Cái';
        const category = row[catIdx] ? String(row[catIdx]).trim() : 'Chung';
        const minStock = row[minStockIdx] ? Number(row[minStockIdx]) : 20;
        const notes = row[noteIdx] ? String(row[noteIdx]).trim() : '';

        if (code && !itemLookup.has(code.toLowerCase())) {
          const item: Item = {
            id: `it-imp-${Date.now()}-${r}`,
            code,
            name,
            unit,
            category,
            status: 'active',
            minStockAlert: isNaN(minStock) ? 20 : minStock,
            notes
          };
          newItems.push(item);
          itemLookup.set(code.toLowerCase(), item);
        }
      }
    }

    // Is it Transactions sheet?
    if (header.some(h => h.includes('loại') || h.includes('type') || h.includes('số lượng') || h.includes('so luong'))) {
      const typeIdx = header.findIndex(h => h.includes('loại') || h.includes('type'));
      const monthIdx = header.findIndex(h => h.includes('tháng') || h.includes('thang') || h.includes('month'));
      const dateIdx = header.findIndex(h => h.includes('ngày') || h.includes('ngay') || h.includes('date'));
      const branchIdx = header.findIndex(h => h.includes('chi nhánh') || h.includes('chi nhanh') || h.includes('branch'));
      const codeIdx = header.findIndex(h => h.includes('mã vật tư') || h.includes('ma vat tu') || h.includes('sku'));
      const qtyIdx = header.findIndex(h => h.includes('số lượng') || h.includes('so luong') || h.includes('quantity') || h.includes('qty'));
      const personIdx = header.findIndex(h => h.includes('người') || h.includes('nguoi') || h.includes('receiver') || h.includes('deliverer'));
      const noteIdx = header.findIndex(h => h.includes('ghi chú') || h.includes('ghi chu') || h.includes('note'));

      for (let r = 1; r < data.length; r++) {
        const row = data[r];
        const rawType = row[typeIdx] ? String(row[typeIdx]).trim().toUpperCase() : 'IN';
        const type = rawType.includes('OUT') || rawType.includes('XUẤT') || rawType.includes('XUAT') ? 'OUT' : 'IN';
        const month = row[monthIdx] ? String(row[monthIdx]).trim() : 'T08/2026';
        const date = row[dateIdx] ? String(row[dateIdx]).trim() : new Date().toISOString().split('T')[0];
        const branchRaw = row[branchIdx] ? String(row[branchIdx]).trim().toLowerCase() : 'hà nội';
        const branch = branchLookup.get(branchRaw) || existingBranches[0];
        const itemCode = row[codeIdx] ? String(row[codeIdx]).trim() : '';
        const item = itemLookup.get(itemCode.toLowerCase());
        const quantity = row[qtyIdx] ? Math.abs(Number(row[qtyIdx])) : 0;
        const person = row[personIdx] ? String(row[personIdx]).trim() : '';
        const notes = row[noteIdx] ? String(row[noteIdx]).trim() : '';

        if (itemCode && quantity > 0) {
          newTransactions.push({
            id: `tx-imp-${Date.now()}-${r}`,
            code: `${type === 'IN' ? 'NK' : 'XK'}-IMP${Date.now().toString().slice(-4)}${r}`,
            type,
            month,
            date,
            branchId: branch.id,
            branchName: branch.name,
            itemCode,
            itemName: item ? item.name : itemCode,
            unit: item ? item.unit : 'Cái',
            quantity,
            receiverOrDeliverer: person,
            notes,
            createdAt: new Date().toISOString()
          });
        }
      }
    }
  });

  return {
    newItems,
    newTransactions,
    message: `Đã đọc thành công ${newItems.length} vật tư mới và ${newTransactions.length} giao dịch mới từ file Excel.`
  };
};

export const exportToCsv = (
  stockRecords: Record<string, StockRecord[]>,
  selectedMonth: string,
  items: Item[],
  branches: Branch[]
) => {
  const records = stockRecords[selectedMonth] || [];
  const itemMap = new Map(items.map(i => [i.code, i]));
  const branchMap = new Map(branches.map(b => [b.id, b.name]));

  const headers = [
    'Ky_Thang',
    'Ma_Vat_Tu',
    'Ten_Vat_Tu',
    'Don_Vi',
    'Nhom_Hang',
    'Chi_Nhanh',
    'Ton_Dau',
    'Nhap',
    'Xuat',
    'Ton_Cuoi'
  ];

  const rows = records.map(r => {
    const it = itemMap.get(r.itemCode);
    const bName = branchMap.get(r.branchId) || r.branchId;
    return [
      `"${r.month}"`,
      `"${r.itemCode}"`,
      `"${(it?.name || r.itemCode).replace(/"/g, '""')}"`,
      `"${it?.unit || ''}"`,
      `"${it?.category || ''}"`,
      `"${bName.replace(/"/g, '""')}"`,
      r.initialStock,
      r.inQty,
      r.outQty,
      r.finalStock
    ].join(',');
  });

  // Include UTF-8 BOM so Excel opens Vietnamese characters cleanly
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Bao_Cao_Ton_Kho_CIC_${selectedMonth.replace('/', '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
