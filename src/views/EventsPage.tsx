import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, MapPin, Calendar } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import EventCard from '../components/ui/EventCard';
import SearchFilter from '../components/ui/SearchFilter';
import Button from '../components/ui/Button';
import ScrollReveal from '../components/ui/ScrollReveal';

import { fetchFromSheet } from '../services/api';

const EventsPage: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [eventsData, setEventsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data: any = await fetchFromSheet('getEvents');
        if (Array.isArray(data)) setEventsData(data);
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
      const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.description.toLowerCase().includes(search.toLowerCase()) ||
        e.vertical.toLowerCase().includes(search.toLowerCase());
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
      {/* Header (Section 1: Off-White) */}
      <section className="py-24 bg-white border-b border-slate-100">
        <div className="container mx-auto px-6 max-w-7xl">
          <ScrollReveal animation="fade">
            <div className="text-center mb-16">
              <span className="inline-block px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest mb-6">
                Calendar
              </span>
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-slate-900 tracking-tight leading-tight">
                EVENTS &amp; <span className="text-[#CD0000]">HACKATHONS</span>
              </h1>
              <p className="text-slate-500 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed">
                Discover workshops, hackathons, and tech talks to level up your skills.
              </p>
            </div>
          </ScrollReveal>

          {/* Featured Carousel */}
          {carouselEvents.length > 0 && (
            <ScrollReveal animation="slide-up">
              <div
                className="relative w-full h-[380px] md:h-[460px] rounded-3xl overflow-hidden shadow-xs border border-slate-200/80 bg-slate-950"
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
                    <div className="w-full h-full relative flex items-end bg-gradient-to-br from-slate-900 to-slate-950">
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />

                      {/* Content */}
                      <div className="relative z-10 p-8 md:p-12 w-full max-w-4xl">
                        <div className="flex flex-wrap gap-2.5 mb-3.5">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#CD0000] text-white text-[9px] font-bold uppercase tracking-wider">
                            {carouselEvents[currentSlide].category}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                            carouselEvents[currentSlide].status === 'upcoming'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-white/10 text-slate-300 border-white/10'
                          }`}>
                            {carouselEvents[currentSlide].status}
                          </span>
                        </div>
                        <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-3 leading-tight tracking-tight">
                          {carouselEvents[currentSlide].title}
                        </h2>
                        <p className="text-slate-300 text-xs md:text-sm mb-5 line-clamp-2 max-w-3xl leading-relaxed">
                          {carouselEvents[currentSlide].description}
                        </p>
                        <div className="flex flex-wrap gap-2.5 mb-6">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-200 bg-white/5 border border-white/10 px-3 py-1 rounded-xl">
                            <Calendar size={12} className="text-[#CD0000]" />
                            <span>{new Date(carouselEvents[currentSlide].date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-200 bg-white/5 border border-white/10 px-3 py-1 rounded-xl">
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
                  <button onClick={prevSlide} className="w-8 h-8 rounded-full bg-white/10 backdrop-blur border border-white/10 flex items-center justify-center text-white hover:bg-[#CD0000] hover:border-[#CD0000] transition-all">
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={nextSlide} className="w-8 h-8 rounded-full bg-white/10 backdrop-blur border border-white/10 flex items-center justify-center text-white hover:bg-[#CD0000] hover:border-[#CD0000] transition-all">
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Indicators */}
                <div className="absolute top-6 right-6 flex gap-1.5 z-20">
                  {carouselEvents.map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentSlide(idx)}
                      className={`h-1 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-5 bg-[#CD0000]' : 'w-1 bg-white/30 hover:bg-[#CD0000]/65'}`}
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
                    <EventCard key={event.id} event={event as any} />
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
    </PageWrapper>
  );
};

export default EventsPage;
