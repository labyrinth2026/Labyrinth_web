import React from 'react';
import { motion } from 'framer-motion';

import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const baseClasses = "relative inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#005BAC]/30 focus:ring-offset-2";

  const sizeClasses = {
    sm: "px-5 py-2 text-sm",
    md: "px-7 py-3 text-base",
    lg: "px-9 py-4 text-lg"
  };

  const variantClasses = {
    primary: "bg-[#005BAC] text-white shadow-md hover:bg-[#004a8f] hover:shadow-lg hover:shadow-[#005BAC]/20 active:scale-95",
    secondary: "bg-white text-[#005BAC] border-2 border-[#005BAC] hover:bg-[#EAF4FF] active:scale-95",
    ghost: "bg-transparent text-[#005BAC] hover:bg-[#EAF4FF] active:scale-95",
    outline: "bg-transparent text-[#005BAC] border border-[#005BAC]/40 hover:border-[#005BAC] hover:bg-[#EAF4FF] active:scale-95"
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
      navigate(href);
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
