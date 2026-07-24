"use client";

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Target, Lightbulb, Users, BookOpen, Briefcase, Zap, Layers, CalendarCheck, MessageCircle, ArrowRight } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import SectionHeading from '../components/ui/SectionHeading';
import StatCounter from '../components/ui/StatCounter';
import statsData from '../data/stats.json';
import CardSwap, { Card } from '../components/ui/CardSwap';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { usePrefetchOnIdle } from '../hooks/usePrefetchOnIdle';

const AboutPage: React.FC = () => {
  usePrefetchOnIdle(['/team', '/events']);
  const heroSectionRef = useRef<HTMLDivElement>(null);
  const photoStripRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const features = [
    { icon: BookOpen, title: 'Hands-on Learning', desc: 'Move beyond theory with practical workshops and projects.' },
    { icon: Briefcase, title: 'Industry Connections', desc: 'Network with professionals from top tech companies.' },
    { icon: Users, title: 'Peer Community', desc: 'Find co-founders, mentors, and lifelong friends.' },
    { icon: Zap, title: 'Career Growth', desc: 'Build a portfolio that makes your resume stand out.' }
  ];

  useEffect(() => {
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    // Initialize AOS
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out',
    });

    // Refresh triggers to ensure perfect layout calculation
    ScrollTrigger.refresh();
  }, []);

  // GSAP animation for Hero Section elements
  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: heroSectionRef.current,
        start: 'top 80%',
      }
    });

    tl.fromTo('.about-subtitle', 
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
    )
    .fromTo('.about-title', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      '-=0.4'
    )
    .fromTo('.about-desc',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.15 },
      '-=0.4'
    );

    // Hero card-swap container clip-path/scale reveal
    gsap.fromTo('.about-video-container',
      { 
        opacity: 0, 
        scale: 0.92,
        filter: 'blur(10px)'
      },
      {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        duration: 1.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.about-video-container',
          start: 'top 85%',
        }
      }
    );
  }, { scope: heroSectionRef });

  // GSAP animation for Photo Strip elements
  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Zoom-out scale reveal on scroll
    gsap.fromTo('.photo-strip-img',
      { scale: 1.15 },
      {
        scale: 1.0,
        scrollTrigger: {
          trigger: photoStripRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        }
      }
    );

    // Text fade and slide inside the photo strip
    gsap.fromTo('.photo-strip-content',
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: photoStripRef.current,
          start: 'top 75%',
        }
      }
    );
  }, { scope: photoStripRef });

  // GSAP animation for CTA Section elements
  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ctaRef.current,
        start: 'top 85%',
      }
    });

    tl.fromTo('.cta-container',
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' }
    )
    .fromTo('.cta-el',
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.08 },
      '-=0.4'
    );
  }, { scope: ctaRef });

  return (
    <PageWrapper>
      {/* Hero Banner: Text left, Image/CardSwap right */}
      <section ref={heroSectionRef} className="relative py-16 sm:py-24 bg-white overflow-hidden border-b border-slate-100">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Text – left */}
            <div>
              <span className="about-subtitle inline-block px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest mb-6">
                About Us
              </span>
              <h1 className="about-title text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 sm:mb-8 text-slate-900 tracking-tight leading-tight">
                ABOUT <span className="text-[#CD0000]">LABYRINTH</span>
              </h1>
              <p className="about-desc text-sm md:text-base text-slate-500 leading-relaxed mb-4">
                Labyrinth was created with the purpose of providing students a platform to showcase their talents, develop leadership skills, collaborate with peers, and explore diverse domains within Computer Science and beyond.
              </p>
              <p className="about-desc text-sm md:text-base text-slate-500 leading-relaxed mb-8">
                Every year, the club organizes a wide range of technical and non-technical events, including coding competitions, debugging challenges, logical puzzle contests, web development and design competitions, gaming tournaments, debates, sports activities, entrepreneurship initiatives, and interdisciplinary collaborations.
              </p>
              <p className="about-desc font-bold text-[#CD0000] uppercase tracking-wider text-xs">
                Labyrinth is for the students, by the students.
              </p>
            </div>

            {/* Cards Slider – right */}
            <div className="about-video-container relative w-full flex items-center justify-center min-h-[260px] sm:min-h-[450px] lg:min-h-[550px] overflow-visible">
              <CardSwap
                width={420}
                height={315}
                cardDistance={40}
                verticalDistance={30}
                delay={4000}
                pauseOnHover={true}
              >
                <Card className="overflow-hidden border border-slate-200/20 shadow-xl bg-slate-950">
                  <div className="relative w-full h-full">
                    <Image
                      src="/gallery/inauguration_all_1.webp"
                      alt="Labyrinth Inauguration Ceremony"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 420px"
                    />

                  </div>
                </Card>
 
                <Card className="overflow-hidden border border-slate-200/20 shadow-xl bg-slate-950">
                  <div className="relative w-full h-full">
                    <Image
                      src="/gallery/peer_edu_all_3.webp"
                      alt="Peer Education Sessions"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 420px"
                    />

                  </div>
                </Card>
 
                <Card className="overflow-hidden border border-slate-200/20 shadow-xl bg-slate-950">
                  <div className="relative w-full h-full">
                    <Image
                      src="/gallery/20260212_181054.webp"
                      alt="Hackathons & Coding Competitions"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 420px"
                    />

                  </div>
                </Card>
 
                <Card className="overflow-hidden border border-slate-200/20 shadow-xl bg-slate-950">
                  <div className="relative w-full h-full">
                    <Image
                      src="/gallery/20260215_133007.webp"
                      alt="Community Gatherings"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 420px"
                    />

                  </div>
                </Card>
              </CardSwap>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision (Section 2: Clean Off-White) */}
      <section className="py-24 bg-slate-50/50 border-b border-slate-200/60">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            <div 
              data-aos="fade-up"
              data-aos-delay="0"
              className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-8 h-full hover:scale-[1.015] hover:-translate-y-1 hover:shadow-md hover:shadow-[#CD0000]/[0.02] transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-[#CD0000]/5 border border-[#CD0000]/10 flex items-center justify-center text-[#CD0000] mb-6">
                <Target size={22} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">Our Mission</h2>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">
                To create a vibrant student community that promotes innovation, technical excellence, creativity, leadership, collaboration, and holistic development among students.
              </p>
            </div>

            <div 
              data-aos="fade-up"
              data-aos-delay="150"
              className="bg-slate-900 border border-slate-900 rounded-2xl shadow-sm p-8 h-full hover:scale-[1.015] hover:-translate-y-1 hover:shadow-md hover:shadow-white/[0.01] transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white mb-6">
                <Lightbulb size={22} />
              </div>
              <h2 className="text-xl font-bold text-white mb-3 tracking-tight">Our Vision</h2>
              <p className="text-slate-300 text-xs leading-relaxed font-medium">
                To become a platform where students discover opportunities, build skills, showcase talents, and contribute meaningfully to the technology ecosystem and society.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section (Clean White) */}
      <section className="py-24 bg-white border-b border-slate-100">
        <div className="container mx-auto px-6 max-w-6xl">
          <SectionHeading title="By The Numbers" subtitle="Our Impact" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {statsData.map((stat, i) => (
              <div 
                key={i} 
                data-aos="fade-up" 
                data-aos-delay={i * 100}
              >
                <StatCounter
                  value={stat.value}
                  label={stat.label}
                  suffix={stat.suffix}
                  icon={i === 0 ? Layers : Users}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full-width photo strip */}
      <section ref={photoStripRef} className="relative overflow-hidden" style={{height: '22rem'}}>
        <div className="photo-strip-img absolute inset-0 w-full h-full">
          <Image
            src="/gallery/peer_edu_all_1.webp"
            alt="Labyrinth peer education session with students engaged in learning"
            fill
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-slate-950/60" />
        <div className="photo-strip-content absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">Our Philosophy</p>
          <blockquote className="text-white text-2xl md:text-3xl font-extrabold max-w-3xl leading-tight tracking-tight">
            &ldquo;Building the next generation of <span className="text-[#CD0000]">innovators</span>, one event at a time.&rdquo;
          </blockquote>
        </div>
      </section>

      {/* Why Labyrinth? (Section 3: Pure White) */}
      <section className="py-24 bg-white border-b border-slate-100">
        <div className="container mx-auto px-6 max-w-6xl">
          <SectionHeading title="Why LABYRINTH?" subtitle="Benefits" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div 
                key={i} 
                data-aos="fade-up"
                data-aos-delay={i * 100}
                className="bg-white border border-slate-200/80 rounded-2xl p-6 h-full text-center group hover:scale-[1.015] hover:-translate-y-1 hover:shadow-md hover:shadow-[#CD0000]/[0.02] transition-all duration-300"
              >
                <div className="w-10 h-10 mx-auto rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-500 mb-6 group-hover:bg-[#CD0000] group-hover:text-white transition-all duration-300">
                  <feature.icon size={18} />
                </div>
                <h3 className="text-sm font-bold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-24 bg-slate-50/50">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="cta-container relative overflow-hidden rounded-3xl bg-[#CD0000] shadow-xl">
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
                <span className="cta-el inline-block px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest mb-4">
                  Join Us
                </span>
                <h2 className="cta-el text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
                  Ready to be part of something bigger?
                </h2>
                <p className="cta-el text-white/80 text-sm md:text-base max-w-xl leading-relaxed">
                  Join Labyrinth and collaborate with the brightest tech minds at Christ University.
                </p>
              </div>
              <div className="cta-el shrink-0">
                <Link
                  href="/forms/join-community"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#CD0000] font-extrabold uppercase tracking-wider text-sm rounded-full hover:bg-slate-50 hover:scale-105 transition-all shadow-lg"
                >
                  Apply to Join <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
};

export default AboutPage;
