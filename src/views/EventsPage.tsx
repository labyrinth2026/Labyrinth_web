import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, MapPin, Calendar, X } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import EventCard from '../components/ui/EventCard';
import SearchFilter from '../components/ui/SearchFilter';
import Button from '../components/ui/Button';
import SectionHeading from '../components/ui/SectionHeading';
import ScrollReveal from '../components/ui/ScrollReveal';
import { usePrefetchOnIdle } from '../hooks/usePrefetchOnIdle';

import { fetchFromSheet } from '../services/api';
import pastEventsData from '../data/pastEvents.json';

const EventsPage: React.FC = () => {
  usePrefetchOnIdle(['/gallery', '/contact']);
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [eventsData, setEventsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPoster, setSelectedPoster] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data: any = await fetchFromSheet('getEvents');
        const dbEvents = Array.isArray(data) ? data : [];
        
        // Map pastEventsData to match the EventType structure
        const mappedPastEvents = pastEventsData.map((e: any) => ({
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

        // Combine and deduplicate by title, preferring the one with a poster image
        const combined = [...dbEvents, ...mappedPastEvents];
        const uniqueEvents: any[] = [];
        const seenTitles = new Set();
        
        combined.forEach(event => {
          const normTitle = (event.title || '')
            .toLowerCase()
            .replace(/[\u2013\u2014]/g, '-') // Normalize en-dashes/em-dashes to hyphens
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
              uniqueEvents[idx] = event; // Swap with the one containing an image
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

  const filterEvents = () => {
    return eventsData.filter(e => {
      const matchesSearch = (e.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (e.description || '').toLowerCase().includes(search.toLowerCase()) ||
        (e.vertical || '').toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filter === 'all' || e.status === filter;
      const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  };

  const filteredEvents = filterEvents();

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
      {/* Header with background image */}
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

        <div className="container mx-auto px-6 max-w-7xl relative z-10 pt-24">
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

                      {/* Content */}
                      <div className="relative z-10 p-8 md:p-12 w-full max-w-4xl">
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
                            <span>{new Date(carouselEvents[currentSlide].date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#1F2937] bg-white border border-slate-200 px-3 py-1 rounded-xl shadow-xs">
                            <MapPin size={12} className="text-[#CD0000]" />
                            <span>{carouselEvents[currentSlide].location}</span>
                          </div>
                        </div>
                        <Button variant="secondary" size="sm" href="/contact">
                          {carouselEvents[currentSlide].status === 'upcoming' ? 'Register Now' : 'View Details'}
                        </Button>
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

      {/* Events Grid (Section 2: Off-White) */}
      <section className="py-24 bg-slate-50/50">
        <div className="container mx-auto px-6 max-w-7xl">
          {/* Filters */}
          <ScrollReveal animation="fade">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 mb-12 shadow-xs">
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
                  <div className="flex flex-wrap gap-3">
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
            </div>
          </ScrollReveal>

          {/* Grid */}
          <AnimatePresence mode="wait">
            {filteredEvents.length > 0 ? (
              <div key="grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ScrollReveal key={`${filter}-${categoryFilter}-${search}`} stagger={0.06}>
                  {filteredEvents.map(event => (
                    <EventCard 
                      key={event.id} 
                      event={event as any} 
                      onPosterClick={setSelectedPoster} 
                    />
                  ))}
                </ScrollReveal>
              </div>
            ) : (
              <div key="empty" className="text-center py-20">
                <div className="text-slate-500 mb-6 text-sm">No events found matching your criteria.</div>
                <button
                  onClick={() => { setSearch(''); setFilter('all'); setCategoryFilter('all'); }}
                  className="text-[#CD0000] font-bold hover:underline uppercase tracking-wider text-[10px]"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Lightbox / Popup Modal for Poster Images */}
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
              title="Close popup"
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
              <img 
                src={selectedPoster} 
                alt="Event Poster" 
                className="max-w-full max-h-[85vh] object-contain rounded-3xl" 
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
};

export default EventsPage;
