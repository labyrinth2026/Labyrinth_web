import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from '../components/layout/PageWrapper';
import SectionHeading from '../components/ui/SectionHeading';
import VerticalCard from '../components/ui/VerticalCard';
import SearchFilter from '../components/ui/SearchFilter';

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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#005BAC] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* Header */}
      <section className="py-16 bg-gradient-to-br from-[#EAF4FF] to-white">
        <div className="container mx-auto px-6 max-w-7xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-block px-4 py-1 rounded-full bg-[#EAF4FF] border border-[#D6EBFF] text-[#005BAC] text-xs font-bold uppercase tracking-widest mb-4">
              Our Domains
            </span>
            <h1 className="font-grotesk text-5xl md:text-6xl font-bold mb-5 text-[#1a2c4a]">
              Our <span className="text-[#005BAC]">Verticals</span>
            </h1>
            <p className="text-lg text-[#4b6080] max-w-2xl mx-auto mb-10">
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
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <AnimatePresence mode="wait">
            {/* Tech Verticals */}
            {(filter === 'all' || filter === 'tech') && filteredTech.length > 0 && (
              <motion.div id="technical-verticals" key="tech" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-16 scroll-mt-24">
                <SectionHeading title="Technical Domains" align="left" />
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: '-80px' }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {filteredTech.map(vertical => (
                    <motion.div key={vertical.id} variants={itemVariants}>
                      <VerticalCard vertical={vertical as any} />
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* Non-Tech Verticals */}
            {(filter === 'all' || filter === 'non-tech') && filteredNonTech.length > 0 && (
              <motion.div id="non-technical-verticals" key="non-tech" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="scroll-mt-24">
                <SectionHeading title="Management & Creative" align="left" />
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: '-80px' }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {filteredNonTech.map(vertical => (
                    <motion.div key={vertical.id} variants={itemVariants}>
                      <VerticalCard vertical={vertical as any} />
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {filteredTech.length === 0 && filteredNonTech.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                <div className="text-[#7a90aa] mb-4 text-lg">No verticals found matching your search.</div>
                <button
                  onClick={() => { setSearch(''); setFilter('all'); }}
                  className="text-[#005BAC] font-semibold hover:underline"
                >
                  Clear filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </PageWrapper>
  );
};

export default VerticalsPage;
