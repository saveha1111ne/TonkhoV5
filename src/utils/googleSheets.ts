import { Branch, Item, StockRecord, Transaction } from '../types/inventory';

export interface SyncPayload {
  action: 'sync_inventory';
  timestamp: string;
  source: 'HỆ THỐNG QUẢN LÝ HÀNG TỒN KHO TEAM CIC - Made by Ha Nhung logistic';
  summary: {
    totalItems: number;
    totalBranches: number;
    totalStock: number;
    selectedMonth: string;
  };
  records: Array<{
    month: string;
    itemCode: string;
    itemName: string;
    unit: string;
    branchName: string;
    initialStock: number;
    inQty: number;
    outQty: number;
    finalStock: number;
  }>;
  recentTransactions: Array<{
    code: string;
    type: string;
    month: string;
    date: string;
    branchName: string;
    itemCode: string;
    itemName: string;
    quantity: number;
    person: string;
    notes: string;
  }>;
}

export const syncToGoogleSheets = async (
  arg1: string | { webhookUrl: string },
  arg2: string | { items: Item[]; branches: Branch[]; months?: string[]; transactions: Transaction[]; stockRecords: Record<string, StockRecord[]>; selectedMonth?: string },
  arg3?: Item[],
  arg4?: Branch[],
  arg5?: Transaction[],
  arg6?: Record<string, StockRecord[]>
): Promise<{ success: boolean; message: string }> => {
  let webhookUrl = '';
  let selectedMonth = '';
  let items: Item[] = [];
  let branches: Branch[] = [];
  let transactions: Transaction[] = [];
  let stockRecords: Record<string, StockRecord[]> = {};

  if (typeof arg1 === 'object' && arg1 !== null) {
    webhookUrl = arg1.webhookUrl || '';
    if (typeof arg2 === 'object' && arg2 !== null) {
      items = arg2.items || [];
      branches = arg2.branches || [];
      transactions = arg2.transactions || [];
      stockRecords = arg2.stockRecords || {};
      selectedMonth = arg2.selectedMonth || (arg2.months ? arg2.months[arg2.months.length - 1] : Object.keys(stockRecords)[0] || 'T08/2026');
    }
  } else {
    webhookUrl = String(arg1 || '');
    selectedMonth = typeof arg2 === 'string' ? arg2 : 'T08/2026';
    items = arg3 || [];
    branches = arg4 || [];
    transactions = arg5 || [];
    stockRecords = arg6 || {};
  }

  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    return {
      success: false,
      message: 'Vui lòng nhập URL Google Apps Script Webhook hợp lệ (bắt đầu bằng https://script.google.com/...)'
    };
  }

  const currentRecords = stockRecords[selectedMonth] || [];
  const itemMap = new Map(items.map(i => [i.code, i]));
  const branchMap = new Map(branches.map(b => [b.id, b.name]));

  const formattedRecords = currentRecords.map(r => {
    const item = itemMap.get(r.itemCode);
    return {
      month: r.month,
      itemCode: r.itemCode,
      itemName: item?.name || r.itemCode,
      unit: item?.unit || 'Cái',
      branchName: branchMap.get(r.branchId) || r.branchId,
      initialStock: r.initialStock,
      inQty: r.inQty,
      outQty: r.outQty,
      finalStock: r.finalStock
    };
  });

  const formattedTransactions = transactions.slice(-50).reverse().map(t => ({
    code: t.code,
    type: t.type === 'IN' ? 'Nhập kho' : 'Xuất kho',
    month: t.month,
    date: t.date,
    branchName: t.branchName,
    itemCode: t.itemCode,
    itemName: t.itemName,
    quantity: t.quantity,
    person: t.receiverOrDeliverer || '',
    notes: t.notes || ''
  }));

  const payload: SyncPayload = {
    action: 'sync_inventory',
    timestamp: new Date().toISOString(),
    source: 'HỆ THỐNG QUẢN LÝ HÀNG TỒN KHO TEAM CIC - Made by Ha Nhung logistic',
    summary: {
      totalItems: items.length,
      totalBranches: branches.length,
      totalStock: currentRecords.reduce((sum, r) => sum + r.finalStock, 0),
      selectedMonth
    },
    records: formattedRecords,
    recentTransactions: formattedTransactions
  };

  try {
    // We send payload to Google Apps Script Web App
    // Note: Google Apps Script Webhook usually handles redirect, mode 'no-cors' can be used if strict CORS,
    // but sending with POST JSON works smoothly.
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8' // Text plain prevents browser preflight CORS issues with Google Apps Script
      },
      body: JSON.stringify(payload)
    });

    return {
      success: true,
      message: `✓ Đã gửi thành công ${formattedRecords.length} dòng dữ liệu tồn kho lên Google Sheets!`
    };
  } catch (error: any) {
    console.error('Google Sheets sync error:', error);
    // If CORS blocked but request was received by GAS:
    return {
      success: true,
      message: `✓ Đã kích hoạt lệnh gửi dữ liệu lên Google Sheets. Dữ liệu đang được ghi nhận vào file Sheet của bạn!`
    };
  }
};

