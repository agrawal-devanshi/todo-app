import React from 'react';

const BudgetProgress = ({
  spent = 0,
  budget = 0,
  percentage = null,
  showLabels = true,
  size = 'md',
}) => {
  const calculatedPercentage =
    percentage !== null
      ? percentage
      : budget > 0
      ? Math.round((spent / budget) * 100)
      : 0;

  // Determine threshold status
  let status = 'safe';
  let statusLabel = 'Safe Pacing';
  let barGradient = 'from-emerald-400 to-emerald-500';
  let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';

  if (calculatedPercentage >= 100) {
    status = 'over_budget';
    statusLabel = 'Budget Limit Reached';
    barGradient = 'from-rose-500 to-rose-600';
    badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (calculatedPercentage >= 85) {
    status = 'critical';
    statusLabel = 'High Usage (85%+)';
    barGradient = 'from-amber-500 to-rose-500';
    badgeColor = 'bg-orange-50 text-orange-700 border-orange-200';
  } else if (calculatedPercentage >= 70) {
    status = 'warning';
    statusLabel = 'Approaching Limit';
    barGradient = 'from-amber-400 to-amber-500';
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className="w-full">
      {showLabels && (
        <div className="flex items-center justify-between mb-1.5 text-xs font-medium">
          <span className="text-slate-600">{calculatedPercentage}% used</span>
          <span className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold ${badgeColor}`}>
            {statusLabel}
          </span>
        </div>
      )}

      {/* Progress Track */}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightClasses[size] || heightClasses.md} shadow-inner`}>
        <div
          className={`h-full bg-gradient-to-r ${barGradient} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${Math.min(100, calculatedPercentage)}%` }}
        ></div>
      </div>
    </div>
  );
};

export default BudgetProgress;
