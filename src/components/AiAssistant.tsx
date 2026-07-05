import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';
import { Bot, MicOff, FileText, Calendar, Plus, Save, Sparkles } from 'lucide-react';

export const AiAssistant: React.FC = () => {
  const { addTask, addCourse } = useStore();
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [activeMode, setActiveMode] = useState<'scheduler' | 'syllabus' | 'notes'>('scheduler');

  // Web Speech API Voice Recognition Setup
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const Speech = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (Speech) {
      const rec = new Speech();
      rec.continuous = false;
      rec.lang = 'vi-VN';
      rec.interimResults = false;

      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onerror = () => setIsListening(false);
      
      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(prev => prev + ' ' + transcript);
      };
      setRecognition(rec);
    }
  }, []);

  const handleToggleListen = () => {
    if (!recognition) {
      alert('⚠️ Trình duyệt của bạn không hỗ trợ nhận diện giọng nói Web Speech API.');
      return;
    }
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  // AI Planner logic (Clever client-side parsing mock representing AI output)
  const handleGenerateSchedule = () => {
    if (!inputText.trim()) return;

    const parsedSuggestions: any[] = [];
    const text = inputText.toLowerCase();

    // Key phrase matches to generate realistic timeline suggestions
    if (text.includes('toán') || text.includes('math')) {
      parsedSuggestions.push({
        id: 's1',
        title: 'Ôn tập toán đại số',
        type: 'study',
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '19:00 - 21:00',
        courseName: 'Toán chuyên đề',
        courseId: 'c3',
        priority: 'high',
        reason: 'Học bù cho lịch thi sắp tới được nhắc trong yêu cầu.'
      });
    }

    if (text.includes('java') || text.includes('lập trình')) {
      parsedSuggestions.push({
        id: 's2',
        title: 'Lập trình Socket Java',
        type: 'task',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '14:00 - 17:00',
        courseName: 'Lập trình Java',
        courseId: 'c1',
        priority: 'high',
        reason: 'Để kịp hoàn thành bài tập lớn socket server.'
      });
    }

    if (text.includes('triết') || text.includes('triết học') || text.includes('báo cáo')) {
      parsedSuggestions.push({
        id: 's3',
        title: 'Viết tiểu luận triết học',
        type: 'task',
        date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '09:00 - 11:00',
        courseName: 'Triết học Mác - Lênin',
        courseId: 'c2',
        priority: 'medium',
        reason: 'Soạn thảo luận chương 2 Triết.'
      });
    }

    // Default suggestions if no match
    if (parsedSuggestions.length === 0) {
      parsedSuggestions.push({
        id: 's_default',
        title: 'Xem lại bài giảng trên lớp',
        type: 'study',
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '20:00 - 21:30',
        priority: 'low',
        reason: 'Lên lịch tự học hàng ngày dựa trên khoảng trống thời khóa biểu.'
      });
    }

    setAiSuggestions(parsedSuggestions);
  };

  // Sync suggestion tasks to Zustand
  const handleSyncSuggestion = (s: any) => {
    addTask({
      title: s.title,
      description: `${s.reason} (Được AI đề xuất vào khung giờ ${s.time})`,
      courseId: s.courseId || 'c1',
      deadline: s.date,
      priority: s.priority
    });
    alert(`✅ Đã đồng bộ nhiệm vụ "${s.title}" vào danh sách Deadline!`);
    setAiSuggestions(prev => prev.filter(item => item.id !== s.id));
  };

  // Mock OCR Syllabus Reader
  const [syllabusFile, setSyllabusFile] = useState<string | null>(null);
  const [ocrResults, setOcrResults] = useState<any | null>(null);

  const handleUploadSyllabus = (e: any) => {
    if (e.target.files.length === 0) return;
    const file = e.target.files[0];
    setSyllabusFile(file.name);

    // Simulate OCR + LLM parse delay
    setTimeout(() => {
      setOcrResults({
        courseName: 'Cơ sở dữ liệu',
        code: 'INT2211',
        credits: 3,
        instructor: 'PGS. TS. Trần Văn D',
        schedule: { day: 4, startTime: '15:00', endTime: '17:00' },
        tasks: [
          { title: 'Bài tập lớn thực hành SQL', deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], priority: 'high' },
          { title: 'Kiểm tra trắc nghiệm giữa kỳ', deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], priority: 'medium' }
        ]
      });
    }, 1500);
  };

  const handleSyncSyllabus = () => {
    if (!ocrResults) return;

    // Add syllabus course
    addCourse({
      name: ocrResults.courseName,
      code: ocrResults.code,
      color: '#06b6d4',
      instructor: ocrResults.instructor,
      room: 'B2-405',
      schedule: [ocrResults.schedule]
    });

    // Add syllabus tasks
    ocrResults.tasks.forEach((t: any) => {
      addTask({
        title: t.title,
        description: `Bài tập từ đề cương Syllabus môn ${ocrResults.courseName}`,
        courseId: 'c1', // link to default or dynamic
        deadline: t.deadline,
        priority: t.priority
      });
    });

    alert('🎉 Đã đồng bộ thành công môn học và 2 deadline mới từ Syllabus vào hệ thống!');
    setSyllabusFile(null);
    setOcrResults(null);
  };

  // Voice Smart Notes States
  const [notesText, setNotesText] = useState('');
  const [savedNotes, setSavedNotes] = useState<string[]>([
    'Tóm tắt Java Socket: Cần nhớ cấu trúc TCP client-server, lập trình ServerSocket mở port trước client.',
    'Lưu ý Triết học: Chương quy luật lượng chất chỉ ra sự tích lũy dần về lượng tạo nên biến đổi về chất.'
  ]);

  const handleSaveNote = () => {
    if (!notesText.trim()) return;
    setSavedNotes(prev => [notesText, ...prev]);
    setNotesText('');
    alert('💾 Đã lưu ghi chú thông minh thành công!');
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pt-6 pb-24 space-y-6">
      
      {/* Sub-menu buttons */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">
            <Bot size={28} className="text-purple-400" />
            Trợ Lý Học Tập AI
          </h2>
          <p className="text-slate-400 text-sm">Hệ thống phân tích lịch trình tự động, quét đề cương OCR và ghi chú bằng giọng nói.</p>
        </div>

        <div className="flex bg-white/5 border border-white/10 p-1 rounded-2xl">
          <button
            onClick={() => setActiveMode('scheduler')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeMode === 'scheduler' ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tự động lập lịch
          </button>
          <button
            onClick={() => setActiveMode('syllabus')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeMode === 'syllabus' ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            Đọc Syllabus PDF
          </button>
          <button
            onClick={() => setActiveMode('notes')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeMode === 'notes' ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            Ghi chú giọng nói
          </button>
        </div>
      </div>

      {/* Mode 1: AI Auto-Scheduler */}
      {activeMode === 'scheduler' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <GlassCard className="space-y-4">
              <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                <Sparkles size={16} className="text-purple-400" />
                Yêu cầu lập lịch
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Nhập văn bản tự do nói về bài tập, kỳ thi và thời hạn của bạn. AI sẽ phân tích và chèn lịch học phù hợp.
              </p>
              
              <div className="relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ví dụ: Tuần sau mình có thi toán vào thứ 6, deadline java thứ 4 và báo cáo triết vào thứ 5..."
                  className="w-full glass-input min-h-[120px] pr-10 text-sm"
                />
                <button
                  onClick={handleToggleListen}
                  className={`
                    absolute right-2 bottom-3 p-2 rounded-lg transition-colors
                    ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-white/5 text-slate-400 hover:text-white'}
                  `}
                  title={isListening ? 'Dừng thu âm' : 'Nhận diện giọng nói'}
                >
                  {isListening ? <MicOff size={16} /> : <Mic.icon size={16} />}
                </button>
              </div>

              <GlassButton 
                variant="purple" 
                fullWidth 
                onClick={handleGenerateSchedule}
                disabled={!inputText.trim()}
              >
                Phân Tích & Lập Lịch
              </GlassButton>
            </GlassCard>
          </div>

          <div className="md:col-span-2">
            <GlassCard className="space-y-4 h-full min-h-[300px]">
              <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                <Calendar size={18} className="text-purple-400" />
                Dự Kiến Timeline Đề Xuất Bởi AI
              </h3>

              {aiSuggestions.length === 0 ? (
                <div className="py-16 text-center text-slate-500 text-sm">
                  Hãy nhập nội dung yêu cầu bên trái để AI tính toán timeline biểu cho bạn.
                </div>
              ) : (
                <div className="space-y-4">
                  {aiSuggestions.map((s) => (
                    <div 
                      key={s.id}
                      className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 transition-colors flex justify-between items-start"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] text-purple-400 uppercase font-bold tracking-wider block">
                          Đề xuất tự học • {s.date} ({s.time})
                        </span>
                        <h4 className="font-bold text-white text-sm">{s.title}</h4>
                        <p className="text-xs text-slate-300">{s.reason}</p>
                      </div>

                      <GlassButton 
                        variant="purple" 
                        size="sm"
                        onClick={() => handleSyncSuggestion(s)}
                        className="gap-1 shadow-md"
                      >
                        <Plus size={12} /> Đồng ý
                      </GlassButton>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      )}

      {/* Mode 2: Syllabus PDF Reader */}
      {activeMode === 'syllabus' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <GlassCard className="space-y-4">
              <h3 className="font-semibold text-slate-200">Upload Syllabus Giáo Trình</h3>
              <p className="text-xs text-slate-400">Tải lên tài liệu đề cương PDF (hoặc mô phỏng) để AI trích xuất lịch thi và số tín chỉ.</p>
              
              <div className="border border-dashed border-white/20 rounded-xl p-6 text-center hover:bg-white/[0.02] cursor-pointer relative group transition-colors">
                <input 
                  type="file" 
                  accept=".pdf"
                  onChange={handleUploadSyllabus}
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                />
                <FileText className="mx-auto text-indigo-400 mb-2 group-hover:scale-110 transition-transform" size={32} />
                <span className="text-xs text-slate-300 block font-medium">
                  {syllabusFile ? syllabusFile : 'Click chọn hoặc kéo thả file PDF vào đây'}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">Dung lượng tối đa: 10MB</span>
              </div>
            </GlassCard>
          </div>

          <div className="md:col-span-2">
            <GlassCard className="h-full min-h-[300px]">
              <h3 className="font-semibold text-slate-200 pb-2 border-b border-white/5 mb-4">
                Kết Quả Quét Trích Xuất Syllabus
              </h3>

              {!ocrResults ? (
                <div className="py-16 text-center text-slate-500 text-sm">
                  {syllabusFile 
                    ? 'Đang tiến hành trích xuất OCR và phân tích dữ liệu AI...' 
                    : 'Vui lòng upload file để quét thông tin.'
                  }
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Course info */}
                  <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                    <h4 className="font-bold text-white text-base">Môn học phát hiện: {ocrResults.courseName}</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Mã môn: {ocrResults.code} | Số tín chỉ: {ocrResults.credits} | Giảng viên: {ocrResults.instructor}
                    </p>
                    <p className="text-xs text-indigo-300 mt-2 font-medium">
                      Lịch học: Thứ {ocrResults.schedule.day} từ {ocrResults.schedule.startTime} - {ocrResults.schedule.endTime}
                    </p>
                  </div>

                  {/* Tasks list */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Danh sách deadline đề xuất</h5>
                    {ocrResults.tasks.map((task: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex justify-between items-center text-xs">
                        <div>
                          <strong className="text-slate-200 block text-sm">{task.title}</strong>
                          <span className="text-slate-500">Độ ưu tiên: {task.priority}</span>
                        </div>
                        <span className="text-indigo-400 font-semibold">Ngày hạn: {task.deadline}</span>
                      </div>
                    ))}
                  </div>

                  <GlassButton 
                    variant="indigo" 
                    onClick={handleSyncSyllabus}
                    className="w-full gap-2 mt-4"
                  >
                    <Save size={16} /> Nhập Lịch Học & Deadline Vào Hệ Thống
                  </GlassButton>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      )}

      {/* Mode 3: Voice Smart Notes */}
      {activeMode === 'notes' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <GlassCard className="space-y-4">
              <h3 className="font-semibold text-slate-200">Ghi Âm Tóm Tắt Buổi Học</h3>
              <p className="text-xs text-slate-400">Sau khi học xong, hãy nói những kiến thức bạn vừa nạp vào. AI sẽ tóm tắt lại thành thẻ ghi chú ôn tập.</p>
              
              <div className="flex flex-col items-center justify-center p-6 bg-white/[0.02] border border-white/10 rounded-2xl relative">
                <button
                  onClick={handleToggleListen}
                  className={`
                    w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg
                    ${isListening 
                      ? 'bg-red-500/20 text-red-400 border border-red-500 animate-pulse' 
                      : 'bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:scale-105'
                    }
                  `}
                >
                  {isListening ? <MicOff size={32} /> : <Mic.icon size={32} />}
                </button>
                <span className="text-xs text-slate-400 mt-4">
                  {isListening ? 'Hệ thống đang nghe dictation...' : 'Ấn nút để bắt đầu nói'}
                </span>
              </div>

              <div>
                <textarea
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder="Văn bản ghi nhận ở đây..."
                  className="w-full glass-input min-h-[100px] text-xs"
                />
              </div>

              <GlassButton 
                variant="purple" 
                fullWidth 
                onClick={handleSaveNote}
                disabled={!notesText.trim()}
              >
                Lưu Thẻ Ghi Chú
              </GlassButton>
            </GlassCard>
          </div>

          <div className="md:col-span-2">
            <GlassCard className="h-full min-h-[300px] space-y-4">
              <h3 className="font-semibold text-slate-200 pb-2 border-b border-white/5">
                Kho Ghi Chú Tóm Tắt Thông Minh
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedNotes.map((note, index) => (
                  <div key={index} className="p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors relative group">
                    <p className="text-xs text-slate-300 leading-relaxed italic">"{note}"</p>
                    <span className="text-[9px] text-slate-500 mt-3 block">Đã ghi chép bằng Giọng nói AI</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
};

// Custom mic icon helper to bypass direct mapping lookup
const Mic = {
  icon: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
  )
};

export default AiAssistant;
