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
        y: -5,
        scale: 1.015,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.06), 0 0 25px rgba(205, 0, 0, 0.02)'
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
