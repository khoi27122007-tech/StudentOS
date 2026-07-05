import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';
import { Plus, Check, Clock, Trash2, Filter, Paperclip } from 'lucide-react';

export const TasksManager: React.FC = () => {
  const { tasks, courses, addTask, deleteTask, toggleTaskStatus } = useStore();
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  
  // Add task Form state
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseId, setCourseId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [attachment, setAttachment] = useState<string>('');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    addTask({
      title,
      description,
      courseId,
      deadline,
      priority,
      attachment: attachment || undefined
    });
    
    // Reset Form
    setTitle('');
    setDescription('');
    setCourseId('');
    setDeadline('');
    setPriority('medium');
    setAttachment('');
    setIsOpen(false);
  };

  // Filter & sort logic
  const filteredTasks = tasks.filter((t) => {
    const matchCourse = filterCourse === 'all' || t.courseId === filterCourse;
    const matchPriority = filterPriority === 'all' || t.priority === filterPriority;
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchCourse && matchPriority && matchStatus;
  }).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  // Helper: Format countdown days
  const getDeadlineText = (deadlineStr: string) => {
    const diff = new Date(deadlineStr).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return { text: `Trễ hạn ${Math.abs(days)} ngày`, color: 'text-red-500 font-bold' };
    if (days === 0) return { text: 'Hết hạn hôm nay', color: 'text-amber-500 font-bold animate-pulse' };
    if (days === 1) return { text: 'Còn 1 ngày', color: 'text-red-400 font-semibold' };
    return { text: `Còn ${days} ngày`, color: 'text-slate-300' };
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pt-6 pb-24 space-y-6">
      
      {/* Header and Add Task */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Nhiệm Vụ & Deadline
          </h2>
          <p className="text-slate-400 text-sm">Theo dõi sát sao thời hạn nộp bài để không bao giờ lỡ mất điểm số.</p>
        </div>
        <GlassButton variant="pink" onClick={() => setIsOpen(true)} className="gap-2">
          <Plus size={18} /> Thêm Nhiệm Vụ
        </GlassButton>
      </div>

      {/* Filters Toolbar */}
      <GlassCard className="p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
            <Filter size={14} /> BỘ LỌC:
          </div>
          
          {/* Status */}
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="glass-input py-1.5 px-3 text-xs"
          >
            <option value="all" className="bg-slate-900">Mọi trạng thái</option>
            <option value="pending" className="bg-slate-900">Đang chờ</option>
            <option value="completed" className="bg-slate-900">Đã xong</option>
          </select>

          {/* Course */}
          <select 
            value={filterCourse} 
            onChange={(e) => setFilterCourse(e.target.value)}
            className="glass-input py-1.5 px-3 text-xs"
          >
            <option value="all" className="bg-slate-900">Tất cả môn học</option>
            {courses.map(c => (
              <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
            ))}
          </select>

          {/* Priority */}
          <select 
            value={filterPriority} 
            onChange={(e) => setFilterPriority(e.target.value)}
            className="glass-input py-1.5 px-3 text-xs"
          >
            <option value="all" className="bg-slate-900">Mọi độ ưu tiên</option>
            <option value="low" className="bg-slate-900">Thấp</option>
            <option value="medium" className="bg-slate-900">Trung bình</option>
            <option value="high" className="bg-slate-900">Cao</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Đang hiển thị <strong className="text-white">{filteredTasks.length}</strong> nhiệm vụ
        </div>
      </GlassCard>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <GlassCard className="py-12 text-center text-slate-500">
            Không tìm thấy nhiệm vụ nào khớp với bộ lọc.
          </GlassCard>
        ) : (
          filteredTasks.map((t) => {
            const associatedCourse = courses.find((c) => c.id === t.courseId);
            const dl = getDeadlineText(t.deadline);
            const isCompleted = t.status === 'completed';

            return (
              <GlassCard 
                key={t.id} 
                className={`transition-all duration-300 ${isCompleted ? 'opacity-65 border-white/5 bg-white/[0.01]' : 'hover:bg-white/[0.03]'}`}
                glowColor={t.priority === 'high' && !isCompleted ? 'pink' : 'none'}
              >
                <div className="flex items-start gap-4">
                  {/* Complete Checkbox */}
                  <button 
                    onClick={() => toggleTaskStatus(t.id)}
                    className={`
                      w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-1 transition-all
                      ${isCompleted 
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                        : 'border-white/20 hover:border-purple-400 text-transparent hover:text-purple-400/50'
                      }
                    `}
                  >
                    <Check size={14} className="stroke-[3]" />
                  </button>

                  {/* Task details */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center flex-wrap gap-2">
                      <h4 className={`font-semibold text-base ${isCompleted ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                        {t.title}
                      </h4>
                      {associatedCourse && (
                        <span 
                          style={{ borderColor: `${associatedCourse.color}40`, color: associatedCourse.color }}
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-white/5"
                        >
                          {associatedCourse.name}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                        t.priority === 'high' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 
                        t.priority === 'medium' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' : 
                        'bg-blue-500/10 border-blue-500/20 text-blue-400'
                      }`}>
                        {t.priority}
                      </span>
                    </div>

                    <p className={`text-sm ${isCompleted ? 'text-slate-500' : 'text-slate-400'}`}>
                      {t.description}
                    </p>

                    {t.attachment && (
                      <div className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:underline cursor-pointer mt-2 bg-indigo-500/5 border border-indigo-500/10 px-2 py-1 rounded-md">
                        <Paperclip size={12} />
                        <span>{t.attachment}</span>
                      </div>
                    )}
                  </div>

                  {/* Countdown & Actions */}
                  <div className="text-right flex flex-col items-end gap-3 shrink-0">
                    <div className="text-xs flex items-center gap-1.5">
                      <Clock size={12} className={dl.color} />
                      <span className={dl.color}>{dl.text}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">Hạn: {t.deadline}</span>
                    
                    <button 
                      onClick={() => deleteTask(t.id)}
                      className="text-slate-500 hover:text-red-400 p-1 rounded-md hover:bg-red-500/10 transition-colors"
                      title="Xóa nhiệm vụ"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </GlassCard>
            );
          })
        )}
      </div>

      {/* Add Task Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-md p-6 border-white/10 relative shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <XClose />
            </button>

            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Tạo Nhiệm Vụ Mới
            </h3>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Tên Nhiệm Vụ / Bài Tập</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ví dụ: Thiết kế cơ sở dữ liệu bài tập lớn"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full glass-input"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Mô tả chi tiết</label>
                <textarea 
                  placeholder="Nội dung, yêu cầu, bài tập chương mấy,..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full glass-input min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Môn Học Liên Quan</label>
                  <select
                    required
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full glass-input"
                  >
                    <option value="" disabled className="bg-slate-900">Chọn môn học</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Độ Ưu Tiên</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full glass-input"
                  >
                    <option value="low" className="bg-slate-900">Thấp (XP +20)</option>
                    <option value="medium" className="bg-slate-900">Trung bình (XP +50)</option>
                    <option value="high" className="bg-slate-900">Cao (XP +100)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Hạn Nộp (Deadline)</label>
                  <input 
                    type="date" 
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full glass-input text-white [color-scheme:dark]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Tài Liệu Đính Kèm</label>
                  <input 
                    type="text"
                    placeholder="Tên file đính kèm (nếu có)"
                    value={attachment}
                    onChange={(e) => setAttachment(e.target.value)}
                    className="w-full glass-input"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <GlassButton type="button" onClick={() => setIsOpen(false)}>
                  Hủy
                </GlassButton>
                <GlassButton type="submit" variant="pink">
                  Tạo Deadline
                </GlassButton>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

// Inline helper close icon
const XClose = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

export default TasksManager;
