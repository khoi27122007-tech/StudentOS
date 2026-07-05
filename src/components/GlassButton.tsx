import React from 'react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'purple' | 'indigo' | 'pink' | 'cyan' | 'green' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyle = "liquid-glass-btn font-medium rounded-xl inline-flex items-center justify-center transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";
  
  const variants = {
    primary: "bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/40 hover:shadow-[0_0_15px_rgba(255,255,255,0.15)]",
    secondary: "bg-white/[0.03] text-slate-300 border-white/5 hover:bg-white/[0.08] hover:text-white",
    purple: "bg-purple-500/10 text-purple-200 border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/40 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]",
    indigo: "bg-indigo-500/10 text-indigo-200 border-indigo-500/20 hover:bg-indigo-500/20 hover:border-indigo-500/40 hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]",
    pink: "bg-pink-500/10 text-pink-200 border-pink-500/20 hover:bg-pink-500/20 hover:border-pink-500/40 hover:shadow-[0_0_15px_rgba(236,72,153,0.3)]",
    cyan: "bg-cyan-500/10 text-cyan-200 border-cyan-500/20 hover:bg-cyan-500/20 hover:border-cyan-500/40 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]",
    green: "bg-emerald-500/10 text-emerald-200 border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]",
    danger: "bg-red-500/10 text-red-200 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-base",
    lg: "px-6 py-3.5 text-lg"
  };

  return (
    <button
      className={`
        ${baseStyle}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};
export default GlassButton;
