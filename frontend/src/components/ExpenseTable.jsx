import React from 'react';
import { formatCurrency, formatDate, CATEGORY_CONFIG } from '../utils/formatters';
import { Edit2, Trash2, ArrowUpDown, CheckCircle2, XCircle } from 'lucide-react';

const ExpenseTable = ({
  expenses = [],
  sortBy,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
}) => {
  const renderSortIndicator = (column) => {
    if (sortBy !== column) return <ArrowUpDown className="w-3.5 h-3.5 opacity-40 ml-1 inline" />;
    return (
      <span className="ml-1 text-brand-600 font-bold">
        {sortOrder === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto w-full rounded-2xl border border-slate-200/90 bg-white/90 shadow-soft">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50/90 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <th
              onClick={() => onSort && onSort('expense_date')}
              className="py-3.5 px-4 cursor-pointer hover:text-brand-600 transition-colors select-none"
            >
              Date {renderSortIndicator('expense_date')}
            </th>
            <th className="py-3.5 px-4">Description</th>
            <th
              onClick={() => onSort && onSort('category')}
              className="py-3.5 px-4 cursor-pointer hover:text-brand-600 transition-colors select-none"
            >
              Category {renderSortIndicator('category')}
            </th>
            <th
              onClick={() => onSort && onSort('amount')}
              className="py-3.5 px-4 text-right cursor-pointer hover:text-brand-600 transition-colors select-none"
            >
              Amount {renderSortIndicator('amount')}
            </th>
            <th className="py-3.5 px-4">Payment</th>
            <th className="py-3.5 px-4 text-center">Type</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700">
          {expenses.map((expense) => {
            const categoryMeta = CATEGORY_CONFIG[expense.category] || CATEGORY_CONFIG.Other;

            return (
              <tr
                key={expense.id}
                className="hover:bg-slate-50/70 transition-colors group"
              >
                <td className="py-3.5 px-4 font-medium text-slate-600 whitespace-nowrap">
                  {formatDate(expense.expense_date)}
                </td>

                <td className="py-3.5 px-4 font-medium text-slate-900 max-w-xs truncate">
                  {expense.description || <span className="text-slate-400 italic">No note</span>}
                </td>

                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: `${categoryMeta.color}15`,
                      color: categoryMeta.color,
                    }}
                  >
                    {expense.category}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 font-display whitespace-nowrap">
                  {formatCurrency(expense.amount)}
                </td>

                <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 font-medium">
                    {expense.payment_method}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      expense.is_necessary
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {expense.is_necessary ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Need
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 text-rose-500" />
                        Want
                      </>
                    )}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(expense)}
                        title="Edit Expense"
                        className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(expense.id)}
                        title="Delete Expense"
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseTable;
