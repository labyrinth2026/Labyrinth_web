import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, Calendar, Images } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import SearchFilter from '../components/ui/SearchFilter';
import ScrollReveal from '../components/ui/ScrollReveal';

import { fetchFromSheet } from '../services/api';

const GalleryPage: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [galleryData, setGalleryData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

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
  }, [isLoading]);

  const filteredImages = galleryData
    .filter(img => img.image) // Only show items with actual images
    .filter(img => !img.image.endsWith('.mp4')) // Exclude the featured video from the grid
    .filter(img => filter === 'all' ? true : img.category === filter);

  const getCategoryColor = (category: string) => {
    return { bg: 'bg-slate-50 border-slate-200/60', text: 'text-slate-600' };
  };

  const getHeightClass = (index: number) => {
    const pattern = [2, 1, 2, 1, 1, 2];
    const span = pattern[index % pattern.length];
    return span === 2 ? 'h-72 md:h-80 w-full' : 'h-44 md:h-56 w-full';
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
            <div className="w-full md:w-[95%] lg:w-[90%] max-w-7xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-slate-200/60 aspect-video mb-0 bg-slate-950">
              <video 
                ref={videoRef}
                src="/gallery/Screen_Recording_20260220_090135_Photos.mp4" 
                loop 
                controls 
                playsInline 
                className="w-full h-full object-cover" 
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Masonry Grid (Section 2: Off-White) */}
      <section className="pt-10 pb-24 md:pt-14 bg-slate-50/50">
        <div className="container mx-auto px-6 max-w-7xl">
          <AnimatePresence mode="wait">
            {filteredImages.length > 0 ? (
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
                <ScrollReveal key={filter} stagger={0.05}>
                  {filteredImages.map((item, i) => {
                    return (
                      <div
                        key={item.id}
                        className={`relative group rounded-2xl overflow-hidden cursor-pointer border border-slate-200 bg-white shadow-xs hover:shadow-md hover:scale-[1.025] transition-all duration-300 ease-out break-inside-avoid mb-4 ${getHeightClass(i)}`}
                        onClick={() => setSelectedImage(item)}
                      >
                        {item.image ? (
                          item.image.endsWith('.mp4') ? (
                            <div className="absolute inset-0 w-full h-full bg-slate-900">
                              <video src={item.image} muted loop playsInline className="w-full h-full object-cover" onMouseEnter={e => e.currentTarget.play()} onMouseLeave={e => e.currentTarget.pause()} />
                              <div className="absolute top-2 left-2 bg-slate-950/60 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-sm tracking-wider">Video</div>
                            </div>
                          ) : (
                            <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
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
              {/* Image Area inside Modal */}
              <div className="w-full aspect-video relative bg-slate-950 flex flex-col items-center justify-center">
                {selectedImage.image ? (
                  selectedImage.image.endsWith('.mp4') ? (
                    <video src={selectedImage.image} controls autoPlay className="w-full h-full object-contain" />
                  ) : (
                    <img src={selectedImage.image} alt={selectedImage.title} className="w-full h-full object-contain" />
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-100 w-full h-full">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-700 tracking-tight uppercase leading-none">{selectedImage.title}</h2>
                    <p className="text-slate-400 mt-2 text-[10px] uppercase tracking-widest font-bold">(Image Placeholder)</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
};

export default GalleryPage;
