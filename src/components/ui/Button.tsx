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

  const baseClasses = "relative inline-flex items-center justify-center rounded-full font-bold transition-all duration-300 overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#CD0000]/30 focus:ring-offset-2";

  const sizeClasses = {
    sm: "px-5 py-2 text-xs uppercase tracking-wider",
    md: "px-7 py-3 text-sm uppercase tracking-wider",
    lg: "px-9 py-4 text-base uppercase tracking-wider"
  };

  const variantClasses = {
    primary: "bg-[#CD0000] text-[#EFEDE6] shadow-md hover:bg-[#A30000] hover:shadow-lg hover:shadow-[#CD0000]/25 active:scale-95",
    secondary: "bg-[#EFEDE6] text-[#121212] border border-[#B8B8B8] hover:bg-[#F4F2EC] hover:border-[#121212] active:scale-95",
    ghost: "bg-transparent text-[#CD0000] hover:bg-[#CD0000]/5 active:scale-95",
    outline: "bg-transparent text-[#CD0000] border border-[#CD0000] hover:bg-[#CD0000] hover:text-[#EFEDE6] active:scale-95"
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
