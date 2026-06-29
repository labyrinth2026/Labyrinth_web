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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-8">
              <AlertCircle size={48} className="text-[#005BAC]" />
            </div>
            
            <h1 className="font-grotesk text-6xl md:text-8xl font-bold text-[#1a2c4a] mb-4 tracking-tight">
              404
            </h1>
            
            <h2 className="text-2xl md:text-3xl font-bold text-[#005BAC] mb-6">
              Page Not Found
            </h2>
            
            <p className="text-lg text-[#4b6080] mb-10 max-w-xl mx-auto leading-relaxed">
              The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            
            <Link 
              href="/"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-[#005BAC] text-white font-semibold rounded-full hover:bg-[#004a8f] transition-all shadow-md hover:shadow-lg active:scale-95"
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
