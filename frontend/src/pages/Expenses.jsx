import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { expenseApi } from '../services/api';
import { CATEGORIES_LIST, formatCurrency } from '../utils/formatters';
import ExpenseTable from '../components/ExpenseTable';
import ExpenseCard from '../components/ExpenseCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  LayoutList,
  LayoutGrid,
  Calendar,
  X,
} from 'lucide-react';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Sorting state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [isNecessary, setIsNecessary] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('expense_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, totalCount: 0 });

  const navigate = useNavigate();

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        category: category !== 'All' ? category : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        isNecessary: isNecessary !== 'all' ? isNecessary : undefined,
        search: search.trim() || undefined,
        sortBy,
        sortOrder,
        page,
        limit: 25,
      };

      const res = await expenseApi.getAll(params);
      setExpenses(res.data.data.expenses || []);
      setPagination(res.data.data.pagination || { totalPages: 1, totalCount: 0 });
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
      setError('Unable to load expenses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [category, isNecessary, startDate, endDate, sortBy, sortOrder, page]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExpenses();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const handleEdit = (expense) => {
    navigate(`/expenses/edit/${expense.id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await expenseApi.delete(id);
      fetchExpenses();
    } catch (err) {
      alert('Failed to delete expense: ' + (err.response?.data?.message || err.message));
    }
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('All');
    setIsNecessary('all');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const hasActiveFilters =
    search !== '' ||
    category !== 'All' ||
    isNecessary !== 'all' ||
    startDate !== '' ||
    endDate !== '';

  const totalFilteredAmount = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            All Expenses
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse, filter, and manage your complete transaction history.
          </p>
        </div>

        <Link
          to="/expenses/add"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-600 text-white font-bold text-sm shadow-md hover:bg-brand-700 transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white/90 border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-soft space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="block w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
            >
              <option value="All">All Categories</option>
              {CATEGORIES_LIST.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Necessary Filter */}
          <div className="relative">
            <select
              value={isNecessary}
              onChange={(e) => {
                setIsNecessary(e.target.value);
                setPage(1);
              }}
              className="block w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
            >
              <option value="all">All Types (Needs & Wants)</option>
              <option value="true">Essential Needs Only</option>
              <option value="false">Discretionary Wants Only</option>
            </select>
          </div>

          {/* Date range inputs */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              title="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-1/2 px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
            />
            <span className="text-slate-400 text-xs">to</span>
            <input
              type="date"
              title="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-1/2 px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
            />
          </div>
        </div>

        {/* View Switcher & Active Filter Summary */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <span>Showing {pagination.totalCount || expenses.length} expenses</span>
            <span>•</span>
            <span className="font-semibold text-slate-800">
              Total: {formatCurrency(totalFilteredAmount)}
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-2 inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 font-bold"
              >
                <X className="w-3.5 h-3.5" />
                Reset filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              title="Table View"
            >
              <LayoutList className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              title="Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <LoadingSpinner message="Loading your expenses..." />
      ) : error ? (
        <EmptyState
          title="Could not fetch expenses"
          message={error}
          actionText="Try Again"
          onAction={fetchExpenses}
        />
      ) : expenses.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? 'No expenses match your filters' : 'You haven’t added any expenses yet'}
          message={
            hasActiveFilters
              ? 'Try adjusting your search terms or date range to find transactions.'
              : 'Keep track of every rupee to understand where your money goes!'
          }
          actionText={hasActiveFilters ? 'Clear Filters' : 'Add First Expense'}
          onAction={hasActiveFilters ? clearFilters : undefined}
          actionLink={!hasActiveFilters ? '/expenses/add' : undefined}
        />
      ) : (
        <>
          {/* Mobile view automatically uses cards, desktop follows viewMode toggle */}
          <div className="hidden lg:block">
            {viewMode === 'table' ? (
              <ExpenseTable
                expenses={expenses}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {expenses.map((exp) => (
                  <ExpenseCard
                    key={exp.id}
                    expense={exp}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Mobile/Tablet Fallback: always responsive cards */}
          <div className="lg:hidden space-y-3">
            {expenses.map((exp) => (
              <ExpenseCard
                key={exp.id}
                expense={exp}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs text-slate-500 font-medium">
                Page {page} of {pagination.totalPages}
              </span>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Expenses;
