const express = require('express');
const router = express.Router();
const BudgetController = require('../controllers/budgetController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateBudget } = require('../middleware/validationMiddleware');

// All budget routes require authentication
router.use(authMiddleware);

router.get('/', BudgetController.getBudgets);
router.post('/', validateBudget, BudgetController.setBudget);
router.get('/summary', BudgetController.getBudgetSummary);
router.delete('/:id', BudgetController.deleteBudget);

module.exports = router;
