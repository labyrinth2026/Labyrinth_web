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
import dynamic from 'next/dynamic';
import { usePrefetchOnIdle } from '../hooks/usePrefetchOnIdle';

const HomeVideoPlayer = dynamic(() => import('../components/ui/HomeVideoPlayer'), {
  loading: () => (
    <div className="w-full h-full bg-slate-900 animate-pulse flex items-center justify-center">
      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Loading Player...</span>
    </div>
  ),
  ssr: false,
});

import FlowingMenu from '../components/ui/FlowingMenu';
import { fetchFromSheet } from '../services/api';
import statsData from '../data/stats.json';

const techVerticals = [
  { name: "AI HUB", icon: "Brain", description: "Explore generative AI, machine learning, and intelligent systems." },
  { name: "DevZen", icon: "Code2", description: "Full-stack development, open source, and software engineering." },
  { name: "AutoBot", icon: "Cpu", description: "Robotics, IoT, and embedded systems engineering." },
  { name: "InsightX", icon: "TrendingUp", description: "Data analytics, data science, and visualization." },
  { name: "Research Guidance", icon: "BookOpen", description: "Academic paper guidance, research, and papers." }
];

const nonTechVerticals = [
  { name: "FieldOps", icon: "Shield", description: "Event operations, sports, and field management." },
  { name: "Debate", icon: "MessageCircle", description: "Voice, logic, structure, and debating matches." },
  { name: "InterVerse", icon: "Gamepad2", description: "Department collaborations, networking, and outer club partnerships." },
  { name: "Startovate", icon: "Sparkles", description: "Entrepreneurship, startup ideas, and pitches." },
  { name: "Peer Sessions", icon: "Users", description: "Peer learning and student mentoring wing." }
];

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

  usePrefetchOnIdle(['/about', '/verticals']);

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

  // Display all verticals on the homepage
  const displayVerticals = verticalsData.length > 0 ? verticalsData : [
    { name: "AI HUB", icon: "Brain", description: "Explore generative AI, machine learning, and intelligent systems." },
    { name: "DevZen", icon: "Code2", description: "Full-stack development, open source, and software engineering." },
    { name: "AutoBot", icon: "Cpu", description: "Robotics, IoT, and embedded systems engineering." },
    { name: "InsightX", icon: "TrendingUp", description: "Data analytics, data science, and visualization." },
    { name: "FieldOps", icon: "Shield", description: "Event operations, logistics, and field management." },
    { name: "Debate", icon: "MessageCircle", description: "Tech debates, public speaking, and critical thinking." },
    { name: "InterVerse", icon: "Gamepad2", description: "Virtual worlds, gaming, and immersive experiences." },
    { name: "Startovate", icon: "Sparkles", description: "Entrepreneurship, start-up ideas, and innovation." },
    { name: "Peer Sessions", icon: "Users", description: "Peer-to-peer knowledge sharing and workshops." },
    { name: "Research Guidance", icon: "BookOpen", description: "Academic research, paper publishing, and guidance." }
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

    const animTargets = [
      { selector: '.hero-title-word', from: { opacity: 0, y: 30 }, to: { opacity: 1, y: 0, duration: 0.6, stagger: 0.07 }, pos: '-=0.2' },
      { selector: '.hero-subtitle', from: { opacity: 0, y: 12 }, to: { opacity: 1, y: 0, duration: 0.5 }, pos: '-=0.4' },
      { selector: '.hero-desc', from: { opacity: 0, y: 20 }, to: { opacity: 1, y: 0, duration: 0.5 }, pos: '-=0.4' },
      { selector: '.hero-cta', from: { opacity: 0, scale: 0.95 }, to: { opacity: 1, scale: 1, duration: 0.5 }, pos: '-=0.3' },
      { selector: '.hero-stat-item', from: { opacity: 0, y: 15 }, to: { opacity: 1, y: 0, duration: 0.5, stagger: 0.07 }, pos: '-=0.2' }
    ];

    animTargets.forEach(({ selector, from, to, pos }) => {
      if (containerRef.current?.querySelector(selector)) {
        tl.fromTo(selector, from, to, pos);
      }
    });

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

          <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center flex flex-col items-center pt-24 pb-16">
            <div className="flex flex-col items-center">
              <h1 className="text-4xl sm:text-7xl md:text-8xl lg:text-[7.5rem] font-extrabold tracking-tighter mb-4 text-white leading-[1.05]">
                <span className="hero-title-word inline-block">LABY</span>
                <span className="hero-title-word text-[#CD0000] inline-block">RINTH</span>
              </h1>
              <p className="hero-subtitle text-xs md:text-sm text-slate-300 font-bold uppercase tracking-widest mb-6">Christ University, Bengaluru</p>
              <p className="hero-desc text-sm md:text-base text-slate-200 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                Labyrinth serves as the official Computer Science Club of Christ University, fostering research, innovation, and digital excellence.
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
                <Button variant="secondary" size="md" href="/forms/join-community">
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
        <section id="stats" className="py-16 sm:py-24 bg-white border-t border-slate-100">
          <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
            <SectionHeading title="By The Numbers" subtitle="Our Impact" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <ScrollReveal stagger={0.08}>
                {statsData.map((stat, i) => (
                  <StatCounter
                    key={i}
                    value={stat.value}
                    label={stat.label}
                    suffix={stat.suffix}
                    icon={i === 0 ? Layers : Users}
                  />
                ))}
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ── About Labyrinth Split Section ── */}
        <section className="py-16 sm:py-24 bg-white border-t border-slate-100">
          <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
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
                    Labyrinth is dedicated to fostering research, innovation, and digital excellence.
                  </p>
                  <p className="text-slate-500 text-sm leading-relaxed mb-8">
                    Every year, the club hosts coding competitions, hackathons, workshops, sports tournaments, and interdisciplinary events — giving every student a platform to discover their niche and grow.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ── Verticals Section: Technical & Non-Technical ── */}
        <section id="verticals" className="py-16 sm:py-24 bg-slate-50/50 border-t border-slate-200/60">
          <div className="container mx-auto px-4 sm:px-6 max-w-7xl space-y-12 sm:space-y-16">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <SectionHeading title="Our Verticals" subtitle="What We Do" align="left" className="mb-0" />
              <Button variant="outline" size="sm" href="/verticals">
                All Verticals Details <ArrowRight size={12} />
              </Button>
            </div>

            {/* 1. Technical Domains */}
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
                <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Technical Domains
                </h3>
                <Link href="/verticals" className="text-[#CD0000] hover:text-[#A00000] text-xs font-bold flex items-center gap-1">
                  Explore All Tech Verticals <ArrowRight size={12} />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <ScrollReveal stagger={0.08}>
                  {techVerticals.slice(0, 3).map((vert) => {
                    const Icon = (LucideIcons as any)[vert.icon] || LucideIcons.Layers;
                    return (
                      <Link key={vert.name} href="/verticals" className="block group">
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 hover:scale-[1.015] hover:-translate-y-1 hover:shadow-md transition-all duration-300 h-full flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-5">
                              <div className="w-10 h-10 rounded-xl bg-[#CD0000]/5 flex items-center justify-center text-[#CD0000] group-hover:bg-[#CD0000] group-hover:text-white transition-all duration-300">
                                <Icon size={18} />
                              </div>
                              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200/60 text-slate-500 text-[10px] font-extrabold uppercase tracking-wider">
                                TECH
                              </span>
                            </div>
                            <h4 className="font-bold text-slate-800 text-base mb-1.5 group-hover:text-[#CD0000] transition-colors">
                              {vert.name}
                            </h4>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              {vert.description}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </ScrollReveal>
              </div>
            </div>

            {/* 2. Non-Technical Domains */}
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
                <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Non-Technical Domains
                </h3>
                <Link href="/verticals" className="text-[#CD0000] hover:text-[#A00000] text-xs font-bold flex items-center gap-1">
                  Explore All Non-Tech Verticals <ArrowRight size={12} />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <ScrollReveal stagger={0.08}>
                  {nonTechVerticals.slice(0, 3).map((vert) => {
                    const Icon = (LucideIcons as any)[vert.icon] || LucideIcons.Layers;
                    return (
                      <Link key={vert.name} href="/verticals" className="block group">
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 hover:scale-[1.015] hover:-translate-y-1 hover:shadow-md transition-all duration-300 h-full flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-5">
                              <div className="w-10 h-10 rounded-xl bg-[#CD0000]/5 flex items-center justify-center text-[#CD0000] group-hover:bg-[#CD0000] group-hover:text-white transition-all duration-300">
                                <Icon size={18} />
                              </div>
                              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200/60 text-slate-500 text-[10px] font-extrabold uppercase tracking-wider">
                                NON-TECH
                              </span>
                            </div>
                            <h4 className="font-bold text-slate-800 text-base mb-1.5 group-hover:text-[#CD0000] transition-colors">
                              {vert.name}
                            </h4>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              {vert.description}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </ScrollReveal>
              </div>
            </div>

            {/* Bottom Global Explore Button */}
            <div className="flex justify-center pt-2">
              <Button variant="outline" size="md" href="/verticals">
                Explore All 10 Verticals <ArrowRight size={14} />
              </Button>
            </div>

          </div>
        </section>

        {/* ── Events Section Wrapper ── */}
        <div id="events" className="scroll-mt-20">
          {/* ── Featured Events Carousel ── */}
          {featuredEvents.length > 0 && (
            <section className="py-16 sm:py-24 bg-white border-t border-slate-100">
              <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
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
                    <div className="absolute top-1/2 -translate-y-1/2 left-2 sm:left-3 md:-left-4 z-10">
                      <button onClick={prevSlide} className="w-8 h-8 rounded-full bg-white/90 border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all">
                        <ChevronLeft size={16} />
                      </button>
                    </div>
                    <div className="absolute top-1/2 -translate-y-1/2 right-2 sm:right-3 md:-right-4 z-10">
                      <button onClick={nextSlide} className="w-8 h-8 rounded-full bg-white/90 border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all">
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
                    <a href="mailto:labyrinth.christ@christuniversity.in" className="text-lg font-bold text-[#CD0000] hover:text-[#9E0000] transition-colors tracking-tight">
                      labyrinth.christ@christuniversity.in
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
                    desc: 'Promoting mental health awareness, ergonomic computing, and wellness through tech-driven community programs.',
                    icon: HeartPulse
                  },
                  {
                    number: 4,
                    title: 'Quality Education',
                    desc: 'Peer education sessions, workshops, and skill-building bootcamps making quality CS education accessible to all.',
                    icon: BookOpen
                  },
                  {
                    number: 8,
                    title: 'Decent Work & Economic Growth',
                    desc: 'Resume building workshops, career readiness sessions, and incubation partnerships preparing students for the workforce.',
                    icon: TrendingUp
                  },
                  {
                    number: 9,
                    title: 'Industry, Innovation & Infrastructure',
                    desc: 'Hackathons, innovation pitches, and R&D projects building the next generation of tech infrastructure.',
                    icon: Cpu
                  },
                  {
                    number: 16,
                    title: 'Peace, Justice & Strong Institutions',
                    desc: 'Constitution Day events and digital citizenship awareness fostering responsible use of technology.',
                    icon: Scale
                  },
                  {
                    number: 17,
                    title: 'Partnerships for the Goals',
                    desc: 'Collaborations with THWS, CHRIST Incubation Centre, and community outreach programs for shared impact.',
                    icon: Handshake
                  },
                ].map((sdg) => {
                  const Icon = sdg.icon;
                  return (
                    <div
                      key={sdg.number}
                      className="group bg-white border border-slate-200/80 rounded-2xl p-6 hover:scale-[1.02] hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden shadow-xs hover:shadow-[0_10px_30px_rgba(205,0,0,0.12)] hover:border-[#CD0000]/30"
                    >
                      {/* Ambient hover glow backdrop */}
                      <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#CD0000]/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                      <div className="flex items-start gap-4 relative z-10">
                        <div className="shrink-0 w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center transition-all duration-300 group-hover:bg-[#CD0000] group-hover:text-white group-hover:shadow-md group-hover:shadow-[#CD0000]/20">
                          <Icon size={18} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#CD0000] bg-[#CD0000]/8 px-2.5 py-0.5 rounded-full border border-[#CD0000]/15">
                              SDG {sdg.number}
                            </span>
                          </div>
                          <h3 className="font-bold text-slate-900 text-sm mb-2 leading-snug group-hover:text-[#CD0000] transition-colors">
                            {sdg.title}
                          </h3>
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
                    <Link
                      href="/forms/join-community"
                      className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#CD0000] font-extrabold uppercase tracking-wider text-sm rounded-full hover:bg-slate-50 hover:scale-105 transition-all shadow-lg"
                    >
                      Apply to Join <ArrowRight size={16} />
                    </Link>
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
