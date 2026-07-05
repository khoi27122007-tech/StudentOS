import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';
import { Activity, Sunset, Info } from 'lucide-react';

export const HealthTracker: React.FC = () => {
  const { moods, tasks, sessions, addMoodLog } = useStore();
  const [selectedMood, setSelectedMood] = useState<'happy' | 'neutral' | 'tired' | 'stressed'>('happy');
  const [sleepHours, setSleepHours] = useState(7);

  // Today's date string
  const todayStr = new Date().toISOString().split('T')[0];

  // Log today's state
  const handleLogDay = () => {
    addMoodLog({
      date: todayStr,
      mood: selectedMood,
      sleepHours
    });
    alert('📝 Đã lưu trạng thái sức khỏe hôm nay!');
  };

  // Burnout Score math
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  
  // Calculate average daily study hours from sessions
  const uniqueDaysStudied = new Set(sessions.map(s => s.startTime.split('T')[0])).size || 1;
  const totalStudyMinutes = sessions.reduce((acc, s) => acc + s.duration, 0);
  const avgStudyHours = (totalStudyMinutes / 60) / uniqueDaysStudied;

  // Today's logged sleep (fallback to last log or 8h)
  const todayMoodLog = moods.find(m => m.date === todayStr);
  const currentSleep = todayMoodLog ? todayMoodLog.sleepHours : sleepHours;

  // Formula scaled to 100
  const studyFactor = Math.min(10, avgStudyHours) * 10; // Max 10 hours = 100 points
  const deadlineFactor = Math.min(10, pendingTasks) * 10; // Max 10 deadlines = 100 points
  const sleepFactor = Math.max(0, 8 - currentSleep) * 12.5; // Deficit up to 8h. 4h deficit = 50 pts, 8h deficit = 100 pts.
  
  const score = Math.round((studyFactor * 0.4) + (deadlineFactor * 0.3) + (sleepFactor * 0.3));

  // Visual coping suggestions
  const getCopingTips = (burnoutScore: number) => {
    if (burnoutScore > 80) {
      return {
        level: 'Nguy cơ quá tải cực cao (Đỏ)',
        tips: [
          'Dừng ngay lập tức việc học thêm khuya hôm nay.',
          'Đi dạo bên ngoài 15-20 phút không mang theo điện thoại.',
          'Đặt báo thức ngủ đủ ít nhất 7.5 tiếng tối nay.',
          'Trao đổi với nhóm hoặc giảng viên để dời/giảm bớt khối lượng nếu có thể.'
        ],
        color: 'text-red-400 border-red-500/20 bg-red-500/5'
      };
    }
    if (burnoutScore > 40) {
      return {
        level: 'Căng thẳng trung bình (Vàng)',
        tips: [
          'Áp dụng quy tắc Pomodoro ngắt quãng 25 phút để nghỉ ngơi đều đặn.',
          'Tránh uống quá nhiều caffeine vào buổi chiều tối.',
          'Ghi chép nhanh các suy nghĩ lo lắng ra giấy để giải tỏa đầu óc.',
          'Dành 10 phút tập hít thở sâu hoặc nghe nhạc lofi không lời.'
        ],
        color: 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5'
      };
    }
    return {
      level: 'Trạng thái tối ưu (Xanh)',
      tips: [
        'Giữ vững phong độ hiện tại.',
        'Học tập đều đặn và duy trì thói quen ngủ lành mạnh.',
        'Có thể tranh thủ giải quyết các task nhỏ để tích lũy EXP.',
        'Luyện tập thể thao nhẹ nhàng cuối ngày.'
      ],
      color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5'
    };
  };

  const advice = getCopingTips(score);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pt-6 pb-24 space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
          Cân Bằng Sức Khỏe & Stress
        </h2>
        <p className="text-slate-400 text-sm">Công cụ tự động dự đoán nguy cơ quá tải (Burnout Score) và gợi ý nghỉ ngơi.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Logger Form */}
        <div className="space-y-6">
          <GlassCard className="space-y-4">
            <h3 className="font-semibold text-slate-200 flex items-center gap-2">
              <Activity size={18} className="text-purple-400" />
              Nhật Ký Ngày Hôm Nay
            </h3>

            {/* Mood selector */}
            <div>
              <label className="text-xs text-slate-400 block mb-2">Cảm xúc hiện tại của bạn</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'happy', emoji: '😊', label: 'Vui vẻ' },
                  { id: 'neutral', emoji: '😐', label: 'Ổn' },
                  { id: 'tired', emoji: '😫', label: 'Mệt mỏi' },
                  { id: 'stressed', emoji: '😡', label: 'Áp lực' }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMood(m.id as any)}
                    className={`
                      p-3 rounded-xl border flex flex-col items-center justify-center transition-all duration-300
                      ${selectedMood === m.id 
                        ? 'bg-purple-500/20 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.25)]' 
                        : 'bg-white/5 border-transparent hover:border-white/10'
                      }
                    `}
                  >
                    <span className="text-2xl mb-1">{m.emoji}</span>
                    <span className="text-[10px] text-slate-300 font-medium">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sleep Logger */}
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Số giờ ngủ đêm qua:</span>
                <span className="font-bold text-purple-300">{sleepHours} giờ</span>
              </div>
              <input 
                type="range"
                min="3"
                max="12"
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(Number(e.target.value))}
                className="w-full accent-purple-500 bg-slate-800"
              />
            </div>

            <GlassButton 
              variant="purple" 
              fullWidth 
              onClick={handleLogDay}
              className="mt-2"
            >
              Lưu Trạng Thái
            </GlassButton>
          </GlassCard>

          {/* Quick Info Box */}
          <GlassCard className="p-4 border-indigo-500/20 bg-indigo-500/5 text-xs text-slate-300 space-y-2 leading-relaxed">
            <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Info size={14} className="text-indigo-400" />
              Cách tính Burnout Score
            </h4>
            <p>Thuật toán tính điểm kiệt sức dựa trên các trọng số khoa học:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>40%</strong> từ thời lượng học (giờ học trung bình)</li>
              <li><strong>30%</strong> số lượng deadline đang tồn đọng</li>
              <li><strong>30%</strong> từ việc thiếu ngủ (dưới mục tiêu 8 tiếng)</li>
            </ul>
          </GlassCard>
        </div>

        {/* Center / Right Column: Health Gauge & SVG charts */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Burnout Score Gauge Display */}
          <GlassCard glowColor={score > 80 ? 'pink' : score > 40 ? 'pink' : 'green'} className="flex flex-col md:flex-row gap-6 p-6 items-center justify-around">
            
            {/* Round Gauge */}
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                {/* Background Ring */}
                <circle 
                  cx="72" cy="72" r="60" 
                  className="stroke-slate-800" 
                  strokeWidth="8" fill="transparent" 
                />
                {/* Progress Ring */}
                <circle 
                  cx="72" cy="72" r="60" 
                  className={`transition-all duration-1000 ${
                    score > 80 ? 'stroke-red-500' : 
                    score > 40 ? 'stroke-amber-500' : 
                    'stroke-emerald-500'
                  }`}
                  strokeWidth="10" 
                  strokeDasharray={2 * Math.PI * 60}
                  strokeDashoffset={2 * Math.PI * 60 * (1 - score / 100)}
                  strokeLinecap="round"
                  fill="transparent" 
                />
              </svg>
              
              <div className="text-center">
                <span className="text-4xl font-extrabold text-white">{score}%</span>
                <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold mt-1">Stress Score</span>
              </div>
            </div>

            {/* Coping & Action suggestions */}
            <div className="space-y-3 flex-1">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Đánh giá trạng thái</span>
                <h4 className="text-lg font-bold text-white mt-0.5">{advice.level}</h4>
              </div>
              
              <div className="space-y-1.5">
                <span className="text-xs text-slate-400 font-semibold block">Khuyến nghị điều hòa cuộc sống:</span>
                <ul className="space-y-1 text-xs text-slate-300">
                  {advice.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-purple-400 mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </GlassCard>

          {/* SVG Trend History Chart */}
          <GlassCard className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                <Sunset size={18} className="text-purple-400" />
                Biểu Đồ Sức Khỏe Tuần Qua
              </h3>
              <span className="text-xs text-slate-400">Chỉ số Giờ Ngủ & Trạng Thái</span>
            </div>

            {moods.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                Chưa có đủ dữ liệu lịch sử để hiển thị biểu đồ. Hãy tiếp tục lưu trạng thái hàng ngày!
              </div>
            ) : (
              <div className="space-y-6">
                {/* Mini bar graph representation */}
                <div className="flex h-36 items-end gap-3 justify-around pt-4 border-b border-white/10">
                  {moods.slice(-7).map((m, idx) => {
                    // map mood to color and height
                    const h = (m.sleepHours / 12) * 100; // max 12h
                    const color = 
                      m.mood === 'happy' ? 'bg-emerald-500' :
                      m.mood === 'neutral' ? 'bg-indigo-500' :
                      m.mood === 'tired' ? 'bg-amber-500' : 'bg-red-500';
                    
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 bg-slate-900 border border-white/10 px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                          Ngủ: {m.sleepHours}h | {m.mood === 'happy' ? '😊 Vui' : m.mood === 'neutral' ? '😐 Ổn' : m.mood === 'tired' ? '😫 Mệt' : '😡 Áp lực'}
                        </div>
                        
                        <div 
                          style={{ height: `${h}%` }}
                          className={`w-full max-w-[24px] rounded-t-md ${color} opacity-80 group-hover:opacity-100 transition-opacity`}
                        ></div>
                        <span className="text-[10px] text-slate-500 mt-2 whitespace-nowrap">
                          {m.date.split('-').slice(1).join('/')}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-center gap-6 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
                    <span className="text-slate-400">Vui vẻ 😊</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-indigo-500"></span>
                    <span className="text-slate-400">Ổn 😐</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
                    <span className="text-slate-400">Mệt mỏi 😫</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-red-500"></span>
                    <span className="text-slate-400">Áp lực 😡</span>
                  </div>
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
export default HealthTracker;
