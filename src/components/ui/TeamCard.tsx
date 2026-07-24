import React, { useState } from 'react';
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

const AvatarImage: React.FC<{ avatar: string | null; name: string }> = ({ avatar, name }) => {
  const [failed, setFailed] = useState(false);

  if (avatar && !failed) {
    return (
      <div className="w-36 h-36 rounded-2xl overflow-hidden border border-slate-100 shadow-xs mb-5 flex-shrink-0 bg-slate-50">
        <img
          src={avatar}
          alt={name}
          onError={() => setFailed(true)}
          className="w-full h-full object-cover object-top"
        />
      </div>
    );
  }

  return (
    <div className="w-36 h-36 rounded-full flex items-center justify-center bg-slate-100 text-slate-400 font-extrabold text-2xl select-none mb-5 flex-shrink-0 border border-slate-200/20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)]">
      {getInitials(name)}
    </div>
  );
};

const TeamCard: React.FC<TeamCardProps> = ({ member }) => {
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
      <AvatarImage avatar={member.avatar} name={member.name} />

      {/* Info Body */}
      <div className="flex flex-col items-center flex-grow w-full">
        <h3 className="text-slate-900 font-extrabold text-base tracking-tight mb-2 flex items-center justify-center">
          {member.name}
        </h3>
        <p className="text-[#CD0000] font-extrabold text-[10px] sm:text-xs uppercase tracking-wider mb-2">
          {member.role}
        </p>
        
        {member.department ? (
          <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-2">
            {member.department}
          </p>
        ) : member.vertical ? (
          <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-2">
            {member.vertical}
          </p>
        ) : null}

        {/* Spacer to push social footer to bottom */}
        <div className="flex-grow" />

        {/* Divider Line */}
        <div className="w-full border-t border-slate-100/90 my-4" />

        {/* Social Links Footer */}
        <div className="flex justify-center gap-4 w-full pb-1">
          {/* Email */}
          <a
            href={`mailto:${member.email}`}
            className="text-slate-400 hover:text-[#CD0000] transition-colors flex items-center justify-center p-1"
            title={member.email}
          >
            <Mail size={16} className="stroke-[1.75]" />
          </a>

          {/* LinkedIn */}
          {member.linkedin && member.linkedin !== '#' && (
            <a
              href={member.linkedin}
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-[#0077b5] transition-colors flex items-center justify-center p-1"
              title="LinkedIn"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
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
              className="text-slate-400 hover:text-slate-900 transition-colors flex items-center justify-center p-1"
              title="GitHub"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
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
