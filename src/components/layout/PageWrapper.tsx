import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children, className = '' }) => {
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    gsap.to(mainRef.current, {
      opacity: 1,
      duration: 0.5,
      ease: 'power3.out'
    });
  }, []);

  return (
    <main
      ref={mainRef}
      style={{ opacity: 0 }}
      className={`min-h-screen pt-20 pb-16 bg-white ${className}`}
    >
      {children}
    </main>
  );
};

export default PageWrapper;
