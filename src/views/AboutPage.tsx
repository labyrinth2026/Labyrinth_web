import React from 'react';
import { motion } from 'framer-motion';
import { Target, Lightbulb, Users, BookOpen, Briefcase, Zap } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import SectionHeading from '../components/ui/SectionHeading';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const AboutPage: React.FC = () => {
  const milestones = [
    { year: '2020', title: 'Club Founded', desc: 'Started with just 20 passionate computer science students.' },
    { year: '2021', title: 'First Hackathon', desc: 'Hosted HackMatrix 1.0 with over 200 participants.' },
    { year: '2022', title: '10 Verticals Created', desc: 'Expanded our scope to cover specialized domains like AI and GameDev.' },
    { year: '2023', title: '500+ Members', desc: 'Became the largest tech community in the university.' },
    { year: '2024', title: 'National Recognition', desc: 'Won "Best Tech Club" at the National College Summit.' }
  ];

  const features = [
    { icon: BookOpen, title: 'Hands-on Learning', desc: 'Move beyond theory with practical workshops and projects.', color: '#0B1F63' },
    { icon: Briefcase, title: 'Industry Connections', desc: 'Network with professionals from top tech companies.', color: '#163294' },
    { icon: Users, title: 'Peer Community', desc: 'Find co-founders, mentors, and lifelong friends.', color: '#0369a1' },
    { icon: Zap, title: 'Career Growth', desc: 'Build a portfolio that makes your resume stand out.', color: '#163294' }
  ];

  const TimelineItem = ({ milestone, index }: { milestone: any; index: number }) => {
    const { ref, isVisible } = useScrollAnimation();
    const isEven = index % 2 === 0;

    return (
      <div ref={ref} className={`relative flex items-center justify-between md:justify-normal w-full mb-10 ${isEven ? 'md:flex-row-reverse' : ''}`}>
        {/* Center Dot */}
        <div className="hidden md:block absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#0B1F63] border-4 border-white z-10 shadow-md" />

        {/* Content Card */}
        <div className="w-full md:w-5/12">
          <motion.div
            initial={{ opacity: 0, x: isEven ? 40 : -40 }}
            animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: isEven ? 40 : -40 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-6 relative">
              {/* Year Badge */}
              <span className="absolute -top-3 left-6 bg-[#0B1F63] text-white px-4 py-0.5 rounded-full text-sm font-bold shadow">
                {milestone.year}
              </span>
              <h3 className="text-lg font-bold text-[#0B1F63] mb-1 mt-2">{milestone.title}</h3>
              <p className="text-[#667085] text-sm leading-relaxed">{milestone.desc}</p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  };

  return (
    <PageWrapper>
      {/* Hero Banner */}
      <section className="relative py-20 bg-gradient-to-br from-[rgba(11,31,99,0.03)] to-white overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#0B1F63]/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="container mx-auto px-6 max-w-5xl text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-block px-4 py-1 rounded-full bg-[rgba(11,31,99,0.03)] border border-[rgba(11,31,99,0.07)] text-[#0B1F63] text-xs font-bold uppercase tracking-widest mb-4">
              About Us
            </span>
            <h1 className="font-grotesk text-5xl md:text-6xl font-bold mb-6 text-[#0B1F63]">
              About <span className="text-[#0B1F63]">LABYRINTH</span>
            </h1>
            <p className="text-lg text-[#667085] max-w-3xl mx-auto leading-relaxed mb-4">
              The Computer Science Department's Computer Academy has been active since 1997. Labyrinth was established as the official face of this academy and serves as the only Computer Science Club of Christ University.
            </p>
            <p className="text-lg text-[#667085] max-w-3xl mx-auto leading-relaxed mb-4">
              Labyrinth was created with the purpose of providing students a platform to showcase their talents, develop leadership skills, collaborate with peers, and explore diverse domains within Computer Science and beyond.
            </p>
            <p className="text-lg text-[#667085] max-w-3xl mx-auto leading-relaxed mb-4">
              Every semester, Labyrinth organizes a wide range of technical and non-technical events, including coding competitions, debugging challenges, logical puzzle contests, web development and design competitions, gaming tournaments, debates, sports activities, entrepreneurship initiatives, and interdisciplinary collaborations.
            </p>
            <p className="text-xl font-bold text-[#0B1F63] max-w-3xl mx-auto leading-relaxed mt-6">
              Labyrinth is for the students, by the students.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-10 h-full hover:shadow-lg hover:shadow-[#0B1F63]/10 transition-shadow">
                <div className="w-14 h-14 rounded-2xl bg-[rgba(11,31,99,0.03)] flex items-center justify-center text-[#0B1F63] mb-6">
                  <Target size={28} />
                </div>
                <h2 className="text-2xl font-bold text-[#0B1F63] mb-3 font-grotesk">Our Mission</h2>
                <p className="text-[#667085] leading-relaxed">
                  To create a vibrant student community that promotes innovation, technical excellence, creativity, leadership, collaboration, and holistic development among students.
                </p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}>
              <div className="bg-[#0B1F63] rounded-2xl shadow-md p-10 h-full">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white mb-6">
                  <Lightbulb size={28} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3 font-grotesk">Our Vision</h2>
                <p className="text-slate-200 leading-relaxed">
                  To become a platform where students discover opportunities, build skills, showcase talents, and contribute meaningfully to the technology ecosystem and society.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Labyrinth? */}
      <section className="py-20 bg-[rgba(11,31,99,0.03)]">
        <div className="container mx-auto px-6 max-w-6xl">
          <SectionHeading title="Why LABYRINTH?" subtitle="Benefits" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-6 h-full text-center group hover:shadow-lg hover:shadow-[#0B1F63]/10 hover:-translate-y-1 transition-all">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-[rgba(11,31,99,0.03)] flex items-center justify-center text-[#0B1F63] mb-4 group-hover:bg-[#0B1F63] group-hover:text-white transition-all">
                    <feature.icon size={22} />
                  </div>
                  <h3 className="text-base font-bold text-[#0B1F63] mb-2">{feature.title}</h3>
                  <p className="text-sm text-[#667085] leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* History Timeline */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-5xl">
          <SectionHeading title="Our Journey" subtitle="History" />

          <div className="relative mt-12">
            {/* Center Line */}
            <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#0B1F63] to-[rgba(11,31,99,0.07)]" />

            <div className="flex flex-col">
              {milestones.map((milestone, i) => (
                <TimelineItem key={i} milestone={milestone} index={i} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
};

export default AboutPage;
