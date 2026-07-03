"use client";

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface ScrollRevealProps {
  children: React.ReactNode;
  animation?: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'zoom' | 'zoom-up';
  duration?: number;
  delay?: number;
  stagger?: number;
  triggerOnce?: boolean;
}

export default function ScrollReveal({
  children,
  animation = 'slide-up',
  duration = 0.7,
  delay = 0,
  stagger = 0.08,
  triggerOnce = true
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    // Direct children are targets if we stagger, otherwise the container itself
    const targets = container.children.length > 0
      ? Array.from(container.children)
      : [container];

    let fromVars: gsap.TweenVars = {};
    let toVars: gsap.TweenVars = {
      opacity: 1,
      duration,
      delay,
      ease: 'power3.out',
      stagger: stagger > 0 ? stagger : undefined,
      scrollTrigger: {
        trigger: container,
        start: 'top 80%',
        toggleActions: triggerOnce ? 'play none none none' : 'play none none reverse',
      }
    };

    switch (animation) {
      case 'fade':
        fromVars = { opacity: 0 };
        break;
      case 'slide-up':
        fromVars = { opacity: 0, y: 30 };
        toVars.y = 0;
        break;
      case 'slide-down':
        fromVars = { opacity: 0, y: -30 };
        toVars.y = 0;
        break;
      case 'slide-left':
        fromVars = { opacity: 0, x: 30 };
        toVars.x = 0;
        break;
      case 'slide-right':
        fromVars = { opacity: 0, x: -30 };
        toVars.x = 0;
        break;
      case 'zoom':
        fromVars = { opacity: 0, scale: 0.95 };
        toVars.scale = 1;
        break;
      case 'zoom-up':
        fromVars = { opacity: 0, y: 30, scale: 0.96 };
        toVars.y = 0;
        toVars.scale = 1;
        break;
    }

    // Set initial values
    gsap.set(targets, fromVars);

    // Create the ScrollTrigger animation within a GSAP context for proper cleanup
    const ctx = gsap.context(() => {
      gsap.to(targets, toVars);
    }, container);

    return () => {
      ctx.revert();
    };
  }, [animation, duration, delay, stagger, triggerOnce]);

  return (
    <div ref={containerRef} className="contents" style={{ display: 'contents' }}>
      {children}
    </div>
  );
}
