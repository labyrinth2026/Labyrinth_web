import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glowColor?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hover = true,
}) => {
  return (
    <motion.div
      whileHover={hover ? {
        y: -3,
        boxShadow: '0 12px 40px rgba(0, 91, 172, 0.12)'
      } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
