"use client";

import React from 'react';
import ScrollStack, { ScrollStackItem } from './ScrollStack';
import { Layers, BookOpen, Cpu, Users, Shield } from 'lucide-react';

export interface VerticalItemData {
  id: string;
  name: string;
  subtitle?: string;
  category: 'Technical' | 'Non-Technical' | 'Research' | 'Overview';
  description: string[];
  solidBgClass: string;
  badgeClass: string;
  borderColorClass: string;
}

export const VERTICALS_STACK_DATA: VerticalItemData[] = [
  {
    id: 'overview',
    name: 'COMMUNITY MEMBERS',
    subtitle: 'LABYRINTH 2026-27',
    category: 'Overview',
    description: [
      'Labyrinth was created with the purpose of providing students a platform to showcase their talents, develop leadership skills, collaborate with peers, and explore diverse domains within Computer Science and engineering.',
      'Every semester, Labyrinth organizes a wide range of technical and non-technical events, including coding competitions, debugging challenges, logical puzzle contests, web development and design competitions, gaming tournaments, debates, sports activities, entrepreneurship initiatives, and interdisciplinary collaborations.'
    ],
    solidBgClass: 'bg-[#18181B]',
    badgeClass: 'bg-[#CD0000] text-white border-transparent',
    borderColorClass: 'border-[#CD0000]/60'
  },
  {
    id: 'ai-hub',
    name: 'AI HUB',
    subtitle: 'Artificial Intelligence',
    category: 'Technical',
    description: [
      'The Artificial Intelligence Vertical focuses on understanding and applying AI and Machine Learning concepts to solve real-world challenges. Members will explore AI tools, build intelligent applications, and gain exposure to emerging technologies shaping the future.',
      'Through workshops, hands-on projects, and discussions on ethical AI, students will develop both technical knowledge and an understanding of responsible innovation.'
    ],
    solidBgClass: 'bg-[#1E1B4B]',
    badgeClass: 'bg-indigo-600 text-white border-transparent',
    borderColorClass: 'border-indigo-400/40'
  },
  {
    id: 'devzen',
    name: 'DevZen',
    subtitle: 'Development',
    category: 'Technical',
    description: [
      'The Development Vertical focuses on building innovative software solutions, websites, mobile applications, and technical projects that solve real-world problems. Members will collaborate on coding projects, participate in hackathons, and explore modern technologies through practical implementation.',
      'This vertical provides opportunities to strengthen programming skills, contribute to club initiatives, and gain hands-on experience in software development while working as a team.'
    ],
    solidBgClass: 'bg-[#064E3B]',
    badgeClass: 'bg-emerald-600 text-white border-transparent',
    borderColorClass: 'border-emerald-400/40'
  },
  {
    id: 'autobot',
    name: 'AutoBot',
    subtitle: 'Robotics & IoT',
    category: 'Technical',
    description: [
      'The Robotics & IoT Vertical explores the exciting world of automation, robotics, embedded systems, and smart technologies. Members will participate in hands-on workshops, hardware-based projects, and competitions that combine both software and electronics.',
      'Whether you\'re a beginner or experienced, this vertical encourages innovation, experimentation, and building real-world solutions using modern technologies.'
    ],
    solidBgClass: 'bg-[#451A03]',
    badgeClass: 'bg-amber-600 text-white border-transparent',
    borderColorClass: 'border-amber-400/40'
  },
  {
    id: 'insightx',
    name: 'InsightX',
    subtitle: 'Data Analytics',
    category: 'Technical',
    description: [
      'The Data Analytics Vertical introduces members to the process of collecting, analyzing, and visualizing data to make informed decisions. Students will learn tools such as Excel, SQL, Python, Power BI, and Tableau through practical workshops and real-world datasets.',
      'Members will also participate in analytics challenges, case studies, and collaborative projects that develop problem-solving and analytical thinking skills.'
    ],
    solidBgClass: 'bg-[#1E3A8A]',
    badgeClass: 'bg-blue-600 text-white border-transparent',
    borderColorClass: 'border-blue-400/40'
  },
  {
    id: 'fieldops',
    name: 'FieldOps',
    subtitle: 'Sports',
    category: 'Non-Technical',
    description: [
      'The FieldOps Vertical is dedicated to promoting teamwork, leadership, and an active campus culture through engaging indoor and outdoor games, sports events, and recreational activities. Members will plan, organize, and manage tournaments, fun competitions, fitness challenges, and interactive sporting events for students.',
      'This vertical aims to encourage sportsmanship, collaboration, and student participation while creating enjoyable experiences that strengthen the Labyrinth community beyond technology. Whether it\'s a casual game or a large-scale tournament, FieldOps ensures every event is well-organized, energetic, and memorable.'
    ],
    solidBgClass: 'bg-[#881337]',
    badgeClass: 'bg-rose-600 text-white border-transparent',
    borderColorClass: 'border-rose-400/40'
  },
  {
    id: 'debate',
    name: 'Debate',
    subtitle: 'Public Speaking & Critical Thinking',
    category: 'Non-Technical',
    description: [
      'The Debate Vertical provides a platform for students to develop confidence, public speaking, logical reasoning, and critical thinking. Members will participate in debates, panel discussions, mock sessions, and conversations on current affairs, technology, and innovation.',
      'The vertical encourages respectful discussions, diverse perspectives, and effective communication while helping members become confident speakers and leaders.'
    ],
    solidBgClass: 'bg-[#581C87]',
    badgeClass: 'bg-purple-600 text-white border-transparent',
    borderColorClass: 'border-purple-400/40'
  },
  {
    id: 'startovate',
    name: 'Startovate',
    subtitle: 'Entrepreneurship',
    category: 'Non-Technical',
    description: [
      'The Entrepreneurship Vertical nurtures creativity, innovation, and leadership by encouraging students to transform ideas into impactful solutions. Members will participate in startup ideation sessions, founder interactions, business case competitions, and innovation challenges.',
      'The vertical aims to develop an entrepreneurial mindset while helping students understand business strategy, problem-solving, teamwork, and effective decision-making.'
    ],
    solidBgClass: 'bg-[#78350F]',
    badgeClass: 'bg-amber-700 text-white border-transparent',
    borderColorClass: 'border-amber-500/40'
  },
  {
    id: 'interverse',
    name: 'InterVerse',
    subtitle: 'Collaboration',
    category: 'Non-Technical',
    description: [
      'The Collaboration Vertical serves as the bridge between Labyrinth and the wider community by building meaningful partnerships with student clubs, universities, industry professionals, and organizations. Members will coordinate collaborative events, networking opportunities, and knowledge-sharing initiatives.',
      'This vertical helps students develop communication, relationship-building, and organizational skills while expanding the reach and impact of the club.'
    ],
    solidBgClass: 'bg-[#0C4A6E]',
    badgeClass: 'bg-sky-600 text-white border-transparent',
    borderColorClass: 'border-sky-400/40'
  },
  {
    id: 'p2p',
    name: 'Peer-to-Peer',
    subtitle: 'Peer Learning',
    category: 'Non-Technical',
    description: [
      'The Peer Learning Vertical focuses on creating a collaborative learning environment where students learn from and teach one another. Members will organize peer-led workshops, technical sessions, coding tutorials, project demonstrations, and skill-sharing activities across various domains.',
      'This vertical promotes continuous learning, effective communication, and teamwork by providing students with opportunities to share knowledge, strengthen their technical skills, and help others grow within the Labyrinth community.'
    ],
    solidBgClass: 'bg-[#004D40]',
    badgeClass: 'bg-teal-600 text-white border-transparent',
    borderColorClass: 'border-teal-400/40'
  },
  {
    id: 'research',
    name: 'Research',
    subtitle: 'Academic & Technological Research',
    category: 'Research',
    description: [
      'The Research Vertical encourages members to explore emerging technologies, innovative ideas, and current trends in the field of Computer Science. Members will engage in research discussions, paper reviews, faculty-guided sessions, and project exploration to develop a deeper understanding of various technical domains.',
      'This vertical aims to foster curiosity, critical thinking, and innovation by encouraging students to contribute to research projects, explore new technologies, and build solutions that have a meaningful impact.'
    ],
    solidBgClass: 'bg-[#4C0519]',
    badgeClass: 'bg-red-700 text-white border-transparent',
    borderColorClass: 'border-red-500/40'
  }
];

