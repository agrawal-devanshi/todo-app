const BudgetModel = require('../models/budgetModel');
const AnalyticsService = require('../services/analyticsService');

/**
 * Budget Controller - handles budget setup, tracking, and thresholds
 */
class BudgetController {
  /**
   * Get all budgets for given month and year
   * GET /api/budgets
   */
  static async getBudgets(req, res, next) {
    try {
      const now = new Date();
      const month = req.query.month ? parseInt(req.query.month, 10) : now.getMonth() + 1;
      const year = req.query.year ? parseInt(req.query.year, 10) : now.getFullYear();

      const budgets = await BudgetModel.findByUserMonthYear(req.userId, month, year);

      res.status(200).json({
        success: true,
        data: {
          month,
          year,
          budgets,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Set or update a budget (Overall or Category-specific)
   * POST /api/budgets
   */
  static async setBudget(req, res, next) {
    try {
      const { category = 'Overall', amount, month, year } = req.body;

      const budget = await BudgetModel.upsertBudget({
        user_id: req.userId,
        category,
        amount,
        month,
        year,
      });

      res.status(200).json({
        success: true,
        message: `${category} budget updated successfully!`,
        data: {
          budget,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get detailed budget vs actual summary with thresholds
   * GET /api/budgets/summary
   */
  static async getBudgetSummary(req, res, next) {
    try {
      const now = new Date();
      const month = req.query.month ? parseInt(req.query.month, 10) : now.getMonth() + 1;
      const year = req.query.year ? parseInt(req.query.year, 10) : now.getFullYear();

      const data = await AnalyticsService.getBudgetComparison(req.userId, month, year);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a budget
   * DELETE /api/budgets/:id
   */
  static async deleteBudget(req, res, next) {
    try {
      const { id } = req.params;

      await BudgetModel.deleteBudget(id, req.userId);

      res.status(200).json({
        success: true,
        message: 'Budget removed successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BudgetController;
