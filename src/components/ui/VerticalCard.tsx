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
      whileHover={{ y: -4, boxShadow: '0 16px 48px rgba(0, 91, 172, 0.12)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-7 h-full flex flex-col group relative overflow-hidden"
    >
      {/* Subtle hover accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#0B1F63] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: '#0B1F63' }}
          >
            <IconComponent size={26} />
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-widest border"
            style={{
              backgroundColor: vertical.category === 'tech' ? 'rgba(11,31,99,0.03)' : '#F0FDF4',
              color: vertical.category === 'tech' ? '#0B1F63' : '#166534',
              borderColor: vertical.category === 'tech' ? 'rgba(11,31,99,0.07)' : '#bbf7d0'
            }}
          >
            {vertical.category}
          </span>
        </div>

        {/* Content */}
        <h3 className="font-grotesk text-xl font-bold text-[#0B1F63] mb-2 tracking-tight group-hover:text-[#0B1F63] transition-colors">
          {vertical.name}
        </h3>
        <p className="text-[#667085] text-sm leading-relaxed mb-6 flex-grow">
          {vertical.description}
        </p>

        {/* Leadership */}
        {(vertical.head || vertical.subHead) && (
          <div className="mt-auto pt-4 border-t border-[#E5E7EB]">
            <div className="flex flex-col gap-2">
              {vertical.head && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#8c97a8] uppercase tracking-wider font-semibold">Head</span>
                  <span className="text-sm text-[#0B1F63] font-semibold">{vertical.head.name}</span>
                </div>
              )}
              {vertical.subHead && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#8c97a8] uppercase tracking-wider font-semibold">Sub-Head</span>
                  <span className="text-sm text-[#667085]">{vertical.subHead.name}</span>
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
