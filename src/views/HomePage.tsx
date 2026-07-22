import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, ArrowRight, Brain, Gamepad2, Code2, Shield, Users, Sparkles, Layers, CalendarCheck, MessageCircle, HeartPulse, BookOpen, TrendingUp, Cpu, Scale, Handshake } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import Image from 'next/image';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/ui/Button';
import SectionHeading from '../components/ui/SectionHeading';
import StatCounter from '../components/ui/StatCounter';
import EventCard from '../components/ui/EventCard';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import ScrollReveal from '../components/ui/ScrollReveal';
import HomeVideoPlayer from '../components/ui/HomeVideoPlayer';

import { fetchFromSheet } from '../services/api';
import statsData from '../data/stats.json';

const HERO_IMAGES = [
  '/gallery/inauguration_all_1.webp',
  '/gallery/peer_edu_all_1.webp',
  '/gallery/20260212_181054.webp',
  '/gallery/inauguration_all_51.webp',
  '/gallery/peer_edu_all_3.webp',
  '/gallery/20260215_133007.webp',
  '/gallery/inauguration_all_10.webp',
  '/gallery/IMG-20260214-WA0023.webp'
];

const HomePage: React.FC = () => {
  const [eventsData, setEventsData] = useState<any[]>([]);
  const [verticalsData, setVerticalsData] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const featuredEvents = eventsData.filter(e => e.featured);
  const upcomingEvents = eventsData.filter(e => e.status === 'upcoming' && !e.featured).slice(0, 3);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Hero carousel state
  const [[heroIndex, direction], setHeroState] = useState([0, 1]);

  const setHeroIndex = (update: number | ((prev: number) => number)) => {
    setHeroState(([prevIndex]) => {
      const nextIndex = typeof update === 'function' ? update(prevIndex) : update;
      if (nextIndex === prevIndex) return [prevIndex, 1];

      let dir = 1;
      if (prevIndex === HERO_IMAGES.length - 1 && nextIndex === 0) {
        dir = 1;
      } else if (prevIndex === 0 && nextIndex === HERO_IMAGES.length - 1) {
        dir = -1;
      } else {
        dir = nextIndex > prevIndex ? 1 : -1;
      }
      return [nextIndex, dir];
    });
  };

  const [heroHovered, setHeroHovered] = useState(false);

  const touchStartX = useRef<number | null>(null);

  const nextHeroSlide = () => {
    setHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
  };
  const prevHeroSlide = () => {
    setHeroIndex((prev) => (prev - 1 + HERO_IMAGES.length) % HERO_IMAGES.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 50) {
      nextHeroSlide();
    } else if (diff < -50) {
      prevHeroSlide();
    }
    touchStartX.current = null;
  };

  useEffect(() => {
    if (heroHovered) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [heroHovered]);

  useEffect(() => {
    // Load events data non-blocking — page renders immediately
    fetchFromSheet('getEvents')
      .then((events: any) => { if (Array.isArray(events)) setEventsData(events); })
      .catch(console.error);

    // Load verticals data dynamically
    fetchFromSheet('getVerticals')
      .then((verticals: any) => { if (Array.isArray(verticals)) setVerticalsData(verticals); })
      .catch(console.error);
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

  // Get up to 4 verticals to display on the home page as a preview.
  // We specify the new verticals as initial fallbacks.
  const displayVerticals = verticalsData.length > 0 ? verticalsData.slice(0, 4) : [
    { name: "AI HUB", icon: "Brain", description: "Explore generative AI, machine learning, and intelligent systems." },
    { name: "DevZen", icon: "Code2", description: "Full-stack development, open source, and software engineering." },
    { name: "AutoBot", icon: "Cpu", description: "Robotics, IoT, and embedded systems engineering." },
    { name: "InsightX", icon: "BarChart3", description: "Data analytics, data science, and visualization." }
  ];

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      if (containerRef.current) gsap.set(containerRef.current, { opacity: 1 });
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (containerRef.current) {
      tl.to(containerRef.current, { opacity: 1, duration: 0.4 });
    }

    const navbar = document.querySelector('.main-navbar');
    if (navbar) {
      tl.fromTo(navbar, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.1');
    }

    tl.fromTo('.hero-title-word',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.07 },
      '-=0.2'
    )
      .fromTo('.hero-subtitle', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.4')
      .fromTo('.hero-desc', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.4')
      .fromTo('.hero-cta', { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.5 }, '-=0.3')
      .fromTo('.hero-stat-item', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.07 }, '-=0.2');

  }, { scope: containerRef, dependencies: [] });


  return (
    <PageWrapper className="pt-0 pb-0">
      <div ref={containerRef} className="home-page-container opacity-0">

        {/* ── Hero Section ── */}
        <section
          id="hero"
          className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950 pt-16 z-0"
          onMouseEnter={() => setHeroHovered(true)}
          onMouseLeave={() => setHeroHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Full Width Image Carousel Background */}
          <div className="absolute inset-0 w-full h-full z-0 overflow-hidden select-none">
            <div className="absolute inset-0 w-full h-full">
              <Image
                src={HERO_IMAGES[heroIndex]}
                alt="Labyrinth Activity"
                fill
                priority={heroIndex === 0}
                className="object-cover"
                sizes="100vw"
              />
            </div>
            {/* Subtle Dark Overlay */}
            <div className="absolute inset-0 bg-slate-950/60 z-10 pointer-events-none" />
          </div>

          {/* Preload next image */}
          <div className="hidden">
            <Image
              src={HERO_IMAGES[(heroIndex + 1) % HERO_IMAGES.length]}
              alt="Preload next slide"
              width={100}
              height={100}
            />
          </div>

          {/* Carousel Navigation Arrows */}
          <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 hidden md:flex justify-between items-center z-20 pointer-events-none">
            <button
              onClick={prevHeroSlide}
              className="w-12 h-12 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 text-white flex items-center justify-center transition-all hover:scale-105 pointer-events-auto backdrop-blur-xs cursor-pointer shadow-md"
              aria-label="Previous Slide"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextHeroSlide}
              className="w-12 h-12 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 text-white flex items-center justify-center transition-all hover:scale-105 pointer-events-auto backdrop-blur-xs cursor-pointer shadow-md"
              aria-label="Next Slide"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          <div className="container mx-auto px-6 relative z-10 text-center flex flex-col items-center pt-24 pb-16">
            <div className="flex flex-col items-center">
              <h1 className="text-6xl md:text-8xl lg:text-[7.5rem] font-extrabold tracking-tighter mb-4 text-white leading-[1.05]">
                <span className="hero-title-word inline-block">LABY</span>
                <span className="hero-title-word text-[#CD0000] inline-block">RINTH</span>
              </h1>
              <p className="hero-subtitle text-xs md:text-sm text-slate-300 font-bold uppercase tracking-widest mb-6">Christ University, Bengaluru</p>
              <p className="hero-desc text-sm md:text-base text-slate-200 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                The Computer Science Department's Computer Academy has been active since 1997. Labyrinth serves as the official Computer Science Club of Christ University, fostering research, engineering, and digital excellence.
              </p>
            </div>

            <div className="hero-cta">
              {/* Hero CTA glassmorphic panel */}
              <div
                style={{
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
                }}
                className="p-4 rounded-3xl flex flex-col sm:flex-row gap-3 items-center justify-center"
              >
                <Button variant="primary" size="md" href="/verticals">
                  Explore Verticals <ArrowRight size={14} />
                </Button>
                <Button variant="secondary" size="md" href="https://forms.gle/vzHppHwu2C977eNA7">
                  Join Community
                </Button>
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2 mt-12 z-20 relative">
              {HERO_IMAGES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setHeroIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${heroIndex === idx ? 'w-6 bg-[#CD0000]' : 'w-2 bg-white/40 hover:bg-white/60'
                    }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats Section ── */}
        <section id="stats" className="py-24 bg-white border-t border-slate-100">
          <div className="container mx-auto px-6 max-w-7xl">
            <SectionHeading title="By The Numbers" subtitle="Our Impact" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <ScrollReveal stagger={0.08}>
                {statsData.map((stat, i) => (
                  <StatCounter
                    key={i}
                    value={stat.value}
                    label={stat.label}
                    suffix={stat.suffix}
                    icon={i === 0 ? Layers : i === 1 ? Users : i === 2 ? CalendarCheck : MessageCircle}
                  />
                ))}
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ── About Labyrinth Split Section ── */}
        <section className="py-24 bg-white border-t border-slate-100">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Video – left */}
              <ScrollReveal animation="slide-right">
                <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-[4/3]">
                  <HomeVideoPlayer
                    mp4="/gallery/whatsapp_video.mp4"
                    webm="/gallery/whatsapp_video.webm"
                  />
                </div>
              </ScrollReveal>

              {/* Text – right */}
              <ScrollReveal animation="slide-left">
                <div className="flex flex-col justify-center">
                  <span className="inline-block px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest mb-6 w-fit">
                    Who We Are
                  </span>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
                    The Official CS Club of <span className="text-[#CD0000]">Christ University</span>
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4">
                    The Computer Science Department's Computer Academy has been active since 1997. Labyrinth serves as its official face and is the only Computer Science Club of Christ University.
                  </p>
                  <p className="text-slate-500 text-sm leading-relaxed mb-8">
                    Every semester we host coding competitions, hackathons, workshops, sports tournaments, and interdisciplinary events — giving every student a platform to discover their niche and grow.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ── Verticals Preview ── */}
        <section id="verticals" className="py-24 bg-slate-50/50 border-t border-slate-200/60">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-4">
              <SectionHeading title="Our Verticals" subtitle="What We Do" align="left" className="mb-0" />
              <Button variant="outline" size="sm" href="/verticals">
                All Verticals <ArrowRight size={12} />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <ScrollReveal stagger={0.08}>
                {displayVerticals.map((vert) => {
                  const Icon = (LucideIcons as any)[vert.icon] || LucideIcons.Layers;
                  const desc = vert.description || vert.desc || "";
                  return (
                    <Link key={vert.name} href="/verticals" className="block group">
                      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 hover:scale-[1.015] hover:-translate-y-1 hover:shadow-md hover:shadow-[#CD0000]/[0.02] transition-all duration-300">
                        <div className="w-10 h-10 rounded-xl bg-[#CD0000]/5 flex items-center justify-center text-[#CD0000] mb-5 group-hover:bg-[#CD0000] group-hover:text-white transition-all duration-300">
                          <Icon size={18} />
                        </div>
                        <h3 className="font-bold text-slate-800 text-sm mb-1.5 group-hover:text-[#CD0000] transition-colors">{vert.name}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                      </div>
                    </Link>
                  );
                })}
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ── Events Section Wrapper ── */}
        <div id="events" className="scroll-mt-20">
          {/* ── Featured Events Carousel ── */}
          {featuredEvents.length > 0 && (
            <section className="py-24 bg-white border-t border-slate-100">
              <div className="container mx-auto px-6 max-w-7xl">
                <SectionHeading title="Featured Events" subtitle="Don't Miss Out" />

                <ScrollReveal animation="slide-up">
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
                          <Link href="/events" className="w-full h-full flex flex-col justify-end p-8 md:p-12 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent rounded-2xl group/slide">
                            <div className="flex gap-2.5 mb-3">
                              <span className="px-2.5 py-0.5 rounded-full bg-[#CD0000] text-white text-[9px] font-bold uppercase tracking-wider">
                                {featuredEvents[currentSlide].category}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur text-white text-[9px] font-bold border border-white/10 uppercase tracking-wider">
                                {new Date(featuredEvents[currentSlide].date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                            <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-2 leading-tight tracking-tight group-hover/slide:text-[#CD0000] transition-colors">
                              {featuredEvents[currentSlide].title}
                            </h3>
                            <p className="text-slate-300 text-xs md:text-sm mb-5 max-w-2xl line-clamp-2 leading-relaxed">
                              {featuredEvents[currentSlide].description}
                            </p>
                            <div>
                              <Button variant="primary" size="sm" href="/events">Register Now</Button>
                            </div>
                          </Link>
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
                          className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-5 bg-[#CD0000]' : 'w-1.5 bg-slate-200 hover:bg-slate-300'
                            }`}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
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
                  <ScrollReveal stagger={0.08}>
                    {upcomingEvents.map(event => (
                      <EventCard key={event.id} event={event as any} />
                    ))}
                  </ScrollReveal>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* ── SDG Projects Initiative ── */}
        <section className="py-24 bg-slate-50/50 border-t border-slate-100">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Text – left */}
              <ScrollReveal animation="slide-right">
                <div className="flex flex-col justify-center">
                  <span className="inline-block px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest mb-6 w-fit">
                    Initiative
                  </span>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
                    SDG Projects <span className="text-[#CD0000]">Initiative</span>
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4">
                    Inviting project proposals aligned with the United Nations Sustainable Development Goals (SDGs) and relevant to Christ University.
                  </p>
                  <p className="text-slate-500 text-sm leading-relaxed mb-8">
                    Students are encouraged to submit innovative project ideas that address real-world challenges and create meaningful impact in society.
                  </p>
                  <div className="bg-white border border-slate-200/80 rounded-2xl px-6 py-4 inline-block w-fit shadow-xs">
                    <p className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-widest">Proposal Submission Email</p>
                    <a href="mailto:labyrinth@cs.christuniversity.in" className="text-lg font-bold text-[#CD0000] hover:text-[#9E0000] transition-colors tracking-tight">
                      labyrinth@cs.christuniversity.in
                    </a>
                  </div>
                </div>
              </ScrollReveal>

              {/* Image – right */}
              <ScrollReveal animation="slide-left">
                <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-[4/3] bg-slate-100">
                  <Image
                    src="/gallery/peer_edu_all_4.webp"
                    alt="Students collaborating on peer education and SDG project ideas"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent" />
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ── SDGs Supported by Labyrinth ── */}
        <section className="py-24 bg-white border-t border-slate-100">
          <div className="container mx-auto px-6 max-w-7xl">
            <SectionHeading title="SDGs Supported by Labyrinth" subtitle="Global Impact" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <ScrollReveal stagger={0.07}>
                {[
                  {
                    number: 3,
                    title: 'Good Health & Well-being',
                    color: '#4C9F38',
                    hoverBg: 'group-hover:!bg-[#4C9F38]',
                    desc: 'Promoting mental health awareness, ergonomic computing, and wellness through tech-driven community programs.',
                    icon: HeartPulse
                  },
                  {
                    number: 4,
                    title: 'Quality Education',
                    color: '#C5192D',
                    hoverBg: 'group-hover:!bg-[#C5192D]',
                    desc: 'Peer education sessions, workshops, and skill-building bootcamps making quality CS education accessible to all.',
                    icon: BookOpen
                  },
                  {
                    number: 8,
                    title: 'Decent Work & Economic Growth',
                    color: '#A21942',
                    hoverBg: 'group-hover:!bg-[#A21942]',
                    desc: 'Resume building workshops, career readiness sessions, and incubation partnerships preparing students for the workforce.',
                    icon: TrendingUp
                  },
                  {
                    number: 9,
                    title: 'Industry, Innovation & Infrastructure',
                    color: '#FD6925',
                    hoverBg: 'group-hover:!bg-[#FD6925]',
                    desc: 'Hackathons, innovation pitches, and R&D projects building the next generation of tech infrastructure.',
                    icon: Cpu
                  },
                  {
                    number: 16,
                    title: 'Peace, Justice & Strong Institutions',
                    color: '#00689D',
                    hoverBg: 'group-hover:!bg-[#00689D]',
                    desc: 'Constitution Day events and digital citizenship awareness fostering responsible use of technology.',
                    icon: Scale
                  },
                  {
                    number: 17,
                    title: 'Partnerships for the Goals',
                    color: '#19486A',
                    hoverBg: 'group-hover:!bg-[#19486A]',
                    desc: 'Collaborations with THWS, CHRIST Incubation Centre, and community outreach programs for shared impact.',
                    icon: Handshake
                  },
                ].map((sdg) => {
                  const Icon = sdg.icon;
                  return (
                    <div
                      key={sdg.number}
                      className="group bg-white border border-slate-200/80 rounded-2xl p-6 hover:scale-[1.025] hover:-translate-y-2 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                    >
                      {/* Accent top bar */}
                      <div className="absolute top-0 left-0 right-0 h-1 transition-all duration-300" style={{ backgroundColor: sdg.color }} />

                      <div className="flex items-start gap-4">
                        <div
                          className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${sdg.hoverBg} group-hover:!text-white`}
                          style={{
                            backgroundColor: `${sdg.color}15`,
                            color: sdg.color
                          }}
                        >
                          <Icon size={18} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-800 text-sm mb-1.5 leading-tight group-hover:text-slate-900 transition-colors">
                            SDG {sdg.number}
                          </h3>
                          <p className="text-xs font-semibold mb-2" style={{ color: sdg.color }}>{sdg.title}</p>
                          <p className="text-xs text-slate-500 leading-relaxed">{sdg.desc}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section id="contact" className="py-24 bg-white border-t border-slate-100">
          <div className="container mx-auto px-6 max-w-7xl">
            <ScrollReveal animation="slide-up">
              <div className="relative overflow-hidden rounded-3xl bg-[#CD0000] shadow-xl">
                {/* Background image with overlay */}
                <div className="absolute inset-0">
                  <Image
                    src="/gallery/IMG-20260214-WA0023.webp"
                    alt="Labyrinth sports celebration"
                    fill
                    className="object-cover opacity-20"
                    sizes="100vw"
                  />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 px-10 py-14 md:px-16">
                  <div className="text-center md:text-left">
                    <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest mb-4">
                      Join Us
                    </span>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
                      Ready to be part of something bigger?
                    </h2>
                    <p className="text-white/80 text-sm md:text-base max-w-xl leading-relaxed">
                      Join Labyrinth and collaborate with the brightest tech minds at Christ University.
                    </p>
                  </div>
                  <div className="shrink-0">
                    <a
                      href="https://forms.gle/vzHppHwu2C977eNA7"
                      className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#CD0000] font-extrabold uppercase tracking-wider text-sm rounded-full hover:bg-slate-50 hover:scale-105 transition-all shadow-lg"
                    >
                      Apply to Join <ArrowRight size={16} />
                    </a>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

      </div>
    </PageWrapper>
  );
};

export default HomePage;
