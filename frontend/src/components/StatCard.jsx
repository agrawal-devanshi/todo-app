import React from 'react';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'brand',
  onClick,
}) => {
  const colorStyles = {
    brand: {
      bg: 'bg-brand-50 text-brand-600 border-brand-100',
      badge: 'bg-brand-100/70 text-brand-700',
      border: 'hover:border-brand-300',
      gradient: 'from-brand-500/10 to-transparent',
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      badge: 'bg-emerald-100/70 text-emerald-700',
      border: 'hover:border-emerald-300',
      gradient: 'from-emerald-500/10 to-transparent',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600 border-amber-100',
      badge: 'bg-amber-100/70 text-amber-700',
      border: 'hover:border-amber-300',
      gradient: 'from-amber-500/10 to-transparent',
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600 border-rose-100',
      badge: 'bg-rose-100/70 text-rose-700',
      border: 'hover:border-rose-300',
      gradient: 'from-rose-500/10 to-transparent',
    },
    violet: {
      bg: 'bg-purple-50 text-purple-600 border-purple-100',
      badge: 'bg-purple-100/70 text-purple-700',
      border: 'hover:border-purple-300',
      gradient: 'from-purple-500/10 to-transparent',
    },
  };

  const style = colorStyles[color] || colorStyles.brand;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden bg-white/90 border border-slate-200/90 rounded-2xl p-5 shadow-soft card-hover ${style.border} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${style.gradient} rounded-full blur-2xl pointer-events-none -mr-8 -mt-8`}></div>

      <div className="flex items-start justify-between relative z-10 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs ${style.bg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="relative z-10">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display mb-1">
          {value}
        </h3>

        {subtitle && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${style.badge}`}>
              {subtitle}
            </span>
            {trend && <span className="text-xs text-slate-400">{trend}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
