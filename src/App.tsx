import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Item, 
  Branch, 
  Transaction, 
  BaselineStock, 
  GoogleSheetsConfig, 
  ActiveTab 
} from './types/inventory';
import { 
  loadInitialState, 
  saveState, 
  computeAllStockRecords, 
  generateTransactionCode, 
  resetToSampleData 
} from './utils/storage';
import { exportToExcel, exportToCsv } from './utils/excel';
import { syncToGoogleSheets } from './utils/googleSheets';
import { downloadStandaloneHtmlFile } from './utils/singleFileGenerator';

import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { KpiCards } from './components/KpiCards';
import { FilterBar } from './components/FilterBar';
import { ChartsSection } from './components/ChartsSection';
import { InventoryTable } from './components/InventoryTable';
import { MonthlyMatrixReport } from './components/MonthlyMatrixReport';
import { TransactionList } from './components/TransactionList';
import { ItemCatalog } from './components/ItemCatalog';
import { Footer } from './components/Footer';
import { Toast, ToastMessage } from './components/Toast';

import { InboundModal } from './components/Modals/InboundModal';
import { OutboundModal } from './components/Modals/OutboundModal';
import { ItemModal } from './components/Modals/ItemModal';
import { AddMonthModal } from './components/Modals/AddMonthModal';
import { ExcelImportModal } from './components/Modals/ExcelImportModal';
import { GoogleSheetModal } from './components/Modals/GoogleSheetModal';
import { BranchModal } from './components/Modals/BranchModal';
import { ConfirmDeleteModal } from './components/Modals/ConfirmDeleteModal';

