"use client";

import React from 'react';

interface WorldMapDecorProps {
  className?: string;
}

const WorldMapDecor: React.FC<WorldMapDecorProps> = ({ className = '' }) => {
  return (
    <div
      className={`absolute top-0 right-0 w-[550px] sm:w-[700px] md:w-[900px] lg:w-[1050px] h-[320px] sm:h-[400px] md:h-[500px] pointer-events-none select-none overflow-hidden transition-opacity duration-700 ${className}`}
      aria-hidden="true"
    >
      <style jsx>{`
        @keyframes radarPulse {
          0% {
            transform: scale(0.5);
            opacity: 0.8;
          }
          50% {
            opacity: 0.35;
          }
          100% {
            transform: scale(3.5);
            opacity: 0;
          }
        }
        .radar-ring {
          animation: radarPulse 3.2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
          transform-origin: 685px 245px;
          will-change: transform, opacity;
        }
        .radar-ring-delayed {
          animation-delay: 1.6s;
        }
      `}</style>

      <svg
        viewBox="0 0 1000 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* ── Layer 1: Dotted SVG World Map ── */}
        <g fill="#1E293B" opacity="0.08" className="filter blur-[0.2px]">
          {/* North America */}
          <circle cx="150" cy="120" r="3.5" /><circle cx="170" cy="110" r="3.5" /><circle cx="190" cy="115" r="3.5" /><circle cx="210" cy="125" r="3.5" /><circle cx="230" cy="135" r="3.5" />
          <circle cx="130" cy="140" r="3.5" /><circle cx="150" cy="145" r="3.5" /><circle cx="170" cy="135" r="3.5" /><circle cx="190" cy="140" r="3.5" /><circle cx="210" cy="150" r="3.5" /><circle cx="230" cy="165" r="3.5" />
          <circle cx="140" cy="165" r="3.5" /><circle cx="160" cy="160" r="3.5" /><circle cx="180" cy="165" r="3.5" /><circle cx="200" cy="175" r="3.5" /><circle cx="220" cy="190" r="3.5" /><circle cx="240" cy="200" r="3.5" />
          <circle cx="170" cy="185" r="3.5" /><circle cx="190" cy="190" r="3.5" /><circle cx="210" cy="205" r="3.5" /><circle cx="230" cy="220" r="3.5" />
          <circle cx="180" cy="210" r="3.5" /><circle cx="200" cy="220" r="3.5" /><circle cx="220" cy="240" r="3.5" /><circle cx="240" cy="255" r="3.5" />
          <circle cx="210" cy="250" r="3.5" /><circle cx="230" cy="265" r="3.5" /><circle cx="250" cy="280" r="3.5" />
          
          {/* Greenland & Arctic */}
          <circle cx="340" cy="70" r="3.5" /><circle cx="360" cy="65" r="3.5" /><circle cx="380" cy="75" r="3.5" /><circle cx="400" cy="70" r="3.5" />
          <circle cx="330" cy="90" r="3.5" /><circle cx="350" cy="85" r="3.5" /><circle cx="370" cy="95" r="3.5" />

          {/* South America */}
          <circle cx="280" cy="310" r="3.5" /><circle cx="300" cy="300" r="3.5" /><circle cx="320" cy="315" r="3.5" />
          <circle cx="270" cy="330" r="3.5" /><circle cx="290" cy="325" r="3.5" /><circle cx="310" cy="335" r="3.5" /><circle cx="330" cy="345" r="3.5" />
          <circle cx="280" cy="355" r="3.5" /><circle cx="300" cy="350" r="3.5" /><circle cx="320" cy="365" r="3.5" /><circle cx="340" cy="370" r="3.5" />
          <circle cx="290" cy="380" r="3.5" /><circle cx="310" cy="385" r="3.5" /><circle cx="330" cy="395" r="3.5" />
          <circle cx="300" cy="410" r="3.5" /><circle cx="320" cy="420" r="3.5" />
          <circle cx="310" cy="440" r="3.5" />

          {/* Europe */}
          <circle cx="480" cy="130" r="3.5" /><circle cx="500" cy="120" r="3.5" /><circle cx="520" cy="115" r="3.5" /><circle cx="540" cy="125" r="3.5" />
          <circle cx="470" cy="150" r="3.5" /><circle cx="490" cy="140" r="3.5" /><circle cx="510" cy="135" r="3.5" /><circle cx="530" cy="145" r="3.5" /><circle cx="550" cy="130" r="3.5" /><circle cx="570" cy="120" r="3.5" />
          <circle cx="480" cy="170" r="3.5" /><circle cx="500" cy="160" r="3.5" /><circle cx="520" cy="155" r="3.5" /><circle cx="540" cy="165" r="3.5" /><circle cx="560" cy="150" r="3.5" /><circle cx="580" cy="140" r="3.5" />

          {/* Africa */}
          <circle cx="480" cy="220" r="3.5" /><circle cx="500" cy="210" r="3.5" /><circle cx="520" cy="205" r="3.5" /><circle cx="540" cy="215" r="3.5" /><circle cx="560" cy="225" r="3.5" />
          <circle cx="470" cy="245" r="3.5" /><circle cx="490" cy="235" r="3.5" /><circle cx="510" cy="230" r="3.5" /><circle cx="530" cy="240" r="3.5" /><circle cx="550" cy="250" r="3.5" /><circle cx="570" cy="260" r="3.5" />
          <circle cx="490" cy="270" r="3.5" /><circle cx="510" cy="265" r="3.5" /><circle cx="530" cy="275" r="3.5" /><circle cx="550" cy="285" r="3.5" /><circle cx="570" cy="295" r="3.5" />
          <circle cx="500" cy="300" r="3.5" /><circle cx="520" cy="295" r="3.5" /><circle cx="540" cy="310" r="3.5" /><circle cx="560" cy="320" r="3.5" />
          <circle cx="510" cy="330" r="3.5" /><circle cx="530" cy="335" r="3.5" /><circle cx="550" cy="345" r="3.5" />
          <circle cx="520" cy="365" r="3.5" /><circle cx="540" cy="370" r="3.5" />

          {/* Asia / Eurasia */}
          <circle cx="600" cy="115" r="3.5" /><circle cx="620" cy="110" r="3.5" /><circle cx="640" cy="105" r="3.5" /><circle cx="660" cy="115" r="3.5" /><circle cx="680" cy="120" r="3.5" /><circle cx="700" cy="110" r="3.5" /><circle cx="720" cy="115" r="3.5" /><circle cx="740" cy="125" r="3.5" />
          <circle cx="590" cy="135" r="3.5" /><circle cx="610" cy="130" r="3.5" /><circle cx="630" cy="125" r="3.5" /><circle cx="650" cy="135" r="3.5" /><circle cx="670" cy="140" r="3.5" /><circle cx="690" cy="130" r="3.5" /><circle cx="710" cy="135" r="3.5" /><circle cx="730" cy="145" r="3.5" /><circle cx="750" cy="155" r="3.5" />
          <circle cx="600" cy="160" r="3.5" /><circle cx="620" cy="155" r="3.5" /><circle cx="640" cy="150" r="3.5" /><circle cx="660" cy="160" r="3.5" /><circle cx="680" cy="165" r="3.5" /><circle cx="700" cy="155" r="3.5" /><circle cx="720" cy="160" r="3.5" /><circle cx="740" cy="170" r="3.5" /><circle cx="760" cy="180" r="3.5" /><circle cx="780" cy="190" r="3.5" />
          <circle cx="610" cy="185" r="3.5" /><circle cx="630" cy="180" r="3.5" /><circle cx="650" cy="175" r="3.5" /><circle cx="670" cy="185" r="3.5" /><circle cx="690" cy="190" r="3.5" /><circle cx="710" cy="180" r="3.5" /><circle cx="730" cy="185" r="3.5" /><circle cx="750" cy="195" r="3.5" /><circle cx="770" cy="205" r="3.5" /><circle cx="790" cy="215" r="3.5" />
          
          {/* India Subcontinent */}
          <circle cx="660" cy="210" r="3.5" /><circle cx="680" cy="205" r="3.5" /><circle cx="700" cy="210" r="3.5" /><circle cx="720" cy="220" r="3.5" />
          <circle cx="670" cy="235" r="3.5" /><circle cx="690" cy="230" r="3.5" /><circle cx="710" cy="240" r="3.5" />
          <circle cx="675" cy="255" r="3.5" /><circle cx="685" cy="260" r="3.5" /><circle cx="695" cy="255" r="3.5" />
          <circle cx="680" cy="280" r="3.5" />

          {/* South East Asia & East Asia */}
          <circle cx="740" cy="220" r="3.5" /><circle cx="760" cy="230" r="3.5" /><circle cx="780" cy="240" r="3.5" /><circle cx="800" cy="230" r="3.5" /><circle cx="820" cy="220" r="3.5" />
          <circle cx="750" cy="250" r="3.5" /><circle cx="770" cy="260" r="3.5" /><circle cx="790" cy="270" r="3.5" /><circle cx="810" cy="265" r="3.5" /><circle cx="830" cy="250" r="3.5" />
          <circle cx="760" cy="285" r="3.5" /><circle cx="780" cy="295" r="3.5" /><circle cx="800" cy="305" r="3.5" />

          {/* Australia & Oceania */}
          <circle cx="800" cy="350" r="3.5" /><circle cx="820" cy="340" r="3.5" /><circle cx="840" cy="345" r="3.5" /><circle cx="860" cy="355" r="3.5" />
          <circle cx="790" cy="370" r="3.5" /><circle cx="810" cy="365" r="3.5" /><circle cx="830" cy="370" r="3.5" /><circle cx="850" cy="380" r="3.5" /><circle cx="870" cy="375" r="3.5" />
          <circle cx="800" cy="395" r="3.5" /><circle cx="820" cy="390" r="3.5" /><circle cx="840" cy="395" r="3.5" /><circle cx="860" cy="405" r="3.5" />
          <circle cx="810" cy="420" r="3.5" /><circle cx="830" cy="415" r="3.5" /><circle cx="850" cy="425" r="3.5" />
        </g>

        {/* ── Layer 3: Radar Pulse Rings Over India (x=685, y=245) ── */}
        <g opacity="0.85">
          <circle
            cx="685"
            cy="245"
            r="14"
            fill="none"
            stroke="#CD0000"
            strokeWidth="1.5"
            className="radar-ring"
          />
          <circle
            cx="685"
            cy="245"
            r="14"
            fill="none"
            stroke="#CD0000"
            strokeWidth="1.5"
            className="radar-ring radar-ring-delayed"
          />
        </g>

        {/* ── Layer 2: Cherry Red (#CD0000) Location Marker Over India ── */}
        <g transform="translate(685, 245)" opacity="0.9">
          {/* Ambient Glow */}
          <circle cx="0" cy="0" r="12" fill="#CD0000" opacity="0.35" className="filter blur-[3px]" />
          {/* Inner Glow Core */}
          <circle cx="0" cy="0" r="5.5" fill="#CD0000" />
          <circle cx="0" cy="0" r="2.2" fill="#FFFFFF" />
        </g>
      </svg>
    </div>
  );
};

export default WorldMapDecor;
