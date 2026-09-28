const ExpenseModel = require('../models/expenseModel');
const BudgetModel = require('../models/budgetModel');

/**
 * Analytics Service - handles analytical calculations and aggregations
 */
class AnalyticsService {
  /**
   * Get Dashboard Summary Metrics
   * - Total Spent This Month
   * - Today's Spending
   * - Monthly Budget
   * - Remaining Budget
   * - Number of Expenses (this month)
   * - Largest Expense (this month)
   */
  static async getSummary(userId) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12
    const todayStr = now.toISOString().split('T')[0];

    // Start and end of current month
    const startOfMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
    const lastDay = new Date(currentYear, currentMonth, 0).getDate();
    const endOfMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    // Fetch this month's expenses
    const monthlyExpenses = await ExpenseModel.getExpensesByDateRange(userId, startOfMonth, endOfMonth);

    // Calculate metrics
    let totalSpentThisMonth = 0;
    let todaySpending = 0;
    let largestExpense = null;

    for (const exp of monthlyExpenses) {
      const amount = Number(exp.amount);
      totalSpentThisMonth += amount;

      if (exp.expense_date === todayStr) {
        todaySpending += amount;
      }

      if (!largestExpense || amount > Number(largestExpense.amount)) {
        largestExpense = exp;
      }
    }

    // Fetch monthly overall budget
    const budgets = await BudgetModel.findByUserMonthYear(userId, currentMonth, currentYear);
    const overallBudgetObj = budgets.find((b) => b.category === 'Overall');
    const monthlyBudget = overallBudgetObj ? Number(overallBudgetObj.amount) : 0;
    const remainingBudget = monthlyBudget > 0 ? monthlyBudget - totalSpentThisMonth : 0;
    const budgetUsedPercentage = monthlyBudget > 0 ? Math.round((totalSpentThisMonth / monthlyBudget) * 100) : 0;

