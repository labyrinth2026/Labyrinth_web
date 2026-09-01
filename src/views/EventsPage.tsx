"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronRight, ChevronLeft, MapPin, Calendar, X,
  LayoutGrid, CalendarDays, Tag, Users, Sparkles, Clock,
  FileDown, Download, Image as ImageIcon, ExternalLink
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import EventCard from '../components/ui/EventCard';
import SearchFilter from '../components/ui/SearchFilter';
import Button from '../components/ui/Button';
import ScrollReveal from '../components/ui/ScrollReveal';
import { usePrefetchOnIdle } from '../hooks/usePrefetchOnIdle';
import { fetchFromSheet } from '../services/api';
import pastEventsData from '../data/pastEvents.json';

// ─── Vertical colour map ────────────────────────────────────────────────
const VERTICAL_COLORS: Record<string, string> = {
  'AIHub':       '#5ec8d8',
  'DevZen':      '#9b8cf2',
  'Synapse':     '#d8c34b',
  'InterVerse':  '#f2789b',
  'Startovate':  '#7fd99a',
  'Research':    '#6e9bf2',
  'FieldOps':    '#f0824a',
  'Debate Club': '#d97bd9',
  'InsightX':    '#b5e04b',
};

const ALL_VERTICALS = Object.keys(VERTICAL_COLORS);

function getVerticalColor(vertical: string | null | undefined): string {
  if (!vertical) return '#CD0000';
  return VERTICAL_COLORS[vertical] || '#CD0000';
}

// ─── date-fns localizer ─────────────────────────────────────────────────
const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// ─── Dynamic import (SSR-safe) ──────────────────────────────────────────
const BigCalendar = dynamic(
  () => import('react-big-calendar').then(m => m.Calendar),
  { ssr: false }
);

