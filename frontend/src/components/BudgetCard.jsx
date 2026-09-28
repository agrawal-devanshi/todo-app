import React from 'react';
import { formatCurrency } from '../utils/formatters';
import BudgetProgress from './BudgetProgress';
import { Target, Trash2, Edit2 } from 'lucide-react';

const BudgetCard = ({
  category = 'Overall',
  budget = 0,
  spent = 0,
  remaining = 0,
  percentage = 0,
  onEdit,
  onDelete,
}) => {
  const isOver = remaining < 0;

  return (
    <div className="bg-white/90 border border-slate-200/90 rounded-2xl p-5 shadow-soft card-hover flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-100">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">{category} Budget</h4>
              <p className="text-xs text-slate-500">Monthly Target</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={onEdit}
                title="Edit Budget"
                className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && category !== 'Overall' && (
              <button
                onClick={onDelete}
                title="Delete Budget"
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Budget Numbers */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-0.5">
              Budget Limit
            </span>
            <span className="text-base font-bold text-slate-800 font-display">
              {formatCurrency(budget)}
            </span>
          </div>

          <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-0.5">
              Actual Spent
            </span>
            <span className="text-base font-bold text-slate-800 font-display">
              {formatCurrency(spent)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <BudgetProgress spent={spent} budget={budget} percentage={percentage} />
        </div>
      </div>

      {/* Remaining Banner */}
      <div
        className={`mt-2 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium`}
      >
        <span className="text-slate-500">
          {isOver ? 'Exceeded by:' : 'Remaining to spend:'}
        </span>
        <span
          className={`font-bold ${
            isOver ? 'text-rose-600 font-display' : 'text-emerald-600 font-display'
          }`}
        >
          {formatCurrency(Math.abs(remaining))}
        </span>
      </div>
    </div>
  );
};

export default BudgetCard;
