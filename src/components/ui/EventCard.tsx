import React from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export interface EventType {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  status: 'upcoming' | 'past';
  location: string;
  image: string | null;
  vertical: string;
  featured: boolean;
}

interface EventCardProps {
  event: EventType;
}

const categoryConfig: Record<string, { bg: string; text: string; label: string }> = {
  hackathon: { bg: '#121212', text: '#B8B8B8', label: 'Hackathon' },
  workshop:  { bg: '#121212', text: '#CD0000', label: 'Workshop' },
  talk:      { bg: '#121212', text: '#EFEDE6', label: 'Talk' },
  competition: { bg: '#CD0000', text: '#EFEDE6', label: 'Competition' },
  social:    { bg: '#B8B8B8', text: '#121212', label: 'Social' },
};

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const catConfig = categoryConfig[event.category] || { bg: '#EFEDE6', text: '#CD0000', label: event.category };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(18, 18, 18, 0.08)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="bg-white border border-[#B8B8B8]/30 rounded-3xl shadow-sm h-full flex flex-col relative overflow-hidden group"
    >
      {/* Category color top bar */}
      <div className="h-1 w-full" style={{ backgroundColor: '#CD0000' }} />

      <div className="p-6 flex flex-col h-full flex-grow">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EFEDE6] border border-[#B8B8B8]/20">
            <span className={`w-1.5 h-1.5 rounded-full ${event.status === 'upcoming' ? 'bg-[#CD0000] animate-pulse' : 'bg-[#B8B8B8]'}`} />
            <span className="text-xs font-bold text-[#121212] capitalize tracking-wide">{event.status}</span>
          </div>
          <span
            className="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-[#B8B8B8]/20"
            style={{ backgroundColor: catConfig.bg, color: catConfig.text }}
          >
            {catConfig.label}
          </span>
        </div>

        {/* Content */}
        <h3 className="font-grotesk text-lg font-black text-[#121212] mb-2 group-hover:text-[#CD0000] transition-colors">
          {event.title}
        </h3>
        <p className="text-[#121212]/70 text-sm mb-4 line-clamp-2 flex-grow leading-relaxed">
          {event.description}
        </p>

        {/* Footer */}
        <div className="space-y-2 mt-auto pt-4 border-t border-[#B8B8B8]/30">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#121212]/70 uppercase tracking-wide">
            <Calendar size={14} className="text-[#CD0000] shrink-0" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#121212]/70 uppercase tracking-wide">
            <MapPin size={14} className="text-[#CD0000] shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EventCard;
