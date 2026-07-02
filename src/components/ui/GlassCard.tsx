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
        y: -2,
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.06)'
      } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        background: 'rgba(255, 255, 255, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
      }}
      className={`rounded-3xl overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
