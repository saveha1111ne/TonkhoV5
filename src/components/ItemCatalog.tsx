import React, { useState } from 'react';
import { Item, Branch } from '../types/inventory';
import { Package, Plus, Edit2, Trash2, Building2, Layers, Search } from 'lucide-react';

interface ItemCatalogProps {
  items: Item[];
  branches: Branch[];
  onOpenCreateItem: () => void;
  onEditItem: (item: Item) => void;
  onDeleteItem: (item: Item) => void;
  onOpenCreateBranch: () => void;
  onDeleteBranch: (branch: Branch) => void;
}

export const ItemCatalog: React.FC<ItemCatalogProps> = ({
  items,
  branches,
  onOpenCreateItem,
  onEditItem,
  onDeleteItem,
  onOpenCreateBranch,
  onDeleteBranch
}) => {
  const [subTab, setSubTab] = useState<'items' | 'branches'>('items');
  const [search, setSearch] = useState('');

  const filteredItems = items.filter((it) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      it.code.toLowerCase().includes(s) ||
      it.name.toLowerCase().includes(s) ||
      it.category.toLowerCase().includes(s)
    );
  });

  return (
    <div className="bg-white rounded-2xl border border-teal-100 shadow-xs overflow-hidden space-y-4 p-4 sm:p-6">
      
      {/* Header & Subtabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-teal-50 pb-4">
        <div>
          <h2 className="font-extrabold text-base sm:text-lg text-slate-800 flex items-center gap-2">
            <Layers className="w-5 h-5 text-teal-600" />
            <span>DANH MỤC VẬT TƯ & CHI NHÁNH</span>
          </h2>
          <p className="text-xs text-slate-500">
            Quản lý mã hàng (SKU), định mức tồn kho và các chi nhánh hoạt động
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Subtab buttons */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-bold">
            <button
              onClick={() => setSubTab('items')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                subTab === 'items'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Vật tư ({items.length})</span>
            </button>
            <button
              onClick={() => setSubTab('branches')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                subTab === 'branches'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Chi nhánh ({branches.length})</span>
            </button>
          </div>

          {/* Action Button */}
          {subTab === 'items' ? (
            <button
              onClick={onOpenCreateItem}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>THÊM VẬT TƯ</span>
            </button>
          ) : (
            <button
              onClick={onOpenCreateBranch}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>THÊM CHI NHÁNH</span>
            </button>
          )}
        </div>
      </div>

      {/* ITEMS SUBTAB */}
      {subTab === 'items' && (
        <div className="space-y-3">
          {/* Search bar */}
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo mã SKU, tên, nhóm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-teal-100 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#E0F2F1] text-teal-950 font-extrabold border-b border-teal-200">
                <tr>
                  <th className="py-3 px-4 font-mono">MÃ VẬT TƯ (SKU)</th>
                  <th className="py-3 px-4">TÊN VẬT TƯ</th>
                  <th className="py-3 px-3">ĐƠN VỊ TÍNH</th>
                  <th className="py-3 px-3">NHÓM VẬT TƯ</th>
                  <th className="py-3 px-3 text-right">TỒN TỐI THIỂU</th>
                  <th className="py-3 px-3 text-center">TRẠNG THÁI</th>
                  <th className="py-3 px-4">GHI CHÚ / ĐẶC TÍNH</th>
                  <th className="py-3 px-3 text-center">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-teal-50/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-black text-teal-900">
                      {item.code}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 text-sm">
                      {item.name}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-600">
                      {item.unit}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[11px] font-bold border border-teal-200">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-700">
                      {item.minStockAlert || 20}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {item.status === 'active' ? 'Đang dùng' : 'Tạm dừng'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                      {item.notes || '-'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onEditItem(item)}
                          className="p-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 transition"
                          title="Sửa vật tư"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteItem(item)}
                          className="p-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition"
                          title="Xóa vật tư"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BRANCHES SUBTAB */}
      {subTab === 'branches' && (
        <div className="overflow-x-auto border border-teal-100 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#E0F2F1] text-teal-950 font-extrabold border-b border-teal-200">
              <tr>
                <th className="py-3 px-4 w-24">MÃ KHO</th>
                <th className="py-3 px-4">TÊN CHI NHÁNH</th>
                <th className="py-3 px-4">KHU VỰC</th>
                <th className="py-3 px-4">ĐỊA CHỈ KHO</th>
                <th className="py-3 px-4">HOTLINE LIÊN HỆ</th>
                <th className="py-3 px-3 text-center">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {branches.map((b) => (
                <tr key={b.id} className="hover:bg-teal-50/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-teal-900">
                    {b.code}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                    {b.name}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-teal-700">
                    {b.region}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {b.address || 'Kho hàng tiêu chuẩn CIC'}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">
                    {b.phone || '0901601600'}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    {branches.length > 1 && (
                      <button
                        onClick={() => onDeleteBranch(b)}
                        className="p-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition"
                        title="Xóa chi nhánh"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
