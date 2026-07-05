import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';
import { Laptop, Mail, Lock, User, Sparkles } from 'lucide-react';

export const Auth: React.FC = () => {
  const { login, register } = useStore();
  const [isLogin, setIsLogin] = useState(true);
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Vui lòng điền đầy đủ email và mật khẩu.');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có độ dài tối thiểu 6 ký tự.');
      return;
    }

    if (isLogin) {
      // Login flow
      const success = login(email, password);
      if (!success) {
        setError('Sai email hoặc mật khẩu. Vui lòng kiểm tra lại.');
      }
    } else {
      // Register flow
      if (!name.trim()) {
        setError('Vui lòng điền tên hiển thị.');
        return;
      }
      const success = register(name, email, password);
      if (success) {
        alert('🎉 Đăng ký thành công! Hãy đăng nhập với tài khoản mới.');
        setIsLogin(true);
        setPassword('');
      } else {
        setError('Email này đã tồn tại trên hệ thống.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#030014]">
      {/* Background radial glowing gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full bg-purple-900/10 blur-[130px] pointer-events-none"></div>
      <div className="absolute top-[20%] left-[30%] w-[30vw] h-[30vw] rounded-full bg-indigo-900/10 blur-[100px] pointer-events-none"></div>

      <GlassCard glowColor="purple" className="w-full max-w-md p-8 border-white/10 relative shadow-[0_0_50px_rgba(168,85,247,0.15)] flex flex-col items-center">
        {/* Logo banner */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 via-pink-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20 mb-4 animate-float">
          <Laptop className="text-white" size={28} />
        </div>
        
        <h2 className="text-2xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent tracking-tight text-center">
          StudentOS Portal
        </h2>
        <p className="text-xs text-slate-400 mt-1 mb-6 text-center font-medium uppercase tracking-wider">
          Hệ Điều Hành Học Tập Thông Minh
        </p>

        {error && (
          <div className="w-full p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl mb-4 font-semibold text-center animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {/* Display name field (Register only) */}
          {!isLogin && (
            <div className="relative">
              <span className="absolute left-3 top-3.5 text-slate-500">
                <User size={16} />
              </span>
              <input
                type="text"
                required
                placeholder="Tên hiển thị"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full glass-input pl-10 text-sm"
              />
            </div>
          )}

          {/* Email field */}
          <div className="relative">
            <span className="absolute left-3 top-3.5 text-slate-500">
              <Mail size={16} />
            </span>
            <input
              type="email"
              required
              placeholder="Địa chỉ Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full glass-input pl-10 text-sm"
            />
          </div>

          {/* Password field */}
          <div className="relative">
            <span className="absolute left-3 top-3.5 text-slate-500">
              <Lock size={16} />
            </span>
            <input
              type="password"
              required
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full glass-input pl-10 text-sm"
            />
          </div>

          <GlassButton type="submit" variant="purple" fullWidth className="py-3 gap-2 mt-2">
            <Sparkles size={16} />
            <span>{isLogin ? 'Đăng Nhập' : 'Đăng Ký Tài Khoản'}</span>
          </GlassButton>
        </form>

        {/* Auth Mode Toggle link */}
        <div className="mt-6 text-xs text-slate-400 font-semibold">
          {isLogin ? (
            <span>
              Chưa có tài khoản?{' '}
              <button 
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                }}
                className="text-purple-400 hover:text-purple-300 underline font-bold"
              >
                Đăng ký ngay
              </button>
            </span>
          ) : (
            <span>
              Đã có tài khoản?{' '}
              <button 
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                }}
                className="text-purple-400 hover:text-purple-300 underline font-bold"
              >
                Đăng nhập
              </button>
            </span>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default Auth;
