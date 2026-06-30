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
      whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(18, 18, 18, 0.08)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="bg-white border border-[#B8B8B8]/30 rounded-3xl shadow-sm p-7 h-full flex flex-col group relative overflow-hidden"
    >
      {/* Subtle hover accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#CD0000] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform duration-300 group-hover:scale-110 bg-[#CD0000]"
          >
            <IconComponent size={26} />
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest border"
            style={{
              backgroundColor: vertical.category === 'tech' ? '#121212' : '#EFEDE6',
              color: vertical.category === 'tech' ? '#EFEDE6' : '#CD0000',
              borderColor: '#B8B8B8'
            }}
          >
            {vertical.category}
          </span>
        </div>

        {/* Content */}
        <h3 className="font-grotesk text-xl font-black text-[#121212] mb-2 tracking-tight group-hover:text-[#CD0000] transition-colors">
          {vertical.name}
        </h3>
        <p className="text-[#121212]/70 text-sm leading-relaxed mb-6 flex-grow">
          {vertical.description}
        </p>

        {/* Leadership */}
        {(vertical.head || vertical.subHead) && (
          <div className="mt-auto pt-4 border-t border-[#B8B8B8]/30">
            <div className="flex flex-col gap-2">
              {vertical.head && (
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-[#121212]/60 uppercase tracking-wider font-bold">Head</span>
                  <span className="text-sm text-[#CD0000] font-bold">{vertical.head.name}</span>
                </div>
              )}
              {vertical.subHead && (
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-[#121212]/60 uppercase tracking-wider font-bold">Sub-Head</span>
                  <span className="text-sm text-[#121212] font-semibold">{vertical.subHead.name}</span>
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
