/**
 * Currency Formatter Utility (Prompt 34 requirement)
 * Formats numbers into Indian Rupee (₹) format or configurable ISO currency.
 * e.g., formatCurrency(2500) -> "₹2,500.00"
 */
export const formatCurrency = (amount, currency = 'INR', decimals = 2) => {
  const numericAmount = Number(amount) || 0;

  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(numericAmount);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numericAmount);
};

/**
 * Format a Date string (YYYY-MM-DD or ISO) into readable teen-friendly string
 */
export const formatDate = (dateStr, options = { month: 'short', day: 'numeric', year: 'numeric' }) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat('en-IN', options).format(date);
};

/**
 * Category metadata: colors, icons, and badges
 */
export const CATEGORY_CONFIG = {
  Food: {
    color: '#f97316', // Orange
    bgLight: 'bg-orange-50 text-orange-700 border-orange-200',
    iconName: 'Utensils',
  },
  Transport: {
    color: '#0284c7', // Sky
    bgLight: 'bg-sky-50 text-sky-700 border-sky-200',
    iconName: 'Bus',
  },
  Education: {
    color: '#8b5cf6', // Violet
    bgLight: 'bg-purple-50 text-purple-700 border-purple-200',
    iconName: 'GraduationCap',
  },
  Entertainment: {
    color: '#ec4899', // Pink
    bgLight: 'bg-pink-50 text-pink-700 border-pink-200',
    iconName: 'Gamepad2',
  },
  Shopping: {
    color: '#f43f5e', // Rose
    bgLight: 'bg-rose-50 text-rose-700 border-rose-200',
    iconName: 'ShoppingBag',
  },
  Subscriptions: {
    color: '#6366f1', // Indigo
    bgLight: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    iconName: 'Repeat',
  },
  Health: {
    color: '#10b981', // Emerald
    bgLight: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconName: 'HeartPulse',
  },
  Travel: {
    color: '#06b6d4', // Cyan
    bgLight: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    iconName: 'Plane',
  },
  Bills: {
    color: '#eab308', // Amber
    bgLight: 'bg-amber-50 text-amber-700 border-amber-200',
    iconName: 'Receipt',
  },
  Other: {
    color: '#64748b', // Slate
    bgLight: 'bg-slate-100 text-slate-700 border-slate-200',
    iconName: 'Layers',
  },
};

export const CATEGORIES_LIST = Object.keys(CATEGORY_CONFIG);

export const PAYMENT_METHODS = [
  'Cash',
  'UPI',
  'Debit Card',
  'Credit Card',
  'Bank Transfer',
  'Other',
];
