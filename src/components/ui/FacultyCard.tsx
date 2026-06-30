import React from 'react';
import { Mail, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

export interface FacultyMember {
  id: string;
  name: string;
  role: string;
  designation?: string;
  department?: string;
  email: string;
  linkedin: string;
  avatar: string | null;
}

interface FacultyCardProps {
  faculty: FacultyMember;
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

const FacultyCard: React.FC<FacultyCardProps> = ({ faculty }) => {
  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(18, 18, 18, 0.08)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="bg-white border border-[#B8B8B8]/30 rounded-3xl shadow-sm overflow-hidden flex flex-col h-full"
    >
      {/* Red header bar */}
      <div className="h-2 w-full bg-[#CD0000]" />

      <div className="p-6 flex flex-col items-center text-center flex-grow">
        {/* Avatar */}
        <div className="relative mb-4 mt-2">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#EFEDE6] shadow-lg bg-[#121212] flex items-center justify-center">
            {faculty.avatar ? (
              <img src={faculty.avatar} alt={faculty.name} loading="lazy" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-[#EFEDE6]">{getInitials(faculty.name)}</span>
            )}
          </div>
          {/* Faculty Badge */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
            <span className="inline-flex items-center gap-1 bg-[#CD0000] text-[#EFEDE6] text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
              <GraduationCap size={9} /> FACULTY
            </span>
          </div>
        </div>

        {/* Name */}
        <h3 className="text-lg font-bold text-[#121212] mt-3 mb-0.5">{faculty.name}</h3>

        {/* Designation */}
        {faculty.designation && (
          <p className="text-[#CD0000] font-bold text-sm mb-1">{faculty.designation}</p>
        )}

        {/* Role in club */}
        <span className="inline-block text-xs bg-[#EFEDE6] text-[#CD0000] border border-[#B8B8B8]/30 px-3 py-0.5 rounded-full font-bold mb-2">
          {faculty.role}
        </span>

        {/* Department */}
        {faculty.department && (
          <p className="text-[#121212]/60 text-xs leading-relaxed">{faculty.department}</p>
        )}

        {/* Spacer */}
        <div className="flex-grow" />

        {/* Contact */}
        <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-[#B8B8B8]/30 w-full">
          <a
            href={`mailto:${faculty.email}`}
            className="flex items-center gap-1.5 text-xs text-[#CD0000] hover:text-[#A30000] font-bold transition-colors"
            title={`Email ${faculty.name}`}
          >
            <Mail size={13} />
            <span className="truncate max-w-[160px]">{faculty.email}</span>
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default FacultyCard;
