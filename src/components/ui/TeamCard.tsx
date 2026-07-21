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
  github?: string;
  avatar: string | null;
}

interface TeamCardProps {
  member: TeamMember;
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

const TeamCard: React.FC<TeamCardProps> = ({ member }) => {
  return (
    <motion.div
      whileHover={{ 
        y: -5, 
        scale: 1.01,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.05), 0 0 25px rgba(205, 0, 0, 0.015)' 
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="bg-white border border-slate-200/70 rounded-2xl shadow-xs overflow-hidden flex flex-col h-full"
    >
      {/* Header Rectangular Image */}
      <div className="w-full aspect-[5/4] relative overflow-hidden bg-slate-50 border-b border-slate-100 flex items-center justify-center">
        {member.avatar ? (
          <img 
            src={member.avatar} 
            alt={member.name} 
            loading="lazy" 
            className="w-full h-full object-cover" 
          />
        ) : (
          <span className="text-3xl font-black text-slate-300 select-none">
            {getInitials(member.name)}
          </span>
        )}
      </div>

      {/* Info Body */}
      <div className="p-5 flex flex-col items-center flex-grow text-center">
        <h3 className="text-slate-800 font-extrabold text-sm uppercase tracking-wide mb-1.5">
          {member.name}
        </h3>
        <p className="text-orange-600 font-bold text-xs uppercase tracking-wider mb-1">
          {member.role}
        </p>
        
        {member.department ? (
          <p className="text-slate-400/85 text-[10px] font-bold uppercase tracking-widest">
            {member.department}
          </p>
        ) : member.vertical ? (
          <p className="text-slate-400/85 text-[10px] font-bold uppercase tracking-widest">
            {member.vertical}
          </p>
        ) : null}

        {/* Spacer */}
        <div className="flex-grow" />

        {/* Social Links Footer */}
        <div className="flex justify-center gap-4 mt-5 pt-4 border-t border-slate-100 w-full">
          {/* Email */}
          <a
            href={`mailto:${member.email}`}
            className="text-slate-400 hover:text-[#CD0000] transition-colors flex items-center justify-center"
            title={member.email}
          >
            <Mail size={14} />
          </a>

          {/* LinkedIn */}
          {member.linkedin && member.linkedin !== '#' && (
            <a
              href={member.linkedin}
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-[#0077b5] transition-colors flex items-center justify-center"
              title="LinkedIn"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                <rect x="2" y="9" width="4" height="12"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
            </a>
          )}

          {/* GitHub */}
          {member.github && member.github !== '#' && (
            <a
              href={member.github}
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-slate-900 transition-colors flex items-center justify-center"
              title="GitHub"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.026 2.747-1.026.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.337 4.695-4.566 4.942.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.481C19.138 20.2 22 16.447 22 12.021 22 6.484 17.522 2 12 2z"/>
              </svg>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TeamCard;
