import React from 'react';
import { Users, Clock, CheckCircle2, Award, XCircle, ArrowUpRight } from 'lucide-react';

interface StatsProps {
  total: number;
  pending: number;
  shortlisted: number;
  selected: number;
  rejected: number;
  activeStatusFilter: string;
  onSelectFilter: (status: string) => void;
}

export const DashboardStats: React.FC<StatsProps> = ({
  total,
  pending,
  shortlisted,
  selected,
  rejected,
  activeStatusFilter,
  onSelectFilter,
}) => {
  const getPercentage = (count: number) => {
    if (total === 0) return '0%';
    return `${Math.round((count / total) * 100)}%`;
  };

  const cards = [
    {
      id: 'all',
      label: 'Total Applicants',
      count: total,
      percentage: '100%',
      icon: Users,
      iconBg: 'bg-slate-100 text-slate-800',
      badgeBg: 'bg-slate-100 text-slate-700',
      accentColor: 'border-slate-300',
    },
    {
      id: 'pending',
      label: 'Pending Review',
      count: pending,
      percentage: getPercentage(pending),
      icon: Clock,
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-200/60',
      badgeBg: 'bg-amber-50 text-amber-700 border border-amber-200/60',
      accentColor: 'border-amber-400',
    },
    {
      id: 'shortlisted',
      label: 'Shortlisted',
      count: shortlisted,
      percentage: getPercentage(shortlisted),
      icon: CheckCircle2,
      iconBg: 'bg-blue-50 text-blue-600 border border-blue-200/60',
      badgeBg: 'bg-blue-50 text-blue-700 border border-blue-200/60',
      accentColor: 'border-blue-400',
    },
    {
      id: 'selected',
      label: 'Selected',
      count: selected,
      percentage: getPercentage(selected),
      icon: Award,
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60',
      badgeBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
      accentColor: 'border-emerald-400',
    },
    {
      id: 'rejected',
      label: 'Rejected',
      count: rejected,
      percentage: getPercentage(rejected),
      icon: XCircle,
      iconBg: 'bg-rose-50 text-rose-600 border border-rose-200/60',
      badgeBg: 'bg-rose-50 text-rose-700 border border-rose-200/60',
      accentColor: 'border-rose-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {cards.map((card) => {
        const IconComponent = card.icon;
        const isActive = activeStatusFilter === card.id;

        return (
          <button
            key={card.id}
            onClick={() => onSelectFilter(card.id)}
            className={`relative text-left bg-white border rounded-2xl p-4 transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer ${
              isActive
                ? 'ring-2 ring-[#CD0000] border-[#CD0000] shadow-sm'
                : 'border-slate-200/80 hover:border-slate-300'
            }`}
          >
            {/* Top Row: Icon & Percentage Badge */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className={`p-2 rounded-xl transition-transform duration-200 group-hover:scale-105 ${card.iconBg}`}>
                <IconComponent size={18} />
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide ${card.badgeBg}`}>
                {card.percentage}
              </span>
            </div>

            {/* Label & Numeric Count */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                {card.label}
              </p>
              <div className="flex items-baseline justify-between">
                <h3 className="text-2xl font-black font-grotesk tracking-tight text-slate-900">
                  {card.count.toLocaleString()}
                </h3>
                <ArrowUpRight size={14} className="text-slate-300 hover:text-slate-500 transition-colors" />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
