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
      className="bg-white border border-blue-100 rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group transition-all duration-300 hover:shadow-lg hover:shadow-[#005BAC]/10 hover:-translate-y-1"
    >
      {/* Blue accent top bar on hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#005BAC] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

      <div className="w-14 h-14 rounded-2xl bg-[#EAF4FF] flex items-center justify-center mb-4 text-[#005BAC] group-hover:bg-[#005BAC] group-hover:text-white transition-all duration-300">
        <Icon size={28} />
      </div>

      <div className="font-grotesk text-4xl font-bold text-[#1a2c4a] mb-1 tracking-tight">
        {count}{suffix}
      </div>

      <div className="text-[#4b6080] font-medium text-sm tracking-wide">
        {label}
      </div>
    </div>
  );
};

export default StatCounter;
