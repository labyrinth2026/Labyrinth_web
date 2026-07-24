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
          <span className={`font-bold tracking-widest uppercase text-[10px] mb-2.5 block ${
            light ? 'text-slate-400' : 'text-[#CD0000]'
          }`}>
            {subtitle}
          </span>
        )}
        <h2 className={`text-2xl md:text-4xl font-extrabold mb-0 tracking-tight leading-tight ${
          light ? 'text-white' : 'text-slate-900'
        }`}>
          {title}
        </h2>
      </motion.div>
    </div>
  );
};

export default SectionHeading;
