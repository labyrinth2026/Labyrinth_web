import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, Calendar, Images, ChevronLeft, ChevronRight } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import SearchFilter from '../components/ui/SearchFilter';
import ScrollReveal from '../components/ui/ScrollReveal';

import { fetchFromSheet } from '../services/api';

const GalleryPage: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [galleryData, setGalleryData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [currentVideoIdx, setCurrentVideoIdx] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const featuredVideos = [
    { src: "/gallery/Screen_Recording_20260220_090135_Photos.mp4", label: "Sports Tournament Highlights" }
  ];

  const nextVideo = () => {
    setCurrentVideoIdx((prev) => (prev + 1) % featuredVideos.length);
  };
  const prevVideo = () => {
    setCurrentVideoIdx((prev) => (prev - 1 + featuredVideos.length) % featuredVideos.length);
  };

  useEffect(() => {
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

  useEffect(() => {
    // Viewport-aware playback observer
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch((err) => {
            console.log('Video autoplay blocked or interrupted:', err);
          });
        } else {
          video.pause();
        }
      },
      {
        threshold: 0.55, // Trigger play when at least 55% is visible
      }
    );

    observer.observe(video);

    return () => {
      observer.unobserve(video);
    };
  }, [isLoading, currentVideoIdx]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, search]);

  const filteredImages = galleryData
    .filter(img => img.image)
    .filter(img => img.image !== '/gallery/AVOLODHAA.mp4' && img.image !== '/gallery/Screen_Recording_20260220_090135_Photos.mp4' && img.image !== '/gallery/AVOLODHAA.webm')
    .filter(img => {
      const matchesFilter = filter === 'all' ? true : img.category === filter;
      const matchesSearch = search ? (
        img.title.toLowerCase().includes(search.toLowerCase()) ||
        img.description.toLowerCase().includes(search.toLowerCase())
      ) : true;
      return matchesFilter && matchesSearch;
    });

  const handlePrevImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!selectedImage) return;
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
    if (currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    setSelectedImage(filteredImages[prevIndex]);
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!selectedImage) return;
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % filteredImages.length;
    setSelectedImage(filteredImages[nextIndex]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;
      if (e.key === 'ArrowLeft') {
        handlePrevImage();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      } else if (e.key === 'Escape') {
        setSelectedImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, filteredImages]);

  const handlePageChange = (pageNum: number) => {
    setCurrentPage(pageNum);
    if (gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const ITEMS_PER_PAGE = 16;
  const totalPages = Math.ceil(filteredImages.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedImages = filteredImages.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getCategoryColor = (category: string) => {
    return { bg: 'bg-slate-50 border-slate-200/60', text: 'text-slate-600' };
  };

  const getHeightClass = (item: any, index: number) => {
    if (item.orientation) {
      switch (item.orientation) {
        case 'portrait': return 'h-72 md:h-80 w-full';
        case 'landscape': return 'h-44 md:h-56 w-full';
        case 'square': return 'h-56 md:h-60 w-full';
        case 'wide': return 'h-36 md:h-40 w-full';
        default: return 'h-52 md:h-60 w-full';
      }
    }
    const pattern = [2, 1, 2, 1, 1, 2];
    const span = pattern[index % pattern.length];
    return span === 2 ? 'h-72 md:h-80 w-full' : 'h-44 md:h-56 w-full';
  };

  if (!isMounted || isLoading) {
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
      {/* Header with Featured Video Section */}
      <section className="pt-6 md:pt-12 pb-0 bg-white">
        <div className="container mx-auto px-6 max-w-7xl text-center">
          <ScrollReveal animation="fade">
            <span className="inline-block px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest mb-6">
              Highlights
            </span>
            <h1 className="text-4xl md:text-6xl font-black mb-12 md:mb-16 text-slate-900 tracking-tight leading-tight uppercase">
              fieldops<span className="text-[#CD0000]">2026</span>
            </h1>
          </ScrollReveal>
          
          <ScrollReveal animation="zoom-up" duration={0.7} triggerOnce={true}>
            <div className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-slate-200/60 aspect-video mb-12 bg-slate-950 group">
              <video 
                ref={videoRef}
                key={currentVideoIdx}
                src={featuredVideos[currentVideoIdx].src} 
                autoPlay 
                loop 
                controls 
                playsInline 
                className="w-full h-full object-cover" 
              />
              
              {/* Navigation Arrows */}
              {featuredVideos.length > 1 && (
                <>
                  <button 
                    onClick={prevVideo}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition-all opacity-0 group-hover:opacity-100 z-10"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={nextVideo}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition-all opacity-0 group-hover:opacity-100 z-10"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
              
              {/* Indicators */}
              {featuredVideos.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {featuredVideos.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentVideoIdx(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${idx === currentVideoIdx ? 'bg-white w-4' : 'bg-white/40'}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Masonry Grid (Section 2: Off-White) */}
      <section ref={gridRef} id="gallery-grid" className="pt-10 pb-24 md:pt-14 bg-slate-50/50 scroll-mt-20">
        <div className="container mx-auto px-6 max-w-7xl">
          
          {/* Category Filter and Search Bar */}
          <div className="max-w-4xl mx-auto mb-12">
            <SearchFilter
              searchValue={search}
              onSearchChange={setSearch}
              activeFilter={filter}
              onFilterChange={setFilter}
              placeholder="Search gallery photos..."
              filters={[
                { label: 'All Photos', value: 'all' },
                { label: 'Inauguration', value: 'inauguration' },
                { label: 'Peer Education', value: 'peer_education' },
                { label: 'Sports', value: 'sports' },
                { label: 'Workshops', value: 'workshops' },
                { label: 'Hackathons', value: 'hackathons' },
                { label: 'Cultural', value: 'cultural' }
              ]}
            />
          </div>

          <AnimatePresence mode="wait">
            {paginatedImages.length > 0 ? (
              <>
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
                  <ScrollReveal key={`${filter}-${search}-${currentPage}`} stagger={0.03}>
                    {paginatedImages.map((item, i) => {
                      return (
                        <div
                          key={item.id}
                          className={`relative group rounded-2xl overflow-hidden cursor-pointer border border-slate-200 bg-white shadow-xs hover:shadow-md hover:scale-[1.025] transition-all duration-300 ease-out break-inside-avoid mb-4 ${getHeightClass(item, i)}`}
                          onClick={() => setSelectedImage(item)}
                        >
                          {item.image ? (
                            item.image.endsWith('.mp4') ? (
                              <div className="absolute inset-0 w-full h-full bg-slate-900 overflow-hidden">
                                <video 
                                  src={item.image} 
                                  muted 
                                  loop 
                                  playsInline 
                                  className="w-full h-full object-cover transition-transform duration-300" 
                                  onMouseEnter={e => e.currentTarget.play()} 
                                  onMouseLeave={e => e.currentTarget.pause()} 
                                  style={{ 
                                    transform: `rotate(${item.rotation ?? 0}deg)${(item.rotation ?? 0) === 90 || (item.rotation ?? 0) === 270 ? ' scale(1.5)' : ''}` 
                                  }}
                                />
                                <div className="absolute top-2 left-2 bg-slate-950/60 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-sm tracking-wider">Video</div>
                              </div>
                            ) : (
                              <img 
                                src={item.image} 
                                alt={item.title} 
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                style={{ 
                                  transform: `rotate(${item.rotation ?? 0}deg)${(item.rotation ?? 0) === 90 || (item.rotation ?? 0) === 270 ? ' scale(1.5)' : ''}` 
                                }} 
                              />
                            )
                          ) : (
                            <div className="absolute inset-0 bg-slate-100 flex flex-col items-center justify-center p-4">
                              <span className="text-[9px] font-black uppercase tracking-widest text-[#CD0000] mb-1">{item.category}</span>
                              <h3 className="text-slate-800 font-bold text-center text-xs px-2 line-clamp-2">{item.title}</h3>
                            </div>
                          )}

                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                            <ZoomIn className="text-white w-6 h-6 scale-90 group-hover:scale-100 transition-transform duration-200" />
                          </div>
                        </div>
                      );
                    })}
                  </ScrollReveal>
                </div>

                {/* Pagination Control */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-16">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-800 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      title="Previous Page"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      const isFirstOrLast = page === 1 || page === totalPages;
                      const isNeighbor = Math.abs(page - currentPage) <= 1;
                      
                      if (isFirstOrLast || isNeighbor) {
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`w-9 h-9 rounded-xl border text-xs font-bold uppercase transition-all ${
                              currentPage === page
                                ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        (page === 2 && currentPage > 3) ||
                        (page === totalPages - 1 && currentPage < totalPages - 2)
                      ) {
                        return (
                          <span key={page} className="text-slate-300 text-xs px-1 font-bold">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-800 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      title="Next Page"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <Images size={36} className="text-[#CD0000] mx-auto mb-4" />
                <p className="text-slate-500 text-xs">No images found for this category.</p>
              </div>
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
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-slate-950/40 backdrop-blur-xs"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-5 right-5 text-slate-500 hover:text-slate-800 p-2.5 bg-white rounded-full transition-colors z-55 shadow-xs border border-slate-200/60"
              onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
              title="Close popup"
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
                background: 'rgba(255, 255, 255, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
              }}
              className="relative w-full max-w-3xl rounded-3xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image Area inside Modal */}
              <div className="w-full aspect-video relative bg-slate-950 flex flex-col items-center justify-center group/lightbox">
                {selectedImage.image ? (
                  selectedImage.image.endsWith('.mp4') ? (
                    <video src={selectedImage.image} controls autoPlay className="w-full h-full object-contain" style={{ transform: `rotate(${selectedImage.rotation ?? 0}deg)` }} />
                  ) : (
                    <img src={selectedImage.image} alt={selectedImage.title} className="w-full h-full object-contain" style={{ transform: `rotate(${selectedImage.rotation ?? 0}deg)` }} />
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-100 w-full h-full">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-700 tracking-tight uppercase leading-none">{selectedImage.title}</h2>
                    <p className="text-slate-400 mt-2 text-[10px] uppercase tracking-widest font-bold">(Image Placeholder)</p>
                  </div>
                )}

                {/* Lightbox Prev/Next Controls */}
                {filteredImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition-all opacity-0 group-hover/lightbox:opacity-100 z-10"
                      title="Previous image"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition-all opacity-0 group-hover/lightbox:opacity-100 z-10"
                      title="Next image"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {/* Caption metadata */}
              <div className="p-5 bg-white/95 border-t border-slate-100/80">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-wider mb-2">
                      {selectedImage.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      {selectedImage.title}
                    </h3>
                    {selectedImage.description && (
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                        {selectedImage.description}
                      </p>
                    )}
                  </div>
                  {selectedImage.date && (
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Date</span>
                      <span className="text-xs text-slate-700 font-semibold">{new Date(selectedImage.date).toLocaleDateString()}</span>
                    </div>
                  )}
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
