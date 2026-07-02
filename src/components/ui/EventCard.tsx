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
  hackathon: { bg: 'bg-slate-50 border-slate-200/80', text: 'text-slate-700', label: 'Hackathon' },
  workshop:  { bg: 'bg-slate-50 border-slate-200/80', text: 'text-slate-700', label: 'Workshop' },
  talk:      { bg: 'bg-slate-50 border-slate-200/80', text: 'text-slate-700', label: 'Talk' },
  competition: { bg: 'bg-slate-50 border-slate-200/80', text: 'text-slate-700', label: 'Competition' },
  social:    { bg: 'bg-slate-50 border-slate-200/80', text: 'text-slate-700', label: 'Social' },
};

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const catConfig = categoryConfig[event.category] || { bg: 'bg-slate-50 border-slate-200/80', text: 'text-slate-700', label: event.category };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <motion.div
      whileHover={{ 
        y: -5, 
        scale: 1.015,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.06), 0 0 25px rgba(205, 0, 0, 0.02)' 
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="bg-white border border-slate-200/80 rounded-2xl shadow-xs h-full flex flex-col relative overflow-hidden group"
    >
      <div className="p-6 flex flex-col h-full flex-grow">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-200/80">
            <span className={`w-1.5 h-1.5 rounded-full ${event.status === 'upcoming' ? 'bg-[#CD0000] animate-pulse' : 'bg-slate-300'}`} />
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">{event.status}</span>
          </div>
          <span
            className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${catConfig.bg} ${catConfig.text}`}
          >
            {catConfig.label}
          </span>
        </div>

        {/* Content */}
        <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-[#CD0000] transition-colors leading-tight">
          {event.title}
        </h3>
        <p className="text-slate-500 text-xs mb-5 line-clamp-2 flex-grow leading-relaxed">
          {event.description}
        </p>

        {/* Footer */}
        <div className="space-y-1.5 mt-auto pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <Calendar size={13} className="text-slate-400 shrink-0" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <MapPin size={13} className="text-slate-400 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EventCard;
