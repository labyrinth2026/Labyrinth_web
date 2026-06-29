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
      className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden flex flex-col h-full"
    >
      {/* Blue header bar */}
      <div className="h-2 w-full bg-[#0B1F63]" />

      <div className="p-6 flex flex-col items-center text-center flex-grow">
        {/* Avatar */}
        <div className="relative mb-4 mt-2">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[rgba(11,31,99,0.03)] shadow-lg bg-[#0B1F63] flex items-center justify-center">
            {faculty.avatar ? (
              <img src={faculty.avatar} alt={faculty.name} loading="lazy" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-white">{getInitials(faculty.name)}</span>
            )}
          </div>
          {/* Faculty Badge */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
            <span className="inline-flex items-center gap-1 bg-[#0B1F63] text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
              <GraduationCap size={9} /> FACULTY
            </span>
          </div>
        </div>

        {/* Name */}
        <h3 className="text-lg font-bold text-[#0B1F63] mt-3 mb-0.5">{faculty.name}</h3>

        {/* Designation */}
        {faculty.designation && (
          <p className="text-[#0B1F63] font-semibold text-sm mb-1">{faculty.designation}</p>
        )}

        {/* Role in club */}
        <span className="inline-block text-xs bg-[rgba(11,31,99,0.03)] text-[#0B1F63] border border-[rgba(11,31,99,0.07)] px-3 py-0.5 rounded-full font-medium mb-2">
          {faculty.role}
        </span>

        {/* Department */}
        {faculty.department && (
          <p className="text-[#8c97a8] text-xs leading-relaxed">{faculty.department}</p>
        )}

        {/* Spacer */}
        <div className="flex-grow" />

        {/* Contact */}
        <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-[#E5E7EB] w-full">
          <a
            href={`mailto:${faculty.email}`}
            className="flex items-center gap-1.5 text-xs text-[#0B1F63] hover:text-[#071545] font-medium transition-colors"
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
