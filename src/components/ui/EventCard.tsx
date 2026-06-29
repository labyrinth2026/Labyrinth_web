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
  hackathon: { bg: '#FEF2F2', text: '#dc2626', label: 'Hackathon' },
  workshop:  { bg: '#EFF6FF', text: '#2563eb', label: 'Workshop' },
  talk:      { bg: '#F5F3FF', text: '#7c3aed', label: 'Talk' },
  competition: { bg: '#FFFBEB', text: '#d97706', label: 'Competition' },
  social:    { bg: '#F0FDFA', text: '#0d9488', label: 'Social' },
};

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const catConfig = categoryConfig[event.category] || { bg: 'rgba(11,31,99,0.03)', text: '#0B1F63', label: event.category };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 16px 48px rgba(0, 91, 172, 0.12)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm h-full flex flex-col relative overflow-hidden group"
    >
      {/* Category color top bar */}
      <div className="h-1 w-full" style={{ backgroundColor: catConfig.text }} />

      <div className="p-6 flex flex-col h-full flex-grow">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(11,31,99,0.03)] border border-[rgba(11,31,99,0.07)]">
            <span className={`w-1.5 h-1.5 rounded-full ${event.status === 'upcoming' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-xs font-semibold text-[#667085] capitalize">{event.status}</span>
          </div>
          <span
            className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
            style={{ backgroundColor: catConfig.bg, color: catConfig.text }}
          >
            {catConfig.label}
          </span>
        </div>

        {/* Content */}
        <h3 className="font-grotesk text-lg font-bold text-[#0B1F63] mb-2 group-hover:text-[#0B1F63] transition-colors">
          {event.title}
        </h3>
        <p className="text-[#667085] text-sm mb-4 line-clamp-2 flex-grow leading-relaxed">
          {event.description}
        </p>

        {/* Footer */}
        <div className="space-y-2 mt-auto pt-4 border-t border-[#E5E7EB]">
          <div className="flex items-center gap-2 text-sm text-[#667085]">
            <Calendar size={14} className="text-[#0B1F63] shrink-0" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#667085]">
            <MapPin size={14} className="text-[#0B1F63] shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EventCard;
