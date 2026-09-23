import React from 'react';
import { ArrowDownToLine, ArrowUpFromLine, Layers, Building2, Boxes, TrendingUp } from 'lucide-react';

interface KpiCardsProps {
  totalIn: number;
  totalOut: number;
  totalStock: number;
  branchCount: number;
  itemCount: number;
  selectedMonth: string;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  totalIn,
  totalOut,
  totalStock,
  branchCount,
  itemCount,
  selectedMonth
}) => {
  const turnoverRatio = totalIn > 0 ? ((totalOut / totalIn) * 100).toFixed(1) : '0.0';

  const cards = [
    {
      title: 'TỔNG NHẬP',
      subtitle: `Tháng ${selectedMonth}`,
      value: totalIn.toLocaleString('vi-VN'),
      unit: 'sản phẩm',
      icon: ArrowDownToLine,
      bgGradient: 'from-[#E8F5E9] to-[#C8E6C9]', // Pastel soft green
      borderColor: 'border-emerald-200',
      iconBg: 'bg-emerald-500 text-white',
      titleColor: 'text-emerald-800',
      valueColor: 'text-emerald-950',
      desc: '+ Luân chuyển kho đầu kỳ'
    },
    {
      title: 'TỔNG XUẤT',
      subtitle: `Tháng ${selectedMonth}`,
      value: totalOut.toLocaleString('vi-VN'),
      unit: 'sản phẩm',
      icon: ArrowUpFromLine,
      bgGradient: 'from-[#E1F5FE] to-[#B3E5FC]', // Pastel sky blue
      borderColor: 'border-sky-200',
      iconBg: 'bg-sky-500 text-white',
      titleColor: 'text-sky-800',
      valueColor: 'text-sky-950',
      desc: `Tỷ lệ xuất/nhập: ${turnoverRatio}%`
    },
    {
      title: 'TỔNG TỒN KHO',
      subtitle: 'Hiện có toàn hệ thống',
      value: totalStock.toLocaleString('vi-VN'),
      unit: 'sản phẩm',
      icon: Boxes,
      bgGradient: 'from-[#E0F2F1] to-[#B2DFDB]', // Pastel mint / teal
      borderColor: 'border-teal-200',
      iconBg: 'bg-[#00897B] text-white',
      titleColor: 'text-teal-900',
      valueColor: 'text-teal-950',
      desc: 'Tồn cuối kỳ = Tồn đầu + Nhập - Xuất'
    },
    {
      title: 'SỐ CHI NHÁNH',
      subtitle: 'Hà Nội, ĐN, HCM, Cần Thơ',
      value: branchCount.toString(),
      unit: 'chi nhánh',
      icon: Building2,
      bgGradient: 'from-[#FFF8E1] to-[#FFECB3]', // Pastel soft amber
      borderColor: 'border-amber-200',
      iconBg: 'bg-amber-500 text-white',
      titleColor: 'text-amber-800',
      valueColor: 'text-amber-950',
      desc: 'Hỗ trợ mở rộng thêm chi nhánh'
    },
    {
      title: 'SỐ MÃ VẬT TƯ',
      subtitle: 'Túi chéo, Dù, Bình nhiệt...',
      value: itemCount.toString(),
      unit: 'mã SKU',
      icon: Layers,
      bgGradient: 'from-[#F3E5F5] to-[#E1BEE7]', // Pastel soft purple
      borderColor: 'border-purple-200',
      iconBg: 'bg-purple-500 text-white',
      titleColor: 'text-purple-800',
      valueColor: 'text-purple-950',
      desc: 'Quản lý theo định mức tồn kho'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-2xl bg-gradient-to-br ${card.bgGradient} border ${card.borderColor} shadow-xs hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between`}
          >
            {/* Top Row: Title + Icon */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className={`text-[11px] font-extrabold uppercase tracking-wider ${card.titleColor}`}>
                  {card.title}
                </span>
                <p className="text-[11px] text-slate-500 font-medium">
                  {card.subtitle}
                </p>
              </div>
              <div className={`w-8 h-8 rounded-xl ${card.iconBg} flex items-center justify-center flex-shrink-0 shadow-2xs`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            {/* Middle Row: Value */}
            <div className="mt-3">
              <div className="flex items-baseline gap-1.5">
                <span className={`text-2xl sm:text-3xl font-black tracking-tight ${card.valueColor}`}>
                  {card.value}
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  {card.unit}
                </span>
              </div>
            </div>

            {/* Bottom Row: Note */}
            <div className="mt-2.5 pt-2 border-t border-black/5 text-[11px] text-slate-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-slate-400" />
              <span className="truncate">{card.desc}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
