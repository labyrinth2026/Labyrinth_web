import React from 'react';
import * as LucideIcons from 'lucide-react';
import { motion } from 'framer-motion';

export interface VerticalType {
  id: string;
  name: string;
  description: string;
  category: 'tech' | 'non-tech';
  icon: string;
  color: string;
  head: { name: string; email: string; linkedin: string };
  subHead: { name: string; email: string; linkedin: string };
}

interface VerticalCardProps {
  vertical: VerticalType;
}

const VerticalCard: React.FC<VerticalCardProps> = ({ vertical }) => {
  const IconComponent = (LucideIcons as any)[vertical.icon] || LucideIcons.Layers;

  return (
    <motion.div
      whileHover={{ 
        y: -5, 
        scale: 1.015,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.06), 0 0 25px rgba(205, 0, 0, 0.02)' 
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 h-full flex flex-col group relative overflow-hidden"
    >
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-[#CD0000] bg-[#CD0000]/5 border border-[#CD0000]/10 transition-transform duration-300 group-hover:scale-105"
          >
            <IconComponent size={22} />
          </div>
          <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-slate-200 bg-slate-50 text-slate-600"
          >
            {vertical.category}
          </span>
        </div>

        {/* Content */}
        <h3 className="text-base font-bold text-slate-900 mb-2 tracking-tight group-hover:text-[#CD0000] transition-colors leading-tight">
          {vertical.name}
        </h3>
        <p className="text-slate-500 text-xs leading-relaxed mb-6 flex-grow">
          {vertical.description}
        </p>

        {/* Leadership */}
        {(vertical.head || vertical.subHead) && (
          <div className="mt-auto pt-4 border-t border-slate-100">
            <div className="flex flex-col gap-2">
              {vertical.head && (
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Head</span>
                  <span className="text-xs text-[#CD0000] font-bold">{vertical.head.name}</span>
                </div>
              )}
              {vertical.subHead && (
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Sub-Head</span>
                  <span className="text-xs text-slate-700 font-bold">{vertical.subHead.name}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default VerticalCard;
