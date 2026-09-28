const ExpenseModel = require('../models/expenseModel');

/**
 * Expense Controller - handles CRUD endpoints for expenses
 */
class ExpenseController {
  /**
   * Create an expense
   * POST /api/expenses
   */
  static async create(req, res, next) {
    try {
      const { amount, category, description, expense_date, payment_method, is_necessary } = req.body;

      const newExpense = await ExpenseModel.create({
        user_id: req.userId,
        amount,
        category,
        description,
        expense_date,
        payment_method,
        is_necessary,
      });

      res.status(201).json({
        success: true,
        message: 'Expense added successfully!',
        data: {
          expense: newExpense,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all expenses for authenticated user with filters & search
   * GET /api/expenses
   */
  static async getAll(req, res, next) {
    try {
      const {
        category,
        startDate,
        endDate,
        isNecessary,
        search,
        sortBy = 'expense_date',
        sortOrder = 'desc',
        page = 1,
        limit = 50,
      } = req.query;

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
      const offset = (pageNum - 1) * limitNum;

      const { expenses, totalCount } = await ExpenseModel.findAllByUser(req.userId, {
        category,
        startDate,
        endDate,
        isNecessary,
        search,
        sortBy,
        sortOrder,
        limit: limitNum,
        offset,
      });

      res.status(200).json({
        success: true,
        data: {
          expenses,
          pagination: {
            page: pageNum,
            limit: limitNum,
            totalCount,
            totalPages: Math.ceil(totalCount / limitNum),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get expense by ID
   * GET /api/expenses/:id
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;

      const expense = await ExpenseModel.findByIdAndUser(id, req.userId);
      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found or unauthorized access.',
        });
      }

      res.status(200).json({
        success: true,
        data: {
          expense,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update expense
   * PUT /api/expenses/:id
   */
  static async update(req, res, next) {
    try {
      const { id } = req.params;

      // Check existence and ownership first
      const existing = await ExpenseModel.findByIdAndUser(id, req.userId);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found or unauthorized access.',
        });
      }

      const updated = await ExpenseModel.update(id, req.userId, req.body);

      res.status(200).json({
        success: true,
        message: 'Expense updated successfully!',
        data: {
          expense: updated,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete expense
   * DELETE /api/expenses/:id
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      // Check existence and ownership first
      const existing = await ExpenseModel.findByIdAndUser(id, req.userId);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found or unauthorized access.',
        });
      }

      await ExpenseModel.delete(id, req.userId);

      res.status(200).json({
        success: true,
        message: 'Expense deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ExpenseController;
