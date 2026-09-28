import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { analyticsApi, expenseApi, recommendationApi } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import StatCard from '../components/StatCard';
import BudgetProgress from '../components/BudgetProgress';
import RecommendationCard from '../components/RecommendationCard';
import ExpenseCard from '../components/ExpenseCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  Wallet,
  Clock,
  Target,
  PiggyBank,
  Receipt,
  TrendingUp,
  Plus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [categoriesData, setCategoriesData] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryRes, catRes, expRes, recRes] = await Promise.all([
        analyticsApi.getSummary(),
        analyticsApi.getCategories(),
        expenseApi.getAll({ limit: 5 }),
        recommendationApi.getRecommendations(),
      ]);

      setSummary(summaryRes.data.data);
      setCategoriesData(catRes.data.data.categories || []);
      setRecentExpenses(expRes.data.data.expenses || []);
      setRecommendations(recRes.data.data.recommendations || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('We could not load your dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await expenseApi.delete(id);
      fetchDashboardData();
    } catch (err) {
      alert('Failed to delete expense: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return <LoadingSpinner message="Calculating your financial summary..." size="lg" />;
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <EmptyState
          title="Could not load dashboard"
          message={error}
          actionText="Try Again"
          onAction={fetchDashboardData}
        />
      </div>
    );
  }

  const COLORS = ['#6366f1', '#f97316', '#ec4899', '#10b981', '#06b6d4', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-500 text-white p-6 sm:p-8 shadow-xl shadow-brand-500/20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Smart Teen Financial Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-sm text-brand-100 max-w-xl mt-1">
              "Know where your money goes. Every rupee tracked is a step toward what you truly care about."
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/expenses/add"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-brand-700 font-bold text-sm shadow-md hover:bg-brand-50 transition-all hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>Log Expense</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 6 Key StatCards (Prompt 14) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        <StatCard
          title="Spent This Month"
          value={formatCurrency(summary?.totalSpentThisMonth || 0)}
          subtitle={summary?.monthlyBudget ? `${summary?.budgetUsedPercentage}% of monthly limit` : 'No budget set'}
          icon={Wallet}
          color="brand"
        />

        <StatCard
          title="Today's Spending"
          value={formatCurrency(summary?.todaySpending || 0)}
          subtitle="Logged today"
          icon={Clock}
          color="amber"
        />

        <StatCard
          title="Monthly Budget"
          value={summary?.monthlyBudget > 0 ? formatCurrency(summary.monthlyBudget) : 'Not Set'}
          subtitle={summary?.monthlyBudget > 0 ? 'Target spending limit' : 'Click to set target'}
          icon={Target}
          color="violet"
        />

        <StatCard
          title="Remaining Budget"
          value={
            summary?.monthlyBudget > 0
              ? formatCurrency(summary.remainingBudget)
              : '₹0.00'
          }
          subtitle={
            summary?.remainingBudget < 0
              ? 'Exceeded limit'
              : summary?.monthlyBudget > 0
              ? 'Safe to spend'
              : 'Set budget first'
          }
          icon={PiggyBank}
          color={summary?.remainingBudget < 0 ? 'rose' : 'emerald'}
        />

        <StatCard
          title="Number of Expenses"
          value={summary?.expenseCount || 0}
          subtitle="Transactions this month"
          icon={Receipt}
          color="brand"
        />

        <StatCard
          title="Largest Expense"
          value={
            summary?.largestExpense
              ? formatCurrency(summary.largestExpense.amount)
              : '₹0.00'
          }
          subtitle={
            summary?.largestExpense
              ? `${summary.largestExpense.category} • ${summary.largestExpense.description || 'No note'}`
              : 'None this month'
          }
          icon={TrendingUp}
          color="rose"
        />
      </div>

      {/* Monthly Budget Progress Meter if Budget exists */}
      {summary?.monthlyBudget > 0 && (
        <div className="bg-white/90 border border-slate-200/90 rounded-2xl p-5 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-slate-800">
              Monthly Budget Progress
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {formatCurrency(summary.totalSpentThisMonth)} / {formatCurrency(summary.monthlyBudget)}
            </span>
          </div>
          <BudgetProgress
            spent={summary.totalSpentThisMonth}
            budget={summary.monthlyBudget}
            size="lg"
          />
        </div>
      )}

      {/* Analytics Preview Grid (Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category (Bar Chart) */}
        <div className="bg-white/90 border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-display">
                Spending by Category
              </h3>
              <p className="text-xs text-slate-500">Highest spend areas this month</p>
            </div>
            <Link
              to="/analytics"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {categoriesData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoriesData.slice(0, 5)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), 'Spent']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="amount" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-4">
              <p className="text-xs text-slate-400">Log expenses to see category breakdown!</p>
            </div>
          )}
        </div>

        {/* Category Share Distribution (Pie Chart) */}
        <div className="bg-white/90 border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-display">
                Category Distribution
              </h3>
              <p className="text-xs text-slate-500">Percentage share of total spend</p>
            </div>
          </div>

          {categoriesData.length > 0 ? (
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoriesData}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {categoriesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [formatCurrency(value), name]}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-4">
              <p className="text-xs text-slate-400">No category data yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Smart Recommendations Section */}
      {recommendations.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Smart Spending Insights</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.slice(0, 4).map((rec) => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Expenses List */}
      <div className="bg-white/90 border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-display">
              Recent Expenses
            </h3>
            <p className="text-xs text-slate-500">Your latest logged purchases</p>
          </div>
          <Link
            to="/expenses"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentExpenses.length > 0 ? (
          <div className="space-y-2.5">
            {recentExpenses.map((exp) => (
              <ExpenseCard
                key={exp.id}
                expense={exp}
                onDelete={handleDeleteExpense}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No expenses logged yet"
            message="Start tracking your pocket money and everyday purchases today."
            actionText="Add First Expense"
            actionLink="/expenses/add"
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
