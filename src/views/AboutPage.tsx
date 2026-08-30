"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Target, Lightbulb, Users, BookOpen, Briefcase, Zap, Layers, CalendarCheck, MessageCircle, ArrowRight, Quote } from 'lucide-react';
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

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const AboutPage: React.FC = () => {
  const [testimonialExpanded, setTestimonialExpanded] = useState(false);
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
      <section className="py-16 sm:py-24 bg-slate-50/50 border-b border-slate-200/60">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            <div 
              data-aos="fade-up"
              data-aos-delay="0"
              className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-8 h-full hover:scale-[1.015] hover:-translate-y-1 hover:shadow-md hover:shadow-[#CD0000]/[0.02] transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-[#CD0000]/5 border border-[#CD0000]/10 flex items-center justify-center text-[#CD0000] mb-6">
                <Target size={22} />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-4 tracking-tight">Our Mission</h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
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
              <h2 className="text-2xl font-extrabold text-white mb-4 tracking-tight">Our Vision</h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-medium">
                To become a platform where students discover opportunities, build skills, showcase talents, and contribute meaningfully to the technology ecosystem and society.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section (Clean White) */}
      <section className="py-16 sm:py-24 bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
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
      <section className="py-16 sm:py-24 bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
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

      {/* ── Testimonials Section ── */}
      <section className="py-16 sm:py-24 bg-slate-50/50 border-t border-slate-200/60">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <SectionHeading title="Alumni Spotlight" subtitle="Success Stories" />
          
          <div 
            data-aos="fade-up"
            className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-300 grid grid-cols-1 lg:grid-cols-12 items-stretch"
          >
            {/* Left Column: Image */}
            <div className="lg:col-span-5 relative min-h-[350px] lg:min-h-[480px] bg-slate-100 group overflow-hidden">
              <Image
                src="/gallery/manas_khanna.jpg"
                alt="Manas Khanna"
                fill
                priority
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            {/* Right Column: Long Testimonial Text */}
            <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-between relative">
              {/* Decorative Quote Icon */}
              <div className="absolute top-6 right-8 text-slate-100 pointer-events-none select-none">
                <Quote size={80} strokeWidth={1} className="opacity-40 text-slate-200" />
              </div>

              <div className="relative z-10 space-y-6">
                <blockquote className="space-y-4">
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                    &ldquo;My journey with Labyrinth, and specifically leading Igniculus, has been one of the most transformative phases of my student life at Christ University. When we first envisioned our initiatives, we weren't just thinking about building apps or organizing one-off events; we were striving to establish a culture of relentless curiosity, collaboration, and practical excellence.&rdquo;
                  </p>
                  
                  {/* Expanded paragraphs: on mobile, conditionally show based on testimonialExpanded. On desktop (lg+), always show. */}
                  <div className={`${testimonialExpanded ? 'block' : 'hidden lg:block'} space-y-4 transition-all duration-300`}>
                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                      &ldquo;As the Head of Igniculus, I had the privilege of working alongside some of the most passionate and brilliant minds. Together, we designed bootcamps, structured peer-led learning groups, and launched projects that bridged the gap between academic theory and real-world industrial demands. The club served as an incubator not only for technical solutions, but also for leaders, innovators, and thinkers.&rdquo;
                    </p>
                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                      &ldquo;Labyrinth taught me that true learning happens when you step out of your comfort zone. Managing large teams, coordinating with faculty, and pushing the boundaries of what a student-run club could achieve gave me hands-on lessons in leadership and empathy that no classroom could replicate. I am incredibly proud of how the club continues to inspire the next generation of computer scientists to innovate, lead, and create a lasting impact.&rdquo;
                    </p>
                  </div>

                  {/* Read More button: only visible below lg breakpoint */}
                  <button
                    onClick={() => setTestimonialExpanded(!testimonialExpanded)}
                    className="lg:hidden text-[10px] font-extrabold text-[#CD0000] hover:text-[#9E0000] transition-colors uppercase tracking-widest flex items-center gap-1 focus:outline-hidden"
                  >
                    {testimonialExpanded ? 'Read Less' : 'Read More'}
                  </button>
                </blockquote>
              </div>

              {/* Bottom Metadata & Socials */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">Manas Khanna</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Former Head of Igniculus</p>
                </div>
                
                {/* Social media icons */}
                <div className="flex items-center gap-3">
                  <a
                    href="https://www.linkedin.com/in/manas-khanna-720035195"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-600 hover:bg-[#CD0000] hover:border-transparent hover:text-white transition-all shadow-xs hover:scale-105"
                    aria-label="LinkedIn Profile"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-[22px] sm:h-[22px]">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                      <rect x="2" y="9" width="4" height="12"/>
                      <circle cx="4" cy="4" r="2"/>
                    </svg>
                  </a>
                  <a
                    href="https://www.instagram.com/_m_khanna?igsi=MW5hZWZsb2g3NDUzdw=="
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-600 hover:bg-[#CD0000] hover:border-transparent hover:text-white transition-all shadow-xs hover:scale-105"
                    aria-label="Instagram Profile"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-[22px] sm:h-[22px]">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-16 sm:py-24 bg-slate-50/50">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
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
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 px-6 py-10 sm:px-10 sm:py-14 md:px-16">
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
