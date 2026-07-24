import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import PageWrapper from '../components/layout/PageWrapper';
import { AlertCircle } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <PageWrapper>
      <section className="py-32 bg-white flex items-center justify-center min-h-[70vh]">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mb-8 shadow-xs">
              <AlertCircle size={28} className="text-[#CD0000]" />
            </div>
            
            <h1 className="text-6xl md:text-8xl font-extrabold text-[#CD0000] mb-4 tracking-tighter leading-none">
              404
            </h1>
            
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-5 tracking-tight">
              Page Not Found
            </h2>
            
            <p className="text-xs md:text-sm text-slate-500 mb-8 max-w-md mx-auto leading-relaxed">
              The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            
            <Link 
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#CD0000] text-white font-bold uppercase tracking-wider text-[10px] rounded-full hover:bg-[#9E0000] transition-all shadow-xs"
            >
              Return Home
            </Link>
          </motion.div>
        </div>
      </section>
    </PageWrapper>
  );
};

export default NotFoundPage;
