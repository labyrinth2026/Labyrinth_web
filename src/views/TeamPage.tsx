import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import PageWrapper from '../components/layout/PageWrapper';
import SectionHeading from '../components/ui/SectionHeading';
import TeamCard from '../components/ui/TeamCard';
import FacultyCard from '../components/ui/FacultyCard';
import SearchFilter from '../components/ui/SearchFilter';
import { GraduationCap } from 'lucide-react';
import ScrollReveal from '../components/ui/ScrollReveal';

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

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const [teamResult, verticalsResult]: any[] = await Promise.all([
          fetchFromSheet('getTeam').catch(() => null),
          fetchFromSheet('getVerticals').catch(() => [])
        ]);

        if (isMounted) {
          if (teamResult && !Array.isArray(teamResult)) {
            setTeamData({
              facultyCoordinators: teamResult.facultyCoordinators || [],
              mentors: teamResult.mentors || [],
              coreCommittee: teamResult.coreCommittee || [],
              verticalHeads: teamResult.verticalHeads || [],
              subHeads: teamResult.subHeads || []
            });
          }
          if (Array.isArray(verticalsResult)) {
            setVerticalsData(verticalsResult);
          }
        }
      } catch (err) {
        console.error("TeamPage loadData error:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    loadData();
    return () => { isMounted = false; };
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

  const isFacultyActive = filter === 'all' || filter === 'faculty';
  const isMentorsActive = filter === 'all' || filter === 'mentors';
  const isCoreActive = filter === 'all' || filter === 'core';
  const isVerticalsActive = filter === 'all' || filter === 'verticals';

  const activeFaculty = isFacultyActive ? faculty : [];
  const activeMentors = isMentorsActive ? mentors : [];
  const activeCore = isCoreActive ? core : [];
  const activeHeads = isVerticalsActive ? heads : [];
  const activeSubHeads = isVerticalsActive ? subHeads : [];

  const hasResults = activeFaculty.length > 0 || activeMentors.length > 0 || activeCore.length > 0 || activeHeads.length > 0 || activeSubHeads.length > 0;

  const techVerticals = verticalsData.filter(v => v.category === 'tech');
  const nonTechVerticals = verticalsData.filter(v => v.category === 'non-tech');

  const renderVerticalSection = (verticalsList: any[]) => {
    return verticalsList.map(vertical => {
      const vHeads = heads.filter(h => h.vertical === vertical.name);
      const vSubHeads = subHeads.filter(sh => sh.vertical === vertical.name);
      
      if (vHeads.length === 0 && vSubHeads.length === 0) return null;

      return (
        <div key={vertical.id} className="mb-16">
          <h4 className="text-xl font-black text-slate-800 mb-6 border-b border-[#B8B8B8]/10 pb-2">{vertical.name}</h4>
          
          {vHeads.length > 0 && (
            <div className="mb-6">
              <h5 className="text-xs font-bold text-[#CD0000] mb-4 uppercase tracking-widest">Vertical Heads</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <ScrollReveal key={`${filter}-${vertical.id}-heads`} stagger={0.06}>
                  {vHeads.map(member => (
                    <TeamCard key={member.id} member={member} />
                  ))}
                </ScrollReveal>
              </div>
            </div>
          )}

          {vSubHeads.length > 0 && (
            <div>
              <h5 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest">Sub-Heads</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <ScrollReveal key={`${filter}-${vertical.id}-subheads`} stagger={0.06}>
                  {vSubHeads.map(member => (
                    <TeamCard key={member.id} member={member} />
                  ))}
                </ScrollReveal>
              </div>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <PageWrapper>
      {/* Header (Section 1: Off-White) */}
      <section className="pt-24 pb-8 bg-white border-b border-slate-100">
        <div className="container mx-auto px-6 max-w-7xl text-center">
          <ScrollReveal animation="fade">
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
          </ScrollReveal>
        </div>
      </section>

      {/* Content (Section 2: Off-White) */}
      <section className="pt-8 pb-24 bg-slate-50/50">
        <div className="container mx-auto px-6 max-w-7xl">
          <AnimatePresence mode="wait">
            {loading ? (
              <div key="loading-skeleton" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse py-8">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="bg-white border border-slate-200/60 rounded-2xl p-5 flex flex-col h-64 space-y-4">
                    <div className="w-full h-32 bg-slate-100 rounded-xl" />
                    <div className="h-4 bg-slate-100 rounded-md w-3/4 mx-auto" />
                    <div className="h-3 bg-slate-100 rounded-md w-1/2 mx-auto" />
                  </div>
                ))}
              </div>
            ) : hasResults ? (
              <div key={filter + search}>
                {/* ── FACULTY COORDINATORS ── */}
                {(filter === 'all' || filter === 'faculty') && (
                  <div className="mb-20">
                    <div className="bg-slate-900 border border-slate-950 rounded-2xl px-6 py-5 mb-8 flex items-center gap-4 shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                        <GraduationCap size={22} className="text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white tracking-tight">Faculty Coordinators</h2>
                        <p className="text-slate-400 text-xs font-medium">Christ University Department of Computer Science</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      <ScrollReveal stagger={0.06}>
                        {[
                          {
                            id: 'fc1',
                            name: 'Dr. Amrutha K',
                            role: 'Faculty Coordinator',
                            designation: 'Assistant Professor',
                            department: 'Department of Computer Science',
                            email: 'amrutha.k@christuniversity.in',
                            profileUrl: 'https://christuniversity.in/computer-science/faculty-details/NzE0Mg==/NjI=',
                            linkedin: '#',
                            avatar: null,
                          },
                          {
                            id: 'fc2',
                            name: 'Dr. Binayak Dutta',
                            role: 'Faculty Coordinator',
                            designation: 'Assistant Professor',
                            department: 'Department of Computer Science',
                            email: 'binayak.dutta@christuniversity.in',
                            profileUrl: 'https://christuniversity.in/computer-science/faculty-details/ODc2OQ==/NjI=',
                            linkedin: '#',
                            avatar: null,
                          },
                          {
                            id: 'fc3',
                            name: 'Dr. Syam Mohan E',
                            role: 'Faculty Coordinator',
                            designation: 'Assistant Professor',
                            department: 'Department of Computer Science',
                            email: 'syam.mohan@christuniversity.in',
                            profileUrl: 'https://christuniversity.in/computer-science/faculty-details/OTM1NA==/NjI=',
                            linkedin: '#',
                            avatar: null,
                          },
                        ].map(member => (
                          <FacultyCard key={member.id} faculty={member} />
                        ))}
                      </ScrollReveal>
                    </div>
                  </div>
                )}

                {/* ── MENTORS ── */}
                {(filter === 'all' || filter === 'mentors') && mentors.length > 0 && (
                  <div className="mb-20">
                    <SectionHeading title="Mentors" subtitle="Guidance" align="left" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <ScrollReveal key={`${filter}-mentors`} stagger={0.06}>
                        {mentors.map(member => (
                          <TeamCard key={member.id} member={member} />
                        ))}
                      </ScrollReveal>
                    </div>
                  </div>
                )}

                {/* ── CORE COMMITTEE ── */}
                {(filter === 'all' || filter === 'core') && core.length > 0 && (
                  <div className="mb-20">
                    <SectionHeading title="Core Committee" subtitle="Leadership" align="left" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <ScrollReveal key={`${filter}-core`} stagger={0.06}>
                        {core.map(member => (
                          <TeamCard key={member.id} member={member} />
                        ))}
                      </ScrollReveal>
                    </div>
                  </div>
                )}

                {/* ── VERTICALS ── */}
                {(filter === 'all' || filter === 'verticals') && (heads.length > 0 || subHeads.length > 0) && (
                  <div>
                    <SectionHeading title="Technical Verticals" subtitle="Domain Teams" align="left" />
                    <div className="mb-20">
                      {renderVerticalSection(techVerticals)}
                    </div>
                    
                    <SectionHeading title="Non-Technical Verticals" subtitle="Domain Teams" align="left" />
                    <div className="mb-20">
                      {renderVerticalSection(nonTechVerticals)}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div key="no-results" className="text-center py-20">
                <div className="text-slate-500 mb-4 text-xs font-bold uppercase tracking-wider">No team members found matching "{search}".</div>
                <button onClick={() => { setSearch(''); setFilter('all'); }} className="text-[#CD0000] font-bold hover:underline uppercase tracking-wider text-[10px]">
                  Clear search
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </PageWrapper>
  );
};

export default TeamPage;
