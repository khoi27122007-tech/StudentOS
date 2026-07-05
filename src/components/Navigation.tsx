import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Timer,
  HeartPulse,
  Award,
  Bot,
  Sliders,
  DollarSign,
  GraduationCap,
  Settings
} from 'lucide-react';

export type TabId = 
  | 'dashboard'
  | 'schedule'
  | 'tasks'
  | 'tracker'
  | 'health'
  | 'game'
  | 'ai'
  | 'simulator'
  | 'budget'
  | 'gpa'
  | 'settings';

interface NavigationProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const items = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'schedule', label: 'Lịch học', icon: Calendar },
    { id: 'tasks', label: 'Deadline', icon: CheckSquare },
    { id: 'tracker', label: 'Tập trung', icon: Timer },
    { id: 'health', label: 'Sức khỏe', icon: HeartPulse },
    { id: 'game', label: 'Gamify', icon: Award },
    { id: 'ai', label: 'Trợ lý AI', icon: Bot },
    { id: 'simulator', label: 'Mô phỏng', icon: Sliders },
    { id: 'budget', label: 'Chi tiêu', icon: DollarSign },
    { id: 'gpa', label: 'GPA', icon: GraduationCap },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
  ] as const;

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
      <div className="glass-panel rounded-2xl px-4 py-3 flex items-center justify-around md:justify-center gap-1 md:gap-4 overflow-x-auto shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-white/10">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                relative
                flex flex-col md:flex-row items-center gap-1.5 px-3 py-2 rounded-xl
                transition-all duration-300 group
                ${isActive 
                  ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.25)]' 
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'
                }
              `}
            >
              <Icon size={18} className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-purple-400' : ''}`} />
              <span className="text-[10px] md:text-xs font-medium tracking-wide whitespace-nowrap">
                {item.label}
              </span>
              
              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900/90 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden md:block border border-white/5 whitespace-nowrap">
                {item.label}
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
export default Navigation;
