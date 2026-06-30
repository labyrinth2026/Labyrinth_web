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
  const color = getAvatarColor(member.name);

  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(18, 18, 18, 0.08)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="bg-white border border-[#B8B8B8]/30 rounded-3xl shadow-sm p-6 text-center flex flex-col items-center h-full"
    >
      {/* Avatar */}
      <div className="relative mb-4">
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold border-2 border-[#B8B8B8]/30 shadow-md overflow-hidden"
          style={{ backgroundColor: color.bg, color: color.text }}
        >
          {member.avatar ? (
            <img src={member.avatar} alt={member.name} loading="lazy" className="w-full h-full rounded-full object-cover" />
          ) : (
            <span>{getInitials(member.name)}</span>
          )}
        </div>
      </div>

      {/* Info */}
      <h3 className="text-lg font-bold text-[#121212] mb-1">{member.name}</h3>
      <p className="text-[#CD0000] font-bold text-sm mb-1">{member.role}</p>
      {member.designation && (
        <p className="text-[#121212]/70 text-xs mb-0.5 font-medium">{member.designation}</p>
      )}
      {member.department && (
        <p className="text-[#121212]/50 text-xs mb-3">{member.department}</p>
      )}
      {member.vertical && !member.department && (
        <span className="text-xs bg-[#EFEDE6] text-[#CD0000] border border-[#B8B8B8]/30 px-3 py-0.5 rounded-full font-bold mb-3">
          {member.vertical}
        </span>
      )}

      {/* Spacer */}
      <div className="flex-grow" />

      {/* Links */}
      <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-[#B8B8B8]/30 w-full">
        <a
          href={`mailto:${member.email}`}
          className="w-8 h-8 rounded-full bg-[#EFEDE6] flex items-center justify-center text-[#CD0000] hover:bg-[#CD0000] hover:text-white transition-all"
          aria-label={`Email ${member.name}`}
          title={member.email}
        >
          <Mail size={14} />
        </a>
        {member.linkedin && member.linkedin !== '#' && (
          <a
            href={member.linkedin}
            target="_blank"
            rel="noreferrer"
            className="w-8 h-8 rounded-full bg-[#EFEDE6] flex items-center justify-center text-[#CD0000] hover:bg-[#CD0000] hover:text-white transition-all"
            aria-label={`${member.name}'s LinkedIn`}
          >
            {/* LinkedIn SVG */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
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
