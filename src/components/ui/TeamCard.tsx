import React from 'react';
import { Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  vertical?: string;
  designation?: string;
  department?: string;
  email: string;
  linkedin: string;
  avatar: string | null;
}

interface TeamCardProps {
  member: TeamMember;
}

// Generate a brand shade avatar color based on name
const getAvatarColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    { bg: '#CD0000', text: '#EFEDE6' }, // Cherry Red
    { bg: '#121212', text: '#EFEDE6' }, // Charcoal Black
    { bg: '#B8B8B8', text: '#121212' }, // Soft Platinum
    { bg: '#181818', text: '#EFEDE6' },
  ];
  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

const TeamCard: React.FC<TeamCardProps> = ({ member }) => {
  const initialsColor = { bg: 'bg-slate-50 border-slate-100', text: 'text-slate-500' };

  return (
    <motion.div
      whileHover={{ 
        y: -5, 
        scale: 1.015,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.06), 0 0 25px rgba(205, 0, 0, 0.02)' 
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 text-center flex flex-col items-center h-full"
    >
      {/* Avatar */}
      <div className="relative mb-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-base font-bold border border-slate-200/60 shadow-xs overflow-hidden ${initialsColor.bg} ${initialsColor.text}`}
        >
          {member.avatar ? (
            <img src={member.avatar} alt={member.name} loading="lazy" className="w-full h-full rounded-full object-cover" />
          ) : (
            <span>{getInitials(member.name)}</span>
          )}
        </div>
      </div>

      {/* Info */}
      <h3 className="text-sm font-bold text-slate-900 mb-0.5">{member.name}</h3>
      <p className="text-[#CD0000] font-bold text-xs mb-1 uppercase tracking-wider">{member.role}</p>
      {member.designation && (
        <p className="text-slate-400 text-[10px] mb-0.5 font-bold uppercase tracking-wider">{member.designation}</p>
      )}
      {member.department && (
        <p className="text-slate-400 text-[10px] mb-3">{member.department}</p>
      )}
      {member.vertical && !member.department && (
        <span className="text-[9px] bg-slate-50 text-slate-600 border border-slate-200/60 px-2 py-0.5 rounded-full font-bold mb-3 uppercase tracking-wider">
          {member.vertical}
        </span>
      )}

      {/* Spacer */}
      <div className="flex-grow" />

      {/* Links */}
      <div className="flex justify-center gap-1.5 mt-4 pt-4 border-t border-slate-100 w-full">
        <a
          href={`mailto:${member.email}`}
          className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200/40 flex items-center justify-center text-slate-500 hover:bg-[#CD0000] hover:text-white transition-all"
          aria-label={`Email ${member.name}`}
          title={member.email}
        >
          <Mail size={12} />
        </a>
        {member.linkedin && member.linkedin !== '#' && (
          <a
            href={member.linkedin}
            target="_blank"
            rel="noreferrer"
            className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200/40 flex items-center justify-center text-slate-500 hover:bg-[#CD0000] hover:text-white transition-all"
            aria-label={`${member.name}'s LinkedIn`}
          >
            {/* LinkedIn SVG */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
              <rect x="2" y="9" width="4" height="12"/>
              <circle cx="4" cy="4" r="2"/>
            </svg>
          </a>
        )}
      </div>
    </motion.div>
  );
};

export default TeamCard;
