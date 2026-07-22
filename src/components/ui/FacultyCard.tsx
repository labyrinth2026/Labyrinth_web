import React from 'react';
import { ExternalLink, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export interface FacultyMember {
  id: string;
  name: string;
  role: string;
  designation?: string;
  department?: string;
  email: string;
  profileUrl?: string;
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
      whileHover={{ 
        y: -6, 
        scale: 1.015,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.06), 0 0 25px rgba(205, 0, 0, 0.01)' 
      }}
      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
      className="bg-white border border-slate-200/60 rounded-[28px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col h-full p-6 items-center text-center"
    >
      {/* Profile Image Section */}
      {faculty.avatar ? (
        <div className="relative w-36 h-36 rounded-2xl overflow-hidden border border-slate-100 shadow-xs mb-5 flex-shrink-0 bg-slate-50">
          <Image 
            src={faculty.avatar} 
            alt={faculty.name} 
            fill
            sizes="(max-width: 768px) 150px, 150px"
            className="object-cover object-top" 
          />
        </div>
      ) : (
        <div className="w-36 h-36 rounded-full flex items-center justify-center bg-slate-100 text-slate-400 font-extrabold text-2xl select-none mb-5 flex-shrink-0 border border-slate-200/20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)]">
          {getInitials(faculty.name)}
        </div>
      )}

      {/* Info Body */}
      <div className="flex flex-col items-center flex-grow w-full">
        <h3 className="text-slate-900 font-extrabold text-base tracking-tight mb-2 flex items-center justify-center">
          {faculty.name}
        </h3>
        
        {faculty.designation && (
          <p className="text-[#CD0000] font-extrabold text-[10px] sm:text-xs uppercase tracking-wider mb-2">
            {faculty.designation}
          </p>
        )}
        
        <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">
          {faculty.role}
        </p>

        {faculty.department && (
          <p className="text-slate-400/85 text-[9px] font-medium uppercase tracking-wider mb-2">
            {faculty.department}
          </p>
        )}

        {/* Spacer to push footer to bottom */}
        <div className="flex-grow" />

        {/* Divider Line */}
        <div className="w-full border-t border-slate-100/90 my-4" />

        {/* Footer Links */}
        <div className="flex justify-center gap-4 w-full pb-1">
          {/* Email */}
          <a
            href={`mailto:${faculty.email}`}
            className="text-slate-400 hover:text-[#CD0000] transition-colors flex items-center justify-center p-1"
            title={faculty.email}
          >
            <Mail size={16} className="stroke-[1.75]" />
          </a>

          {/* Profile external link */}
          {faculty.profileUrl && faculty.profileUrl !== '#' && (
            <a
              href={faculty.profileUrl}
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-[#CD0000] transition-colors flex items-center justify-center p-1"
              title="View Profile"
            >
              <ExternalLink size={16} className="stroke-[1.75]" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default FacultyCard;