export const App: React.FC = () => {
  // 1. Core State
  const [initialData] = useState(() => loadInitialState());
  const [items, setItems] = useState<Item[]>(initialData.items);
  const [branches, setBranches] = useState<Branch[]>(initialData.branches);
  const [months, setMonths] = useState<string[]>(initialData.months);
  const [selectedMonth, setSelectedMonth] = useState<string>(initialData.selectedMonth);
  const [transactions, setTransactions] = useState<Transaction[]>(initialData.transactions);
  const [baselineStock, setBaselineStock] = useState<BaselineStock[]>(initialData.baselineStock);
  const [googleSheetsConfig, setGoogleSheetsConfig] = useState<GoogleSheetsConfig>(initialData.googleSheetsConfig);

  // 2. UI & Filter State
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'in' | 'out' | 'stock'>('all');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);

  // 3. Modals State
  const [isInboundOpen, setIsInboundOpen] = useState(false);
  const [isOutboundOpen, setIsOutboundOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isAddMonthOpen, setIsAddMonthOpen] = useState(false);
  const [isExcelImportOpen, setIsExcelImportOpen] = useState(false);
  const [isGoogleSheetOpen, setIsGoogleSheetOpen] = useState(false);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);

  // Edit states
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  // Delete confirm modal state
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'transaction' | 'item' | 'branch';
    data: any;
    title: string;
    message: string;
  } | null>(null);

  // 4. Persistence to LocalStorage on change
  useEffect(() => {
    saveState({
      items,
      branches,
      months,
      selectedMonth,
      transactions,
      baselineStock,
      googleSheetsConfig
    });
  }, [items, branches, months, selectedMonth, transactions, baselineStock, googleSheetsConfig]);

  // Toast Helper
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // 5. Compute Stock Records
  const stockRecords = useMemo(() => {
    return computeAllStockRecords(months, items, branches, baselineStock, transactions);
  }, [months, items, branches, baselineStock, transactions]);

  // KPI aggregates for current selectedMonth
  const currentMonthRecords = useMemo(() => {
    return stockRecords[selectedMonth] || [];
  }, [stockRecords, selectedMonth]);

  const totalIn = useMemo(() => {
    return currentMonthRecords.reduce((sum, r) => sum + r.inQty, 0);
  }, [currentMonthRecords]);

  const totalOut = useMemo(() => {
    return currentMonthRecords.reduce((sum, r) => sum + r.outQty, 0);
  }, [currentMonthRecords]);

  const totalStock = useMemo(() => {
    return currentMonthRecords.reduce((sum, r) => sum + r.finalStock, 0);
  }, [currentMonthRecords]);

  const inboundCount = useMemo(() => {
    return transactions.filter((t) => t.type === 'IN').length;
  }, [transactions]);

  const outboundCount = useMemo(() => {
    return transactions.filter((t) => t.type === 'OUT').length;
  }, [transactions]);

  // Background Auto-sync to Google Sheet if configured
  const triggerSheetAutoSync = useCallback(async (currentTx: Transaction[]) => {
    if (!googleSheetsConfig.autoSync || !googleSheetsConfig.webhookUrl) return;
    try {
      const records = computeAllStockRecords(months, items, branches, baselineStock, currentTx);
      await syncToGoogleSheets(googleSheetsConfig, {
        items,
        branches,
        months,
        transactions: currentTx,
        stockRecords: records
      });
      setGoogleSheetsConfig((prev) => ({ ...prev, lastSyncedAt: new Date().toISOString() }));
    } catch (e) {
      console.error('Auto sync error:', e);
    }
  }, [googleSheetsConfig, months, items, branches, baselineStock]);

  // --- Handlers: Transactions ---
  const handleSaveTransaction = (txData: Partial<Transaction>) => {
    if (editingTransaction) {
      // Update
      const updated = transactions.map((t) => (t.id === editingTransaction.id ? { ...t, ...txData } as Transaction : t));
      setTransactions(updated);
      showToast(`✓ Đã cập nhật phiếu ${editingTransaction.code} thành công!`);
      triggerSheetAutoSync(updated);
    } else {
      // Create new
      const code = generateTransactionCode(txData.type as 'IN' | 'OUT', txData.branchId || 'hn');
      const newTx: Transaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        code,
        type: txData.type as 'IN' | 'OUT',
        month: txData.month || selectedMonth,
        date: txData.date || new Date().toISOString().split('T')[0],
        branchId: txData.branchId || branches[0].id,
        branchName: txData.branchName || branches[0].name,
        itemCode: txData.itemCode || items[0].code,
        itemName: txData.itemName || items[0].name,
        unit: txData.unit || items[0].unit,
        quantity: Number(txData.quantity) || 0,
        receiverOrDeliverer: txData.receiverOrDeliverer || '',
        notes: txData.notes || '',
        createdAt: new Date().toISOString()
      };
      const updated = [newTx, ...transactions];
      setTransactions(updated);
      showToast(
        txData.type === 'IN'
          ? `✓ Đã tạo phiếu nhập ${code} thành công!`
          : `✓ Đã tạo phiếu xuất ${code} thành công!`
      );
      triggerSheetAutoSync(updated);
    }
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (tx: Transaction) => {
    setDeleteTarget({
      type: 'transaction',
      data: tx,
      title: `Xác nhận xóa phiếu ${tx.code}`,
      message: `Bạn có chắc chắn muốn xóa phiếu ${tx.type === 'IN' ? 'nhập' : 'xuất'} [${tx.code}] (${tx.quantity} ${tx.unit} ${tx.itemName}) không? Thao tác này sẽ tự động cập nhật lại tồn kho.`
    });
  };

  // --- Handlers: Items ---
  const handleSaveItem = (itemData: Partial<Item>) => {
    if (editingItem) {
      setItems((prev) => prev.map((it) => (it.id === editingItem.id ? { ...it, ...itemData } as Item : it)));
      showToast(`✓ Đã cập nhật thông tin vật tư ${editingItem.code}!`);
    } else {
      const newItem: Item = {
        id: `it-${Date.now()}`,
        code: itemData.code || `SKU-${Date.now()}`,
        name: itemData.name || 'Vật tư mới',
        unit: itemData.unit || 'Cái',
        category: itemData.category || 'Túi đeo chéo',
        status: itemData.status || 'active',
        minStockAlert: itemData.minStockAlert || 20,
        notes: itemData.notes || ''
      };
      setItems((prev) => [...prev, newItem]);
      showToast(`✓ Đã thêm vật tư mới [${newItem.code}] vào danh mục!`);
    }
    setEditingItem(null);
  };

  const handleDeleteItem = (item: Item) => {
    setDeleteTarget({
      type: 'item',
      data: item,
      title: `Xác nhận xóa vật tư ${item.code}`,
      message: `Bạn có chắc chắn muốn xóa vật tư [${item.code}] - ${item.name} không? Dữ liệu lịch sử giao dịch liên quan sẽ không còn được hiển thị.`
    });
  };

  // --- Handlers: Branches ---
  const handleSaveBranch = (newBranch: Branch) => {
    setBranches((prev) => [...prev, newBranch]);
    showToast(`✓ Đã thêm chi nhánh mới: ${newBranch.name}!`);
  };

  const handleDeleteBranch = (branch: Branch) => {
    if (branches.length <= 1) {
      showToast('Hệ thống phải có ít nhất 1 chi nhánh!', 'error');
      return;
    }
    setDeleteTarget({
      type: 'branch',
      data: branch,
      title: `Xác nhận xóa chi nhánh ${branch.name}`,
      message: `Bạn có chắc chắn muốn xóa chi nhánh ${branch.name} không?`
    });
  };

  // --- Handlers: Months ---
  const handleAddMonth = (newMonth: string) => {
    if (!months.includes(newMonth)) {
      const updatedMonths = [...months, newMonth];
      setMonths(updatedMonths);
      setSelectedMonth(newMonth);
      showToast(`✓ Đã tạo kỳ tháng mới: ${newMonth}! Tồn cuối tháng cũ đã được kết chuyển thành tồn đầu.`);
    }
  };

  // Confirm Delete Action
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'transaction') {
      const updated = transactions.filter((t) => t.id !== deleteTarget.data.id);
      setTransactions(updated);
      showToast(`✓ Đã xóa phiếu ${deleteTarget.data.code}`);
      triggerSheetAutoSync(updated);
    } else if (deleteTarget.type === 'item') {
      setItems((prev) => prev.filter((it) => it.id !== deleteTarget.data.id));
      showToast(`✓ Đã xóa mã vật tư ${deleteTarget.data.code}`);
    } else if (deleteTarget.type === 'branch') {
      setBranches((prev) => prev.filter((b) => b.id !== deleteTarget.data.id));
      showToast(`✓ Đã xóa chi nhánh ${deleteTarget.data.name}`);
    }

    setDeleteTarget(null);
  };

  // --- Handlers: Excel & CSV Export ---
  const handleExportExcel = () => {
    exportToExcel({
      months,
      selectedMonth,
      items,
      branches,
      stockRecords,
      transactions
    });
    showToast('✓ Đã xuất file Excel báo cáo kho hoàn chỉnh!');
  };

  const handleExportCSV = () => {
    exportToCsv(stockRecords, selectedMonth, items, branches);
    showToast('✓ Đã xuất file CSV tồn kho thành công!');
  };

  // --- Handlers: Excel Import ---
  const handleImportSuccess = (result: { newItems: Item[]; newTransactions: Transaction[]; message: string }) => {
    if (result.newItems.length > 0) {
      setItems((prev) => [...prev, ...result.newItems]);
    }
    if (result.newTransactions.length > 0) {
      setTransactions((prev) => [...result.newTransactions, ...prev]);
    }
    showToast(`✓ Nạp Excel thành công: ${result.newItems.length} SKU, ${result.newTransactions.length} phiếu!`);
  };

  // --- Handlers: Google Sheets Manual Sync ---
  const handleGoogleSheetsSyncNow = async () => {
    if (!googleSheetsConfig.webhookUrl) {
      showToast('Vui lòng cấu hình Webhook URL trước khi đồng bộ!', 'error');
      return;
    }
    setIsSyncingSheets(true);
    try {
      await syncToGoogleSheets(googleSheetsConfig, {
        items,
        branches,
        months,
        transactions,
        stockRecords
      });
      const updatedConfig = { ...googleSheetsConfig, lastSyncedAt: new Date().toISOString() };
      setGoogleSheetsConfig(updatedConfig);
      showToast('✓ Đã đồng bộ toàn bộ dữ liệu lên Google Sheet thành công!');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Lỗi khi gửi dữ liệu lên Google Sheet', 'error');
    } finally {
      setIsSyncingSheets(false);
    }
  };

  // --- Handlers: Single-file HTML Download ---
  const handleDownloadSingleHtml = () => {
    downloadStandaloneHtmlFile();
    showToast('✓ Đang tải về file "inventory-cic.html" độc lập không cần server!');
  };

  // --- Reset to Sample Data ---
  const handleResetData = () => {
    const confirmReset = window.confirm(
      '⚠️ Bạn có chắc chắn muốn khôi phục lại dữ liệu mẫu CIC ban đầu không? Mọi chỉnh sửa của bạn trên trình duyệt này sẽ được làm mới.'
    );
    if (!confirmReset) return;

    resetToSampleData();
    const fresh = loadInitialState();
    setItems(fresh.items);
    setBranches(fresh.branches);
    setMonths(fresh.months);
    setSelectedMonth(fresh.selectedMonth);
    setTransactions(fresh.transactions);
    setBaselineStock(fresh.baselineStock);
    showToast('✓ Đã khôi phục dữ liệu mẫu ban đầu!');
  };

  return (
    <div className="min-h-screen bg-[#F0FDF4]/30 text-slate-800 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      
      {/* 1. Sticky Header with Branding & Quick Actions */}
      <Header
        onOpenInbound={() => {
          setEditingTransaction(null);
          setIsInboundOpen(true);
        }}
        onOpenOutbound={() => {
          setEditingTransaction(null);
          setIsOutboundOpen(true);
        }}
        onOpenItemModal={() => {
          setEditingItem(null);
          setIsItemModalOpen(true);
        }}
        onOpenAddMonth={() => setIsAddMonthOpen(true)}
        onExportExcel={handleExportExcel}
        onExportCSV={handleExportCSV}
        onOpenExcelImport={() => setIsExcelImportOpen(true)}
        onOpenGoogleSheetSync={() => setIsGoogleSheetOpen(true)}
        onDownloadSingleHtml={handleDownloadSingleHtml}
      />

      {/* 2. Horizontal Navigation Menu */}
      <Navigation
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        inboundCount={inboundCount}
        outboundCount={outboundCount}
        itemCount={items.length}
      />

      {/* 3. Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 space-y-5">
        
        {/* Top KPI Cards (Always visible on Overview / Inventory / Reports) */}
        <KpiCards
          totalIn={totalIn}
          totalOut={totalOut}
          totalStock={totalStock}
          branchCount={branches.length}
          itemCount={items.length}
          selectedMonth={selectedMonth}
        />

        {/* Global Filter Bar */}
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          months={months}
          selectedBranch={selectedBranch}
          onBranchChange={setSelectedBranch}
          branches={branches}
          filterType={filterType}
          onFilterTypeChange={setFilterType}
          onResetFilters={() => {
            setSearchTerm('');
            setSelectedBranch('all');
            setFilterType('all');
          }}
        />

        {/* Dynamic Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <ChartsSection
              selectedMonth={selectedMonth}
              branches={branches}
              items={items}
              months={months}
              stockRecords={stockRecords}
              transactions={transactions}
            />
            <InventoryTable
              selectedMonth={selectedMonth}
              items={items}
              branches={branches}
              stockRecords={stockRecords}
              selectedBranch={selectedBranch}
              searchTerm={searchTerm}
              filterType={filterType}
            />
          </div>
        )}

        {activeTab === 'inventory' && (
          <InventoryTable
            selectedMonth={selectedMonth}
            items={items}
            branches={branches}
            stockRecords={stockRecords}
            selectedBranch={selectedBranch}
            searchTerm={searchTerm}
            filterType={filterType}
          />
        )}

        {activeTab === 'inbound' && (
          <TransactionList
            type="IN"
            transactions={transactions}
            branches={branches}
            items={items}
            months={months}
            selectedMonth={selectedMonth}
            onOpenCreate={() => {
              setEditingTransaction(null);
              setIsInboundOpen(true);
            }}
            onEditTransaction={(tx) => {
              setEditingTransaction(tx);
              setIsInboundOpen(true);
            }}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {activeTab === 'outbound' && (
          <TransactionList
            type="OUT"
            transactions={transactions}
            branches={branches}
            items={items}
            months={months}
            selectedMonth={selectedMonth}
            onOpenCreate={() => {
              setEditingTransaction(null);
              setIsOutboundOpen(true);
            }}
            onEditTransaction={(tx) => {
              setEditingTransaction(tx);
              setIsOutboundOpen(true);
            }}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <MonthlyMatrixReport
              months={months}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              items={items}
              branches={branches}
              stockRecords={stockRecords}
            />
            <InventoryTable
              selectedMonth={selectedMonth}
              items={items}
              branches={branches}
              stockRecords={stockRecords}
              selectedBranch={selectedBranch}
              searchTerm={searchTerm}
              filterType={filterType}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <ChartsSection
            selectedMonth={selectedMonth}
            branches={branches}
            items={items}
            months={months}
            stockRecords={stockRecords}
            transactions={transactions}
          />
        )}

        {activeTab === 'catalog' && (
          <ItemCatalog
            items={items}
            branches={branches}
            onOpenCreateItem={() => {
              setEditingItem(null);
              setIsItemModalOpen(true);
            }}
            onEditItem={(it) => {
              setEditingItem(it);
              setIsItemModalOpen(true);
            }}
            onDeleteItem={handleDeleteItem}
            onOpenCreateBranch={() => setIsBranchModalOpen(true)}
            onDeleteBranch={handleDeleteBranch}
          />
        )}

      </main>

      {/* 4. Footer with branding, hotline and safe local storage indicator */}
      <Footer onResetData={handleResetData} />

      {/* 5. Modals */}
      <InboundModal
        isOpen={isInboundOpen}
        onClose={() => {
          setIsInboundOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
        items={items}
        branches={branches}
        months={months}
        defaultMonth={selectedMonth}
      />

      <OutboundModal
        isOpen={isOutboundOpen}
        onClose={() => {
          setIsOutboundOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
        items={items}
        branches={branches}
        months={months}
        defaultMonth={selectedMonth}
        stockRecords={stockRecords}
      />

      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        editingItem={editingItem}
        existingCodes={items.map((i) => i.code)}
      />

      <AddMonthModal
        isOpen={isAddMonthOpen}
        onClose={() => setIsAddMonthOpen(false)}
        onAddMonth={handleAddMonth}
        months={months}
      />

      <ExcelImportModal
        isOpen={isExcelImportOpen}
        onClose={() => setIsExcelImportOpen(false)}
        onImportSuccess={handleImportSuccess}
        existingItems={items}
        existingBranches={branches}
      />

      <GoogleSheetModal
        isOpen={isGoogleSheetOpen}
        onClose={() => setIsGoogleSheetOpen(false)}
        config={googleSheetsConfig}
        onSaveConfig={(cfg) => {
          setGoogleSheetsConfig(cfg);
          showToast('✓ Đã lưu cấu hình kết nối Google Sheet!');
          setIsGoogleSheetOpen(false);
        }}
        onSyncNow={handleGoogleSheetsSyncNow}
        isSyncing={isSyncingSheets}
      />

      <BranchModal
        isOpen={isBranchModalOpen}
        onClose={() => setIsBranchModalOpen(false)}
        onSave={handleSaveBranch}
        existingBranches={branches}
      />

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title={deleteTarget?.title}
        message={deleteTarget?.message}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* 6. Toast Notification Center */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

    </div>
  );
};

export default App;
