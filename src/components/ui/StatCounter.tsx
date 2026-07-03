import React, { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

interface StatCounterProps {
  value: number;
  label: string;
  suffix?: string;
  icon: LucideIcon;
}

const StatCounter: React.FC<StatCounterProps> = ({ value, label, suffix = '', icon: Icon }) => {
  const [count, setCount] = useState(0);
  const { ref, isVisible } = useScrollAnimation();

  useEffect(() => {
    if (!isVisible) return;

    let startTimestamp: number | null = null;
    const duration = 2000;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeProgress * value));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(value);
      }
    };

    window.requestAnimationFrame(step);
  }, [value, isVisible]);

  return (
    <div
      ref={ref}
      style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        background: 'rgba(255, 255, 255, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
      }}
      className="rounded-3xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group transition-all duration-300 hover:scale-[1.015] hover:-translate-y-1 hover:shadow-md hover:shadow-[#CD0000]/[0.02]"
    >
      <div className="w-11 h-11 rounded-xl bg-slate-100/80 border border-slate-200/40 flex items-center justify-center mb-4 text-[#CD0000] group-hover:bg-[#CD0000] group-hover:text-white transition-all duration-300 shadow-xs">
        <Icon size={20} />
      </div>

      <div className="text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">
        {count}{suffix}
      </div>

      <div className="text-slate-500 font-bold text-xs uppercase tracking-widest">
        {label}
      </div>
    </div>
  );
};

export default StatCounter;
