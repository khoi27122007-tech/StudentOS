import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import GlassCard from './GlassCard';
import { Sliders, ArrowRight, Activity, CalendarRange } from 'lucide-react';

export const SemesterSimulator: React.FC = () => {
  const { tasks, courses, updateTask } = useStore();
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [simulationReport, setSimulationReport] = useState<string | null>(null);

  // Generate 7 consecutive days starting from today for our simulation timeline
  const timelineDates = Array.from({ length: 7 }, (_, idx) => {
    const date = new Date();
    date.setDate(date.getDate() + idx);
    return date.toISOString().split('T')[0];
  });

  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetDate: string) => {
    if (!draggedTaskId) return;

    const task = tasks.find((t) => t.id === draggedTaskId);
    if (!task) return;

    const originalDate = task.deadline;
    if (originalDate === targetDate) {
      setDraggedTaskId(null);
      return;
    }

    // Shifting logic
    updateTask(draggedTaskId, { deadline: targetDate });

    // Calculate overload impact on destination date
    const tasksOnTarget = tasks.filter((t) => t.deadline === targetDate && t.id !== draggedTaskId).length + 1;
    const taskTitle = task.title;

    let stressPercent = 20;
    let workloadHours = 2;
    let overloadAlert = '';

    if (tasksOnTarget >= 3) {
      stressPercent = 90;
      workloadHours = 8;
      overloadAlert = '⚠️ CẢNH BÁO: Quá tải nghiêm trọng! Ngày này có hơn 3 deadline lớn chồng chéo, nguy cơ kiệt sức cao.';
    } else if (tasksOnTarget === 2) {
      stressPercent = 60;
      workloadHours = 5;
      overloadAlert = '⚡ Cảnh giác: Mật độ deadline trung bình. Thời gian học sẽ tăng nhẹ.';
    } else {
      stressPercent = 25;
      workloadHours = 2;
      overloadAlert = '✅ An toàn: Phân bổ hợp lý. Ngày này có khối lượng công việc nhẹ.';
    }

    setSimulationReport(`
      [Báo Cáo Mô Phỏng Dịch Chuyển]
      Dịch chuyển thành công: "${taskTitle}"
      Từ ngày: ${originalDate} sang ngày: ${targetDate}
      
      - Thời gian học ước tính trong ngày tăng thêm: +${workloadHours} giờ.
      - Áp lực tải công việc ngày mới: ${stressPercent}%.
      ${overloadAlert}
    `);

    setDraggedTaskId(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pt-6 pb-24 space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">
          <Sliders size={28} className="text-purple-400" />
          Semester Simulator (Mô Phỏng Học Kỳ)
        </h2>
        <p className="text-slate-400 text-sm">
          Kéo thả bài tập/deadline giữa các ngày trong tuần để dự báo áp lực học tập và tránh trùng lịch thi.
        </p>
      </div>

      {/* Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left column: Simulator Info & Report */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="space-y-4">
            <h3 className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Activity size={16} className="text-purple-400" />
              Chỉ số Mô Phỏng
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mô phỏng giúp bạn nhận diện các xung đột lịch trình trước khi đưa ra quyết định xin gia hạn hoặc dời lịch tự học.
            </p>
            <div className="h-px bg-white/5"></div>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Khả dụng dời lịch:</span>
                <span className="text-emerald-400 font-semibold">Có sẵn</span>
              </div>
              <div className="flex justify-between">
                <span>Trùng lịch học chính:</span>
                <span className="text-amber-400 font-semibold">Tự quét tự động</span>
              </div>
            </div>
          </GlassCard>

          {simulationReport && (
            <GlassCard className="border-purple-500/20 bg-purple-500/5 text-xs text-slate-300 space-y-3 whitespace-pre-line relative animate-fade-in">
              <div className="absolute top-2 right-2">
                <button 
                  onClick={() => setSimulationReport(null)}
                  className="text-slate-500 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <h4 className="font-bold text-purple-300 flex items-center gap-1.5 border-b border-purple-500/20 pb-1.5">
                <CalendarRange size={14} />
                Báo cáo dịch chuyển deadline
              </h4>
              <p className="leading-relaxed">{simulationReport}</p>
            </GlassCard>
          )}
        </div>

        {/* Right column: Interactive drag Timeline */}
        <div className="lg:col-span-3">
          <GlassCard className="p-4 overflow-x-auto">
            <div className="flex gap-4 min-w-[700px] pb-4">
              {timelineDates.map((dateStr) => {
                const dayTasks = tasks.filter((t) => t.deadline === dateStr && t.status === 'pending');
                const parsedDate = new Date(dateStr);
                const dayLabel = parsedDate.toLocaleDateString('vi-VN', { weekday: 'short' });
                const dateLabel = parsedDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

                // calculate color based on deadline density
                const isOverloaded = dayTasks.length >= 3;
                const isModerate = dayTasks.length === 2;

                return (
                  <div
                    key={dateStr}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(dateStr)}
                    className={`
                      flex-1 min-w-[150px] min-h-[350px] rounded-2xl p-3 border transition-all duration-300 flex flex-col gap-3
                      ${draggedTaskId ? 'border-dashed border-purple-500/20 bg-purple-500/5' : 'border-white/5 bg-black/15'}
                      ${isOverloaded ? 'border-red-500/30 bg-red-500/[0.02]' : isModerate ? 'border-amber-500/20' : ''}
                      hover:bg-white/[0.02]
                    `}
                  >
                    {/* Date Header */}
                    <div className="text-center pb-2 border-b border-white/5">
                      <span className="text-xs font-bold text-slate-200 block uppercase tracking-wide">
                        {dayLabel}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        {dateLabel}
                      </span>
                      
                      {dayTasks.length > 0 && (
                        <span className={`inline-block text-[8px] font-extrabold px-1.5 py-0.2 rounded-full mt-1.5 uppercase ${
                          isOverloaded ? 'bg-red-500/20 text-red-400' :
                          isModerate ? 'bg-amber-500/20 text-amber-400' :
                          'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          Tải: {isOverloaded ? 'Quá Tải' : isModerate ? 'Vừa Phải' : 'Nhẹ'}
                        </span>
                      )}
                    </div>

                    {/* Task items list inside date card */}
                    <div className="flex-1 flex flex-col gap-2 overflow-y-auto max-h-[250px]">
                      {dayTasks.length === 0 ? (
                        <span className="text-[10px] text-slate-600 italic text-center my-auto">Trống</span>
                      ) : (
                        dayTasks.map((t) => {
                          const course = courses.find((c) => c.id === t.courseId);
                          return (
                            <div
                              key={t.id}
                              draggable
                              onDragStart={() => handleDragStart(t.id)}
                              className="
                                p-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] cursor-grab active:cursor-grabbing transition-all select-none
                              "
                            >
                              <h5 className="text-xs font-semibold text-slate-200 line-clamp-1">{t.title}</h5>
                              {course && (
                                <span 
                                  style={{ color: course.color }}
                                  className="text-[9px] font-semibold block mt-1 truncate"
                                >
                                  {course.name}
                                </span>
                              )}
                              
                              <div className="flex items-center justify-between gap-1.5 mt-2">
                                <span className={`text-[8px] font-bold uppercase px-1 rounded ${
                                  t.priority === 'high' ? 'bg-red-500/20 text-red-400' : 
                                  t.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 
                                  'bg-blue-500/20 text-blue-400'
                                }`}>
                                  {t.priority}
                                </span>
                                
                                <ArrowRight size={10} className="text-slate-600" />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
export default SemesterSimulator;
