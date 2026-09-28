const express = require('express');
const router = express.Router();
const ExpenseController = require('../controllers/expenseController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateExpense } = require('../middleware/validationMiddleware');

// All expense routes require authentication
router.use(authMiddleware);

router.post('/', validateExpense, ExpenseController.create);
router.get('/', ExpenseController.getAll);
router.get('/:id', ExpenseController.getById);
router.put('/:id', validateExpense, ExpenseController.update);
router.delete('/:id', ExpenseController.delete);

module.exports = router;
