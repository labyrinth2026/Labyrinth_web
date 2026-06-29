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

  const baseClasses = "relative inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#0B1F63]/30 focus:ring-offset-2";

  const sizeClasses = {
    sm: "px-5 py-2 text-sm",
    md: "px-7 py-3 text-base",
    lg: "px-9 py-4 text-lg"
  };

  const variantClasses = {
    primary: "bg-[#0B1F63] text-white shadow-md hover:bg-[#071545] hover:shadow-lg hover:shadow-[#0B1F63]/20 active:scale-95",
    secondary: "bg-white text-[#0B1F63] border-2 border-[#0B1F63] hover:bg-[rgba(11,31,99,0.03)] active:scale-95",
    ghost: "bg-transparent text-[#0B1F63] hover:bg-[rgba(11,31,99,0.03)] active:scale-95",
    outline: "bg-transparent text-[#0B1F63] border border-[#0B1F63]/40 hover:border-[#0B1F63] hover:bg-[rgba(11,31,99,0.03)] active:scale-95"
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
