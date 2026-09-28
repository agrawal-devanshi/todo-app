const ExpenseModel = require('../models/expenseModel');
const BudgetModel = require('../models/budgetModel');
const SavingsModel = require('../models/savingsModel');

/**
 * Recommendation Service
 * Analyzes measurable spending data and produces actionable, friendly, non-judgmental recommendations.
 */
class RecommendationService {
  /**
   * Generate personalized recommendations based on actual spending
   */
  static async generateRecommendations(userId) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const startOfMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
    const lastDay = new Date(currentYear, currentMonth, 0).getDate();
    const endOfMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const expenses = await ExpenseModel.getExpensesByDateRange(userId, startOfMonth, endOfMonth);
    const budgets = await BudgetModel.findByUserMonthYear(userId, currentMonth, currentYear);
    const savingsGoals = await SavingsModel.findAllByUser(userId);

    const recommendations = [];

    // If no expenses logged yet, give a welcoming encouragement
    if (expenses.length === 0) {
      recommendations.push({
        id: 'welcome-tip',
        type: 'getting_started',
        severity: 'info',
        title: 'Welcome to TeenSpend!',
        message: 'Start by logging your first expense or setting a monthly budget. Know where your money goes!',
        actionText: 'Add First Expense',
        actionLink: '/expenses/add',
      });
      return recommendations;
    }

    let totalSpent = 0;
    const categoryTotals = {};
    let unnecessarySpent = 0;
    let smallPurchasesCount = 0;
    let smallPurchasesTotal = 0;

    for (const exp of expenses) {
      const amt = Number(exp.amount);
      totalSpent += amt;

      const cat = exp.category || 'Other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;

      if (!exp.is_necessary) {
        unnecessarySpent += amt;
      }

      // Small purchase threshold: <= ₹200
      if (amt <= 200) {
        smallPurchasesCount += 1;
        smallPurchasesTotal += amt;
      }
    }

    // 1. Budget Warnings
    const overallBudget = budgets.find((b) => b.category === 'Overall');
    if (overallBudget && Number(overallBudget.amount) > 0) {
      const budgetAmt = Number(overallBudget.amount);
      const usedPercent = Math.round((totalSpent / budgetAmt) * 100);

      if (usedPercent >= 100) {
        recommendations.push({
          id: 'budget-over',
          type: 'budget_warning',
          severity: 'high',
          title: 'Budget Limit Reached',
          message:
            'Your spending is currently above your monthly budget. Review your largest categories and identify one area where you can reduce spending.',
          actionText: 'Review Budget',
          actionLink: '/budget',
        });
      } else if (usedPercent >= 85) {
        recommendations.push({
          id: 'budget-critical',
          type: 'budget_warning',
          severity: 'high',
          title: '85% Budget Warning',
          message: `You've used around ${usedPercent}% of your monthly budget. Consider prioritizing necessary expenses until the month ends.`,
          actionText: 'View Expenses',
          actionLink: '/expenses',
        });
      } else if (usedPercent >= 70) {
        recommendations.push({
          id: 'budget-warning',
          type: 'budget_warning',
          severity: 'medium',
          title: 'Budget Check-in',
          message: `You've used around ${usedPercent}% of your monthly budget. Keep an eye on discretionary spending for the rest of the month.`,
          actionText: 'View Spending',
          actionLink: '/analytics',
        });
      } else {
        recommendations.push({
          id: 'budget-healthy',
          type: 'positive_reinforcement',
          severity: 'low',
          title: 'Great Budget Pacing!',
          message: `You are on track! You have used only ${usedPercent}% of your budget so far this month. Small changes can add up.`,
        });
      }
    } else {
      // Suggest setting an overall budget
      recommendations.push({
        id: 'set-budget-suggestion',
        type: 'budget_setup',
        severity: 'info',
        title: 'Set a Monthly Target',
        message: 'Setting an overall monthly budget helps you stay in control of your pocket money and savings goals.',
        actionText: 'Set Budget Now',
        actionLink: '/budget',
      });
    }

    // 2. High Category Spending Analysis
    const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    if (sortedCategories.length > 0 && totalSpent > 0) {
      const [topCategory, topAmount] = sortedCategories[0];
      const topPercentage = Math.round((topAmount / totalSpent) * 100);

      if (topPercentage >= 35) {
        recommendations.push({
          id: `top-cat-${topCategory.toLowerCase()}`,
          type: 'category_alert',
          severity: topPercentage >= 50 ? 'medium' : 'low',
          title: `High Spending in ${topCategory}`,
          message: `${topCategory} represents ${topPercentage}% of your total spending this month. Try setting a weekly ${topCategory.toLowerCase()} budget and reviewing individual purchases.`,
          actionText: 'Analyze Categories',
          actionLink: '/analytics',
        });
      }
    }

    // 3. Frequent Small Purchases (The "Latte / Snacks" Effect)
    if (smallPurchasesCount >= 4 && smallPurchasesTotal >= 400) {
      recommendations.push({
        id: 'frequent-small-purchases',
        type: 'habit_insight',
        severity: 'low',
        title: 'Frequent Small Purchases',
        message: `You made ${smallPurchasesCount} small purchases under ₹200 totaling ₹${smallPurchasesTotal.toLocaleString('en-IN')}. Small treats and bites add up quickly without noticing!`,
      });
    }

    // 4. Discretionary / Unnecessary Spending Ratio
    if (totalSpent > 0) {
      const unnecessaryPercentage = Math.round((unnecessarySpent / totalSpent) * 100);
      if (unnecessaryPercentage >= 45 && unnecessarySpent > 500) {
        recommendations.push({
          id: 'unnecessary-spending-alert',
          type: 'saving_opportunity',
          severity: 'medium',
          title: 'Wants vs. Needs Balance',
          message: `Discretionary purchases currently make up ${unnecessaryPercentage}% of your spending this month. Cutting just a couple of impulse buys can help you reach your goals faster.`,
          actionText: 'Compare Spending',
          actionLink: '/analytics',
        });
      }
    }

    // 5. Savings Goals Insight
    if (savingsGoals.length > 0) {
      const activeGoal = savingsGoals.find(
        (g) => Number(g.current_amount) < Number(g.target_amount)
      );
      if (activeGoal) {
        const remaining = Number(activeGoal.target_amount) - Number(activeGoal.current_amount);
        const progress = Math.round((Number(activeGoal.current_amount) / Number(activeGoal.target_amount)) * 100);
        recommendations.push({
          id: `goal-${activeGoal.id}`,
          type: 'savings_boost',
          severity: 'info',
          title: `Keep Going on "${activeGoal.name}"!`,
          message: `You've achieved ${progress}% of your goal! Only ₹${remaining.toLocaleString('en-IN')} remaining to complete it.`,
          actionText: 'Deposit Savings',
          actionLink: '/savings-goals',
        });
      }
    } else {
      recommendations.push({
        id: 'create-savings-goal',
        type: 'savings_tip',
        severity: 'info',
        title: 'Save for Something You Love',
        message: 'Saving for new headphones, a gaming console, or a trip? Create a savings goal and watch your money grow.',
        actionText: 'Create Goal',
        actionLink: '/savings-goals',
      });
    }

    // Supportive Encouragement
    recommendations.push({
      id: 'encouragement-note',
      type: 'motivation',
      severity: 'low',
      title: 'Mindful Money Habits',
      message: "You're doing great keeping track of your spending! Consistency is the superpower of financial freedom.",
    });

    return recommendations;
  }
}

module.exports = RecommendationService;
