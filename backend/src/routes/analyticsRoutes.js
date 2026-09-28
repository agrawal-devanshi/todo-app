const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

// All analytics routes require authentication
router.use(authMiddleware);

router.get('/summary', AnalyticsController.getSummary);
router.get('/categories', AnalyticsController.getCategories);
router.get('/monthly', AnalyticsController.getMonthlyTrend);
router.get('/necessary', AnalyticsController.getNecessary);
router.get('/budget', AnalyticsController.getBudgetComparison);
router.get('/recommendations', AnalyticsController.getRecommendations);

module.exports = router;
