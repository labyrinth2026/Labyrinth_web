"use client";

import React, { useEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import Lenis from 'lenis';

export interface ScrollStackItemProps {
  itemClassName?: string;
  children: ReactNode;
}

export const ScrollStackItem: React.FC<ScrollStackItemProps> = ({ children, itemClassName = '' }) => (
  <div
    className={`scroll-stack-card relative w-full min-h-[20rem] sm:min-h-[22rem] my-4 sm:my-6 p-4 sm:p-8 md:p-12 rounded-[28px] sm:rounded-[36px] shadow-[0_25px_60px_rgba(0,0,0,0.3)] box-border origin-top overflow-hidden will-change-transform ${itemClassName}`.trim()}
    style={{
      backfaceVisibility: 'hidden',
      transformStyle: 'preserve-3d'
    }}
  >
    {children}
  </div>
);

interface ScrollStackProps {
  className?: string;
  children: ReactNode;
  itemDistance?: number;
  itemScale?: number;
  itemStackDistance?: number;
  stackPosition?: string;
  scaleEndPosition?: string;
  baseScale?: number;
  scaleDuration?: number;
  rotationAmount?: number;
  blurAmount?: number;
  useWindowScroll?: boolean;
  onStackComplete?: () => void;
}

const ScrollStack: React.FC<ScrollStackProps> = ({
  children,
  className = '',
  itemDistance = 40,
  itemScale = 0.035,
  itemStackDistance = 26,
  stackPosition = '12%',
  scaleEndPosition = '6%',
  baseScale = 0.78,
  rotationAmount = 0,
  blurAmount = 0,
  useWindowScroll = false,
  onStackComplete
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stackCompletedRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const cardsRef = useRef<HTMLElement[]>([]);
  const cardOffsetsRef = useRef<number[]>([]);
  const endElementOffsetRef = useRef<number>(0);
  const lastTransformsRef = useRef(new Map<number, any>());

  const parsePercentage = useCallback((value: string | number, containerHeight: number) => {
    if (typeof value === 'string' && value.includes('%')) {
      return (parseFloat(value) / 100) * containerHeight;
    }
    return parseFloat(value as string);
  }, []);

  const getScrollData = useCallback(() => {
    if (useWindowScroll) {
      return {
        scrollTop: window.scrollY,
        containerHeight: window.innerHeight,
      };
    } else {
      const scroller = scrollerRef.current;
      return {
        scrollTop: scroller ? scroller.scrollTop : 0,
        containerHeight: scroller ? scroller.clientHeight : 0,
      };
    }
  }, [useWindowScroll]);

  // Measure initial static unpinned card offsets once to avoid layout thrashing
  const measureOffsets = useCallback(() => {
    const scroller = scrollerRef.current;
    const cards = Array.from(
      useWindowScroll
        ? document.querySelectorAll('.scroll-stack-card')
        : (scroller?.querySelectorAll('.scroll-stack-card') ?? [])
    ) as HTMLElement[];

    cardsRef.current = cards;
    if (!cards.length) return;

    const endElement = useWindowScroll
      ? (document.querySelector('.scroll-stack-end') as HTMLElement | null)
      : (scroller?.querySelector('.scroll-stack-end') as HTMLElement | null);

    // Save current card transforms
    const savedTransforms = cards.map(c => c.style.transform);

    // Reset transforms to measure static positions
    cards.forEach((card, i) => {
      if (i < cards.length - 1) {
        card.style.marginBottom = `${itemDistance}px`;
      }
      card.style.willChange = 'transform, filter';
      card.style.transformOrigin = 'top center';
      card.style.backfaceVisibility = 'hidden';
      card.style.transform = 'none';
      card.style.zIndex = `${10 + i}`;
    });

    if (useWindowScroll) {
      cardOffsetsRef.current = cards.map(card => {
        const rect = card.getBoundingClientRect();
        return rect.top + window.scrollY;
      });

      if (endElement) {
        const rect = endElement.getBoundingClientRect();
        endElementOffsetRef.current = rect.top + window.scrollY;
      } else {
        endElementOffsetRef.current = 0;
      }
    } else {
      cardOffsetsRef.current = cards.map(card => card.offsetTop);
      endElementOffsetRef.current = endElement ? endElement.offsetTop : 0;
    }

    // Restore transforms
    cards.forEach((card, i) => {
      card.style.transform = savedTransforms[i] || 'translateZ(0)';
    });
  }, [useWindowScroll, itemDistance]);

  // Transform update loop: ensures succeeding card (i+1) overlays preceding card (i)
  const updateCardTransforms = useCallback(() => {
    const cards = cardsRef.current;
    const cardOffsets = cardOffsetsRef.current;
    if (!cards.length || !cardOffsets.length) return;

    const { scrollTop, containerHeight } = getScrollData();
    const stackPositionPx = parsePercentage(stackPosition, containerHeight);
    const endElementTop = endElementOffsetRef.current;

    // 1. Calculate pinStart for each card i
    const pinStarts = cards.map((_, i) => {
      const cardTop = cardOffsets[i] ?? 0;
      const headerTop = stackPositionPx + itemStackDistance * i;
      return cardTop - headerTop;
    });

    // 2. Calculate overlay progress p(j) for each card j (how far past pinStart(j) scroll has gone)
    const pinProgresses = pinStarts.map((pStart) => {
      if (scrollTop < pStart) return 0;
      return Math.min(1, (scrollTop - pStart) / 220);
    });

    const pinEnd = endElementTop - containerHeight / 2;

    cards.forEach((card, i) => {
      if (!card) return;

      const cardTop = cardOffsets[i] ?? 0;
      const headerTop = stackPositionPx + itemStackDistance * i;
      const pinStart = pinStarts[i];

      // Calculate scale reduction: Card i shrinks as succeeding cards j > i overlay on top of it
      let scaleReduction = 0;
      for (let j = i + 1; j < cards.length; j++) {
        scaleReduction += pinProgresses[j] * itemScale;
      }

      const scale = Math.max(baseScale, 1 - scaleReduction);
      const rotation = rotationAmount ? i * rotationAmount * pinProgresses[i] : 0;

      let translateY = 0;
      const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;

      if (isPinned) {
        translateY = scrollTop - cardTop + headerTop;
      } else if (scrollTop > pinEnd) {
        translateY = pinEnd - cardTop + headerTop;
      }

      // Explicit zIndex: Succeeding cards have HIGHER zIndex to overlay on top of preceding cards
      const zIndex = 10 + i;

      const newTransform = {
        translateY: Math.round(translateY * 100) / 100,
        scale: Math.round(scale * 1000) / 1000,
        rotation: Math.round(rotation * 100) / 100,
        zIndex
      };

      const lastTransform = lastTransformsRef.current.get(i);
      const hasChanged =
        !lastTransform ||
        Math.abs(lastTransform.translateY - newTransform.translateY) > 0.05 ||
        Math.abs(lastTransform.scale - newTransform.scale) > 0.0005 ||
        Math.abs(lastTransform.rotation - newTransform.rotation) > 0.05 ||
        lastTransform.zIndex !== newTransform.zIndex;

      if (hasChanged) {
        const transform = `translate3d(0, ${newTransform.translateY}px, 0) scale(${newTransform.scale}) rotate(${newTransform.rotation}deg)`;

        card.style.transform = transform;
        card.style.zIndex = `${newTransform.zIndex}`;

        lastTransformsRef.current.set(i, newTransform);
      }

      if (i === cards.length - 1) {
        const isInView = scrollTop >= pinStart && scrollTop <= pinEnd;
        if (isInView && !stackCompletedRef.current) {
          stackCompletedRef.current = true;
          onStackComplete?.();
        } else if (!isInView && stackCompletedRef.current) {
          stackCompletedRef.current = false;
        }
      }
    });
  }, [
    itemScale,
    itemStackDistance,
    stackPosition,
    baseScale,
    rotationAmount,
    onStackComplete,
    parsePercentage,
    getScrollData
  ]);

  useEffect(() => {
    let lenisUnsub: (() => void) | null = null;
    let isScheduled = false;

    const handleScrollThrottled = () => {
      if (!isScheduled) {
        isScheduled = true;
        requestAnimationFrame(() => {
          isScheduled = false;
          updateCardTransforms();
        });
      }
    };

    measureOffsets();
    updateCardTransforms();

    const handleResize = () => {
      measureOffsets();
      updateCardTransforms();
    };

    window.addEventListener('resize', handleResize);

    if (useWindowScroll) {
      window.addEventListener('scroll', handleScrollThrottled, { passive: true });

      const globalLenis = (window as any).lenisInstance;
      if (globalLenis && typeof globalLenis.on === 'function') {
        globalLenis.on('scroll', handleScrollThrottled);
        lenisUnsub = () => {
          if (typeof globalLenis.off === 'function') {
            globalLenis.off('scroll', handleScrollThrottled);
          }
        };
      }
    } else {
      const scroller = scrollerRef.current;
      if (scroller) {
        const lenis = new Lenis({
          wrapper: scroller,
          content: scroller.querySelector('.scroll-stack-inner') as HTMLElement,
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          touchMultiplier: 2,
          infinite: false,
          gestureOrientation: 'vertical',
          wheelMultiplier: 1,
          lerp: 0.1,
        } as any);

        lenis.on('scroll', handleScrollThrottled);
        lenisRef.current = lenis;

        const raf = (time: number) => {
          lenis.raf(time);
          animationFrameRef.current = requestAnimationFrame(raf);
        };
        animationFrameRef.current = requestAnimationFrame(raf);
      }
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (useWindowScroll) {
        window.removeEventListener('scroll', handleScrollThrottled);
        if (lenisUnsub) lenisUnsub();
      } else {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (lenisRef.current) {
          lenisRef.current.destroy();
          lenisRef.current = null;
        }
      }
      lastTransformsRef.current.clear();
      stackCompletedRef.current = false;
    };
  }, [useWindowScroll, updateCardTransforms, measureOffsets]);

  return (
    <div
      className={`relative w-full ${useWindowScroll ? 'overflow-visible' : 'h-full overflow-y-auto overflow-x-visible'} ${className}`.trim()}
      ref={scrollerRef}
      style={useWindowScroll ? undefined : {
        overscrollBehavior: 'contain',
        WebkitOverflowScrolling: 'touch',
        scrollBehavior: 'smooth',
        WebkitTransform: 'translateZ(0)',
        transform: 'translateZ(0)',
        willChange: 'scroll-position'
      }}
    >
      <div className={`scroll-stack-inner ${useWindowScroll ? 'pt-2 pb-24' : 'pt-8 pb-[30rem]'} px-2 sm:px-6 md:px-10`}>
        {children}
        {/* Spacer so the last pin can release cleanly */}
        <div className="scroll-stack-end w-full h-px" />
      </div>
    </div>
  );  
};

export default ScrollStack;
