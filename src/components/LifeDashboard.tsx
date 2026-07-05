import React from 'react';
import { useStore } from '../store/useStore';
import GlassCard from './GlassCard';
import { 
  Flame, 
  GraduationCap, 
  AlertTriangle, 
  Calendar, 
  TrendingUp, 
  Clock, 
  Zap, 
  ChevronRight, 
  AlertCircle,
  HeartPulse
} from 'lucide-react';

interface LifeDashboardProps {
  onNavigate: (tab: any) => void;
}

export const LifeDashboard: React.FC<LifeDashboardProps> = ({ onNavigate }) => {
  const { courses, tasks, sessions, moods, expenses, budgetLimit, gpaModules, gpaTarget, user } = useStore();

  // 1. Calculate today's study minutes
  const todayStr = new Date().toISOString().split('T')[0];
  const todayStudyTime = sessions
    .filter(s => s.startTime.startsWith(todayStr))
    .reduce((acc, s) => acc + s.duration, 0);

  // 2. Count pending deadlines
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const urgentTasks = pendingTasks.filter(t => {
    const diff = new Date(t.deadline).getTime() - new Date().getTime();
    return diff > 0 && diff <= 2 * 24 * 60 * 60 * 1000; // less than 2 days
  });

  // 3. Today's classes
  const vietnamDay = new Date().getDay(); // 0 = Sun, 1 = Mon, etc.
  // Map JS day (0-6) to store day (1-7, 7 = Sun)
  const storeDay = vietnamDay === 0 ? 7 : vietnamDay;
  const todayClasses = courses.filter(c => 
    c.schedule.some(s => s.day === storeDay)
  );

  // 4. Burnout calculation
  const latestMood = moods[moods.length - 1];
  const sleepHours = latestMood ? latestMood.sleepHours : 7;
  const avgStudyHours = sessions.length > 0 
    ? (sessions.reduce((acc, s) => acc + s.duration, 0) / 60) / Math.max(1, new Set(sessions.map(s => s.startTime.split('T')[0])).size)
    : 1;
  const burnoutScore = Math.min(
    100,
    Math.round((avgStudyHours * 10 * 0.4) + (pendingTasks.length * 5 * 0.3) + (Math.max(0, 8 - sleepHours) * 15 * 0.3))
  );

  // 5. Budget calculation
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const monthExpenses = expenses
    .filter(e => e.date.startsWith(currentMonth))
    .reduce((acc, e) => acc + e.amount, 0);
  const budgetPercentage = Math.round((monthExpenses / budgetLimit) * 100);

  // 6. GPA calculation
  const calculateGpa = () => {
    let totalCredits = 0;
    let totalGradePoints = 0;

    gpaModules.forEach((m) => {
      const att = m.attendanceGrade ?? 10;
      const mid = m.midtermGrade ?? 10;
      const fin = m.finalGrade ?? m.expectedGrade ?? 8;
      
      const overall = (att * m.weightAttendance + mid * m.weightMidterm + fin * m.weightFinal) / 100;
      
      // Convert to 4.0 scale
      let gpa4 = 0;
      if (overall >= 8.5) gpa4 = 4.0;
      else if (overall >= 8.0) gpa4 = 3.5;
      else if (overall >= 7.0) gpa4 = 3.0;
      else if (overall >= 6.0) gpa4 = 2.5;
      else if (overall >= 5.0) gpa4 = 2.0;
      else if (overall >= 4.0) gpa4 = 1.5;
      else gpa4 = 0;

      totalCredits += m.credits;
      totalGradePoints += gpa4 * m.credits;
    });

    return totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 'N/A';
  };
  const gpaEstimate = calculateGpa();

  // 7. Deadliest Week Check
  // Count deadlines by week to find maximum stress
  const weekDeadlines: Record<string, number> = {};
  tasks.forEach(t => {
    const d = new Date(t.deadline);
    const firstDay = new Date(d.setDate(d.getDate() - d.getDay() + 1)).toISOString().split('T')[0];
    weekDeadlines[firstDay] = (weekDeadlines[firstDay] || 0) + 1;
  });
  
  let deadliestWeekDate = 'N/A';
  let maxDeadlines = 0;
  Object.entries(weekDeadlines).forEach(([week, count]) => {
    if (count > maxDeadlines) {
      maxDeadlines = count;
      deadliestWeekDate = week;
    }
  });

  const deadliestStress = Math.min(100, maxDeadlines * 25);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pt-6 pb-24 space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 glass-panel rounded-3xl border-purple-500/20 shadow-purple-950/20">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent m-0 tracking-tight">
            Xin chào, {user.name}!
          </h1>
          <p className="text-slate-400 mt-1">Hệ điều hành học tập của bạn đang trực tuyến. Hôm nay là ngày học tập tốt lành.</p>
        </div>
        
        {/* Streak & XP Badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-2xl shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <Flame className="text-amber-500 fill-amber-500 animate-bounce" size={20} />
            <span className="font-semibold text-amber-200">{user.streak} Ngày Streak</span>
          </div>
          
          <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-2xl shadow-[0_0_15px_rgba(168,85,247,0.15)]">
            <Zap className="text-purple-400" size={20} />
            <span className="font-semibold text-purple-200">LV.{user.level}</span>
          </div>
        </div>
      </div>

      {/* Grid Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Widget 1: Pomodoro Study Goal */}
        <GlassCard glowColor="purple" hoverEffect className="flex flex-col justify-between h-[220px]">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-300 flex items-center gap-2">
              <Clock size={18} className="text-purple-400" />
              Mục Tiêu Học Tập
            </h3>
            <span className="text-xs text-purple-400 bg-purple-500/15 px-2.5 py-1 rounded-full font-medium">Hôm nay</span>
          </div>
          
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-5xl font-extrabold tracking-tight text-white">{todayStudyTime}</span>
            <span className="text-slate-400">/ 240 phút</span>
          </div>
          
          <div>
            <div className="w-full bg-slate-800/50 rounded-full h-2 border border-white/5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, (todayStudyTime / 240) * 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center mt-2 text-xs text-slate-400">
              <span>Đạt {Math.round((todayStudyTime / 240) * 100)}% mục tiêu</span>
              <button onClick={() => onNavigate('tracker')} className="text-purple-400 hover:text-purple-300 flex items-center gap-0.5">
                Bắt đầu học <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Widget 2: Burnout Score */}
        <GlassCard glowColor="indigo" hoverEffect className="flex flex-col justify-between h-[220px]">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-300 flex items-center gap-2">
              <HeartPulse size={18} className="text-indigo-400" />
              Cảnh báo Kiệt sức
            </h3>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              burnoutScore > 75 ? 'text-red-400 bg-red-500/15' : 
              burnoutScore > 40 ? 'text-yellow-400 bg-yellow-500/15' : 
              'text-emerald-400 bg-emerald-500/15'
            }`}>
              {burnoutScore > 75 ? 'Nguy hiểm' : burnoutScore > 40 ? 'Cảnh giác' : 'An toàn'}
            </span>
          </div>

          <div className="my-3 flex items-baseline gap-2">
            <span className="text-5xl font-extrabold tracking-tight text-white">{burnoutScore}%</span>
            <span className="text-slate-400">chỉ số stress</span>
          </div>

          <div>
            <div className="w-full bg-slate-800/50 rounded-full h-2 border border-white/5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  burnoutScore > 75 ? 'bg-gradient-to-r from-red-500 to-pink-500' : 
                  burnoutScore > 40 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 
                  'bg-gradient-to-r from-emerald-500 to-indigo-500'
                }`}
                style={{ width: `${burnoutScore}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center mt-2 text-xs text-slate-400">
              <span>Ngủ: {sleepHours}h | Deadline: {pendingTasks.length}</span>
              <button onClick={() => onNavigate('health')} className="text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5">
                Xem chi tiết <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Widget 3: Live GPA & Budget Status */}
        <GlassCard glowColor="pink" hoverEffect className="grid grid-cols-2 gap-4 h-[220px]">
          {/* GPA block */}
          <div className="flex flex-col justify-between border-r border-white/10 pr-2">
            <div className="flex items-center gap-1.5 text-slate-300">
              <GraduationCap size={16} className="text-pink-400" />
              <span className="text-sm font-semibold">Dự kiến GPA</span>
            </div>
            <div className="my-1">
              <span className="text-3xl font-extrabold text-white text-neon-pink">{gpaEstimate}</span>
              <div className="text-[10px] text-slate-400 mt-1">Mục tiêu: {gpaTarget}</div>
            </div>
            <button onClick={() => onNavigate('gpa')} className="text-xs text-pink-400 hover:text-pink-300 flex items-center text-left mt-2">
              GPA Predictor <ChevronRight size={12} />
            </button>
          </div>

          {/* Budget block */}
          <div className="flex flex-col justify-between pl-2">
            <div className="flex items-center gap-1.5 text-slate-300">
              <TrendingUp size={16} className="text-emerald-400" />
              <span className="text-sm font-semibold">Ví Chi Tiêu</span>
            </div>
            <div className="my-1">
              <span className="text-2xl font-extrabold text-white">{budgetPercentage}%</span>
              <div className="text-[10px] text-slate-400 mt-1">Đã dùng {monthExpenses.toLocaleString()}đ</div>
            </div>
            <button onClick={() => onNavigate('budget')} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center text-left mt-2">
              Budget Mode <ChevronRight size={12} />
            </button>
          </div>
        </GlassCard>
      </div>

      {/* Deadliest Week Alarms */}
      {deadliestStress > 50 && (
        <div className="flex items-center gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl shadow-[0_0_20px_rgba(239,68,68,0.15)] animate-pulse">
          <AlertTriangle className="text-red-500 shrink-0" size={24} />
          <div className="flex-1">
            <h4 className="font-semibold text-red-200 text-sm md:text-base">Phát hiện tuần áp lực cực lớn ("Deadliest Week")!</h4>
            <p className="text-xs text-red-300/80">
              Tuần bắt đầu từ ngày <strong className="text-white">{deadliestWeekDate}</strong> có mật độ <strong className="text-white">{maxDeadlines} deadline</strong>. Áp lực học tập dự đoán lên tới <strong className="text-white">{deadliestStress}%</strong>. Hãy chuẩn bị ôn tập trước!
            </p>
          </div>
        </div>
      )}

      {/* Two Column Layout: Today's Classes vs Urgent Deadlines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Column 1: Today's Classes */}
        <GlassCard className="flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <h3 className="font-semibold text-lg text-slate-200 flex items-center gap-2">
              <Calendar size={20} className="text-purple-400" />
              Lịch Học Hôm Nay
            </h3>
            <span className="text-xs text-slate-400">
              {vietnamDay === 0 ? 'Chủ Nhật' : `Thứ ${vietnamDay + 1}`}
            </span>
          </div>

          {todayClasses.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <p>Hôm nay bạn không có lịch học chính thức nào.</p>
              <button onClick={() => onNavigate('schedule')} className="text-purple-400 hover:text-purple-300 text-xs mt-2 underline">
                Xem thời khóa biểu đầy đủ
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {todayClasses.map((c) => (
                <div 
                  key={c.id} 
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }}></div>
                    <div>
                      <h4 className="font-semibold text-sm text-slate-200">{c.name}</h4>
                      <p className="text-xs text-slate-400">{c.code} • {c.instructor}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-purple-300 block">
                      {c.schedule[0].startTime} - {c.schedule[0].endTime}
                    </span>
                    <span className="text-[10px] text-slate-500">Phòng: {c.room}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Column 2: Urgent Deadlines */}
        <GlassCard className="flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <h3 className="font-semibold text-lg text-slate-200 flex items-center gap-2">
              <AlertCircle size={20} className="text-pink-400" />
              Deadline Gấp
            </h3>
            <span className="text-xs text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-full">
              Cần hoàn thành
            </span>
          </div>

          {urgentTasks.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <p>Tuyệt vời! Không có deadline nào quá khẩn cấp trong 2 ngày tới.</p>
              <button onClick={() => onNavigate('tasks')} className="text-pink-400 hover:text-pink-300 text-xs mt-2 underline">
                Quản lý các bài tập khác
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {urgentTasks.map((t) => {
                const associatedCourse = courses.find(c => c.id === t.courseId);
                const daysLeft = Math.ceil((new Date(t.deadline).getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000));
                
                return (
                  <div 
                    key={t.id} 
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
                  >
                    <div>
                      <h4 className="font-semibold text-sm text-slate-200">{t.title}</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span className="text-slate-400 font-medium">
                          {associatedCourse?.name || 'Môn học khác'}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold ${
                          t.priority === 'high' ? 'bg-red-500/20 text-red-400' : 
                          t.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {t.priority}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-red-400 block">
                        Còn {daysLeft} ngày
                      </span>
                      <span className="text-[10px] text-slate-500">{t.deadline}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};
export default LifeDashboard;
