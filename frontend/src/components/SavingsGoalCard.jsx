import React, { useState } from 'react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { PiggyBank, Calendar, Clock, PlusCircle, CheckCircle2, Trash2, Edit2 } from 'lucide-react';

const SavingsGoalCard = ({ goal, onContribute, onEdit, onDelete }) => {
  const [depositAmount, setDepositAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);

  const handleDepositSubmit = (e) => {
    e.preventDefault();
    if (!depositAmount || Number(depositAmount) <= 0) return;
    onContribute(goal.id, Number(depositAmount));
    setDepositAmount('');
    setIsDepositing(false);
  };

  const isCompleted = goal.is_completed || goal.current_amount >= goal.target_amount;

  return (
    <div className="bg-white/90 border border-slate-200/90 rounded-2xl p-5 shadow-soft card-hover flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs ${
                isCompleted
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  : 'bg-brand-50 text-brand-600 border-brand-100'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <PiggyBank className="w-5 h-5" />
              )}
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 leading-snug">{goal.name}</h4>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Target: {formatDate(goal.target_date)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={() => onEdit(goal)}
                className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-slate-50"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(goal.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Progress Display */}
        <div className="my-4">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-xl font-extrabold text-slate-900 font-display">
              {formatCurrency(goal.current_amount)}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              of {formatCurrency(goal.target_amount)}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCompleted
                  ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                  : 'bg-gradient-to-r from-brand-500 to-indigo-600'
              }`}
              style={{ width: `${Math.min(100, goal.progress_percentage || 0)}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-xs mt-1.5 font-medium">
            <span className={isCompleted ? 'text-emerald-600 font-semibold' : 'text-brand-600'}>
              {goal.progress_percentage}% Saved
            </span>
            <span className="text-slate-500">
              {isCompleted ? 'Completed! 🥳' : `${formatCurrency(goal.remaining_amount)} to go`}
            </span>
          </div>
        </div>

        {/* Breakdown Targets (Prompt 20) */}
        {!isCompleted && (
          <div className="grid grid-cols-3 gap-2 bg-slate-50/80 rounded-xl p-2.5 border border-slate-100 text-center my-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-600 block">Days Left</span>
              <span className="text-xs font-bold text-slate-800 font-display">
                {goal.days_remaining}d
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-600 block">Per Week</span>
              <span className="text-xs font-bold text-slate-800 font-display">
                {formatCurrency(goal.required_weekly_saving, 'INR', 0)}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-600 block">Per Month</span>
              <span className="text-xs font-bold text-slate-800 font-display">
                {formatCurrency(goal.required_monthly_saving, 'INR', 0)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Deposit Actions */}
      <div className="mt-2 pt-3 border-t border-slate-100">
        {!isDepositing ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDepositing(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-brand-50 text-brand-600 hover:bg-brand-100 text-xs font-semibold transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Money to Goal</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleDepositSubmit} className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              step="any"
              placeholder="Amount (₹)"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              autoFocus
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-brand-600 text-white rounded-xl text-xs font-semibold hover:bg-brand-700 shrink-0"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsDepositing(false)}
              className="px-2 py-1.5 text-slate-400 hover:text-slate-600 text-xs"
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SavingsGoalCard;
