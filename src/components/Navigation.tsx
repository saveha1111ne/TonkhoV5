import React from 'react';
import { 
  Home, 
  Package, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Table, 
  TrendingUp, 
  Settings2
} from 'lucide-react';
import { ActiveTab } from '../types/inventory';

interface NavigationProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  inboundCount: number;
  outboundCount: number;
  itemCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onChangeTab,
  inboundCount,
  outboundCount,
  itemCount
}) => {
  const tabs = [
    { id: 'overview' as ActiveTab, label: 'Tổng quan', icon: Home },
    { id: 'inventory' as ActiveTab, label: 'Hàng tồn kho', icon: Package },
    { id: 'inbound' as ActiveTab, label: 'Nhập kho', icon: ArrowDownToLine, badge: inboundCount },
    { id: 'outbound' as ActiveTab, label: 'Xuất kho', icon: ArrowUpFromLine, badge: outboundCount },
    { id: 'reports' as ActiveTab, label: 'Báo cáo', icon: Table },
    { id: 'analytics' as ActiveTab, label: 'Phân tích', icon: TrendingUp },
    { id: 'catalog' as ActiveTab, label: 'Danh mục vật tư', icon: Settings2, badge: itemCount }
  ];

  return (
    <nav className="bg-white border-b border-teal-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex space-x-1 sm:space-x-4 overflow-x-auto no-scrollbar py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#00897B] to-[#29B6F6] text-white shadow-sm'
                    : 'text-slate-600 hover:text-teal-700 hover:bg-teal-50/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                      isActive 
                        ? 'bg-white/25 text-white' 
                        : 'bg-teal-100/70 text-teal-800'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
