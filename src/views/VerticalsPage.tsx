import React, { useState } from 'react';
import Image from 'next/image';
import PageWrapper from '../components/layout/PageWrapper';
import SectionHeading from '../components/ui/SectionHeading';
import VerticalCard from '../components/ui/VerticalCard';
import ScrollReveal from '../components/ui/ScrollReveal';

import { fetchFromSheet } from '../services/api';

const VerticalsPage: React.FC = () => {
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
  const researchVerticals = verticalsData.filter(v => v.category === 'research' || v.id === 'v-research-guidance' || v.name?.toLowerCase().includes('research'));

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="min-h-[60vh] flex items-center justify-center bg-[#121212]">
          <div className="w-8 h-8 border-3 border-[#CD0000] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* Header with background image */}
      <section className="relative py-36 bg-white border-b border-slate-100 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/gallery/inauguration_all_51.webp"
            alt="Labyrinth inauguration audience"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-white/85" />
        </div>
        <div className="container mx-auto px-6 max-w-7xl text-center relative z-10">
          <ScrollReveal animation="fade">
            <span className="inline-block px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest mb-6">
              Our Domains
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-slate-900 tracking-tight leading-tight">
              OUR <span className="text-[#CD0000]">VERTICALS</span>
            </h1>
            <p className="text-slate-600 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed">
              Specialized domains spanning Tech, Non-Tech, and Research. Find your niche and start building.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Content (Section 2: Off-White) */}
      <section className="pt-8 pb-24 bg-slate-50/50">
        <div className="container mx-auto px-6 max-w-7xl">

            {techVerticals.length > 0 && (
              <div id="technical-verticals" className="mb-8 scroll-mt-24">
                <SectionHeading title="Technical Domains" align="left" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <ScrollReveal key="tech-list" stagger={0.08}>
                    {techVerticals.map(vertical => (
                      <VerticalCard key={vertical.id} vertical={vertical as any} />
                    ))}
                  </ScrollReveal>
                </div>
              </div>
            )}

            {/* Non-Tech Section Divider */}
            {techVerticals.length > 0 && nonTechVerticals.length > 0 && (
              <div className="flex items-center gap-4 my-12">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="px-4 py-1.5 rounded-full bg-[#CD0000] text-white text-[10px] font-bold uppercase tracking-widest">
                  Management & Creative
                </span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
            )}

            {/* Non-Tech Verticals */}
            {nonTechVerticals.length > 0 && (
              <div id="non-technical-verticals" className="mb-8 scroll-mt-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <ScrollReveal key="nontech-list" stagger={0.08}>
                    {nonTechVerticals.map(vertical => (
                      <VerticalCard key={vertical.id} vertical={vertical as any} />
                    ))}
                  </ScrollReveal>
                </div>
              </div>
            )}

            {/* Research Wing Divider */}
            {researchVerticals.length > 0 && (
              <>
                <div className="flex items-center gap-4 my-12">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="px-4 py-1.5 rounded-full bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-widest">
                    Research
                  </span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                <div id="research-verticals" className="scroll-mt-24">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ScrollReveal key="research-list" stagger={0.08}>
                      {researchVerticals.map(vertical => (
                        <VerticalCard key={vertical.id} vertical={vertical as any} />
                      ))}
                    </ScrollReveal>
                  </div>
                </div>
              </>
            )}

        </div>
      </section>
    </PageWrapper>
  );
};

export default VerticalsPage;
