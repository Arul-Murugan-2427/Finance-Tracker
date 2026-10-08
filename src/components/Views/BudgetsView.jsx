import React from 'react';
import { 
  Plus, 
  PieChart, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  Edit2,
  TrendingDown
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../utils/formatters';

export const BudgetsView = ({ onOpenAddBudget, onEditBudget, onOpenConfirmDelete }) => {
  const { budgets, categorySpendingThisMonth, categories } = useFinance();

  // Categories that don't have budget limits set yet
  const unbudgetedCategories = (categories.expense || []).filter(
    cat => !budgets.some(b => b.category === cat)
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Category Budgets</h2>
          <p className="text-xs text-slate-500">Monthly spending limits with dynamic Green → Yellow → Red color alerts</p>
        </div>
        <button
          onClick={onOpenAddBudget}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Set Category Budget</span>
        </button>
      </div>

      {/* Budgets Cards Grid */}
      {budgets.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-400 rounded-3xl space-y-3">
          <PieChart className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
          <p className="text-base font-semibold text-slate-700 dark:text-slate-300">No monthly budgets configured yet.</p>
          <p className="text-xs max-w-sm mx-auto">Set spending caps on Groceries, Dining Out, Rent, or Shopping to prevent overspending!</p>
          <button
            onClick={onOpenAddBudget}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
          >
            Create Budget Limit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((b) => {
            const spent = categorySpendingThisMonth[b.category] || 0;
            const limit = b.limit || 1;
            const percentage = Math.round((spent / limit) * 100);

            // Dynamic color shift: Green (<70%), Yellow (70-90%), Red (>90%)
            let colorClass = 'bg-emerald-500';
            let textClass = 'text-emerald-600 dark:text-emerald-400';
            let borderClass = 'border-emerald-500/20';
            let badgeText = 'Safe';
            let badgeBg = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';

            if (percentage >= 100) {
              colorClass = 'bg-rose-500';
              textClass = 'text-rose-600 dark:text-rose-400';
              borderClass = 'border-rose-500/30';
              badgeText = 'Exceeded!';
              badgeBg = 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
            } else if (percentage >= 70) {
              colorClass = 'bg-amber-500';
              textClass = 'text-amber-600 dark:text-amber-400';
              borderClass = 'border-amber-500/30';
              badgeText = 'Near Limit';
              badgeBg = 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
            }

            const remaining = limit - spent;

            return (
              <div
                key={b.category}
                className={`glass-card p-6 rounded-3xl space-y-4 border ${borderClass} transition-all`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{b.category}</h3>
                    <p className="text-xs text-slate-400">Monthly Spending Cap</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeBg}`}>
                    {badgeText}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {formatINR(spent)}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      Limit: {formatINR(limit)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/40 dark:border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span className={textClass + ' font-bold'}>{percentage}% Used</span>
                    <span>
                      {remaining >= 0 ? `${formatINR(remaining)} left` : `Over by ${formatINR(Math.abs(remaining))}`}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Current calendar month</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditBudget(b)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Edit Limit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onOpenConfirmDelete('budget', b.category, b.category)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-500/10"
                      title="Delete Budget"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Add Unbudgeted Categories */}
      {unbudgetedCategories.length > 0 && (
        <div className="glass-card p-6 rounded-3xl space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Unbudgeted Categories</h3>
          <p className="text-xs text-slate-400">Click a category below to set a monthly limit:</p>
          <div className="flex flex-wrap gap-2 pt-1">
            {unbudgetedCategories.map(cat => (
              <button
                key={cat}
                onClick={() => onEditBudget({ category: cat, limit: 10000 })}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-500" />
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
