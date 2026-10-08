import React from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight 
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
import { formatINR, formatINRCompact } from '../../utils/formatters';
import { exportToCSV } from '../../utils/csvExporter';

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

export const ReportsView = () => {
  const { 
    transactions, 
    investments, 
    categorySpendingAllTime, 
    investmentAllocation, 
    sixMonthTrend,
    exportExcel,
    theme 
  } = useFinance();

  const isDark = theme === 'dark';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

  // Expense Pie Chart Data
  const expLabels = Object.keys(categorySpendingAllTime);
  const expValues = Object.values(categorySpendingAllTime);

  const expensePieData = {
    labels: expLabels.length > 0 ? expLabels : ['No Expenses'],
    datasets: [
      {
        data: expValues.length > 0 ? expValues : [1],
        backgroundColor: [
          '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', 
          '#ec4899', '#06b6d4', '#84cc16', '#e11d48', '#d97706'
        ],
        borderWidth: 2,
        borderColor: isDark ? '#0f172a' : '#ffffff',
      }
    ]
  };

  // Investment Allocation Pie Chart Data
  const invLabels = Object.keys(investmentAllocation);
  const invValues = Object.values(investmentAllocation);

  const investmentPieData = {
    labels: invLabels,
    datasets: [
      {
        data: invValues,
        backgroundColor: [
          '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#64748b'
        ],
        borderWidth: 2,
        borderColor: isDark ? '#0f172a' : '#ffffff',
      }
    ]
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: textColor,
          font: { family: 'Inter', size: 11, weight: '500' },
          padding: 12,
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${formatINR(ctx.raw)}`
        }
      }
    },
    cutout: '65%'
  };

  // 6-Month Trend Chart Data
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
        label: 'Expense (-₹)',
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
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${formatINR(ctx.raw)}`
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
      {/* Top Banner & CSV / Excel Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics & Excel Export</h2>
          <p className="text-xs text-slate-500">Visual breakdowns of spending, investments, and downloadable Excel spreadsheets</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportExcel}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md active:scale-95 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download Excel Sheet (.xlsx)</span>
          </button>
          <button
            onClick={() => exportToCSV(transactions, `transactions_export_${new Date().toISOString().slice(0, 10)}.csv`)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Transactions CSV</span>
          </button>
        </div>
      </div>

      {/* Pie Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Expense Pie */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Expense Category Breakdown</h3>
              <p className="text-xs text-slate-400">All-time spending proportions</p>
            </div>
            <PieChart className="w-5 h-5 text-rose-500" />
          </div>
          <div className="h-72 relative flex items-center justify-center">
            <Doughnut data={expensePieData} options={pieOptions} />
          </div>
        </div>

        {/* Investment Asset Allocation Pie */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Investment Asset Allocation</h3>
              <p className="text-xs text-slate-400">Distribution across Gold, Stocks, SIPs, FDs</p>
            </div>
            <TrendingUp className="w-5 h-5 text-amber-500" />
          </div>
          <div className="h-72 relative flex items-center justify-center">
            <Doughnut data={investmentPieData} options={pieOptions} />
          </div>
        </div>
      </div>

      {/* 6-Month Trend Bar Chart */}
      <div className="glass-card p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">6-Month Trend Comparison</h3>
            <p className="text-xs text-slate-400">Monthly Cash Inflow vs Outflow vs Investment Accumulation</p>
          </div>
          <BarChart3 className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="h-80">
          <Bar data={barData} options={barOptions} />
        </div>
      </div>
    </div>
  );
};