    return {
      month: currentMonth,
      year: currentYear,
      totalSpentThisMonth: Math.round(totalSpentThisMonth * 100) / 100,
      todaySpending: Math.round(todaySpending * 100) / 100,
      monthlyBudget: Math.round(monthlyBudget * 100) / 100,
      remainingBudget: Math.round(remainingBudget * 100) / 100,
      budgetUsedPercentage,
      expenseCount: monthlyExpenses.length,
      largestExpense: largestExpense
        ? {
            id: largestExpense.id,
            description: largestExpense.description,
            amount: Number(largestExpense.amount),
            category: largestExpense.category,
            date: largestExpense.expense_date,
          }
        : null,
    };
  }

  /**
   * Get Spending by Category & Category Distribution (%)
   */
  static async getCategories(userId, month, year) {
    const now = new Date();
    const targetYear = year ? parseInt(year, 10) : now.getFullYear();
    const targetMonth = month ? parseInt(month, 10) : now.getMonth() + 1;

    const startOfMonth = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
    const lastDay = new Date(targetYear, targetMonth, 0).getDate();
    const endOfMonth = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const expenses = await ExpenseModel.getExpensesByDateRange(userId, startOfMonth, endOfMonth);

    const categoryMap = {};
    let totalSpending = 0;

    for (const exp of expenses) {
      const amt = Number(exp.amount);
      const cat = exp.category || 'Other';
      totalSpending += amt;

      if (!categoryMap[cat]) {
        categoryMap[cat] = {
          category: cat,
          amount: 0,
          count: 0,
        };
      }
      categoryMap[cat].amount += amt;
      categoryMap[cat].count += 1;
    }

    const categories = Object.values(categoryMap).map((item) => {
      const percentage = totalSpending > 0 ? Math.round((item.amount / totalSpending) * 1000) / 10 : 0;
      return {
        category: item.category,
        amount: Math.round(item.amount * 100) / 100,
        percentage,
        count: item.count,
      };
    });

    // Sort descending by amount
    categories.sort((a, b) => b.amount - a.amount);

    return {
      month: targetMonth,
      year: targetYear,
      totalSpending: Math.round(totalSpending * 100) / 100,
      categories,
    };
  }

  /**
   * Get Monthly Spending Trend (last 6 months)
   */
  static async getMonthlyTrend(userId) {
    const now = new Date();
    const monthsData = [];

    // Look back last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = date.getFullYear();
      const m = date.getMonth() + 1;
      const monthName = date.toLocaleString('default', { month: 'short' });
      const lastDay = new Date(y, m, 0).getDate();

      const start = `${y}-${String(m).padStart(2, '0')}-01`;
      const end = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      const expenses = await ExpenseModel.getExpensesByDateRange(userId, start, end);
      const totalSpent = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

      // Check budget for that month
      const budgets = await BudgetModel.findByUserMonthYear(userId, m, y);
      const overall = budgets.find((b) => b.category === 'Overall');

      monthsData.push({
        monthName: `${monthName} ${y === now.getFullYear() ? '' : y}`.trim(),
        month: m,
        year: y,
        amount: Math.round(totalSpent * 100) / 100,
        budget: overall ? Number(overall.amount) : null,
      });
    }

    return monthsData;
  }

  /**
   * Get Necessary vs Unnecessary Spending Comparison
   */
  static async getNecessaryComparison(userId, month, year) {
    const now = new Date();
    const targetYear = year ? parseInt(year, 10) : now.getFullYear();
    const targetMonth = month ? parseInt(month, 10) : now.getMonth() + 1;

    const startOfMonth = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
    const lastDay = new Date(targetYear, targetMonth, 0).getDate();
    const endOfMonth = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const expenses = await ExpenseModel.getExpensesByDateRange(userId, startOfMonth, endOfMonth);

    let necessaryTotal = 0;
    let unnecessaryTotal = 0;
    let necessaryCount = 0;
    let unnecessaryCount = 0;

    for (const exp of expenses) {
      const amt = Number(exp.amount);
      if (exp.is_necessary) {
        necessaryTotal += amt;
        necessaryCount++;
      } else {
        unnecessaryTotal += amt;
        unnecessaryCount++;
      }
    }

    const total = necessaryTotal + unnecessaryTotal;
    const necessaryPercentage = total > 0 ? Math.round((necessaryTotal / total) * 100) : 0;
    const unnecessaryPercentage = total > 0 ? Math.round((unnecessaryTotal / total) * 100) : 0;

    return {
      month: targetMonth,
      year: targetYear,
      total: Math.round(total * 100) / 100,
      breakdown: [
        {
          name: 'Necessary',
          amount: Math.round(necessaryTotal * 100) / 100,
          percentage: necessaryPercentage,
          count: necessaryCount,
          color: '#10b981', // Emerald
        },
        {
          name: 'Discretionary / Unnecessary',
          amount: Math.round(unnecessaryTotal * 100) / 100,
          percentage: unnecessaryPercentage,
          count: unnecessaryCount,
          color: '#f43f5e', // Rose
        },
      ],
    };
  }

  /**
   * Get Budget vs Actual Comparison across all configured categories
   */
  static async getBudgetComparison(userId, month, year) {
    const now = new Date();
    const targetYear = year ? parseInt(year, 10) : now.getFullYear();
    const targetMonth = month ? parseInt(month, 10) : now.getMonth() + 1;

    const startOfMonth = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
    const lastDay = new Date(targetYear, targetMonth, 0).getDate();
    const endOfMonth = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const expenses = await ExpenseModel.getExpensesByDateRange(userId, startOfMonth, endOfMonth);
    const budgets = await BudgetModel.findByUserMonthYear(userId, targetMonth, targetYear);

    // Group actual spending by category
    const actualMap = {};
    let totalActual = 0;
    for (const exp of expenses) {
      const cat = exp.category || 'Other';
      const amt = Number(exp.amount);
      totalActual += amt;
      actualMap[cat] = (actualMap[cat] || 0) + amt;
    }

    // Build comparison list
    const comparison = budgets.map((b) => {
      const budgetAmount = Number(b.amount);
      const actualAmount = b.category === 'Overall' ? totalActual : (actualMap[b.category] || 0);
      const remaining = budgetAmount - actualAmount;
      const percentage = budgetAmount > 0 ? Math.round((actualAmount / budgetAmount) * 100) : 0;

      let status = 'safe';
      if (percentage >= 100) status = 'over_budget';
      else if (percentage >= 85) status = 'critical';
      else if (percentage >= 70) status = 'warning';

      return {
        id: b.id,
        category: b.category,
        budget: budgetAmount,
        actual: Math.round(actualAmount * 100) / 100,
        remaining: Math.round(remaining * 100) / 100,
        percentage,
        status,
      };
    });

    return {
      month: targetMonth,
      year: targetYear,
      comparison,
    };
  }
}

module.exports = AnalyticsService;
