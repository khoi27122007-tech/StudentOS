import React, { useState } from 'react';
import { useStore, type GpaModule } from '../store/useStore';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';
import { Trash2, Edit2, Check, Award, GraduationCap, ChevronRight } from 'lucide-react';

export const GpaPredictor: React.FC = () => {
  const { gpaModules, gpaTarget, setGpaTarget, addGpaModule, updateGpaModule, deleteGpaModule } = useStore();

  // Add module form states
  const [name, setName] = useState('');
  const [credits, setCredits] = useState(3);
  const [weightAtt, setWeightAtt] = useState(10);
  const [weightMid, setWeightMid] = useState(30);
  const [weightFin, setWeightFin] = useState(60);

  // Edit grade states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempAtt, setTempAtt] = useState('');
  const [tempMid, setTempMid] = useState('');
  const [tempFin, setTempFin] = useState('');

  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addGpaModule({
      name,
      credits,
      weightAttendance: weightAtt,
      weightMidterm: weightMid,
      weightFinal: weightFin,
      attendanceGrade: 10,
      midtermGrade: 8,
      expectedGrade: 8
    });

    setName('');
    alert('🎓 Đã thêm học phần mới vào danh sách dự báo!');
  };

  const startEditing = (mod: GpaModule) => {
    setEditingId(mod.id);
    setTempAtt(mod.attendanceGrade?.toString() || '');
    setTempMid(mod.midtermGrade?.toString() || '');
    setTempFin(mod.finalGrade?.toString() || mod.expectedGrade?.toString() || '');
  };

  const saveGrades = (id: string) => {
    updateGpaModule(id, {
      attendanceGrade: tempAtt !== '' ? Number(tempAtt) : undefined,
      midtermGrade: tempMid !== '' ? Number(tempMid) : undefined,
      finalGrade: tempFin !== '' ? Number(tempFin) : undefined,
      expectedGrade: tempFin !== '' ? Number(tempFin) : undefined,
    });
    setEditingId(null);
  };

  // Convert average score on 10-scale to letter grade and 4.0 scale
  const convertToGpa4 = (score: number) => {
    if (score >= 8.5) return { letter: 'A', gpa: 4.0, color: 'text-emerald-400' };
    if (score >= 8.0) return { letter: 'B+', gpa: 3.5, color: 'text-blue-400' };
    if (score >= 7.0) return { letter: 'B', gpa: 3.0, color: 'text-sky-400' };
    if (score >= 6.5) return { letter: 'C+', gpa: 2.5, color: 'text-amber-400' };
    if (score >= 5.5) return { letter: 'C', gpa: 2.0, color: 'text-yellow-400' };
    if (score >= 5.0) return { letter: 'D+', gpa: 1.5, color: 'text-orange-400' };
    if (score >= 4.0) return { letter: 'D', gpa: 1.0, color: 'text-orange-500' };
    return { letter: 'F', gpa: 0.0, color: 'text-red-500 font-bold' };
  };

  // GPA predictions summary math
  let totalCredits = 0;
  let totalPoints = 0;

  const moduleAverages = gpaModules.map((m) => {
    const att = m.attendanceGrade ?? 10;
    const mid = m.midtermGrade ?? 8;
    const fin = m.finalGrade ?? m.expectedGrade ?? 8;

    const overall = (att * m.weightAttendance + mid * m.weightMidterm + fin * m.weightFinal) / 100;
    const gpaInfo = convertToGpa4(overall);

    totalCredits += m.credits;
    totalPoints += gpaInfo.gpa * m.credits;

    // Calculate required final exam score to reach a target course grade of 8.5 (Grade A / GPA 4.0)
    // Formula: 8.5 = (att*W_att + mid*W_mid + fin*W_fin) / 100
    // => fin = (850 - att*W_att - mid*W_mid) / W_fin
    const neededForA = Math.max(0, Math.min(10, 
      (850 - att * m.weightAttendance - mid * m.weightMidterm) / m.weightFinal
    ));

    return {
      ...m,
      overall,
      gpaInfo,
      neededForA
    };
  });

  const cumulativeGpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;

  // AI predictions: Target calculations
  // Estimate target score for the next exams to achieve target GPA
  // Let target GPA sum points needed = gpaTarget * totalCredits
  // Remainder points needed = (gpaTarget * totalCredits) - current achieved points (excluding missing finals)
  const scholarshipChance = () => {
    if (cumulativeGpa >= 3.6) return { pct: 95, label: 'Xuất sắc (Khả năng rất cao)' };
    if (cumulativeGpa >= 3.2) return { pct: 75, label: 'Giỏi (Khả năng cao)' };
    if (cumulativeGpa >= 2.8) return { pct: 30, label: 'Khá (Trung bình)' };
    return { pct: 5, label: 'Thấp (Cần cố gắng)' };
  };

  const scholarship = scholarshipChance();

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pt-6 pb-24 space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            GPA Predictor (Dự phóng học lực)
          </h2>
          <p className="text-slate-400 text-sm">Dự báo kết quả học tập kỳ học, đề xuất điểm thi tối thiểu và khả năng nhận học bổng.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: GPA Overview and Targets */}
        <div className="space-y-6">
          <GlassCard glowColor="purple" className="flex flex-col justify-between p-6 min-h-[220px]">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-300 flex items-center gap-2">
                <GraduationCap size={18} className="text-purple-400" />
                Điểm GPA Dự Kiến
              </h3>
              <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full font-semibold">Hiện tại</span>
            </div>

            <div className="my-3 flex items-baseline gap-2">
              <span className="text-6xl font-extrabold tracking-tight text-white text-neon-purple">
                {cumulativeGpa.toFixed(2)}
              </span>
              <span className="text-slate-400">/ 4.00</span>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>GPA Mục tiêu:</span>
                <span className="font-bold text-white">{gpaTarget}</span>
              </div>
              <input 
                type="range"
                min="2.0"
                max="4.0"
                step="0.05"
                value={gpaTarget}
                onChange={(e) => setGpaTarget(Number(e.target.value))}
                className="w-full accent-purple-500 bg-slate-800"
              />
            </div>
          </GlassCard>

          {/* Scholarship probability predictions */}
          <GlassCard className="space-y-4">
            <h3 className="font-semibold text-slate-200 flex items-center gap-2">
              <Award size={18} className="text-pink-400" />
              Khả Năng Đạt Học Bổng
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-bold text-white">{scholarship.pct}% xác suất</span>
                <span className="text-xs text-slate-400">Xếp hạng: {scholarship.label}</span>
              </div>

              <div className="w-full bg-slate-800 rounded-full h-2 border border-white/5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${
                    scholarship.pct > 70 ? 'bg-gradient-to-r from-emerald-500 to-indigo-500' :
                    scholarship.pct > 25 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                    'bg-gradient-to-r from-red-500 to-pink-500'
                  }`}
                  style={{ width: `${scholarship.pct}%` }}
                ></div>
              </div>
              
              <p className="text-[10px] text-slate-400 leading-relaxed italic">
                *Đánh giá dựa trên chính sách phân phối học bổng đại học thông thường (GPA &gt; 3.2 ở mức giỏi, GPA &gt; 3.6 ở mức xuất sắc).
              </p>
            </div>
          </GlassCard>

          {/* Add Course form for GPA prediction */}
          <GlassCard className="space-y-4">
            <h3 className="font-semibold text-slate-200">Thêm Môn Học Dự Báo</h3>
            <form onSubmit={handleAddModule} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Tên môn học</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Cơ sở dữ liệu"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Số tín chỉ</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={credits}
                    onChange={(e) => setCredits(Number(e.target.value))}
                    className="w-full glass-input text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Tỷ lệ (Chuyên cần%)</label>
                  <input
                    type="number"
                    value={weightAtt}
                    onChange={(e) => setWeightAtt(Number(e.target.value))}
                    className="w-full glass-input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Tỷ lệ (Giữa kỳ%)</label>
                  <input
                    type="number"
                    value={weightMid}
                    onChange={(e) => setWeightMid(Number(e.target.value))}
                    className="w-full glass-input text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Tỷ lệ (Cuối kỳ%)</label>
                  <input
                    type="number"
                    value={weightFin}
                    onChange={(e) => setWeightFin(Number(e.target.value))}
                    className="w-full glass-input text-xs"
                  />
                </div>
              </div>

              <GlassButton type="submit" variant="purple" fullWidth size="sm" className="mt-2">
                Thêm Môn Học
              </GlassButton>
            </form>
          </GlassCard>
        </div>

        {/* Right Columns: Subjects Grade Editor and Targets */}
        <div className="lg:col-span-2">
          <GlassCard className="space-y-4">
            <h3 className="font-semibold text-slate-200">Bảng Điểm Dự Báo Chi Tiết</h3>
            
            <div className="space-y-4 overflow-y-auto max-h-[500px] pr-1">
              {moduleAverages.map((m) => {
                const isEditing = editingId === m.id;
                
                return (
                  <div 
                    key={m.id}
                    className="p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all space-y-3"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-bold text-white text-sm">{m.name}</h4>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Tín chỉ: {m.credits} | Trọng số: {m.weightAttendance}/{m.weightMidterm}/{m.weightFinal}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className={`text-base font-extrabold block ${m.gpaInfo.color}`}>
                          Điểm 10: {m.overall.toFixed(1)} ({m.gpaInfo.letter})
                        </span>
                        <span className="text-[10px] text-slate-500 block">Quy đổi: {m.gpaInfo.gpa.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Grade Editor block */}
                    {isEditing ? (
                      <div className="grid grid-cols-4 gap-2 items-end bg-black/20 p-3 rounded-lg border border-white/5">
                        <div>
                          <label className="text-[9px] text-slate-400 block mb-1">Chuyên cần</label>
                          <input 
                            type="number" step="0.1" min="0" max="10"
                            value={tempAtt} onChange={(e) => setTempAtt(e.target.value)}
                            className="w-full glass-input text-xs py-1 px-2"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-400 block mb-1">Giữa kỳ</label>
                          <input 
                            type="number" step="0.1" min="0" max="10"
                            value={tempMid} onChange={(e) => setTempMid(e.target.value)}
                            className="w-full glass-input text-xs py-1 px-2"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-400 block mb-1">Cuối kỳ/Dự kiến</label>
                          <input 
                            type="number" step="0.1" min="0" max="10"
                            value={tempFin} onChange={(e) => setTempFin(e.target.value)}
                            className="w-full glass-input text-xs py-1 px-2"
                          />
                        </div>
                        <GlassButton 
                          variant="green" size="sm" onClick={() => saveGrades(m.id)}
                          className="py-1 px-3 w-full"
                        >
                          <Check size={12} />
                        </GlassButton>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center bg-white/[0.01] p-2.5 rounded-lg text-xs text-slate-300">
                        <div className="flex gap-4">
                          <span>Chuyên cần: <strong>{m.attendanceGrade ?? 'N/A'}</strong></span>
                          <span>Giữa kỳ: <strong>{m.midtermGrade ?? 'N/A'}</strong></span>
                          <span>Cuối kỳ: <strong>{m.finalGrade ?? m.expectedGrade ?? 'Dự phóng'}</strong></span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditing(m)}
                            className="text-slate-500 hover:text-white p-1"
                            title="Sửa điểm số"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => deleteGpaModule(m.id)}
                            className="text-slate-500 hover:text-red-400 p-1"
                            title="Xóa môn"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* AI minimum required recommendation */}
                    {m.finalGrade === undefined && (
                      <div className="text-[10px] bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-lg text-purple-300 flex items-center justify-between">
                        <span>💡 Mục tiêu điểm A: Cần thi đạt tối thiểu <strong>{m.neededForA.toFixed(1)}</strong> cuối kỳ.</span>
                        <ChevronRight size={10} />
                      </div>
                    )}
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
export default GpaPredictor;
