"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  Calendar, MapPin, Clock, Users, Tag, ChevronLeft, 
  FileDown, Download, Sparkles, Share2, ExternalLink, X, Image as ImageIcon 
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/ui/Button';
import pastEventsData from '../data/pastEvents.json';
import fallbackEvents from '../data/events.json';
import { fetchFromSheet } from '../services/api';

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

function getVerticalColor(vertical: string | null | undefined): string {
  if (!vertical) return '#CD0000';
  return VERTICAL_COLORS[vertical] || '#CD0000';
}

const EventDetailsPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.id as string;

  const [event, setEvent] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadEvent = async () => {
      setIsLoading(true);
      try {
        let allEvents: any[] = [];
        try {
          const apiEvents: any = await fetchFromSheet('getEvents');
          if (Array.isArray(apiEvents)) {
            allEvents = apiEvents;
          }
        } catch (e) {
          console.warn("Could not fetch remote sheet events, using fallback json data", e);
        }

        const combined = [...allEvents, ...fallbackEvents, ...pastEventsData];
        const match = combined.find((e: any) => 
          e.id === eventId || 
          (e.title && eventId && e.title.toLowerCase().replace(/[^a-z0-9]/g, '-') === eventId.toLowerCase())
        );

        if (match) {
          setEvent(match);
        } else {
          // Fallback to first past or fallback event if param doesn't match
          setEvent(fallbackEvents[0] || pastEventsData[0]);
        }
      } catch (err) {
        console.error("Error loading event details:", err);
      }
      setIsLoading(false);
    };

    if (eventId) {
      loadEvent();
    } else {
      setIsLoading(false);
    }
  }, [eventId]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title || 'Labyrinth Event',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

