import React from 'react';
import { Sun, Moon, Plus, IndianRupee, Database, LogOut, User } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';

const TITLE_MAP = {
  dashboard: 'Financial Dashboard',
  transactions: 'Transactions & History',
  investments: 'Investment Portfolio',
  goals: 'Financial Goals',
  budgets: 'Monthly Category Budgets',
  reports: 'Analytics & Reports',
  settings: 'Settings & Data Backup'
};

export const Header = ({ activeTab, onOpenAddTransaction }) => {
  const { theme, toggleTheme, backendConnected } = useFinance();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 md:px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile App Brand logo */}
        <div className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-600 text-white font-bold text-lg">
          <IndianRupee className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {TITLE_MAP[activeTab] || 'Personal Finance'}
            </h2>
            {backendConnected && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                <Database className="w-3 h-3 text-emerald-500" />
                <span>PostgreSQL Live</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Track income, expenses, investments & goals in ₹ INR
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* User profile info badge */}
        {user && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{user.name}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">ID: {user.username} (#{user.id})</p>
            </div>
          </div>
        )}

        {/* Quick Add Button */}
        <button
          onClick={onOpenAddTransaction}
          className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold shadow-sm active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">Add Transaction</span>
          <span className="sm:hidden">Add</span>
        </button>

        {/* Quick Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-700" />
          )}
        </button>

        {/* Logout Button */}
        <button
          onClick={logout}
          title="Log Out"
          className="p-2 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
