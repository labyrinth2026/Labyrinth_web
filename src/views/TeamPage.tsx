import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from '../components/layout/PageWrapper';
import SectionHeading from '../components/ui/SectionHeading';
import TeamCard from '../components/ui/TeamCard';
import FacultyCard from '../components/ui/FacultyCard';
import SearchFilter from '../components/ui/SearchFilter';
import { GraduationCap, Code2 } from 'lucide-react';
import ScrollReveal from '../components/ui/ScrollReveal';

import { fetchFromSheet } from '../services/api';

// ─── Hardcoded Faculty (renders instantly — zero API calls) ─────────────────
const FACULTY_DATA = [
  {
    id: 'fc1',
    name: 'Dr. Amrutha K',
    role: 'Faculty Coordinator',
    designation: 'Assistant Professor',
    department: 'Department of Computer Science',
    email: 'amrutha.k@christuniversity.in',
    profileUrl: 'https://christuniversity.in/computer-science/faculty-details/NzE0Mg==/NjI=',
    linkedin: '#',
    avatar: '/amrutha.jpg',
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
    avatar: '/binayak.jpg',
  },
];

// ─── Hardcoded Website Designers & Developers (renders instantly) ───────────
const WEBSITE_DESIGNERS_DATA = [
  {
    id: 'web-dev-1',
    name: 'Suryachalam V M (3BScCM)',
    role: 'Website Designer & Developer',
    designation: 'System Design & Development',
    department: 'Department of Computer Science',
    email: 'suryachalam.vm@bsccmh.christuniversity.in',
    linkedin: '#',
    github: 'https://github.com/sgk18',
    avatar: 'https://github.com/sgk18.png',
  },
  {
    id: 'web-dev-2',
    name: 'Bhargav Shree Raj G (3BScCM)',
    role: 'Website Designer & Developer',
    designation: 'System Design & Development',
    department: 'Department of Computer Science',
    email: 'bhargav.g@bsccmh.christuniversity.in',
    linkedin: '#',
    avatar: 'https://paqpkdipiyvwdneeghin.supabase.co/storage/v1/object/public/gallery/avatars/u-bhargav-g-1784697037114.jpg',
  },
];

