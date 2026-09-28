const VALID_CATEGORIES = [
  'Food',
  'Transport',
  'Education',
  'Entertainment',
  'Shopping',
  'Subscriptions',
  'Health',
  'Travel',
  'Bills',
  'Other',
];

const VALID_PAYMENT_METHODS = [
  'Cash',
  'UPI',
  'Debit Card',
  'Credit Card',
  'Bank Transfer',
  'Other',
];

/**
 * Validate User Registration Payload
 */
const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Name is required.',
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.',
    });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long.',
    });
  }

  next();
};

/**
 * Validate User Login Payload
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required.',
    });
  }

  next();
};

/**
 * Validate Expense Payload (Create / Update)
 */
const validateExpense = (req, res, next) => {
  const { amount, category, description, expense_date, payment_method, is_necessary } = req.body;

  if (amount === undefined || isNaN(Number(amount)) || Number(amount) <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Amount must be a number greater than 0.',
    });
  }

  if (!category || !VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({
      success: false,
      message: `Category must be one of: ${VALID_CATEGORIES.join(', ')}`,
    });
  }

  if (!expense_date || isNaN(Date.parse(expense_date))) {
    return res.status(400).json({
      success: false,
      message: 'A valid date (YYYY-MM-DD) is required.',
    });
  }

  if (payment_method && !VALID_PAYMENT_METHODS.includes(payment_method)) {
    return res.status(400).json({
      success: false,
      message: `Payment method must be one of: ${VALID_PAYMENT_METHODS.join(', ')}`,
    });
  }

  if (description !== undefined && typeof description === 'string' && description.length > 255) {
    return res.status(400).json({
      success: false,
      message: 'Description must not exceed 255 characters.',
    });
  }

  if (is_necessary !== undefined && typeof is_necessary !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'is_necessary must be a boolean (true or false).',
    });
  }

  next();
};

/**
 * Validate Budget Payload
 */
const validateBudget = (req, res, next) => {
  const { amount, month, year, category } = req.body;

  if (amount === undefined || isNaN(Number(amount)) || Number(amount) <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Budget amount must be greater than 0.',
    });
  }

  const parsedMonth = parseInt(month, 10);
  if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
    return res.status(400).json({
      success: false,
      message: 'Month must be between 1 (January) and 12 (December).',
    });
  }

  const parsedYear = parseInt(year, 10);
  if (isNaN(parsedYear) || parsedYear < 2020) {
    return res.status(400).json({
      success: false,
      message: 'Year must be 2020 or later.',
    });
  }

  if (category && category !== 'Overall' && !VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({
      success: false,
      message: `Category must be 'Overall' or one of: ${VALID_CATEGORIES.join(', ')}`,
    });
  }

  next();
};

/**
 * Validate Savings Goal Payload
 */
const validateSavingsGoal = (req, res, next) => {
  const { name, target_amount, current_amount, target_date } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Goal name is required.',
    });
  }

  if (target_amount === undefined || isNaN(Number(target_amount)) || Number(target_amount) <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Target amount must be greater than 0.',
    });
  }

  if (current_amount !== undefined && (isNaN(Number(current_amount)) || Number(current_amount) < 0)) {
    return res.status(400).json({
      success: false,
      message: 'Current saved amount cannot be negative.',
    });
  }

  if (!target_date || isNaN(Date.parse(target_date))) {
    return res.status(400).json({
      success: false,
      message: 'A valid target date is required.',
    });
  }

  next();
};

module.exports = {
  VALID_CATEGORIES,
  VALID_PAYMENT_METHODS,
  validateRegister,
  validateLogin,
  validateExpense,
  validateBudget,
  validateSavingsGoal,
};
