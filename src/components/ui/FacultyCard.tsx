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
      whileHover={{ y: -4, boxShadow: '0 16px 48px rgba(0, 91, 172, 0.14)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="bg-white border border-blue-100 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full"
    >
      {/* Blue header bar */}
      <div className="h-2 w-full bg-[#005BAC]" />

      <div className="p-6 flex flex-col items-center text-center flex-grow">
        {/* Avatar */}
        <div className="relative mb-4 mt-2">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#EAF4FF] shadow-lg bg-[#005BAC] flex items-center justify-center">
            {faculty.avatar ? (
              <img src={faculty.avatar} alt={faculty.name} loading="lazy" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-white">{getInitials(faculty.name)}</span>
            )}
          </div>
          {/* Faculty Badge */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
            <span className="inline-flex items-center gap-1 bg-[#005BAC] text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
              <GraduationCap size={9} /> FACULTY
            </span>
          </div>
        </div>

        {/* Name */}
        <h3 className="text-lg font-bold text-[#1a2c4a] mt-3 mb-0.5">{faculty.name}</h3>

        {/* Designation */}
        {faculty.designation && (
          <p className="text-[#005BAC] font-semibold text-sm mb-1">{faculty.designation}</p>
        )}

        {/* Role in club */}
        <span className="inline-block text-xs bg-[#EAF4FF] text-[#005BAC] border border-[#D6EBFF] px-3 py-0.5 rounded-full font-medium mb-2">
          {faculty.role}
        </span>

        {/* Department */}
        {faculty.department && (
          <p className="text-[#7a90aa] text-xs leading-relaxed">{faculty.department}</p>
        )}

        {/* Spacer */}
        <div className="flex-grow" />

        {/* Contact */}
        <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-blue-50 w-full">
          <a
            href={`mailto:${faculty.email}`}
            className="flex items-center gap-1.5 text-xs text-[#005BAC] hover:text-[#004a8f] font-medium transition-colors"
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
