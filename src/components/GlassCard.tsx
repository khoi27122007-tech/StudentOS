import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  glowColor?: 'purple' | 'indigo' | 'pink' | 'cyan' | 'green' | 'none';
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  glowColor = 'none',
  onClick
}) => {
  const glowStyles = {
    none: '',
    purple: 'hover:shadow-[0_0_20px_rgba(168,85,247,0.25)] hover:border-purple-500/30',
    indigo: 'hover:shadow-[0_0_20px_rgba(99,102,241,0.25)] hover:border-indigo-500/30',
    pink: 'hover:shadow-[0_0_20px_rgba(236,72,153,0.25)] hover:border-pink-500/30',
    cyan: 'hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:border-cyan-500/30',
    green: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:border-emerald-500/30',
  };

  return (
    <div
      onClick={onClick}
      className={`
        glass-panel
        rounded-2xl
        p-5
        text-slate-100
        transition-all
        duration-300
        ease-out
        ${hoverEffect ? 'hover:-translate-y-1 hover:bg-white/[0.04]' : ''}
        ${glowColor !== 'none' ? glowStyles[glowColor] : ''}
        ${onClick ? 'cursor-pointer active:scale-[0.99]' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
export default GlassCard;
