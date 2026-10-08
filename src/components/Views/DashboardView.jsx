import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Target, 
  PiggyBank, 
  ArrowUpRight, 
  ArrowDownRight, 
  ChevronRight,
  Sparkles,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title,
  PointElement,
  LineElement
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { useFinance } from '../../context/FinanceContext';
import { formatINR, formatINRCompact, formatDate, calculateGoalStatus } from '../../utils/formatters';

// Register ChartJS modules
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title,
  PointElement,
  LineElement
);

export const DashboardView = ({ setActiveTab, onOpenAddTransaction, onOpenAddInvestment, onOpenTopUpGoal }) => {
  const { 
    totalBalance, 
    thisMonthIncome, 
    thisMonthExpense, 
    thisMonthInvested,
    thisMonthSavedAndInvested,
    settings,
    updateMonthlyTarget,
    goals,
    categorySpendingThisMonth,
    sixMonthTrend,
    recentActivity,
    theme
  } = useFinance();

  const isDark = theme === 'dark';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

  // Target Savings & Investments Calculation
  const monthlyTarget = settings.monthlyTarget || 60000;
  // Actual savings = Income - Expense (which can be saved or invested)
  const actualSavings = thisMonthSavedAndInvested;
  const targetProgressPercent = Math.min(100, Math.max(0, Math.round((actualSavings / monthlyTarget) * 100)));

  // Top 3 goals by progress or priority
  const topGoals = goals.slice(0, 3);

  // Doughnut Chart Data for Category Spending
  const categoryLabels = Object.keys(categorySpendingThisMonth);
  const categoryValues = Object.values(categorySpendingThisMonth);

  const doughnutData = {
    labels: categoryLabels.length > 0 ? categoryLabels : ['No Expenses Yet'],
    datasets: [
      {
        data: categoryValues.length > 0 ? categoryValues : [1],
        backgroundColor: categoryValues.length > 0 ? [
          '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', 
          '#ec4899', '#06b6d4', '#84cc16', '#64748b'
        ] : [isDark ? '#334155' : '#e2e8f0'],
        borderWidth: 2,
        borderColor: isDark ? '#0f172a' : '#ffffff',
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: textColor,
          font: { family: 'Inter', size: 11, weight: '500' },
          padding: 12,
          boxWidth: 10,
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.label}: ${formatINR(context.raw)}`
        }
      }
    },
    cutout: '72%'
  };

  // 6-Month Trend Bar Chart Data
  const barData = {
    labels: sixMonthTrend.map(t => t.month),
    datasets: [
      {
        label: 'Income (+₹)',
        data: sixMonthTrend.map(t => t.Income),
        backgroundColor: '#10b981',
        borderRadius: 6,
      },
      {
        label: 'Expenses (-₹)',
        data: sixMonthTrend.map(t => t.Expense),
        backgroundColor: '#ef4444',
        borderRadius: 6,
      },
      {
        label: 'Invested (₹)',
        data: sixMonthTrend.map(t => t.Invested),
        backgroundColor: '#f59e0b',
        borderRadius: 6,
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          color: textColor,
          font: { family: 'Inter', size: 11, weight: '600' },
          boxWidth: 10,
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${formatINR(context.raw)}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: textColor, font: { family: 'Inter', size: 11 } }
      },
      y: {
        grid: { color: gridColor },
        ticks: {
          color: textColor,
          font: { family: 'Inter', size: 10 },
          callback: (value) => formatINRCompact(value)
        }
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome Banner & Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance Card */}
        <div className="glass-card p-5 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Net Balance
            </span>
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {formatINR(totalBalance)}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
              All-time cumulative savings balance
            </p>
          </div>
        </div>

        {/* This Month's Income Card */}
        <div className="glass-card p-5 rounded-3xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              This Month Income
            </span>
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl lg:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
              +{formatINR(thisMonthIncome)}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
              Earned in current calendar month
            </p>
          </div>
        </div>

        {/* This Month's Expense Card */}
        <div className="glass-card p-5 rounded-3xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              This Month Expenses
            </span>
            <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl lg:text-3xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
              -{formatINR(thisMonthExpense)}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
              Spent across all categories
            </p>
          </div>
        </div>

        {/* This Month's Invested Card */}
        <div className="glass-card p-5 rounded-3xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              This Month Invested
            </span>
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl lg:text-3xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight">
              {formatINR(thisMonthInvested)}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
              Allocated into wealth assets
            </p>
          </div>
        </div>
      </div>

      {/* Target & Top Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Savings + Investment Target Card */}
        <div className="glass-card p-6 rounded-3xl lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Monthly Savings Target</h3>
              </div>
              <button
                onClick={() => {
                  const val = prompt('Set Monthly Savings Target (₹ INR):', monthlyTarget);
                  if (val && !isNaN(val)) updateMonthlyTarget(val);
                }}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Edit Target
              </button>
            </div>

            <div className="mt-5 space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {formatINR(actualSavings)}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  of {formatINR(monthlyTarget)} target
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${targetProgressPercent}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                <span>{targetProgressPercent}% Achieved</span>
                <span>
                  {actualSavings >= monthlyTarget ? '🎉 Target Met!' : `${formatINR(monthlyTarget - actualSavings)} left`}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              Net Savings Rate: {thisMonthIncome > 0 ? `${Math.max(0, Math.round((actualSavings / thisMonthIncome) * 100))}%` : '0%'}
            </span>
          </div>
        </div>

        {/* Top 3 Goals Card */}
        <div className="glass-card p-6 rounded-3xl lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎯</span>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Top Goals Overview</h3>
            </div>
            <button
              onClick={() => setActiveTab('goals')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>View All Goals ({goals.length})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {topGoals.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No financial goals set yet. Go to Goals tab to create your first goal!
            </div>
          ) : (
            <div className="space-y-4">
              {topGoals.map((goal) => {
                const statusInfo = calculateGoalStatus(goal);
                return (
                  <div key={goal.id} className="p-3.5 bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl select-none">{goal.icon || '🎯'}</span>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">{goal.name}</h4>
                          <span className="text-[11px] text-slate-400">{goal.category}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                          {formatINR(goal.currentAmount)} / {formatINR(goal.targetAmount)}
                        </div>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.color}`}>
                          {statusInfo.status}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${statusInfo.progressPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Charts Row: Category Pie + 6 Month Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Breakdown Donut Chart */}
        <div className="glass-card p-6 rounded-3xl lg:col-span-1 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">This Month Spending</h3>
            <span className="text-xs font-medium text-slate-400">Category Breakdown</span>
          </div>

          <div className="h-64 relative flex items-center justify-center">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>

        {/* 6-Month Income vs Expense vs Invested Bar Chart */}
        <div className="glass-card p-6 rounded-3xl lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">6-Month Cash Flow Trend</h3>
              <p className="text-xs text-slate-400">Income vs Expenses vs Investments</p>
            </div>
          </div>

          <div className="h-64">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="glass-card p-6 rounded-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Recent Activity</h3>
            <p className="text-xs text-slate-400">Latest transactions & investments logged</p>
          </div>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {recentActivity.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              No recent activity found. Click "+ Add Transaction" to add your first entry!
            </div>
          ) : (
            recentActivity.map((item) => {
              const isIncome = item.type === 'income';
              const isExpense = item.type === 'expense';
              const isInvestment = item.type === 'investment';

              return (
                <div key={item.id} className="py-3.5 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 rounded-xl px-2 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-2xl ${
                      isIncome
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : isExpense
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    }`}>
                      {isIncome ? <ArrowUpRight className="w-5 h-5" /> : isExpense ? <ArrowDownRight className="w-5 h-5" /> : <PiggyBank className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{item.title}</h4>
                      <p className="text-xs text-slate-400">{item.subtitle} • {formatDate(item.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-extrabold text-sm ${
                      isIncome
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : isExpense
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      {isIncome ? '+' : isExpense ? '-' : ''}{formatINR(item.amount)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
