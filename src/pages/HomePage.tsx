import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, ArrowRight, Brain, Gamepad2, Code2, Shield, Users, Sparkles } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/ui/Button';
import SectionHeading from '../components/ui/SectionHeading';
import StatCounter from '../components/ui/StatCounter';
import EventCard from '../components/ui/EventCard';
import TeamCard from '../components/ui/TeamCard';
import { NavLink } from 'react-router-dom';

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
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#005BAC] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="pt-0 pb-0">

      {/* ── Hero Section ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-white via-[#EAF4FF] to-[#D6EBFF]">
        {/* Subtle grid */}
        <div className="absolute inset-0 animated-grid opacity-40 pointer-events-none" />

        {/* Blue accent blobs */}
        <div className="absolute top-1/4 left-10 w-80 h-80 bg-[#005BAC]/10 rounded-full blur-[80px] pointer-events-none animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-[#1a8fc4]/10 rounded-full blur-[80px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }} />

        <div className="container mx-auto px-6 relative z-10 text-center flex flex-col items-center pt-24 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EAF4FF] border border-[#D6EBFF] text-[#005BAC] text-sm font-semibold tracking-widest uppercase mb-6">
              <Sparkles size={14} />
              Computer Science Club · Christ University
            </span>

            <h1 className="font-grotesk text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-4 text-[#1a2c4a] leading-none">
              LABY<span className="text-[#005BAC]">RINTH</span>
            </h1>
            <p className="text-xl md:text-2xl text-[#4b6080] font-medium mb-2">Christ University, Bengaluru</p>
            <p className="text-base md:text-lg text-[#7a90aa] max-w-xl mx-auto mb-10">
              The Computer Science Department's Computer Academy has been active since 1997. Labyrinth was established as the official face of this academy and serves as the only Computer Science Club of Christ University.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button variant="primary" size="lg" href="/verticals">
              Explore Verticals <ArrowRight size={18} />
            </Button>
            <Button variant="secondary" size="lg" href="/contact">
              Join Community
            </Button>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="flex flex-wrap justify-center gap-8 mt-16"
          >
            {statsData.slice(0, 4).map((stat, i) => (
              <div key={i} className="text-center">
                <div className="font-grotesk text-3xl font-bold text-[#005BAC]">{stat.value}{stat.suffix}</div>
                <div className="text-sm text-[#7a90aa] font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[#7a90aa]"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <ChevronRight size={22} className="rotate-90" />
        </motion.div>
      </section>

      {/* ── Stats Section ── */}
      <section className="py-20 bg-[#EAF4FF]">
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
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex justify-between items-end mb-12">
            <SectionHeading title="Our Verticals" subtitle="What We Do" align="left" className="mb-0" />
            <Button variant="outline" size="sm" href="/verticals">
              All Verticals <ArrowRight size={14} />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {verticals.map(({ name, icon: Icon, desc }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <NavLink to="/verticals" className="block group">
                  <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:shadow-[#005BAC]/10 hover:-translate-y-1 transition-all duration-200">
                    <div className="w-12 h-12 rounded-xl bg-[#EAF4FF] flex items-center justify-center text-[#005BAC] mb-4 group-hover:bg-[#005BAC] group-hover:text-white transition-all duration-200">
                      <Icon size={24} />
                    </div>
                    <h3 className="font-grotesk font-bold text-[#1a2c4a] mb-1 group-hover:text-[#005BAC] transition-colors">{name}</h3>
                    <p className="text-sm text-[#7a90aa]">{desc}</p>
                  </div>
                </NavLink>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Events Carousel ── */}
      {featuredEvents.length > 0 && (
        <section className="py-20 bg-[#EAF4FF]">
          <div className="container mx-auto px-6 max-w-7xl">
            <SectionHeading title="Featured Events" subtitle="Don't Miss Out" />

            <div
              className="relative bg-white border border-blue-100 rounded-3xl shadow-md p-6 md:p-10"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className="relative h-[400px] overflow-hidden rounded-2xl bg-[#EAF4FF]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 60 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -60 }}
                    transition={{ duration: 0.45, ease: 'easeInOut' }}
                    className="absolute inset-0"
                  >
                    <div className="w-full h-full flex flex-col justify-end p-8 md:p-12 bg-gradient-to-t from-[#003b73] via-[#005BAC]/70 to-transparent rounded-2xl">
                      <div className="flex gap-3 mb-4">
                        <span className="px-3 py-1 rounded-full bg-white text-[#005BAC] text-xs font-bold uppercase tracking-wider">
                          {featuredEvents[currentSlide].category}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur text-white text-xs font-medium border border-white/30">
                          {new Date(featuredEvents[currentSlide].date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <h3 className="font-grotesk text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
                        {featuredEvents[currentSlide].title}
                      </h3>
                      <p className="text-blue-100 md:text-lg mb-6 max-w-2xl line-clamp-2">
                        {featuredEvents[currentSlide].description}
                      </p>
                      <Button variant="primary" size="sm">Register Now</Button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Nav Controls */}
              <div className="absolute top-1/2 -translate-y-1/2 left-3 md:-left-5">
                <button onClick={prevSlide} className="w-10 h-10 rounded-full bg-white border border-blue-100 shadow-md flex items-center justify-center text-[#005BAC] hover:bg-[#005BAC] hover:text-white transition-all">
                  <ChevronLeft size={20} />
                </button>
              </div>
              <div className="absolute top-1/2 -translate-y-1/2 right-3 md:-right-5">
                <button onClick={nextSlide} className="w-10 h-10 rounded-full bg-white border border-blue-100 shadow-md flex items-center justify-center text-[#005BAC] hover:bg-[#005BAC] hover:text-white transition-all">
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Dots */}
              <div className="flex justify-center gap-2 mt-5">
                {featuredEvents.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentSlide === idx ? 'w-7 bg-[#005BAC]' : 'w-2 bg-blue-200 hover:bg-[#005BAC]/50'
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
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="flex justify-between items-end mb-12">
              <SectionHeading title="Upcoming Events" align="left" className="mb-0" />
              <Button variant="outline" size="sm" href="/events">
                View All <ArrowRight size={14} />
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
      <section className="py-20 bg-[#005BAC]">
        <div className="container mx-auto px-6 max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 text-white mb-6">
              <Sparkles size={32} />
            </div>
            <h2 className="font-grotesk text-4xl md:text-5xl font-bold text-white mb-6">
              SDG Projects Initiative
            </h2>
            <p className="text-blue-100 text-lg md:text-xl mb-4 max-w-3xl mx-auto">
              Inviting project proposals aligned with the United Nations Sustainable Development Goals (SDGs) and relevant to Christ University.
            </p>
            <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-3xl mx-auto">
              Students are encouraged to submit innovative project ideas that address real-world challenges and create meaningful impact.
            </p>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 inline-block">
              <p className="text-white font-medium mb-2 uppercase tracking-wider text-sm">Proposal Submission Email</p>
              <a href="mailto:labyrinth@cs.christuniversity.in" className="text-xl md:text-2xl font-bold text-white hover:text-blue-200 transition-colors">
                labyrinth@cs.christuniversity.in
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Team Preview ── */}
      <section className="py-20 bg-[#EAF4FF]">
        <div className="container mx-auto px-6 max-w-7xl">
          <SectionHeading title="Meet The Team" subtitle="Leadership" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {leadership.map(member => (
              <TeamCard key={member.id} member={member} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button variant="secondary" href="/team">
              <Users size={16} /> Meet Full Team
            </Button>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 bg-[#005BAC]">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-grotesk text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to be part of something bigger?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
              Join Labyrinth and collaborate with the brightest minds at Christ University.
            </p>
            <Button
              variant="secondary"
              size="lg"
              href="/contact"
            >
              Apply to Join →
            </Button>
          </motion.div>
        </div>
      </section>

    </PageWrapper>
  );
};

export default HomePage;