interface VerticalsScrollStackShowcaseProps {
  useWindowScroll?: boolean;
  className?: string;
}

export const VerticalsScrollStackShowcase: React.FC<VerticalsScrollStackShowcaseProps> = ({
  useWindowScroll = true,
  className = ''
}) => {
  return (
    <div className={`w-full relative ${className}`}>
      <ScrollStack
        useWindowScroll={useWindowScroll}
        itemDistance={80}
        itemScale={0.025}
        itemStackDistance={24}
        stackPosition="12%"
        scaleEndPosition="6%"
        baseScale={0.88}
        blurAmount={0}
      >
        {VERTICALS_STACK_DATA.map((item) => (
          <ScrollStackItem
            key={item.id}
            itemClassName={`${item.solidBgClass} text-white border ${item.borderColorClass} shadow-2xl transition-all duration-300`}
          >
            <div className="flex flex-col h-full justify-between space-y-6">
              {/* Header row */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase leading-tight">
                    {item.name}
                  </h2>
                  {item.subtitle && (
                    <p className="text-xs sm:text-sm font-bold text-slate-300 tracking-wide mt-1 uppercase">
                      {item.subtitle}
                    </p>
                  )}
                </div>

                <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-[10px] sm:text-xs font-black uppercase tracking-wider ${item.badgeClass} shadow-sm shrink-0`}>
                  {item.category === 'Technical' && <Cpu size={13} />}
                  {item.category === 'Non-Technical' && <Users size={13} />}
                  {item.category === 'Research' && <BookOpen size={13} />}
                  {item.category === 'Overview' && <Shield size={13} />}
                  {item.category}
                </span>
              </div>

              {/* Body Content */}
              <div className="space-y-4 flex-1">
                {item.description.map((paragraph, idx) => (
                  <p
                    key={idx}
                    className="text-slate-100 text-xs sm:text-sm md:text-base leading-relaxed font-normal"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Footer indicator */}
              <div className="pt-4 border-t border-white/15 flex items-center justify-between text-[11px] text-slate-300 font-semibold">
                <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                  <Layers size={13} className="text-slate-300" />
                  Labyrinth 2026-27 Domain
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-300">
                  {item.category}
                </span>
              </div>
            </div>
          </ScrollStackItem>
        ))}
      </ScrollStack>
    </div>
  );
};

export default VerticalsScrollStackShowcase;