// ─── Skeleton Card ────────────────────────────────────────────────────────────
const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white border border-slate-200/60 rounded-2xl overflow-hidden animate-pulse ${className}`}>
    <div className="w-full h-36 bg-slate-100" />
    <div className="p-4 space-y-3">
      <div className="h-3.5 bg-slate-100 rounded-md w-3/4 mx-auto" />
      <div className="h-2.5 bg-slate-100 rounded-md w-1/2 mx-auto" />
      <div className="h-2.5 bg-slate-100 rounded-md w-2/5 mx-auto" />
    </div>
  </div>
);

// ─── Skeleton Row ─────────────────────────────────────────────────────────────
const SkeletonRow: React.FC<{ count?: number; label?: string }> = ({ count = 4, label = '' }) => (
  <motion.div
    key={label}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="mb-20"
  >
    {label && (
      <div className="h-6 w-48 bg-slate-100 rounded-lg mb-8 animate-pulse" />
    )}
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  </motion.div>
);

// ─── Lazy visible section wrapper ─────────────────────────────────────────────
const LazySection: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {visible ? children : <SkeletonRow count={4} />}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const TeamPage: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Progressive loading states
  const [core, setCore] = useState<any[]>([]);
  const [verticalHeads, setVerticalHeads] = useState<any[]>([]);
  const [subHeads, setSubHeads] = useState<any[]>([]);
  const [verticalsData, setVerticalsData] = useState<any[]>([]);

  // Loading stages: 'mentors-core' = first fetch, 'verticals' = second fetch
  const [loadedStages, setLoadedStages] = useState<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;

    const withTimeout = <T,>(promise: Promise<T>, ms: number, fallback: T): Promise<T> => {
      const timer = new Promise<T>(resolve => setTimeout(() => resolve(fallback), ms));
      return Promise.race([promise, timer]);
    };

    const loadPrimary = async () => {
      try {
        // 10-second timeout so skeleton always resolves even if Vercel is slow
        const result: any = await withTimeout(
          fetchFromSheet('getTeam').catch(() => null),
          10000,
          null
        );

        if (isMounted) {
          if (result && !Array.isArray(result)) {
            setCore(result.coreCommittee || []);
            setVerticalHeads(result.verticalHeads || []);
            setSubHeads(result.subHeads || []);
          }
          // Always mark primary as loaded so skeleton resolves
          setLoadedStages(prev => new Set([...prev, 'mentors-core']));
        }

        // Stage 2: Verticals metadata
        const vertsResult: any = await withTimeout(
          fetchFromSheet('getVerticals').catch(() => []),
          10000,
          []
        );
        if (isMounted) {
          if (Array.isArray(vertsResult)) setVerticalsData(vertsResult);
          setLoadedStages(prev => new Set([...prev, 'verticals']));
        }
      } catch (err) {
        console.error('TeamPage load error:', err);
        // Even on error, stop the skeleton
        if (isMounted) {
          setLoadedStages(prev => new Set([...prev, 'mentors-core', 'verticals']));
        }
      }
    };

    loadPrimary();
    return () => { isMounted = false; };
  }, []);

  // ── Filter + sort helpers ──────────────────────────────────────────────────
  const byName = (a: any, b: any) => (a.name || '').localeCompare(b.name || '');

  const filterMembers = (members: any[] = []) =>
    members
      .filter(m => {
        const s = `${m.name} ${m.role || ''} ${m.vertical || ''} ${m.designation || ''} ${m.department || ''}`.toLowerCase();
        return s.includes(search.toLowerCase());
      })
      .sort(byName);

  const filteredCore      = filterMembers(core);
  const filteredHeads     = filterMembers(verticalHeads);
  const filteredSubHeads  = filterMembers(subHeads);
  const filteredFaculty   = filterMembers(FACULTY_DATA.map(f => ({
    ...f, role: f.role, vertical: '', designation: f.designation, department: f.department
  })));
  const filteredDesigners = filterMembers(WEBSITE_DESIGNERS_DATA.map(d => ({
    ...d, role: d.role, vertical: '', designation: d.designation, department: d.department
  })));

  const isFacultyActive   = filter === 'all' || filter === 'faculty';
  const isWebActive       = filter === 'all' || filter === 'web' || filter === 'core';
  const isCoreActive      = filter === 'all' || filter === 'core';
  const isVerticalsActive = filter === 'all' || filter === 'verticals';

  const hasResults =
    (isFacultyActive && filteredFaculty.length > 0) ||
    (isWebActive && filteredDesigners.length > 0) ||
    (isCoreActive && filteredCore.length > 0) ||
    (isVerticalsActive && (filteredHeads.length > 0 || filteredSubHeads.length > 0));

  const primaryLoaded     = loadedStages.has('mentors-core');
  const verticalsLoaded   = loadedStages.has('verticals');

  const techVerticals     = verticalsData.filter(v => v.category === 'tech');
  const nonTechVerticals  = verticalsData.filter(v => v.category === 'non-tech');
  const researchVerticals = verticalsData.filter(v => v.category === 'research' || v.id === 'v-research-guidance' || v.name?.toLowerCase().includes('research'));

  const renderVerticalSection = (verticalsList: any[]) =>
    verticalsList.map(vertical => {
      const vHeads = filteredHeads.filter(h => {
        if (h.vertical !== vertical.name) return false;
        if (h.role === 'ADMIN') return false;
        const d = `${h.designation || ''} ${h.role || ''}`.toLowerCase();
        return !d.includes('core committee') && !d.includes('admin');
      });
      const vSubHeads = filteredSubHeads.filter(sh => sh.vertical === vertical.name);
      if (vHeads.length === 0 && vSubHeads.length === 0) return null;
      return (
        <div key={vertical.id} className="mb-16">
          <h4 className="text-xl font-black text-slate-800 mb-6 border-b border-[#B8B8B8]/10 pb-2">
            {vertical.name}
          </h4>
          {vHeads.length > 0 && (
            <div className="mb-6">
              <h5 className="text-xs font-bold text-[#CD0000] mb-4 uppercase tracking-widest">Vertical Heads &amp; Mentors</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <ScrollReveal key={`${filter}-${vertical.id}-heads`} stagger={0.06}>
                  {vHeads.map(member => {
                    const desigLower = (member.designation || '').toLowerCase();
                    const roleLower = (member.role || '').toLowerCase();
                    const isMentor = desigLower.includes('mentor') || roleLower.includes('mentor');
                    const displayMember = isMentor ? { ...member, role: member.designation || 'Mentor' } : member;
                    return <TeamCard key={displayMember.id} member={displayMember} />;
                  })}
                </ScrollReveal>
              </div>
            </div>
          )}
          {vSubHeads.length > 0 && (
            <div>
              <h5 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest">Sub-Heads</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <ScrollReveal key={`${filter}-${vertical.id}-subheads`} stagger={0.06}>
                  {vSubHeads.map(member => <TeamCard key={member.id} member={member} />)}
                </ScrollReveal>
              </div>
            </div>
          )}
        </div>
      );
    });

  return (
    <PageWrapper>
      {/* ── HEADER ───────────────────────────────────────────────────────────── */}
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
              Meet the faculty coordinators, mentors, website designers, and passionate student leaders driving Labyrinth forward.
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
                  { label: 'Faculty',  value: 'faculty' },
                  { label: 'Web Team', value: 'web' },
                  { label: 'Core',     value: 'core' },
                  { label: 'Verticals', value: 'verticals' },
                ]}
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── CONTENT ──────────────────────────────────────────────────────────── */}
      <section className="pt-8 pb-24 bg-slate-50/50">
        <div className="container mx-auto px-6 max-w-7xl">
          <AnimatePresence mode="wait">
            {!hasResults && primaryLoaded ? (
              /* No results state */
              <div key="no-results" className="text-center py-20">
                <div className="text-slate-500 mb-4 text-xs font-bold uppercase tracking-wider">
                  No team members found matching "{search}".
                </div>
                <button
                  onClick={() => { setSearch(''); setFilter('all'); }}
                  className="text-[#CD0000] font-bold hover:underline uppercase tracking-wider text-[10px]"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div key={filter + search}>

                {/* ── STAGE 0: Faculty Coordinators (instant – no API) ─────── */}
                {isFacultyActive && (
                  <motion.div
                    key="faculty"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-20"
                  >
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 mb-8 shadow-xs flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center shrink-0">
                          <GraduationCap size={20} className="text-[#CD0000]" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Faculty Coordinators</h2>
                          <p className="text-slate-500 text-xs font-semibold">Christ University Department of Computer Science</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-[#CD0000]/5 border border-[#CD0000]/15 text-[#CD0000] text-[10px] font-extrabold uppercase tracking-widest">
                        Department Leadership
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      <ScrollReveal stagger={0.08}>
                        {FACULTY_DATA.map(member => <FacultyCard key={member.id} faculty={member} />)}
                      </ScrollReveal>
                    </div>
                  </motion.div>
                )}

                {/* ── STAGE 0.5: Website Designers & Developers (instant – no API) ── */}
                {isWebActive && filteredDesigners.length > 0 && (
                  <motion.div
                    key="web-designers"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-20"
                  >
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 mb-8 shadow-xs flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center shrink-0">
                          <Code2 size={20} className="text-[#CD0000]" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Website Designers &amp; Developers</h2>
                          <p className="text-slate-500 text-xs font-semibold">System Design &amp; Full-Stack Platform Engineering</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-[#CD0000]/5 border border-[#CD0000]/15 text-[#CD0000] text-[10px] font-extrabold uppercase tracking-widest">
                        System Engineers
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <ScrollReveal stagger={0.08}>
                        {filteredDesigners.map(member => <TeamCard key={member.id} member={member} />)}
                      </ScrollReveal>
                    </div>
                  </motion.div>
                )}


                {/* ── STAGE 1: Core Committee (lazy on scroll) ─────────────── */}
                {isCoreActive && (
                  <LazySection key="core">
                    {primaryLoaded ? (
                      filteredCore.length > 0 ? (
                        <motion.div
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                          className="mb-20"
                        >
                          <SectionHeading title="Core Committee" subtitle="Leadership" align="left" />
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <ScrollReveal stagger={0.05}>
                              {filteredCore.map(member => <TeamCard key={member.id} member={member} />)}
                            </ScrollReveal>
                          </div>
                        </motion.div>
                      ) : null
                    ) : (
                      <SkeletonRow count={8} label="Core Committee" />
                    )}
                  </LazySection>
                )}

                {/* ── STAGE 2: Verticals (lazy — visible on scroll) ────────── */}
                {isVerticalsActive && (filteredHeads.length > 0 || !primaryLoaded) && (
                  <LazySection key="verticals">
                    {verticalsLoaded ? (
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        {techVerticals.length > 0 && (
                          <>
                            <SectionHeading title="Technical Verticals" subtitle="Domain Teams" align="left" />
                            <div className="mb-12">{renderVerticalSection(techVerticals)}</div>
                          </>
                        )}
                        {nonTechVerticals.length > 0 && (
                          <>
                            <SectionHeading title="Non-Technical Verticals" subtitle="Domain Teams" align="left" />
                            <div className="mb-12">{renderVerticalSection(nonTechVerticals)}</div>
                          </>
                        )}
                        {researchVerticals.length > 0 && (
                          <>
                            <SectionHeading title="Research Wing" subtitle="Research & Publications" align="left" />
                            <div className="mb-20">{renderVerticalSection(researchVerticals)}</div>
                          </>
                        )}
                      </motion.div>
                    ) : (
                      <SkeletonRow count={4} label="Verticals" />
                    )}
                  </LazySection>
                )}

              </div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </PageWrapper>
  );
};

export default TeamPage;
