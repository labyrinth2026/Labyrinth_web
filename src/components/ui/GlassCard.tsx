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
        y: -4,
        boxShadow: '0 20px 40px rgba(18, 18, 18, 0.08)'
      } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`bg-white border border-[#B8B8B8]/30 rounded-3xl shadow-sm overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
