const AnalyticsService = require('../services/analyticsService');
const RecommendationService = require('../services/recommendationService');

/**
 * Analytics Controller - provides aggregate metrics, charts data, and smart recommendations
 */
class AnalyticsController {
  /**
   * Get Dashboard Summary Metrics
   * GET /api/analytics/summary
   */
  static async getSummary(req, res, next) {
    try {
      const summary = await AnalyticsService.getSummary(req.userId);
      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Spending by Category & Distribution
   * GET /api/analytics/categories
   */
  static async getCategories(req, res, next) {
    try {
      const { month, year } = req.query;
      const categoriesData = await AnalyticsService.getCategories(req.userId, month, year);
      res.status(200).json({
        success: true,
        data: categoriesData,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Monthly Spending Trend (last 6 months)
   * GET /api/analytics/monthly
   */
  static async getMonthlyTrend(req, res, next) {
    try {
      const trends = await AnalyticsService.getMonthlyTrend(req.userId);
      res.status(200).json({
        success: true,
        data: {
          trends,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Necessary vs Unnecessary Spending Comparison
   * GET /api/analytics/necessary
   */
  static async getNecessary(req, res, next) {
    try {
      const { month, year } = req.query;
      const data = await AnalyticsService.getNecessaryComparison(req.userId, month, year);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Budget vs Actual Comparison
   * GET /api/analytics/budget
   */
  static async getBudgetComparison(req, res, next) {
    try {
      const { month, year } = req.query;
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
   * Get Smart Spending Recommendations
   * GET /api/recommendations or GET /api/analytics/recommendations
   */
  static async getRecommendations(req, res, next) {
    try {
      const recommendations = await RecommendationService.generateRecommendations(req.userId);
      res.status(200).json({
        success: true,
        data: {
          recommendations,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AnalyticsController;
