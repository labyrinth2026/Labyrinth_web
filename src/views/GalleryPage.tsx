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
    return { bg: 'bg-slate-50 border-slate-200/60', text: 'text-slate-600' };
  };

  const getRowSpan = (index: number) => {
    const pattern = [2, 1, 2, 1, 1, 2];
    const span = pattern[index % pattern.length];
    return span === 2 ? 'row-span-2 h-72 md:h-80' : 'row-span-1 h-44 md:h-56';
  };

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
      <section className="py-24 bg-white border-b border-slate-100">
        <div className="container mx-auto px-6 max-w-7xl text-center">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest mb-6">
              Memories
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-slate-900 tracking-tight leading-tight">
              OUR <span className="text-[#CD0000]">GALLERY</span>
            </h1>
            <p className="text-slate-500 text-xs md:text-sm max-w-2xl mx-auto mb-10 leading-relaxed">
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

      {/* Masonry Grid (Section 2: Off-White) */}
      <section className="py-24 bg-slate-50/50">
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
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: i * 0.03 }}
                      className={`relative group rounded-2xl overflow-hidden cursor-pointer border border-slate-200 bg-white shadow-xs hover:shadow-md ${getRowSpan(i)}`}
                      onClick={() => setSelectedImage(item)}
                    >
                      {/* Image Area placeholder */}
                      <div className="absolute inset-0 bg-slate-100 flex flex-col items-center justify-center p-4">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#CD0000] mb-1">{item.category}</span>
                        <h3 className="text-slate-800 font-bold text-center text-xs px-2 line-clamp-2">{item.title}</h3>
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <ZoomIn className="text-slate-700 w-6 h-6 scale-90 group-hover:scale-100 transition-transform duration-200" />
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                <Images size={36} className="text-[#CD0000] mx-auto mb-4" />
                <p className="text-slate-500 text-xs">No images found for this category.</p>
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
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-slate-950/20 backdrop-blur-xs"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-5 right-5 text-slate-500 hover:text-slate-800 p-2 bg-white rounded-full transition-colors z-50 shadow-xs border border-slate-200/60"
              onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
            >
              <X size={18} />
            </button>

            <motion.div
              initial={{ scale: 0.97, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.97, y: 10 }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              style={{
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                background: 'rgba(255, 255, 255, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
              }}
              className="relative w-full max-w-2xl rounded-3xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image Area placeholder inside Modal */}
              <div className="w-full aspect-video relative bg-slate-100 flex flex-col items-center justify-center p-8 text-center border-b border-slate-200/60">
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-700 tracking-tight uppercase leading-none">{selectedImage.title}</h2>
                <p className="text-slate-400 mt-2 text-[10px] uppercase tracking-widest font-bold">(Image Placeholder)</p>
              </div>

              {/* Info Area */}
              <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1 tracking-tight">{selectedImage.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{selectedImage.description}</p>
                </div>
                <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${getCategoryColor(selectedImage.category).bg} ${getCategoryColor(selectedImage.category).text}`}>
                    {selectedImage.category}
                  </span>
                  <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <Calendar size={12} className="mr-1.5 text-[#CD0000]" />
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
