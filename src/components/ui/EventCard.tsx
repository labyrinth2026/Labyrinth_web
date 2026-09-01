import React from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

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
  academicYear?: string;
  onPosterClick?: (imageUrl: string) => void;
}

const categoryConfig: Record<string, { bg: string; text: string; label: string }> = {
  hackathon: { bg: 'bg-slate-50 border-slate-200/80', text: 'text-slate-700', label: 'Hackathon' },
  workshop:  { bg: 'bg-slate-50 border-slate-200/80', text: 'text-slate-700', label: 'Workshop' },
  talk:      { bg: 'bg-slate-50 border-slate-200/80', text: 'text-slate-700', label: 'Talk' },
  competition: { bg: 'bg-slate-50 border-slate-200/80', text: 'text-slate-700', label: 'Competition' },
  social:    { bg: 'bg-slate-50 border-slate-200/80', text: 'text-slate-700', label: 'Social' },
};

const EventCard: React.FC<EventCardProps> = ({ event, academicYear, onPosterClick }) => {
  const catConfig = categoryConfig[event.category] || { bg: 'bg-slate-50 border-slate-200/80', text: 'text-slate-700', label: event.category };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const targetHref = `/events/${event.id}${academicYear ? `?year=${academicYear}` : ''}`;

  return (
    <Link href={targetHref} className="block group">
      <motion.div
        whileHover={{ 
          y: -5, 
          scale: 1.015,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.06), 0 0 25px rgba(205, 0, 0, 0.02)' 
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="bg-white border border-slate-200/80 rounded-2xl shadow-xs flex flex-col relative overflow-hidden"
      >
        {event.image && (
          <div 
            className="relative w-full aspect-[3/4] bg-slate-100 overflow-hidden cursor-pointer"
            onClick={(e) => {
              if (onPosterClick) {
                e.preventDefault();
                e.stopPropagation();
                onPosterClick(event.image!);
              }
            }}
          >
            <Image
              src={event.image}
              alt={event.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent" />
          </div>
        )}

        <div className="p-5 flex flex-col h-full flex-grow">
          {/* Header */}
          <div className="flex justify-between items-start mb-2.5">
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
          <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-[#CD0000] transition-colors leading-tight">
            {event.title}
          </h3>
          <p className="text-slate-500 text-xs mb-2 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          {/* Footer */}
          <div className="space-y-1 pt-1.5 border-t border-slate-100">
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
    </Link>
  );
};

export default EventCard;
