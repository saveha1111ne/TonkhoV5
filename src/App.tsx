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

import { 
  subscribeToItems, 
  subscribeToBranches, 
  subscribeToTransactions, 
  subscribeToMeta,
  saveItemToFirestore, 
  deleteItemFromFirestore, 
  saveBranchToFirestore, 
  deleteBranchFromFirestore, 
  saveTransactionToFirestore, 
  deleteTransactionFromFirestore, 
  saveMetaToFirestore,
  seedInitialFirestoreData,
  testFirestoreConnection,
  firebaseConfig
} from './firebase';

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
import { FirebaseModal } from './components/Modals/FirebaseModal';

export const App: React.FC = () => {
  // 1. Core State
  const [initialData] = useState(() => loadInitialState());
  const [items, setItems] = useState<Item[]>(initialData.items);
  const [branches, setBranches] = useState<Branch[]>(initialData.branches);
  const [months, setMonths] = useState<string[]>(initialData.months);
  const [selectedMonth, setSelectedMonth] = useState<string>(initialData.selectedMonth);
  const [transactions, setTransactions] = useState<Transaction[]>(initialData.transactions);
  const [baselineStock, setBaselineStock] = useState<BaselineStock>(initialData.baselineStock as any);
  const [googleSheetsConfig, setGoogleSheetsConfig] = useState<GoogleSheetsConfig>(initialData.googleSheetsConfig);

  // 2. Firebase Cloud Real-time State
  const [firebaseConnected, setFirebaseConnected] = useState(false);
  const [isFirebaseSyncing, setIsFirebaseSyncing] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);

  // 3. UI & Filter State
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'in' | 'out' | 'stock'>('all');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);

  // 4. Modals State
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

  // 5. Connect to Firebase Firestore and Setup Real-time Listeners
  useEffect(() => {
    testFirestoreConnection().then((connected) => {
      setFirebaseConnected(connected);
    });

    // Real-time Items Listener
    const unsubItems = subscribeToItems(
      (cloudItems) => {
        if (cloudItems.length > 0) {
          setItems(cloudItems);
        }
        setFirebaseConnected(true);
        setFirebaseError(null);
      },
      (err) => {
        setFirebaseError(err?.message || 'Quyền truy cập Firestore bị hạn chế');
      }
    );

    // Real-time Branches Listener
    const unsubBranches = subscribeToBranches(
      (cloudBranches) => {
        if (cloudBranches.length > 0) {
          setBranches(cloudBranches);
        }
        setFirebaseConnected(true);
      },
      (err) => {
        setFirebaseError(err?.message || 'Quyền truy cập Firestore bị hạn chế');
      }
    );

    // Real-time Transactions Listener
    const unsubTx = subscribeToTransactions(
      (cloudTx) => {
        if (cloudTx.length > 0) {
          setTransactions(cloudTx);
        }
        setFirebaseConnected(true);
      },
      (err) => {
        setFirebaseError(err?.message || 'Quyền truy cập Firestore bị hạn chế');
      }
    );

    // Real-time Meta Listener
    const unsubMeta = subscribeToMeta(
      (meta) => {
        if (meta.months && meta.months.length > 0) {
          setMonths(meta.months);
        }
        if (meta.baselineStock) {
          setBaselineStock(meta.baselineStock);
        }
        setFirebaseConnected(true);
      },
      (err) => {
        console.warn('Meta listener error:', err);
      }
    );

    // Auto-seed cloud database if completely empty
    seedInitialFirestoreData(
      initialData.items,
      initialData.branches,
      initialData.transactions,
      initialData.months,
      initialData.baselineStock as any
    ).then((seeded) => {
      if (seeded) {
        showToast('✓ Đã khởi tạo dữ liệu mẫu Team CIC lên Cloud Firestore!');
      }
    });

    return () => {
      unsubItems();
      unsubBranches();
      unsubTx();
      unsubMeta();
    };
  }, []);

  // 6. Persistence to LocalStorage on change (for seamless offline cache)
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

  // 7. Compute Stock Records
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

  // --- Handlers: Transactions (Real-time Cloud + Local) ---
  const handleSaveTransaction = async (txData: Partial<Transaction>) => {
    setIsFirebaseSyncing(true);
    try {
      if (editingTransaction) {
        // Update
        const updatedTx = { ...editingTransaction, ...txData } as Transaction;
        const updated = transactions.map((t) => (t.id === editingTransaction.id ? updatedTx : t));
        setTransactions(updated);
        await saveTransactionToFirestore(updatedTx);
        showToast(`✓ Đã cập nhật phiếu ${editingTransaction.code} lên Cloud Firestore!`);
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
        await saveTransactionToFirestore(newTx);
        showToast(
          txData.type === 'IN'
            ? `✓ Đã tạo phiếu nhập ${code} và đồng bộ lên Cloud!`
            : `✓ Đã tạo phiếu xuất ${code} và đồng bộ lên Cloud!`
        );
        triggerSheetAutoSync(updated);
      }
    } catch (err: any) {
      console.warn('Firestore write warning:', err);
      showToast('Đã lưu cục bộ vào máy (Kiểm tra lại quyền Firestore Rules nếu Cloud chưa mở)', 'info');
    } finally {
      setIsFirebaseSyncing(false);
      setEditingTransaction(null);
    }
  };

  const handleDeleteTransaction = (tx: Transaction) => {
    setDeleteTarget({
      type: 'transaction',
      data: tx,
      title: `Xác nhận xóa phiếu ${tx.code}`,
      message: `Bạn có chắc chắn muốn xóa phiếu ${tx.type === 'IN' ? 'nhập' : 'xuất'} [${tx.code}] (${tx.quantity} ${tx.unit} ${tx.itemName}) không? Thao tác này sẽ xóa trên Cloud và tự động cập nhật lại tồn kho.`
    });
  };

  // --- Handlers: Items (Real-time Cloud + Local) ---
  const handleSaveItem = async (itemData: Partial<Item>) => {
    setIsFirebaseSyncing(true);
    try {
      if (editingItem) {
        const updatedItem = { ...editingItem, ...itemData } as Item;
        setItems((prev) => prev.map((it) => (it.id === editingItem.id ? updatedItem : it)));
        await saveItemToFirestore(updatedItem);
        showToast(`✓ Đã cập nhật vật tư [${editingItem.code}] lên Cloud!`);
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
        await saveItemToFirestore(newItem);
        showToast(`✓ Đã thêm vật tư mới [${newItem.code}] lên Cloud!`);
      }
    } catch (err: any) {
      console.warn('Firestore item save error:', err);
    } finally {
      setIsFirebaseSyncing(false);
      setEditingItem(null);
    }
  };

  const handleDeleteItem = (item: Item) => {
    setDeleteTarget({
      type: 'item',
      data: item,
      title: `Xác nhận xóa vật tư ${item.code}`,
      message: `Bạn có chắc chắn muốn xóa vật tư [${item.code}] - ${item.name} khỏi Cloud và hệ thống không?`
    });
  };

  // --- Handlers: Branches (Real-time Cloud + Local) ---
  const handleSaveBranch = async (newBranch: Branch) => {
    setIsFirebaseSyncing(true);
    try {
      setBranches((prev) => [...prev, newBranch]);
      await saveBranchToFirestore(newBranch);
      showToast(`✓ Đã thêm chi nhánh mới [${newBranch.name}] lên Cloud!`);
    } catch (err) {
      console.warn('Branch save error:', err);
    } finally {
      setIsFirebaseSyncing(false);
    }
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
  const handleAddMonth = async (newMonth: string) => {
    if (!months.includes(newMonth)) {
      const updatedMonths = [...months, newMonth];
      setMonths(updatedMonths);
      setSelectedMonth(newMonth);
      try {
        await saveMetaToFirestore({ months: updatedMonths });
      } catch (e) {
        console.warn('Failed to save month to cloud:', e);
      }
      showToast(`✓ Đã tạo kỳ tháng mới: ${newMonth}! Tồn cuối tháng cũ đã được kết chuyển thành tồn đầu.`);
    }
  };

  // Confirm Delete Action
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'transaction') {
      const updated = transactions.filter((t) => t.id !== deleteTarget.data.id);
      setTransactions(updated);
      try {
        await deleteTransactionFromFirestore(deleteTarget.data.id);
      } catch (err) {
        console.warn(err);
      }
      showToast(`✓ Đã xóa phiếu ${deleteTarget.data.code}`);
      triggerSheetAutoSync(updated);
    } else if (deleteTarget.type === 'item') {
      setItems((prev) => prev.filter((it) => it.id !== deleteTarget.data.id));
      try {
        await deleteItemFromFirestore(deleteTarget.data.id);
      } catch (err) {
        console.warn(err);
      }
      showToast(`✓ Đã xóa mã vật tư ${deleteTarget.data.code}`);
    } else if (deleteTarget.type === 'branch') {
      setBranches((prev) => prev.filter((b) => b.id !== deleteTarget.data.id));
      try {
        await deleteBranchFromFirestore(deleteTarget.data.id);
      } catch (err) {
        console.warn(err);
      }
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
  const handleImportSuccess = async (result: { newItems: Item[]; newTransactions: Transaction[]; message: string }) => {
    setIsFirebaseSyncing(true);
    if (result.newItems.length > 0) {
      setItems((prev) => [...prev, ...result.newItems]);
      for (const it of result.newItems) {
        saveItemToFirestore(it).catch(console.error);
      }
    }
    if (result.newTransactions.length > 0) {
      setTransactions((prev) => [...result.newTransactions, ...prev]);
      for (const tx of result.newTransactions) {
        saveTransactionToFirestore(tx).catch(console.error);
      }
    }
    setIsFirebaseSyncing(false);
    showToast(`✓ Nạp Excel thành công: ${result.newItems.length} SKU, ${result.newTransactions.length} phiếu đã đưa lên Cloud!`);
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

  // --- Handlers: Force Push Data to Cloud ---
  const handleReseedCloud = async () => {
    setIsFirebaseSyncing(true);
    try {
      for (const item of items) {
        await saveItemToFirestore(item);
      }
      for (const branch of branches) {
        await saveBranchToFirestore(branch);
      }
      for (const tx of transactions) {
        await saveTransactionToFirestore(tx);
      }
      await saveMetaToFirestore({ months, baselineStock });
      showToast('✓ Đã tải toàn bộ dữ liệu hiện tại lên Cloud Firestore!');
    } catch (err: any) {
      showToast(`Lỗi: ${err?.message || 'Không thể ghi Firestore'}`, 'error');
    } finally {
      setIsFirebaseSyncing(false);
    }
  };

  // --- Reset to Sample Data ---
  const handleResetData = () => {
    const confirmReset = window.confirm(
      '⚠️ Bạn có chắc chắn muốn khôi phục lại dữ liệu mẫu CIC ban đầu không? Mọi chỉnh sửa cục bộ sẽ được làm mới.'
    );
    if (!confirmReset) return;

    resetToSampleData();
    const fresh = loadInitialState();
    setItems(fresh.items);
    setBranches(fresh.branches);
    setMonths(fresh.months);
    setSelectedMonth(fresh.selectedMonth);
    setTransactions(fresh.transactions);
    setBaselineStock(fresh.baselineStock as any);
    showToast('✓ Đã khôi phục dữ liệu mẫu ban đầu!');
  };

  return (
    <div className="min-h-screen bg-[#F0FDF4]/30 text-slate-800 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      
      {/* 1. Sticky Header with Branding & Cloud Status Badge */}
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
        firebaseConnected={firebaseConnected}
        isFirebaseSyncing={isFirebaseSyncing}
        onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
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
        
        {/* Top KPI Cards */}
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

      {/* 4. Footer */}
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

      <FirebaseModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
        isConnected={firebaseConnected}
        isSyncing={isFirebaseSyncing}
        errorMessage={firebaseError}
        itemCount={items.length}
        branchCount={branches.length}
        transactionCount={transactions.length}
        onReseedCloud={handleReseedCloud}
        onRefreshData={() => window.location.reload()}
      />

      {/* 6. Toast Notification Center */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

    </div>
  );
};

export default App;
