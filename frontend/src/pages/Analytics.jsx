import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../services/api';
import { formatCurrency, CATEGORY_CONFIG } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import {
  PieChart as PieIcon,
  TrendingUp,
  Scale,
  Target,
  Sparkles,
  Calendar,
} from 'lucide-react';

const COLORS = [
  '#6366f1', // Indigo
  '#f97316', // Orange
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#f43f5e', // Rose
  '#64748b', // Slate
  '#3b82f6', // Blue
];

const Analytics = () => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [categoriesData, setCategoriesData] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [necessaryData, setNecessaryData] = useState(null);
  const [budgetComparison, setBudgetComparison] = useState([]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [catRes, trendRes, necRes, budRes] = await Promise.all([
        analyticsApi.getCategories({ month: selectedMonth, year: selectedYear }),
        analyticsApi.getMonthlyTrend(),
        analyticsApi.getNecessary({ month: selectedMonth, year: selectedYear }),
        analyticsApi.getBudgetComparison({ month: selectedMonth, year: selectedYear }),
      ]);

      setCategoriesData(catRes.data.data.categories || []);
      setMonthlyTrends(trendRes.data.data.trends || []);
      setNecessaryData(necRes.data.data || null);
      setBudgetComparison(budRes.data.data.comparison || []);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Unable to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedMonth, selectedYear]);

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

  if (loading) {
    return <LoadingSpinner message="Calculating your analytics and visual charts..." size="lg" />;
  }

  if (error) {
    return (
      <EmptyState
        title="Could not load analytics"
        message={error}
        actionText="Try Again"
        onAction={fetchAnalytics}
      />
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header & Date Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Spending Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Visual graphs, category distributions, and spending trends from your real transactions.
          </p>
        </div>

        {/* Month & Year Selectors */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200/90 shadow-xs">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
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
            className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid: Chart 1 (Category Bar) & Chart 2 (Category Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: Spending by Category (Bar Chart) */}
        <div className="bg-white/95 border border-slate-200/90 rounded-3xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                <BarChart className="w-5 h-5 text-brand-600" />
                <span>Spending by Category</span>
              </h3>
              <p className="text-xs text-slate-500">Amounts spent in each category</p>
            </div>
          </div>

          {categoriesData.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoriesData} margin={{ top: 15, right: 15, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 11 }}
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val) => [formatCurrency(val), 'Spent']}
                    contentStyle={{ borderRadius: '14px', border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="amount" fill="#6366f1" radius={[8, 8, 0, 0]}>
                    {categoriesData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex flex-col items-center justify-center text-center p-4">
              <p className="text-xs text-slate-400">No expenses found for this month.</p>
            </div>
          )}
        </div>

        {/* CHART 2: Category Distribution (%) (Donut Chart) */}
        <div className="bg-white/95 border border-slate-200/90 rounded-3xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-indigo-600" />
                <span>Category Distribution (%)</span>
              </h3>
              <p className="text-xs text-slate-500">Percentage share of total spend</p>
            </div>
          </div>

          {categoriesData.length > 0 ? (
            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoriesData}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {categoriesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name, props) => [
                      `${formatCurrency(val)} (${props.payload.percentage}%)`,
                      name,
                    ]}
                    contentStyle={{ borderRadius: '14px', border: '1px solid #e2e8f0' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex flex-col items-center justify-center text-center p-4">
              <p className="text-xs text-slate-400">No category data available.</p>
            </div>
          )}
        </div>
      </div>

      {/* CHART 3: Monthly Spending Trend (Line Chart from real database data) */}
      <div className="bg-white/95 border border-slate-200/90 rounded-3xl p-6 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span>Monthly Spending Trend (Last 6 Months)</span>
            </h3>
            <p className="text-xs text-slate-500">Historical spending trajectory over time</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTrends} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="monthName" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(val) => [formatCurrency(val), 'Total Spending']}
                contentStyle={{ borderRadius: '14px', border: '1px solid #e2e8f0' }}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 8 }}
              />
              {monthlyTrends.some((m) => m.budget) && (
                <Line
                  type="monotone"
                  dataKey="budget"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Chart 4 (Needs vs Wants) & Chart 5 (Budget vs Actual) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 4: Necessary vs Unnecessary Spending */}
        <div className="bg-white/95 border border-slate-200/90 rounded-3xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                <Scale className="w-5 h-5 text-rose-500" />
                <span>Necessary vs. Discretionary Spending</span>
              </h3>
              <p className="text-xs text-slate-500">Needs vs. Wants comparison</p>
            </div>
          </div>

          {necessaryData && necessaryData.total > 0 ? (
            <div className="space-y-6">
              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={necessaryData.breakdown}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percentage }) => `${name.split(' ')[0]} ${percentage}%`}
                    >
                      {necessaryData.breakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name, props) => [
                        `${formatCurrency(val)} (${props.payload.percentage}%)`,
                        name,
                      ]}
                      contentStyle={{ borderRadius: '14px', border: '1px solid #e2e8f0' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Breakdown cards */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                {necessaryData.breakdown.map((item) => (
                  <div key={item.name} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                      {item.name}
                    </span>
                    <span className="text-lg font-extrabold text-slate-900 font-display block">
                      {formatCurrency(item.amount)}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {item.percentage}% ({item.count} items)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-4">
              <p className="text-xs text-slate-400">No data for this month.</p>
            </div>
          )}
        </div>

        {/* CHART 5: Budget vs Actual Comparison */}
        <div className="bg-white/95 border border-slate-200/90 rounded-3xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-500" />
                <span>Budget vs. Actual Spending</span>
              </h3>
              <p className="text-xs text-slate-500">Planned targets compared to actuals</p>
            </div>
          </div>

          {budgetComparison.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetComparison} margin={{ top: 20, right: 20, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val) => [formatCurrency(val)]}
                    contentStyle={{ borderRadius: '14px', border: '1px solid #e2e8f0' }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="budget" name="Budget" fill="#94a3b8" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="actual" name="Actual Spent" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex flex-col items-center justify-center text-center p-4">
              <p className="text-xs text-slate-500 mb-2">No budgets set for this month.</p>
              <p className="text-xs text-slate-400">Set a budget in the Budget tab to compare targets!</p>
            </div>
          )}
        </div>
      </div>

      {/* Category Breakdown Table */}
      {categoriesData.length > 0 && (
        <div className="bg-white/95 border border-slate-200/90 rounded-3xl p-6 shadow-soft">
          <h3 className="text-lg font-bold text-slate-900 font-display mb-4">
            Category Breakdown Summary
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">Transactions</th>
                  <th className="py-3 px-4 text-right">Total Spent</th>
                  <th className="py-3 px-4 text-right">Share of Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categoriesData.map((cat) => {
                  const meta = CATEGORY_CONFIG[cat.category] || CATEGORY_CONFIG.Other;
                  return (
                    <tr key={cat.category} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-semibold text-slate-800 flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: meta.color }}
                        ></span>
                        <span>{cat.category}</span>
                      </td>
                      <td className="py-3 px-4 text-center text-slate-600 font-medium">
                        {cat.count}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 font-display">
                        {formatCurrency(cat.amount)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600 font-medium">
                        {cat.percentage}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
