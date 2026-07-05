import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';
import { CreditCard, Plus, Trash2, ShieldAlert, Sparkles } from 'lucide-react';

const CATEGORY_COLORS = {
  food: '#ef4444', // red
  study: '#3b82f6', // blue
  coffee: '#b45309', // amber/brown
  transport: '#10b981', // emerald
  other: '#a855f7' // purple
};

const CATEGORY_LABELS = {
  food: 'Ăn uống 🍔',
  study: 'Học tập 📚',
  coffee: 'Cà phê ☕',
  transport: 'Đi lại 🚗',
  other: 'Khác 🛍️'
};

export const BudgetTracker: React.FC = () => {
  const { expenses, budgetLimit, setBudgetLimit, addExpense, deleteExpense } = useStore();
  
  // Form states
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<'food' | 'study' | 'coffee' | 'transport' | 'other'>('food');
  const [note, setNote] = useState('');
  const [tempLimit, setTempLimit] = useState(budgetLimit.toString());

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const monthExpenses = expenses
    .filter((e) => e.date.startsWith(currentMonth))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalSpent = monthExpenses.reduce((acc, e) => acc + e.amount, 0);
  const percentage = Math.round((totalSpent / budgetLimit) * 100);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(amount);
    if (isNaN(val) || val <= 0) return;

    addExpense({
      amount: val,
      category,
      note: note || CATEGORY_LABELS[category],
      date: new Date().toISOString().split('T')[0]
    });

    setAmount('');
    setNote('');
    alert('💸 Đã ghi nhận khoản chi tiêu!');
  };

  const handleUpdateLimit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(tempLimit);
    if (!isNaN(val) && val > 0) {
      setBudgetLimit(val);
      alert('⚙️ Đã cập nhật hạn mức chi tiêu tháng!');
    }
  };

  // Group by category to build pie charts
  const categoryTotals = monthExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  // Render SVG Pie Chart angles
  let cumulativeAngle = 0;
  const pieSlices = Object.entries(categoryTotals).map(([cat, val]) => {
    const percent = val / (totalSpent || 1);
    const angle = percent * 360;
    const slice = {
      category: cat as keyof typeof CATEGORY_LABELS,
      value: val,
      percent: Math.round(percent * 100),
      startAngle: cumulativeAngle,
      endAngle: cumulativeAngle + angle,
      color: CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS]
    };
    cumulativeAngle += angle;
    return slice;
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pt-6 pb-24 space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">
          <CreditCard size={28} className="text-purple-400" />
          Budget Mode (Quản lý chi tiêu)
        </h2>
        <p className="text-slate-400 text-sm">Quản lý quỹ ngân sách sinh viên tự động và phân loại tiêu dùng trực quan.</p>
      </div>

      {/* Threshold warnings */}
      {percentage >= 85 && (
        <div className="flex items-center gap-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.15)] animate-pulse">
          <ShieldAlert className="text-amber-500 shrink-0" size={24} />
          <div>
            <h4 className="font-semibold text-amber-200 text-sm md:text-base">Cảnh báo hạn mức ví ("AI Budget Alert")!</h4>
            <p className="text-xs text-amber-300/80">
              Tháng này bạn đã tiêu <strong className="text-white">{percentage}% ({totalSpent.toLocaleString()}đ)</strong> ngân sách đề ra. Hãy cân nhắc chi tiêu tiết kiệm hơn để tránh thiếu hụt cuối tháng!
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Log Expenses Form */}
        <div className="space-y-6">
          <GlassCard className="space-y-4">
            <h3 className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Plus size={16} className="text-purple-400" />
              Ghi Khoản Chi Tiêu Mới
            </h3>

            <form onSubmit={handleAddExpense} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Số tiền (VNĐ)</label>
                <input
                  type="number"
                  required
                  placeholder="Ví dụ: 50000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full glass-input text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Phân loại chi</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full glass-input text-sm"
                >
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key} className="bg-slate-900">{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Ghi chú nhanh</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Ăn trưa bún chả"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full glass-input text-sm"
                />
              </div>

              <GlassButton type="submit" variant="purple" fullWidth className="mt-2">
                Lưu Giao Dịch
              </GlassButton>
            </form>
          </GlassCard>

          {/* Budget Limit Config Card */}
          <GlassCard className="space-y-4">
            <h3 className="font-semibold text-slate-200">Cài đặt Hạn Mức Tháng</h3>
            <form onSubmit={handleUpdateLimit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Hạn mức chi tối đa (VNĐ)</label>
                <input
                  type="number"
                  value={tempLimit}
                  onChange={(e) => setTempLimit(e.target.value)}
                  className="w-full glass-input text-sm"
                />
              </div>
              <GlassButton type="submit" variant="secondary" fullWidth size="sm">
                Cập Nhật Hạn Mức
              </GlassButton>
            </form>
          </GlassCard>
        </div>

        {/* Center: Dynamic Category Pie Chart */}
        <div className="space-y-6">
          <GlassCard glowColor="pink" className="flex flex-col items-center justify-center py-6 h-full min-h-[300px]">
            <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-1.5">
              <Sparkles size={16} className="text-pink-400" />
              Cơ Cấu Chi Tiêu
            </h3>

            {totalSpent === 0 ? (
              <div className="text-slate-500 text-xs text-center my-auto py-12">
                Không có dữ liệu chi tiêu trong tháng này.
              </div>
            ) : (
              <div className="space-y-6 flex-1 flex flex-col items-center justify-center w-full">
                {/* SVG Visual Pie chart representation */}
                <div className="relative w-40 h-40">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    {pieSlices.map((slice, idx) => {
                      // Calculate coordinates for SVG paths
                      const x1 = 50 + 40 * Math.cos((slice.startAngle * Math.PI) / 180);
                      const y1 = 50 + 40 * Math.sin((slice.startAngle * Math.PI) / 180);
                      const x2 = 50 + 40 * Math.cos((slice.endAngle * Math.PI) / 180);
                      const y2 = 50 + 40 * Math.sin((slice.endAngle * Math.PI) / 180);
                      
                      const largeArcFlag = slice.endAngle - slice.startAngle > 180 ? 1 : 0;
                      
                      const pathData = `
                        M 50 50
                        L ${x1} ${y1}
                        A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}
                        Z
                      `;
                      return (
                        <path 
                          key={idx}
                          d={pathData}
                          fill={slice.color}
                          stroke="rgba(3,0,20,0.5)"
                          strokeWidth="1"
                          className="hover:opacity-90 transition-opacity cursor-pointer"
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute inset-8 rounded-full bg-slate-950/90 border border-white/5 flex items-center justify-center flex-col">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Tổng</span>
                    <span className="text-xs font-extrabold text-white text-neon-pink">{(totalSpent / 1000).toFixed(0)}k</span>
                  </div>
                </div>

                {/* Pie legend */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] w-full px-4">
                  {pieSlices.map((slice, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded" style={{ backgroundColor: slice.color }}></span>
                      <span className="text-slate-300 truncate">
                        {CATEGORY_LABELS[slice.category]}: {slice.percent}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right Column: Transaction History */}
        <div className="space-y-6">
          <GlassCard className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="font-semibold text-slate-200">Lịch Sử Giao Dịch</h3>
              <span className="text-xs text-slate-400">Tháng này</span>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[300px] pr-1">
              {monthExpenses.length === 0 ? (
                <div className="text-slate-500 text-xs text-center py-12">
                  Chưa ghi nhận khoản chi tiêu nào.
                </div>
              ) : (
                monthExpenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-3 rounded-xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-colors flex justify-between items-center text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-200">{exp.note}</strong>
                        <span 
                          style={{ backgroundColor: `${CATEGORY_COLORS[exp.category]}15`, color: CATEGORY_COLORS[exp.category] }}
                          className="px-1.5 py-0.2 rounded text-[9px] font-semibold border border-white/5"
                        >
                          {CATEGORY_LABELS[exp.category].split(' ').slice(0,-1).join('')}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">{exp.date}</span>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <span className="font-bold text-white text-sm">-{exp.amount.toLocaleString()}đ</span>
                      <button
                        onClick={() => deleteExpense(exp.id)}
                        className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition-colors"
                        title="Xóa giao dịch"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
export default BudgetTracker;
