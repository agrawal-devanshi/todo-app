import React, { useState, useEffect } from 'react';
import { savingsApi } from '../services/api';
import SavingsGoalCard from '../components/SavingsGoalCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { Plus, PiggyBank, Sparkles, AlertCircle } from 'lucide-react';

const SavingsGoals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    current_amount: '0',
    target_date: '',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await savingsApi.getGoals();
      setGoals(res.data.data.goals || []);
    } catch (err) {
      console.error('Failed to load savings goals:', err);
      setError('Unable to load your savings goals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleOpenCreate = () => {
    setEditingGoal(null);
    const defaultDate = new Date();
    defaultDate.setMonth(defaultDate.getMonth() + 3);
    setFormData({
      name: '',
      target_amount: '',
      current_amount: '0',
      target_date: defaultDate.toISOString().split('T')[0],
    });
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      target_amount: goal.target_amount,
      current_amount: goal.current_amount,
      target_date: goal.target_date
        ? new Date(goal.target_date).toISOString().split('T')[0]
        : '',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Goal name is required.');
      return;
    }

    if (!formData.target_amount || Number(formData.target_amount) <= 0) {
      setFormError('Target amount must be greater than 0.');
      return;
    }

    if (!formData.target_date) {
      setFormError('Please select a target completion date.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingGoal) {
        await savingsApi.updateGoal(editingGoal.id, {
          name: formData.name,
          target_amount: Number(formData.target_amount),
          current_amount: Number(formData.current_amount) || 0,
          target_date: formData.target_date,
        });
      } else {
        await savingsApi.createGoal({
          name: formData.name,
          target_amount: Number(formData.target_amount),
          current_amount: Number(formData.current_amount) || 0,
          target_date: formData.target_date,
        });
      }

      setShowModal(false);
      fetchGoals();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save savings goal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContribute = async (goalId, amount) => {
    try {
      await savingsApi.addContribution(goalId, amount);
      fetchGoals();
    } catch (err) {
      alert('Failed to add contribution: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this savings goal?')) return;
    try {
      await savingsApi.deleteGoal(goalId);
      fetchGoals();
    } catch (err) {
      alert('Failed to delete goal: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Savings Goals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Dream big, save consistently, and watch your targets come to life.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-brand-600 text-white font-bold text-xs sm:text-sm shadow-md hover:bg-brand-700 transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Savings Goal</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading your savings goals..." />
      ) : error ? (
        <EmptyState
          title="Could not load goals"
          message={error}
          actionText="Try Again"
          onAction={fetchGoals}
        />
      ) : goals.length === 0 ? (
        <EmptyState
          icon={PiggyBank}
          title="No savings goals yet"
          message="Whether it's headphones, a gaming console, or an emergency fund, setting a goal makes saving exciting."
          actionText="Create Your First Goal"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((goal) => (
            <SavingsGoalCard
              key={goal.id}
              goal={goal}
              onContribute={handleContribute}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteGoal}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 font-display mb-1">
              {editingGoal ? 'Edit Savings Goal' : 'Create New Savings Goal'}
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Set your target item, cost, and deadline.
            </p>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Goal Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Noise Cancelling Headphones"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="block w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Target (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    placeholder="8000"
                    value={formData.target_amount}
                    onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                    className="block w-full px-3.5 py-2.5 text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Saved so far (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0"
                    value={formData.current_amount}
                    onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
                    className="block w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Target Date *
                </label>
                <input
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  className="block w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
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
                  {isSubmitting ? 'Saving...' : editingGoal ? 'Update Goal' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavingsGoals;
