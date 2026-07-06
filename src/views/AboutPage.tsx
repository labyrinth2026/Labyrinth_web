import React from 'react';
import Image from 'next/image';
import { Target, Lightbulb, Users, BookOpen, Briefcase, Zap } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import SectionHeading from '../components/ui/SectionHeading';
import ScrollReveal from '../components/ui/ScrollReveal';
import HomeVideoPlayer from '../components/ui/HomeVideoPlayer';

const AboutPage: React.FC = () => {

  const features = [
    { icon: BookOpen, title: 'Hands-on Learning', desc: 'Move beyond theory with practical workshops and projects.' },
    { icon: Briefcase, title: 'Industry Connections', desc: 'Network with professionals from top tech companies.' },
    { icon: Users, title: 'Peer Community', desc: 'Find co-founders, mentors, and lifelong friends.' },
    { icon: Zap, title: 'Career Growth', desc: 'Build a portfolio that makes your resume stand out.' }
  ];



  return (
    <PageWrapper>
      {/* Hero Banner: Text left, Image right */}
      <section className="relative py-24 bg-white overflow-hidden border-b border-slate-100">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Text – left */}
            <ScrollReveal animation="slide-right">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest mb-6">
                  About Us
                </span>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-slate-900 tracking-tight leading-tight">
                  ABOUT <span className="text-[#CD0000]">LABYRINTH</span>
                </h1>
                <p className="text-sm md:text-base text-slate-500 leading-relaxed mb-4 font-medium">
                  The Computer Science Department's Computer Academy has been active since 1997. Labyrinth was established as the official face of this academy and serves as the only Computer Science Club of Christ University.
                </p>
                <p className="text-sm md:text-base text-slate-500 leading-relaxed mb-4">
                  Labyrinth was created with the purpose of providing students a platform to showcase their talents, develop leadership skills, collaborate with peers, and explore diverse domains within Computer Science and engineering.
                </p>
                <p className="text-sm md:text-base text-slate-500 leading-relaxed mb-8">
                  Every semester, Labyrinth organizes a wide range of technical and non-technical events, including coding competitions, debugging challenges, logical puzzle contests, web development and design competitions, gaming tournaments, debates, sports activities, entrepreneurship initiatives, and interdisciplinary collaborations.
                </p>
                <p className="font-bold text-[#CD0000] uppercase tracking-wider text-xs">
                  Labyrinth is for the students, by the students.
                </p>
              </div>
            </ScrollReveal>

            {/* Video – right */}
            <ScrollReveal animation="slide-left">
              <div className="relative rounded-3xl overflow-hidden shadow-xl" style={{aspectRatio: '4/3'}}>
                <HomeVideoPlayer
                  mp4="/gallery/panel_discussion.mp4"
                  webm="/gallery/panel_discussion.webm"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Mission & Vision (Section 2: Clean Off-White) */}
      <section className="py-24 bg-slate-50/50 border-b border-slate-200/60">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            <ScrollReveal stagger={0.15}>
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-8 h-full hover:scale-[1.015] hover:-translate-y-1 hover:shadow-md hover:shadow-[#CD0000]/[0.02] transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-[#CD0000]/5 border border-[#CD0000]/10 flex items-center justify-center text-[#CD0000] mb-6">
                  <Target size={22} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">Our Mission</h2>
                <p className="text-slate-500 text-xs leading-relaxed font-medium">
                  To create a vibrant student community that promotes innovation, technical excellence, creativity, leadership, collaboration, and holistic development among students.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-900 rounded-2xl shadow-sm p-8 h-full hover:scale-[1.015] hover:-translate-y-1 hover:shadow-md hover:shadow-white/[0.01] transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white mb-6">
                  <Lightbulb size={22} />
                </div>
                <h2 className="text-xl font-bold text-white mb-3 tracking-tight">Our Vision</h2>
                <p className="text-slate-300 text-xs leading-relaxed font-medium">
                  To become a platform where students discover opportunities, build skills, showcase talents, and contribute meaningfully to the technology ecosystem and society.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Full-width photo strip */}
      <section className="relative overflow-hidden" style={{height: '22rem'}}>
        <Image
          src="/gallery/peer_edu_all_1.webp"
          alt="Labyrinth peer education session with students engaged in learning"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-slate-950/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <ScrollReveal animation="fade">
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">Our Philosophy</p>
            <blockquote className="text-white text-2xl md:text-3xl font-extrabold max-w-3xl leading-tight tracking-tight">
              &ldquo;Building the next generation of <span className="text-[#CD0000]">innovators</span>, one event at a time.&rdquo;
            </blockquote>
          </ScrollReveal>
        </div>
      </section>

      {/* Why Labyrinth? (Section 3: Pure White) */}
      <section className="py-24 bg-white border-b border-slate-100">
        <div className="container mx-auto px-6 max-w-6xl">
          <SectionHeading title="Why LABYRINTH?" subtitle="Benefits" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ScrollReveal stagger={0.08}>
              {features.map((feature, i) => (
                <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-6 h-full text-center group hover:scale-[1.015] hover:-translate-y-1 hover:shadow-md hover:shadow-[#CD0000]/[0.02] transition-all duration-300">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-500 mb-6 group-hover:bg-[#CD0000] group-hover:text-white transition-all duration-300">
                    <feature.icon size={18} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 mb-2">{feature.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </ScrollReveal>
          </div>
        </div>
      </section>


    </PageWrapper>
  );
};

export default AboutPage;
