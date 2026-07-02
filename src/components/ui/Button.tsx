"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  href?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  className = '',
  href,
  type = 'button',
  disabled = false
}) => {
  const router = useRouter();

  const baseClasses = "relative inline-flex items-center justify-center rounded-full font-bold transition-all duration-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#CD0000]/20 focus:ring-offset-2";

  const sizeClasses = {
    sm: "px-4 py-2 text-[10px] uppercase tracking-widest",
    md: "px-6 py-3 text-[11px] uppercase tracking-widest",
    lg: "px-8 py-3.5 text-xs uppercase tracking-widest"
  };

  const variantClasses = {
    primary: "bg-[#CD0000] text-white shadow-sm hover:bg-[#9E0000] active:scale-[0.98]",
    secondary: "bg-slate-100 text-slate-800 border border-slate-200/60 hover:bg-slate-200/70 hover:text-slate-900 active:scale-[0.98]",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-900/5 hover:text-slate-950 active:scale-[0.98]",
    outline: "bg-transparent text-[#CD0000] border border-slate-200 hover:border-[#CD0000] hover:bg-[#CD0000]/5 active:scale-[0.98]"
  };

  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "";

  const isExternal = href && (href.startsWith('http') || href.startsWith('mailto:'));
  const Component = isExternal ? motion.a : motion.button;
  
  const handleClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    if (href && !isExternal) {
      e.preventDefault();
      router.push(href);
    } else if (onClick) {
      onClick();
    }
  };

  const props: any = isExternal ? { href, target: "_blank", rel: "noreferrer" } : { type, onClick: handleClick };

  return (
    <Component
      {...props}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses} ${className}`}
    >
      <span className="relative z-10 flex items-center gap-1">{children}</span>
    </Component>
  );
};

export default Button;
