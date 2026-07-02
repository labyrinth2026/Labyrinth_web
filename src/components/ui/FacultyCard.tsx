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
      whileHover={{ y: -3, boxShadow: '0 12px 30px rgba(0, 0, 0, 0.04)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden flex flex-col h-full"
    >
      <div className="p-6 flex flex-col items-center text-center flex-grow">
        {/* Avatar */}
        <div className="relative mb-4 mt-2">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-100 shadow-xs bg-slate-50 flex items-center justify-center">
            {faculty.avatar ? (
              <img src={faculty.avatar} alt={faculty.name} loading="lazy" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-slate-400">{getInitials(faculty.name)}</span>
            )}
          </div>
          {/* Faculty Badge */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-slate-200/60 whitespace-nowrap uppercase tracking-wider">
              <GraduationCap size={10} className="text-slate-500" /> Faculty
            </span>
          </div>
        </div>

        {/* Name */}
        <h3 className="text-base font-bold text-slate-900 mt-4 mb-0.5">{faculty.name}</h3>

        {/* Designation */}
        {faculty.designation && (
          <p className="text-[#CD0000] font-bold text-xs mb-1 uppercase tracking-wider">{faculty.designation}</p>
        )}

        {/* Role in club */}
        <span className="inline-block text-[10px] bg-slate-50 text-slate-700 border border-slate-200/60 px-2.5 py-0.5 rounded-full font-bold mb-2 uppercase tracking-wider">
          {faculty.role}
        </span>

        {/* Department */}
        {faculty.department && (
          <p className="text-slate-400 text-xs leading-relaxed">{faculty.department}</p>
        )}

        {/* Spacer */}
        <div className="flex-grow" />

        {/* Contact */}
        <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-slate-100 w-full">
          <a
            href={`mailto:${faculty.email}`}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#CD0000] font-semibold transition-colors"
            title={`Email ${faculty.name}`}
          >
            <Mail size={13} className="text-slate-400" />
            <span className="truncate max-w-[160px]">{faculty.email}</span>
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default FacultyCard;
