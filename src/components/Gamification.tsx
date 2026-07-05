import React from 'react';
import { useStore } from '../store/useStore';
import GlassCard from './GlassCard';
import { Flame, Star, Trophy, Sparkles } from 'lucide-react';

const AVATARS = [
  { char: '🎓', minLevel: 1, label: 'Tân sinh viên' },
  { char: '⚡', minLevel: 2, label: 'Năng lượng xanh' },
  { char: '🚀', minLevel: 4, label: 'Tăng tốc nhanh' },
  { char: '🧙', minLevel: 6, label: 'Phù thủy học thuật' },
  { char: '👑', minLevel: 10, label: 'Huyền thoại học đường' },
];

export const Gamification: React.FC = () => {
  const { user, tasks, sessions, updateUserProfile } = useStore();

  const completedTasksCount = tasks.filter(t => t.status === 'completed').length;
  const totalStudyMinutes = sessions.reduce((acc, s) => acc + s.duration, 0);

  // Dynamic achievement checking
  const achievements = [
    {
      id: 'a1',
      title: 'Bước Chân Đầu Tiên',
      desc: 'Bắt đầu một phiên tập trung học bài.',
      xp: 50,
      isUnlocked: sessions.length > 0
    },
    {
      id: 'a2',
      title: 'Hủy Diệt Deadline',
      desc: 'Hoàn thành 3 bài tập lớn trong học kỳ.',
      xp: 150,
      isUnlocked: completedTasksCount >= 3
    },
    {
      id: 'a3',
      title: 'Độ Tập Trung Cao Độ',
      desc: 'Học liên tục tổng cộng 120 phút.',
      xp: 200,
      isUnlocked: totalStudyMinutes >= 120
    },
    {
      id: 'a4',
      title: 'Kỷ Luật Thép',
      desc: 'Duy trì chuỗi học tập (Streak) từ 5 ngày trở lên.',
      xp: 250,
      isUnlocked: user.streak >= 5
    }
  ];

  const handleSelectAvatar = (char: string) => {
    updateUserProfile({ avatar: char });
  };

  const xpNeeded = user.level * 300;
  const xpPercentage = Math.min(100, Math.round((user.exp / xpNeeded) * 100));

  // SVGs for Growth Tree based on level
  // level 1: small trunk
  // level 2: trunk + simple branches
  // level 3: trunk + branches + leaves
  // level 4+: trunk + branches + leaves + flowers (neon-pink blossoms)
  const treeLevel = Math.min(4, user.level);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pt-6 pb-24 space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
          Động Lực Học Tập (Gamify)
        </h2>
        <p className="text-slate-400 text-sm">Gặt hái điểm kinh nghiệm EXP để thăng cấp, mở khóa danh hiệu và nuôi cây học tập.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Stats & Avatar unlocked */}
        <div className="space-y-6">
          {/* Level Progress */}
          <GlassCard className="space-y-4">
            <h3 className="font-semibold text-slate-200 flex items-center gap-2">
              <Star size={18} className="text-yellow-400" />
              Thứ Hạng & Cấp Độ
            </h3>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                {user.avatar}
              </div>
              <div>
                <h4 className="font-bold text-white text-lg">{user.name}</h4>
                <p className="text-xs text-purple-400 font-semibold">Cấp độ {user.level}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-semibold text-slate-400">
                <span>Điểm EXP: {user.exp} / {xpNeeded}</span>
                <span>{xpPercentage}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 border border-white/5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${xpPercentage}%` }}
                ></div>
              </div>
            </div>
          </GlassCard>

          {/* Avatar unlock panel */}
          <GlassCard className="space-y-4">
            <h3 className="font-semibold text-slate-200">Kho Avatar Danh Hiệu</h3>
            
            <div className="space-y-3">
              {AVATARS.map((av) => {
                const isUnlocked = user.level >= av.minLevel;
                const isSelected = user.avatar === av.char;
                
                return (
                  <div 
                    key={av.char}
                    onClick={() => isUnlocked && handleSelectAvatar(av.char)}
                    className={`
                      flex items-center justify-between p-2.5 rounded-xl border transition-all duration-300
                      ${!isUnlocked ? 'opacity-40 border-white/5 bg-black/10 cursor-not-allowed' : 'cursor-pointer'}
                      ${isSelected ? 'bg-purple-500/10 border-purple-500/40 text-white' : 'border-transparent bg-white/[0.01] hover:border-white/10'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{av.char}</span>
                      <div>
                        <h5 className="font-semibold text-sm">{av.label}</h5>
                        <p className="text-[10px] text-slate-400">Yêu cầu: Cấp độ {av.minLevel}</p>
                      </div>
                    </div>

                    {isUnlocked && (
                      <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase">
                        {isSelected ? 'Đang chọn' : 'Chọn'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Center: The virtual Growth Tree */}
        <div className="space-y-6">
          <GlassCard glowColor="purple" className="flex flex-col items-center justify-center py-6 h-full relative">
            <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-1.5">
              <Sparkles size={16} className="text-purple-400 animate-pulse" />
              Cây Phát Triển Học Tập
            </h3>
            <p className="text-[11px] text-slate-400 text-center mb-6 max-w-[200px]">Cây sẽ mọc thêm cành, lá và hoa khi bạn thăng cấp!</p>

            {/* Growth Tree Vector representation */}
            <div className="relative w-56 h-64 flex items-end justify-center">
              <svg viewBox="0 0 100 120" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
                {/* Pot */}
                <path d="M35 110 L65 110 L60 120 L40 120 Z" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                <ellipse cx="50" cy="110" rx="15" ry="3" fill="rgba(10,10,25,0.5)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                
                {/* Level 1: Trunk */}
                {treeLevel >= 1 && (
                  <path 
                    d="M50 110 L50 70" 
                    stroke="#8b5a2b" 
                    strokeWidth="5" 
                    strokeLinecap="round" 
                    className="tree-branch" 
                  />
                )}

                {/* Level 2: Left/Right Branches */}
                {treeLevel >= 2 && (
                  <>
                    <path 
                      d="M50 85 Q35 75 30 60" 
                      stroke="#8b5a2b" 
                      strokeWidth="3.5" 
                      strokeLinecap="round" 
                      className="tree-branch" 
                    />
                    <path 
                      d="M50 80 Q65 70 70 55" 
                      stroke="#8b5a2b" 
                      strokeWidth="3.5" 
                      strokeLinecap="round" 
                      className="tree-branch" 
                    />
                  </>
                )}

                {/* Level 3: Small twigs and Green Leaves */}
                {treeLevel >= 3 && (
                  <>
                    <path d="M50 70 Q45 55 50 40" stroke="#8b5a2b" strokeWidth="2.5" strokeLinecap="round" className="tree-branch" />
                    
                    {/* Green Leaves represented as SVG paths with scale animation classes */}
                    {/* Left side leaves */}
                    <path d="M30 60 Q20 58 24 50 Q32 52 30 60 Z" fill="#10b981" className="tree-leaf tree-leaf-active" />
                    <path d="M32 65 Q25 73 22 66 Q29 60 32 65 Z" fill="#047857" className="tree-leaf tree-leaf-active" />
                    {/* Right side leaves */}
                    <path d="M70 55 Q80 53 76 45 Q68 47 70 55 Z" fill="#10b981" className="tree-leaf tree-leaf-active" />
                    <path d="M68 60 Q75 68 78 61 Q71 55 68 60 Z" fill="#047857" className="tree-leaf tree-leaf-active" />
                    {/* Top leaves */}
                    <path d="M50 40 Q40 32 46 26 Q56 28 50 40 Z" fill="#34d399" className="tree-leaf tree-leaf-active" />
                  </>
                )}

                {/* Level 4+: Pink flowers/blossoms */}
                {treeLevel >= 4 && (
                  <>
                    {/* Branch extenders */}
                    <path d="M30 60 Q22 45 15 40" stroke="#8b5a2b" strokeWidth="1.5" strokeLinecap="round" className="tree-branch" />
                    <path d="M70 55 Q78 40 85 35" stroke="#8b5a2b" strokeWidth="1.5" strokeLinecap="round" className="tree-branch" />

                    {/* Left Pink flower */}
                    <circle cx="15" cy="40" r="3.5" fill="#f472b6" className="tree-leaf tree-leaf-active shadow-lg" />
                    <circle cx="13" cy="38" r="2.5" fill="#ec4899" className="tree-leaf tree-leaf-active" />
                    <circle cx="17" cy="42" r="2.5" fill="#ec4899" className="tree-leaf tree-leaf-active" />
                    
                    {/* Right Pink flower */}
                    <circle cx="85" cy="35" r="3.5" fill="#f472b6" className="tree-leaf tree-leaf-active" />
                    <circle cx="83" cy="33" r="2.5" fill="#ec4899" className="tree-leaf tree-leaf-active" />
                    <circle cx="87" cy="37" r="2.5" fill="#ec4899" className="tree-leaf tree-leaf-active" />

                    {/* Top Pink flower */}
                    <circle cx="46" cy="26" r="4" fill="#fb7185" className="tree-leaf tree-leaf-active" />
                    <circle cx="48" cy="24" r="2" fill="#e11d48" className="tree-leaf tree-leaf-active" />
                  </>
                )}
              </svg>
            </div>
            
            <div className="mt-4 text-xs font-semibold text-purple-300">
              Trạng thái cây: {
                user.level >= 4 ? 'Trổ hoa rực rỡ 🌸' :
                user.level >= 3 ? 'Xanh mướt nhiều lá 🍃' :
                user.level >= 2 ? 'Đang mọc cành nhánh 🌱' :
                'Hạt mầm / Thân cây 🪵'
              }
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Achievements & Streak */}
        <div className="space-y-6">
          
          {/* Active streak */}
          <GlassCard className="flex items-center gap-4 py-4 bg-amber-500/5 border-amber-500/10">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <Flame className="text-amber-500 fill-amber-500" size={24} />
            </div>
            <div>
              <h4 className="font-bold text-white text-lg">{user.streak} Ngày Liên Tiếp</h4>
              <p className="text-xs text-slate-400">Hãy học ít nhất 1 phiên mỗi ngày để giữ streak!</p>
            </div>
          </GlassCard>

          {/* Achievement List */}
          <GlassCard className="space-y-4">
            <h3 className="font-semibold text-slate-200 flex items-center gap-2">
              <Trophy size={18} className="text-purple-400" />
              Thành Tựu Đạt Được
            </h3>

            <div className="space-y-3">
              {achievements.map((ach) => (
                <div 
                  key={ach.id}
                  className={`
                    p-3 rounded-xl border flex gap-3 transition-colors duration-300
                    ${ach.isUnlocked 
                      ? 'bg-purple-500/5 border-purple-500/20 text-slate-200' 
                      : 'bg-black/20 border-white/5 text-slate-500'
                    }
                  `}
                >
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5
                    ${ach.isUnlocked ? 'bg-purple-500/20 text-purple-300' : 'bg-white/5 text-slate-600'}
                  `}>
                    <Trophy size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h5 className={`font-semibold text-sm truncate ${ach.isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                        {ach.title}
                      </h5>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        ach.isUnlocked ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-slate-600'
                      }`}>
                        +{ach.xp} XP
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 leading-tight">{ach.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
export default Gamification;
