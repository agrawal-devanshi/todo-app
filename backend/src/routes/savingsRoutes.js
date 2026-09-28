const express = require('express');
const router = express.Router();
const SavingsController = require('../controllers/savingsController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateSavingsGoal } = require('../middleware/validationMiddleware');

// All savings routes require authentication
router.use(authMiddleware);

router.get('/', SavingsController.getGoals);
router.post('/', validateSavingsGoal, SavingsController.createGoal);
router.put('/:id', SavingsController.updateGoal);
router.post('/:id/contribute', SavingsController.addContribution);
router.delete('/:id', SavingsController.deleteGoal);

module.exports = router;
