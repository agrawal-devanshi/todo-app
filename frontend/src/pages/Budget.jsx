import React, { useState, useEffect } from 'react';
import { budgetApi, analyticsApi } from '../services/api';
import { CATEGORIES_LIST, formatCurrency } from '../utils/formatters';
import BudgetCard from '../components/BudgetCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { Plus, Target, Calendar, Check, AlertCircle } from 'lucide-react';

const Budget = () => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form modal state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Overall',
    amount: '',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBudgetData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await budgetApi.getSummary({ month: selectedMonth, year: selectedYear });
      setComparisonData(res.data.data.comparison || []);
    } catch (err) {
      console.error('Failed to load budgets:', err);
      setError('Unable to load budget data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetData();
  }, [selectedMonth, selectedYear]);

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      setFormError('Please enter a budget amount greater than 0.');
      return;
    }

    try {
      setIsSubmitting(true);
      await budgetApi.setBudget({
        category: formData.category,
        amount: Number(formData.amount),
        month: selectedMonth,
        year: selectedYear,
      });

      setShowModal(false);
      setFormData({ category: 'Overall', amount: '' });
      fetchBudgetData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save budget.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBudget = async (id) => {
    if (!window.confirm('Are you sure you want to remove this category budget?')) return;
    try {
      await budgetApi.deleteBudget(id);
      fetchBudgetData();
    } catch (err) {
      alert('Failed to delete budget: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleOpenEdit = (item) => {
    setFormData({
      category: item.category,
      amount: item.budget,
    });
    setShowModal(true);
  };

  const overallBudget = comparisonData.find((b) => b.category === 'Overall');
  const categoryBudgets = comparisonData.filter((b) => b.category !== 'Overall');

  const monthsList = [
    { num: 1, name: 'January' },
    { num: 2, name: 'February' },
    { num: 3, name: 'March' },
    { num: 4, name: 'April' },
    { num: 5, name: 'May' },
    { num: 6, name: 'June' },
    { num: 7, name: 'July' },
    { num: 8, name: 'August' },
    { num: 9, name: 'September' },
    { num: 10, name: 'October' },
    { num: 11, name: 'November' },
    { num: 12, name: 'December' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Budget Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Set spending targets, avoid surprises, and track your pace with safe thresholds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month & Year Selectors */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200/90 shadow-xs">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
              className="px-2.5 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
            >
              {monthsList.map((m) => (
                <option key={m.num} value={m.num}>
                  {m.name}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="px-2.5 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Add / Set Budget Button */}
          <button
            onClick={() => {
              setFormData({ category: 'Overall', amount: '' });
              setShowModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-brand-600 text-white font-bold text-xs sm:text-sm shadow-md hover:bg-brand-700 transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Set Budget</span>
          </button>
        </div>
      </div>

      {/* Threshold Guide */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-bold text-slate-700">Health Indicator Thresholds:</span>
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> 0–69% Safe
          </span>
          <span className="flex items-center gap-1.5 text-amber-700 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> 70–84% Warning
          </span>
          <span className="flex items-center gap-1.5 text-orange-700 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> 85–99% Critical
          </span>
          <span className="flex items-center gap-1.5 text-rose-700 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span> 100%+ Limit Reached
          </span>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading your budgets..." />
      ) : error ? (
        <EmptyState
          title="Could not load budgets"
          message={error}
          actionText="Try Again"
          onAction={fetchBudgetData}
        />
      ) : comparisonData.length === 0 ? (
        <EmptyState
          title="No budgets set for this month"
          message="Set an Overall monthly budget or category-specific targets to take control of your spending."
          actionText="Set Overall Budget"
          onAction={() => {
            setFormData({ category: 'Overall', amount: '10000' });
            setShowModal(true);
          }}
        />
      ) : (
        <div className="space-y-6">
          {/* Overall Monthly Budget Featured Card */}
          {overallBudget && (
            <div>
              <h3 className="text-base font-bold text-slate-800 mb-3">Overall Monthly Target</h3>
              <div className="max-w-xl">
                <BudgetCard
                  category="Overall"
                  budget={overallBudget.budget}
                  spent={overallBudget.actual}
                  remaining={overallBudget.remaining}
                  percentage={overallBudget.percentage}
                  onEdit={() => handleOpenEdit(overallBudget)}
                />
              </div>
            </div>
          )}

          {/* Category Budgets Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-800">Category Budgets</h3>
              <button
                onClick={() => {
                  setFormData({ category: 'Food', amount: '' });
                  setShowModal(true);
                }}
                className="text-xs font-bold text-brand-600 hover:text-brand-700"
              >
                + Add Category Budget
              </button>
            </div>

            {categoryBudgets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryBudgets.map((b) => (
                  <BudgetCard
                    key={b.id || b.category}
                    category={b.category}
                    budget={b.budget}
                    spent={b.actual}
                    remaining={b.remaining}
                    percentage={b.percentage}
                    onEdit={() => handleOpenEdit(b)}
                    onDelete={() => handleDeleteBudget(b.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="p-6 bg-white/70 border border-slate-200/80 rounded-2xl text-center">
                <p className="text-xs text-slate-500 mb-2">No category-specific budgets set yet.</p>
                <button
                  onClick={() => {
                    setFormData({ category: 'Food', amount: '2500' });
                    setShowModal(true);
                  }}
                  className="text-xs font-bold text-brand-600 hover:underline"
                >
                  Create your first category budget
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Set / Edit Budget Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 font-display mb-1">
              Set Budget Target
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              for {monthsList.find((m) => m.num === selectedMonth)?.name} {selectedYear}
            </p>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="block w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Overall">Overall (Total Monthly Limit)</option>
                  {CATEGORIES_LIST.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Target Amount (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  placeholder="e.g. 5000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="block w-full px-3.5 py-2.5 text-lg font-bold font-display bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-brand-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Target'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budget;
