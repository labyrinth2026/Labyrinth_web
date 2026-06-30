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
      default: return { bg: 'rgba(205, 0, 0, 0.03)', text: '#CD0000' };
    }
  };

  const getGradientForCategory = (category: string) => {
    switch (category) {
      case 'workshops': return 'from-[#CD0000] to-[#FF3333]';
      case 'hackathons': return 'from-[#dc2626] to-[#f97316]';
      case 'sports': return 'from-[#16a34a] to-[#0d9488]';
      case 'cultural': return 'from-[#7c3aed] to-[#db2777]';
      default: return 'from-[#CD0000] to-[#0369a1]';
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
        <div className="min-h-[60vh] flex items-center justify-center bg-[#121212]">
          <div className="w-8 h-8 border-3 border-[#CD0000] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* Header (Section 1: Warm White #EFEDE6) */}
      <section className="py-24 bg-[#EFEDE6] border-b border-[#B8B8B8]/20">
        <div className="container mx-auto px-6 max-w-7xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#CD0000]/5 border border-[#CD0000]/20 text-[#CD0000] text-xs font-bold uppercase tracking-widest mb-6">
              Memories
            </span>
            <h1 className="font-grotesk text-5xl md:text-7xl font-black mb-6 text-[#121212] tracking-tighter leading-none">
              OUR <span className="text-[#CD0000]">GALLERY</span>
            </h1>
            <p className="text-lg text-[#121212]/70 max-w-2xl mx-auto mb-10 leading-relaxed">
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

      {/* Masonry Grid (Section 2: Charcoal Black #121212) */}
      <section className="py-24 bg-[#121212]">
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
                      className={`relative group rounded-3xl overflow-hidden cursor-pointer border border-[#B8B8B8]/15 shadow-sm hover:shadow-xl hover:shadow-[#CD0000]/10 ${getRowSpan(i)}`}
                      onClick={() => setSelectedImage(item)}
                    >
                      {/* Background */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${getGradientForCategory(item.category)}`}>
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <ZoomIn className="text-white w-8 h-8 scale-75 group-hover:scale-100 transition-transform duration-200" />
                      </div>

                      {/* Content */}
                      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/85 to-transparent translate-y-1 group-hover:translate-y-0 transition-transform duration-250">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#CD0000] mb-0.5 block">{item.category}</span>
                        <h3 className="text-[#EFEDE6] font-bold text-sm line-clamp-1">{item.title}</h3>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                <Images size={48} className="text-[#CD0000] mx-auto mb-4" />
                <p className="text-[#B8B8B8] text-lg">No images found for this category.</p>
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
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-5 right-5 text-[#EFEDE6]/60 hover:text-white p-2 bg-white/10 rounded-full transition-colors z-50"
              onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
            >
              <X size={22} />
            </button>

            <motion.div
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 16 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image Area */}
              <div className={`w-full aspect-video relative bg-gradient-to-br ${getGradientForCategory(selectedImage.category)} flex flex-col items-center justify-center p-8 text-center`}>
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                <h2 className="text-2xl md:text-5xl font-black text-white/70 font-grotesk tracking-tight uppercase leading-none">{selectedImage.title}</h2>
                <p className="text-white/30 mt-3 text-sm">(Image Placeholder)</p>
              </div>

              {/* Info Area */}
              <div className="bg-[#181818] border-t border-white/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-[#EFEDE6] mb-1 tracking-tight">{selectedImage.title}</h3>
                  <p className="text-[#B8B8B8] text-sm leading-relaxed">{selectedImage.description}</p>
                </div>
                <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                    style={{ backgroundColor: getCategoryColor(selectedImage.category).bg, color: getCategoryColor(selectedImage.category).text }}>
                    {selectedImage.category}
                  </span>
                  <div className="flex items-center text-xs font-semibold text-[#B8B8B8] uppercase tracking-wider">
                    <Calendar size={13} className="mr-1.5 text-[#CD0000]" />
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
