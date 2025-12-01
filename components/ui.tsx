import React from 'react';

// --- BUTTON ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  className = '', 
  variant = 'primary', 
  size = 'md', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg transition-all duration-200 font-medium tracking-wide disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gold-500 hover:bg-gold-400 text-black shadow-lg shadow-gold-900/20",
    secondary: "bg-zinc-800 hover:bg-zinc-700 text-white",
    outline: "border border-gold-500/50 text-gold-500 hover:bg-gold-500/10",
    ghost: "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-4 text-base"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

// --- INPUT ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, icon, className = '', ...props }) => {
  return (
    <div className="space-y-1.5 w-full">
      {label && <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider ml-1">{label}</label>}
      <div className="relative">
        <input 
          className={`w-full bg-zinc-900/50 border border-zinc-800 text-white rounded-lg pl-3 pr-3 py-3 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/50 transition-all placeholder-zinc-600 ${icon ? 'pl-10' : ''} ${className}`}
          {...props}
        />
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

// --- CARD ---
export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-zinc-950 border border-zinc-800 rounded-xl p-6 relative overflow-hidden ${className}`}>
    {children}
  </div>
);

// --- STEPPER ---
export const Stepper: React.FC<{ value: number; onChange: (v: number) => void; min?: number; max?: number; label: string }> = ({ value, onChange, min = 0, max = 100, label }) => {
  return (
    <div className="flex items-center justify-between bg-zinc-900 p-2 rounded-lg border border-zinc-800">
      <span className="text-zinc-400 text-sm ml-2">{label}</span>
      <div className="flex items-center gap-3">
        <button onClick={() => onChange(Math.max(min, value - 1))} className="w-8 h-8 rounded bg-zinc-800 text-white flex items-center justify-center hover:bg-zinc-700">-</button>
        <span className="w-8 text-center font-mono text-gold-500">{value}</span>
        <button onClick={() => onChange(Math.min(max, value + 1))} className="w-8 h-8 rounded bg-zinc-800 text-white flex items-center justify-center hover:bg-zinc-700">+</button>
      </div>
    </div>
  )
}
