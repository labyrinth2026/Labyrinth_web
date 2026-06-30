import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, MapPin, Calendar } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import EventCard from '../components/ui/EventCard';
import SearchFilter from '../components/ui/SearchFilter';
import Button from '../components/ui/Button';

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
        <div className="min-h-[60vh] flex items-center justify-center bg-[#121212]">
          <div className="w-8 h-8 border-3 border-[#CD0000] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* Header (Section 1: Warm White #EFEDE6) */}
      <section className="py-24 bg-[#EFEDE6] border-b border-[#B8B8B8]/20">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#CD0000]/5 border border-[#CD0000]/20 text-[#CD0000] text-xs font-bold uppercase tracking-widest mb-6">
              Calendar
            </span>
            <h1 className="font-grotesk text-5xl md:text-7xl font-black mb-6 text-[#121212] tracking-tighter leading-none">
              EVENTS &amp; <span className="text-[#CD0000]">HACKATHONS</span>
            </h1>
            <p className="text-lg text-[#121212]/70 max-w-2xl mx-auto leading-relaxed">
              Discover workshops, hackathons, and tech talks to level up your skills.
            </p>
          </motion.div>

          {/* Featured Carousel */}
          {carouselEvents.length > 0 && (
            <div
              className="relative w-full h-[380px] md:h-[460px] rounded-3xl overflow-hidden shadow-xl border border-[#B8B8B8]/30 bg-[#121212]"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <div className="w-full h-full relative flex items-end bg-gradient-to-br from-[#121212] to-[#181818]">
                    {/* Subtle grid */}
                    <div className="absolute inset-0 animated-grid opacity-25" />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-[#121212]/80 to-transparent" />

                    {/* Content */}
                    <div className="relative z-10 p-8 md:p-12 w-full max-w-4xl">
                      <div className="flex flex-wrap gap-3 mb-4">
                        <span className="px-3 py-1 rounded-full bg-[#CD0000] text-[#EFEDE6] text-[10px] font-bold uppercase tracking-wider">
                          {carouselEvents[currentSlide].category}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          carouselEvents[currentSlide].status === 'upcoming'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-white/10 text-[#B8B8B8] border-white/10'
                        }`}>
                          {carouselEvents[currentSlide].status}
                        </span>
                      </div>
                      <h2 className="font-grotesk text-3xl md:text-5xl font-black text-white mb-4 leading-tight tracking-tight">
                        {carouselEvents[currentSlide].title}
                      </h2>
                      <p className="text-[#B8B8B8] md:text-base mb-6 line-clamp-2 max-w-3xl leading-relaxed">
                        {carouselEvents[currentSlide].description}
                      </p>
                      <div className="flex flex-wrap gap-3 mb-8">
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#EFEDE6]/90 bg-white/5 border border-white/10 px-4 py-1.5 rounded-xl">
                          <Calendar size={14} className="text-[#CD0000]" />
                          <span>{new Date(carouselEvents[currentSlide].date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#EFEDE6]/90 bg-white/5 border border-white/10 px-4 py-1.5 rounded-xl">
                          <MapPin size={14} className="text-[#CD0000]" />
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
              <div className="absolute right-4 md:right-6 bottom-6 flex gap-2 z-20">
                <button onClick={prevSlide} className="w-9 h-9 rounded-full bg-white/10 backdrop-blur border border-white/10 flex items-center justify-center text-white hover:bg-[#CD0000] hover:text-[#EFEDE6] hover:border-[#CD0000] transition-all">
                  <ChevronLeft size={18} />
                </button>
                <button onClick={nextSlide} className="w-9 h-9 rounded-full bg-white/10 backdrop-blur border border-white/10 flex items-center justify-center text-white hover:bg-[#CD0000] hover:text-[#EFEDE6] hover:border-[#CD0000] transition-all">
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Indicators */}
              <div className="absolute top-6 right-6 flex gap-1.5 z-20">
                {carouselEvents.map((_, idx) => (
                  <button key={idx} onClick={() => setCurrentSlide(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-6 bg-[#CD0000]' : 'w-1.5 bg-white/30 hover:bg-[#CD0000]/60'}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Events Grid (Section 2: Charcoal Black #121212) */}
      <section className="py-24 bg-[#121212]">
        <div className="container mx-auto px-6 max-w-7xl">
          {/* Filters */}
          <div className="bg-[#181818] border border-[#B8B8B8]/10 rounded-3xl p-6 mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-bold text-[#B8B8B8] uppercase tracking-widest mb-3">Status & Search</h3>
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
                <h3 className="text-xs font-bold text-[#B8B8B8] uppercase tracking-widest mb-3">Category</h3>
                <div className="flex flex-wrap gap-2 pt-2">
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
                      className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all border ${
                        categoryFilter === cat.value
                          ? 'bg-[#CD0000] text-[#EFEDE6] border-[#CD0000]'
                          : 'bg-[#121212] text-[#B8B8B8] border-[#B8B8B8]/20 hover:border-[#CD0000] hover:text-[#CD0000]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Grid */}
          <AnimatePresence mode="wait">
            {filteredEvents.length > 0 ? (
              <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredEvents.map((event, i) => (
                  <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: i * 0.05 }}>
                    <EventCard event={event as any} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                <div className="text-[#B8B8B8] mb-6 text-lg">No events found matching your criteria.</div>
                <button
                  onClick={() => { setSearch(''); setFilter('all'); setCategoryFilter('all'); }}
                  className="text-[#CD0000] font-bold hover:underline uppercase tracking-wider text-xs"
                >
                  Clear all filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </PageWrapper>
  );
};

export default EventsPage;
