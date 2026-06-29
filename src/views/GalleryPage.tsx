import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, Calendar, Images } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import SearchFilter from '../components/ui/SearchFilter';

import { fetchFromSheet } from '../services/api';

const GalleryPage: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [galleryData, setGalleryData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const data: any = await fetchFromSheet('getGallery');
        if (Array.isArray(data)) setGalleryData(data);
      } catch (err) {
        console.error(err);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  const filteredImages = filter === 'all'
    ? galleryData
    : galleryData.filter(img => img.category === filter);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'workshops': return { bg: '#EFF6FF', text: '#2563eb' };
      case 'hackathons': return { bg: '#FEF2F2', text: '#dc2626' };
      case 'sports': return { bg: '#F0FDF4', text: '#16a34a' };
      case 'cultural': return { bg: '#F5F3FF', text: '#7c3aed' };
      default: return { bg: 'rgba(11,31,99,0.03)', text: '#0B1F63' };
    }
  };

  const getGradientForCategory = (category: string) => {
    switch (category) {
      case 'workshops': return 'from-[#0B1F63] to-[#163294]';
      case 'hackathons': return 'from-[#dc2626] to-[#f97316]';
      case 'sports': return 'from-[#16a34a] to-[#0d9488]';
      case 'cultural': return 'from-[#7c3aed] to-[#db2777]';
      default: return 'from-[#0B1F63] to-[#0369a1]';
    }
  };

  const getRowSpan = (index: number) => {
    const pattern = [2, 1, 2, 1, 1, 2];
    const span = pattern[index % pattern.length];
    return span === 2 ? 'row-span-2 h-72 md:h-80' : 'row-span-1 h-44 md:h-56';
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#0B1F63] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* Header */}
      <section className="py-16 bg-gradient-to-br from-[rgba(11,31,99,0.03)] to-white">
        <div className="container mx-auto px-6 max-w-7xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-block px-4 py-1 rounded-full bg-[rgba(11,31,99,0.03)] border border-[rgba(11,31,99,0.07)] text-[#0B1F63] text-xs font-bold uppercase tracking-widest mb-4">
              Memories
            </span>
            <h1 className="font-grotesk text-5xl md:text-6xl font-bold mb-4 text-[#0B1F63]">
              Our <span className="text-[#0B1F63]">Gallery</span>
            </h1>
            <p className="text-lg text-[#667085] max-w-2xl mx-auto mb-10">
              Moments from our events, workshops, and community gatherings.
            </p>

            <div className="max-w-2xl mx-auto flex justify-center">
              <SearchFilter
                searchValue=""
                onSearchChange={() => {}}
                activeFilter={filter}
                onFilterChange={setFilter}
                filters={[
                  { label: 'All', value: 'all' },
                  { label: 'Hackathons', value: 'hackathons' },
                  { label: 'Workshops', value: 'workshops' },
                  { label: 'Sports', value: 'sports' },
                  { label: 'Cultural', value: 'cultural' }
                ]}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Masonry Grid */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <AnimatePresence mode="wait">
            {filteredImages.length > 0 ? (
              <motion.div
                key={filter}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-auto"
              >
                {filteredImages.map((item, i) => {
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, delay: i * 0.04 }}
                      className={`relative group rounded-2xl overflow-hidden cursor-pointer border border-[#E5E7EB] shadow-sm hover:shadow-lg hover:shadow-[#0B1F63]/10 ${getRowSpan(i)}`}
                      onClick={() => setSelectedImage(item)}
                    >
                      {/* Background */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${getGradientForCategory(item.category)}`}>
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <ZoomIn className="text-white w-8 h-8 scale-75 group-hover:scale-100 transition-transform duration-200" />
                      </div>

                      {/* Content */}
                      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent translate-y-1 group-hover:translate-y-0 transition-transform duration-200">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/70 mb-0.5 block">{item.category}</span>
                        <h3 className="text-white font-semibold text-sm line-clamp-1">{item.title}</h3>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                <Images size={48} className="text-[#F4B400] mx-auto mb-4" />
                <p className="text-[#8c97a8] text-lg">No images found for this category.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-[#0B1F63]/90 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-5 right-5 text-white/60 hover:text-white p-2 bg-white/10 rounded-full transition-colors z-50"
              onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
            >
              <X size={22} />
            </button>

            <motion.div
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 16 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image Area */}
              <div className={`w-full aspect-video relative bg-gradient-to-br ${getGradientForCategory(selectedImage.category)} flex flex-col items-center justify-center p-8 text-center`}>
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                <h2 className="text-2xl md:text-4xl font-bold text-white/60 font-grotesk tracking-widest uppercase">{selectedImage.title}</h2>
                <p className="text-white/30 mt-2 text-sm">(Image Placeholder)</p>
              </div>

              {/* Info Area */}
              <div className="bg-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-[#0B1F63] mb-1">{selectedImage.title}</h3>
                  <p className="text-[#667085] text-sm">{selectedImage.description}</p>
                </div>
                <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                    style={{ backgroundColor: getCategoryColor(selectedImage.category).bg, color: getCategoryColor(selectedImage.category).text }}>
                    {selectedImage.category}
                  </span>
                  <div className="flex items-center text-sm text-[#8c97a8]">
                    <Calendar size={13} className="mr-1.5" />
                    {new Date(selectedImage.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
};

export default GalleryPage;