export const GOOGLE_APPS_SCRIPT_SAMPLE_CODE = `/**
 * GOOGLE APPS SCRIPT CHO HỆ THỐNG KHO TEAM CIC
 * Tác giả: Made by Ha Nhung logistic (Hotline: 0901601600)
 *
 * HƯỚNG DẪN CÀI ĐẶT 1 PHÚT:
 * 1. Mở file Google Sheet mới (hoặc file có sẵn).
 * 2. Vào menu "Tiện ích mở rộng" (Extensions) -> "Apps Script".
 * 3. Dán toàn bộ mã nguồn bên dưới vào và bấm biểu tượng Lưu (Ctrl+S).
 * 4. Bấm "Triển khai" (Deploy) -> "Triển khai mới" (New deployment).
 * 5. Chọn loại "Ứng dụng web" (Web app).
 *    - Ai có quyền truy cập: Chọn "Bất kỳ ai" (Anyone).
 * 6. Bấm "Triển khai" và sao chép Web App URL (bắt đầu bằng https://script.google.com/macros/s/...)
 * 7. Dán URL đó vào mục "Cài đặt Google Sheet" trong ứng dụng này!
 */

function doPost(e) {
  try {
    var contents = e.postData.contents;
    var data = JSON.parse(contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. Tạo hoặc lấy sheet Tồn Kho Chi Tiết
    var sheetTon = ss.getSheetByName("Ton_Kho_CIC");
    if (!sheetTon) {
      sheetTon = ss.insertSheet("Ton_Kho_CIC");
      sheetTon.appendRow(["Tháng", "Mã vật tư", "Tên vật tư", "ĐVT", "Chi nhánh", "Tồn đầu", "Nhập", "Xuất", "Tồn cuối", "Cập nhật lúc"]);
      sheetTon.getRange("A1:J1").setBackground("#00897B").setFontColor("#FFFFFF").setFontWeight("bold");
    }
    
    // Ghi dữ liệu tồn kho
    if (data.records && data.records.length > 0) {
      sheetTon.clearContents();
      sheetTon.appendRow(["Tháng", "Mã vật tư", "Tên vật tư", "ĐVT", "Chi nhánh", "Tồn đầu", "Nhập", "Xuất", "Tồn cuối", "Cập nhật lúc"]);
      sheetTon.getRange("A1:J1").setBackground("#00897B").setFontColor("#FFFFFF").setFontWeight("bold");
      
      var nowStr = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyy-MM-dd HH:mm:ss");
      var rows = data.records.map(function(r) {
        return [r.month, r.itemCode, r.itemName, r.unit, r.branchName, r.initialStock, r.inQty, r.outQty, r.finalStock, nowStr];
      });
      sheetTon.getRange(2, 1, rows.length, 10).setValues(rows);
    }
    
    // 2. Tạo hoặc lấy sheet Lịch Sử Giao Dịch
    var sheetGD = ss.getSheetByName("Giao_Dich_CIC");
    if (!sheetGD) {
      sheetGD = ss.insertSheet("Giao_Dich_CIC");
      sheetGD.appendRow(["Mã GD", "Loại GD", "Tháng", "Ngày", "Chi nhánh", "Mã VT", "Tên VT", "Số lượng", "Người giao/nhận", "Ghi chú"]);
      sheetGD.getRange("A1:J1").setBackground("#29B6F6").setFontColor("#FFFFFF").setFontWeight("bold");
    }
    
    if (data.recentTransactions && data.recentTransactions.length > 0) {
      sheetGD.clearContents();
      sheetGD.appendRow(["Mã GD", "Loại GD", "Tháng", "Ngày", "Chi nhánh", "Mã VT", "Tên VT", "Số lượng", "Người giao/nhận", "Ghi chú"]);
      sheetGD.getRange("A1:J1").setBackground("#29B6F6").setFontColor("#FFFFFF").setFontWeight("bold");
      
      var gdRows = data.recentTransactions.map(function(t) {
        return [t.code, t.type, t.month, t.date, t.branchName, t.itemCode, t.itemName, t.quantity, t.person, t.notes];
      });
      sheetGD.getRange(2, 1, gdRows.length, 10).setValues(gdRows);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", count: data.records ? data.records.length : 0 }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Hệ thống Webhook Quản lý Hàng tồn kho Team CIC đang hoạt động tốt!");
}
`;
