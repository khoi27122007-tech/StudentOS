import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';
import { Settings, Key, Database, RefreshCw, Save } from 'lucide-react';

export const SettingsDrawer: React.FC = () => {
  const { user, resetAllData, updateUserProfile } = useStore();
  
  // Local form states
  const [userName, setUserName] = useState(user.name);
  const [geminiKey, setGeminiKey] = useState(user.apiKeys.gemini || '');
  const [openaiKey, setOpenaiKey] = useState(user.apiKeys.openai || '');
  
  // Firebase local form states
  const [apiKey, setApiKey] = useState(user.firebaseConfig?.apiKey || '');
  const [projectId, setProjectId] = useState(user.firebaseConfig?.projectId || '');
  const [authDomain, setAuthDomain] = useState(user.firebaseConfig?.authDomain || '');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: userName,
      apiKeys: {
        gemini: geminiKey,
        openai: openaiKey
      },
      firebaseConfig: {
        apiKey,
        projectId,
        authDomain
      }
    });
    alert('💾 Đã lưu cấu hình cài đặt của bạn!');
  };

  const handleReset = () => {
    if (confirm('⚠️ Bạn có chắc chắn muốn khôi phục toàn bộ dữ liệu về mặc định ban đầu? Tất cả thay đổi sẽ mất.')) {
      resetAllData();
      alert('🔄 Đã khôi phục dữ liệu mặc định.');
      window.location.reload();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pt-6 pb-24 space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">
          <Settings size={28} className="text-purple-400" />
          Cấu Hình Hệ Thống
        </h2>
        <p className="text-slate-400 text-sm">Quản lý khóa API trí tuệ nhân tạo, thiết lập bảo mật và đồng bộ đám mây Firebase.</p>
      </div>

      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* API keys config */}
        <div className="space-y-6">
          <GlassCard className="space-y-4">
            <h3 className="font-semibold text-slate-200 flex items-center gap-2">
              <Key size={18} className="text-purple-400" />
              Khóa API Dịch Vụ AI
            </h3>
            
            <div>
              <label className="text-xs text-slate-400 block mb-1">Họ và tên người dùng</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full glass-input text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Google Gemini API Key</label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="w-full glass-input text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">OpenAI API Key</label>
              <input
                type="password"
                placeholder="sk-proj-..."
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                className="w-full glass-input text-sm"
              />
            </div>
            
            <p className="text-[10px] text-slate-500 leading-relaxed leading-3">
              *Khóa API được lưu trữ cục bộ mã hóa an toàn trong bộ nhớ trình duyệt của riêng bạn. Nếu để trống, hệ thống sẽ sử dụng AI giả lập chất lượng cao.
            </p>
          </GlassCard>
        </div>

        {/* Firebase config & resets */}
        <div className="space-y-6">
          <GlassCard className="space-y-4">
            <h3 className="font-semibold text-slate-200 flex items-center gap-2">
              <Database size={18} className="text-indigo-400" />
              Đồng Bộ Firebase Firestore
            </h3>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Firebase API Key</label>
              <input
                type="password"
                placeholder="AIzaSyB..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full glass-input text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Firebase Project ID</label>
              <input
                type="text"
                placeholder="studentos-app-123"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full glass-input text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Firebase Auth Domain</label>
              <input
                type="text"
                placeholder="studentos-app.firebaseapp.com"
                value={authDomain}
                onChange={(e) => setAuthDomain(e.target.value)}
                className="w-full glass-input text-sm"
              />
            </div>
          </GlassCard>

          {/* Dangerous Actions */}
          <GlassCard className="space-y-4 border-red-500/10 bg-red-500/[0.01]">
            <h3 className="font-semibold text-red-400 flex items-center gap-2">
              <RefreshCw size={18} className="text-red-500" />
              Quản Trị Hệ Thống
            </h3>
            <p className="text-xs text-slate-400">Đặt lại toàn bộ cơ sở dữ liệu học kỳ về giá trị mẫu mặc định.</p>
            
            <GlassButton 
              type="button" 
              variant="danger" 
              onClick={handleReset}
              className="w-full gap-2 py-2 text-xs"
            >
              Reset Cơ Sở Dữ Liệu
            </GlassButton>
          </GlassCard>
        </div>

        {/* Global Save Button */}
        <div className="md:col-span-2 flex justify-end">
          <GlassButton type="submit" variant="purple" className="gap-2 px-6">
            <Save size={18} /> Lưu Cấu Hình Hệ Thống
          </GlassButton>
        </div>
      </form>
    </div>
  );
};
export default SettingsDrawer;
