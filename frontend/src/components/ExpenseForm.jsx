import React, { useState, useEffect } from 'react';
import { CATEGORIES_LIST, PAYMENT_METHODS, CATEGORY_CONFIG } from '../utils/formatters';
import { IndianRupee, Calendar, Tag, CreditCard, FileText, CheckCircle2, HelpCircle } from 'lucide-react';

const ExpenseForm = ({
  initialData = null,
  onSubmit,
  isSubmitting = false,
  submitButtonText = 'Save Expense',
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Food',
    description: '',
    expense_date: new Date().toISOString().split('T')[0],
    payment_method: 'UPI',
    is_necessary: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        amount: initialData.amount || '',
        category: initialData.category || 'Food',
        description: initialData.description || '',
        expense_date: initialData.expense_date
          ? new Date(initialData.expense_date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        payment_method: initialData.payment_method || 'UPI',
        is_necessary: initialData.is_necessary !== undefined ? initialData.is_necessary : true,
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors = {};

    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter an amount greater than 0';
    }

    if (!formData.category) {
      newErrors.category = 'Please choose a category';
    }

    if (!formData.expense_date) {
      newErrors.expense_date = 'Please select a date';
    }

    if (formData.description && formData.description.length > 255) {
      newErrors.description = 'Description cannot exceed 255 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...formData,
      amount: Number(formData.amount),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Amount Input */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Amount (₹) *
        </label>
        <div className="relative rounded-2xl shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <IndianRupee className="w-5 h-5 text-brand-600" />
          </div>
          <input
            type="number"
            step="any"
            min="0.01"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className={`block w-full pl-12 pr-4 py-3.5 text-2xl font-extrabold font-display bg-white border ${
              errors.amount ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-brand-500'
            } rounded-2xl text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2`}
            required
            autoFocus
          />
        </div>
        {errors.amount && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.amount}</p>}
      </div>

      {/* Category Selection Chips */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Category *
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {CATEGORIES_LIST.map((cat) => {
            const isSelected = formData.category === cat;
            const meta = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.Other;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setFormData({ ...formData, category: cat })}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  isSelected
                    ? 'border-brand-500 bg-brand-500 text-white shadow-md shadow-brand-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: isSelected ? '#ffffff' : meta.color }}
                ></span>
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
        {errors.category && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.category}</p>}
      </div>

      {/* Description / Note */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Description / Note
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 pt-3 pointer-events-none text-slate-400">
            <FileText className="w-4 h-4" />
          </div>
          <textarea
            rows="2"
            placeholder="e.g. Science textbooks, pizza with friends, bus pass..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="block w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
        </div>
        {errors.description && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.description}</p>}
      </div>

      {/* Date & Payment Method Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Date */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Date *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Calendar className="w-4 h-4" />
            </div>
            <input
              type="date"
              value={formData.expense_date}
              onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
              className="block w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>
          {errors.expense_date && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.expense_date}</p>}
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Payment Method
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <CreditCard className="w-4 h-4" />
            </div>
            <select
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              className="block w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
            >
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm} value={pm}>
                  {pm}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Necessary vs Discretionary Toggle */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Expense Type: Need vs. Want
            </span>
            <p className="text-xs text-slate-500">
              Helps you track essential spending versus discretionary fun money.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, is_necessary: true })}
            className={`py-3 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              formData.is_necessary
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Essential / Need</span>
          </button>

          <button
            type="button"
            onClick={() => setFormData({ ...formData, is_necessary: false })}
            className={`py-3 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              !formData.is_necessary
                ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>Discretionary / Want</span>
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-500 text-white font-bold text-base shadow-lg shadow-brand-500/25 hover:shadow-xl hover:from-brand-700 hover:to-brand-600 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Saving Expense...' : submitButtonText}
      </button>
    </form>
  );
};

export default ExpenseForm;
