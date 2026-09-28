import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { expenseApi } from '../services/api';
import ExpenseForm from '../components/ExpenseForm';
import { ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';

const AddExpense = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleCreateExpense = async (formData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await expenseApi.create(formData);
      navigate('/expenses');
    } catch (err) {
      console.error('Failed to create expense:', err);
      setError(err.response?.data?.message || 'Failed to save expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Back button */}
      <div>
        <Link
          to="/expenses"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Expenses</span>
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
          Add New Expense
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Log every purchase to stay on top of your pocket money and savings goals.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white/95 border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-soft">
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <ExpenseForm
          onSubmit={handleCreateExpense}
          isSubmitting={isSubmitting}
          submitButtonText="Add Expense"
        />
      </div>
    </div>
  );
};

export default AddExpense;
