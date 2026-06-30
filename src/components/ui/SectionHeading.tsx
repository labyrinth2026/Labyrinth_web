import React from 'react';
import { motion } from 'framer-motion';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  gradient?: boolean;
  className?: string;
  light?: boolean; // for use on dark/blue backgrounds
}

const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  subtitle,
  align = 'center',
  gradient = false,
  className = '',
  light = false
}) => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={`mb-12 ${align === 'center' ? 'text-center' : 'text-left'} ${className}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {subtitle && (
          <span className={`font-bold tracking-widest uppercase text-xs mb-3 block ${
            light ? 'text-[#B8B8B8]' : 'text-[#CD0000]'
          }`}>
            {subtitle}
          </span>
        )}
        <h2 className={`font-grotesk text-3xl md:text-5xl font-black mb-5 tracking-tighter leading-none ${
          gradient
            ? 'gradient-text'
            : light
            ? 'text-[#EFEDE6]'
            : 'text-[#121212]'
        }`}>
          {title}
        </h2>

        {/* Accent Line */}
        <motion.div
          className={`h-1 rounded-full ${
            align === 'center' ? 'mx-auto' : ''
          } ${light ? 'bg-[#EFEDE6]/40' : 'bg-[#CD0000]'}`}
          initial={{ width: 0 }}
          animate={isVisible ? { width: 56 } : { width: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "circOut" }}
        />
      </motion.div>
    </div>
  );
};

export default SectionHeading;
