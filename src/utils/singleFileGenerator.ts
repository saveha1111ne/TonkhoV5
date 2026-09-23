/**
 * Generates the full standalone single-file HTML (inventory-cic.html)
 * containing everything needed to run in any browser without npm, node, or servers.
 */
export const generateStandaloneHtml = (currentAppStateJson?: string): string => {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>HỆ THỐNG QUẢN LÝ HÀNG TỒN KHO TEAM CIC - Made by Ha Nhung logistic</title>
  <meta name="description" content="Hệ thống quản lý hàng tồn kho chuyên nghiệp cho Team CIC - Hotline: 0901601600" />
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- React & ReactDOM -->
  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
  <!-- Babel for JSX -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <!-- SheetJS for Excel -->
  <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      background-color: #F5FBFA;
    }
    /* Custom clean scrollbars */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: #E0F2F1;
    }
    ::-webkit-scrollbar-thumb {
      background: #80CBC4;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #00897B;
    }
    .gradient-header {
      background: linear-gradient(135deg, #00695C 0%, #00897B 35%, #29B6F6 100%);
    }
    .btn-gradient {
      background: linear-gradient(135deg, #00897B 0%, #29B6F6 100%);
    }
    .btn-gradient:hover {
      background: linear-gradient(135deg, #00695C 0%, #0288D1 100%);
    }
  </style>
</head>
<body class="text-slate-800 antialiased min-h-screen">
  <div id="root"></div>

  <script type="text/babel">
    const { useState, useEffect, useMemo } = React;

    // Seed Data
    const DEFAULT_BRANCHES = [
      { id: 'b-hn', code: 'HN', name: 'Hà Nội', region: 'Miền Bắc' },
      { id: 'b-dn', code: 'DN', name: 'Đà Nẵng', region: 'Miền Trung' },
      { id: 'b-hcm', code: 'HCM', name: 'HCM', region: 'Miền Nam' },
      { id: 'b-ct', code: 'CT', name: 'Cần Thơ', region: 'Tây Nam Bộ' }
    ];

    const DEFAULT_ITEMS = [
      { id: 'it-1', code: 'TDC-CIC01', name: 'Túi đeo chéo Team CIC Premium', unit: 'Cái', category: 'Túi đeo chéo', status: 'active', minStockAlert: 50 },
      { id: 'it-2', code: 'DU-CIC02', name: 'Dù gập tự động Team CIC chống UV', unit: 'Chiếc', category: 'Dù', status: 'active', minStockAlert: 40 },
      { id: 'it-3', code: 'BGN-CIC03', name: 'Bình giữ nhiệt Lock&Lock CIC Inox 500ml', unit: 'Chiếc', category: 'Bình giữ nhiệt', status: 'active', minStockAlert: 30 },
      { id: 'it-4', code: 'AT-CIC04', name: 'Áo thun Polo đồng phục Team CIC', unit: 'Áo', category: 'Đồng phục', status: 'active', minStockAlert: 60 },
      { id: 'it-5', code: 'ST-CIC05', name: 'Sổ tay bìa da còng logo CIC', unit: 'Cuốn', category: 'Quà tặng', status: 'active', minStockAlert: 25 },
      { id: 'it-6', code: 'BALO-CIC06', name: 'Balo laptop cao cấp CIC Pro', unit: 'Cái', category: 'Túi đeo chéo', status: 'active', minStockAlert: 20 }
    ];

    const DEFAULT_MONTHS = ['T06/2026', 'T07/2026', 'T08/2026'];

    const BASELINE_STOCK_T06 = {
      'TDC-CIC01': { 'b-hn': 120, 'b-dn': 80, 'b-hcm': 150, 'b-ct': 60 },
      'DU-CIC02': { 'b-hn': 90, 'b-dn': 60, 'b-hcm': 110, 'b-ct': 45 },
      'BGN-CIC03': { 'b-hn': 100, 'b-dn': 50, 'b-hcm': 130, 'b-ct': 40 },
      'AT-CIC04': { 'b-hn': 200, 'b-dn': 120, 'b-hcm': 250, 'b-ct': 90 },
      'ST-CIC05': { 'b-hn': 80, 'b-dn': 40, 'b-hcm': 95, 'b-ct': 30 },
      'BALO-CIC06': { 'b-hn': 65, 'b-dn': 35, 'b-hcm': 85, 'b-ct': 25 }
    };

    const DEFAULT_TRANSACTIONS = [
      { id: 'tx-1', code: 'NK-260701', type: 'IN', month: 'T07/2026', date: '2026-07-02', branchId: 'b-hn', branchName: 'Hà Nội', itemCode: 'TDC-CIC01', itemName: 'Túi đeo chéo Team CIC Premium', unit: 'Cái', quantity: 100, receiverOrDeliverer: 'Kho vận Hà Nhung', notes: 'Nhập đầu tháng' },
      { id: 'tx-2', code: 'XK-260701', type: 'OUT', month: 'T07/2026', date: '2026-07-15', branchId: 'b-hn', branchName: 'Hà Nội', itemCode: 'TDC-CIC01', itemName: 'Túi đeo chéo Team CIC Premium', unit: 'Cái', quantity: 60, receiverOrDeliverer: 'Kinh Doanh HN', notes: 'Sự kiện quý 3' },
      { id: 'tx-3', code: 'NK-260702', type: 'IN', month: 'T07/2026', date: '2026-07-06', branchId: 'b-hcm', branchName: 'HCM', itemCode: 'DU-CIC02', itemName: 'Dù gập tự động Team CIC chống UV', unit: 'Chiếc', quantity: 70, receiverOrDeliverer: 'Xưởng Dù Sài Gòn', notes: 'Lô mùa mưa' },
      { id: 'tx-4', code: 'XK-260702', type: 'OUT', month: 'T07/2026', date: '2026-07-22', branchId: 'b-hcm', branchName: 'HCM', itemCode: 'DU-CIC02', itemName: 'Dù gập tự động Team CIC chống UV', unit: 'Chiếc', quantity: 50, receiverOrDeliverer: 'Đại lý miền Nam', notes: 'Xuất đại lý' },
      { id: 'tx-5', code: 'NK-260801', type: 'IN', month: 'T08/2026', date: '2026-08-03', branchId: 'b-hcm', branchName: 'HCM', itemCode: 'TDC-CIC01', itemName: 'Túi đeo chéo Team CIC Premium', unit: 'Cái', quantity: 120, receiverOrDeliverer: 'Xưởng may Hà Nhung', notes: 'Lô thu' },
      { id: 'tx-6', code: 'XK-260801', type: 'OUT', month: 'T08/2026', date: '2026-08-14', branchId: 'b-hcm', branchName: 'HCM', itemCode: 'TDC-CIC01', itemName: 'Túi đeo chéo Team CIC Premium', unit: 'Cái', quantity: 75, receiverOrDeliverer: 'Chi nhánh SG', notes: 'Phân phối' }
    ];

    function App() {
      const [branches, setBranches] = useState(() => {
        const s = localStorage.getItem('cic_html_branches');
        return s ? JSON.parse(s) : DEFAULT_BRANCHES;
      });
      const [items, setItems] = useState(() => {
        const s = localStorage.getItem('cic_html_items');
        return s ? JSON.parse(s) : DEFAULT_ITEMS;
      });
      const [months, setMonths] = useState(() => {
        const s = localStorage.getItem('cic_html_months');
        return s ? JSON.parse(s) : DEFAULT_MONTHS;
      });
      const [transactions, setTransactions] = useState(() => {
        const s = localStorage.getItem('cic_html_transactions');
        return s ? JSON.parse(s) : DEFAULT_TRANSACTIONS;
      });
      const [baseline, setBaseline] = useState(() => {
        const s = localStorage.getItem('cic_html_baseline');
        return s ? JSON.parse(s) : BASELINE_STOCK_T06;
      });

      const [activeTab, setActiveTab] = useState('overview');
      const [selectedMonth, setSelectedMonth] = useState('T08/2026');
      const [selectedBranch, setSelectedBranch] = useState('all');
      const [searchTerm, setSearchTerm] = useState('');
      const [filterType, setFilterType] = useState('all');
      const [toast, setToast] = useState(null);

      // Modals
      const [showInboundModal, setShowInboundModal] = useState(false);
      const [showOutboundModal, setShowOutboundModal] = useState(false);
      const [showItemModal, setShowItemModal] = useState(false);
      const [showAddMonthModal, setShowAddMonthModal] = useState(false);
      const [editingTx, setEditingTx] = useState(null);
      const [deleteConfirm, setDeleteConfirm] = useState(null);

      // Save to localStorage
      useEffect(() => {
        localStorage.setItem('cic_html_branches', JSON.stringify(branches));
        localStorage.setItem('cic_html_items', JSON.stringify(items));
        localStorage.setItem('cic_html_months', JSON.stringify(months));
        localStorage.setItem('cic_html_transactions', JSON.stringify(transactions));
        localStorage.setItem('cic_html_baseline', JSON.stringify(baseline));
      }, [branches, items, months, transactions, baseline]);

      const showNotice = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
      };

      // Calculate Stock
      const stockRecords = useMemo(() => {
        const sortedMonths = [...months].sort((a, b) => {
          const mA = parseInt(a.replace(/\D/g, '').slice(0, 2) || '0', 10);
          const yA = parseInt(a.replace(/\D/g, '').slice(2) || '0', 10);
          const mB = parseInt(b.replace(/\D/g, '').slice(0, 2) || '0', 10);
          const yB = parseInt(b.replace(/\D/g, '').slice(2) || '0', 10);
          return (yA * 100 + mA) - (yB * 100 + mB);
        });

        const result = {};
        const currentRunning = {};

        items.forEach(it => {
          branches.forEach(br => {
            const key = it.code + '_' + br.id;
            currentRunning[key] = baseline[it.code]?.[br.id] || 0;
          });
        });

        sortedMonths.forEach((m, mIdx) => {
          const mRecs = [];
          const inMap = {};
          const outMap = {};

          transactions.filter(t => t.month === m).forEach(t => {
            const k = t.itemCode + '_' + t.branchId;
            if (t.type === 'IN') inMap[k] = (inMap[k] || 0) + Number(t.quantity || 0);
            if (t.type === 'OUT') outMap[k] = (outMap[k] || 0) + Number(t.quantity || 0);
          });

          items.forEach(it => {
            branches.forEach(br => {
              const k = it.code + '_' + br.id;
              const init = mIdx === 0 ? (baseline[it.code]?.[br.id] || 0) : (currentRunning[k] || 0);
              const inQ = inMap[k] || 0;
              const outQ = outMap[k] || 0;
              const fin = init + inQ - outQ;
              currentRunning[k] = fin;
              mRecs.push({
                month: m,
                itemCode: it.code,
                branchId: br.id,
                initialStock: init,
                inQty: inQ,
                outQty: outQ,
                finalStock: fin
              });
            });
          });
          result[m] = mRecs;
        });
        return result;
      }, [months, items, branches, transactions, baseline]);

      // Current KPIs
      const currentMonthRecs = stockRecords[selectedMonth] || [];
      const currentMonthTxs = transactions.filter(t => t.month === selectedMonth);
      const totalIn = currentMonthTxs.filter(t => t.type === 'IN').reduce((s, t) => s + Number(t.quantity || 0), 0);
      const totalOut = currentMonthTxs.filter(t => t.type === 'OUT').reduce((s, t) => s + Number(t.quantity || 0), 0);
      const totalFinal = currentMonthRecs.reduce((s, r) => s + r.finalStock, 0);

      // Handle Excel Export
      const handleExportExcel = () => {
        if (typeof XLSX === 'undefined') {
          alert('Thư viện Excel đang tải, vui lòng thử lại!');
          return;
        }
        const wb = XLSX.utils.book_new();
        // Overview
        const overviewData = [
          ['HỆ THỐNG QUẢN LÝ HÀNG TỒN KHO TEAM CIC'],
          ['Version: Made by Ha Nhung logistic | Hotline: 0901601600'],
          ['Kỳ báo cáo:', selectedMonth],
          ['Ngày xuất:', new Date().toLocaleString('vi-VN')],
          [],
          ['Chỉ số', 'Số lượng'],
          ['Tổng Nhập', totalIn],
          ['Tổng Xuất', totalOut],
          ['Tổng Tồn', totalFinal],
          ['Số chi nhánh', branches.length],
          ['Số mã vật tư', items.length]
        ];
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(overviewData), 'Tổng quan');

        // Chi tiết
        const itemMap = new Map(items.map(i => [i.code, i.name]));
        const branchMap = new Map(branches.map(b => [b.id, b.name]));
        const rows = [
          ['Mã vật tư', 'Tên vật tư', 'Chi nhánh', 'Tồn đầu', 'Nhập', 'Xuất', 'Tồn cuối']
        ];
        currentMonthRecs.forEach(r => {
          rows.push([
            r.itemCode,
            itemMap.get(r.itemCode) || r.itemCode,
            branchMap.get(r.branchId) || r.branchId,
            r.initialStock,
            r.inQty,
            r.outQty,
            r.finalStock
          ]);
        });
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Tồn kho chi tiết');

        XLSX.writeFile(wb, 'Bao_Cao_Ton_Kho_CIC_' + selectedMonth.replace('/', '_') + '.xlsx');
        showNotice('✓ Đã xuất file Excel thành công!');
      };

      // Handle CSV Export
      const handleExportCSV = () => {
        const itemMap = new Map(items.map(i => [i.code, i.name]));
        const branchMap = new Map(branches.map(b => [b.id, b.name]));
        const header = ['Thang,Ma_VT,Ten_VT,Chi_Nhanh,Ton_Dau,Nhap,Xuat,Ton_Cuoi'];
        const rows = currentMonthRecs.map(r => {
          return [
            r.month,
            r.itemCode,
            '"' + (itemMap.get(r.itemCode) || '') + '"',
            '"' + (branchMap.get(r.branchId) || '') + '"',
            r.initialStock,
            r.inQty,
            r.outQty,
            r.finalStock
          ].join(',');
        });
        const blob = new Blob(['\\uFEFF' + [header, ...rows].join('\\n')], { type: 'text/csv;charset=utf-8;' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'Bao_Cao_Ton_Kho_CIC_' + selectedMonth.replace('/', '_') + '.csv';
        a.click();
        showNotice('✓ Đã xuất file CSV thành công!');
      };

      // Add Next Month
      const handleAddNextMonth = () => {
        const last = months[months.length - 1] || 'T08/2026';
        const match = last.match(/T?(\\d{1,2})\\/(\\d{4})/);
        let m = match ? parseInt(match[1], 10) + 1 : 9;
        let y = match ? parseInt(match[2], 10) : 2026;
        if (m > 12) { m = 1; y += 1; }
        const nextMonth = 'T' + String(m).padStart(2, '0') + '/' + y;
        if (months.includes(nextMonth)) {
          showNotice('Tháng ' + nextMonth + ' đã tồn tại trong hệ thống!', 'error');
          return;
        }
        setMonths([...months, nextMonth]);
        setSelectedMonth(nextMonth);
        showNotice('✓ Đã thêm tháng ' + nextMonth + ' và tự động chuyển tồn cuối kỳ sang tồn đầu kỳ!');
      };

      return (
        <div class="min-h-screen flex flex-col">
          {/* Top Header */}
          <header class="gradient-header text-white shadow-lg sticky top-0 z-40">
            <div class="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center font-black text-xl shadow-inner">
                  📦
                </div>
                <div>
                  <h1 class="font-extrabold text-lg sm:text-xl tracking-wide uppercase drop-shadow-sm">
                    HỆ THỐNG QUẢN LÝ HÀNG TỒN KHO TEAM CIC
                  </h1>
                  <p class="text-xs text-sky-100 font-medium tracking-wider">
                    Inventory Management Dashboard • Phiên bản Offline Độc Lập
                  </p>
                </div>
              </div>
              <div class="flex flex-col items-end text-xs text-right">
                <span class="bg-white/20 backdrop-blur px-3 py-1 rounded-full font-semibold border border-white/30 text-white">
                  Made by Ha Nhung logistic
                </span>
                <span class="mt-1 text-sky-100 font-bold tracking-wide">
                  Hotline: <a href="tel:0901601600" class="hover:underline text-white">0901601600</a>
                </span>
              </div>
            </div>
          </header>

          {/* Quick Action Bar */}
          <div class="bg-white border-b border-teal-100 shadow-sm sticky top-[62px] z-30">
            <div class="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setShowInboundModal(true)}
                  class="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                >
                  ⬆️ NHẬP KHO
                </button>
                <button
                  onClick={() => setShowOutboundModal(true)}
                  class="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                >
                  ⬇️ XUẤT KHO
                </button>
                <button
                  onClick={() => setShowItemModal(true)}
                  class="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                >
                  ➕ THÊM VẬT TƯ
                </button>
                <button
                  onClick={handleAddNextMonth}
                  class="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                >
                  📅 THÊM THÁNG MỚI
                </button>
              </div>

              <div class="flex items-center gap-2">
                <button
                  onClick={handleExportExcel}
                  class="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 text-xs font-bold flex items-center gap-1 transition"
                >
                  📥 XUẤT EXCEL
                </button>
                <button
                  onClick={handleExportCSV}
                  class="px-3 py-1.5 rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-300 text-xs font-bold flex items-center gap-1 transition"
                >
                  📄 XUẤT CSV
                </button>
              </div>
            </div>
          </div>

          {/* Toast Notice */}
          {toast && (
            <div class={"fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl text-sm font-semibold flex items-center gap-2 text-white transition-all transform " + (toast.type === 'error' ? 'bg-red-600' : 'bg-teal-700')}>
              <span>{toast.msg}</span>
            </div>
          )}

          {/* Main Body */}
          <main class="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
            
            {/* KPI Cards */}
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div class="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 p-4 rounded-2xl shadow-sm">
                <p class="text-xs font-bold text-emerald-700 uppercase tracking-wider">TỔNG NHẬP ({selectedMonth})</p>
                <p class="text-2xl font-black text-emerald-900 mt-1">{totalIn.toLocaleString()}</p>
                <p class="text-[11px] text-emerald-600 mt-1">Sản phẩm nhập</p>
              </div>

              <div class="bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200/80 p-4 rounded-2xl shadow-sm">
                <p class="text-xs font-bold text-sky-700 uppercase tracking-wider">TỔNG XUẤT ({selectedMonth})</p>
                <p class="text-2xl font-black text-sky-900 mt-1">{totalOut.toLocaleString()}</p>
                <p class="text-[11px] text-sky-600 mt-1">Sản phẩm xuất</p>
              </div>

              <div class="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200/80 p-4 rounded-2xl shadow-sm">
                <p class="text-xs font-bold text-teal-800 uppercase tracking-wider">TỔNG TỒN HIỆN CÓ</p>
                <p class="text-2xl font-black text-teal-900 mt-1">{totalFinal.toLocaleString()}</p>
                <p class="text-[11px] text-teal-600 mt-1">Toàn bộ 4 chi nhánh</p>
              </div>

              <div class="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 p-4 rounded-2xl shadow-sm">
                <p class="text-xs font-bold text-amber-700 uppercase tracking-wider">SỐ CHI NHÁNH</p>
                <p class="text-2xl font-black text-amber-900 mt-1">{branches.length}</p>
                <p class="text-[11px] text-amber-600 mt-1">Hà Nội, ĐN, HCM, CT</p>
              </div>

              <div class="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/80 p-4 rounded-2xl shadow-sm col-span-2 md:col-span-1">
                <p class="text-xs font-bold text-purple-700 uppercase tracking-wider">SỐ MÃ VẬT TƯ</p>
                <p class="text-2xl font-black text-purple-900 mt-1">{items.length}</p>
                <p class="text-[11px] text-purple-600 mt-1">SKU quản lý</p>
              </div>
            </div>

            {/* Filter Bar */}
            <div class="bg-white p-4 rounded-2xl border border-teal-100 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div class="flex flex-wrap items-center gap-3">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold text-slate-600">Tháng:</span>
                  <select
                    value={selectedMonth}
                    onChange={e => setSelectedMonth(e.target.value)}
                    class="bg-sky-50 border border-sky-300 rounded-lg text-xs font-bold px-3 py-1.5 text-sky-900 focus:outline-none"
                  >
                    {months.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold text-slate-600">Chi nhánh:</span>
                  <select
                    value={selectedBranch}
                    onChange={e => setSelectedBranch(e.target.value)}
                    class="bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold px-3 py-1.5 text-slate-800 focus:outline-none"
                  >
                    <option value="all">Tất cả (4 chi nhánh)</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div class="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="🔍 Tìm mã hoặc tên vật tư..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  class="w-full pl-3 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Main Table: Bảng Chi Tiết Tồn Kho */}
            <div class="bg-white rounded-2xl border border-teal-100 shadow-sm overflow-hidden">
              <div class="px-5 py-4 border-b border-teal-50 flex items-center justify-between">
                <div>
                  <h2 class="font-bold text-slate-800 text-base">
                    BẢNG TỔNG HỢP NHẬP - XUẤT - TỒN ({selectedMonth})
                  </h2>
                  <p class="text-xs text-slate-500">
                    Công thức: Tồn cuối = Tồn đầu + Nhập - Xuất (Tự động cập nhật ngay lập tức)
                  </p>
                </div>
                <span class="text-xs font-bold px-3 py-1 bg-teal-50 text-teal-700 rounded-full border border-teal-200">
                  Tự động chuyển tồn sang tháng sau
                </span>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs text-slate-700">
                  <thead class="bg-teal-50/70 text-slate-700 font-bold border-b border-teal-100">
                    <tr>
                      <th class="py-3 px-4">MÃ VẬT TƯ</th>
                      <th class="py-3 px-4">TÊN VẬT TƯ</th>
                      <th class="py-3 px-3">ĐVT</th>
                      <th class="py-3 px-3">CHI NHÁNH</th>
                      <th class="py-3 px-3 text-right">TỒN ĐẦU</th>
                      <th class="py-3 px-3 text-right text-emerald-700">NHẬP (+)</th>
                      <th class="py-3 px-3 text-right text-sky-700">XUẤT (-)</th>
                      <th class="py-3 px-4 text-right text-teal-900 font-black">TỒN CUỐI</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    {currentMonthRecs
                      .filter(r => selectedBranch === 'all' || r.branchId === selectedBranch)
                      .filter(r => {
                        if (!searchTerm) return true;
                        const it = items.find(i => i.code === r.itemCode);
                        const str = (r.itemCode + ' ' + (it ? it.name : '')).toLowerCase();
                        return str.includes(searchTerm.toLowerCase());
                      })
                      .map((r, idx) => {
                        const item = items.find(i => i.code === r.itemCode);
                        const branch = branches.find(b => b.id === r.branchId);
                        return (
                          <tr key={idx} class="hover:bg-teal-50/30 transition">
                            <td class="py-2.5 px-4 font-mono font-bold text-teal-800">{r.itemCode}</td>
                            <td class="py-2.5 px-4 font-medium">{item ? item.name : r.itemCode}</td>
                            <td class="py-2.5 px-3 text-slate-500">{item ? item.unit : 'Cái'}</td>
                            <td class="py-2.5 px-3 font-semibold text-slate-600">{branch ? branch.name : r.branchId}</td>
                            <td class="py-2.5 px-3 text-right font-medium text-slate-600">{r.initialStock.toLocaleString()}</td>
                            <td class="py-2.5 px-3 text-right font-bold text-emerald-600">+{r.inQty.toLocaleString()}</td>
                            <td class="py-2.5 px-3 text-right font-bold text-sky-600">-{r.outQty.toLocaleString()}</td>
                            <td class="py-2.5 px-4 text-right font-black text-teal-900 bg-teal-50/40">{r.finalStock.toLocaleString()}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Inbound Modal */}
            {showInboundModal && (
              <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                  <div class="flex justify-between items-center border-b pb-3">
                    <h3 class="font-bold text-base text-emerald-800">⬆️ LẬP PHIẾU NHẬP KHO</h3>
                    <button onClick={() => setShowInboundModal(false)} class="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
                  </div>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.target);
                    const itemCode = fd.get('itemCode');
                    const branchId = fd.get('branchId');
                    const qty = Number(fd.get('quantity'));
                    const item = items.find(i => i.code === itemCode);
                    const branch = branches.find(b => b.id === branchId);

                    const newTx = {
                      id: 'tx-' + Date.now(),
                      code: 'NK-' + Date.now().toString().slice(-6),
                      type: 'IN',
                      month: fd.get('month'),
                      date: fd.get('date'),
                      branchId,
                      branchName: branch.name,
                      itemCode,
                      itemName: item.name,
                      unit: item.unit,
                      quantity: qty,
                      receiverOrDeliverer: fd.get('receiverOrDeliverer'),
                      notes: fd.get('notes'),
                      createdAt: new Date().toISOString()
                    };

                    setTransactions([...transactions, newTx]);
                    setShowInboundModal(false);
                    showNotice('✓ Đã thêm giao dịch nhập kho thành công!');
                  }} class="space-y-3 text-xs">
                    <div>
                      <label class="font-semibold block mb-1 text-slate-700">Tháng giao dịch</label>
                      <select name="month" defaultValue={selectedMonth} class="w-full border rounded-lg p-2 font-medium">
                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <label class="font-semibold block mb-1 text-slate-700">Ngày giao dịch</label>
                      <input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required class="w-full border rounded-lg p-2" />
                    </div>
                    <div>
                      <label class="font-semibold block mb-1 text-slate-700">Chi nhánh nhập</label>
                      <select name="branchId" class="w-full border rounded-lg p-2 font-medium">
                        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label class="font-semibold block mb-1 text-slate-700">Vật tư</label>
                      <select name="itemCode" class="w-full border rounded-lg p-2 font-medium">
                        {items.map(i => <option key={i.code} value={i.code}>{i.code} - {i.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label class="font-semibold block mb-1 text-slate-700">Số lượng nhập</label>
                      <input name="quantity" type="number" min="1" required class="w-full border rounded-lg p-2 font-bold text-emerald-800" placeholder="Nhập số lượng" />
                    </div>
                    <div>
                      <label class="font-semibold block mb-1 text-slate-700">Người giao / Nguồn hàng</label>
                      <input name="receiverOrDeliverer" class="w-full border rounded-lg p-2" placeholder="Ví dụ: Xưởng may Hà Nhung" />
                    </div>
                    <div>
                      <label class="font-semibold block mb-1 text-slate-700">Ghi chú</label>
                      <input name="notes" class="w-full border rounded-lg p-2" placeholder="Ghi chú giao dịch" />
                    </div>

                    <div class="flex gap-2 pt-3">
                      <button type="button" onClick={() => setShowInboundModal(false)} class="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold">Hủy</button>
                      <button type="submit" class="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold">Lưu nhập kho</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Outbound Modal */}
            {showOutboundModal && (
              <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                  <div class="flex justify-between items-center border-b pb-3">
                    <h3 class="font-bold text-base text-sky-800">⬇️ LẬP PHIẾU XUẤT KHO</h3>
                    <button onClick={() => setShowOutboundModal(false)} class="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
                  </div>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.target);
                    const itemCode = fd.get('itemCode');
                    const branchId = fd.get('branchId');
                    const qty = Number(fd.get('quantity'));
                    const month = fd.get('month');
                    const item = items.find(i => i.code === itemCode);
                    const branch = branches.find(b => b.id === branchId);

                    // Check stock limit warning
                    const currentRec = (stockRecords[month] || []).find(r => r.itemCode === itemCode && r.branchId === branchId);
                    const avail = currentRec ? currentRec.finalStock : 0;
                    if (qty > avail) {
                      if (!confirm('⚠️ CẢNH BÁO: Số lượng xuất (' + qty + ') vượt quá tồn kho hiện có (' + avail + '). Bạn có chắc chắn muốn xuất nợ kho không?')) {
                        return;
                      }
                    }

                    const newTx = {
                      id: 'tx-' + Date.now(),
                      code: 'XK-' + Date.now().toString().slice(-6),
                      type: 'OUT',
                      month,
                      date: fd.get('date'),
                      branchId,
                      branchName: branch.name,
                      itemCode,
                      itemName: item.name,
                      unit: item.unit,
                      quantity: qty,
                      receiverOrDeliverer: fd.get('receiverOrDeliverer'),
                      notes: fd.get('notes'),
                      createdAt: new Date().toISOString()
                    };

                    setTransactions([...transactions, newTx]);
                    setShowOutboundModal(false);
                    showNotice('✓ Đã thêm giao dịch xuất kho thành công!');
                  }} class="space-y-3 text-xs">
                    <div>
                      <label class="font-semibold block mb-1 text-slate-700">Tháng giao dịch</label>
                      <select name="month" defaultValue={selectedMonth} class="w-full border rounded-lg p-2 font-medium">
                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <label class="font-semibold block mb-1 text-slate-700">Ngày giao dịch</label>
                      <input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required class="w-full border rounded-lg p-2" />
                    </div>
                    <div>
                      <label class="font-semibold block mb-1 text-slate-700">Chi nhánh xuất</label>
                      <select name="branchId" class="w-full border rounded-lg p-2 font-medium">
                        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label class="font-semibold block mb-1 text-slate-700">Vật tư xuất</label>
                      <select name="itemCode" class="w-full border rounded-lg p-2 font-medium">
                        {items.map(i => <option key={i.code} value={i.code}>{i.code} - {i.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label class="font-semibold block mb-1 text-slate-700">Số lượng xuất</label>
                      <input name="quantity" type="number" min="1" required class="w-full border rounded-lg p-2 font-bold text-sky-800" placeholder="Nhập số lượng xuất" />
                    </div>
                    <div>
                      <label class="font-semibold block mb-1 text-slate-700">Người nhận / Đơn vị nhận</label>
                      <input name="receiverOrDeliverer" class="w-full border rounded-lg p-2" placeholder="Ví dụ: Team Sales HCM" />
                    </div>
                    <div>
                      <label class="font-semibold block mb-1 text-slate-700">Ghi chú</label>
                      <input name="notes" class="w-full border rounded-lg p-2" placeholder="Lý do xuất kho" />
                    </div>

                    <div class="flex gap-2 pt-3">
                      <button type="button" onClick={() => setShowOutboundModal(false)} class="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold">Hủy</button>
                      <button type="submit" class="flex-1 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold">Lưu xuất kho</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Item Modal */}
            {showItemModal && (
              <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                  <div class="flex justify-between items-center border-b pb-3">
                    <h3 class="font-bold text-base text-teal-800">➕ THÊM VẬT TƯ MỚI</h3>
                    <button onClick={() => setShowItemModal(false)} class="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
                  </div>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.target);
                    const code = String(fd.get('code')).trim().toUpperCase();
                    if (items.some(i => i.code === code)) {
                      alert('Mã vật tư này đã tồn tại!');
                      return;
                    }
                    const newItem = {
                      id: 'it-' + Date.now(),
                      code,
                      name: String(fd.get('name')).trim(),
                      unit: String(fd.get('unit')).trim(),
                      category: String(fd.get('category')).trim(),
                      status: 'active',
                      minStockAlert: Number(fd.get('minStockAlert')) || 20,
                      notes: String(fd.get('notes')).trim()
                    };
                    setItems([...items, newItem]);
                    setShowItemModal(false);
                    showNotice('✓ Đã thêm vật tư mới thành công!');
                  }} class="space-y-3 text-xs">
                    <div>
                      <label class="font-semibold block mb-1 text-slate-700">Mã vật tư (SKU)*</label>
                      <input name="code" required class="w-full border rounded-lg p-2 font-mono uppercase" placeholder="Ví dụ: TDC-CIC07" />
                    </div>
                    <div>
                      <label class="font-semibold block mb-1 text-slate-700">Tên vật tư*</label>
                      <input name="name" required class="w-full border rounded-lg p-2 font-medium" placeholder="Tên đầy đủ của vật tư" />
                    </div>
                    <div>
                      <label class="font-semibold block mb-1 text-slate-700">Đơn vị tính*</label>
                      <input name="unit" defaultValue="Cái" required class="w-full border rounded-lg p-2" placeholder="Cái, Chiếc, Bộ, Cuốn..." />
                    </div>
                    <div>
                      <label class="font-semibold block mb-1 text-slate-700">Nhóm vật tư</label>
                      <input name="category" defaultValue="Túi đeo chéo" class="w-full border rounded-lg p-2" placeholder="Túi đeo chéo, Dù, Bình giữ nhiệt..." />
                    </div>
                    <div>
                      <label class="font-semibold block mb-1 text-slate-700">Định mức tồn tối thiểu</label>
                      <input name="minStockAlert" type="number" defaultValue={20} class="w-full border rounded-lg p-2" />
                    </div>
                    <div>
                      <label class="font-semibold block mb-1 text-slate-700">Ghi chú</label>
                      <input name="notes" class="w-full border rounded-lg p-2" placeholder="Mô tả chất liệu, bảo quản..." />
                    </div>

                    <div class="flex gap-2 pt-3">
                      <button type="button" onClick={() => setShowItemModal(false)} class="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold">Hủy</button>
                      <button type="submit" class="flex-1 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold">Thêm vật tư</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </main>

          {/* Footer */}
          <footer class="bg-white border-t border-teal-100 py-4 text-center text-xs text-slate-600">
            <p class="font-bold text-teal-800">
              Version Made by Ha Nhung logistic | Hotline: 0901601600
            </p>
            <p class="text-[11px] text-slate-400 mt-0.5">
              Hệ thống quản lý hàng tồn kho Team CIC • File chạy trực tiếp không cần cài đặt
            </p>
          </footer>
        </div>
      );
    }

    ReactDOM.createRoot(document.getElementById('root')).render(<App />);
  </script>
</body>
</html>`;
};

export const downloadStandaloneHtmlFile = () => {
  const content = generateStandaloneHtml();
  const blob = new Blob([content], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'inventory-cic.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
