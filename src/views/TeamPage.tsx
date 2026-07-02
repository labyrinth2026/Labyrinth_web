import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from '../components/layout/PageWrapper';
import SectionHeading from '../components/ui/SectionHeading';
import TeamCard from '../components/ui/TeamCard';
import FacultyCard from '../components/ui/FacultyCard';
import SearchFilter from '../components/ui/SearchFilter';
import { GraduationCap, Users, BookOpen } from 'lucide-react';

import { fetchFromSheet } from '../services/api';

const TeamPage: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [teamData, setTeamData] = useState<{
    facultyCoordinators: any[];
    mentors: any[];
    coreCommittee: any[];
    verticalHeads: any[];
    subHeads: any[];
  }>({
    facultyCoordinators: [],
    mentors: [],
    coreCommittee: [],
    verticalHeads: [],
    subHeads: []
  });
  const [verticalsData, setVerticalsData] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const teamResult: any = await fetchFromSheet('getTeam');
        if (teamResult && !Array.isArray(teamResult)) {
          setTeamData({
            facultyCoordinators: teamResult.facultyCoordinators || [],
            mentors: teamResult.mentors || [],
            coreCommittee: teamResult.coreCommittee || [],
            verticalHeads: teamResult.verticalHeads || [],
            subHeads: teamResult.subHeads || []
          });
        }
        
        const verticalsResult: any = await fetchFromSheet('getVerticals');
        if (Array.isArray(verticalsResult)) {
          setVerticalsData(verticalsResult);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, []);

  const filterMembers = (members: any[] = []) => {
    return members.filter(m => {
      const searchStr = `${m.name} ${m.role || ''} ${m.vertical || ''} ${m.designation || ''} ${m.department || ''}`.toLowerCase();
      return searchStr.includes(search.toLowerCase());
    });
  };

  const faculty = filterMembers(teamData.facultyCoordinators);
  const mentors = filterMembers(teamData.mentors);
  const core = filterMembers(teamData.coreCommittee);
  const heads = filterMembers(teamData.verticalHeads);
  const subHeads = filterMembers(teamData.subHeads);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 16 },
    show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.35 } }
  };

  const hasResults = faculty.length > 0 || mentors.length > 0 || core.length > 0 || heads.length > 0 || subHeads.length > 0;

  const techVerticals = verticalsData.filter(v => v.category === 'tech');
  const nonTechVerticals = verticalsData.filter(v => v.category === 'non-tech');

  const renderVerticalSection = (verticalsList: any[]) => {
    return verticalsList.map(vertical => {
      const vHeads = heads.filter(h => h.vertical === vertical.name);
      const vSubHeads = subHeads.filter(sh => sh.vertical === vertical.name);
      
      if (vHeads.length === 0 && vSubHeads.length === 0) return null;

      return (
        <div key={vertical.id} className="mb-16">
          <h4 className="text-xl font-black text-[#EFEDE6] mb-6 border-b border-[#B8B8B8]/10 pb-2">{vertical.name}</h4>
          
          {vHeads.length > 0 && (
            <div className="mb-6">
              <h5 className="text-xs font-bold text-[#CD0000] mb-4 uppercase tracking-widest">Vertical Heads</h5>
              <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {vHeads.map(member => (
                  <motion.div key={member.id} variants={itemVariants}>
                    <TeamCard member={member} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}

          {vSubHeads.length > 0 && (
            <div>
              <h5 className="text-xs font-bold text-[#B8B8B8] mb-4 uppercase tracking-widest">Sub-Heads</h5>
              <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {vSubHeads.map(member => (
                  <motion.div key={member.id} variants={itemVariants}>
                    <TeamCard member={member} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <PageWrapper>
      {/* Header (Section 1: Off-White) */}
      <section className="py-24 bg-white border-b border-slate-100">
        <div className="container mx-auto px-6 max-w-7xl text-center">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest mb-6">
              People
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-slate-900 tracking-tight leading-tight">
              OUR <span className="text-[#CD0000]">TEAM</span>
            </h1>
            <p className="text-slate-500 text-xs md:text-sm max-w-2xl mx-auto mb-10 leading-relaxed">
              Meet the faculty coordinators, mentors, and passionate student leaders driving Labyrinth forward.
            </p>

            <div className="max-w-3xl mx-auto">
              <SearchFilter
                searchValue={search}
                onSearchChange={setSearch}
                activeFilter={filter}
                onFilterChange={setFilter}
                placeholder="Search by name, role, or vertical..."
                filters={[
                  { label: 'Everyone', value: 'all' },
                  { label: 'Faculty', value: 'faculty' },
                  { label: 'Mentors', value: 'mentors' },
                  { label: 'Core', value: 'core' },
                  { label: 'Verticals', value: 'verticals' }
                ]}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content (Section 2: Off-White) */}
      <section className="py-24 bg-slate-50/50">
        <div className="container mx-auto px-6 max-w-7xl">
          <AnimatePresence mode="wait">
            {hasResults ? (
              <>
                {/* ── FACULTY COORDINATORS ── */}
                {(filter === 'all' || filter === 'faculty') && faculty.length > 0 && (
                  <motion.div key="faculty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-20">
                    <div className="bg-slate-900 border border-slate-950 rounded-2xl px-6 py-5 mb-8 flex items-center gap-4 shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                        <GraduationCap size={22} className="text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white tracking-tight">Faculty Coordinators</h2>
                        <p className="text-slate-400 text-xs font-medium">Christ University Department of Computer Science</p>
                      </div>
                    </div>
                    <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-50px' }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {faculty.map(member => (
                        <motion.div key={member.id} variants={itemVariants}>
                          <FacultyCard faculty={member} />
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                )}

                {/* ── MENTORS ── */}
                {(filter === 'all' || filter === 'mentors') && mentors.length > 0 && (
                  <motion.div key="mentors" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-20">
                    <SectionHeading title="Mentors" subtitle="Guidance" align="left" />
                    <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-50px' }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {mentors.map(member => (
                        <motion.div key={member.id} variants={itemVariants}>
                          <TeamCard member={member} />
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                )}

                {/* ── CORE COMMITTEE ── */}
                {(filter === 'all' || filter === 'core') && core.length > 0 && (
                  <motion.div key="core" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-20">
                    <SectionHeading title="Core Committee" subtitle="Leadership" align="left" />
                    <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-50px' }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {core.map(member => (
                        <motion.div key={member.id} variants={itemVariants}>
                          <TeamCard member={member} />
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                )}

                {/* ── VERTICALS ── */}
                {(filter === 'all' || filter === 'verticals') && (heads.length > 0 || subHeads.length > 0) && (
                  <motion.div key="verticals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <SectionHeading title="Technical Verticals" subtitle="Domain Teams" align="left" />
                    <div className="mb-20">
                      {renderVerticalSection(techVerticals)}
                    </div>
                    
                    <SectionHeading title="Non-Technical Verticals" subtitle="Domain Teams" align="left" />
                    <div className="mb-20">
                      {renderVerticalSection(nonTechVerticals)}
                    </div>
                  </motion.div>
                )}
              </>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                <div className="text-slate-500 mb-4 text-xs font-bold uppercase tracking-wider">No team members found matching "{search}".</div>
                <button onClick={() => { setSearch(''); setFilter('all'); }} className="text-[#CD0000] font-bold hover:underline uppercase tracking-wider text-[10px]">
                  Clear search
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </PageWrapper>
  );
};

export default TeamPage;
