const SavingsModel = require('../models/savingsModel');

/**
 * Savings Controller - handles savings goals and progress tracking
 */
class SavingsController {
  /**
   * Get all savings goals for authenticated user
   * GET /api/savings-goals
   */
  static async getGoals(req, res, next) {
    try {
      const goals = await SavingsModel.findAllByUser(req.userId);

      // Enhance goals with calculation fields:
      // remaining amount, days remaining, required weekly saving, required monthly saving
      const enhancedGoals = goals.map((g) => {
        const target = Number(g.target_amount);
        const current = Number(g.current_amount);
        const remaining = Math.max(0, target - current);
        const progressPercentage = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

        const now = new Date();
        const targetDate = new Date(g.target_date);
        const diffTime = targetDate - now;
        const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

        const weeksRemaining = Math.max(1, daysRemaining / 7);
        const monthsRemaining = Math.max(1, daysRemaining / 30);

        const requiredWeeklySaving = remaining > 0 ? Math.round((remaining / weeksRemaining) * 100) / 100 : 0;
        const requiredMonthlySaving = remaining > 0 ? Math.round((remaining / monthsRemaining) * 100) / 100 : 0;

        return {
          ...g,
          target_amount: target,
          current_amount: current,
          remaining_amount: remaining,
          progress_percentage: progressPercentage,
          days_remaining: daysRemaining,
          required_weekly_saving: requiredWeeklySaving,
          required_monthly_saving: requiredMonthlySaving,
          is_completed: current >= target,
        };
      });

      res.status(200).json({
        success: true,
        data: {
          goals: enhancedGoals,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create savings goal
   * POST /api/savings-goals
   */
  static async createGoal(req, res, next) {
    try {
      const { name, target_amount, current_amount, target_date } = req.body;

      const newGoal = await SavingsModel.create({
        user_id: req.userId,
        name,
        target_amount,
        current_amount,
        target_date,
      });

      res.status(201).json({
        success: true,
        message: 'Savings goal created! You can do this!',
        data: {
          goal: newGoal,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update savings goal
   * PUT /api/savings-goals/:id
   */
  static async updateGoal(req, res, next) {
    try {
      const { id } = req.params;

      const existing = await SavingsModel.findByIdAndUser(id, req.userId);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Savings goal not found or unauthorized access.',
        });
      }

      const updated = await SavingsModel.update(id, req.userId, req.body);

      res.status(200).json({
        success: true,
        message: 'Savings goal updated successfully!',
        data: {
          goal: updated,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Quick Add / Deposit money to savings goal
   * POST /api/savings-goals/:id/contribute
   */
  static async addContribution(req, res, next) {
    try {
      const { id } = req.params;
      const { amount } = req.body;

      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Contribution amount must be greater than 0.',
        });
      }

      const existing = await SavingsModel.findByIdAndUser(id, req.userId);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Savings goal not found or unauthorized access.',
        });
      }

      const newCurrentAmount = Number(existing.current_amount) + Number(amount);
      const updated = await SavingsModel.update(id, req.userId, {
        current_amount: newCurrentAmount,
      });

      const isCompleted = newCurrentAmount >= Number(existing.target_amount);

      res.status(200).json({
        success: true,
        message: isCompleted
          ? '🎉 Congratulations! You reached your savings goal!'
          : `Awesome job! ₹${Number(amount).toLocaleString('en-IN')} added to your savings.`,
        data: {
          goal: updated,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete savings goal
   * DELETE /api/savings-goals/:id
   */
  static async deleteGoal(req, res, next) {
    try {
      const { id } = req.params;

      const existing = await SavingsModel.findByIdAndUser(id, req.userId);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Savings goal not found or unauthorized access.',
        });
      }

      await SavingsModel.delete(id, req.userId);

      res.status(200).json({
        success: true,
        message: 'Savings goal deleted.',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SavingsController;