function getEventAcademicYear(evt: any): string {
  if (!evt) return '2026-27';
  const dStr = evt.date || '';
  const title = (evt.title || '').toLowerCase();

  if (title.includes('2026-27') || title.includes('2026-2027')) return '2026-27';
  if (title.includes('2025-26') || title.includes('2025-2026')) return '2025-26';
  if (title.includes('2024-25') || title.includes('2024-2025')) return '2024-25';

  if (!dStr) return '2026-27';

  const parts = dStr.split('T')[0].split('-');
  if (parts.length >= 2) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);

    if (!isNaN(year)) {
      if (year > 2026) return '2026-27';
      if (year === 2026) {
        return month >= 6 ? '2026-27' : '2025-26';
      }
      if (year === 2025) {
        return month >= 6 ? '2025-26' : '2024-25';
      }
      if (year <= 2024) {
        return '2024-25';
      }
    }
  }

  return '2026-27';
}

  const handleBack = () => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const queryYear = searchParams.get('year');
      if (queryYear) {
        router.push(`/events/${queryYear}`);
        return;
      }

      if (document.referrer && document.referrer.includes('/events/')) {
        const match = document.referrer.match(/\/events\/(20\d{2}-\d{2})/);
        if (match && match[1]) {
          router.push(`/events/${match[1]}`);
          return;
        }
      }
    }

    const fallbackYear = getEventAcademicYear(event);
    router.push(`/events/${fallbackYear}`);
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50">
          <div className="w-10 h-10 border-3 border-[#CD0000] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Loading Event Details...</p>
        </div>
      </PageWrapper>
    );
  }

  if (!event) {
    return (
      <PageWrapper>
        <div className="min-h-[60vh] flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Event Not Found</h2>
          <p className="text-sm text-slate-500 mb-6 max-w-md">The requested event details could not be loaded or the URL may be invalid.</p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-[#CD0000] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#A30000] transition-all cursor-pointer"
          >
            Return to Events
          </button>
        </div>
      </PageWrapper>
    );
  }

  const verticalColor = getVerticalColor(event.vertical);
  const formattedDate = event.dateLabel || (event.date
    ? new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : 'Date TBD');

  const mediaImages = event.images || (event.image ? [event.image] : []);
  const hasReport = Boolean(event.reportDocx || event.reportUrl || event.hasReport || event.id?.includes('infographics'));

  return (
    <PageWrapper>
      {/* Top Banner Navigation */}
      <section className="bg-slate-900 text-white pt-24 pb-12 relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-red-950/30 opacity-90" />
        
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
          {/* Back button */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all backdrop-blur-xs cursor-pointer"
            >
              <ChevronLeft size={16} /> Back to Events
            </button>
            
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all backdrop-blur-xs"
            >
              <Share2 size={15} /> {copied ? 'Link Copied!' : 'Share Event'}
            </button>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2.5 mb-4">
            <span
              className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border"
              style={{ color: verticalColor, borderColor: verticalColor + '60', background: verticalColor + '18' }}
            >
              {event.vertical || 'Labyrinth Event'}
            </span>
            
            <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${
              event.status === 'upcoming' 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}>
              {event.status || 'Past Event'}
            </span>

            {event.category && (
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-white/10 border border-white/20 text-white">
                {event.category}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
            {event.title}
          </h1>

          {/* Metadata Bar */}
          <div className="flex flex-wrap gap-6 text-xs sm:text-sm text-slate-300 font-semibold pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[#CD0000]" />
              <span>{formattedDate}</span>
            </div>
            
            {event.time && (
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-[#CD0000]" />
                <span>{event.time}</span>
              </div>
            )}

            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-[#CD0000]" />
                <span>{event.location}</span>
              </div>
            )}

            {event.collab && (
              <div className="flex items-center gap-2 text-slate-400">
                <Users size={16} className="text-[#CD0000]" />
                <span>Collab: {event.collab}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="py-12 sm:py-20 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Main Details (Left 8 cols) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Event Banner Image */}
              {event.image && (
                <div 
                  className="relative aspect-video w-full rounded-3xl overflow-hidden shadow-lg border border-slate-200 bg-slate-900 cursor-pointer group"
                  onClick={() => setSelectedImage(event.image)}
                >
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover group-hover:scale-102 transition-transform duration-500"
                    priority
                  />
                  <div className="absolute bottom-4 right-4 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon size={12} /> Click to Expand Poster
                  </div>
                </div>
              )}

              {/* Official Report Download Card */}
              {hasReport && (
                <div className="bg-white border-2 border-red-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-50 text-[#CD0000] text-[10px] font-bold uppercase tracking-wider">
                      <FileDown size={14} /> Activity Report Available
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">Official Activity Report (.docx)</h3>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-md">
                      Download the complete CHRIST University official report including resource person details, participant profile, and full session takeaways.
                    </p>
                  </div>

                  <a
                    href={event.reportDocx || event.reportUrl || "/documents/Infographics_Session_Report.docx"}
                    download="Infographics_Session_Report.docx"
                    className="shrink-0 inline-flex items-center gap-2 px-6 py-3.5 bg-[#CD0000] hover:bg-[#A30000] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md hover:shadow-lg shadow-[#CD0000]/20 hover:scale-105"
                  >
                    <Download size={16} /> Download Report (.docx)
                  </a>
                </div>
              )}

              {/* Description */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xs space-y-4">
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">About the Event</h3>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line font-medium">
                  {event.description}
                </p>
              </div>

              {/* Highlights */}
              {event.highlights && event.highlights.length > 0 && (
                <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xs space-y-4">
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <Sparkles size={18} className="text-[#CD0000]" /> Event Highlights &amp; Key Activities
                  </h3>
                  <div className="space-y-3">
                    {event.highlights.map((h: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                        <span className="w-6 h-6 rounded-full bg-[#CD0000] text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-xs sm:text-sm text-slate-700 font-semibold leading-relaxed">
                          {h}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Photos & Media Gallery */}
              {mediaImages.length > 0 && (
                <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xs space-y-4">
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <ImageIcon size={18} className="text-[#CD0000]" /> Session Photographs &amp; Media
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {mediaImages.map((imgUrl: string, idx: number) => (
                      <div
                        key={idx}
                        className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer group shadow-xs"
                        onClick={() => setSelectedImage(imgUrl)}
                      >
                        <Image
                          src={imgUrl}
                          alt={`${event.title} screenshot ${idx + 1}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Sidebar (Right 4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Event Info Card */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-5">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Event Overview</h3>
                
                <div className="space-y-4 text-xs font-semibold text-slate-700">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-red-50 text-[#CD0000] flex items-center justify-center shrink-0">
                      <Calendar size={15} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Date</span>
                      <span className="text-slate-900">{formattedDate}</span>
                    </div>
                  </div>

                  {event.time && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-red-50 text-[#CD0000] flex items-center justify-center shrink-0">
                        <Clock size={15} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Time</span>
                        <span className="text-slate-900">{event.time}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-red-50 text-[#CD0000] flex items-center justify-center shrink-0">
                      <MapPin size={15} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Venue</span>
                      <span className="text-slate-900">{event.location || 'CHRIST University'}</span>
                    </div>
                  </div>

                  {event.vertical && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-red-50 text-[#CD0000] flex items-center justify-center shrink-0">
                        <Tag size={15} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Organizing Vertical</span>
                        <span className="text-slate-900 font-extrabold">{event.vertical}</span>
                      </div>
                    </div>
                  )}

                  {event.rapporteur && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-red-50 text-[#CD0000] flex items-center justify-center shrink-0">
                        <Users size={15} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Rapporteur / Organizer</span>
                        <span className="text-slate-900">{event.rapporteur}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Primary Action Button */}
                <div className="pt-3">
                  {event.status === 'upcoming' ? (
                    <Link
                      href="/contact"
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#CD0000] hover:bg-[#A30000] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md"
                    >
                      Register For Event <ExternalLink size={14} />
                    </Link>
                  ) : hasReport ? (
                    <a
                      href={event.reportDocx || event.reportUrl || "/documents/Infographics_Session_Report.docx"}
                      download="Infographics_Session_Report.docx"
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#CD0000] hover:bg-[#A30000] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md"
                    >
                      <Download size={15} /> Download Session Report
                    </a>
                  ) : (
                    <button
                      onClick={handleShare}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md"
                    >
                      <Share2 size={15} /> Share Event Details
                    </button>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Lightbox Image Preview */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-5 right-5 text-white bg-slate-800 p-3 rounded-full hover:bg-[#CD0000] transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X size={20} />
          </button>
          <img
            src={selectedImage}
            alt="Expanded view"
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </PageWrapper>
  );
};

export default EventDetailsPage;
