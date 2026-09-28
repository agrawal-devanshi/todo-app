import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Lightbulb,
  Sparkles,
  TrendingUp,
  PiggyBank,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

const RecommendationCard = ({ recommendation }) => {
  const { type, severity, title, message, actionText, actionLink } = recommendation;

  const severityStyles = {
    high: {
      border: 'border-rose-200 bg-rose-50/50',
      badge: 'bg-rose-100 text-rose-700',
      iconBg: 'bg-rose-100 text-rose-600',
      icon: AlertTriangle,
    },
    medium: {
      border: 'border-amber-200 bg-amber-50/40',
      badge: 'bg-amber-100 text-amber-700',
      iconBg: 'bg-amber-100 text-amber-600',
      icon: Lightbulb,
    },
    low: {
      border: 'border-emerald-200 bg-emerald-50/40',
      badge: 'bg-emerald-100 text-emerald-700',
      iconBg: 'bg-emerald-100 text-emerald-600',
      icon: Sparkles,
    },
    info: {
      border: 'border-brand-200 bg-brand-50/40',
      badge: 'bg-brand-100 text-brand-700',
      iconBg: 'bg-brand-100 text-brand-600',
      icon: PiggyBank,
    },
  };

  const style = severityStyles[severity] || severityStyles.info;
  const IconComponent = style.icon;

  return (
    <div
      className={`border rounded-2xl p-4 sm:p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 ${style.border}`}
    >
      <div className="flex items-start gap-3.5">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${style.iconBg}`}>
          <IconComponent className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="text-sm font-bold text-slate-800">{title}</h4>
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${style.badge}`}>
              {type ? type.replace(/_/g, ' ') : 'Tip'}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3">
            {message}
          </p>

          {actionText && actionLink && (
            <Link
              to={actionLink}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 group"
            >
              <span>{actionText}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;
