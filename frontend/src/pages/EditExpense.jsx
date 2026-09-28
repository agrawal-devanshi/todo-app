import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { expenseApi } from '../services/api';
import ExpenseForm from '../components/ExpenseForm';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { ArrowLeft } from 'lucide-react';

const EditExpense = () => {
  const { id } = useParams();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await expenseApi.getById(id);
        setExpense(res.data.data.expense);
      } catch (err) {
        console.error('Failed to fetch expense:', err);
        setError('Expense not found or unauthorized.');
      } finally {
        setLoading(false);
      }
    };

    fetchExpense();
  }, [id]);

  const handleUpdateExpense = async (formData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await expenseApi.update(id, formData);
      navigate('/expenses');
    } catch (err) {
      console.error('Failed to update expense:', err);
      setError(err.response?.data?.message || 'Failed to update expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Fetching expense details..." />;
  }

  if (error || !expense) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <EmptyState
          title="Expense not found"
          message={error || 'Unable to retrieve this expense.'}
          actionText="Back to Expenses"
          actionLink="/expenses"
        />
      </div>
    );
  }

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
          Edit Expense
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Update the details of this transaction.
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
          initialData={expense}
          onSubmit={handleUpdateExpense}
          isSubmitting={isSubmitting}
          submitButtonText="Update Expense"
        />
      </div>
    </div>
  );
};

export default EditExpense;
