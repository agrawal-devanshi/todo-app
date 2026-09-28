import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, PlusCircle } from 'lucide-react';

const EmptyState = ({
  icon: Icon = Sparkles,
  title = 'Nothing here yet!',
  message = 'Get started by creating your first entry. Taking control of your money starts with a single step.',
  actionText,
  actionLink,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white/70 border border-slate-200/80 rounded-3xl shadow-soft my-4">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 mb-4 shadow-sm">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2 font-display">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">{message}</p>

      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-medium text-sm shadow-md hover:shadow-lg hover:from-brand-700 hover:to-brand-600 transition-all duration-200 hover:-translate-y-0.5"
        >
          <PlusCircle className="w-4 h-4" />
          {actionText}
        </Link>
      )}

      {actionText && onAction && !actionLink && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-medium text-sm shadow-md hover:shadow-lg hover:from-brand-700 hover:to-brand-600 transition-all duration-200 hover:-translate-y-0.5"
        >
          <PlusCircle className="w-4 h-4" />
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
