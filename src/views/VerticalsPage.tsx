import React, { useState } from 'react';

import PageWrapper from '../components/layout/PageWrapper';
import SectionHeading from '../components/ui/SectionHeading';
import VerticalCard from '../components/ui/VerticalCard';
import SearchFilter from '../components/ui/SearchFilter';
import ScrollReveal from '../components/ui/ScrollReveal';

import { fetchFromSheet } from '../services/api';

const VerticalsPage: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [verticalsData, setVerticalsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const data: any = await fetchFromSheet('getVerticals');
        if (Array.isArray(data)) setVerticalsData(data);
      } catch (e) {
        console.error(e);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  const techVerticals = verticalsData.filter(v => v.category === 'tech');
  const nonTechVerticals = verticalsData.filter(v => v.category === 'non-tech');

  const filterVerticals = (verticals: any[]) => {
    return verticals.filter(v => {
      const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.description.toLowerCase().includes(search.toLowerCase());
      if (filter === 'all') return matchesSearch;
      return matchesSearch && v.category === filter;
    });
  };

  const filteredTech = filterVerticals(techVerticals);
  const filteredNonTech = filterVerticals(nonTechVerticals);

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="min-h-[60vh] flex items-center justify-center bg-[#FAFAFA]">
          <div className="w-8 h-8 border-2 border-[#CD0000] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* Header (Section 1: Off-White) */}
      <section className="pt-24 pb-8 bg-white border-b border-slate-100">
        <div className="container mx-auto px-6 max-w-7xl text-center">
          <ScrollReveal animation="fade">
            <span className="inline-block px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest mb-6">
              Our Domains
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-slate-900 tracking-tight leading-tight">
              OUR <span className="text-[#CD0000]">VERTICALS</span>
            </h1>
            <p className="text-slate-500 text-xs md:text-sm max-w-2xl mx-auto mb-10 leading-relaxed">
              Ten specialized domains. Endless possibilities. Find your niche and start building.
            </p>

            <div className="max-w-2xl mx-auto">
              <SearchFilter
                searchValue={search}
                onSearchChange={setSearch}
                activeFilter={filter}
                onFilterChange={setFilter}
                placeholder="Search verticals..."
                filters={[
                  { label: 'All Domains', value: 'all' },
                  { label: 'Technical', value: 'tech' },
                  { label: 'Non-Technical', value: 'non-tech' }
                ]}
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Content (Section 2: Off-White) */}
      <section className="pt-8 pb-24 bg-slate-50/50">
        <div className="container mx-auto px-6 max-w-7xl">

            {/* Tech Verticals */}
            {(filter === 'all' || filter === 'tech') && filteredTech.length > 0 && (
              <div id="technical-verticals" className="mb-20 scroll-mt-24">
                <SectionHeading title="Technical Domains" align="left" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <ScrollReveal key={`${filter}-tech`} stagger={0.08}>
                    {filteredTech.map(vertical => (
                      <VerticalCard key={vertical.id} vertical={vertical as any} />
                    ))}
                  </ScrollReveal>
                </div>
              </div>
            )}

            {/* Non-Tech Verticals */}
            {(filter === 'all' || filter === 'non-tech') && filteredNonTech.length > 0 && (
              <div id="non-technical-verticals" className="scroll-mt-24">
                <SectionHeading title="Management &amp; Creative" align="left" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <ScrollReveal key={`${filter}-nontech`} stagger={0.08}>
                    {filteredNonTech.map(vertical => (
                      <VerticalCard key={vertical.id} vertical={vertical as any} />
                    ))}
                  </ScrollReveal>
                </div>
              </div>
            )}

            {filteredTech.length === 0 && filteredNonTech.length === 0 && (
              <div className="text-center py-20">
                <div className="text-slate-500 mb-4 text-xs font-bold uppercase tracking-wider">No verticals found matching your search.</div>
                <button
                  onClick={() => { setSearch(''); setFilter('all'); }}
                  className="text-[#CD0000] font-bold hover:underline uppercase tracking-wider text-[10px]"
                >
                  Clear filters
                </button>
              </div>
            )}

        </div>
      </section>
    </PageWrapper>
  );
};

export default VerticalsPage;