// ─── Event Dossier (slide-in panel) ─────────────────────────────────────
function EventDossier({ event, onClose }: { event: any; onClose: () => void }) {
  const color = getVerticalColor(event.vertical);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const displayDate = event.type === 'ytd'
    ? event.dateLabel || 'Date to be confirmed'
    : event.dateLabel || (event.date
      ? new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
      : 'Date TBD');

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[2px]"
        onClick={onClose}
      />
      {/* Panel */}
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 320 }}
        data-lenis-prevent
        className="fixed top-0 right-0 h-full w-full max-w-[460px] z-50 bg-white border-l border-slate-200 shadow-2xl overflow-y-auto scrollbar-thin"
      >
        <div className="p-7 pb-16">
          {/* Top row */}
          <div className="flex justify-between items-start mb-5">
            <span
              className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border"
              style={{ color, borderColor: color, background: color + '12' }}
            >
              {event.vertical || 'Labyrinth'}
            </span>
            <div className="flex items-center gap-2">
              <a
                href={`/events/${event.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-[#CD0000] hover:text-white text-slate-700 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-colors"
                title="Open Event Details in New Tab"
              >
                Open in New Tab <ExternalLink size={12} />
              </a>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* TBD badge */}
          {event.type === 'ytd' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase tracking-wider mb-4">
              <Clock size={10} /> Date to be confirmed
            </span>
          )}

          {/* Title */}
          <h2 className="text-2xl font-extrabold text-slate-900 leading-tight tracking-tight mb-2">
            {event.title}
          </h2>

          {/* Date */}
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest mb-1"
            style={{ color }}>
            <Calendar size={12} />
            {displayDate}
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold mb-5">
              <MapPin size={11} />
              {event.location}
            </div>
          )}

          {/* Collab */}
          {event.collab && (
            <div
              className="flex items-start gap-2 px-3 py-2 rounded-lg mb-5 text-xs font-semibold italic text-slate-600"
              style={{ borderLeft: `3px solid ${color}`, background: color + '10' }}
            >
              <Users size={12} className="shrink-0 mt-0.5" />
              {event.collab}
            </div>
          )}

          {/* Description */}
          <p className="text-sm text-slate-600 leading-relaxed mb-6">{event.description}</p>

          {/* Download Report Card */}
          {(event.reportDocx || event.reportUrl || event.hasReport || event.id?.includes('infographics')) && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50/80 border border-red-200/80 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#CD0000] uppercase tracking-wider">
                <FileDown size={16} /> Official Session Report
              </div>
              <p className="text-xs text-slate-600 leading-snug">
                Download the official CHRIST University activity report (.docx) detailing event highlights, speaker profiles, participant statistics, and session outcomes.
              </p>
              <a
                href={event.reportDocx || event.reportUrl || "/documents/Infographics_Session_Report.docx"}
                download="Infographics_Session_Report.docx"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#CD0000] hover:bg-[#A30000] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs"
              >
                <Download size={14} /> Download Report (.docx)
              </a>
            </div>
          )}

          {/* Event Photo Gallery */}
          {((event.images && event.images.length > 0) || event.image) && (
            <div className="mb-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                <ImageIcon size={12} /> Event Photographs &amp; Infographics
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(event.images || [event.image]).map((imgUrl: string, idx: number) => (
                  <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group">
                    <img
                      src={imgUrl}
                      alt={`${event.title} photo ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Highlights */}
          {event.highlights?.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                Key highlights
              </p>
              <ul className="space-y-2">
                {event.highlights.map((h: string, i: number) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
                    <span
                      className="shrink-0 mt-[5px] w-[6px] h-[6px] rounded-sm rotate-45"
                      style={{ background: color }}
                    />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.aside>
    </>
  );
}

// ─── Calendar View ───────────────────────────────────────────────────────
function CalendarView({
  events,
  verticalFilter,
  onSelectEvent
}: {
  events: any[];
  verticalFilter: string;
  onSelectEvent: (ev: any) => void;
}) {
  // Controlled navigation — keeps the date in state so NEXT/BACK/TODAY work
  const [calDate, setCalDate] = useState(() => new Date(2026, 7, 1));

  const filtered = verticalFilter === 'all'
    ? events
    : events.filter(e => e.vertical === verticalFilter);

  const isTBDEvent = (e: any) =>
    e.type === 'ytd' ||
    (e.dateLabel && /tbd|to be (decided|confirmed)/i.test(e.dateLabel));

  const parseDate = (dStr: string) => {
    if (!dStr) return new Date();
    const parts = dStr.split('T')[0].split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 9, 0, 0);
    }
    return new Date(dStr);
  };

  const calEvents = filtered
    .filter(e => e.date)
    .map(e => {
      const startDate = parseDate(e.date);
      const endDate = e.endDate ? parseDate(e.endDate) : new Date(startDate.getTime() + 4 * 3600 * 1000);
      return {
        id: e.id,
        title: e.title,
        start: startDate,
        end: endDate,
        allDay: true,
        resource: e,
        isTBD: isTBDEvent(e),
      };
    });

  const tbdEvents = filtered.filter(e => isTBDEvent(e));

  const eventStyleGetter = (event: any) => {
    const color = getVerticalColor(event.resource?.vertical);
    const isTBD = event.isTBD;
    return {
      style: {
        backgroundColor: isTBD ? 'transparent' : color,
        border: isTBD ? `1.5px dashed ${color}` : 'none',
        color: isTBD ? color : '#fff',
        borderRadius: '6px',
        fontSize: '10.5px',
        fontWeight: 700,
        opacity: 0.92,
      }
    };
  };

  return (
    <div className="space-y-6">
      {/* Calendar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <BigCalendar
          localizer={localizer}
          events={calEvents}
          defaultView="month"
          views={['month', 'agenda']}
          date={calDate}
          onNavigate={(newDate: Date) => setCalDate(newDate)}
          style={{ height: 620 }}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={(ev: any) => onSelectEvent(ev.resource)}
          popup
          tooltipAccessor={(ev: any) => ev.resource?.vertical || ev.title}
        />
      </div>


      {/* TBD Events Strip */}
      {tbdEvents.length > 0 && (
        <div className="bg-white border border-amber-200/60 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600">
              Date to be confirmed · {tbdEvents.length} event{tbdEvents.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {tbdEvents.map(ev => {
              const color = getVerticalColor(ev.vertical);
              return (
                <button
                  key={ev.id}
                  onClick={() => onSelectEvent(ev)}
                  className="shrink-0 w-56 bg-slate-50 border border-slate-200 rounded-xl p-4 text-left hover:border-slate-300 transition-all group"
                  style={{ borderLeftColor: color, borderLeftWidth: 3 }}
                >
                  <span
                    className="text-[9px] font-bold uppercase tracking-widest mb-1 block"
                    style={{ color }}
                  >
                    {ev.vertical}
                  </span>
                  <h4 className="text-xs font-bold text-slate-800 leading-snug line-clamp-2 mb-1.5 group-hover:text-slate-900">
                    {ev.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-semibold">{ev.dateLabel}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────
const EventsPage: React.FC = () => {
  usePrefetchOnIdle(['/gallery', '/contact']);
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [verticalFilter, setVerticalFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [eventsData, setEventsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPoster, setSelectedPoster] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data: any = await fetchFromSheet('getEvents');
        const dbEvents = (Array.isArray(data) ? data : []).filter((e: any) => {
          const hasImage = Boolean(e.image || e.bannerUrl || e.poster || e.banner_url);
          return e.status !== 'past' || hasImage;
        });

        const mappedPastEvents = pastEventsData
          .filter((e: any) => Boolean(e.poster || e.image))
          .map((e: any) => ({
            id: e.id,
            title: e.title,
            description: e.summary,
            date: e.date,
            category: e.category,
            status: 'past' as const,
            location: e.location,
            image: e.poster || null,
            vertical: '',
            featured: false
          }));

        const combined = [...dbEvents, ...mappedPastEvents];
        const uniqueEvents: any[] = [];
        const seenTitles = new Set();

        combined.forEach(event => {
          const normTitle = (event.title || '')
            .toLowerCase()
            .replace(/[\u2013\u2014]/g, '-')
            .replace(/\s+/g, ' ')
            .trim();

          if (!seenTitles.has(normTitle)) {
            seenTitles.add(normTitle);
            uniqueEvents.push(event);
          } else {
            const idx = uniqueEvents.findIndex(e =>
              (e.title || '').toLowerCase().replace(/[\u2013\u2014]/g, '-').replace(/\s+/g, ' ').trim() === normTitle
            );
            if (idx !== -1 && !uniqueEvents[idx].image && event.image) {
              uniqueEvents[idx] = event;
            }
          }
        });

        setEventsData(uniqueEvents);
      } catch (err) {
        console.error(err);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  const carouselEvents = eventsData.filter(e => e.featured || e.status === 'upcoming').slice(0, 5);

  useEffect(() => {
    if (isHovered || carouselEvents.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselEvents.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselEvents.length, isHovered]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % carouselEvents.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + carouselEvents.length) % carouselEvents.length);

  const filterEvents = useCallback(() => {
    return eventsData.filter(e => {
      const hasImage = Boolean(e.image || e.bannerUrl || e.poster || e.banner_url);
      if (e.status === 'past' && !hasImage) return false;

      const matchesSearch = (e.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (e.description || '').toLowerCase().includes(search.toLowerCase()) ||
        (e.vertical || '').toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filter === 'all' || e.status === filter;
      const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
      const matchesVertical = verticalFilter === 'all' || e.vertical === verticalFilter;
      return matchesSearch && matchesStatus && matchesCategory && matchesVertical;
    });
  }, [eventsData, search, filter, categoryFilter, verticalFilter]);

  const filteredEvents = filterEvents();
  // For calendar view: show all events that have a date (ignore status filter so upcoming+past both show,
  // but respect vertical/category/search so the chips still work)
  const calendarEvents = eventsData.filter(e => {
    const matchesSearch = !search || (e.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.vertical || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
    const matchesVertical = verticalFilter === 'all' || e.vertical === verticalFilter;
    return matchesSearch && matchesCategory && matchesVertical;
  });

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="min-h-[60vh] flex items-center justify-center bg-[#FAFAFA]">
          <div className="w-8 h-8 border-2 border-[#CD0000] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* ── Hero Header ── */}
      <section className="relative bg-white border-b border-slate-100 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/gallery/20260215_133007.webp"
            alt="Labyrinth sports event background"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-white/85" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10 pt-24">
          <ScrollReveal animation="fade">
            <div className="text-center mb-16">
              <span className="inline-block px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest mb-6">
                Calendar
              </span>
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-slate-900 tracking-tight leading-tight">
                EVENTS &amp; <span className="text-[#CD0000]">HACKATHONS</span>
              </h1>
              <p className="text-slate-600 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed">
                Discover workshops, hackathons, and tech talks to level up your skills.
                Aug 2026 – Feb 2027 across 9 verticals.
              </p>
            </div>
          </ScrollReveal>

          {/* Featured Carousel */}
          {carouselEvents.length > 0 && (
            <ScrollReveal animation="slide-up">
              <div
                className="relative w-full h-[380px] md:h-[460px] rounded-3xl overflow-hidden shadow-xs border border-slate-200/80"
                style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <div className="w-full h-full relative flex items-end" style={{ background: 'linear-gradient(135deg, #F5F5F7 0%, #ECECEC 100%)' }}>
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(245,245,247,0.98) 0%, rgba(245,245,247,0.55) 55%, transparent 100%)' }} />

                      {/* Vertical color accent bar */}
                      {carouselEvents[currentSlide].vertical && (
                        <div
                          className="absolute top-0 left-0 w-1 h-full"
                          style={{ background: getVerticalColor(carouselEvents[currentSlide].vertical) }}
                        />
                      )}

                      <div className="relative z-10 p-5 md:p-8 lg:p-12 w-full max-w-4xl">
                        <div className="flex flex-wrap gap-2.5 mb-3.5">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#CD0000] text-white text-[9px] font-bold uppercase tracking-wider">
                            {carouselEvents[currentSlide].category}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                            carouselEvents[currentSlide].status === 'upcoming'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}>
                            {carouselEvents[currentSlide].status}
                          </span>
                          {carouselEvents[currentSlide].vertical && (
                            <span
                              className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border"
                              style={{
                                color: getVerticalColor(carouselEvents[currentSlide].vertical),
                                borderColor: getVerticalColor(carouselEvents[currentSlide].vertical) + '40',
                                background: getVerticalColor(carouselEvents[currentSlide].vertical) + '12'
                              }}
                            >
                              {carouselEvents[currentSlide].vertical}
                            </span>
                          )}
                        </div>
                        <h2 className="text-2xl md:text-4xl font-extrabold text-[#1F2937] mb-3 leading-tight tracking-tight">
                          {carouselEvents[currentSlide].title}
                        </h2>
                        <p className="text-[#6B7280] text-xs md:text-sm mb-5 line-clamp-2 max-w-3xl leading-relaxed">
                          {carouselEvents[currentSlide].description}
                        </p>
                        <div className="flex flex-wrap gap-2.5 mb-6">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#1F2937] bg-white border border-slate-200 px-3 py-1 rounded-xl shadow-xs">
                            <Calendar size={12} className="text-[#CD0000]" />
                            <span>
                              {carouselEvents[currentSlide].type === 'ytd'
                                ? carouselEvents[currentSlide].dateLabel
                                : carouselEvents[currentSlide].date
                                  ? new Date(carouselEvents[currentSlide].date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                                  : 'TBD'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#1F2937] bg-white border border-slate-200 px-3 py-1 rounded-xl shadow-xs">
                            <MapPin size={12} className="text-[#CD0000]" />
                            <span>{carouselEvents[currentSlide].location}</span>
                          </div>
                        </div>
                        <a
                          href={`/events/${carouselEvents[currentSlide].id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#CD0000] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#A30000] transition-all shadow-xs"
                        >
                          {carouselEvents[currentSlide].status === 'upcoming' ? 'Register Now' : 'View Details'} <ExternalLink size={13} />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Controls */}
                <div className="absolute right-4 md:right-6 bottom-6 flex gap-1.5 z-20">
                  <button onClick={prevSlide} className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-[#CD0000] hover:border-[#CD0000] hover:text-white transition-all shadow-xs">
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={nextSlide} className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-[#CD0000] hover:border-[#CD0000] hover:text-white transition-all shadow-xs">
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Indicators */}
                <div className="absolute top-6 right-6 flex gap-1.5 z-20">
                  {carouselEvents.map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentSlide(idx)}
                      className={`h-1 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-5 bg-[#CD0000]' : 'w-1 bg-slate-300 hover:bg-[#CD0000]/65'}`}
                    />
                  ))}
                </div>
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>

      {/* ── Events Section ── */}
      <section className="py-16 sm:py-24 bg-slate-50/50">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">

          {/* Page Header */}
          <ScrollReveal animation="fade">
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Events &amp; Schedule</h2>
                <p className="text-slate-500 text-xs mt-1 font-medium">
                  Explore upcoming fests, past events, workshops, hackathons, and vertical initiatives.
                </p>
              </div>
              {viewMode !== 'calendar' && (
                <button
                  onClick={() => setViewMode('calendar')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#CD0000] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#A30000] transition-all shadow-xs"
                >
                  <CalendarDays size={15} /> View Interactive Calendar
                </button>
              )}
            </div>
          </ScrollReveal>

          {/* Filters */}
          <ScrollReveal animation="fade">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 mb-8 shadow-xs space-y-5">
              {/* Status & Search */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Status &amp; Search</h3>
                  <SearchFilter
                    searchValue={search}
                    onSearchChange={setSearch}
                    activeFilter={filter}
                    onFilterChange={setFilter}
                    filters={[
                      { label: 'All', value: 'all' },
                      { label: 'Upcoming', value: 'upcoming' },
                      { label: 'Past', value: 'past' }
                    ]}
                  />
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Category</h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'All', value: 'all' },
                      { label: 'Hackathons', value: 'hackathon' },
                      { label: 'Workshops', value: 'workshop' },
                      { label: 'Talks', value: 'talk' },
                      { label: 'Competitions', value: 'competition' },
                      { label: 'Socials', value: 'social' }
                    ].map(cat => (
                      <button
                        key={cat.value}
                        onClick={() => setCategoryFilter(cat.value)}
                        className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
                          categoryFilter === cat.value
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-800'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Vertical Filter */}
              <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Tag size={10} /> Vertical
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setVerticalFilter('all')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
                      verticalFilter === 'all'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Sparkles size={9} /> All
                  </button>
                  {ALL_VERTICALS.map(v => {
                    const color = VERTICAL_COLORS[v];
                    const isActive = verticalFilter === v;
                    return (
                      <button
                        key={v}
                        onClick={() => setVerticalFilter(v)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border"
                        style={isActive
                          ? { background: color, color: '#fff', borderColor: color }
                          : { background: '#fff', color: '#52525B', borderColor: '#E4E4E7' }
                        }
                      >
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                        {v}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Content */}
          <AnimatePresence mode="wait">
            {viewMode === 'calendar' ? (
              <motion.div key="calendar" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                    <CalendarDays size={16} className="text-[#CD0000]" />
                    <span>Labyrinth Events Calendar View</span>
                  </div>
                  <button
                    onClick={() => setViewMode('grid')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                    title="Dismiss Calendar View"
                  >
                    <X size={15} /> Dismiss
                  </button>
                </div>
                <CalendarView
                  events={calendarEvents}
                  verticalFilter={verticalFilter}
                  onSelectEvent={setSelectedEvent}
                />
              </motion.div>
            ) : filteredEvents.length > 0 ? (
              <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ScrollReveal key={`${filter}-${categoryFilter}-${verticalFilter}-${search}`} stagger={0.06}>
                  {filteredEvents.map(event => (
                    <EventCard
                      key={event.id}
                      event={event as any}
                      onPosterClick={setSelectedPoster}
                    />
                  ))}
                </ScrollReveal>
              </motion.div>
            ) : (
              <motion.div key="empty" className="text-center py-20">
                <div className="text-slate-500 mb-6 text-sm">No events found matching your criteria.</div>
                <button
                  onClick={() => { setSearch(''); setFilter('all'); setCategoryFilter('all'); setVerticalFilter('all'); }}
                  className="text-[#CD0000] font-bold hover:underline uppercase tracking-wider text-[10px]"
                >
                  Clear all filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── Poster Lightbox ── */}
      <AnimatePresence>
        {selectedPoster && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-slate-950/40 backdrop-blur-xs"
            onClick={() => setSelectedPoster(null)}
          >
            <button
              className="absolute top-5 right-5 text-slate-500 hover:text-slate-800 p-2.5 bg-white rounded-full transition-colors z-55 shadow-xs border border-slate-200/60"
              onClick={(e) => { e.stopPropagation(); setSelectedPoster(null); }}
            >
              <X size={18} />
            </button>
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              className="relative max-w-[90vw] max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center bg-transparent"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={selectedPoster} alt="Event Poster" className="max-w-full max-h-[85vh] object-contain rounded-3xl" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Event Dossier ── */}
      <AnimatePresence>
        {selectedEvent && (
          <EventDossier event={selectedEvent} onClose={() => setSelectedEvent(null)} />
        )}
      </AnimatePresence>
    </PageWrapper>
  );
};

export default EventsPage;
