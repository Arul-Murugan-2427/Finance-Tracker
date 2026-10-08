import React from 'react';
import { 
  TrendingUp, 
  Plus, 
  Edit2, 
  Trash2, 
  Target, 
  ShieldCheck, 
  Coins, 
  LineChart, 
  Landmark, 
  Briefcase,
  FileSpreadsheet
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR, formatDate } from '../../utils/formatters';
import { exportToCSV } from '../../utils/csvExporter';

const ASSET_ICONS = {
  'Gold': Coins,
  'Stocks': LineChart,
  'SIP/Mutual Funds': TrendingUp,
  'Fixed Deposit': Landmark,
  'Crypto': Coins,
  'Other': Briefcase
};

export const InvestmentsView = ({ onOpenAddInvestment, onEditInvestment, onOpenConfirmDelete }) => {
  const { investments, investmentAllocation, goals, thisMonthInvested } = useFinance();

  // Total Portfolio Worth
  const totalPortfolioWorth = investments.reduce((sum, inv) => sum + Number(inv.amount), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Investment Portfolio</h2>
          <p className="text-xs text-slate-500">Wealth assets log — completely isolated from daily expenses</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCSV(investments, `investments_${new Date().toISOString().slice(0, 10)}.csv`)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenAddInvestment}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Log Investment</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-3xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Portfolio Value
            </span>
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {formatINR(totalPortfolioWorth)}
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">Cumulative wealth invested</p>
          </div>
        </div>

        <div className="glass-card p-5 rounded-3xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
              This Month Invested
            </span>
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {formatINR(thisMonthInvested)}
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">Invested in current calendar month</p>
          </div>
        </div>

        <div className="glass-card p-5 rounded-3xl sm:col-span-2 lg:col-span-1 flex flex-col justify-center">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Top Asset Allocation
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {Object.entries(investmentAllocation).map(([asset, val]) => {
              if (val <= 0) return null;
              const pct = Math.round((val / (totalPortfolioWorth || 1)) * 100);
              return (
                <span key={asset} className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {asset}: <span className="font-extrabold text-amber-500">{pct}%</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Asset Type Breakdown Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.entries(investmentAllocation).map(([asset, amount]) => {
          const Icon = ASSET_ICONS[asset] || Briefcase;
          return (
            <div key={asset} className="p-4 bg-slate-50/80 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{asset}</span>
                <Icon className="w-4 h-4 text-amber-500" />
              </div>
              <div className="font-extrabold text-slate-900 dark:text-white text-base">
                {formatINR(amount)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Investment Entries Table */}
      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Investment Logs</h3>
          <span className="text-xs text-slate-400">{investments.length} records</span>
        </div>

        {investments.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <p className="text-base font-semibold">No investments recorded yet.</p>
            <button
              onClick={onOpenAddInvestment}
              className="px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold"
            >
              Log First Investment
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {investments.map((inv) => {
              const Icon = ASSET_ICONS[inv.type] || Briefcase;
              const linkedGoal = goals.find(g => g.id === inv.linkedGoalId);

              return (
                <div
                  key={inv.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 flex-shrink-0">
                      <Icon className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{inv.platform || inv.type}</h4>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-400">
                        <span className="font-semibold text-amber-600 dark:text-amber-400">{inv.type}</span>
                        <span>•</span>
                        <span>{formatDate(inv.date)}</span>
                        {linkedGoal && (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md text-[10px]">
                            <Target className="w-3 h-3" />
                            {linkedGoal.icon} {linkedGoal.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 pl-12 sm:pl-0">
                    <span className="text-base font-extrabold text-slate-900 dark:text-white">
                      {formatINR(inv.amount)}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditInvestment(inv)}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onOpenConfirmDelete('investment', inv.id, inv.platform || inv.type)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-500/10"
                        title="Delete"
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
      </div>
    </div>
  );
};
