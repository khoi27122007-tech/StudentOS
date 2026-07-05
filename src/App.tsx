import { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import Navigation, { type TabId } from './components/Navigation';
import Auth from './components/Auth';
import LifeDashboard from './components/LifeDashboard';
import Timetable from './components/Timetable';
import TasksManager from './components/TasksManager';
import TimeTracker from './components/TimeTracker';
import HealthTracker from './components/HealthTracker';
import Gamification from './components/Gamification';
import AiAssistant from './components/AiAssistant';
import SemesterSimulator from './components/SemesterSimulator';
import BudgetTracker from './components/BudgetTracker';
import GpaPredictor from './components/GpaPredictor';
import SettingsDrawer from './components/SettingsDrawer';
import { Flame, Laptop, Sparkles, LogOut } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const { user, currentUserEmail, checkStreak, logout } = useStore();

  // Check login activity and study streak on mount
  useEffect(() => {
    if (currentUserEmail) {
      checkStreak();
    }
  }, [currentUserEmail, checkStreak]);

  // Auth Guard Routing: Show Auth gate if not logged in
  if (!currentUserEmail) {
    return <Auth />;
  }

  // Render correct content pane based on selected tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <LifeDashboard onNavigate={(tab) => setActiveTab(tab)} />;
      case 'schedule':
        return <Timetable />;
      case 'tasks':
        return <TasksManager />;
      case 'tracker':
        return <TimeTracker />;
      case 'health':
        return <HealthTracker />;
      case 'game':
        return <Gamification />;
      case 'ai':
        return <AiAssistant />;
      case 'simulator':
        return <SemesterSimulator />;
      case 'budget':
        return <BudgetTracker />;
      case 'gpa':
        return <GpaPredictor />;
      case 'settings':
        return <SettingsDrawer />;
      default:
        return <LifeDashboard onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  const xpNeeded = user.level * 300;
  const xpPercentage = Math.min(100, Math.round((user.exp / xpNeeded) * 100));

  return (
    <div className="flex flex-col min-h-screen pb-28 bg-[#030014] text-slate-100 antialiased">
      {/* Animated background nodes */}
      <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[80vw] h-[80vw] rounded-full bg-purple-900/15 blur-[120px] animate-pulse" style={{ animationDuration: '15s' }}></div>
        <div className="absolute -bottom-[30%] -right-[10%] w-[70vw] h-[70vw] rounded-full bg-indigo-900/15 blur-[100px] animate-pulse" style={{ animationDuration: '20s' }}></div>
        <div className="absolute top-[30%] left-[40%] w-[35vw] h-[35vw] rounded-full bg-pink-900/10 blur-[90px] animate-pulse" style={{ animationDuration: '12s' }}></div>
        
        {/* Tech Grid background overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      {/* Liquid Glass Global Header */}
      <header className="sticky top-0 z-40 w-full bg-slate-950/40 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 via-pink-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20 active:scale-95 transition-transform duration-300">
            <Laptop className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent m-0 tracking-tight leading-none">
              StudentOS
            </h1>
            <span className="text-[9px] text-slate-500 font-semibold tracking-widest block uppercase mt-0.5">STUDENT WORKSPACE</span>
          </div>
        </div>

        {/* User Quickbar info */}
        <div className="flex items-center gap-6">
          {/* XP & Level progress bar */}
          <div className="hidden md:flex flex-col items-end gap-1 select-none">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
              <Sparkles size={11} className="text-purple-400 animate-pulse" />
              <span>LV.{user.level} PROGRESS</span>
              <span className="text-white font-mono">{user.exp}/{xpNeeded} XP</span>
            </div>
            
            <div className="w-40 bg-slate-800/80 rounded-full h-1.5 border border-white/5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${xpPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Quick Stats badges */}
          <div className="flex items-center gap-3">
            {/* Streak */}
            <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-200">
              <Flame size={14} className="fill-amber-500 text-amber-500 animate-pulse" />
              <span>{user.streak} ngày</span>
            </div>

            {/* Level Selector/Indicator link */}
            <div 
              onClick={() => setActiveTab('game')}
              className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-200 cursor-pointer hover:bg-purple-500/20 transition-all animate-fade-in"
            >
              <span className="text-base leading-none">{user.avatar}</span>
              <span>LV.{user.level}</span>
            </div>

            {/* Logout button */}
            <button
              onClick={() => {
                if (confirm('🔒 Bạn muốn đăng xuất khỏi StudentOS?')) {
                  logout();
                }
              }}
              className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Pane */}
      <main className="flex-1 w-full relative z-10">
        {renderTabContent()}
      </main>

      {/* Floating IOS Navigation Dock */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;
