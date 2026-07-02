import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, ArrowRight, Brain, Gamepad2, Code2, Shield, Users, Sparkles } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/ui/Button';
import SectionHeading from '../components/ui/SectionHeading';
import StatCounter from '../components/ui/StatCounter';
import EventCard from '../components/ui/EventCard';
import TeamCard from '../components/ui/TeamCard';
import Link from 'next/link';

import { fetchFromSheet } from '../services/api';

import statsData from '../data/stats.json';

const HomePage: React.FC = () => {
  const [eventsData, setEventsData] = useState<any[]>([]);
  const [teamData, setTeamData] = useState<any>({ facultyCoordinators: [], coreCommittee: [] });
  const [isLoading, setIsLoading] = useState(true);

  const featuredEvents = eventsData.filter(e => e.featured);
  const upcomingEvents = eventsData.filter(e => e.status === 'upcoming' && !e.featured).slice(0, 3);
  const leadership = [
    ...(teamData.facultyCoordinators || []).slice(0, 1),
    ...(teamData.coreCommittee || []).slice(0, 3)
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const events: any = await fetchFromSheet('getEvents');
        if (Array.isArray(events)) setEventsData(events);

        const team: any = await fetchFromSheet('getTeam');
        if (team && !Array.isArray(team)) setTeamData(team);
      } catch (err) {
        console.error(err);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isHovered || featuredEvents.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredEvents.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [featuredEvents.length, isHovered]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % featuredEvents.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + featuredEvents.length) % featuredEvents.length);

  const verticals = [
    { name: "AI Creator's Lab", icon: Brain, desc: "Machine Learning & AI" },
    { name: "CodeCraft", icon: Code2, desc: "Competitive Programming" },
    { name: "CipherGuard", icon: Shield, desc: "Cybersecurity" },
    { name: "GameNova", icon: Gamepad2, desc: "Game Development" },
  ];

  if (isLoading) {
    return (
      <PageWrapper className="pt-0 pb-0">
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
          <div className="w-8 h-8 border-2 border-[#CD0000] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="pt-0 pb-0">

      {/* ── Hero Section ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white minimal-grid pt-16">
        <div className="container mx-auto px-6 relative z-10 text-center flex flex-col items-center pt-24 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col items-center"
          >
            <h1 className="text-6xl md:text-8xl lg:text-[7.5rem] font-extrabold tracking-tighter mb-4 text-slate-900 leading-[1.05]">
              LABY<span className="text-[#CD0000]">RINTH</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-500 font-bold uppercase tracking-widest mb-6">Christ University, Bengaluru</p>
            <p className="text-sm md:text-base text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              The Computer Science Department's Computer Academy has been active since 1997. Labyrinth serves as the official Computer Science Club of Christ University, fostering research, engineering, and digital excellence.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            {/* Hero CTA glassmorphic panel */}
            <div 
              style={{
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                background: 'rgba(255, 255, 255, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
              }}
              className="p-4 rounded-3xl flex flex-col sm:flex-row gap-3 items-center justify-center"
            >
              <Button variant="primary" size="md" href="/verticals">
                Explore Verticals <ArrowRight size={14} />
              </Button>
              <Button variant="secondary" size="md" href="/contact">
                Join Community
              </Button>
            </div>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-12 mt-20 border-t border-slate-100 pt-10 w-full max-w-4xl"
          >
            {statsData.slice(0, 4).map((stat, i) => (
              <div key={i} className="text-center min-w-[120px]">
                <div className="text-3xl font-extrabold text-slate-900">{stat.value}{stat.suffix}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Stats Section ── */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="container mx-auto px-6 max-w-7xl">
          <SectionHeading title="By The Numbers" subtitle="Our Impact" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsData.map((stat, i) => (
              <StatCounter
                key={i}
                value={stat.value}
                label={stat.label}
                suffix={stat.suffix}
                icon={i === 0 ? Brain : i === 1 ? Code2 : i === 2 ? Gamepad2 : Shield}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Verticals Preview ── */}
      <section className="py-24 bg-slate-50/50 border-t border-slate-200/60">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-4">
            <SectionHeading title="Our Verticals" subtitle="What We Do" align="left" className="mb-0" />
            <Button variant="outline" size="sm" href="/verticals">
              All Verticals <ArrowRight size={12} />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {verticals.map(({ name, icon: Icon, desc }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href="/verticals" className="block group">
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-[#CD0000]/5 flex items-center justify-center text-[#CD0000] mb-5 group-hover:bg-[#CD0000] group-hover:text-white transition-all duration-300">
                      <Icon size={18} />
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm mb-1.5 group-hover:text-[#CD0000] transition-colors">{name}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Events Carousel ── */}
      {featuredEvents.length > 0 && (
        <section className="py-24 bg-white border-t border-slate-100">
          <div className="container mx-auto px-6 max-w-7xl">
            <SectionHeading title="Featured Events" subtitle="Don't Miss Out" />

            <div
              className="relative bg-white border border-slate-200/80 rounded-3xl p-4 md:p-6 shadow-xs"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className="relative h-[380px] overflow-hidden rounded-2xl bg-slate-50">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <div className="w-full h-full flex flex-col justify-end p-8 md:p-12 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent rounded-2xl">
                      <div className="flex gap-2.5 mb-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#CD0000] text-white text-[9px] font-bold uppercase tracking-wider">
                          {featuredEvents[currentSlide].category}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur text-white text-[9px] font-bold border border-white/10 uppercase tracking-wider">
                          {new Date(featuredEvents[currentSlide].date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-2 leading-tight tracking-tight">
                        {featuredEvents[currentSlide].title}
                      </h3>
                      <p className="text-slate-300 text-xs md:text-sm mb-5 max-w-2xl line-clamp-2 leading-relaxed">
                        {featuredEvents[currentSlide].description}
                      </p>
                      <div>
                        <Button variant="primary" size="sm" href={`/events`}>Register Now</Button>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Nav Controls */}
              <div className="absolute top-1/2 -translate-y-1/2 left-3 md:-left-4">
                <button onClick={prevSlide} className="w-8 h-8 rounded-full bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all">
                  <ChevronLeft size={16} />
                </button>
              </div>
              <div className="absolute top-1/2 -translate-y-1/2 right-3 md:-right-4">
                <button onClick={nextSlide} className="w-8 h-8 rounded-full bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all">
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Dots */}
              <div className="flex justify-center gap-1.5 mt-4">
                {featuredEvents.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      currentSlide === idx ? 'w-5 bg-[#CD0000]' : 'w-1.5 bg-slate-200 hover:bg-slate-300'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Upcoming Events ── */}
      {upcomingEvents.length > 0 && (
        <section className="py-24 bg-slate-50/50 border-t border-slate-200/60">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="flex justify-between items-end mb-16">
              <SectionHeading title="Upcoming Events" align="left" className="mb-0" />
              <Button variant="outline" size="sm" href="/events">
                View All <ArrowRight size={12} />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map(event => (
                <EventCard key={event.id} event={event as any} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SDG Projects Initiative ── */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="container mx-auto px-6 max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-5">
              SDG Projects Initiative
            </h2>
            <p className="text-slate-500 text-sm md:text-base mb-3 max-w-3xl mx-auto leading-relaxed">
              Inviting project proposals aligned with the United Nations Sustainable Development Goals (SDGs) and relevant to Christ University.
            </p>
            <p className="text-slate-500 text-sm md:text-base mb-8 max-w-3xl mx-auto leading-relaxed">
              Students are encouraged to submit innovative project ideas that address real-world challenges and create meaningful impact.
            </p>
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl px-6 py-4 inline-block">
              <p className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-widest">Proposal Submission Email</p>
              <a href="mailto:labyrinth@cs.christuniversity.in" className="text-lg md:text-xl font-bold text-[#CD0000] hover:text-[#9E0000] transition-colors tracking-tight">
                labyrinth@cs.christuniversity.in
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Team Preview ── */}
      <section className="py-24 bg-slate-50/50 border-t border-slate-200/60">
        <div className="container mx-auto px-6 max-w-7xl">
          <SectionHeading title="Meet The Team" subtitle="Leadership" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {leadership.map(member => (
              <TeamCard key={member.id} member={member} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button variant="secondary" href="/team">
              Meet Full Team
            </Button>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Ready to be part of something bigger?
            </h2>
            <p className="text-slate-500 text-sm md:text-base mb-8 max-w-xl mx-auto leading-relaxed">
              Join Labyrinth and collaborate with the brightest tech minds at Christ University.
            </p>
            <Button
              variant="primary"
              size="lg"
              href="/contact"
            >
              Apply to Join
            </Button>
          </motion.div>
        </div>
      </section>

    </PageWrapper>
  );
};

export default HomePage;
