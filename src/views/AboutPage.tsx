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
    { icon: BookOpen, title: 'Hands-on Learning', desc: 'Move beyond theory with practical workshops and projects.' },
    { icon: Briefcase, title: 'Industry Connections', desc: 'Network with professionals from top tech companies.' },
    { icon: Users, title: 'Peer Community', desc: 'Find co-founders, mentors, and lifelong friends.' },
    { icon: Zap, title: 'Career Growth', desc: 'Build a portfolio that makes your resume stand out.' }
  ];

  const TimelineItem = ({ milestone, index }: { milestone: any; index: number }) => {
    const { ref, isVisible } = useScrollAnimation();
    const isEven = index % 2 === 0;

    return (
      <div ref={ref} className={`relative flex items-center justify-between md:justify-normal w-full mb-12 ${isEven ? 'md:flex-row-reverse' : ''}`}>
        {/* Center Dot */}
        <div className="hidden md:block absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#CD0000] border-4 border-[#121212] z-10 shadow-md" />

        {/* Content Card */}
        <div className="w-full md:w-5/12">
          <motion.div
            initial={{ opacity: 0, x: isEven ? 40 : -40 }}
            animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: isEven ? 40 : -40 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="bg-[#121212] border border-[#B8B8B8]/10 rounded-3xl shadow-sm p-6 relative">
              {/* Year Badge */}
              <span className="absolute -top-3 left-6 bg-[#CD0000] text-[#EFEDE6] px-4 py-0.5 rounded-full text-xs font-black uppercase tracking-wider shadow">
                {milestone.year}
              </span>
              <h3 className="text-lg font-black text-[#EFEDE6] mb-2 mt-2">{milestone.title}</h3>
              <p className="text-[#B8B8B8] text-sm leading-relaxed">{milestone.desc}</p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  };

  return (
    <PageWrapper>
      {/* Hero Banner (Section 1: Warm White #EFEDE6) */}
      <section className="relative py-24 bg-[#EFEDE6] overflow-hidden border-b border-[#B8B8B8]/20">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#CD0000]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="container mx-auto px-6 max-w-5xl text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#CD0000]/5 border border-[#CD0000]/20 text-[#CD0000] text-xs font-bold uppercase tracking-widest mb-6">
              About Us
            </span>
            <h1 className="font-grotesk text-5xl md:text-7xl font-black mb-8 text-[#121212] tracking-tighter leading-none">
              ABOUT <span className="text-[#CD0000]">LABYRINTH</span>
            </h1>
            <p className="text-lg text-[#121212]/80 max-w-3xl mx-auto leading-relaxed mb-6 font-medium">
              The Computer Science Department's Computer Academy has been active since 1997. Labyrinth was established as the official face of this academy and serves as the only Computer Science Club of Christ University.
            </p>
            <p className="text-lg text-[#121212]/80 max-w-3xl mx-auto leading-relaxed mb-6">
              Labyrinth was created with the purpose of providing students a platform to showcase their talents, develop leadership skills, collaborate with peers, and explore diverse domains within Computer Science and beyond.
            </p>
            <p className="text-lg text-[#121212]/80 max-w-3xl mx-auto leading-relaxed mb-6">
              Every semester, Labyrinth organizes a wide range of technical and non-technical events, including coding competitions, debugging challenges, logical puzzle contests, web development and design competitions, gaming tournaments, debates, sports activities, entrepreneurship initiatives, and interdisciplinary collaborations.
            </p>
            <p className="text-2xl font-black text-[#CD0000] max-w-3xl mx-auto leading-relaxed mt-10 tracking-tight">
              Labyrinth is for the students, by the students.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision (Section 2: Charcoal Black #121212) */}
      <section className="py-24 bg-[#121212] border-b border-[#B8B8B8]/10">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="bg-[#181818] border border-[#B8B8B8]/10 rounded-3xl shadow-sm p-10 h-full hover:shadow-xl hover:shadow-[#CD0000]/5 hover:border-[#CD0000]/30 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-[#CD0000]/10 border border-[#CD0000]/20 flex items-center justify-center text-[#CD0000] mb-6">
                  <Target size={28} />
                </div>
                <h2 className="text-3xl font-black text-[#EFEDE6] mb-4 font-grotesk tracking-tight">Our Mission</h2>
                <p className="text-[#B8B8B8] leading-relaxed">
                  To create a vibrant student community that promotes innovation, technical excellence, creativity, leadership, collaboration, and holistic development among students.
                </p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}>
              <div className="bg-[#CD0000] rounded-3xl shadow-lg p-10 h-full hover:shadow-[#CD0000]/15 hover:scale-[1.01] transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-[#EFEDE6]/20 flex items-center justify-center text-[#EFEDE6] mb-6">
                  <Lightbulb size={28} />
                </div>
                <h2 className="text-3xl font-black text-[#EFEDE6] mb-4 font-grotesk tracking-tight">Our Vision</h2>
                <p className="text-[#EFEDE6]/95 leading-relaxed font-semibold">
                  To become a platform where students discover opportunities, build skills, showcase talents, and contribute meaningfully to the technology ecosystem and society.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Labyrinth? (Section 3: Warm White Alternate #F4F2EC) */}
      <section className="py-24 bg-[#F4F2EC] border-b border-[#B8B8B8]/20">
        <div className="container mx-auto px-6 max-w-6xl">
          <SectionHeading title="Why LABYRINTH?" subtitle="Benefits" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <div className="bg-white border border-[#B8B8B8]/30 rounded-3xl shadow-sm p-6 h-full text-center group hover:shadow-xl hover:border-[#CD0000] hover:-translate-y-1.5 transition-all duration-300">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-[#EFEDE6] flex items-center justify-center text-[#CD0000] mb-6 group-hover:bg-[#CD0000] group-hover:text-white transition-all duration-300">
                    <feature.icon size={22} />
                  </div>
                  <h3 className="text-lg font-black text-[#121212] mb-3">{feature.title}</h3>
                  <p className="text-sm text-[#121212]/70 leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* History Timeline (Section 4: Charcoal Black Alternate #181818) */}
      <section className="py-24 bg-[#181818]">
        <div className="container mx-auto px-6 max-w-5xl">
          <SectionHeading title="Our Journey" subtitle="History" light={true} />

          <div className="relative mt-16">
            {/* Center Line */}
            <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#CD0000] to-[#B8B8B8]/10" />

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
