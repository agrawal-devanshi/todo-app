import React from 'react';
import { formatCurrency, formatDate, CATEGORY_CONFIG } from '../utils/formatters';
import { Edit2, Trash2, CheckCircle2, XCircle, CreditCard } from 'lucide-react';

const ExpenseCard = ({ expense, onEdit, onDelete }) => {
  const categoryMeta = CATEGORY_CONFIG[expense.category] || CATEGORY_CONFIG.Other;

  return (
    <div className="bg-white/90 border border-slate-200/90 rounded-2xl p-4 shadow-soft card-hover flex items-center justify-between gap-4">
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-xs"
          style={{
            backgroundColor: `${categoryMeta.color}15`,
            borderColor: `${categoryMeta.color}30`,
            color: categoryMeta.color,
          }}
        >
          <span className="font-bold text-sm">{expense.category.charAt(0)}</span>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="text-sm font-bold text-slate-800 truncate">
              {expense.description || expense.category}
            </h4>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span
              className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
              style={{
                backgroundColor: `${categoryMeta.color}15`,
                color: categoryMeta.color,
              }}
            >
              {expense.category}
            </span>

            <span>•</span>
            <span>{formatDate(expense.expense_date)}</span>

            <span>•</span>
            <span className="flex items-center gap-1 text-slate-400">
              <CreditCard className="w-3 h-3" />
              {expense.payment_method}
            </span>

            <span>•</span>
            <span
              className={`flex items-center gap-1 text-[11px] font-medium ${
                expense.is_necessary ? 'text-emerald-600' : 'text-rose-500'
              }`}
            >
              {expense.is_necessary ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  Need
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3" />
                  Want
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <span className="text-base font-extrabold text-slate-900 font-display block">
            {formatCurrency(expense.amount)}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              onClick={() => onEdit(expense)}
              className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="Edit Expense"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(expense.id)}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
              title="Delete Expense"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseCard;
