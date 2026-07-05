import React, { useState } from 'react';
import { useStore, type Course } from '../store/useStore';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';
import { Plus, Trash2, X, Clock, MapPin } from 'lucide-react';

const DAYS = [
  { id: 1, label: 'Thứ 2' },
  { id: 2, label: 'Thứ 3' },
  { id: 3, label: 'Thứ 4' },
  { id: 4, label: 'Thứ 5' },
  { id: 5, label: 'Thứ 6' },
  { id: 6, label: 'Thứ 7' },
  { id: 7, label: 'Chủ Nhật' },
];

const TIME_SLOTS = [
  { id: '08:00-10:00', start: '08:00', end: '10:00', label: 'Ca 1 (08:00 - 10:00)' },
  { id: '10:00-12:00', start: '10:00', end: '12:00', label: 'Ca 2 (10:00 - 12:00)' },
  { id: '13:00-15:00', start: '13:00', end: '15:00', label: 'Ca 3 (13:00 - 15:00)' },
  { id: '15:00-17:00', start: '15:00', end: '17:00', label: 'Ca 4 (15:00 - 17:00)' },
  { id: '17:00-19:00', start: '17:00', end: '19:00', label: 'Ca 5 (17:00 - 19:00)' },
];

export const Timetable: React.FC = () => {
  const { courses, addCourse, updateCourse, deleteCourse } = useStore();
  const [draggedCourse, setDraggedCourse] = useState<{ courseId: string; scheduleIdx: number } | null>(null);
  
  // Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [instructor, setInstructor] = useState('');
  const [room, setRoom] = useState('');
  const [color, setColor] = useState('#a855f7');
  const [day, setDay] = useState(1);
  const [timeSlot, setTimeSlot] = useState('08:00-10:00');

  const openAddModal = () => {
    setEditingCourse(null);
    setName('');
    setCode('');
    setInstructor('');
    setRoom('');
    setColor('#a855f7');
    setDay(1);
    setTimeSlot('08:00-10:00');
    setIsOpen(true);
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setName(course.name);
    setCode(course.code);
    setInstructor(course.instructor);
    setRoom(course.room);
    setColor(course.color);
    setDay(course.schedule[0]?.day || 1);
    const slot = `${course.schedule[0]?.startTime}-${course.schedule[0]?.endTime}`;
    setTimeSlot(TIME_SLOTS.some(s => s.id === slot) ? slot : '08:00-10:00');
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const [startTime, endTime] = timeSlot.split('-');
    const newSchedule = [{ day, startTime, endTime }];

    if (editingCourse) {
      updateCourse(editingCourse.id, {
        name,
        code,
        instructor,
        room,
        color,
        schedule: newSchedule
      });
    } else {
      addCourse({
        name,
        code,
        instructor,
        room,
        color,
        schedule: newSchedule
      });
    }
    setIsOpen(false);
  };

  // Drag and drop handlers
  const handleDragStart = (courseId: string, scheduleIdx: number) => {
    setDraggedCourse({ courseId, scheduleIdx });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Required to allow dropping
  };

  const handleDrop = (targetDay: number, targetTimeSlot: string) => {
    if (!draggedCourse) return;
    const { courseId } = draggedCourse;
    const [startTime, endTime] = targetTimeSlot.split('-');

    updateCourse(courseId, {
      schedule: [{ day: targetDay, startTime, endTime }]
    });
    setDraggedCourse(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pt-6 pb-24 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Thời Khóa Biểu
          </h2>
          <p className="text-slate-400 text-sm">Kéo thả các môn học để sắp xếp lại lịch học của bạn một cách trực quan.</p>
        </div>
        <GlassButton variant="purple" onClick={openAddModal} className="gap-2">
          <Plus size={18} /> Thêm Môn Học
        </GlassButton>
      </div>

      {/* Timetable Grid */}
      <GlassCard className="overflow-x-auto p-4 select-none">
        <div className="min-w-[800px] grid grid-cols-8 gap-3">
          {/* Header row corner */}
          <div className="text-slate-500 font-semibold text-xs py-2 flex items-center justify-center border-b border-white/5">
            Thời gian
          </div>
          {/* Days headers */}
          {DAYS.map((d) => (
            <div key={d.id} className="text-slate-200 font-bold text-center py-2 border-b border-white/5 text-sm">
              {d.label}
            </div>
          ))}

          {/* Time rows */}
          {TIME_SLOTS.map((slot) => (
            <React.Fragment key={slot.id}>
              {/* Row title (Time Slot) */}
              <div className="text-xs font-medium text-slate-400 flex flex-col justify-center items-center p-2 border-r border-white/5 text-center">
                <Clock size={14} className="text-purple-400 mb-1" />
                <span>{slot.start}</span>
                <span className="text-[10px] text-slate-500">đến</span>
                <span>{slot.end}</span>
              </div>

              {/* Grid cells */}
              {DAYS.map((day) => {
                // Find course in this cell
                const matchedCourses = courses.filter((c) =>
                  c.schedule.some(
                    (s) =>
                      s.day === day.id &&
                      s.startTime === slot.start &&
                      s.endTime === slot.end
                  )
                );

                return (
                  <div
                    key={`${day.id}-${slot.id}`}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(day.id, slot.id)}
                    className={`
                      min-h-[100px] rounded-xl p-2 border border-dashed transition-all duration-300 flex flex-col gap-2 justify-center
                      ${draggedCourse ? 'border-purple-500/20 bg-purple-500/5' : 'border-white/5 bg-black/10'}
                      hover:bg-white/[0.03] hover:border-purple-500/30
                    `}
                  >
                    {matchedCourses.map((c) => (
                      <div
                        key={c.id}
                        draggable
                        onDragStart={() => handleDragStart(c.id, 0)}
                        onClick={() => openEditModal(c)}
                        style={{ borderColor: `${c.color}40`, backgroundColor: `${c.color}15` }}
                        className="
                          border p-2 rounded-lg cursor-grab active:cursor-grabbing hover:scale-[1.03] transition-all duration-300 relative group
                        "
                      >
                        <h4 className="font-bold text-xs truncate" style={{ color: c.color }}>
                          {c.name}
                        </h4>
                        <span className="text-[10px] block font-medium text-slate-300 truncate mt-0.5">
                          {c.code}
                        </span>
                        
                        <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-1">
                          <MapPin size={8} />
                          <span className="truncate">{c.room}</span>
                        </div>
                        
                        {/* Hover Quick Edit / Delete Controls */}
                        <div className="absolute right-1 top-1 hidden group-hover:flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCourse(c.id);
                            }}
                            className="p-1 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded transition-colors"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </GlassCard>

      {/* Add / Edit Course Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <GlassCard className="w-full max-w-md p-6 border-white/10 relative shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              {editingCourse ? 'Sửa Môn Học' : 'Thêm Môn Học Mới'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Tên Môn Học</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Cấu trúc dữ liệu và Giải thuật"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full glass-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Mã Môn Học</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: INT2203"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full glass-input"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Màu Sắc</label>
                  <div className="flex gap-2 items-center h-[46px] px-2 rounded-xl bg-white/5 border border-white/10">
                    {['#3b82f6', '#ef4444', '#10b981', '#a855f7', '#f59e0b', '#ec4899'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-6 h-6 rounded-full border transition-all ${
                          color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Giảng Viên</label>
                  <input
                    type="text"
                    placeholder="TS. Nguyễn Văn A"
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    className="w-full glass-input"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Phòng Học</label>
                  <input
                    type="text"
                    placeholder="Phòng A2-302"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full glass-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Thứ (Lịch Học)</label>
                  <select
                    value={day}
                    onChange={(e) => setDay(Number(e.target.value))}
                    className="w-full glass-input"
                  >
                    {DAYS.map((d) => (
                      <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Khung Giờ</label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full glass-input"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot.id} value={slot.id} className="bg-slate-900 text-white">
                        {slot.start} - {slot.end}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <GlassButton type="button" onClick={() => setIsOpen(false)}>
                  Hủy
                </GlassButton>
                <GlassButton type="submit" variant="purple">
                  Lưu
                </GlassButton>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
export default Timetable;
